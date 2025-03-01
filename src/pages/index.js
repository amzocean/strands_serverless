import { useState, useEffect } from "react";
import axios from "axios";

export default function Game() {
  const [game, setGame] = useState(null);
  const [selectedLetters, setSelectedLetters] = useState([]);
  const [foundWords, setFoundWords] = useState([]);
  const [attemptSequence, setAttemptSequence] = useState([]);
  const [submissionStatus, setSubmissionStatus] = useState("");
  const [hintedWord, setHintedWord] = useState("");
  const [hintCounter, setHintCounter] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [colorMapping, setColorMapping] = useState({});
  const [playerName, setPlayerName] = useState("");
  const [leaderboard, setLeaderboard] = useState([]);
  const [puzzleComplete, setPuzzleComplete] = useState(false);

  // Emoji system
  const spangramEmoji = "🟡";
  const correctEmoji = "🟢";
  const failEmoji = "⚫";

  // Colors
  const spangramColor = "#FFD966";
  const otherColors = [
    "#FFE5D9", "#FFD7BA", "#FEC89A", "#FAEDCD",
    "#D8F3DC", "#BDE0FE", "#A9DEF9", "#FFC8DD", "#C5E1E6"
  ];

  // Fixed cell size for SVG
  const cellSize = 50;
  // Increase offset distance so each connector segment is trimmed at both ends
  const offsetDist = 15;

  useEffect(() => {
    fetchGameData();
    fetchLeaderboard();
  }, []);

  const fetchGameData = () => {
    axios.get("/api/game")
      .then(response => {
        setGame(response.data);
        const mapping = {};
        response.data.valid_words.forEach((word, index) => {
          mapping[word] =
            word === response.data.spangram
              ? spangramColor
              : otherColors[(index - 1) % otherColors.length];
        });
        setColorMapping(mapping);
      })
      .catch(error => console.error("Error fetching game:", error));
  };

  const fetchLeaderboard = () => {
    axios.get("/api/leaderboard")
      .then(response => setLeaderboard(response.data))
      .catch(error => console.error("Error fetching leaderboard:", error));
  };

  // Actual dictionary check using Free Dictionary API.
  const isValidEnglish = async (word) => {
    if (word.length < 4) return false;
    try {
      const response = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
      return Array.isArray(response.data);
    } catch {
      return false;
    }
  };

  // Enforce adjacency: if new letter is not adjacent to the last selected letter, clear selection.
  const handleLetterClick = (letter, row, col) => {
    if (puzzleComplete) return;
    if (submissionStatus) {
      setSubmissionStatus("");
      setSelectedLetters([]);
    }
    const alreadySelected = selectedLetters.some(l => l.row === row && l.col === col);
    const alreadyUsed =
      game &&
      foundWords.some(word => {
        const path = game.word_paths[word];
        return path && path.some(coord => coord[0] === row && coord[1] === col);
      });
    if (alreadySelected || alreadyUsed) return;

    if (selectedLetters.length > 0) {
      const last = selectedLetters[selectedLetters.length - 1];
      const rowDiff = Math.abs(row - last.row);
      const colDiff = Math.abs(col - last.col);
      if (rowDiff > 1 || colDiff > 1) {
        setSelectedLetters([{ letter, row, col }]);
        return;
      }
    }
    setSelectedLetters(prev => [...prev, { letter, row, col }]);
  };

  // Helper: Given two points, trim the segment by offset from each end.
  const trimSegment = (x1, y1, x2, y2, offset) => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.sqrt(dx*dx + dy*dy);
    if (len < offset * 2) return { x1, y1, x2, y2 };
    const ratioStart = offset / len;
    const ratioEnd = (len - offset) / len;
    const x1t = x1 + dx * ratioStart;
    const y1t = y1 + dy * ratioStart;
    const x2t = x1 + dx * ratioEnd;
    const y2t = y1 + dy * ratioEnd;
    return { x1: x1t, y1: y1t, x2: x2t, y2: y2t };
  };

  // Render current selection as individual lines between each consecutive letter.
  const currentSelectionLines = [];
  for (let i = 0; i < selectedLetters.length - 1; i++) {
    const p1 = selectedLetters[i];
    const p2 = selectedLetters[i+1];
    const x1 = p1.col * cellSize + cellSize / 2;
    const y1 = p1.row * cellSize + cellSize / 2;
    const x2 = p2.col * cellSize + cellSize / 2;
    const y2 = p2.row * cellSize + cellSize / 2;
    const { x1: tx1, y1: ty1, x2: tx2, y2: ty2 } = trimSegment(x1, y1, x2, y2, offsetDist);
    currentSelectionLines.push(
      <line
        key={`line-${i}`}
        x1={tx1}
        y1={ty1}
        x2={tx2}
        y2={ty2}
        stroke="red"
        strokeWidth="3"
        strokeOpacity="0.5"
        strokeLinecap="round"
      />
    );
  }

  // For found words, we can assume the path is continuous. (Could also break into segments if needed.)
  const foundWordPolylines = foundWords.map(word => {
    const path = game?.word_paths[word];
    if (!path) return null;
    // Convert grid coordinates to pixel coordinates.
    const coords = path.map(([r, c]) => [c * cellSize + cellSize / 2, r * cellSize + cellSize / 2]);
    // For simplicity, trim only the start and end points.
    if (coords.length < 2) return null;
    const firstPair = trimSegment(...coords[0], ...coords[1], offsetDist);
    const lastPair = trimSegment(...coords[coords.length - 2], ...coords[coords.length - 1], offsetDist);
    const newCoords = [ [firstPair.x1, firstPair.y1], ...coords.slice(1, coords.length - 1), [lastPair.x2, lastPair.y2] ];
    const points = newCoords.map(([xx, yy]) => `${xx},${yy}`).join(" ");
    return (
      <polyline
        key={word}
        points={points}
        fill="none"
        stroke={colorMapping[word] || "blue"}
        strokeWidth="3"
        strokeOpacity="0.4"
        strokeLinecap="round"
      />
    );
  });

  const submitWord = async () => {
    if (puzzleComplete || !game) return;
    const word = selectedLetters.map(l => l.letter).join("");
    let nextFoundWords = [...foundWords];
    let nextAttemptSequence = [...attemptSequence];
    if (game.valid_words.includes(word)) {
      if (!foundWords.includes(word)) {
        nextFoundWords.push(word);
        nextAttemptSequence.push(word);
        setSubmissionStatus(`${word} ✅`);
        if (word === hintedWord) setHintedWord("");
      }
    } else {
      nextAttemptSequence.push("FAIL");
      setSubmissionStatus(`${word} ❌`);
      if (await isValidEnglish(word)) {
        setHintCounter(prev => prev + 1);
      }
    }
    setSelectedLetters([]);
    setFoundWords(nextFoundWords);
    setAttemptSequence(nextAttemptSequence);
    if (nextFoundWords.length === game.valid_words.length) {
      setPuzzleComplete(true);
      setTimeout(() => setShowPopup(true), 500);
    }
  };

  const clearSelection = () => {
    setSelectedLetters([]);
    setSubmissionStatus("");
  };

  const getCellColor = (row, col) => {
    if (!game || !game.word_paths) return undefined;
    for (let word of foundWords) {
      const path = game.word_paths[word];
      if (path && path.some(coord => coord[0] === row && coord[1] === col)) {
        return colorMapping[word] || undefined;
      }
    }
    return undefined;
  };

  const isCellSelected = (row, col) =>
    selectedLetters.some(l => l.row === row && l.col === col);

  const generateEmojiScore = () => {
    return attemptSequence
      .map(attempt => {
        if (attempt === "FAIL") return failEmoji;
        return attempt === game?.spangram ? spangramEmoji : correctEmoji;
      })
      .join("");
  };

  // HINT logic
  const handleHint = () => {
    if (!game) return;
    const unsolved = game.valid_words.filter(word => !foundWords.includes(word));
    if (unsolved.length === 0) return;
    if (unsolved.length > 1 && unsolved.includes(game.spangram)) {
      const nonSpangram = unsolved.filter(word => word !== game.spangram);
      if (nonSpangram.length > 0) {
        setHintedWord(nonSpangram[0]);
      } else {
        setHintedWord(game.spangram);
      }
    } else {
      setHintedWord(unsolved[0]);
    }
    setHintCounter(0);
  };

  const handleShareScore = () => {
    const emojiScore = generateEmojiScore();
    const shareText = `Eid Milan Game\nScore: ${emojiScore}\n[Your URL]`;
    if (navigator.share) {
      navigator.share({ title: "Eid Milan Game", text: shareText })
        .catch(error => console.error("Error sharing:", error));
    } else {
      navigator.clipboard.writeText(shareText)
        .catch(err => console.error("Failed to copy score."));
    }
  };

  const submitScore = () => {
    if (!playerName.trim()) return;
    const emojiScore = generateEmojiScore();
    axios.post("/api/submit-score", { name: playerName, score: emojiScore })
      .then(response => {
        setLeaderboard(response.data.leaderboard);
        resetGame();
      })
      .catch(error => console.error("Error submitting score:", error));
  };

  const resetGame = () => {
    setShowPopup(false);
    setPlayerName("");
    setFoundWords([]);
    setSelectedLetters([]);
    setAttemptSequence([]);
    setSubmissionStatus("");
    setHintedWord("");
    setPuzzleComplete(false);
    fetchGameData();
  };

  const toggleTutorial = () => {
    setShowTutorial(prev => !prev);
  };

  if (!game) return <p>Loading...</p>;

  const progressPercent = game.valid_words.length > 0
    ? (foundWords.length / game.valid_words.length) * 100
    : 0;

  const hintButtonText = hintCounter < 2 ? `HINT (${2 - hintCounter})` : "HINT";

  const svgWidth = game.letter_grid[0].length * cellSize;
  const svgHeight = game.letter_grid.length * cellSize;

  return (
    <div className="container">
      {/* Tutorial Button */}
      <button className="tutorial-button" onClick={toggleTutorial}>?</button>

      {/* Tutorial Modal */}
      {showTutorial && (
        <div className="tutorial-modal">
          <div className="tutorial-content">
            <h2>How to Play 🎉</h2>
            <ul>
              <li>🔍 Find all hidden words matching the theme!</li>
              <li>👆 Select letters by tapping; each must be adjacent (including diagonals).</li>
              <li>🔒 Each letter can only be used once!</li>
              <li>✅ Press SUBMIT to check your word.</li>
              <li>💡 After 2 valid wrong submissions, the HINT button unlocks.</li>
              <li>❌ Use CLEAR to reset your selection.</li>
              <li>🏆 Solve all words and submit your score!</li>
            </ul>
            <button className="close-tutorial" onClick={toggleTutorial}>Close</button>
          </div>
        </div>
      )}

      {/* Theme Pill */}
      <div className="theme-pill">Theme: {game.theme}</div>

      {/* Selected Letters */}
      <div className="selected-letters-container">
        <div className="selected-letters">
          {submissionStatus !== ""
            ? submissionStatus
            : selectedLetters.map(l => l.letter).join("")}
        </div>
      </div>

      {/* SVG Grid */}
      <svg width={svgWidth} height={svgHeight} className="grid-svg">
        {/* 1) Draw background rects */}
        {game.letter_grid.map((row, rowIndex) =>
          row.map((letter, colIndex) => {
            const x = colIndex * cellSize;
            const y = rowIndex * cellSize;
            const cellColor = getCellColor(rowIndex, colIndex);
            return (
              <rect
                key={`cell-${rowIndex}-${colIndex}`}
                x={x}
                y={y}
                width={cellSize}
                height={cellSize}
                fill={cellColor || "#fff"}
                stroke="#ccc"
              />
            );
          })
        )}

        {/* 2) Draw found words' connectors */}
        {foundWordPolylines}

        {/* 3) Draw current selection connectors as separate lines */}
        {selectedLetters.length > 1 &&
          selectedLetters.slice(0, -1).map((_, i) => {
            const p1 = selectedLetters[i];
            const p2 = selectedLetters[i + 1];
            const x1 = p1.col * cellSize + cellSize / 2;
            const y1 = p1.row * cellSize + cellSize / 2;
            const x2 = p2.col * cellSize + cellSize / 2;
            const y2 = p2.row * cellSize + cellSize / 2;
            const { x1: tx1, y1: ty1, x2: tx2, y2: ty2 } = trimSegment(x1, y1, x2, y2, offsetDist);
            return (
              <line
                key={`line-${i}`}
                x1={tx1}
                y1={ty1}
                x2={tx2}
                y2={ty2}
                stroke="red"
                strokeWidth="3"
                strokeOpacity="0.5"
                strokeLinecap="round"
              />
            );
          })
        }

        {/* 4) Draw letters on top */}
        {game.letter_grid.map((row, rowIndex) =>
          row.map((letter, colIndex) => {
            const x = colIndex * cellSize;
            const y = rowIndex * cellSize;
            const centerX = x + cellSize / 2;
            const centerY = y + cellSize / 2;
            const currentlySelected = selectedLetters.some(l => l.row === rowIndex && l.col === colIndex);
            const isHinted = hintedWord &&
              game.word_paths[hintedWord] &&
              game.word_paths[hintedWord].some(coord => coord[0] === rowIndex && coord[1] === colIndex);
            return (
              <text
                key={`text-${rowIndex}-${colIndex}`}
                x={centerX}
                y={centerY}
                dominantBaseline="middle"
                textAnchor="middle"
                onClick={() => handleLetterClick(letter, rowIndex, colIndex)}
                style={{
                  fill: currentlySelected ? "red" : (isHinted ? "#2196F3" : "#000"),
                  fontSize: "24px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  pointerEvents: "auto"
                }}
              >
                {letter}
              </text>
            );
          })
        )}
      </svg>

      {/* Progress Bar */}
      <div className="progress-bar-container">
        <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }}>
          <span className="progress-text">
            {foundWords.length} / {game.valid_words.length}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="action-buttons">
        <button onClick={clearSelection} className="clear-button">CLEAR</button>
        <button onClick={handleHint} className="hint-button" disabled={hintCounter < 2}>
          {hintButtonText}
        </button>
        <button onClick={submitWord} className="submit-button">SUBMIT</button>
      </div>

      {/* Live Score */}
      <div className="live-score">{generateEmojiScore()}</div>

      {/* Popup */}
      {showPopup && (
        <div className="popup">
          <p>🎉 Puzzle Completed! 🎉</p>
          <p>Please enter your name to submit your score:</p>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Your name"
            className="name-input"
          />
          <button onClick={submitScore} className="submit-button">Submit Score</button>
          <button onClick={handleShareScore} className="share-button">📤 Share Score</button>
        </div>
      )}

      {/* Leaderboard */}
      <div className="leaderboard">
        <h2 className="leaderboard-title">LEADERBOARD</h2>
        <table>
          <thead>
            <tr>
              <th>NAME</th>
              <th>SCORE</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((entry, index) => (
              <tr key={index}>
                <td>{entry.name}</td>
                <td>{entry.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Global Font Import */}
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap");
        html, body {
          margin: 0;
          padding: 0;
          font-family: "Montserrat", sans-serif;
        }
      `}</style>

      <style jsx>{`
        .container {
          position: relative;
          text-align: center;
          padding: 10px;
          background-color: #fafafa;
          color: #000;
          font-family: inherit;
        }
        .tutorial-button {
          position: absolute;
          top: 10px;
          right: 10px;
          background-color: #64b5f6;
          border: none;
          border-radius: 50%;
          width: 35px;
          height: 35px;
          font-size: 1.2rem;
          color: #fff;
          cursor: pointer;
        }
        .tutorial-modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .tutorial-content {
          background: #fff;
          color: #000;
          padding: 20px;
          border-radius: 10px;
          max-width: 500px;
          width: 90%;
          text-align: left;
        }
        .tutorial-content h2 {
          margin-top: 0;
        }
        .close-tutorial {
          margin-top: 15px;
          padding: 10px 20px;
          background-color: #68b684;
          color: #fff;
          border: none;
          cursor: pointer;
          font-size: 16px;
        }
        .theme-pill {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: 40px;
          font-size: 1.2rem;
          font-weight: 600;
          color: #333;
          background-color: #e9f5ff;
          padding: 0 16px;
          border-radius: 20px;
          margin-bottom: 10px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .selected-letters-container {
          height: 20px;
          margin-bottom: 10px;
        }
        .selected-letters {
          font-size: 1.2rem;
          font-weight: 600;
          color: red;
        }
        .grid-svg {
          border: 1px solid #ccc;
          margin: 0 auto;
          display: block;
        }
        .progress-bar-container {
          margin: 20px auto;
          width: 300px;
          background-color: #ddd;
          border-radius: 10px;
          position: relative;
          height: 25px;
        }
        .progress-bar-fill {
          background-color: #68b684;
          height: 100%;
          border-radius: 10px 0 0 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-weight: bold;
          transition: width 0.3s ease;
        }
        .progress-text {
          z-index: 1;
        }
        .action-buttons {
          display: flex;
          justify-content: space-between;
          max-width: 400px;
          margin: 15px auto;
          gap: 10px;
        }
        .action-buttons button {
          flex: 1;
          padding: 15px 0;
          font-size: 18px;
          border: none;
          cursor: pointer;
          font-family: inherit;
        }
        .submit-button {
          background-color: #68b684;
          color: #fff;
        }
        .clear-button {
          background-color: #eb5757;
          color: #fff;
        }
        .hint-button {
          background-color: #2196F3;
          color: #fff;
        }
        .hint-button:disabled {
          background-color: #90CAF9;
          color: #fff;
        }
        .live-score {
          font-size: 1.5rem;
          font-weight: 600;
          margin: 10px 0;
          color: #333;
        }
        .popup {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: #fff;
          padding: 20px;
          text-align: center;
          border: 2px solid #333;
          color: #000;
          font-family: inherit;
        }
        .popup input {
          padding: 10px;
          font-size: 16px;
          margin-top: 10px;
          width: 80%;
          background-color: #fff;
          color: #000;
          border: 1px solid #ccc;
          font-family: inherit;
        }
        .leaderboard {
          margin-top: 30px;
          border-top: 1px solid #ccc;
          padding-top: 10px;
          font-family: inherit;
        }
        .leaderboard-title {
          text-transform: uppercase;
          font-weight: bold;
          margin: 0 0 10px;
        }
        .leaderboard table {
          width: 100%;
          border-collapse: collapse;
        }
        .leaderboard th,
        .leaderboard td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: center;
        }
        .leaderboard th {
          background-color: #f2f2f2;
          font-weight: bold;
        }
        @media (max-width: 600px) {
          .grid-container {
            max-width: 90vw;
          }
          .progress-bar-container {
            width: 80%;
          }
        }
        @media (prefers-color-scheme: dark) {
          .container {
            background-color: #121212;
            color: #fff;
          }
          .theme-pill {
            background-color: #333;
            color: #fff;
          }
          .selected-letters {
            color: red;
          }
          .progress-bar-container {
            background-color: #333;
          }
          .progress-bar-fill {
            background-color: #388e3c;
          }
          .submit-button {
            background-color: #388e3c;
            color: #fff;
          }
          .clear-button {
            background-color: #b71c1c;
            color: #fff;
          }
          .hint-button {
            background-color: #1976D2;
            color: #fff;
          }
          .hint-button:disabled {
            background-color: #90CAF9;
            color: #fff;
          }
          .popup {
            background: #2a2a2a;
            border: 2px solid #555;
            color: #fff;
          }
          .popup input {
            background-color: #3a3a3a;
            color: #fff;
            border: 1px solid #666;
          }
          .leaderboard th {
            background-color: #333;
            color: #fff;
          }
          .leaderboard td {
            color: #fff;
          }
          .leaderboard th,
          .leaderboard td {
            border-color: #555;
          }
          .letter-button.hint-tile span {
            color: #1976D2 !important;
          }
        }
      `}</style>
    </div>
  );
}

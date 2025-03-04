import { useState, useEffect, useRef } from "react";
import axios from "axios";

// Define summary text as a constant for easy changes.
const summaryText = "Total 8 words - 5 LD | 3 EN";

export default function Game() {
  const [game, setGame] = useState(null);
  const [selectedLetters, setSelectedLetters] = useState([]);
  const [foundWords, setFoundWords] = useState([]);
  const [foundRoutes, setFoundRoutes] = useState({}); // Store user-selected routes
  const [attemptSequence, setAttemptSequence] = useState([]);
  const [submissionStatus, setSubmissionStatus] = useState("");
  const [hintedWord, setHintedWord] = useState("");
  const [hintCounter, setHintCounter] = useState(0);
  const [hintWordsUsed, setHintWordsUsed] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  // Show tutorial on page load.
  const [showTutorial, setShowTutorial] = useState(true);
  const [colorMapping, setColorMapping] = useState({});
  const [playerName, setPlayerName] = useState("");
  const [leaderboard, setLeaderboard] = useState([]);
  const [puzzleComplete, setPuzzleComplete] = useState(false);
  const [isSwiping, setIsSwiping] = useState(false);
  // Use numerical scoring
  const [score, setScore] = useState(0);

  // Scoring rules:
  // +100 for correct, -10 for wrong (only if word length >= 4), -50 for hint usage (only when new hint)
  // (Hint: if the requested hint is the same as the currently shown one, ignore.)
  
  // Emoji variables (left for legacy display if needed)
  const spangramEmoji = "🟡";
  const correctEmoji = "🟢";
  const failEmoji = "⚫";

  // Colors
  const spangramColor = "#FFD966";
  const otherColors = [
    "#FDE2E4", "#FAE2EF", "#FAF6C0", "#D8F3DC",
    "#BDE0FE", "#A9DEF9", "#FFC8DD", "#C5E1E6", "#FFF1C9"
  ];

  // Grid cell size and offset for connectors
  const cellSize = 70;
  const offsetDist = 15;

  // Reference for the SVG element (for touch coordinate calculations)
  const svgRef = useRef(null);

  // Toggle tutorial modal
  const toggleTutorial = () => {
    setShowTutorial(!showTutorial);
  };

  // On initial load, check localStorage for completed game state
  useEffect(() => {
    fetchGameData();
    fetchLeaderboard();

    const completed = localStorage.getItem("gameCompleted");
    if (completed === "true") {
      const stateString = localStorage.getItem("completedState");
      if (stateString) {
        const state = JSON.parse(stateString);
        setFoundWords(state.foundWords || []);
        setScore(state.score || 0);
        setPuzzleComplete(true);
      }
    }
  }, []);

  const fetchGameData = () => {
    axios.get("/api/game")
      .then(response => {
        console.log("Fetched game data:", response.data);
        // Assume API returns gameId – e.g., "game-2025-03-04-BAYAAN"
        const newGameId = response.data.gameId || "default";
        const storedGameId = localStorage.getItem("gameId");
        if (storedGameId && storedGameId !== newGameId) {
          // New game available; clear any previous completed state.
          localStorage.removeItem("gameCompleted");
          localStorage.removeItem("completedState");
        }
        localStorage.setItem("gameId", newGameId);
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
      .then(response => {
        setLeaderboard(response.data);
      })
      .catch(error => console.error("Error fetching leaderboard:", error));
  };

  const isValidEnglish = async (word) => {
    if (word.length < 4) return false;
    try {
      const response = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
      return Array.isArray(response.data);
    } catch {
      return false;
    }
  };

  // Helper to compare two routes (order-insensitive)
  function isSameRoute(routeA, routeB) {
    if (!routeA || !routeB || routeA.length !== routeB.length) return false;
    const format = (coord) =>
      coord.row !== undefined ? `${coord.row},${coord.col}` : `${coord[0]},${coord[1]}`;
    const setA = routeA.map(format).sort();
    const setB = routeB.map(format).sort();
    return setA.every((val, index) => val === setB[index]);
  }

  // Decide which route to use for a given word
  function getEffectiveRoute(word) {
    if (!game || !game.word_paths) return null;
    const defaultRoute = game.word_paths[word];
    const userRoute = foundRoutes[word];
    return userRoute && isSameRoute(userRoute, defaultRoute) ? userRoute : defaultRoute;
  }

  // Tap-based letter selection
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
        console.log("Non-adjacent letter clicked. Clearing previous selection.");
        setSelectedLetters([{ letter, row, col }]);
        return;
      }
    }
    setSelectedLetters(prev => [...prev, { letter, row, col }]);
  };

  // --- Swipe-to-submit Handlers ---
  const handleTouchStart = (e) => {
    e.preventDefault();
    setIsSwiping(false);
    if (e.touches.length > 0 && svgRef.current) {
      const touch = e.touches[0];
      const rect = svgRef.current.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      const col = Math.floor(x / cellSize);
      const row = Math.floor(y / cellSize);
      if (row >= 0 && row < game.letter_grid.length && col >= 0 && col < game.letter_grid[0].length) {
        handleLetterClick(game.letter_grid[row][col], row, col);
      }
    }
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
    setIsSwiping(true);
    if (e.touches.length > 0 && svgRef.current) {
      const touch = e.touches[0];
      const rect = svgRef.current.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      const candidateCol = Math.floor(x / cellSize);
      const candidateRow = Math.floor(y / cellSize);
      if (candidateRow >= 0 && candidateRow < game.letter_grid.length && candidateCol >= 0 && candidateCol < game.letter_grid[0].length) {
        const centerX = candidateCol * cellSize + cellSize / 2;
        const centerY = candidateRow * cellSize + cellSize / 2;
        const dx = x - centerX;
        const dy = y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < cellSize / 3) {
          const existingIndex = selectedLetters.findIndex(l => l.row === candidateRow && l.col === candidateCol);
          if (existingIndex !== -1) {
            if (existingIndex < selectedLetters.length - 1) {
              setSelectedLetters(selectedLetters.slice(0, existingIndex + 1));
            }
            return;
          }
          if (selectedLetters.length === 0) {
            setSelectedLetters([{ letter: game.letter_grid[candidateRow][candidateCol], row: candidateRow, col: candidateCol }]);
          } else {
            const last = selectedLetters[selectedLetters.length - 1];
            const rowDiff = Math.abs(candidateRow - last.row);
            const colDiff = Math.abs(candidateCol - last.col);
            if (rowDiff <= 1 && colDiff <= 1) {
              setSelectedLetters(prev => [...prev, { letter: game.letter_grid[candidateRow][candidateCol], row: candidateRow, col: candidateCol }]);
            }
          }
        }
      }
    }
  };

  const handleTouchEnd = (e) => {
    e.preventDefault();
    if (isSwiping && selectedLetters.length > 1) {
      submitWord();
    }
    setIsSwiping(false);
  };

  // Utility: Trim line segments so they don't overlap cell centers
  function trimSegment(x1, y1, x2, y2, offset) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const length = Math.sqrt(dx * dx + dy * dy);
    if (length < offset * 2) {
      return { x1, y1, x2, y2 };
    }
    const ratioStart = offset / length;
    const ratioEnd = (length - offset) / length;
    const x1t = x1 + dx * ratioStart;
    const y1t = y1 + dy * ratioStart;
    const x2t = x1 + dx * ratioEnd;
    const y2t = y1 + dy * ratioEnd;
    return { x1: x1t, y1: y1t, x2: x2t, y2: y2t };
  }

  function buildCurrentSelectionLines() {
    const lines = [];
    for (let i = 0; i < selectedLetters.length - 1; i++) {
      const p1 = selectedLetters[i];
      const p2 = selectedLetters[i + 1];
      const x1 = p1.col * cellSize + cellSize / 2;
      const y1 = p1.row * cellSize + cellSize / 2;
      const x2 = p2.col * cellSize + cellSize / 2;
      const y2 = p2.row * cellSize + cellSize / 2;
      const { x1: tx1, y1: ty1, x2: tx2, y2: ty2 } = trimSegment(x1, y1, x2, y2, offsetDist);
      lines.push(
        <line
          key={`selection-line-${i}`}
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
    return lines;
  }

  // Build connectors for a solved word using the effective route.
  function buildFoundWordLines(word) {
    if (!game) return null;
    console.log(`buildFoundWordLines for word="${word}"`);
    const route = getEffectiveRoute(word);
    console.log(`Using route for "${word}":`, route);
    if (!route || route.length < 2) {
      console.log(`No valid route for "${word}" => no lines drawn`);
      return null;
    }
    const lines = [];
    for (let i = 0; i < route.length - 1; i++) {
      let r1, c1, r2, c2;
      if (route[0].row !== undefined) {
        r1 = route[i].row; c1 = route[i].col;
        r2 = route[i + 1].row; c2 = route[i + 1].col;
      } else {
        [r1, c1] = route[i];
        [r2, c2] = route[i + 1];
      }
      const x1 = c1 * cellSize + cellSize / 2;
      const y1 = r1 * cellSize + cellSize / 2;
      const x2 = c2 * cellSize + cellSize / 2;
      const y2 = r2 * cellSize + cellSize / 2;
      const { x1: tx1, y1: ty1, x2: tx2, y2: ty2 } = trimSegment(x1, y1, x2, y2, offsetDist);
      lines.push(
        <line
          key={`${word}-line-${i}`}
          x1={tx1}
          y1={ty1}
          x2={tx2}
          y2={ty2}
          stroke="red"
          strokeWidth="3"
          strokeOpacity="0.3"
          strokeLinecap="round"
        />
      );
      console.log(`Segment ${i}: from [${r1},${c1}] to [${r2},${c2}] => coords:`, { x1: tx1, y1: ty1, x2: tx2, y2: ty2 });
    }
    return lines;
  }

  const submitWord = async () => {
    if (!game || puzzleComplete) return;
    const word = selectedLetters.map(l => l.letter).join("");
    // Ignore submission if word is less than 4 letters (and do not deduct score)
    if (word.length < 4) {
      console.log("Submission ignored: word too short");
      setSubmissionStatus("Word too short");
      setSelectedLetters([]);
      return;
    }
    console.log("Submitting word:", word);
    let nextFoundWords = [...foundWords];
    let nextAttemptSequence = [...attemptSequence];
    let newScore = score;
    const routeToSave = [...selectedLetters]; // Capture user-selected route
    if (game.valid_words.includes(word)) {
      console.log("Word is correct");
      if (!foundWords.includes(word)) {
        nextFoundWords.push(word);
        nextAttemptSequence.push(word);
        setSubmissionStatus(`${word} ✅`);
        setFoundRoutes(prev => ({ ...prev, [word]: routeToSave }));
        if (word === hintedWord) setHintedWord("");
        newScore += 100;
        if (navigator.vibrate) {
          navigator.vibrate(100);
        }
      }
    } else {
      console.log("Word is incorrect");
      nextAttemptSequence.push("FAIL");
      setSubmissionStatus(`${word} ❌`);
      newScore -= 10;
      if (navigator.vibrate) {
        navigator.vibrate(200);
      }
    }
    console.log("foundWords after submission:", nextFoundWords);
    setSelectedLetters([]);
    setFoundWords(nextFoundWords);
    setScore(newScore);
    setAttemptSequence(nextAttemptSequence);
    if (nextFoundWords.length === game.valid_words.length) {
      console.log("All words found => puzzleComplete = true");
      setPuzzleComplete(true);
      localStorage.setItem("gameCompleted", "true");
      localStorage.setItem("completedState", JSON.stringify({
        foundWords: nextFoundWords,
        score: newScore
      }));
      setTimeout(() => setShowPopup(true), 500);
    }
  };

  const clearSelection = () => {
    setSelectedLetters([]);
    setSubmissionStatus("");
  };

  // For cell background coloring, use the effective route.
  const getCellColor = (row, col) => {
    if (!game || !game.word_paths) return undefined;
    for (let word of foundWords) {
      const route = getEffectiveRoute(word);
      if (!route) continue;
      const found = route.some(coord =>
        coord.row !== undefined
          ? coord.row === row && coord.col === col
          : coord[0] === row && coord[1] === col
      );
      if (found) {
        return colorMapping[word] || undefined;
      }
    }
    return undefined;
  };

  const foundWordLines = foundWords.flatMap(word => {
    const lines = buildFoundWordLines(word);
    console.log(`Lines for word="${word}" =>`, lines);
    return lines || [];
  });
  console.log("Final foundWordLines array =>", foundWordLines);

  const displayScore = () => {
    return score;
  };

  // Hint mechanism: always available.
  // When user taps HINT, if the new hint is different from the current one, subtract 50 points and add a "💡" symbol to the score.
  const handleHint = () => {
    if (!game) return;
    const unsolved = game.valid_words.filter(word => !foundWords.includes(word));
    if (unsolved.length === 0) return;
    let newHint = "";
    if (unsolved.length > 1 && unsolved.includes(game.spangram)) {
      const nonSpangram = unsolved.filter(word => word !== game.spangram);
      newHint = nonSpangram.length > 0 ? nonSpangram[0] : game.spangram;
    } else {
      newHint = unsolved[0];
    }
    // Only subtract points if the new hint differs from the current one.
    if (newHint !== hintedWord) {
      setHintedWord(newHint);
      setScore(prev => prev - 50);
    }
  };

  const handleShareScore = () => {
    const shareText = `Eid Milan Game #1\nScore: ${score}\nwww.eidmilan.com`;
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
    const shareText = `Eid Milan Game #1\nScore: ${score}\nwww.eidmilan.com`;
    axios.post("/api/submit-score", { name: playerName, score: score })
      .then(response => {
        setLeaderboard(response.data.leaderboard);
        setShowPopup(false); // Keep final state for screenshots.
      })
      .catch(error => console.error("Error submitting score:", error));
  };

  const resetGame = () => {
    setShowPopup(false);
    setPlayerName("");
    setFoundWords([]);
    setSelectedLetters([]);
    setScore(0);
    setAttemptSequence([]);
    setSubmissionStatus("");
    setHintedWord("");
    setPuzzleComplete(false);
    setFoundRoutes({});
    localStorage.removeItem("gameCompleted");
    localStorage.removeItem("completedState");
    fetchGameData();
  };

  if (!game) return <p>Loading...</p>;

  const progressPercent = game.valid_words.length > 0
    ? (foundWords.length / game.valid_words.length) * 100
    : 0;

  const hintButtonText = "HINT";

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
            <button className="close-tutorial-cross" onClick={toggleTutorial}>×</button>
            <h2>How to Play</h2>
            <img 
              src="/gameplay.gif" 
              alt="Gameplay Example" 
              style={{ width: "50%", height: "50%", maxWidth: "400px", marginBottom: "1em" }} 
            />
            <ul>
              <li>🔍 <strong>Find all hidden words</strong> that match the theme!</li>
              <li>👆 <strong>Select letters</strong> by tapping or swiping—each new letter must be adjacent (including diagonals).</li>
              <li>🔒 <strong>Each letter can be used only once!</strong></li>
              <li>🔒 <strong>All words occupy the board entirely!</strong></li>
              <li>✅ Press <strong>SUBMIT</strong> (or complete your swipe) to check your word.</li>
              <li>💡 Tap <strong>HINT</strong> to get a hint (each new hint deducts 50 points and adds a 💡 to your score).</li>
              <li>❌ Tap <strong>CLEAR</strong> to reset your selection.</li>
              <li>🏆 Solve them all and submit your score to the raffleboard!</li>
            </ul>
            <button className="close-tutorial" onClick={toggleTutorial}>Close</button>
          </div>
        </div>
      )}

      <div className="theme-pill">Theme: {game.theme}</div>
      
      {/* Game summary text */}
      <div className="game-summary">{summaryText}</div>

      <div className="selected-letters-container">
        <div className="selected-letters">
          {submissionStatus !== ""
            ? submissionStatus
            : selectedLetters.map(l => l.letter).join("")}
        </div>
      </div>

      {/* Main SVG with touch events for swipe submission */}
      <svg
        ref={svgRef}
        width={svgWidth}
        height={svgHeight}
        className="grid-svg"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
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

        {foundWordLines}
        {buildCurrentSelectionLines()}

        {game.letter_grid.map((row, rowIndex) =>
          row.map((letter, colIndex) => {
            const x = colIndex * cellSize;
            const y = rowIndex * cellSize;
            const centerX = x + cellSize / 2;
            const centerY = y + cellSize / 2;
            const isSelected = selectedLetters.some(l => l.row === rowIndex && l.col === colIndex);
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
                  fill: isSelected ? "red" : (isHinted ? "#2196F3" : "#000"),
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

      <div className="progress-bar-container">
        <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }}>
          <span className="progress-text">
            {foundWords.length} / {game.valid_words.length}
          </span>
        </div>
      </div>

      <div className="action-buttons">
        <button onClick={clearSelection} className="clear-button">CLEAR</button>
        <button onClick={handleHint} className="hint-button">{hintButtonText}</button>
        <button onClick={submitWord} className="submit-button" disabled={puzzleComplete}>
          SUBMIT
        </button>
      </div>

      <div className="live-score">
        Score: {displayScore()}
      </div>

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

      <div className="leaderboard" style={{ width: svgWidth }}>
        <h2 className="leaderboard-title">RAFFLEBOARD</h2>
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
          z-index: 9999;
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
          z-index: 9998;
        }
        .tutorial-content {
          position: relative;
          background: #fff;
          color: #000;
          padding: 20px;
          border-radius: 10px;
          max-width: 500px;
          width: 90%;
          text-align: left;
        }
        .close-tutorial-cross {
          position: absolute;
          top: 10px;
          right: 10px;
          background: transparent;
          border: none;
          font-size: 2rem;
          font-weight: bold;
          color: #333;
          cursor: pointer;
          z-index: 1;
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
          margin-bottom: 5px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .game-summary {
          font-size: 0.9rem;
          color: #666;
          margin-bottom: 10px;
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
          touch-action: none;
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
          z-index: 10000;
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
        .popup .submit-button,
        .popup .share-button {
          padding: 10px 15px;
          font-size: 16px;
          margin: 10px 5px 0;
          display: inline-block;
        }
        .leaderboard {
          margin-top: 30px;
          border-top: 1px solid #ccc;
          padding-top: 10px;
          font-family: inherit;
          margin-left: auto;
          margin-right: auto;
        }
        /* Constrain leaderboard table to container width and wrap text */
        .leaderboard table {
          width: 100%;
          table-layout: fixed;
          word-wrap: break-word;
        }
        .leaderboard th,
        .leaderboard td {
          overflow-wrap: break-word;
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
          .tutorial-button {
            background-color: #64b5f6;
            color: #fff;
          }
          .tutorial-modal {
            background: rgba(0,0,0,0.5);
          }
          .tutorial-content {
            background: #2a2a2a;
            color: #fff;
          }
          .close-tutorial {
            background-color: #388e3c;
            color: #fff;
          }
          .theme-pill {
            background-color: #333;
            color: #fff;
          }
          .selected-letters {
            color: red;
          }
          .grid-svg {
            border: 1px solid #444;
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
            z-index: 10000;
          }
          .popup input {
            background-color: #3a3a3a;
            color: #fff;
            border: 1px solid #666;
          }
          .popup .submit-button,
          .popup .share-button {
            padding: 10px 15px;
            font-size: 16px;
            margin: 10px 5px 0;
            display: inline-block;
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
          /* Make live score text white in dark mode */
          .live-score {
            color: #fff;
          }
          /* Dark mode summary text */
          .game-summary {
            color: #ccc;
          }
        }
      `}</style>
    </div>
  );
}

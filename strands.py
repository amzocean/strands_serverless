import { useState, useEffect } from "react";
import axios from "axios";

export default function Game() {
  const [game, setGame] = useState(null);
  const [selectedLetters, setSelectedLetters] = useState([]);
  const [foundWords, setFoundWords] = useState([]);
  const [attemptSequence, setAttemptSequence] = useState([]);
  const [submissionStatus, setSubmissionStatus] = useState(""); // holds word + ✅ or ❌
  const [hintedWord, setHintedWord] = useState(""); // holds the currently hinted unsolved word
  const [hintCounter, setHintCounter] = useState(0); // counts valid wrong submissions for hints
  const [showPopup, setShowPopup] = useState(false);
  const [colorMapping, setColorMapping] = useState({});
  const [playerName, setPlayerName] = useState("");
  const [leaderboard, setLeaderboard] = useState([]);
  const [puzzleComplete, setPuzzleComplete] = useState(false); // Prevent extra attempts

  // Emoji system for scoring
  const spangramEmoji = "🟡"; // Yellow for spangram
  const correctEmoji = "🟢";  // Green for non-spangram words
  const failEmoji = "⚫";     // Black for failed attempts

  // Updated softer, modern colors
  const spangramColor = "#FFD966"; // Softer gold/pastel
  const otherColors = [
    "#FFE5D9", "#FFD7BA", "#FEC89A", "#FAEDCD",
    "#D8F3DC", "#BDE0FE", "#A9DEF9", "#FFC8DD", "#C5E1E6"
  ];

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

  // Actual dictionary check using the Free Dictionary API.
  // Returns true if the word exists in the dictionary.
  const isValidEnglish = async (word) => {
    if (word.length < 4) return false;
    try {
      const response = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
      // If response contains an array of entries, assume word is valid.
      return Array.isArray(response.data);
    } catch (error) {
      // If error (e.g. word not found), return false.
      return false;
    }
  };

  // When a new letter is clicked, enforce that it must be adjacent to the last selected letter.
  // If not adjacent, clear the previous selection and start fresh.
  const handleLetterClick = (letter, row, col) => {
    if (puzzleComplete) return;
    if (submissionStatus) {
      setSubmissionStatus("");
      setSelectedLetters([]);
      // Do not clear hintedWord so that the hint remains until solved.
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
        // New letter is not adjacent, so clear previous selection.
        setSelectedLetters([{ letter, row, col }]);
        return;
      }
    }
    setSelectedLetters(prev => [...prev, { letter, row, col }]);
  };

  // Make submitWord asynchronous to await dictionary check.
  const submitWord = async () => {
    if (puzzleComplete || !game) return;

    const word = selectedLetters.map(l => l.letter).join("");
    let nextFoundWords = [...foundWords];
    let nextAttemptSequence = [...attemptSequence];

    if (game.valid_words.includes(word)) {
      if (!foundWords.includes(word)) {
        nextFoundWords.push(word);
        nextAttemptSequence.push(word); // correct word
        setSubmissionStatus(`${word} ✅`);
        // If the hinted word was solved, clear the hint.
        if (word === hintedWord) {
          setHintedWord("");
        }
      }
    } else {
      nextAttemptSequence.push("FAIL");
      setSubmissionStatus(`${word} ❌`);
      // Use the actual dictionary check.
      if (await isValidEnglish(word)) {
        setHintCounter(prev => prev + 1);
      }
      // Do not clear hintedWord on wrong submission.
    }
    // Clear selected letters to remove red highlight.
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
    // Do not clear hintedWord so that hint remains until solved.
  };

  // Return background color for cells belonging to solved words.
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

  // Generate live score in emoji dot format.
  const generateEmojiScore = () => {
    return attemptSequence
      .map(attempt => {
        if (attempt === "FAIL") return failEmoji;
        return attempt === game?.spangram ? spangramEmoji : correctEmoji;
      })
      .join("");
  };

  // HINT BUTTON: When clicked, pick one unsolved word.
  // Spangram is given as hint only if it is the last unsolved word.
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
    // Reset the hint counter after using a hint.
    setHintCounter(0);
  };

  const handleShareScore = () => {
    const emojiScore = generateEmojiScore();
    const shareText = `Eid Milan Game\nScore: ${emojiScore}\n[Your URL]`;
    if (navigator.share) {
      navigator.share({
        title: "Eid Milan Game",
        text: shareText
      })
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
      .catch(error => {
        console.error("Error submitting score:", error);
      });
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

  if (!game) return <p>Loading...</p>;

  const progressPercent =
    game.valid_words.length > 0
      ? (foundWords.length / game.valid_words.length) * 100
      : 0;

  // Determine hint button text.
  const hintButtonText = hintCounter < 2 ? `HINT (${2 - hintCounter})` : "HINT";

  return (
    <div className="container">
      {/* Theme Pill */}
      <div className="theme-pill">Theme: {game.theme}</div>

      {/* Selected Letters Area */}
      <div className="selected-letters-container">
        <div className="selected-letters">
          {submissionStatus !== ""
            ? submissionStatus
            : selectedLetters.map(l => l.letter).join("")}
        </div>
      </div>

      {/* Grid */}
      <div
        className="grid-container"
        style={{
          gridTemplateColumns:
            game && game.letter_grid && game.letter_grid[0]
              ? `repeat(${game.letter_grid[0].length}, 1fr)`
              : "repeat(6, 1fr)",
          gridTemplateRows:
            game && game.letter_grid
              ? `repeat(${game.letter_grid.length}, 1fr)`
              : "repeat(8, 1fr)"
        }}
      >
        {game.letter_grid.map((row, rowIndex) =>
          row.map((letter, colIndex) => {
            const cellColor = getCellColor(rowIndex, colIndex);
            const currentlySelected = isCellSelected(rowIndex, colIndex);
            // Check if this cell is part of the hinted word's path.
            const isHinted = hintedWord &&
              game.word_paths[hintedWord] &&
              game.word_paths[hintedWord].some(
                (coord) => coord[0] === rowIndex && coord[1] === colIndex
              );
            return (
              <button
                key={`${rowIndex}-${colIndex}`}
                onClick={() => handleLetterClick(letter, rowIndex, colIndex)}
                className={`letter-button ${currentlySelected ? "selected-tile" : ""} ${isHinted ? "hint-tile" : ""}`}
                style={cellColor ? { backgroundColor: cellColor } : {}}
              >
                <span>{letter}</span>
              </button>
            );
          })
        )}
      </div>

      {/* Progress Bar */}
      <div className="progress-bar-container">
        <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }}>
          <span className="progress-text">
            {foundWords.length} / {game.valid_words.length}
          </span>
        </div>
      </div>

      {/* Action Buttons (CLEAR, HINT, SUBMIT) */}
      <div className="action-buttons">
        <button onClick={clearSelection} className="clear-button">CLEAR</button>
        <button onClick={handleHint} className="hint-button" disabled={hintCounter < 2}>
          {hintButtonText}
        </button>
        <button onClick={submitWord} className="submit-button">SUBMIT</button>
      </div>

      {/* Live Score Display */}
      <div className="live-score">{generateEmojiScore()}</div>

      {/* Popup on Puzzle Complete */}
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
        html,
        body {
          margin: 0;
          padding: 0;
          font-family: "Montserrat", sans-serif;
        }
      `}</style>

      <style jsx>{`
        /* Container & Global Styles */
        .container {
          text-align: center;
          padding: 10px;
          background-color: #fafafa;
          color: #000;
          font-family: inherit;
        }

        /* Theme Pill */
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
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        /* Outer container for selected letters (fixed height) */
        .selected-letters-container {
          height: 20px;
          margin-bottom: 10px;
        }
        /* Selected Letters: red text or submissionStatus if set */
        .selected-letters {
          font-size: 1.2rem;
          font-weight: 600;
          color: red;
        }

        /* Grid */
        .grid-container {
          display: grid;
          gap: 5px;
          max-width: 400px;
          margin: 0 auto;
        }
        .letter-button {
          width: 100%;
          padding-top: 100%;
          position: relative;
          cursor: pointer;
          color: #000;
          font-family: inherit;
          border: none;
          background-color: #fff;
        }
        .letter-button span {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 1.8rem;
          font-weight: bold;
          color: #000;
        }
        .letter-button.selected-tile span {
          color: red;
        }
        /* Hint tile style: animate letter text by flashing opacity; base color remains blue */
        .hint-tile span {
          color: #2196F3;
          animation: hintFlashText 1.5s infinite;
        }
        @keyframes hintFlashText {
          0% { opacity: 1; }
          50% { opacity: 0.7; }
          100% { opacity: 1; }
        }

        /* Live Score Display */
        .live-score {
          font-size: 1.5rem;
          font-weight: 600;
          margin: 10px 0;
          color: #333;
        }

        /* Progress Bar */
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

        /* Action Buttons */
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
        .share-button {
          background-color: #64b5f6;
          color: #fff;
          padding: 10px 15px;
          font-size: 16px;
          border: none;
          cursor: pointer;
          margin-top: 10px;
          margin-left: 10px;
        }

        /* Popup */
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

        /* Leaderboard */
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

        /* Mobile responsiveness */
        @media (max-width: 600px) {
          .grid-container {
            max-width: 90vw;
          }
          .letter-button span {
            font-size: 1.5rem;
          }
          .progress-bar-container {
            width: 80%;
          }
        }

        /* Dark mode overrides */
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
          .letter-button {
            background-color: #1e1e1e;
            color: #fff;
          }
          .letter-button span {
            color: #fff;
          }
          .letter-button.selected-tile span {
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
          .share-button {
            background-color: #1976D2;
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
          /* In dark mode, force hinted text color to blue */
          .letter-button.hint-tile span {
            color: #1976D2 !important;
          }
        }
      `}</style>
    </div>
  );
}

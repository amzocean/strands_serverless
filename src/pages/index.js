import { useState, useEffect } from "react";
import axios from "axios";

export default function Game() {
  const [game, setGame] = useState(null);
  const [selectedLetters, setSelectedLetters] = useState([]);
  const [foundWords, setFoundWords] = useState([]);
  const [attemptSequence, setAttemptSequence] = useState([]);
  const [message, setMessage] = useState("");
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
    "#FFE5D9", // pastel peach
    "#FFD7BA", // pastel orange
    "#FEC89A", // pastel orange-brown
    "#FAEDCD", // pastel yellow
    "#D8F3DC", // pastel green
    "#BDE0FE", // pastel light blue
    "#A9DEF9", // pastel baby blue
    "#FFC8DD", // pastel pink
    "#C5E1E6"  // pastel grey-blue
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

  // Modified letter click: Only add the letter if it hasn't been used yet
  const handleLetterClick = (letter, row, col) => {
    if (puzzleComplete) return;
    // Check if the cell has already been selected in the current selection
    const alreadySelected = selectedLetters.some(l => l.row === row && l.col === col);
    // Check if the cell has already been used in a submitted successful word
    const alreadyUsed =
      game &&
      foundWords.some(word => {
        const path = game.word_paths[word];
        return path && path.some(coord => coord[0] === row && coord[1] === col);
      });
    if (alreadySelected || alreadyUsed) return;
    setSelectedLetters([...selectedLetters, { letter, row, col }]);
  };

  const submitWord = () => {
    if (puzzleComplete || !game) return;
    const word = selectedLetters.map(l => l.letter).join("");
    let nextFoundWords = [...foundWords];
    let nextAttemptSequence = [...attemptSequence];

    if (game.valid_words.includes(word)) {
      if (!foundWords.includes(word)) {
        nextFoundWords.push(word);
        nextAttemptSequence.push(word); // Append the correct word (green dot)
        setMessage(`Correct: ${word}`);
      }
    } else {
      nextAttemptSequence.push("FAIL");
      setMessage(`Incorrect word: ${word}. Try again!`);
    }
    setFoundWords(nextFoundWords);
    setAttemptSequence(nextAttemptSequence);
    setSelectedLetters([]);

    if (nextFoundWords.length === game.valid_words.length) {
      setPuzzleComplete(true);
      setTimeout(() => setShowPopup(true), 500);
    }
  };

  // Clear the current selection without submitting
  const clearSelection = () => {
    setSelectedLetters([]);
    setMessage("");
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

  // Check if a cell is currently selected
  const isCellSelected = (row, col) =>
    selectedLetters.some(l => l.row === row && l.col === col);

  // Generate raw emoji string (only emojis) for the final score
  const generateEmojiScore = () => {
    return attemptSequence
      .map(attempt => {
        if (attempt === "FAIL") return failEmoji;
        return attempt === game?.spangram ? spangramEmoji : correctEmoji;
      })
      .join("");
  };

  const handleShareScore = () => {
    const emojiScore = generateEmojiScore();
    const shareText = `Eid Milan Game\nScore: ${emojiScore}\n[Your URL]`;
    if (navigator.share) {
      navigator.share({
        title: "Eid Milan Game",
        text: shareText
      })
        .then(() => setMessage("Shared successfully!"))
        .catch(error => console.error("Error sharing:", error));
    } else {
      navigator.clipboard.writeText(shareText)
        .then(() => setMessage("Score copied to clipboard!"))
        .catch(err => setMessage("Failed to copy score."));
    }
  };

  const submitScore = () => {
    if (!playerName.trim()) {
      setMessage("Please enter your name.");
      return;
    }
    const emojiScore = generateEmojiScore();
    axios.post("/api/submit-score", { name: playerName, score: emojiScore })
      .then(response => {
        setMessage("Score submitted successfully!");
        setLeaderboard(response.data.leaderboard);
        resetGame();
      })
      .catch(error => {
        console.error("Error submitting score:", error);
        setMessage("Error submitting score.");
      });
  };

  const resetGame = () => {
    setShowPopup(false);
    setPlayerName("");
    setFoundWords([]);
    setSelectedLetters([]);
    setAttemptSequence([]);
    setPuzzleComplete(false);
    fetchGameData();
  };

  if (!game) return <p>Loading...</p>;

  // Calculate progress percentage
  const progressPercent =
    game.valid_words.length > 0
      ? (foundWords.length / game.valid_words.length) * 100
      : 0;

  return (
    <div className="container">
      {/* Theme Pill at the top */}
      <div className="theme-pill">
        Theme: {game.theme}
      </div>

      {/* Outer container for selected letters with fixed height */}
      <div className="selected-letters-container">
        <div className="selected-letters">
          {selectedLetters.map(l => l.letter).join("")}
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

            return (
              <button
                key={`${rowIndex}-${colIndex}`}
                onClick={() => handleLetterClick(letter, rowIndex, colIndex)}
                className={`letter-button ${currentlySelected ? "selected-tile" : ""}`}
                style={cellColor ? { backgroundColor: cellColor } : {}}
              >
                <span>{letter}</span>
              </button>
            );
          })
        )}
      </div>

      {/* Progress Bar Below the Grid */}
      <div className="progress-bar-container">
        <div
          className="progress-bar-fill"
          style={{ width: `${progressPercent}%` }}
        >
          <span className="progress-text">
            {foundWords.length} / {game.valid_words.length}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="action-buttons">
        <button onClick={clearSelection} className="clear-button">
          Clear Selection
        </button>
        <button onClick={submitWord} className="submit-button">
          Submit Word
        </button>
      </div>

      {/* Feedback Message */}
      {message && (
        <p
          style={{
            fontWeight: "bold",
            color: message.startsWith("Correct") ? "green" : "red"
          }}
        >
          {message}
        </p>
      )}

      {/* Popup on puzzle complete */}
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
          <button onClick={submitScore} className="submit-button">
            Submit Score
          </button>
          <button onClick={handleShareScore} className="share-button">
            📤 Share Score
          </button>
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
        /* Selected Letters (plain text) */
        .selected-letters {
          font-size: 1.2rem;
          font-weight: 600;
          color: #333;
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
        }

        /* Highlight for selected tiles using animation and box-shadow */
        .letter-button.selected-tile {
          box-shadow: 0 0 8px #ff9800;
          animation: flash 1s infinite alternate;
        }
        @keyframes flash {
          from { box-shadow: 0 0 8px #ff9800; }
          to { box-shadow: 0 0 16px #ff9800; }
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
            color: #fff;
          }
          .letter-button {
            background-color: #1e1e1e;
            color: #fff;
          }
          .letter-button span {
            color: #fff;
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
          .share-button {
            background-color: #1976d2;
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
        }
      `}</style>
    </div>
  );
}

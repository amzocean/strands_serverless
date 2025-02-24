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

  // Colors for puzzle highlighting (light mode)
  const spangramColor = "#FFD700"; // Gold
  const otherColors = [
    "#a1887f", "#90a4ae", "#81c784", "#ce93d8",
    "#ffab91", "#b0bec5", "#aed581", "#ba68c8", "#4db6ac"
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
          mapping[word] = word === response.data.spangram
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
    // Check if the cell has already been selected in the current selection.
    const alreadySelected = selectedLetters.some(l => l.row === row && l.col === col);
    // Check if the cell has already been used in a submitted successful word.
    const alreadyUsed = game && foundWords.some(word => {
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

  // Generate raw emoji string (only emojis) for the final score
  const generateEmojiScore = () => {
    return attemptSequence.map(attempt => {
      if (attempt === "FAIL") return failEmoji;
      return attempt === game?.spangram ? spangramEmoji : correctEmoji;
    }).join("");
  };

  const handleShareScore = () => {
    const emojiScore = generateEmojiScore();
    const shareText = `Strands Score: ${emojiScore}\nTry it at [Your URL]`;
    if (navigator.share) {
      navigator.share({
        title: "Strands Game",
        text: shareText,
        url: "[Your URL]"
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

  return (
    <div className="container">
      <h1>EID MILAN 1446H</h1>
      {game ? (
        <>
          <p>Game Theme: <b>{game.theme}</b></p>
          <p style={{ fontWeight: "bold" }}>
            Progress: {foundWords.length} / {game.valid_words.length} solved
          </p>
          <div className="grid-container">
            {game.letter_grid.map((row, rowIndex) =>
              row.map((letter, colIndex) => {
                const cellColor = getCellColor(rowIndex, colIndex);
                return (
                  <button
                    key={`${rowIndex}-${colIndex}`}
                    onClick={() => handleLetterClick(letter, rowIndex, colIndex)}
                    className="letter-button"
                    style={cellColor ? { backgroundColor: cellColor } : {}}
                  >
                    <span>{letter}</span>
                  </button>
                );
              })
            )}
          </div>
          <p>Selected: {selectedLetters.map(l => l.letter).join("")}</p>
          <div className="action-buttons">
            <button onClick={clearSelection} className="clear-button">Clear Selection</button>
            <button onClick={submitWord} className="submit-button">Submit Word</button>
          </div>
        </>
      ) : (
        <p>Loading...</p>
      )}

      {message && (
        <p style={{ fontWeight: "bold", color: message.startsWith("Correct") ? "green" : "red" }}>
          {message}
        </p>
      )}

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

      {/* Leaderboard with no fixed height, so it grows with page scroll */}
      <div className="leaderboard">
        <h2>Leaderboard</h2>
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

      <style jsx>{`
        /* Light mode defaults */
        .container {
          text-align: center;
          padding: 10px;
          background-color: #fff;
          color: #000;
        }
        .grid-container {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 5px;
          max-width: 400px;
          margin: 0 auto;
        }
        .letter-button {
          width: 100%;
          padding-top: 100%;
          position: relative;
          border: 1px solid #ccc;
          cursor: pointer;
          color: #000;
        }
        .letter-button span {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 1.8rem;
          font-weight: bold;
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
        }
        .submit-button {
          background-color: #4CAF50;
          color: white;
        }
        .clear-button {
          background-color: #d32f2f;
          color: white;
        }
        .share-button {
          background-color: #2196F3;
          color: white;
          padding: 10px 15px;
          font-size: 16px;
          border: none;
          cursor: pointer;
          margin-top: 10px;
          margin-left: 10px;
        }
        .popup {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: white;
          padding: 20px;
          text-align: center;
          border: 2px solid #333;
          color: #000;
        }
        /* Light mode input color */
        .name-input {
          padding: 10px;
          font-size: 16px;
          margin-top: 10px;
          width: 80%;
          background-color: #fff;
          color: #000;
          border: 1px solid #ccc;
        }
        .leaderboard {
          /* No fixed height, so it uses page scroll */
          margin-top: 30px;
          border-top: 1px solid #ccc;
          padding-top: 10px;
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
        }
        /* Dark mode overrides */
        @media (prefers-color-scheme: dark) {
          .container {
            background-color: #121212;
            color: #fff;
          }
          .letter-button {
            background-color: #1e1e1e;
            border: 1px solid #444;
            color: #fff;
          }
          .letter-button span {
            color: #fff;
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
          /* Dark mode input color */
          .name-input {
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

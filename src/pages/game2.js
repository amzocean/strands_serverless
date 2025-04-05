import { useState, useEffect, useRef } from "react";
import axios from "axios";

// Define summary text as a constant for easy changes.
const summaryText = "Total 7 words";

export default function Game() {
  const [game, setGame] = useState(null);
  const [selectedLetters, setSelectedLetters] = useState([]);
  const [foundWords, setFoundWords] = useState([]);
  const [foundRoutes, setFoundRoutes] = useState({});
  const [attemptSequence, setAttemptSequence] = useState([]);
  const [submissionStatus, setSubmissionStatus] = useState("");
  const [hintedWord, setHintedWord] = useState("");
  const [hintCounter, setHintCounter] = useState(0);
  const [puzzleComplete, setPuzzleComplete] = useState(false);
  const [isSwiping, setIsSwiping] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [colorMapping, setColorMapping] = useState({});
  const [showFinalPopup, setShowFinalPopup] = useState(false);
  const [finalMessageVisible, setFinalMessageVisible] = useState(false);

  // Colors configuration
  const spangramColor = "#FFD966";
  const otherColors = [
    "#FDE2E4", "#FAE2EF", "#FAF6C0", "#D8F3DC",
    "#BDE0FE", "#A9DEF9", "#FFC8DD", "#C5E1E6", "#FFF1C9"
  ];

  const cellSize = 70;
  const offsetDist = 15;
  const svgRef = useRef(null);

  const toggleTutorial = () => {
    setShowTutorial(!showTutorial);
  };

  // On component mount, load game data and check localStorage for progress and final message flag.
  useEffect(() => {
    fetchGameData();

    const gameId = localStorage.getItem("gameId") || "default";
    const completedFlagKey = `game_${gameId}_completed`;
    const inProgressKey = `game_${gameId}_inProgressState`;
    const completedKey = `game_${gameId}_completedState`;

    if (localStorage.getItem(completedFlagKey) === "true") {
      const stateString = localStorage.getItem(completedKey);
      if (stateString) {
        const state = JSON.parse(stateString);
        setFoundWords(state.foundWords || []);
        setPuzzleComplete(true);
      }
    } else {
      const progressString = localStorage.getItem(inProgressKey);
      if (progressString) {
        const state = JSON.parse(progressString);
        setFoundWords(state.foundWords || []);
        setAttemptSequence(state.attemptSequence || []);
        setHintedWord(state.hintedWord || "");
      }
    }
    // Check if the final message flag is set.
    if (localStorage.getItem("finalMessageVisible") === "true") {
      setFinalMessageVisible(true);
    }
  }, []);

  const fetchGameData = () => {
    axios.get("/api/game2")
      .then(response => {
        const gameId = response.data.gameId || "default";
        const inProgressKey = `game_${gameId}_inProgressState`;
        const completedKey = `game_${gameId}_completedState`;
        const completedFlagKey = `game_${gameId}_completed`;

        if (localStorage.getItem(completedFlagKey) === "true") {
          const stateString = localStorage.getItem(completedKey);
          if (stateString) {
            const state = JSON.parse(stateString);
            setFoundWords(state.foundWords || []);
            setPuzzleComplete(true);
          }
        } else {
          const progressString = localStorage.getItem(inProgressKey);
          if (progressString) {
            const state = JSON.parse(progressString);
            setFoundWords(state.foundWords || []);
            setAttemptSequence(state.attemptSequence || []);
            setHintedWord(state.hintedWord || "");
          }
        }

        localStorage.setItem("gameId", gameId);
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

  function isSameRoute(routeA, routeB) {
    if (!routeA || !routeB || routeA.length !== routeB.length) return false;
    const format = (coord) =>
      coord.row !== undefined ? `${coord.row},${coord.col}` : `${coord[0]},${coord[1]}`;
    const setA = routeA.map(format).sort();
    const setB = routeB.map(format).sort();
    return setA.every((val, index) => val === setB[index]);
  }

  function getEffectiveRoute(word) {
    if (!game || !game.word_paths) return null;
    const defaultRoute = game.word_paths[word];
    const userRoute = foundRoutes[word];
    return userRoute && isSameRoute(userRoute, defaultRoute) ? userRoute : defaultRoute;
  }

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

  function buildFoundWordLines(word) {
    if (!game) return null;
    const route = getEffectiveRoute(word);
    if (!route || route.length < 2) return null;
    const isSpangram = (word === game.spangram);
    const strokeColor = "red";
    const strokeW = isSpangram ? 5 : 3;
    const strokeOp = isSpangram ? 0.6 : 0.3;
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
          stroke={strokeColor}
          strokeWidth={strokeW}
          strokeOpacity={strokeOp}
          strokeLinecap="round"
        />
      );
    }
    return lines;
  }

  const submitWord = async () => {
    if (!game || puzzleComplete) return;
    const word = selectedLetters.map(l => l.letter).join("");
    if (word.length < 4) {
      setSubmissionStatus("Word too short");
      setSelectedLetters([]);
      return;
    }
    let nextFoundWords = [...foundWords];
    let nextAttemptSequence = [...attemptSequence];
    const routeToSave = [...selectedLetters];
    if (game.valid_words.includes(word)) {
      if (!foundWords.includes(word)) {
        nextFoundWords.push(word);
        nextAttemptSequence.push(word);
        setSubmissionStatus(`${word} ✅`);
        setFoundRoutes(prev => ({ ...prev, [word]: routeToSave }));
        if (word === hintedWord) setHintedWord("");
        if (navigator.vibrate) {
          navigator.vibrate(100);
        }
      }
    } else {
      nextAttemptSequence.push("FAIL");
      setSubmissionStatus(`${word} ❌`);
      if (navigator.vibrate) {
        navigator.vibrate(200);
      }
    }
    setSelectedLetters([]);
    setFoundWords(nextFoundWords);
    setAttemptSequence(nextAttemptSequence);
    
    const gameId = localStorage.getItem("gameId") || "default";
    const inProgressKey = `game_${gameId}_inProgressState`;
    const completedKey = `game_${gameId}_completedState`;
    const completedFlagKey = `game_${gameId}_completed`;
    
    localStorage.setItem(inProgressKey, JSON.stringify({
      foundWords: nextFoundWords,
      attemptSequence: nextAttemptSequence,
      hintedWord
    }));
    
    if (nextFoundWords.length === game.valid_words.length) {
      setPuzzleComplete(true);
      localStorage.setItem(completedFlagKey, "true");
      localStorage.setItem(completedKey, JSON.stringify({
        foundWords: nextFoundWords
      }));
      setShowFinalPopup(true);
    }
  };

  const clearSelection = () => {
    setSelectedLetters([]);
    setSubmissionStatus("");
  };

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
        return (word === game.spangram) ? "gold" : colorMapping[word] || undefined;
      }
    }
    return undefined;
  };

  const foundWordLines = foundWords.flatMap(word => {
    const lines = buildFoundWordLines(word);
    return lines || [];
  });

  // Modified hint mechanism: limit to 2 hints per game, no score deduction.
  const handleHint = () => {
    if (!game) return;
    if (hintCounter >= 2) return;
    const unsolved = game.valid_words.filter(word => !foundWords.includes(word));
    if (unsolved.length === 0) return;
    let newHint = "";
    if (unsolved.length > 1 && unsolved.includes(game.spangram)) {
      const nonSpangram = unsolved.filter(word => word !== game.spangram);
      newHint = nonSpangram.length > 0 ? nonSpangram[0] : game.spangram;
    } else {
      newHint = unsolved[0];
    }
    setHintedWord(newHint);
    setHintCounter(prev => prev + 1);
  };

  const resetGame = () => {
    const gameId = localStorage.getItem("gameId") || "default";
    const inProgressKey = `game_${gameId}_inProgressState`;
    const completedKey = `game_${gameId}_completedState`;
    const completedFlagKey = `game_${gameId}_completed`;
    localStorage.removeItem(inProgressKey);
    localStorage.removeItem(completedKey);
    localStorage.removeItem(completedFlagKey);
    localStorage.removeItem("finalMessageVisible");
    setFoundWords([]);
    setSelectedLetters([]);
    setAttemptSequence([]);
    setSubmissionStatus("");
    setHintedWord("");
    setPuzzleComplete(false);
    setFoundRoutes({});
    setHintCounter(0);
    setFinalMessageVisible(false);
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
      <button className="tutorial-button" onClick={toggleTutorial}>?</button>
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
              <li>🌟 Find the <strong>Spangram</strong>: a special word that spans the board. Solving it gives a brighter highlight!</li>
              <li>✅ Press <strong>SUBMIT</strong> (or complete your swipe) to check your word.</li>
              <li>💡 Tap <strong>HINT</strong> to get a hint (maximum 2 per game).</li>
              <li>❌ Tap <strong>CLEAR</strong> to reset your selection or backtrack your swipe.</li>
              <li>🏆 Solve them all and enjoy the final instructions!</li>
            </ul>
            <button className="close-tutorial" onClick={toggleTutorial}>Close</button>
          </div>
        </div>
      )}
      <div className="theme-pill">Theme: {game.theme}</div>
      <div className="game-summary">{summaryText}</div>
      <div className="selected-letters-container">
        <div className="selected-letters">
          {submissionStatus !== ""
            ? submissionStatus
            : selectedLetters.map(l => l.letter).join("")}
        </div>
      </div>
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
        <button onClick={handleHint} className="hint-button" disabled={hintCounter >= 2}>{hintButtonText}</button>
        <button onClick={submitWord} className="submit-button" disabled={puzzleComplete}>
          SUBMIT
        </button>
      </div>
      {showFinalPopup && (
        <div className="popup">
          <p>Congratulations!</p>
          <ol>
            <li>Take a screenshot of the solved game and send it.</li>
            <li>Grab a selfie with at least two of your teammates by the 'Spanagram' object in the venue.</li>
          </ol>
          <button 
            onClick={() => {
              setShowFinalPopup(false);
              setFinalMessageVisible(true);
              localStorage.setItem("finalMessageVisible", "true");
            }} 
            className="submit-button"
          >
            Close
          </button>
        </div>
      )}
      {finalMessageVisible && (
        <div className="final-message">
          <p>Congratulations!</p>
          <ol>
            <li>Take a screenshot of the solved game and send it.</li>
            <li>Grab a selfie with at least two of your teammates by the 'Spanagram' object in the venue.</li>
          </ol>
        </div>
      )}
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
          width: 90%;
          max-width: 400px;
        }
        .final-message {
          margin-top: 20px;
          padding: 15px;
          border: 2px solid #333;
          text-align: center;
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
          .final-message {
            border-color: #555;
            color: #fff;
          }
        }
      `}</style>
    </div>
  );
}

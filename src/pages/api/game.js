// pages/api/game.js
const gameData = {
    theme: "Animals",
    letter_grid: [
      ["A", "E", "C", "I", "C", "K"],
      ["E", "T", "H", "I", "P", "E"],
      ["H", "C", "P", "I", "R", "A"],
      ["W", "A", "O", "C", "A", "O"],
      ["T", "K", "N", "D", "C", "R"],
      ["M", "O", "C", "E", "N", "G"],
      ["L", "E", "N", "U", "T", "L"],
      ["E", "A", "R", "F", "B", "U"]
    ],
    valid_words: [
      "GLUTENFREE",
      "ALMOND",
      "CORN",
      "CHICKPEA",
      "TAPIOCA",
      "BUCKWHEAT",
      "RICE"
    ],
    spangram: "GLUTENFREE",
    word_paths: {
      RICE: [[2, 4], [1, 3], [0, 2], [0, 1]],
      BUCKWHEAT: [[7, 4], [6, 3], [5, 2], [4, 1], [3, 0], [2, 0], [1, 0], [0, 0], [1, 1]],
      CHICKPEA: [[2, 1], [1, 2], [0, 3], [0, 4], [0, 5], [1, 4], [1, 5], [2, 5]],
      TAPIOCA: [[4, 0], [3, 1], [2, 2], [2, 3], [3, 2], [3, 3], [3, 4]],
      ALMOND: [[7, 1], [6, 0], [5, 0], [5, 1], [4, 2], [4, 3]],
      CORN: [[4, 4], [3, 5], [4, 5], [5, 4]],
      GLUTENFREE: [[5, 5], [6, 5], [7, 5], [6, 4], [5, 3], [6, 2], [7, 3], [7, 2], [6, 1], [7, 0]]
    }
  };
  
  export default function handler(req, res) {
    res.status(200).json(gameData);
  }
  
#!/usr/bin/env python3
import sys, random, concurrent.futures, json, re

# ------------------ Configuration ------------------
GRID_WIDTH = 6
GRID_HEIGHT = 9
TOTAL_CELLS = GRID_WIDTH * GRID_HEIGHT  # 42

# Provided words & spangram.
# Their total letters must equal 48:
#   LION (4) + TIGER (5) + BEAR (4) + ZEBRA (5) + EAGLE (5) +
#   SHARK (5) + WHALE (5) + FROG (4) + TOAD (4)
#   plus spangram ANIMALS (7) = 48 letters.
wordsList = ["THANDU", "GARAM", "NARAM", "KARAK", "UPAR", "NEECHE", "UJAALU", "ANDHAARU"]
spangram = "OPPOSITES"  # 7 letters

# Verify total letters
if sum(len(w) for w in wordsList) + len(spangram) != TOTAL_CELLS:
    print(f"Error: Total letters must equal {TOTAL_CELLS}.")
    sys.exit(1)

# All words: used for validation and gameData, but the ordering will be set differently.
all_words = [spangram] + wordsList

# ------------------ Grid and Utility Functions ------------------
def create_grid():
    """Return a GRID_HEIGHT x GRID_WIDTH grid initialized to None."""
    return [[None for _ in range(GRID_WIDTH)] for _ in range(GRID_HEIGHT)]

def in_bounds(r, c):
    return 0 <= r < GRID_HEIGHT and 0 <= c < GRID_WIDTH

def print_grid(grid):
    for row in grid:
        print(" ".join(cell if cell is not None else "." for cell in row))
    print()

# All 8 possible adjacent moves (including diagonals)
directions = [(-1, -1), (-1, 0), (-1, 1),
              (0, -1),           (0, 1),
              (1, -1),  (1, 0),  (1, 1)]

def neighbors(r, c):
    for dr, dc in directions:
        nr, nc = r + dr, c + dc
        if in_bounds(nr, nc):
            yield nr, nc

# ------------------ Edge Touch Check Functions ------------------
def touches_opposite_edges(path):
    """
    Given a word's path (list of (r, c) coordinates), 
    returns True if the path touches both left & right sides 
    (min col == 0 and max col == GRID_WIDTH-1) or both top & bottom 
    (min row == 0 and max row == GRID_HEIGHT-1).
    """
    min_r = min(r for r, _ in path)
    max_r = max(r for r, _ in path)
    min_c = min(c for _, c in path)
    max_c = max(c for _, c in path)
    return (min_c == 0 and max_c == GRID_WIDTH - 1) or (min_r == 0 and max_r == GRID_HEIGHT - 1)

def spangram_valid(path):
    """
    For the spangram, its path must touch opposite sides.
    """
    return touches_opposite_edges(path)

def non_spangram_valid(path):
    """
    For non-spangram words, the path must NOT touch opposite sides.
    """
    return not touches_opposite_edges(path)

# ------------------ DFS Word Placement with Constraints ------------------
def place_word(grid, word):
    """
    Try to place 'word' on the grid as a contiguous snaking path (using DFS).
    Each word may contain at most one diagonal move.
    For non-spangram words, the path must not touch opposite sides.
    Also, no word (including the spangram) is allowed to be a single straight line (vertical or horizontal).
    Returns a list of (r, c) coordinates for the word if successful, else None.
    """
    def dfs(r, c, index, path, visited, diag_count):
        if index == len(word):
            # Check that the path is not a single straight line (vertical or horizontal)
            rows = {r for r, _ in path}
            cols = {c for _, c in path}
            if len(rows) == 1 or len(cols) == 1:
                return None
            return path[:]  # Found a valid placement.
        for nr, nc in neighbors(r, c):
            if (nr, nc) in visited:
                continue
            if grid[nr][nc] is not None:
                continue
            # Determine if this move is diagonal.
            if abs(nr - r) == 1 and abs(nc - c) == 1:
                if diag_count >= 1:
                    continue
                new_diag_count = diag_count + 1
            else:
                new_diag_count = diag_count
            visited.add((nr, nc))
            path.append((nr, nc))
            res = dfs(nr, nc, index + 1, path, visited, new_diag_count)
            if res is not None:
                return res
            path.pop()
            visited.remove((nr, nc))
        return None

    cells = [(r, c) for r in range(GRID_HEIGHT) for c in range(GRID_WIDTH)]
    random.shuffle(cells)
    for r, c in cells:
        if grid[r][c] is None:
            grid[r][c] = word[0]
            path = [(r, c)]
            visited = {(r, c)}
            res = dfs(r, c, 1, path, visited, 0)
            if res is not None:
                return res
            grid[r][c] = None
    return None

def solve_puzzle_with_order(ordering):
    """
    Given a specific ordering of words, try to place each word on the grid using DFS.
    For non-spangram words, ensure they do not touch opposite sides.
    For the spangram, ensure its path touches opposite sides.
    Returns (grid, solution_paths) on success, or None if any word cannot be placed.
    """
    grid = create_grid()
    solution_paths = {}
    for word in ordering:
        path = place_word(grid, word)
        if path is None:
            return None
        # Validate the edge condition based on whether this is the spangram.
        if word == spangram:
            if not spangram_valid(path):
                return None
        else:
            if not non_spangram_valid(path):
                return None
        # Permanently fill the grid with the word.
        for i, (r, c) in enumerate(path):
            grid[r][c] = word[i]
        solution_paths[word] = path
    # Check grid is full.
    if any(cell is None for row in grid for cell in row):
        return None
    return grid, solution_paths

# ------------------ Concurrency Attempts ------------------
def attempt_random_order():
    """Randomly permute the order of words and try to solve the puzzle.
       The spangram is always inserted into the middle of the ordering."""
    # Create a list of non-spangram words and shuffle them.
    non_spanagram_words = wordsList[:]  # spangram is excluded
    random.shuffle(non_spanagram_words)
    # Insert the spangram in the middle.
    mid_index = len(non_spanagram_words) // 2
    ordering = non_spanagram_words[:]
    ordering.insert(mid_index, spangram)
    return solve_puzzle_with_order(ordering)

def main():
    attempts = 500  # number of parallel attempts
    with concurrent.futures.ProcessPoolExecutor() as executor:
        futures = [executor.submit(attempt_random_order) for _ in range(attempts)]
        for future in concurrent.futures.as_completed(futures):
            result = future.result()
            if result is not None:
                grid, paths = result
                # Build the gameData object in the desired format.
                gameData = {
                    "theme": "Animals",
                    "letter_grid": grid,
                    "valid_words": all_words,
                    "spangram": spangram,
                    # Convert each tuple coordinate to a list.
                    "word_paths": {word: [list(coord) for coord in path] for word, path in paths.items()}
                }
                # Dump to JSON with indent.
                json_str = json.dumps(gameData, indent=2)
                # Remove quotes from top-level keys to match the desired format.
                lines = json_str.splitlines()
                for i, line in enumerate(lines):
                    if line.startswith('  "'):
                        line = re.sub(r'^(\s*)"([^"]+)":', r'\1\2:', line)
                        lines[i] = line
                json_str_modified = "\n".join(lines)
                print("const gameData = " + json_str_modified + ";")
                executor.shutdown(wait=False)
                return
    print("No solution found after multiple attempts.")

if __name__ == '__main__':
    main()

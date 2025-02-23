#!/usr/bin/env python3
import sys, random, concurrent.futures

# ------------------ Configuration ------------------
GRID_WIDTH = 6
GRID_HEIGHT = 8
TOTAL_CELLS = GRID_WIDTH * GRID_HEIGHT  # 48

# Provided words & spangram.
# Their total letters must equal 48:
#   LION (4) + TIGER (5) + BEAR (4) + ZEBRA (5) + EAGLE (5) +
#   SHARK (5) + WHALE (5) + FROG (4) + TOAD (4)
#   plus spangram ANIMALS (7) = 48 letters.
wordsList = ["ALMOND", "CORN", "CHICKPEA", "TAPIOCA", "BUCKWHEAT",
             "RICE"]
spangram = "GLUTENFREE"  # 7 letters

# Verify total letters
if sum(len(w) for w in wordsList) + len(spangram) != TOTAL_CELLS:
    print(f"Error: Total letters must equal {TOTAL_CELLS}.")
    sys.exit(1)

# All words: spangram is first, then the other words.
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

# ------------------ Spangram Check Function ------------------
def spangram_valid(path):
    """
    Given the spangram's path (list of (r, c) coordinates),
    return True if the path touches two opposite sides of the board:
    either both left and right (min column == 0 and max column == GRID_WIDTH-1)
    or both top and bottom (min row == 0 and max row == GRID_HEIGHT-1).
    """
    min_r = min(r for r, _ in path)
    max_r = max(r for r, _ in path)
    min_c = min(c for _, c in path)
    max_c = max(c for _, c in path)
    touches_horiz = (min_c == 0 and max_c == GRID_WIDTH - 1)
    touches_vert = (min_r == 0 and max_r == GRID_HEIGHT - 1)
    return touches_horiz or touches_vert

# ------------------ DFS Word Placement ------------------
def place_word(grid, word):
    """
    Try to place 'word' on the grid as a contiguous snaking path (using DFS).
    Returns a list of (r, c) coordinates for the word if successful, else None.
    """
    def dfs(r, c, index, path, visited):
        if index == len(word):
            return path[:]  # Found a valid placement.
        for nr, nc in neighbors(r, c):
            if (nr, nc) in visited:
                continue
            if grid[nr][nc] is not None:
                continue
            visited.add((nr, nc))
            path.append((nr, nc))
            res = dfs(nr, nc, index + 1, path, visited)
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
            res = dfs(r, c, 1, path, visited)
            if res is not None:
                return res
            grid[r][c] = None
    return None

def solve_puzzle_with_order(ordering):
    """
    Given a specific ordering of words, try to place each word on the grid using DFS.
    Returns (grid, solution_paths) on success, or None if any word cannot be placed.
    Also checks that the spangram's path is valid (touches two opposite sides).
    """
    grid = create_grid()
    solution_paths = {}
    for word in ordering:
        path = place_word(grid, word)
        if path is None:
            return None
        # Permanently fill the grid with the word.
        for i, (r, c) in enumerate(path):
            grid[r][c] = word[i]
        solution_paths[word] = path
    # Check grid is full.
    if any(cell is None for row in grid for cell in row):
        return None
    # Check spangram condition.
    sp_path = solution_paths[spangram]
    if not spangram_valid(sp_path):
        return None
    return grid, solution_paths

# ------------------ Concurrency Attempts ------------------
def attempt_random_order():
    """Randomly permute the order of words and try to solve the puzzle."""
    ordering = all_words[:]  # copy list
    random.shuffle(ordering)
    return solve_puzzle_with_order(ordering)

def main():
    attempts = 50  # number of parallel attempts
    with concurrent.futures.ProcessPoolExecutor() as executor:
        futures = [executor.submit(attempt_random_order) for _ in range(attempts)]
        for future in concurrent.futures.as_completed(futures):
            result = future.result()
            if result is not None:
                grid, paths = result
                print("Puzzle solved!")
                print_grid(grid)
                print("Word paths:")
                for word, path in paths.items():
                    print(f"{word}: {path}")
                executor.shutdown(wait=False)
                return
    print("No solution found after multiple attempts.")

if __name__ == '__main__':
    main()

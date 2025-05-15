from collections import deque

def get_square_edges(row, col, cols):
    # row-major order node indexing: calculate the 4 nodes of a square
    top_left = row * (cols + 1) + col
    top_right = top_left + 1
    bottom_left = top_left + (cols + 1)
    bottom_right = bottom_left + 1

    return [
        (top_left, top_right),        # Up
        (bottom_left, bottom_right),  # Down
        (top_left, bottom_left),      # Left
        (top_right, bottom_right)     # Right
    ]

def bfs_over_squares(squares, edge_list):
    rows = len(squares)
    cols = len(squares[0])
    regions = []  # List of all square-based regions detected

    visited = [[False for _ in range(cols)] for _ in range(rows)]  # Track visited squares
    directions = [(-1, 0), (1, 0), (0, -1), (0, 1)]  # Directions: up, down, left, right

    # Region detection — loop through all squares to find disconnected ones
    for row_visited in range(rows):
        for col_visited in range(cols):
            if not visited[row_visited][col_visited]:
                queue = deque()
                queue.append((row_visited, col_visited))
                visited[row_visited][col_visited] = True
                region = [(row_visited, col_visited)]

                # BFS square expansion: explore all reachable neighbors unless blocked by an edge
                while queue:
                    row, col = queue.popleft()
                    square_edges = get_square_edges(row, col, cols)

                    for (dr, dc), edge in zip(directions, square_edges):
                        r, c = row + dr, col + dc
                        if 0 <= r < rows and 0 <= c < cols:
                            if edge not in edge_list:
                                if not visited[r][c]:
                                    visited[r][c] = True
                                    queue.append((r, c))
                                    region.append((r, c))

                regions.append(region)

    return regions  # Return the list of regions (not just the count)

# Rule: A region may not contain more than one non-grey color
def color_rule(regions, squares):
    for region in regions:
        if not check_color_rule(region, squares):
            return False
    return True

# Rule: A region must contain exactly 0 or exactly 2 stars of each color
def star_rule(regions, squares):
    for region in regions:
        if not check_star_rule(region, squares):
            return False
    return True

# Internal rule: returns True if region follows color rule
def check_color_rule(region, squares):
    return count_color_violations(region, squares) == 0

# Internal rule: returns True if region follows star pairing rule
def check_star_rule(region, squares):
    return count_star_violations(region, squares) == 0

# Internal rule: returns count of color violations (how many squares are off-color)
def count_color_violations(region, squares):
    color_counts = {}
    for r, c in region:
        color = squares[r][c].get("color", "grey")
        if color != "grey":
            color_counts[color] = color_counts.get(color, 0) + 1

    if not color_counts:
        return 0  # all grey

    dominant_color = max(color_counts.values())
    total = sum(color_counts.values())
    return total - dominant_color  # number of off-color squares

# Internal rule: returns count of unpaired stars
def count_star_violations(region, squares):
    star_counter = {}
    for r, c in region:
        star_color = squares[r][c].get("starColor")
        if star_color:
            star_counter[star_color] = star_counter.get(star_color, 0) + 1

    violations = 0
    for count in star_counter.values():
        if count % 2 != 0:
            violations += 1  # each odd star count is a violation
    return violations

# Internal rule: handle NOT regions — must break exactly one rule (one off-by-one)
def check_not_rule(region, squares):
    # 1. Check if region contains any NOT symbol
    if not any(squares[r][c].get("hasNot", False) for r, c in region):
        return True  # no NOT in region, no special rule to enforce

    # 2. Count violations
    color_violations = count_color_violations(region, squares)
    star_violations = count_star_violations(region, squares)
    total_violations = color_violations + star_violations

    # 3. NOT rule: must cancel exactly one violation
    return total_violations == 1

def validate_solution(squares, edge_list):
    """
    Validate puzzle based on all above rules.
    Returns: (valid_solution: bool, regions: List[List[(row, col)]])
    """
    regions = bfs_over_squares(squares, edge_list)

    for region in regions:
        has_not = any(squares[r][c].get("hasNot", False) for r, c in region)

        if has_not:
            if not check_not_rule(region, squares):
                return False, regions
        else:
            if not check_color_rule(region, squares) or not check_star_rule(region, squares):
                return False, regions

    return True, regions

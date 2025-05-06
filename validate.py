
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

                    # My most beautiful line of code: edge check and neighbor traversal in one loop
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

def validate_solution(squares, edge_list):
    """
    Validate puzzle based on rule: no region may contain more than one non-grey color.
    Returns: (valid_solution: bool, regions: List[List[(row, col)]])
    """
    regions = bfs_over_squares(squares, edge_list)

    for region in regions:
        colors = set()
        for r, c in region:
            color = squares[r][c].get("color", "grey")
            if color != "grey":  # Ignore grey; only track meaningful colors
                colors.add(color)
        if len(colors) > 1:
            return False, regions  # Region contains multiple distinct colors

    return True, regions  # All regions are single-color (or grey only)


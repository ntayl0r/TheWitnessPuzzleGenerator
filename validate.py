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

def get_square_edges_coords(row, col):
    """
    Get edges around a square as coordinate pairs instead of node indices.
    Each edge is a tuple: ((row1, col1), (row2, col2))
    """
    return [
        ((row, col), (row, col + 1)),       # Up edge
        ((row + 1, col), (row + 1, col + 1)), # Down edge
        ((row, col), (row + 1, col)),       # Left edge
        ((row, col + 1), (row + 1, col + 1))  # Right edge
    ]

def bfs_over_squares(squares, edge_list):
    rows = len(squares)
    cols = len(squares[0])
    regions = []  # List of all square-based regions detected

    visited = [[False for _ in range(cols)] for _ in range(rows)]  # Track visited squares
    directions = [(-1, 0), (1, 0), (0, -1), (0, 1)]  # Directions: up, down, left, right

    # Normalize edge_list: convert each edge to a sorted tuple of coordinates
    edge_set = set(tuple(sorted(edge)) for edge in edge_list)

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
                    square_edges = get_square_edges_coords(row, col)

                    # My most beautiful line of code: edge check and neighbor traversal in one loop
                    for (dr, dc), edge in zip(directions, square_edges):
                        r, c = row + dr, col + dc
                        if 0 <= r < rows and 0 <= c < cols:
                            normalized_edge = tuple(sorted(edge))
                            if normalized_edge not in edge_set:
                                if not visited[r][c]:
                                    visited[r][c] = True
                                    queue.append((r, c))
                                    region.append((r, c))

                regions.append(region)

    return regions  # Return the list of regions (not just the count)


# Rule: A region may not contain more than one non-grey color
def color_rule(regions, squares):
    for region in regions:
        colors = set()
        for r, c in region:
            color = squares[r][c].get("color", "grey")
            if color != "grey":
                colors.add(color)
        if len(colors) > 1:
            return False  # Region contains multiple distinct colors
    return True

# Rule: A region must contain either exactly 0 or exactly 2 stars
def star_rule(regions, squares):
    for region in regions:
        star_count = sum(1 for r, c in region if squares[r][c].get("hasStar", False))
        if star_count not in {0, 2}:
            return False  # Region contains an invalid number of stars
    return True

def validate_solution(squares, edge_list):
    """
    Validate puzzle based on all above rules.
    Returns: (valid_solution: bool, regions: List[List[(row, col)]])
    """
    regions = bfs_over_squares(squares, edge_list)
    is_color_valid = color_rule(regions, squares)
    is_star_valid = star_rule(regions, squares)
    return is_color_valid and is_star_valid, regions

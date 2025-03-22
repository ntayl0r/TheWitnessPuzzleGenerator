from collections import deque

def get_square_edges(row, col, cols):
    #row major order 
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
    START_ROW = 0
    START_COL = 0 
    rows = len(squares)
    cols = len(squares[0])
    regions = [] 

    #Tracks visited squares for BFS 
    visited = [[False for _ in range(cols)] for _ in range(rows)] 
    queue = deque()
    queue.append((START_ROW, START_COL))
    count = 1  # Count the starting square
    visited[START_ROW][START_COL] = True     #thisll be looped 

    # Directions: up, down, left, right
    directions = [(-1, 0), (1, 0), (0, -1), (0, 1)]

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
                        count += 1

    return count


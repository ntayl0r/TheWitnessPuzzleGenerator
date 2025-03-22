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
    rows = len(squares)
    cols = len(squares[0])
    region = []
    regions = [] 

    #Tracks visited squares for BFS 
    visited = [[False for _ in range(cols)] for _ in range(rows)] #  Need to visit all regions 
    queue = deque() # Need to visit all squares in a region 
    directions = [(-1, 0), (1, 0), (0, -1), (0, 1)]  # Directions: up, down, left, right

    # Region detecton - starts at next unvisited square if one or more squares is cut off by our path of edges 
    for row_visited in range(rows):
        for col_visited in range(cols):
            if not visited[row_visited][col_visited]: 

                # BFS square search 
                visited[row_visited][col_visited] = True     
                queue.append((row_visited, col_visited))
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
                                    region.append((r,c))
                regions.append(region)

    return len(regions)
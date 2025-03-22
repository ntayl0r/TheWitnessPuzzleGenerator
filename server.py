from flask import Flask, request, jsonify
from flask_cors import CORS
from flask import Response
from collections import OrderedDict
import json
from validate import bfs_over_squares

app = Flask(__name__)
CORS(app)  # Allow communication with React

# Store the puzzle state in memory 
puzzle_state = {
    "squares": [],  # Stores the colors of squares
    "nodes": [],    # Stores occupied nodes (path)
    "edges": []     # Stores edge list 
}

# Undirected edge list that uses row major ordering to assign unique index number to each node 
def build_edge_list(path, grid_cols):
    edge_list = []
    
    for i in range(1, len(path)):
        prev = path[i - 1]
        curr = path[i]

        prev_index = prev["row"] * (grid_cols + 1) + prev["col"]
        curr_index = curr["row"] * (grid_cols + 1) + curr["col"]

        edge = tuple(sorted((prev_index, curr_index)))  
        edge_list.append(edge)

    return edge_list


# Receive puzzle state from React, generate edge list, and save it.
@app.route('/save', methods=['POST'])
def save_puzzle():
    data = request.json  # Get JSON data from the request
    puzzle_state["squares"] = data.get("squares", [])
    puzzle_state["nodes"] = data.get("nodes", [])

    # Accounts for non-square grids
    grid_rows = len(puzzle_state["squares"])
    grid_cols = len(puzzle_state["squares"][0]) if grid_rows > 0 else 0

    # Ensure squares are initialized with color
    for row in range(grid_rows):
        for col in range(grid_cols):
            if isinstance(puzzle_state["squares"][row][col], str):  # If it's a color string
                puzzle_state["squares"][row][col] = {
                    "color": puzzle_state["squares"][row][col]
                }

    # Generate edge list
    puzzle_state["edges"] = build_edge_list(puzzle_state["nodes"], grid_cols)

    return jsonify({"message": "Puzzle state saved successfully"}), 200


# Send the stored puzzle state back to React and display squares + BFS stats.
@app.route('/load', methods=['GET'])
def load_puzzle():
    grid_rows = len(puzzle_state["squares"])
    grid_cols = len(puzzle_state["squares"][0]) if grid_rows > 0 else 0

    region_count = 0
    if grid_rows > 0 and grid_cols > 0:
        region_count = bfs_over_squares(puzzle_state["squares"], puzzle_state["edges"])

    # Build response key order - JSON defaults to alphabetical  
    response_data = OrderedDict([
        ("region_count", region_count),
        ("edges", puzzle_state["edges"]),
        ("squares", puzzle_state["squares"]),
        ("nodes", puzzle_state["nodes"])
    ])

    return Response(json.dumps(response_data), mimetype='application/json')


if __name__ == '__main__':
    app.run(debug=True)

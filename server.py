from collections import OrderedDict
from flask import Flask, request, jsonify, Response
from flask_cors import CORS
from validate import bfs_over_squares, validate_solution  # Properly import the logic
import json

app = Flask(__name__)
app.config['JSONIFY_PRETTYPRINT_REGULAR'] = True
CORS(app)  # Enable CORS for communication with React frontend

# Store the puzzle state in memory
puzzle_state = {
    "squares": [],  # 2D grid of squares, each with a color
    "nodes": [],    # List of visited nodes forming the path
    "edges": []     # Edge list between node indices
}

# Converts path into an undirected edge list using row-major node indexing
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

# Receive puzzle state from React, initialize colors, generate edge list
@app.route('/save', methods=['POST'])
def save_puzzle():
    data = request.json
    puzzle_state["squares"] = data.get("squares", [])
    puzzle_state["nodes"] = data.get("nodes", [])

    grid_rows = len(puzzle_state["squares"])
    grid_cols = len(puzzle_state["squares"][0]) if grid_rows > 0 else 0

    # Ensure squares use dict format: { "color": "red" }
    for row in range(grid_rows):
        for col in range(grid_cols):
            if isinstance(puzzle_state["squares"][row][col], str):
                puzzle_state["squares"][row][col] = {
                    "color": puzzle_state["squares"][row][col]
                }

    # Generate the edge list from node path
    puzzle_state["edges"] = build_edge_list(puzzle_state["nodes"], grid_cols)

    return jsonify({"message": "Puzzle state saved successfully"}), 200

# Return full puzzle state + validation and region information
@app.route('/load', methods=['GET'])
def load_puzzle():
    grid_rows = len(puzzle_state["squares"])
    grid_cols = len(puzzle_state["squares"][0]) if grid_rows > 0 else 0

    region_count = 0
    is_valid = True
    if grid_rows > 0 and grid_cols > 0:
        is_valid, regions = validate_solution(puzzle_state["squares"], puzzle_state["edges"])
        region_count = len(regions)

    # Ensure valid_solution and region_count appear at the top of the JSON
    response_data = OrderedDict([
        ("valid_solution", is_valid),
        ("region_count", region_count),
        ("edges", puzzle_state["edges"]),
        ("squares", puzzle_state["squares"]),
        ("nodes", puzzle_state["nodes"])
    ])

    return Response(json.dumps(response_data), mimetype='application/json')

if __name__ == '__main__':
    app.run(debug=True)

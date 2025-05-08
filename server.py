from flask import Flask, request, jsonify, Response
from flask_cors import CORS
from collections import OrderedDict
import json
from validate import validate_solution

app = Flask(__name__)
app.config['JSONIFY_PRETTYPRINT_REGULAR'] = True
CORS(app)  # Enable CORS for React frontend

# Store the puzzle state in memory
puzzle_state = {
    "squares": [],  # Grid of squares, each with { color, hasStar }
    "nodes": [],    # Path traced by user
    "edges": [],    # Edge list between node indices
    "startNode": None, # Dict like {"row": 0, "col": 0}
    "finishNode": None # Dict like {"row": 1, "col": 1}
}

# Convert a node (row, col) to a unique index based on row-major layout
def node_to_index(row, col, cols):
    return row * (cols + 1) + col

# Build edge list from a sequential path of node positions using (row, col) tuples
def build_edge_list(path):
    edges = []
    for i in range(1, len(path)):
        a = (path[i - 1]["row"], path[i - 1]["col"])
        b = (path[i]["row"], path[i]["col"])
        edges.append((a, b))
    return edges

@app.route('/save', methods=['POST'])
def save_puzzle():
    data = request.json
    if not data:
        return jsonify({"message": "No data received"}), 400

    puzzle_state["squares"] = data.get("squares", [])
    puzzle_state["edges"] = build_edge_list(puzzle_state["nodes"])
    puzzle_state["startNode"] = data.get("startNode")  
    puzzle_state["finishNode"] = data.get("finishNode")  
    puzzle_state["nodes"] = data.get("nodes", [])

    grid_rows = len(puzzle_state["squares"])
    grid_cols = len(puzzle_state["squares"][0]) if grid_rows > 0 else 0

    for row in range(grid_rows):
        for col in range(grid_cols):
            if isinstance(puzzle_state["squares"][row][col], str):
                puzzle_state["squares"][row][col] = {
                    "color": puzzle_state["squares"][row][col]
                }

    puzzle_state["edges"] = build_edge_list(puzzle_state["nodes"], grid_cols)

    return jsonify({"message": "Puzzle state saved successfully"}), 200


@app.route('/load', methods=['GET'])
def load_puzzle():
    squares = puzzle_state["squares"]
    edges = puzzle_state["edges"]

    if squares:
        is_valid, regions = validate_solution(squares, edges)
        region_count = len(regions)
    else:
        is_valid = True
        region_count = 0

    # Prints alphabetically without this ordering
    response_data = OrderedDict([
        ("valid_solution", is_valid),
        ("region_count", region_count),
        ("edges", puzzle_state["edges"]),
        ("squares", puzzle_state["squares"]),
        ("startNode", puzzle_state["startNode"]),    
        ("finishNode", puzzle_state["finishNode"]),  
        ("nodes", puzzle_state["nodes"]),
    ])

    return Response(json.dumps(response_data), mimetype='application/json')

if __name__ == '__main__':
    app.run(debug=True)

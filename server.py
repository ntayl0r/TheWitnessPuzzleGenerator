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
    "edges": []     # Edge list between node indices
}

# Convert a node (row, col) to a unique index based on row-major layout
def node_to_index(row, col, cols):
    return row * (cols + 1) + col

# Build edge list from a sequential path of node positions
def build_edge_list(path, cols):
    edges = []
    for i in range(1, len(path)):
        a = node_to_index(path[i - 1]["row"], path[i - 1]["col"], cols)
        b = node_to_index(path[i]["row"], path[i]["col"], cols)
        edges.append(tuple(sorted((a, b))))
    return edges

@app.route('/save', methods=['POST'])
def save_puzzle():
    data = request.get_json()
    if not data:
        return jsonify({"message": "No data received"}), 400

    puzzle_state["squares"] = data.get("squares", [])
    puzzle_state["nodes"] = data.get("nodes", [])

    rows = len(puzzle_state["squares"])
    cols = len(puzzle_state["squares"][0]) if rows > 0 else 0

    # Normalize any legacy string squares into dicts
    for r in range(rows):
        for c in range(cols):
            cell = puzzle_state["squares"][r][c]
            if isinstance(puzzle_state["squares"][r][c], str):
                puzzle_state["squares"][r][c] = {
                    "color": puzzle_state["squares"][r][c],
                    "hasStar": False
    }

    # Generate edges from path
    puzzle_state["edges"] = build_edge_list(puzzle_state["nodes"], cols)

    return jsonify({"message": "Puzzle state saved"}), 200

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

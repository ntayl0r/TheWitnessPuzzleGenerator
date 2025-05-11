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
    "height": 0,
    "width": 0,
    "squares": [],
    "nodes": [],
    "edges": [],
    "startNode": None,
    "finishNode": None,
}

# Convert a node (row, col) to a unique index based on row-major layout
def node_to_index(row, col, cols):
    return row * (cols + 1) + col

# Convert index back to row/col object
def index_to_node(index, cols):
    return {
        "row": index // (cols + 1),
        "col": index % (cols + 1)
    }

# Build edge list from a sequential path of node positions
def build_edge_list(path, cols):
    edges = []
    for i in range(1, len(path)):
        a = node_to_index(path[i - 1]["row"], path[i - 1]["col"], cols)
        b = node_to_index(path[i]["row"], path[i]["col"], cols)
        edges.append(tuple(sorted((a, b))))
    return edges

def build_edge_list_coords(path):
    """Builds edge list preserving original direction in (row, col) form"""
    return [
        [path[i - 1], path[i]]
        for i in range(1, len(path))
        if path[i - 1] != path[i]  # avoid self-edges
    ]

# Convert flat index-based edges to row/col format for frontend
def convert_edges_to_rowcol(edges, cols):
    return [[index_to_node(a, cols), index_to_node(b, cols)] for a, b in edges]

@app.route('/save', methods=['POST'])
def save_puzzle():
    data = request.get_json()
    if not data:
        return jsonify({"message": "No data received"}), 400

    puzzle_state["height"] = data.get("height", 0)
    puzzle_state["width"] = data.get("width", 0)
    puzzle_state["squares"] = data.get("squares", [])
    puzzle_state["nodes"] = data.get("nodes", [])
    puzzle_state["startNode"] = data.get("startNode")
    puzzle_state["finishNode"] = data.get("finishNode")

    rows = len(puzzle_state["squares"])
    cols = len(puzzle_state["squares"][0]) if rows > 0 else 0

    for r in range(rows):
        for c in range(cols):
            cell = puzzle_state["squares"][r][c]
            if isinstance(cell, str):
                puzzle_state["squares"][r][c] = {
                    "color": cell,
                    "hasStar": False
                }

    puzzle_state["edges"] = build_edge_list(puzzle_state["nodes"], cols)
    return jsonify({"message": "Puzzle state saved"}), 200

@app.route('/load', methods=['GET'])
def load_puzzle():
    squares = puzzle_state["squares"]
    edges = puzzle_state["edges"]
    cols = puzzle_state["width"]

    if squares:
        is_valid, regions = validate_solution(squares, edges)
        region_count = len(regions)
    else:
        is_valid = True
        region_count = 0

    response_data = OrderedDict([
        ("valid_solution", is_valid),
        ("region_count", region_count),
        ("height", puzzle_state["height"]),
        ("width", puzzle_state["width"]),
        ("startNode", puzzle_state["startNode"]),
        ("finishNode", puzzle_state["finishNode"]),
        ("edges", build_edge_list_coords(puzzle_state["nodes"])),
        ("squares", puzzle_state["squares"]),
        ("nodes", puzzle_state["nodes"])
    ])

    return Response(json.dumps(response_data), mimetype='application/json')

if __name__ == '__main__':
    app.run(debug=True)

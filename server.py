from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Allow communication with React

# Store the puzzle state in memory (for now)
puzzle_state = {
    "squares": [],  # Stores the colors of squares
    "nodes": [],    # Stores occupied nodes
    "edges": []     # Stores edges between nodes
}

@app.route('/save', methods=['POST'])
def save_puzzle():
    """
    Receive puzzle state from React and save it.
    """
    data = request.json  # Get JSON data from the request
    puzzle_state["squares"] = data.get("squares", [])
    puzzle_state["nodes"] = data.get("nodes", [])
    puzzle_state["edges"] = data.get("edges", [])

    return jsonify({"message": "Puzzle state saved successfully"}), 200

@app.route('/load', methods=['GET'])
def load_puzzle():
    """
    Send the stored puzzle state back to React.
    """
    return jsonify(puzzle_state), 200

if __name__ == '__main__':
    app.run(debug=True)

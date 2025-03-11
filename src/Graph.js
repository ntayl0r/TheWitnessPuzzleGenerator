import React, { useState, useEffect, useCallback } from 'react';

const Grid = ({ width, height }) => {
  const [path, setPath] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);

  // Store the color of each square in a 2D array
  const [colors, setColors] = useState(
    Array.from({ length: height }).map(() => Array(width).fill('grey'))  // Default color is grey - square has no rule
  );


  const handleNodeClick = (row, col) => {
    if (!isDrawing) { 
      // Start drawing
      setPath([{ row, col }]);
      setIsDrawing(true);
    } else {
      // Stop drawing
      setIsDrawing(false);
    }
  };

  const handleMouseEnter = (row, col) => {
    if (!isDrawing) return;
    const lastNode = path[path.length - 1];

    const isAdjacent =
      (Math.abs(lastNode.row - row) === 1 && lastNode.col === col) ||
      (Math.abs(lastNode.col - col) === 1 && lastNode.row === row);

    const alreadyInPath = path.some((n) => n.row === row && n.col === col);

    if (isAdjacent && !alreadyInPath) {
      setPath((prev) => [...prev, { row, col }]);
    }
  };

  const isNodeInPath = (row, col) =>
    path.some((node) => node.row === row && node.col === col);

  // Cycle through colors on right-click - impliment color rule
  const handleRightClick = (e, row, col) => {
    e.preventDefault();
    setColors((prevColors) => {
      const newColors = [...prevColors];
      const currentColor = newColors[row][col];
      // Color cycle: grey -> red -> green -> grey
      newColors[row][col] =
        currentColor === 'grey' ? 'red' : currentColor === 'red' ? 'green' : 'grey';
      return newColors;
    });
  };

  /** SAVE PUZZLE STATE TO FLASK */
  const savePuzzleState = useCallback(async () => {
    const puzzleData = {
      squares: colors,  // Updated square colors
      nodes: path,      // Updated nodes (path)
      edges: []         // Future: Store edges here
    };
  
    try {
      const response = await fetch('http://127.0.0.1:5000/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(puzzleData)
      });
  
      const result = await response.json();
      console.log("Saved puzzle state:", result.message);
    } catch (error) {
      console.error("Error saving puzzle:", error);
    }
  }, [colors, path]);  // Save when colors or path change

   /** LOAD PUZZLE STATE FROM FLASK */
  const loadPuzzleState = useCallback(async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/load');
      const data = await response.json();
  
      // console.log("Fetched puzzle state:", data); // Debugging output
  
      // Only update if Flask returns valid data
      if (data.squares && data.squares.length > 0) {
        setColors(data.squares);
      }
  
      if (data.nodes && data.nodes.length > 0) {
        setPath(data.nodes);
      }
  
    } catch (error) {
      console.error("Error loading puzzle:", error);
    }
  }, []);

    /** Automatically save when colors or path change */
    useEffect(() => {
      savePuzzleState(); // Automatically save when colors or path change
    }, [savePuzzleState]); 
  
  return (
    <div
      style={{
        position: 'relative',
        backgroundColor: '#333',
        width: `${width * 85}px`,
        height: `${height * 85}px`,
      }}
    >
      {/* Square spacing */}
      <div
        style={{
          position: 'absolute',
          display: 'grid',
          gridTemplateColumns: `repeat(${width}, 70px)`,
          gridTemplateRows: `repeat(${height}, 70px)`,
          gridGap: '40px',  // Adds space between the squares
          top: '-10px', // Adjust squares' position vertically
          left: '-10px', // Adjust squares' position horizontally
        }}
      >
        {Array.from({ length: height }).map((_, cellRow) =>
          Array.from({ length: width }).map((_, cellCol) => (
            <div
              key={`cell-${cellRow}-${cellCol}`}
              onClick={() => handleNodeClick(cellRow, cellCol)}
              onMouseEnter={() => handleMouseEnter(cellRow, cellCol)}
              onContextMenu={(e) => handleRightClick(e, cellRow, cellCol)} // Right-click to change color
              style={{
                backgroundColor: colors[cellRow][cellCol], // Use color state
                width: '70px',  // Square width
                height: '70px', // Square height
                cursor: 'pointer',
              }}
            />
          ))
        )}
      </div>

      {/* Node Spacing */}
      <div
        style={{
          position: 'absolute',
          top: '-35px',  // Move all nodes down on the page
          left: '-35px', // Move all nodes right on the page
        }}
      >
        {Array.from({ length: height + 1 }).map((_, row) =>
          Array.from({ length: width + 1 }).map((_, col) => {
            const isInPath = isNodeInPath(row, col);
            return (
              <div
                key={`node-${row}-${col}`}
                onClick={() => handleNodeClick(row, col)}
                onMouseEnter={() => handleMouseEnter(row, col)}
                style={{
                  width: '10px',
                  height: '10px',
                  backgroundColor: isInPath ? 'white' : 'black', //Node color 
                  borderRadius: '50%',
                  position: 'absolute',
                  top: row * 110, // Node spacing relative to the rest of the nodes (row) 
                  left: col * 110, // Node spacing relative to the rest of the nodes (column)
                  cursor: 'pointer',
                }}
              />
            );
          })
        )}
      </div>

        {/* Path spacing */}
        <div
          style={{
            position: 'absolute',
            top: '-35px',  // Move all path lines down on the page (same offset as nodes)
            left: '-35px', // Move all path lines right on the page (same offset as nodes)
          }}
        >
          {path.map((node, index) => {
            if (index === 0) return null;
            const prevNode = path[index - 1];
            const isHorizontal = node.row === prevNode.row;
            const isVertical = node.col === prevNode.col;

            if (!isHorizontal && !isVertical) return null;

            const x1 = prevNode.col * 110; // Path spacing should match node spacing (column) 
            const y1 = prevNode.row * 110; // Path spacing should match node spacing (row) 
            const x2 = node.col * 110;
            const y2 = node.row * 110;

            return (
              <div
                key={`line-${index}`}
                style={{
                  position: 'absolute',
                  backgroundColor: 'white', // Path color 
                  top: Math.min(y1, y2), 
                  left: Math.min(x1, x2),
                  width: isHorizontal ? Math.abs(x2 - x1) : 5,
                  height: isVertical ? Math.abs(y2 - y1) : 5,
                }}
              />
            );
          })}
        </div>

    </div>
  );
};

export default Grid;

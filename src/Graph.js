import React, { useState, useEffect, useCallback } from 'react';

const Grid = ({ width, height }) => {
  const [path, setPath] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [mode, setMode] = useState('color'); // 'color' or 'star'

  // Store the color of each square in a 2D array
  const [colors, setColors] = useState(
    Array.from({ length: height }).map(() => Array(width).fill('grey'))  // Default color is grey - square has no rule
  );

  // Store star state (true/false) for each square
  const [stars, setStars] = useState(
    Array.from({ length: height }).map(() => Array(width).fill(false))
  );

  // Manually set the Start and Finish nodes here (for nodes, not squares) - SOURCE and SINK
  const [startNode, setStartNode] = useState({ row: 4, col: 0 });  // For example, (0, 0) is the first node in any graph
  const [finishNode, setFinishNode] = useState({ row: 0, col: 4 }); // For example, (4, 4) is the final node in a 4x4

  // Track if start and finish nodes are reached
  const [startReached, setStartReached] = useState(false);
  const [finishReached, setFinishReached] = useState(false);

  // Handle keyboard shortcuts to switch between color and star mode
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key.toLowerCase() === 's') {
        setMode('star');  // Activate star mode
      } else if (e.key.toLowerCase() === 'c') {
        setMode('color'); // Activate color mode
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Save puzzle state to backend whenever path, color, or star updates
  useEffect(() => {
    const squares = colors.map((row, i) =>
      row.map((color, j) => ({
        color,
        hasStar: stars[i][j]
      }))
    );

    const puzzleData = {
      squares,
      nodes: path
    };

    fetch('http://127.0.0.1:5000/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(puzzleData)
    }).catch(console.error);
  }, [path, colors, stars]);

  const handleNodeClick = (row, col) => {
    if (!isDrawing) { 
      // Start drawing
      setPath([{ row, col }]);
      setIsDrawing(true);
    } else {
      // Stop drawing
      setIsDrawing(false);
    }

    // If the start or finish node is clicked, mark it as reached
    if (row === startNode.row && col === startNode.col) {
      setStartReached(true);
    }
    if (row === finishNode.row && col === finishNode.col) {
      setFinishReached(true);
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

      // If the start or finish node is reached while following the path, mark as reached
      if (row === startNode.row && col === startNode.col) {
        setStartReached(true);
      }
      if (row === finishNode.row && col === finishNode.col) {
        setFinishReached(true);
      }
    }
  };

  const isNodeInPath = (row, col) =>
    path.some((node) => node.row === row && node.col === col);

  // Unified left click handler based on current mode
  const handleCellClick = (row, col) => {
    if (mode === 'color') {
      setColors((prevColors) => {
        const colorCycle = ['grey', 'red', 'green', 'purple', 'blue', 'yellow', 'orange'];

        // Deep copy the full grid
        const newColors = prevColors.map((row) => [...row]);

        const currentColor = newColors[row][col];
        const currentIndex = colorCycle.indexOf(currentColor);
        const nextIndex = (currentIndex + 1) % colorCycle.length;

        newColors[row][col] = colorCycle[nextIndex];
        return newColors;
      });
    } else if (mode === 'star') {
      setStars((prevStars) => {
        const newStars = prevStars.map((r) => [...r]);
        newStars[row][col] = !newStars[row][col];
        return newStars;
      });
    }
  };

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
          gridGap: '40px',
          top: '-10px',
          left: '-10px',
        }}
      >
        {Array.from({ length: height }).map((_, cellRow) =>
          Array.from({ length: width }).map((_, cellCol) => (
            <div
              key={`cell-${cellRow}-${cellCol}`}
              onClick={() => handleCellClick(cellRow, cellCol)}
              onMouseEnter={() => handleMouseEnter(cellRow, cellCol)}
              style={{
                backgroundColor: colors[cellRow][cellCol],
                width: '70px',
                height: '70px',
                cursor: 'pointer',
                position: 'relative',
              }}
            >
              {stars[cellRow][cellCol] && (
                <img
                  src="orange_star_extracted.png"   // When it works
                  alt="Star"                        // When it's broken
                  style={{
                    position: 'absolute',
                    width: '75px',          // Star size
                    height: '75px',         // Star spacing 
                    top: '-2.5px',
                    left: '-2.5px',
                    pointerEvents: 'none', // allows clicking through the image
                  }}
                />
              )}
            </div>
          ))
        )}
      </div>

      {/* Node Spacing */}
      <div
        style={{
          position: 'absolute',
          top: '-35px',
          left: '-35px',
        }}
      >
        {Array.from({ length: height + 1 }).map((_, row) =>
          Array.from({ length: width + 1 }).map((_, col) => {
            const isInPath = isNodeInPath(row, col);
            const isStart = startNode.row === row && startNode.col === col;
            const isFinish = finishNode.row === row && finishNode.col === col;

            return (
              <div
                key={`node-${row}-${col}`}
                onClick={() => handleNodeClick(row, col)}
                onMouseEnter={() => handleMouseEnter(row, col)}
                style={{
                  // Default size for nodes
                  width: '10px',
                  height: '10px',
                  backgroundColor: isInPath ? 'white' : 'black',
                  borderRadius: '50%',
                  position: 'absolute',
                  top: row * 110,
                  left: col * 110,
                  cursor: 'pointer',
                  // Make the start and finish nodes larger and shift them up/left by 10px
                  ...(isStart || isFinish ? { 
                    width: '30px', 
                    height: '30px', 
                    top: row * 110 - 10,  // Shift up
                    left: col * 110 - 10, // Shift left
                  } : {}),
                }}
              >
                {/* Start Node */}
                {isStart && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '50%',  // Vertically center
                      left: '50%', // Horizontally center
                      transform: 'translate(-50%, -50%)',  // Perfect centering
                      fontSize: '12px',
                      color: startReached ? 'black' : 'white',  // Change color based on state
                      zIndex: 10,  // Ensure it's on top of the path
                    }}
                  >
                    S
                  </div>
                )}
                {/* Finish Node */}
                {isFinish && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '50%',  // Vertically center
                      left: '50%', // Horizontally center
                      transform: 'translate(-50%, -50%)',  // Perfect centering
                      fontSize: '12px',
                      color: finishReached ? 'black' : 'white',  // Change color based on state
                      zIndex: 10,  // Ensure it's on top of the path
                    }}
                  >
                    F
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Path spacing */}
      <div
        style={{
          position: 'absolute',
          top: '-35px',
          left: '-35px',
        }}
      >
        {path.map((node, index) => {
          if (index === 0) return null;
          const prevNode = path[index - 1];
          const isHorizontal = node.row === prevNode.row;
          const isVertical = node.col === prevNode.col;

          if (!isHorizontal && !isVertical) return null;

          const x1 = prevNode.col * 110;
          const y1 = prevNode.row * 110;
          const x2 = node.col * 110;
          const y2 = node.row * 110;

          return (
            <div
              key={`line-${index}`}
              style={{
                position: 'absolute',
                backgroundColor: 'white',
                top: Math.min(y1, y2),
                left: Math.min(x1, x2),
                width: isHorizontal ? Math.abs(x2 - x1) : 5,
                height: isVertical ? Math.abs(y2 - y1) : 5,
                zIndex: 1, // Ensure path is below the start/finish labels
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

export default Grid;

import React, { useState, useEffect, useCallback } from 'react';

const Grid = ({ width, height }) => {
  const [path, setPath] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [mode, setMode] = useState('color'); // 'color' or 'star'
  const [edgeColor, setEdgeColor] = useState('white'); 
  const [nodeHighlightColor, setNodeHighlightColor] = useState('white');

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
      const key = e.key.toLowerCase();
  
      if (key === 's') {
        setMode('star');
      } else if (key === 'c') {
        setMode('color');
      } else if (key === 'k') {
        if (isDrawing || path.length > 0) {
          setPath([]);
          setIsDrawing(false);
          setStartReached(false);
          setFinishReached(false);
          setEdgeColor('white');
          setNodeHighlightColor('white');
        }        
      } else if (key === 'z') {
        if (path.length > 1) {
          const newPath = [...path];
          newPath.pop();
          setPath(newPath);
        } else if (path.length === 1) {
          setPath([path[0]]);
        }
      }
    };
  
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDrawing, path]);
  
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

  const handleNodeClick = async (row, col) => {
    const isStart = row === startNode.row && col === startNode.col;
    const isFinish = row === finishNode.row && col === finishNode.col;
  
    if (!isDrawing) {
      // Only allow the path to begin from the start node
      if (isStart) {
        setPath([{ row, col }]);
        setIsDrawing(true);
        setStartReached(true);
        setFinishReached(false);           
        setNodeHighlightColor('white');    
      }
    } else {
      if (isFinish) {
        // Temporarily add the finish node to the path
        const updatedPath = [...path, { row, col }];
        setPath(updatedPath);
        setFinishReached(true);
        setIsDrawing(false);
  
        // Fetch validation result from backend
        try {
          const res = await fetch('http://127.0.0.1:5000/load');
          const data = await res.json();
  
          // If solution is invalid, clear the path
          if (!data.valid_solution) {
            const flashSequenceInvalid = ['white', 'red', 'white', 'red', 'white', 'red', 'white'];
            flashSequenceInvalid.forEach((color, i) => {
              setTimeout(() => {
                setEdgeColor(color);
                setNodeHighlightColor(color);
              }, i * 200);  // Should match valid timing 
            });

            // Clear after flashing ends
            setTimeout(() => {
              setPath([]);
              setStartReached(false);
              setFinishReached(false);
              setEdgeColor('white');
              setNodeHighlightColor('white');
            }, flashSequenceInvalid.length * 200); // Should match invalid timing 
          }
           else {
            // Trigger flashing animation
            const flashSequenceValid = ['white', 'green', 'white', 'green', 'white', 'green', 'white'];
            flashSequenceValid.forEach((color, i) => {
              setTimeout(() => {
                setEdgeColor(color);
                setNodeHighlightColor(color);
              }, i * 200);          //Time between flashes, currently 200 ms
            });            
          }
        } catch (err) {
          console.error("Error validating solution:", err);
  
          // Clear the path on server error as a fallback
          setPath([]);
          setStartReached(false);
          setFinishReached(false);
        }
  
      } else {
        // Clicked a non-finish node while drawing; clear the path
        setPath([]);
        setIsDrawing(false);
        setStartReached(false);
        setFinishReached(false);
      }
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
                  backgroundColor:
                  isStart
                    ? (startReached ? nodeHighlightColor : 'black')
                    : isFinish
                    ? (finishReached ? nodeHighlightColor : 'black')
                    : (isInPath ? edgeColor : 'black'),
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
                backgroundColor: edgeColor,
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

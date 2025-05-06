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

  // Unified left click handler based on current mode
  const handleCellClick = (row, col) => {
    if (mode === 'color') {
      setColors((prevColors) => {
        const colorCycle = ['grey', 'red', 'green', 'purple', 'blue', 'yellow'];
  
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
  

  /** SAVE PUZZLE STATE TO FLASK */
  const savePuzzleState = useCallback(async () => {
    const puzzleData = {
      squares: colors.map((row, i) =>
        row.map((color, j) => ({
          color,
          hasStar: stars[i][j],
        }))
      ),
      nodes: path,
      edges: []  // Optional: could store explicit edge list here
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
  }, [colors, stars, path]);

  /** LOAD PUZZLE STATE FROM FLASK */
  const loadPuzzleState = useCallback(async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/load');
      const data = await response.json();

      if (data.squares && data.squares.length > 0) {
        setColors(data.squares.map(row =>
          row.map(cell =>
            typeof cell === 'object' && 'color' in cell ? cell.color : 'grey'
          )
        ));
        setStars(data.squares.map(row => row.map(cell => typeof cell === 'object' && cell.hasStar)));
      }

      if (data.nodes && data.nodes.length > 0) {
        setPath(data.nodes);
      }

    } catch (error) {
      console.error("Error loading puzzle:", error);
    }
  }, []);

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
                  src="orange_star_extracted.png"   //When it works
                  alt="Star"                        //When it's broken
                  style={{
                    position: 'absolute',
                    width: '75px',          //Star size
                    height: '75px',         //Star spacing 
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
            return (
              <div
                key={`node-${row}-${col}`}
                onClick={() => handleNodeClick(row, col)}
                onMouseEnter={() => handleMouseEnter(row, col)}
                style={{
                  width: '10px',
                  height: '10px',
                  backgroundColor: isInPath ? 'white' : 'black',
                  borderRadius: '50%',
                  position: 'absolute',
                  top: row * 110,
                  left: col * 110,
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
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

export default Grid;

// Updated Graph.js
import React, { useState, useEffect } from 'react';

const Grid = ({ width, height, initialSquares = [], initialNodes = [], startNode: initialStartNode, finishNode: initialFinishNode }) => {
  const [path, setPath] = useState(initialNodes);
  const [isDrawing, setIsDrawing] = useState(false);
  const [mode, setMode] = useState('color'); // 'color' or 'star' or 'not'
  const [edgeColor, setEdgeColor] = useState('white'); 
  const [nodeHighlightColor, setNodeHighlightColor] = useState('white');

  // Initialize colors, stars, and not-symbols from initialSquares
  const [colors, setColors] = useState(
    initialSquares.length > 0
      ? initialSquares.map(row => row.map(cell => cell.color || 'grey'))
      : Array.from({ length: height }).map(() => Array(width).fill('grey'))
  );

  const [stars, setStars] = useState(
    initialSquares.length > 0
      ? initialSquares.map(row => row.map(cell => cell.starColor || null))
      : Array.from({ length: height }).map(() => Array(width).fill(null))
  );

  const [nots, setNots] = useState(
    initialSquares.length > 0
      ? initialSquares.map(row => row.map(cell => cell.hasNot || false))
      : Array.from({ length: height }).map(() => Array(width).fill(false))
  );

  // Manually set the Start and Finish nodes here (for nodes, not squares) - SOURCE and SINK
  const [startNode] = useState(initialStartNode || { row: height, col: 0 });
  const [finishNode] = useState(initialFinishNode || { row: 0, col: width });
  
  const [startReached, setStartReached] = useState(false);
  const [finishReached, setFinishReached] = useState(false);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();

      if (key === 's') {
        setMode('star');
      } else if (key === 'c') {
        setMode('color');
      } else if (key === 'n') {
        setMode('not');
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

  // Save puzzle state to backend
  useEffect(() => {
    const squares = colors.map((row, i) =>
      row.map((color, j) => ({
        color,
        starColor: stars[i][j],
        hasNot: nots[i][j]
      }))
    );

    const puzzleData = {
      squares,
      nodes: path,
      height,
      width,
      startNode,
      finishNode
    };

    fetch('http://127.0.0.1:5000/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(puzzleData)
    }).catch(console.error);
  }, [path, colors, stars, nots, height, width]);

  const handleNodeClick = async (row, col) => {
    const isStart = row === startNode.row && col === startNode.col;
    const isFinish = row === finishNode.row && col === finishNode.col;

    if (!isDrawing) {
      if (isStart) {
        setPath([{ row, col }]);
        setIsDrawing(true);
        setStartReached(true);
        setFinishReached(false);
        setNodeHighlightColor('white');
      }
    } else {
      if (isFinish) {
        if (path.length === 0 || !(path[path.length - 1].row === row && path[path.length - 1].col === col)) {
          const updatedPath = [...path, { row, col }];
          setPath(updatedPath);
        }

        setFinishReached(true);
        setIsDrawing(false);

        try {
          const res = await fetch('http://127.0.0.1:5000/load');
          const data = await res.json();

          if (!data.valid_solution) {
            const flashSequence = ['white', 'red', 'white', 'red', 'white', 'red', 'white'];
            flashSequence.forEach((color, i) => {
              setTimeout(() => {
                setEdgeColor(color);
                setNodeHighlightColor(color);
              }, i * 200);
            });
            setTimeout(() => {
              setPath([]);
              setStartReached(false);
              setFinishReached(false);
              setEdgeColor('white');
              setNodeHighlightColor('white');
            }, flashSequence.length * 200);
          } else {
            const flashSequence = ['white', 'green', 'white', 'green', 'white', 'green', 'white'];
            flashSequence.forEach((color, i) => {
              setTimeout(() => {
                setEdgeColor(color);
                setNodeHighlightColor(color);
              }, i * 200);
            });
          }
        } catch (err) {
          console.error("Error validating solution:", err);
          setPath([]);
          setStartReached(false);
          setFinishReached(false);
        }
      } else {
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

      if (row === startNode.row && col === startNode.col) setStartReached(true);
      if (row === finishNode.row && col === finishNode.col) setFinishReached(true);
    }
  };

  const isNodeInPath = (row, col) =>
    path.some((node) => node.row === row && node.col === col);

  const handleCellClick = (row, col) => {
    if (mode === 'color') {
      setColors((prevColors) => {
        const colorCycle = ['grey', 'red', 'green', 'purple', 'blue', 'yellow', 'orange', 'pink'];
        const newColors = prevColors.map((row) => [...row]);
        const currentColor = newColors[row][col];
        const nextColor = colorCycle[(colorCycle.indexOf(currentColor) + 1) % colorCycle.length];
        newColors[row][col] = nextColor;
        return newColors;
      });
    } else if (mode === 'star') {
      setStars((prevStars) => {
        const cycle = [null, 'orange', 'green', 'purple'];
        const newStars = prevStars.map((r) => [...r]);
        const current = newStars[row][col];
        const next = cycle[(cycle.indexOf(current) + 1) % cycle.length];
        newStars[row][col] = next;
        return newStars;
      });
    } else if (mode === 'not') {
      setNots((prevNots) => {
        const newNots = prevNots.map((r) => [...r]);
        newNots[row][col] = !newNots[row][col];
        return newNots;
      });
    }
  };

  return (
    <div style={{
      position: 'relative',
      backgroundColor: '#333',
      width: `${width * 85}px`,
      height: `${height * 85}px`,
    }}>
      {/* Square spacing */}
      <div style={{
        position: 'absolute',
        display: 'grid',
        gridTemplateColumns: `repeat(${width}, 70px)`,
        gridTemplateRows: `repeat(${height}, 70px)`,
        gridGap: '40px',
        top: '-10px',
        left: '-10px',
      }}>
        {colors.map((row, r) =>
          row.map((_, c) => (
            <div
              key={`cell-${r}-${c}`}
              onClick={() => handleCellClick(r, c)}
              onMouseEnter={() => handleMouseEnter(r, c)}
              style={{
                backgroundColor: colors[r][c],
                width: '70px',
                height: '70px',
                cursor: 'pointer',
                position: 'relative',
              }}>
              {stars[r][c] && (
                <img
                  src={`/${stars[r][c]}_star.png`}
                  alt={`${stars[r][c]} star`}
                  style={{
                    position: 'absolute',
                    width: '75px',
                    height: '75px',
                    top: '-2.5px',
                    left: '-2.5px',
                    pointerEvents: 'none',
                  }}
                />
              )}
              {nots[r][c] && (
                <img
                  src="/not_symbol.png"
                  alt="Not Symbol"
                  style={{
                    position: 'absolute',
                    width: '60px',
                    height: '60px',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    pointerEvents: 'none',
                    opacity: 0.85  // optional: slight transparency
                  }}
                />
              )}
            </div>
          ))
        )}
      </div>

      {/* Node Spacing */}
      <div style={{ position: 'absolute', top: '-35px', left: '-35px' }}>
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
                  width: isStart || isFinish ? '30px' : '10px',
                  height: isStart || isFinish ? '30px' : '10px',
                  backgroundColor: isStart
                    ? (startReached ? nodeHighlightColor : 'black')
                    : isFinish
                    ? (finishReached ? nodeHighlightColor : 'black')
                    : (isInPath ? edgeColor : 'black'),
                  borderRadius: '50%',
                  position: 'absolute',
                  top: row * 110 + (isStart || isFinish ? -10 : 0),
                  left: col * 110 + (isStart || isFinish ? -10 : 0),
                  cursor: 'pointer',
                }}>
                {isStart && <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '12px', color: startReached ? 'black' : 'white', zIndex: 10 }}>S</div>}
                {isFinish && <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '12px', color: finishReached ? 'black' : 'white', zIndex: 10 }}>F</div>}
              </div>
            );
          })
        )}
      </div>

      {/* Path spacing */}
      <div style={{ position: 'absolute', top: '-35px', left: '-35px' }}>
        {path.map((node, index) => {
          if (index === 0) return null;
          const prev = path[index - 1];
          const x1 = prev.col * 110;
          const y1 = prev.row * 110;
          const x2 = node.col * 110;
          const y2 = node.row * 110;
          const isH = prev.row === node.row;
          const isV = prev.col === node.col;
          if (!isH && !isV) return null;

          return (
            <div
              key={`line-${index}`}
              style={{
                position: 'absolute',
                backgroundColor: edgeColor,
                top: Math.min(y1, y2),
                left: Math.min(x1, x2),
                width: isH ? Math.abs(x2 - x1) : 5,
                height: isV ? Math.abs(y2 - y1) : 5,
                zIndex: 1,
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

export default Grid;

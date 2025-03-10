import React, { useState } from 'react';

const Grid = ({ width, height }) => {
  const [path, setPath] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);

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

  return (
    <div
      style={{
        position: 'relative',
        display: 'grid',
        gridTemplateColumns: `repeat(${width * 2 - 1}, 30px)`,
        gridTemplateRows: `repeat(${height * 2 - 1}, 30px)`,
        backgroundColor: '#333',
      }}
    >
      {Array.from({ length: height }).map((_, cellRow) =>
        Array.from({ length: width }).map((_, cellCol) => (
          <div
            key={`cell-${cellRow}-${cellCol}`}
            style={{
              gridColumn: cellCol * 2 + 2,
              gridRow: cellRow * 2 + 2,
              backgroundColor: 'gray',
              width: '30px',
              height: '30px',
            }}
          />
        ))
      )}

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
                backgroundColor: isInPath ? 'blue' : 'black',
                borderRadius: '50%',
                position: 'absolute',
                top: row * 30 - 5 + row * 30,
                left: col * 30 - 5 + col * 30,
                cursor: 'pointer',
              }}
            />
          );
        })
      )}

      {path.map((node, index) => {
        if (index === 0) return null;
        const prevNode = path[index - 1];
        const isHorizontal = node.row === prevNode.row;
        const isVertical = node.col === prevNode.col;

        if (!isHorizontal && !isVertical) return null;

        const x1 = prevNode.col * 1000 + prevNode.col * 1000 + 5;
        const y1 = prevNode.row * 1000 + prevNode.row * 1000 + 5;
        const x2 = node.col * 1000 + node.col * 1000 + 5;
        const y2 = node.row * 1000 + node.row * 1000 + 5;

        return (
          <div
            key={`line-${index}`}
            style={{
              position: 'absolute',
              backgroundColor: 'blue',
              top: Math.min(y1, y2),
              left: Math.min(x1, x2),
              width: isHorizontal ? Math.abs(x2 - x1) : 5,
              height: isVertical ? Math.abs(y2 - y1) : 5,
            }}
          />
        );
      })}
    </div>
  );
};

export default Grid;

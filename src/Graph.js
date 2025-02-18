import React, { useState, useEffect } from 'react';

const Grid = ({ width, height }) => {
  const [grid, setGrid] = useState(
    Array(height).fill(Array(width).fill('empty'))
  );

  useEffect(() => {
    // Reinitialize the grid when width or height changes
    setGrid(Array(height).fill(Array(width).fill('empty')));
  }, [width, height]);

  const handleCellClick = (rowIndex, colIndex) => {
    const newGrid = grid.map((row, rIdx) =>
      row.map((cell, cIdx) =>
        rIdx === rowIndex && cIdx === colIndex ? 'filled' : cell
      )
    );
    setGrid(newGrid);
  };

  return (
    <div 
      className="grid" 
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${width}, 1fr)`,
        gap: '1px',
        width: 'max-content',
        margin: 'auto',
        backgroundColor: 'black',
      }}
    >
      {grid.map((row, rowIndex) =>
        row.map((cell, colIndex) => (
          <div
            key={`${rowIndex}-${colIndex}`}
            onClick={() => handleCellClick(rowIndex, colIndex)}
            style={{
              width: '50px',
              height: '50px',
              backgroundColor: cell === 'filled' ? 'blue' : 'gray',
            }}
          ></div>
        ))
      )}
    </div>
  );
};

export default Grid;

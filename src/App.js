import React, { useState, useEffect } from 'react';
import Grid from './Graph';

function App() {
  const [width] = useState(4);
  const [height] = useState(4);

  const [path, setPath] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [mode, setMode] = useState('color'); // 'color' or 'star'

  // Store the color of each square in a 2D array
  const [colors, setColors] = useState(
    Array.from({ length: height }).map(() => Array(width).fill('grey'))  // Default color is grey
  );

  // Send the updated puzzle state to Flask
  const savePuzzleState = () => {
    const dataToSend = {
      squares: colors, // Or your updated state for squares
      nodes: path,     // The nodes you are drawing
    };

    fetch('http://localhost:5000/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dataToSend),
    })
      .then(response => response.json())
      .then(data => {
        console.log("Puzzle state saved:", data);
      })
      .catch(error => {
        console.error("Error saving puzzle state:", error);
      });
  };


  useEffect(() => {
    // Save puzzle state whenever path or color changes
    savePuzzleState();
  }, [path, colors]);  // Dependencies for when state changes

  return (
    <div className="App" style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'flex-start',  
      height: '100vh', 
      margin: 0 
    }}>
      {/* Puzzle Generator Title */}
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ color: 'white' }}>The Witness Puzzle Generator</h1>
      </div>

      {/* Grid initialization and placement */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-start',
          paddingRight: '55px',
          marginTop: '75px',  // Add marginTop to lower the grid
        }}
      >
        <Grid width={width} height={height} />
      </div>
    </div>
  );
}

export default App;

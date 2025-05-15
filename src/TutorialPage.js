// TutorialPage.js
import React, { useState } from 'react';
import Grid from './Graph'; // Main puzzle component

const TutorialPage = () => {
  const [puzzleData, setPuzzleData] = useState(null);  // Loaded puzzle data
  const [puzzleIndex, setPuzzleIndex] = useState(null); // Track puzzle number
  const [error, setError] = useState(null);            // Error messages

  // Load puzzle JSON from public/tutorial/puzzleN.json
  const handleLoadPuzzle = async (index) => {
    try {
      const res = await fetch(`/tutorial/puzzle${index}.json`);
      if (!res.ok) throw new Error('Puzzle not found');
      const data = await res.json();
      setPuzzleData(data);
      setPuzzleIndex(index); // Save number separately
      setError(null);
    } catch (err) {
      setPuzzleData(null);
      setPuzzleIndex(null);
      setError(`Puzzle ${index} hasn't been added yet.`);
    }
  };

  const handleBackToMenu = () => {
    setPuzzleData(null);
    setPuzzleIndex(null);
    setError(null);
  };

  // === Puzzle view ===
  if (puzzleData) {
    return (
      <div style={{ backgroundColor: '#333', height: '100vh', position: 'relative' }}>
        {/* Top navigation bar with back button and puzzle number */}
        <div style={{ 
          position: 'fixed',
          top: '20px',
          left: '20px',
          right: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <button
            onClick={handleBackToMenu}
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            ← Back to Puzzle Library
          </button>

          {puzzleIndex !== null && (
            <div style={{ color: 'white', fontSize: '16px', fontWeight: 'bold' }}>
              Puzzle {puzzleIndex}
            </div>
          )}
        </div>

        {/* Centered puzzle grid */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
        }}>
          <Grid
            width={puzzleData.width}
            height={puzzleData.height}
            initialSquares={puzzleData.squares}
            initialNodes={puzzleData.nodes}
            startNode={puzzleData.startNode}
            finishNode={puzzleData.finishNode}
          />
        </div>
      </div>
    );
  }

  // === Puzzle list view ===
  return (
    <div style={{ color: 'white', padding: '40px', textAlign: 'center' }}>
      <h2>Color Puzzles</h2>

      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '10px',
        marginTop: '20px',
        marginBottom: '30px'
      }}>
        {Array.from({ length: 10 }, (_, i) => (
          <button
            key={i + 1}
            onClick={() => handleLoadPuzzle(i + 1)}
            style={{
              padding: '10px 15px',
              fontSize: '14px',
              cursor: 'pointer',
              minWidth: '100px',
              textAlign: 'center'
            }}
          >
            Puzzle {i + 1}
          </button>
        ))}
      </div>

      <h2>Star Puzzles</h2>

      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '10px',
        marginTop: '20px',
        marginBottom: '30px'
      }}>
        {Array.from({ length: 10 }, (_, i) => (
          <button
            key={i + 11}
            onClick={() => handleLoadPuzzle(i + 11)}
            style={{
              padding: '10px 15px',
              fontSize: '14px',
              cursor: 'pointer',
              minWidth: '100px',
              textAlign: 'center'
            }}
          >
            Puzzle {i + 11}
          </button>
        ))}
      </div>

      <h2>NOT Puzzles</h2>

      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '10px',
        marginTop: '20px',
        marginBottom: '30px'
      }}>
        {Array.from({ length: 10 }, (_, i) => (
          <button
            key={i + 21}
            onClick={() => handleLoadPuzzle(i + 21)}
            style={{
              padding: '10px 15px',
              fontSize: '14px',
              cursor: 'pointer',
              minWidth: '100px',
              textAlign: 'center'
            }}
          >
            Puzzle {i + 21}
          </button>
        ))}
      </div>

      {error && (
        <p style={{ marginTop: '20px', color: 'red' }}>
          {error}
        </p>
      )}
    </div>
  );
};

export default TutorialPage;

import React from 'react';
import Grid from './Graph';

// Set the NxM grid size - main thing this file does. 
function App() {
  const width = 4;
  const height = 4;

  return (
    <div className="App" style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'flex-start',  
      height: '100vh', 
      margin: 0 
    }}>
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ color: 'white' }}>The Witness Puzzle Generator</h1>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-start',
          paddingRight: '55px',
          marginTop: '75px',
        }}
      >
        <Grid width={width} height={height} />
      </div>
    </div>
  );
}

export default App;

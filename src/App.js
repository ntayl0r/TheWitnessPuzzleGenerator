import React, { useState } from 'react';
import Grid from './Graph';

function App() {
  const [width] = useState(5);
  const [height] = useState(5);

  return (
    <div className="App">
      <div style={{ textAlign: 'center', marginTop: '10x' }}>
        <h1 style={{ color: 'white' }}>Puzzle Generator</h1>
      </div>
      <div 
      //Grid initialization placing
      style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '40px', paddingRight: '55px' } }> 
        <Grid width={width} height={height} />
      </div>
    </div>
  );
}

export default App;

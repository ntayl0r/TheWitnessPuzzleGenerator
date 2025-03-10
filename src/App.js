import React, { useState } from 'react';
import Grid from './Graph';

function App() {
  const [width] = useState(4);
  const [height] = useState(4);

  return (
    <div className="App">
      <h1 style={{ textAlign: 'center', color: 'white' }}>Puzzle Generator</h1>
      <Grid width={width} height={height} />
    </div>
  );
}

export default App;

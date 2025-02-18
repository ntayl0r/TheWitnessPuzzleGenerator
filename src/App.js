import React, { useState } from 'react';
import Grid from './Graph';  

function App() {
  // Width and height handled here for now
  const [width] = useState(3);
  const [height] = useState(3);

  return (
    <div className="App">
      <h1>Puzzle Generator</h1>
      {/* Pass the width and height to Grid */}
      <Grid width={width} height={height} />
    </div>
  );
}

export default App;

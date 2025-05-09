import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Grid from './Graph';
import TutorialPage from './TutorialPage';

// Set the NxM grid size
function App() {
  const width = 4;
  const height = 4;

  return (
    <Router>
      <div className="App" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        height: '100vh',
        margin: 0
      }}>
        {/* App Header */}
        <div style={{ marginBottom: '20px' }}>
          <h1 style={{ color: 'white' }}>The Witness Puzzle Generator</h1>

          {/* Navigation Links */}
          <div style={{ marginTop: '10px' }}>
            <Link to="/" style={{ color: 'white', marginRight: '20px' }}>Sandbox</Link>
            <Link to="/tutorial" style={{ color: 'white' }}>Puzzle Library</Link>
          </div>
        </div>

        {/* Routes to different pages */}
        <Routes>
          <Route
            path="/"
            element={
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-start',
                  paddingRight: '55px',
                  marginTop: '50px',
                }}
              >
                <Grid width={width} height={height} />
              </div>
            }
          />
          <Route
            path="/tutorial"
            element={<TutorialPage width={width} height={height} />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

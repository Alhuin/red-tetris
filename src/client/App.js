import React from 'react';
import './App.css';
import { Route, Routes } from 'react-router-dom';
import Root from './store';
import Tetris from './components/Tetris';
import ErrorBoundary from './components/ErrorBoundaries';
import Home from './components/Home';

function App() {
  return (
    <Root>
      <ErrorBoundary>
        <Routes>
          <Route
            path="/:roomName[:username]"
            element={<Tetris />}
          />
          <Route exact path="/" element={<Home />} />
        </Routes>
      </ErrorBoundary>
    </Root>
  );
}

export default App;

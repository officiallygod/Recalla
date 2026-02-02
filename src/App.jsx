import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GameProvider } from './contexts/GameContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/Layout';
import Home from './screens/Home';
import AddWord from './screens/AddWord';
import WordsList from './screens/WordsList';
import Game from './screens/Game';
import Statistics from './screens/Statistics';

function App() {
  return (
    <ThemeProvider>
      <GameProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/add-word" element={<AddWord />} />
              <Route path="/words" element={<WordsList />} />
              <Route path="/game" element={<Game />} />
              <Route path="/stats" element={<Statistics />} />
            </Routes>
          </Layout>
        </Router>
      </GameProvider>
    </ThemeProvider>
  );
}

export default App;

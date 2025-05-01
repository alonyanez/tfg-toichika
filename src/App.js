import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import TableroCasual from './components/Tablero/TableroCasual';
import TableroCompetitivo from './components/Tablero/TableroCompetitivo';
import Ranking from './components/Tablero/RankingCompetitivo';

function App() {
  return (
    <Router>
      <div className="App">
        <nav style={{ display: 'flex', gap: '1rem', padding: '1rem' }}>
          <Link to="/casual"><button>Tablero Casual</button></Link>
          <Link to="/competitivo"><button>Tablero Competitivo</button></Link>
          <Link to="/ranking"><button>Ranking Competitivo</button></Link>
        </nav>

        <Routes>
          <Route path="/casual" element={<TableroCasual />} />
          <Route path="/competitivo" element={<TableroCompetitivo />} />
          <Route path="/ranking" element={<Ranking />} />
          <Route path="*" element={<h1 style={{ textAlign: 'center', margin: '10px 0' }}>Selecciona un modo de juego</h1>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
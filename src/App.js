import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import TableroCasual from './components/Tablero/TableroCasual';
import TableroCompetitivo from './components/Tablero/TableroCompetitivo';
import Ranking from './components/Tablero/RankingCompetitivo';

function App() {
  return (
    <Router>
      <div className="App">
         
          <nav className="nav">
              <Link to="/casual"><button style={{ 
                    marginRight: 10, 
                    marginTop: 10,
                    padding: '8px 16px', 
                    cursor: 'pointer', 
                    backgroundColor: '#5A5A5A',
                    color:'#FAF9F7', 
                    fontWeight: 'bold',
                    borderRadius: '15px' }}
                >Tablero Casual</button></Link>
              <Link to="/competitivo"><button style={{ 
                    marginRight: 10,
                    marginTop: 10, 
                    padding: '8px 16px', 
                    cursor: 'pointer', 
                    backgroundColor: '#5A5A5A',
                    color:'#FAF9F7', 
                    fontWeight: 'bold',
                borderRadius: '15px' }}>Tablero Competitivo</button></Link>
              <Link to="/ranking"><button style={{ 
                   marginRight: 10,
                   marginTop: 10, 
                    padding: '8px 16px', 
                    cursor: 'pointer', 
                    backgroundColor: '#5A5A5A',
                    color:'#FAF9F7', 
                    fontWeight: 'bold',
                    borderRadius: '15px' }}>Ranking Competitivo</button></Link>
           
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
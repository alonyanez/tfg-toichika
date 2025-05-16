import React, { useState, useCallback, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

// Componente Ranking independiente
function Ranking() {
  const [scores, setScores] = useState(() => {
    const saved = localStorage.getItem('toichika_scores_compet');
    return saved ? JSON.parse(saved) : [];
  });

  return (
    <div style={{
          maxWidth: '500px',
          alignSelf: 'flex-start', 
          marginTop: '10',
          margin: '40px auto',
          padding: '16px',
          backgroundColor: '#FAF9F7',
          border: '1px solid #ccc',
          borderRadius: '8px',
          color:'#2E2E2E',
          lineHeight: '1.5',}}>
          <div style={{ maxWidth: 500, margin: '40px auto', textAlign: 'center' }}>
            <div>
              <h1>Ranking</h1>
            </div>
            <div>
              <ol>
                {scores
                  .sort((a, b) => b.score - a.score)
                  .slice(0, 10)
                  .map((s, i) => (
                    <li key={i}>{s.name}: {s.score} pts ({s.time})</li>
                  ))}
              </ol>
            </div>
          </div>
    </div>
     
  );
}

export default Ranking;
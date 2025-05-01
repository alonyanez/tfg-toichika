import React, { useState, useCallback, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

// Componente Ranking independiente
function Ranking() {
  const [scores, setScores] = useState(() => {
    const saved = localStorage.getItem('toichika_scores_compet');
    return saved ? JSON.parse(saved) : [];
  });

  return (
    <div style={{ maxWidth: 500, margin: '40px auto', textAlign: 'center' }}>
      <h1>Ranking</h1>
      <Link to="/">
        <button>Volver</button>
      </Link>
      <ol>
        {scores
          .sort((a, b) => b.score - a.score)
          .slice(0, 10)
          .map((s, i) => (
            <li key={i}>{s.name}: {s.score} pts ({s.time})</li>
          ))}
      </ol>
    </div>
  );
}

export default Ranking;
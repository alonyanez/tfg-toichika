//import './App.css';
import Tablero from './Tablero';
import { esValida, encontrarAreas } from './ResolverToichika';
import React, { useState, useCallback, useEffect, useRef } from 'react';

function TableroCompetitivo() {
  const [size, setSize] = useState(6);

 // const [numRegiones, setNumRegiones] = useState(8);

  const [tableroState, setTableroState] = useState([]);
  const [regenKey, setRegenKey] = useState(0);
  const [intentos, setIntentos] = useState(0);
  const MAX_INTENTOS = 50;

   const [tiempo, setTiempo] = useState(0); // segundos
   const [corriendo, setCorriendo] = useState(false);
   const intervaloRef = useRef(null);

   const [playerName, setPlayerName] = useState('');

   const [scores, setScores] = useState(() => {
    const saved = localStorage.getItem('toichika_scores_compet');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('toichika_scores_compet', JSON.stringify(scores));
  }, [scores]);


   const handleStartTimer = () => {
    if (corriendo) return;
    // Reiniciar el tablero al empezar el tiempo
    handleResetTimer();
    setIntentos(0);
    setRegenKey(k => k + 1);

    // Iniciar contador
    setCorriendo(true);
    intervaloRef.current = setInterval(() => {
      setTiempo(t => t + 1);
    }, 1000);
  };

  const handleStopTimer = () => {
    setCorriendo(false);
    clearInterval(intervaloRef.current);
  };

  const handleResetTimer = () => {
    handleStopTimer();
    setTiempo(0);
  };


  const onGenerado = useCallback(tab => {
    setTableroState(tab);
  }, []);

  const onCambio = useCallback(tab => {
    setTableroState(tab);
  }, []);


  const comprobarSolucion = () => {
    handleStopTimer();

    const flechasPuestas = tableroState.flat().filter(c => c.flecha).length;
    const regionCount = Object.keys(encontrarAreas(tableroState)).length;

    if (flechasPuestas < regionCount) {
      alert(`Debes colocar ${regionCount} flechas. Ahora llevas ${flechasPuestas}.`);
      return;
    }

    const valido = esValida(tableroState);

    // Calculamos la puntuación según el tiempo (cuanto menor, mejor)
    // Por ejemplo, base 1000 puntos menos 10 por segundo
    const score = Math.max(0, 1000 - tiempo * 10);

    if (valido) {
    const entry = { name: playerName || 'Anon', score, time: formatoTiempo(), date: new Date().toISOString() };
      setScores(prev => [...prev, entry]);
      alert(`¡Solución válida! Tiempo: ${formatoTiempo()}. Puntuación: ${score}`);
    } else {
      alert(`Solución inválida. Tiempo: ${formatoTiempo()}. Puntuación: 0`);
    }
  };

  
  useEffect(() => {
    if (!tableroState.length) return;

    if (esValida(tableroState)) {
      console.log('Tablero válido generado en', intentos + 1, 'intentos');
      setIntentos(0); 
    } else {
      if (intentos < MAX_INTENTOS - 1) {
        setIntentos(i => i + 1);
        setRegenKey(k => k + 1);
      } else {
        alert(`No hemos encontrado un tablero con solución tras ${MAX_INTENTOS} intentos.\nPrueba a cambiar el tamaño o reiniciar.`);
      }
    }
  }, [regenKey]);


  // Limpieza del temporizador al desmontar
  useEffect(() => {
    return () => clearInterval(intervaloRef.current);
  }, []);

  const formatoTiempo = () => {
    const mm = String(Math.floor(tiempo / 60)).padStart(2, '0');
    const ss = String(tiempo % 60).padStart(2, '0');
    return `${mm}:${ss}`;
  };


  return (
    <div >
      <h1  style={{ textAlign: 'center'}}>Tablero de Toichika</h1>

      <div style={{ textAlign: 'center', margin: '10px' }}>
        <label style={{ marginRight: 8 }}>
          Nombre: <input type="text" value={playerName} onChange={e => setPlayerName(e.target.value)} />
        </label>
      </div>

      <div style={{ textAlign: 'center', margin: '10px 0' }}>
        <span style={{ fontSize: '1.2rem', marginRight: '8px' }}>Tiempo: {formatoTiempo()}</span>
        <div>
            <button onClick={handleStartTimer} disabled={corriendo} style={{ marginRight: 8 }}>Empezar a jugar</button>
            <button onClick={handleStopTimer} disabled={!corriendo} style={{ marginRight: 8 }}>Pausar</button>
            <button onClick={handleResetTimer}>Reiniciar</button>
        </div>
      </div>

      <Tablero
        key={regenKey}
        size={size}
        onTableroGenerado={onGenerado}
        onTableroChange={onCambio}
      />

      <div style={{ textAlign: 'center', margin: '20px 0' }}>
        <button
          onClick={comprobarSolucion}
          style={{ marginRight: 10, padding: '8px 16px', cursor: 'pointer' }}
        >
          Comprobar Solución
        </button>

      </div>

      <br/>
      
   </div>
  );
}

export default TableroCompetitivo;
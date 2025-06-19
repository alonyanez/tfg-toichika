import Tablero from '../Tablero';
import { esValida, encontrarAreas, obtenerSolucion } from '../../Resolver/ResolverToichika';
import React, { useState, useCallback, useEffect, useRef } from 'react';



export function filtrarFlechaRegionMasGrande(fullTablero, nPistas = 2) {
  const regionSizes = {};
  fullTablero.forEach(row =>
    row.forEach(c => {
      regionSizes[c.region] = (regionSizes[c.region] || 0) + 1;
    })
  );

  const regionesOrdenadas = Object.entries(regionSizes)
    .sort(([, a], [, b]) => b - a) 
    .map(([regionId]) => Number(regionId));

  const topRegions = regionesOrdenadas.slice(0, nPistas);

  const pistas = [];
  topRegions.forEach(regId => {
 
    for (let x = 0; x < fullTablero.length; x++) {
      for (let y = 0; y < fullTablero[x].length; y++) {
        const c = fullTablero[x][y];
        if (c.region === regId && c.flecha) {
          pistas.push({ x, y, flecha: c.flecha });
          return;
        }
      }
    }

    if (!pistas.some(p => p.region === regId)) {
      outer: for (let x = 0; x < fullTablero.length; x++) {
        for (let y = 0; y < fullTablero[x].length; y++) {
          if (fullTablero[x][y].flecha) {
            pistas.push({ x, y, flecha: fullTablero[x][y].flecha });
            break outer;
          }
        }
      }
    }
  });

  return fullTablero.map((row, i) =>
    row.map((c, j) => {
      const pista = pistas.find(p => p.x === i && p.y === j);
      return {
        region: c.region,
        flecha: pista ? pista.flecha : '',
        fija: !!pista  
      };
    })
  );
}


function TableroCompetitivo() {
  const [size] = useState(5);
  const [playerName, setPlayerName] = useState('');

  const [regenKey, setRegenKey] = useState(0);
  const [tableroGenerado, setTableroGenerado] = useState([]);
  const [tableroAMostrar, setTableroAMostrar] = useState(null);
  const [tableroListo, setTableroListo] = useState(false);
  const [cargandoTablero, setCargandoTablero] = useState(false);

  const [intentos, setIntentos] = useState(0);
  const MAX_INTENTOS = 500;


  //const [solucionState, setSolucionState] = useState(null);

  const [tiempo, setTiempo] = useState(0);
  const [corriendo, setCorriendo] = useState(false);
  const intervaloRef = useRef(null);

  const [scores, setScores] = useState(() => {
    const saved = localStorage.getItem('toichika_scores_compet');
    return saved ? JSON.parse(saved) : [];
  });
  useEffect(() => {
    localStorage.setItem('toichika_scores_compet', JSON.stringify(scores));
  }, [scores]);

  useEffect(() => {
    if (corriendo) {
      intervaloRef.current = setInterval(() => {
        setTiempo(t => t + 1);
      }, 1000);
    } else {
      clearInterval(intervaloRef.current);
    }
    return () => clearInterval(intervaloRef.current);
  }, [corriendo]);

  const handleStart = () => {
    if (cargandoTablero) return;
    setTiempo(0);
    setTableroListo(false);
    setTableroAMostrar(null);
    setTableroGenerado([]);
    setIntentos(0);
    setCargandoTablero(true);

    setRegenKey(k => k + 1);
  };

  const onGenerado = useCallback(tab => {
    setTableroGenerado(tab);
  }, []);

  const [tableroState, setTableroState] = useState([]);
  const onCambio = useCallback(tab => setTableroState(tab), []);

  useEffect(() => {
    if (!cargandoTablero || !tableroGenerado.length) return;
    const solucion = obtenerSolucion(tableroGenerado);

    if (!solucion) {
      if (intentos < MAX_INTENTOS - 1) {
        setIntentos(i => i + 1);
        setRegenKey(k => k + 1);
      } else {
        alert(`No encontramos tablero resoluble tras ${MAX_INTENTOS} intentos.`);
        setCargandoTablero(false);
      }
      return;
    }


    const tableroSinFlechasPeroConPistas = solucion.map(fila =>
      fila.map(celda => ({
        ...celda,
        flecha: '',  
        fija: celda.fija === true  
      }))
    );
    setTableroAMostrar(tableroSinFlechasPeroConPistas);
    setTableroListo(true);
    setCargandoTablero(false);
    setCorriendo(true);
  }, [tableroGenerado, intentos, cargandoTablero]);

  const formato = () => {
    const m = String(Math.floor(tiempo / 60)).padStart(2, '0');
    const s = String(tiempo % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  const comprobar = () => {
    setCorriendo(false);
    if (!Array.isArray(tableroState) || tableroState.length === 0) {

      const regiones = Object.keys(encontrarAreas(tableroState)).length;
      setCorriendo(true);
      return alert(`Debes colocar 10 flechas. Llevas 0.`);

    }else{
      const flechas = tableroState.flat().filter(c => c.flecha).length;
      const regiones = Object.keys(encontrarAreas(tableroState)).length;

      if (flechas < regiones) {
        setCorriendo(true);
        return alert(`Debes colocar ${regiones} flechas. Llevas ${flechas}.`);
      }
      const valido = esValida(tableroState);
      const score = Math.max(0, 5000 - tiempo * 20);
      if (valido) {
        const e = { name: playerName || 'Anon', score, time: formato(), date: new Date().toISOString() };
        setScores(s => [...s, e]);
        alert(`¡Válido! Tiempo: ${formato()}. Puntos: ${score}`);
      } else {
        setCorriendo(true);
        alert(`¡Inválido!`);
      }
    }
  };

  /*

  
  const handlePause = () => setCorriendo(false);

  const handleReset = () => {
    setCorriendo(false);
    setTiempo(0);
  };

  const handlePista = () => {
    if (!solucionState || !tableroListo) return;
    const vacias = [];
    tableroState.flat().forEach((celda, idx) => {
      if (!celda.flecha) vacias.push(idx);
    });
    if (vacias.length === 0) return;
    const idx = vacias[Math.floor(Math.random() * vacias.length)];
    const fila = Math.floor(idx / size);
    const col = idx % size;
    const flechaCorrecta = solucionState[fila][col].flecha;
    setTableroState(prev => {
      const copia = prev.map(r => r.map(c => ({ ...c })));
      copia[fila][col].flecha = flechaCorrecta;
      return copia;
    });
    setTiempo(t => t + 30);
  };
*/
  return (
    <div style={{
          maxWidth: '500px',
          alignSelf: 'flex-start', 
          marginTop: '10',
          margin: '40px auto',
          padding: '16px',
          backgroundColor: '#FAF9F7 ',
          border: '1px solid #CDD4DA',
          borderRadius: '20px',
          lineHeight: '1.5',
          color:'#2E2E2E'}}>
      <div style={{ textAlign: 'center' }}>
        <h1>Tablero Competitivo</h1>
        <div>
          <label>Nombre: <input value={playerName} onChange={e => setPlayerName(e.target.value)} /></label>
        </div>
        <div style={{ margin: '10px 0' }}>
          <span>Tiempo: {formato()}</span>
        </div>
        <div>
          <button 
            style={{ 
                  marginRight: 10, 
                  padding: '8px 16px', 
                  cursor: 'pointer', 
                  backgroundColor: '#5A5A5A',
                  color:'#FAF9F7', 
                  fontWeight: 'bold',
                  borderRadius: '15px' }}
            onClick={handleStart} 
            disabled={cargandoTablero}
            >Empezar
          </button>
          <button 
            style={{ 
                  marginRight: 10, 
                  padding: '8px 16px', 
                  cursor: 'pointer', 
                  backgroundColor: '#5A5A5A',
                  color:'#FAF9F7', 
                  fontWeight: 'bold',
                  borderRadius: '15px' }} 
            onClick={handleStart}
            >Reiniciar
          </button>
        </div>
        {cargandoTablero && <p>Cargando tablero…</p>}

        <div style={{ visibility: tableroListo ? 'visible' : 'hidden', pointerEvents: tableroListo ? 'auto' : 'none', margin: '20px auto' }}>
          <Tablero
            key={regenKey}
            size={size}
            onTableroGenerado={onGenerado}
            onTableroChange={onCambio}
            tableroInicial={tableroAMostrar}
          />
        </div>
        <div style={{ margin: '20px 0' }}>
          <button 
            style={{ 
                  marginRight: 10, 
                  padding: '8px 16px', 
                  cursor: 'pointer', 
                  backgroundColor: '#5A5A5A',
                  color:'#FAF9F7', 
                  fontWeight: 'bold',
                  borderRadius: '15px' }}
            onClick={comprobar} 
            disabled={!tableroListo}
            >Comprobar Solución
          </button>
        </div>
      </div>
    </div>
  );
}

export default TableroCompetitivo;

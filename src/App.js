import './App.css';
import Tablero from './components/Tablero/Tablero';
import Resolver from './components/Tablero/ResolverToichika';
import { esValida, encontrarAreas } from './components/Tablero/ResolverToichika';
import React, { useState, useCallback, useEffect } from 'react';

function App() {
  const [size, setSize] = useState(6);
  const [tableroState, setTableroState] = useState([]);
  const [mostrarSolver, setMostrarSolver] = useState(false);
  
  const [cargando, setCargando] = useState(false);  
  const [regenKey, setRegenKey] = useState(0);
  const [intentos, setIntentos] = useState(0);
  const MAX_INTENTOS = 50;

  const handleStartResolve = () => {
    setCargando(true);
  };

  const handleEndResolve = () => {
    setCargando(false);
  };

  const onGenerado = useCallback(tab => {
    setTableroState(tab);
  }, []);

  const onCambio = useCallback(tab => {
    setTableroState(tab);
  }, []);

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

  const comprobarSolucion = () => {
    const flechasPuestas = tableroState.flat().filter(c => c.flecha).length;
    const regionCount = Object.keys(encontrarAreas(tableroState)).length;

    if (flechasPuestas < regionCount) {
      alert(`Debes colocar ${regionCount} flechas. Ahora llevas ${flechasPuestas}.`);
      return;
    }

    const valido = esValida(tableroState);
    alert(valido ? '¡Solución válida!' : 'Solución inválida.');
  };


  return (
    <div >
      <div style={{
        maxWidth: '500px',
        marginTop: '10',
        margin: '40px auto',
        padding: '16px',
        backgroundColor: '#f9f9f9',
        border: '1px solid #ccc',
        borderRadius: '8px',
        lineHeight: '1.5'
      }}>
        <h2 style={{ textAlign: 'center'}}>Reglas de Toichika</h2>
        <ol>
          <li>Sólo puede haber una flecha por región.</li>
          <li>Cada flecha tiene una pareja, que se apuntan entre sí.</li>
          <li>Los pares de flechas no pueden estar en regiones adyacentes.</li>
          <li>No puede haber ninguna flecha en medio de un par de flechas.</li>
        </ol>
      </div>

      <h1  style={{ textAlign: 'center'}}>Tablero de Toichika</h1>
      <Tablero
        key={regenKey}
        size={size}
        //onTableroGenerado={memorizedSetTablero}
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
        <button
          onClick={() => setMostrarSolver(v => !v)}
          style={{ padding: '8px 16px', cursor: 'pointer' }}
        >
          {mostrarSolver ? 'Ocultar Solución' : 'Mostrar Solución'}
        </button>
      </div>

      {cargando && (
        <div style={{ textAlign: 'center', margin: '10px' }}>
          <span>Resolviendo…</span>
        </div>
      )}

      {mostrarSolver && (
        <Resolver
          tablero={tableroState}
          onStartResolve={handleStartResolve}
          onEndResolve={handleEndResolve}
          onSolucionInvalida={() => {
          handleEndResolve();
          if (intentos < MAX_INTENTOS - 1) {
            setIntentos(i => i + 1);
            setRegenKey(k => k + 1);
          } else {
            alert(`No hemos encontrado un tablero con solución tras ${MAX_INTENTOS} intentos.`);
          }
        }}
      />
      )}

      <br/>
      
   </div>
  );
}

export default App;

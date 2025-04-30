import './App.css';
import Tablero from './components/Tablero/Tablero';
import Resolver from './components/Tablero/ResolverToichika';
import { esValida, encontrarAreas } from './components/Tablero/ResolverToichika';
import React, { useState, useCallback, useEffect } from 'react';

function App() {
  const [size, setSize] = useState(6);
  const [tableroState, setTableroState] = useState([]);
  const [mostrarSolver, setMostrarSolver] = useState(false);

  const [regenKey, setRegenKey] = useState(0);
  const [intentos, setIntentos] = useState(0);
  const MAX_INTENTOS = 50;

  const memorizedSetTablero = useCallback((nuevoTablero) => {
    setTableroState(nuevoTablero);
  }, []);

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
      <div style={{ textAlign: 'center'}}>
        <h1>¡Bienvenido!</h1>
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

      {mostrarSolver && (
        <Resolver
          tablero={tableroState}
          onSolucionInvalida={() => alert("¡El tablero no tiene solución!")}
        />
      )}

      <br/>
      
   </div>
  );
}

export default App;

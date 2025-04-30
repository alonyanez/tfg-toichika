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

 useEffect(() => {
    if (tableroState.length === 0) return;

    if (esValida(tableroState)) {
      // ¡bien! lo dejamos
      console.log('Tablero válido generado en', intentos + 1, 'intentos');
      setIntentos(0);        // reset para futuras regeneraciones
    } else {
      // no tiene solución: regenerar
      if (intentos < MAX_INTENTOS - 1) {
        setIntentos(i => i + 1);
        setRegenKey(k => k + 1);
      } else {
        alert(`No hemos encontrado un tablero con solución tras ${MAX_INTENTOS} intentos.\nPrueba a cambiar el tamaño o reiniciar.`);
      }
    }
  }, [tableroState, intentos]);

  const comprobarSolucion = () => {
    // 1) cuentas flechas
    const flechasPuestas = tableroState.flat().filter(c => c.flecha).length;

    // 2) cuentas regiones
    const regionCount = Object.keys(encontrarAreas(tableroState)).length;

    // 3) revisas que estén todas
    if (flechasPuestas < regionCount) {
      alert(`Debes colocar ${regionCount} flechas. Ahora llevas ${flechasPuestas}.`);
      return;
    }

    // 4) validas toda la solución
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
        onTableroGenerado={memorizedSetTablero}
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

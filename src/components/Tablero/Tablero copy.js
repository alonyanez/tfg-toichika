import './App.css';
import Tablero from './components/Tablero/Tablero';
import Resolver from './components/Tablero/ResolverToichika';
import { esValida } from './components/Tablero/ResolverToichika';
import React, { useState, useCallback, useEffect } from 'react';

function App() {
  const [size, setSize] = useState(6);
  const [tableroState, setTableroState] = useState([]);
  const [mostrarSolver, setMostrarSolver] = useState(false);

  // clave para forzar remount de <Tablero> y que regenere
  const [regenKey, setRegenKey] = useState(0);
  // contador de intentos
  const [intentos, setIntentos] = useState(0);
  const MAX_INTENTOS = 50;

  // callback que Tablero llama tras generar un tablero
  const memorizedSetTablero = useCallback((nuevoTablero) => {
    setTableroState(nuevoTablero);
  }, []);

  // cada vez que cambie tableroState, comprobamos si es válido
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

  const actualizarSize = (nuevoSize) => {
    setSize(parseInt(nuevoSize, 10));
    // al cambiar tamaño, forzamos nueva generación
    setIntentos(0);
    setRegenKey(k => k + 1);
  };

  return (
    <div>
      <div style={{ textAlign: 'center' }}>
        <h1>¡Bienvenido!</h1>
        <h2>Tablero de Toichika ({size}×{size})</h2>
        {/* aquí podrías añadir un input para actualizar size */}
      </div>

      {/* Cada vez que regenKey cambie, <Tablero> se vuelve a montar y genera otro tablero */}
      <Tablero
        key={regenKey}
        size={size}
        onTableroGenerado={memorizedSetTablero}
      />

      <div style={{ textAlign: 'center', margin: '20px 0' }}>
        <button
          onClick={() => {
            setMostrarSolver(v => !v);
            // si mostramos el solver por primera vez y el tablero es inválido, avisa
            if (!mostrarSolver && !esValida(tableroState)) {
              alert("¡El tablero no tiene solución!");
            }
          }}
          style={{ marginRight: 10, padding: '8px 16px', cursor: 'pointer' }}
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
    </div>
  );
}

export default App;

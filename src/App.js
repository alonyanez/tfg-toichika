import './App.css';
import Tablero from './components/Tablero/Tablero';
import Resolver from './components/Tablero/ResolverToichika';
import PedirValor from './components/pedirValor';
import React, { useState, useCallback } from 'react';

function App() {
  const [size, setSize] = useState(6);
  const [tableroState, setTableroState] = useState([]);
  const [mostrarSolver, setMostrarSolver] = useState(false);

  //const [solucionState, setSolucionState] = useState([]);

  const memoizedSetTablero = useCallback((nuevoTablero) => {
    setTableroState(nuevoTablero);
  }, []);

  const actualizarSize = (nuevoSize) => {
    setSize(parseInt(nuevoSize, 10));
  }

  /*const solucionMemoizada = useMemo(() => {
    return solucionState;
  }, [solucionState]);*/

  /*const comprobarSolucion = () => {
    // Comparamos sólo si hay cambios en las celdas del tablero
    const iguales = tableroState.every((fila, i) =>
      fila.every((celda, j) =>
        celda.flecha === solucionMemoizada[i]?.[j]?.flecha
      )
    );

    if (iguales) {
      console.log("¡Está resuelto!");
    } else {
      console.log("Aún no está resuelto");
    }
  };
  
  <button style={{ textAlign: 'center'}} onClick={comprobarSolucion}>Comprobar Solución</button>
  */

  return (
    <div >
      <div style={{ textAlign: 'center'}}>
        <h1>¡Bienvenido!</h1>
       <PedirValor onActualizar={actualizarSize}/>
      </div>

      <h1  style={{ textAlign: 'center'}}>Tablero de Toichika</h1>
      <Tablero
        size={size}
        onTableroGenerado={memoizedSetTablero}
      />

      <div style={{ textAlign: 'center', margin: '20px 0' }}>
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
          onSolucionInvalida={() => alert('¡Solución inválida!')}
        />
      )}

      <br/>
      
   </div>
  );
}

export default App;

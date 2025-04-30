import './App.css';
import Tablero from './components/Tablero/Tablero';
import Resolver from './components/Tablero/ResolverToichika';
import { esValida, encontrarAreas } from './components/Tablero/ResolverToichika';
import React, { useState, useCallback } from 'react';

function App() {
  const [size, setSize] = useState(6);
  const [tableroState, setTableroState] = useState([]);
  const [mostrarSolver, setMostrarSolver] = useState(false);

  //const [solucionState, setSolucionState] = useState([]);

  const memorizedSetTablero = useCallback((nuevoTablero) => {
    setTableroState(nuevoTablero);
  }, []);

  const actualizarSize = (nuevoSize) => {
    setSize(parseInt(nuevoSize, 10));
  }

  /*<button style={{ textAlign: 'center'}} onClick={comprobarSolucion}>Comprobar Solución</button>
   <PedirValor onActualizar={actualizarSize}/>
  */

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

//import './App.css';
import Tablero from './Tablero';
import { esValida, encontrarAreas, obtenerSolucion } from './ResolverToichika';
import React, { useState, useCallback, useEffect } from 'react';

function TableroCasual() {
  const [size, setSize] = useState(6);

  const [tableroAMostrar, setTableroAMostrar] = useState(null);
  const [cargandoTablero, setCargandoTablero] = useState(true);
  const [tableroListo, setTableroListo] = useState(false);
  
  const [tableroSolucion, setTableroSolucion] = useState(null);

 // const [numRegiones, setNumRegiones] = useState(8);

  const [tableroState, setTableroState] = useState([]);
  const [tableroGenerado, setTableroGenerado] = useState([]);
  const [mostrarSolver, setMostrarSolver] = useState(false);
  
  const [cargando, setCargando] = useState(false);  
  const [regenKey, setRegenKey] = useState(0);
  const [intentos, setIntentos] = useState(0);
  const MAX_INTENTOS = 100;

  useEffect(() => {
    setCargandoTablero(true);
    setTableroListo(false);
  }, [regenKey]);

  const onGenerado = useCallback(tab => {
    setTableroGenerado(tab);
  }, []);

  const onCambio = useCallback(tab => {
    setTableroState(tab);
  }, []);

  const handleMostrarSolver = () => {
    if (!mostrarSolver) {
      const tieneFlecha = tableroState.some(fila =>
        fila.some(celda => !!celda.flecha) 
      );
      //if (!tieneFlecha) {
      //  alert('Por favor, coloque al menos una flecha para poder ofrecer la mejor solución.');
      //  return;
      //}
    }
    setMostrarSolver(v => !v);
  };

  const comprobarSolucion = () => {
    const flechasPuestas = tableroState.flat().filter(c => c.flecha).length;
    const regionCount = Object.keys(encontrarAreas(tableroState)).length;

    if (flechasPuestas < regionCount) {
      alert(`Debes colocar ${regionCount} flechas. Ahora llevas ${flechasPuestas}.`);
      return;
    }

    if (esValida(tableroState)) {
      alert('¡Solución válida!');
      setMostrarSolver(true);
    } else {
      alert('Solución inválida.');
    }
  };

  
  useEffect(() => {
    if (!tableroGenerado.length) return;
  
    const solucion = obtenerSolucion(tableroGenerado);
  
    if (!solucion) {
      if (intentos < MAX_INTENTOS - 1) {
        setIntentos(i => i + 1);
        setRegenKey(k => k + 1);
      } else {
        setCargando(false);
        alert(`No hemos encontrado un tablero resoluble tras ${MAX_INTENTOS} intentos.`);
        setIntentos(0);
      }
      return;
    }

    setTableroSolucion(solucion);
    const tableroLimpio = solucion.map(fila =>
      fila.map(celda => ({...celda, flecha: '' })) );
  
    console.log('Tablero limpio a pintar:', tableroLimpio);
  
    setTableroAMostrar(tableroLimpio);
    setTableroListo(true);
    setIntentos(0);
    setCargando(false);
    setCargandoTablero(false);
  
  }, [tableroGenerado]);


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

      <div style={{ textAlign: 'center', margin: '10px 0' }}>
       
       
      </div>

      {cargandoTablero && (
        <div style={{ textAlign: 'center', margin: '10px' }}>
          <span>Cargando tablero…</span>
        </div>
      )}

      <div
        style={{
          visibility: tableroListo ? 'visible' : 'hidden',
          pointerEvents: tableroListo ? 'auto' : 'none'
        }}
      >
        <Tablero
          key={regenKey}
          size={size}
          onTableroGenerado={onGenerado}
          onTableroChange={onCambio}
          tableroInicial={tableroAMostrar}
        />
      </div>

      <div style={{ textAlign: 'center', margin: '20px 0' }}>
        <button
          onClick={comprobarSolucion}
          style={{ marginRight: 10, padding: '8px 16px', cursor: 'pointer' }}
        >
          Comprobar Solución
        </button>

        <button
          onClick={handleMostrarSolver}
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

      { mostrarSolver && tableroSolucion && (
        <div style={{ margin: 20, padding: 20, border: '1px solid #ccc' }}>
          <h3>Solución propuesta:</h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${tableroSolucion[0].length}, 50px)`,
            gap: '2px',
            justifyContent: 'center'
          }}>
            {tableroSolucion.map((fila, x) =>
              fila.map((celda, y) => (
                <div
                  key={`${x}-${y}`}
                  style={{
                    width: 50,
                    height: 50,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: `hsl(${celda.region * 30}, 80%, 75%)`,
                    border: '1px solid #666',
                    fontSize: '24px'
                  }}
                >
                  {celda.flecha}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <br/>
      
   </div>
  );
}

export default TableroCasual;

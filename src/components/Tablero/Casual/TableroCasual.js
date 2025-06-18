import '../../../App.css';
import Tablero from '../Tablero';
import './TableroCasual.css';
import { esValida, encontrarAreas, obtenerSolucion } from '../../Resolver/ResolverToichika';
import { useState, useCallback, useEffect } from 'react';


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
        fija: !!pista   // true si es flecha de pista
      };
    })
  );
}


function TableroCasual() {
  const [size, setSize] = useState(5);

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
  const MAX_INTENTOS = 500;

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

    // 1) Genera la solución completa (tiene todas las flechas)
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

    const numPistas = solucion.flat().filter(c => c.fija).length;
    const MAX_PISTAS = 6;
    const MIN_PISTAS = 3;
    if (numPistas > MAX_PISTAS || numPistas <  MIN_PISTAS) {
      // Descarta este tablero y regenera de nuevo
      if (intentos < MAX_INTENTOS - 1) {
        setIntentos(i => i + 1);
        setRegenKey(k => k + 1);
      } else {
        alert(`No hemos encontrado un tablero adecuado (≤${MAX_PISTAS} pistas) tras ${MAX_INTENTOS} intentos.`);
        setCargando(false);
        setIntentos(0);
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
  setTableroState(tableroSinFlechasPeroConPistas);
  // Guardamos la solución completa (con flechas) para mostrar luego si es necesario:
  setTableroSolucion(solucion);

    setTableroListo(true);
    setCargando(false);
    setCargandoTablero(false);
  }, [tableroGenerado]);


  return (
    <div className="tablero-casual-container">

      <div style={{flex: '1', color:'#252422'}}>
        <div style={{ maxWidth: '500px',
          alignSelf: 'flex-start', 
          marginTop: '10',
          margin: '40px auto',
          padding: '16px',
          backgroundColor: '#FAF9F7',
          border: '1px solid #CDD4DA',
          borderRadius: '20px',
          lineHeight: '1.5',
          color:'#252323'}}>
          <h1  style={{ textAlign: 'center'}}>Tablero de Toichika</h1>
       
          <div style={{ textAlign: 'center', margin: '10px 0' }}></div>

          {cargandoTablero && (
            <div style={{ textAlign: 'center', margin: '10px' }}>
              <span>Cargando tablero…</span>
            </div>
          )}

          <div style={{
              visibility: tableroListo ? 'visible' : 'hidden',
              pointerEvents: tableroListo ? 'auto' : 'none' }}>
            <Tablero
              key={regenKey}
              size={size}
              onTableroGenerado={onGenerado}
              onTableroChange={onCambio}
              tableroInicial={tableroAMostrar}
            />
          </div>

          <br></br>
          <br></br>
          <br></br>
        </div>  
      </div>
      
        
      <div style={{flex: '1',}}>
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
            
          <h2 style={{ textAlign: 'center'}}>Reglas de Toichika</h2>
          <ol>
            <li>Sólo puede haber una flecha por región.</li>
            <li>Cada flecha tiene una pareja, que se apuntan entre sí.</li>
            <li>Los pares de flechas no pueden estar en regiones adyacentes.</li>
            <li>No puede haber ninguna flecha en medio de un par de flechas.</li>
          </ol>
          <hr></hr>
          <h2 style={{ textAlign: 'center'}}>Botones</h2>

          <div style={{ textAlign: 'center', margin: '20px 0' }}>
            <button
              onClick={comprobarSolucion}
              style={{ 
                marginRight: 10, 
                padding: '8px 16px', 
                cursor: 'pointer', 
                backgroundColor: '#5A5A5A',
                color:'#FAF9F7', 
                fontWeight: 'bold',
                borderRadius: '15px' }}
            >
              Comprobar Solución
            </button>

            <button
              onClick={handleMostrarSolver}
              style={{ 
                padding: '8px 16px', 
                cursor: 'pointer', 
                fontWeight: 'bold',
                backgroundColor: '#5A5A5A',
                color:'#FAF9F7',
                borderRadius: '15px', }}
            >
              {mostrarSolver ? 'Ocultar Solución' : 'Mostrar Solución'}
            </button>
          </div>


          { mostrarSolver && tableroSolucion && (
            <div style={{ 
                display: 'inline-block',
                width: 'fit-content',
                margin: 20, 
                padding: 20, 
                border: '1px solid #ccc', 
                borderColor: '#252422', 
                borderRadius: '8px', 
                backgroundColor: '#5A5A5A' }}>
              <h3 style={{color:'#FAF9F7', textAlign: 'center'}}>Solución propuesta</h3>
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
                        fontSize: '24px',
                      }}
                    >
                      {celda.flecha}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
          
      </div>    
    </div>
  );
}

export default TableroCasual;

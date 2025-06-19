import React, { useState, useEffect, useCallback } from 'react';
import './Tablero.css';
import { calcularAdyacencias, contarSoluciones} from '../Resolver/ResolverToichika.js'

const FLECHAS = ['↑', '→', '↓', '←', ''];

/*
const tableroPredefinido = [
  [{region: 0}, {region: 1}, {region: 1}, {region: 2}, {region: 3}, {region: 3}],
  [{region: 0}, {region: 0}, {region: 4}, {region: 2}, {region: 2}, {region: 2}],
  [{region: 0}, {region: 5}, {region: 4}, {region: 4}, {region: 4}, {region: 2}],
  [{region: 5}, {region: 5}, {region: 4}, {region: 4}, {region: 6}, {region: 7}],
  [{region: 8}, {region: 8}, {region: 9}, {region: 9}, {region: 6}, {region: 11}],
  [{region: 10}, {region: 10}, {region: 10}, {region: 10}, {region: 10}, {region: 10}]
];
*/


function clonarTablero(tablero) {
  return tablero.map(fila => fila.map(celda => ({ ...celda })));
}

function obtenerTodasLasFlechas(tablero) {
  const flechas = [];
  for (let y = 0; y < tablero.length; y++) {
    for (let x = 0; x < tablero[0].length; x++) {
      const celda = tablero[y][x];
      if (celda.flecha) {
        flechas.push({ x, y, flecha: celda.flecha });
      }
    }
  }
  return flechas;
}

function mezclarArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function emparejamientoNoAdyacente(adyacencias) {
  const regiones = Object.keys(adyacencias).map(n => parseInt(n));
  const disponibles = new Set(regiones);
  const pareja = {};

  regiones.sort(() => Math.random() - 0.5);

  for (let r of regiones) {
    if (!disponibles.has(r)) continue;

    const cand = [...disponibles].filter(s => s !== r && !adyacencias[r].has(s));
    if (cand.length === 0) {

      return null;
    }
    const partner = cand[Math.floor(Math.random() * cand.length)];
    pareja[r] = partner;
    pareja[partner] = r;
    disponibles.delete(r);
    disponibles.delete(partner);
  }
  return pareja; 
}

function asignarFlechasSolucion(tablero, pareja) {
  const R = tablero.length, C = tablero[0].length;
  const celdasPorRegion = {};

  for (let i = 0; i < R; i++) {
    for (let j = 0; j < C; j++) {
      const r = tablero[i][j].region;
      if (!celdasPorRegion[r]) celdasPorRegion[r] = [];
      celdasPorRegion[r].push([i,j]);
    }
  }

  tablero.forEach(fila => fila.forEach(celda => celda.flecha = ''));

  for (let r in pareja) {
    if (r > pareja[r]) continue;
    const s = pareja[r];

    const celdasR = celdasPorRegion[r];
    const celdasS = celdasPorRegion[s];
    let flechasAsignadas = false;

    for (let [x1, y1] of celdasR) {
      for (let [x2, y2] of celdasS) {
        if (x1 === x2) {
          if (y1 < y2) {
            tablero[x1][y1].flecha = '→';
            tablero[x2][y2].flecha = '←';
          } else {
            tablero[x1][y1].flecha = '←';
            tablero[x2][y2].flecha = '→';
          }
          flechasAsignadas = true;
          break;
        } else if (y1 === y2) {
          if (x1 < x2) {
            tablero[x1][y1].flecha = '↓';
            tablero[x2][y2].flecha = '↑';
          } else {
            tablero[x1][y1].flecha = '↑';
            tablero[x2][y2].flecha = '↓';
          }
          flechasAsignadas = true;
          break;
        }
      }
      if (flechasAsignadas) break;
    }

    if (!flechasAsignadas) return false;
  }

  return true;
}

function clonarYEliminarPistasEnRegiones(tableroBase, regionesARemover) {
  return tableroBase.map(fila =>
    fila.map(celda => {
      const nueva = { ...celda };
      if (regionesARemover.has(celda.region) && celda.flecha) {
        nueva.flecha = '';
        nueva.fija = false;
      }
      return nueva;
    })
  );
}

function combinar(arr, k) {
  const resultados = [];
  const n = arr.length;
  function backtrack(start, combo) {
    if (combo.length === k) {
      resultados.push(combo.slice());
      return;
    }
    for (let i = start; i < n; i++) {
      combo.push(arr[i]);
      backtrack(i + 1, combo);
      combo.pop();
    }
  }
  backtrack(0, []);
  return resultados;
}

function hallarEliminacionMinima(tableroBase, regionesArray, contarSoluciones) {
  const N = regionesArray.length;
  for (let k = 1; k <= N; k++) {
    const combos = combinar(regionesArray, k);
    for (const combo of combos) {
      const setRemover = new Set(combo);
      const tableroPrueba = clonarYEliminarPistasEnRegiones(tableroBase, setRemover);
      const solCount = contarSoluciones(tableroPrueba, 2);
      if (solCount === 1) {
        return combo.slice();
      }
    }

  }
  return null;
}

function eliminarGreedy(tableroBase, regionesArray, contarSoluciones) {
  const eliminadas = new Set();
  let progreso = true;
  while (progreso) {
    progreso = false;
    for (const r of regionesArray) {
      if (eliminadas.has(r)) continue;
      const setRemover = new Set(eliminadas);
      setRemover.add(r);
      const tableroPrueba = clonarYEliminarPistasEnRegiones(tableroBase, setRemover);
      const solCount = contarSoluciones(tableroPrueba, 2);
      if (solCount === 1) {
        eliminadas.add(r);
        progreso = true;
        break; 
      }
    }
  }
  return Array.from(eliminadas);
}

export function generarTableroConUnicaSolucion(filas, columnas, numRegiones) {
  while (true) {
    const tablero = generarRegionesAleatorias(filas, columnas, numRegiones);
    const ady = calcularAdyacencias(tablero);
    const parejas = emparejamientoNoAdyacente(ady);
    if (!parejas) continue;

    if (!asignarFlechasSolucion(tablero, parejas)) continue;
    let eliminado = true;
    while (eliminado) {
      eliminado = false;
      let posiciones = obtenerTodasLasFlechas(tablero);
      mezclarArray(posiciones);

      for (const pos of posiciones) {
        const backup = tablero[pos.y][pos.x].flecha;
        const tableroCopia = clonarTablero(tablero);
        tableroCopia[pos.y][pos.x].flecha = '';
        const solCount = contarSoluciones(tableroCopia, 2);

        if (solCount === 1) {
          tablero[pos.y][pos.x].flecha = '';
          eliminado = true;
          //console.log(`Eliminada flecha en (${pos.x},${pos.y}), solCount=1`);
        } //else {
          //console.log(`Se mantiene flecha en (${pos.x},${pos.y}), solCount=${solCount}`);
        // }
      }
    }

    for (let i = 0; i < filas; i++) {
      for (let j = 0; j < columnas; j++) {
        tablero[i][j].fija = !!tablero[i][j].flecha;
      }
    }

    const regionesConPista = new Set();
    for (let i = 0; i < filas; i++) {
      for (let j = 0; j < columnas; j++) {
        if (tablero[i][j].fija) {
          regionesConPista.add(tablero[i][j].region);
        }
      }
    }
    const regionesArray = Array.from(regionesConPista);

    const UMBRAL_EXHAUSTIVO = 10; 
    let eliminadas;
    if (regionesArray.length <= UMBRAL_EXHAUSTIVO) {
      eliminadas = hallarEliminacionMinima(tablero, regionesArray, contarSoluciones);
      if (eliminadas === null) {
        eliminadas = [];
      }
    } else {
      eliminadas = eliminarGreedy(tablero, regionesArray, contarSoluciones);
    }

    if (eliminadas && eliminadas.length > 0) {
      const setRemover = new Set(eliminadas);
      const nuevoTablero = clonarYEliminarPistasEnRegiones(tablero, setRemover);
      for (let i = 0; i < filas; i++) {
        for (let j = 0; j < columnas; j++) {
          tablero[i][j] = nuevoTablero[i][j];
        }
      }
    }


    return tablero;
  }

}

function generarRegionesAleatorias(filas, columnas, cantidadRegiones) {
  const tablero = Array.from({ length: filas }, () =>
    Array.from({ length: columnas }, () => ({ region: -1, flecha: '' }))
  );

  const todasLasCeldas = [];
  for (let x = 0; x < filas; x++) {
    for (let y = 0; y < columnas; y++) {
      todasLasCeldas.push([x, y]);
    }
  }

  const mezclar = (array) => array.sort(() => Math.random() - 0.5);
  const semillas = mezclar([...todasLasCeldas]).slice(0, cantidadRegiones);

  const regiones = semillas.map(([x, y], i) => ({
    id: i,
    frontera: [[x, y]]
  }));

  semillas.forEach(([x, y], i) => {
    tablero[x][y].region = i;
  });

  const vecinos = (x, y) => [
    [x - 1, y], [x + 1, y],
    [x, y - 1], [x, y + 1]
  ].filter(([nx, ny]) => nx >= 0 && ny >= 0 && nx < filas && ny < columnas);

  let celdasAsignadas = semillas.length;
  const totalCeldas = filas * columnas;
  let rondasSinProgreso = 0;

  while (celdasAsignadas < totalCeldas && rondasSinProgreso < 5) {
    let progreso = false;

    for (const region of regiones) {
      const nuevaFrontera = [];

      for (const [x, y] of region.frontera) {
        const candidatos = vecinos(x, y).filter(
          ([nx, ny]) => tablero[nx][ny].region === -1
        );

        mezclar(candidatos); 

        if (candidatos.length > 0) {
          const [nx, ny] = candidatos[0];
          tablero[nx][ny].region = region.id;
          nuevaFrontera.push([nx, ny]);
          celdasAsignadas++;
          progreso = true;
          if (celdasAsignadas >= totalCeldas) break;
        }
      }

      region.frontera = nuevaFrontera;
    }

    if (!progreso) {
      rondasSinProgreso++;
    } else {
      rondasSinProgreso = 0;
    }
  }

  if (celdasAsignadas < totalCeldas) {
    return generarRegionesAleatorias(filas, columnas, cantidadRegiones);
  }

  return tablero;
}

const obtenerSiguienteFlecha = (actual) => {
  const index = FLECHAS.indexOf(actual);
  return FLECHAS[(index + 1) % FLECHAS.length];
};


const Tablero = ({ size, onTableroGenerado, onTableroChange, tableroInicial }) => {
  const [tablero, setTablero] = useState([]);

  useEffect(() => {
    if (tableroInicial && tableroInicial.length) {
      setTablero(tableroInicial);
    }
  }, [tableroInicial]);

  const manejarClickCelda = (x, y) => {
    setTablero(prev => {
      const nuevo = prev.map((fila, i) =>
        fila.map((celda, j) =>
          i === x && j === y
            ? { ...celda, flecha: obtenerSiguienteFlecha(celda.flecha) }
            : celda
        )
      );
      onTableroChange?.(nuevo);
      return nuevo;
    });
  };

  const generarTablero = useCallback(() => {
    const pistasTablero = generarTableroConUnicaSolucion(size, size, 10);
    return pistasTablero;
  }, [size]);

  useEffect(() => {
    const tab = generarTablero();
    setTablero(tab);
    onTableroGenerado?.(tab);
  }, [generarTablero, onTableroGenerado]);

  const getBordeEstilo = useCallback((x, y) => {
    const borders = {
      borderTop: '2px solid #666',
      borderRight: '2px solid #666',
      borderBottom: '2px solid #666',
      borderLeft: '2px solid #666'
    };

    // Verificar vecinos y límites para bordes de regiones (negro si cambia de región o en los bordes del tablero)
    if (x > 0 && tablero[x][y]?.region !== tablero[x - 1][y]?.region) {
      borders.borderTop = '2px solid #000';
    }
    if (x < size - 1 && tablero[x][y]?.region !== tablero[x + 1][y]?.region) {
      borders.borderBottom = '2px solid #000';
    }
    if (y > 0 && tablero[x][y]?.region !== tablero[x][y - 1]?.region) {
      borders.borderLeft = '2px solid #000';
    }
    if (y < size - 1 && tablero[x][y]?.region !== tablero[x][y + 1]?.region) {
      borders.borderRight = '2px solid #000';
    }
    // Borde en el límite del tablero
    if (x === 0) {
      borders.borderTop = '2px solid #000';
    } else if (x === size - 1) {
      borders.borderBottom = '2px solid #000';
    }
    if (y === 0) {
      borders.borderLeft = '2px solid #000';
    } else if (y === size - 1) {
      borders.borderRight = '2px solid #000';
    }

    return borders;
  }, [tablero, size]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${size}, 50px)`,
          gridTemplateRows: `repeat(${size}, 50px)`
        }}
      >
        {tablero.map((fila, x) =>
          fila.map((celda, y) => {
            const borde = getBordeEstilo(x, y);
            const esPista = celda.fija;

            const fondo = esPista
              ? `hsl(${celda.region * 30}, 80%, 75%)`
              : `hsl(${celda.region * 30}, 80%, 75%)`;

            // Estilo base de la celda
            const estiloCelda = {
              cursor: esPista ? 'default' : 'pointer',
              width: 50,
              height: 50,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24,
              backgroundColor: fondo,
              ...(esPista
                 ? {
                     borderTop: borde.borderTop,
                     borderRight: borde.borderRight,
                     borderBottom: borde.borderBottom,
                     borderLeft: borde.borderLeft,
                     boxShadow: 'inset 0 0 0 4px green'
                  }
                : {
                    borderTop: borde.borderTop,
                    borderRight: borde.borderRight,
                    borderBottom: borde.borderBottom,
                    borderLeft: borde.borderLeft
                  })
            };

            return (
              <div
                key={`${x}-${y}`}
                onClick={() => manejarClickCelda(x, y)}
                style={estiloCelda}
              >
                {celda.flecha}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Tablero;
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
  return pareja; // mapa r → partner
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

export function generarTableroConUnicaSolucion(filas, columnas, numRegiones) {
  while (true) {
    const tablero = generarRegionesAleatorias(filas, columnas, numRegiones);
    const ady = calcularAdyacencias(tablero);
    const parejas = emparejamientoNoAdyacente(ady);
    if (!parejas) continue;

    // Asignamos solución completa
    if (!asignarFlechasSolucion(tablero, parejas)) continue;

    // Eliminación eficiente: eliminación iterativa (greedy)
    let eliminado = true;
    while (eliminado) {
      eliminado = false;
      const posiciones = obtenerTodasLasFlechas(tablero);
      mezclarArray(posiciones);
      for (const pos of posiciones) {
        // Backup de la flecha
        const backup = tablero[pos.y][pos.x].flecha;
        // Intentamos eliminarla
        tablero[pos.y][pos.x].flecha = '';

        // Contamos soluciones hasta 2
        const solCount = contarSoluciones(tablero, 2);
        if (solCount === 1) {
          // Se mantiene eliminada y seguimos intentando
          eliminado = true;
        } else {
          // Es necesaria, la restauramos
          tablero[pos.y][pos.x].flecha = backup;
        }
      }
    }

    // Marcamos flechas finales como fijas
    for (let i = 0; i < filas; i++) {
      for (let j = 0; j < columnas; j++) {
        tablero[i][j].fija = !!tablero[i][j].flecha;
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
    const pistasTablero = generarTableroConUnicaSolucion(size, size, 8);
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

            // Color de fondo: más oscuro si es pista, más claro si no
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
                     boxShadow: 'inset 0 0 0 4px green' // borde interior verde de 2px
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
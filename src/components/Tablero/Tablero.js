import React, { useState, useEffect, useCallback } from 'react';
import './Tablero.css';
import { calcularAdyacencias, contarSoluciones, obtenerSolucion } from '../Resolver/ResolverToichika.js'

const FLECHAS = ['↑', '→', '↓', '←', ''];

/*const tableroPredefinido = [
  [{region: 0}, {region: 0}, {region: 0}, {region: 0}, {region: 0}, {region: 1}],
  [{region: 3}, {region: 4}, {region: 4}, {region: 4}, {region: 4}, {region: 1}],
  [{region: 3}, {region: 4}, {region: 5}, {region: 5}, {region: 5}, {region: 1}],
  [{region: 3}, {region: 6}, {region: 6}, {region: 6}, {region: 6}, {region: 1}],
  [{region: 3}, {region: 7}, {region: 7}, {region: 7}, {region: 6}, {region: 1}],
  [{region: 3}, {region: 2}, {region: 2}, {region: 2}, {region: 2}, {region: 2}]
];
*/

/*const tableroPredefinido = [
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

function esEmparejamientoUnico(pareja, adyacenciasRegiones) {
  // Construir grafo complementario adyComp: mapa region -> Set(regiones no adyacentes)
  const regiones = Object.keys(adyacenciasRegiones).map(r => Number(r));
  const adyComp = {};
  regiones.forEach(r => {
    adyComp[r] = new Set();
    regiones.forEach(s => {
      if (s !== r && !adyacenciasRegiones[r].has(s)) {
        adyComp[r].add(s);
      }
    });
  });
  // Ahora comprobar si el emparejamiento en adyComp es único: no hay ciclo alternante.
  // Representamos el matching M: pareja[r] = s, pareja[s] = r.
  const visitedStack = new Set();
  // Vamos a intentar detectar ciclo alternante: 
  // Para cada vértice iniciaremos una búsqueda alternante.
  const regionesArr = regiones;
  for (const start of regionesArr) {
    // DFS alternante: estado = { nodo actual, paso: 0 o 1 }, 
    // paso=0: busco arista fueraMatching, paso=1: busco arista enMatching.
    const stack = [];
    // Para evitar loops infinitos, guardamos (nodo, paso, origen) en visitedLocal
    const visitedLocal = new Set();
    stack.push({ node: start, paso: 0, origen: start });
    while (stack.length) {
      const { node, paso, origen } = stack.pop();
      const key = `${node},${paso},${origen}`;
      if (visitedLocal.has(key)) continue;
      visitedLocal.add(key);
      if (paso === 0) {
        // Debemos tomar arista fueraMatching en adyComp: es decir, vecinos v en adyComp[node] 
        // que NO sean pareja[node].
        for (const v of adyComp[node]) {
          if (pareja[node] === v) continue; // esta es arista enMatching, no la tomamos aquí
          // Avanzamos al siguiente paso buscando arista enMatching
          stack.push({ node: v, paso: 1, origen });
        }
      } else {
        // paso === 1: buscamos arista enMatching: es decir, unique pareja de 'node'
        const p = pareja[node];
        if (p == null) continue; // no emparejada, pero en emparejamiento perfecto no debería suceder
        // Si p es el origen y ciclo de longitud >= 4: hemos encontrado ciclo alternante
        // Para verificar longitud >= 4: podríamos llevar un contador de pasos, pero 
        // dado que alternamos paso 0 y 1, y aseguramos no volver inmediatamente, 
        // una forma simple es que si p === origen en un paso 1 y no es la primera expansión, 
        // lo consideramos ciclo de longitud al menos 2 aristas enMatching+fueraMatching.
        if (p === origen) {
          // encontrado ciclo alternante: emparejamiento no único
          return false;
        }
        // Sino, seguimos la búsqueda con paso 0:
        stack.push({ node: p, paso: 0, origen });
      }
    }
  }
  // Si para ningún vértice encontramos ciclo alternante, el matching es único.
  return true;
}


function apareamientoNoAdyacente(adyacencias) {
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

export function generarTableroSoluble(filas, columnas, cantidadRegiones) {
  while (true) {
    const tablero = generarRegionesAleatorias(filas, columnas, cantidadRegiones);
    const ady = calcularAdyacencias(tablero);
    const pareja = apareamientoNoAdyacente(ady);
    if(esEmparejamientoUnico(pareja,ady)) continue;
    if (!pareja) continue;      
    if (!asignarFlechasSolucion(tablero, pareja)) continue;
    return tablero;
  }
}

export function generarTableroConUnicaSolucion(filas, columnas, numRegiones) {
  while (true) {
    const tablero = generarRegionesAleatorias(filas, columnas, numRegiones);
    const ady = calcularAdyacencias(tablero);
    const parejas = apareamientoNoAdyacente(ady);
    if (!parejas) continue;

    // Asignamos solución completa
    if (!asignarFlechasSolucion(tablero, parejas)) continue;

    // Eliminamos flechas mientras la unicidad persista
    const posicionesConFlechas = obtenerTodasLasFlechas(tablero); // [{x, y, flecha}, ...]
    mezclarArray(posicionesConFlechas);

    for (const pos of posicionesConFlechas) {
      const backup = tablero[pos.y][pos.x].flecha;
      tablero[pos.y][pos.x].flecha = '';

      const numSoluciones = contarSoluciones(tablero, 2);
      if (numSoluciones !== 1) {
        tablero[pos.y][pos.x].flecha = backup;
        //continue;
      }
    }

    // Al terminar, marcamos las flechas restantes como fijas (pistas mínimas)
    for (let i = 0; i < filas; i++) {
      for (let j = 0; j < columnas; j++) {
        const celda = tablero[i][j];
        if (celda.flecha) {
          celda.fija = true;
        } else {
          // opcional: aseguramos que no quede undefined
          celda.fija = false;
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
              // A continuación añadimos condicionalmente el borde
              ...(esPista
                // Opción 1: reemplazar completamente con borde verde de 3px
                //? { border: '3px solid pink' }
                // Opción 2: si prefieres conservar el borde negro de región y añadir un borde verde interior,
                // puedes descomentar la línea de abajo y comentar la opción anterior:
                 ? {
                     borderTop: borde.borderTop,
                     borderRight: borde.borderRight,
                     borderBottom: borde.borderBottom,
                     borderLeft: borde.borderLeft,
                     boxShadow: 'inset 0 0 0 4px green' // borde interior verde de 2px
                }
                // Opción 3: si prefieres un borde negro exterior y un “outline” verde (fuera):
                // ? {
                //     borderTop: borde.borderTop,
                //     borderRight: borde.borderRight,
                //     borderBottom: borde.borderBottom,
                //     borderLeft: borde.borderLeft,
                //     outline: '2px solid green', // nota: outline no ocupa espacio de layout
                //   }
                // Opción 4: simplemente colorear todos los lados de verde, reemplazando el negro:
                // ? {
                //     borderTop: '3px solid green',
                //     borderRight: '3px solid green',
                //     borderBottom: '3px solid green',
                //     borderLeft: '3px solid green'
                //   }
                : {
                    // Caso no pista: usar borde calculado según región
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
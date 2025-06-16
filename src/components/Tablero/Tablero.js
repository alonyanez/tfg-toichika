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
    const [x1,y1] = celdasPorRegion[r][Math.floor(Math.random() * celdasPorRegion[r].length)];
    const [x2,y2] = celdasPorRegion[s][Math.floor(Math.random() * celdasPorRegion[s].length)];

    if (x1 === x2) {
      if (y1 < y2) {
        tablero[x1][y1].flecha = '→';
        tablero[x2][y2].flecha = '←';
      } else {
        tablero[x1][y1].flecha = '←';
        tablero[x2][y2].flecha = '→';
      }
    } else if (y1 === y2) {
      if (x1 < x2) {
        tablero[x1][y1].flecha = '↓';
        tablero[x2][y2].flecha = '↑';
      } else {
        tablero[x1][y1].flecha = '↑';
        tablero[x2][y2].flecha = '↓';
      }
    } else {
      return false;
    }

  }

  return true;
}

export function generarTableroSoluble(filas, columnas, cantidadRegiones) {
  while (true) {
    const tablero = generarRegionesAleatorias(filas, columnas, cantidadRegiones);
    const ady = calcularAdyacencias(tablero);
    const pareja = apareamientoNoAdyacente(ady);
    if (!pareja) continue;      
    if (!asignarFlechasSolucion(tablero, pareja)) continue;
    return tablero;
  }
}

export function generarTableroConUnicaSolucion(filas, cols, numRegiones) {
  while (true) {
    const tablero = generarRegionesAleatorias(filas, cols, numRegiones);
    const ady = calcularAdyacencias(tablero);
    const pareja = apareamientoNoAdyacente(ady);
    if (!pareja) continue;
    if (!asignarFlechasSolucion(tablero, pareja)) continue;

    //if (contarSoluciones(tablero, 2) === 1) {
      return tablero;
    //}
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
    // Genera tablero con solución única y selecciona una pista
    const full = generarTableroConUnicaSolucion(size, size, 10);
    const sol = obtenerSolucion(full);
    // Si por algún error no hay solución, revenimos a generación
    if (!sol) return generarTableroConUnicaSolucion(size, size, 10);

    const pistas = [];
    sol.forEach((fila, x) =>
      fila.forEach((c, y) => c.flecha && pistas.push({ x, y, flecha: c.flecha }))
    );

    const { x, y, flecha } =
      pistas[Math.floor(Math.random() * pistas.length)];

    return full.map((fila, i) =>
      fila.map((cel, j) =>
        i === x && j === y ? { ...cel, flecha } : { ...cel, flecha: '' }
      )
    );
  }, [size]);

  useEffect(() => {
    const tab = generarTablero();
    setTablero(tab);
    onTableroGenerado?.(tab);
  }, [generarTablero, onTableroGenerado]);

   const getBordeEstilo = useCallback((x, y) => {
      const borders = {
        borderTop: '3px solid #666',
        borderRight: '3px solid #666',
        borderBottom: '3px solid #666',
        borderLeft: '3px solid #666'
      };
      
      // Verificar vecinos
      //si x es mayor o menor a los limites del tablero y la region xy del tablero es distinta a la region x+/-1 y
      if (x > 0 && tablero[x][y]?.region !== tablero[x - 1][y]?.region) {
        borders.borderTop = '3px solid #000000';
      }
      if (x < size - 1 && tablero[x][y]?.region !== tablero[x + 1][y]?.region) {
        borders.borderBottom = '3px solid #000000';
      }
  
      //si y es mayor o menor a los limites del tablero y la region xy del tablero es distinta a la region x y+1/-1
      if (y > 0 && tablero[x][y]?.region !== tablero[x][y - 1]?.region) {
        borders.borderLeft = '3px solid #000000';
      }
      if (y < size - 1 && tablero[x][y]?.region !== tablero[x][y + 1]?.region) {
        borders.borderRight = '3px solid #000000';
      }
  
      if (x === 0 ){
        borders.borderTop = '3px solid #000000';
      } else if(x === size - 1) {
        borders.borderBottom = '3px solid #000000';
      }
  
      if (y === 0 ){
        borders.borderLeft = '3px solid #000000';
      } else if(y === size - 1) {
        borders.borderRight = '3px solid #000000';
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
          fila.map((celda, y) => (
            <div
              key={`${x}-${y}`}
              onClick={() => manejarClickCelda(x, y)}
              style={{
                cursor: 'pointer',
                width: 50,
                height: 50,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 24,
                backgroundColor: `hsl(${celda.region * 30}, 80%, 75%)`,
                ...getBordeEstilo(x, y)
              }}
            >
              {celda.flecha}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Tablero;

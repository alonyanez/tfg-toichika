import React, { useState, useEffect, useCallback } from 'react';
import './Tablero.css';

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

        mezclar(candidatos); // Para aleatoriedad

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
    console.warn("No se pudo completar el tablero, reintentando...");
    return generarRegionesAleatorias(filas, columnas, cantidadRegiones);
  }

  return tablero;
}

const obtenerSiguienteFlecha = (actual) => {
  const index = FLECHAS.indexOf(actual);
  return FLECHAS[(index + 1) % FLECHAS.length];
};

function Tablero({size, onTableroGenerado, onTableroChange}){
  const [tablero, setTablero] = useState([]);

  const manejarClickCelda = (x, y) => {
    setTablero(prevTablero => {
      const nuevoTablero = prevTablero.map((fila, i) =>
        fila.map((celda, j) => 
          i === x && j === y 
          ? { ...celda, flecha: obtenerSiguienteFlecha(celda.flecha) } 
          : celda
        )
      );

      if (onTableroChange) onTableroChange(nuevoTablero);
      return nuevoTablero;
    });
  };

  const generarTablero = useCallback(() => {
    const nuevoTablero = generarRegionesAleatorias(size, size, 10);
    return nuevoTablero;
  }, [size]);
  
  useEffect(() => {
    const nuevoTablero = generarTablero();
    setTablero(nuevoTablero);
    if(onTableroGenerado) onTableroGenerado(nuevoTablero);
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
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${size}, 50px)`,
        gridTemplateRows: `repeat(${size}, 50px)`
      }}>
        {tablero.map((row, x) =>
          row.map((celda, y) => (
            <div
              key={`${x}-${y}`}
              onClick={(e) => manejarClickCelda(x, y, 0)}
              onContextMenu={(e) => {
                e.preventDefault(); 
                manejarClickCelda(x, y, 2);
              }}
              style={{
                cursor: 'pointer',
                width: '50px',
                height: '50px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                fontSize: '24px', 
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
}

export default Tablero;


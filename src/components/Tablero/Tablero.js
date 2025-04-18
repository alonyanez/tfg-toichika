import React, { useState, useEffect, useCallback } from 'react';
import './Tablero.css';

function Tablero({size, onTableroGenerado}){

  const [tablero, setTablero] = useState([]);

  const FLECHAS = ['', '↑', '→', '↓', '←'];

  const obtenerSiguienteFlecha = (actual) => {
    const index = FLECHAS.indexOf(actual);
    return FLECHAS[(index + 1) % FLECHAS.length];
  };

  const manejarClickCelda = (x, y) => {
    setTablero(prevTablero => {
      const nuevoTablero = prevTablero.map((fila, i) =>
        fila.map((celda, j) => {
          if (i === x && j === y) {
            return {
              ...celda,
              flecha: obtenerSiguienteFlecha(celda.flecha)
            };
          }
          return celda;
        })
      );

      //onTableroGenerado(nuevoTablero);
      return nuevoTablero;
    });
  };

  /*
  [
   [0],[1],[1],[2],[3],[3],
   [0],[0],[4],[2],[2],[2],
   [0],[5],[4],[4],[4],[2],
   [5],[5],[4],[4],[8],[9],
   [6],[6],[7],[7],[8],[10],
   [11],[11],[11],[11],[11],[10]
  ]
  */
  const generarTablero = useCallback(() => {
    if( size !== 6 ){
      console.error("Solo se admite tamaño 6 en este tablero predefinido");
      return Array.from({ length: size }, () => 
      Array.from({ length: size }, () => ({ region: 0, flecha: 'VACIO' }))
    );
    }

    const tableroPredefinido = [
      [{region: 0}, {region: 0}, {region: 0}, {region: 0}, {region: 0}, {region: 1}],
      [{region: 3}, {region: 4}, {region: 4}, {region: 4}, {region: 4}, {region: 1}],
      [{region: 3}, {region: 4}, {region: 5}, {region: 5}, {region: 5}, {region: 1}],
      [{region: 3}, {region: 6}, {region: 6}, {region: 6}, {region: 6}, {region: 1}],
      [{region: 3}, {region: 7}, {region: 7}, {region: 7}, {region: 6}, {region: 1}],
      [{region: 3}, {region: 2}, {region: 2}, {region: 2}, {region: 2}, {region: 2}]
    ];

    const nuevoTablero = tableroPredefinido.map(row => 
      row.map(celda => ({
        region: celda.region,
        flecha: 'VACIO'
      }))
    );

    //nuevoTablero[0][5].flecha = '↓';
    //nuevoTablero[1][4].flecha = '←';
    //nuevoTablero[3][4].flecha = '←';
    //nuevoTablero[5][2].flecha = '↑';

    //setTablero(nuevoTablero);
    //onTableroGenerado(nuevoTablero); // Actualizar el estado padre

  return nuevoTablero;
  }, [size]); // Añade la dependencia

  useEffect(() => {
    const nuevoTablero = generarTablero();
    setTablero(nuevoTablero);
    onTableroGenerado(nuevoTablero);
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
              onClick={() => manejarClickCelda(x, y)}
              style={{
                cursor: 'pointer',
                width: '50px',
                height: '50px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: `hsl(${celda.region * 40}, 70%, 90%)`,
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


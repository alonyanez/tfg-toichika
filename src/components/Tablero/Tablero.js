import React, { useState, useEffect, useCallback } from 'react';
import './Tablero.css';

function Tablero({size, onTableroGenerado}){

  const [tablero, setTablero] = useState([]);

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
    
    const tableroPredefinido = [
      [{region: 0}, {region: 1}, {region: 1}, {region: 2}, {region: 3}, {region: 3}],
      [{region: 0}, {region: 0}, {region: 4}, {region: 2}, {region: 2}, {region: 2}],
      [{region: 0}, {region: 5}, {region: 4}, {region: 4}, {region: 4}, {region: 2}],
      [{region: 5}, {region: 5}, {region: 4}, {region: 4}, {region: 8}, {region: 9}],
      [{region: 6}, {region: 6}, {region: 7}, {region: 7}, {region: 8}, {region: 10}],
      [{region: 11}, {region: 11}, {region: 11}, {region: 11}, {region: 11}, {region: 10}]
    ];

    const nuevoTablero = tableroPredefinido.map(row => 
      row.map(celda => ({
        region: celda.region,
        flecha: 'VACIO'
      }))
    );

    setTablero(nuevoTablero);
    onTableroGenerado(nuevoTablero); // Actualizar el estado padre

  return nuevoTablero;
  }, [onTableroGenerado]); // Añade la dependencia

  useEffect(() => {
    generarTablero();
  }, [generarTablero]);


  useEffect(() => {
    const nuevoTablero = generarTablero(size);
    setTablero(nuevoTablero);
  }, [generarTablero, size]);
  
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
              style={{
                width: '50px',
                height: '50px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: `hsl(${celda.region * 40}, 70%, 90%)`,
                ...getBordeEstilo(x, y)
              }}
            >
              {celda.flecha !== 'VACIO' && celda.flecha}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Tablero;

/*
function Tablero({ size }) {
  const [tablero, setTablero] = useState([]);
  const [regiones, setRegiones] = useState([]);

  const generarRegiones = useCallback((size, numFlechas) => {
    const grid = Array.from({ length: size }, () => 
      Array(size).fill({ region: -1, flecha: 'VACIO' })
    );
    const regiones = [];
    
    // Generar posiciones iniciales aleatorias para cada región
    const posiciones = Array.from({ length: numFlechas },  (_, index) => ({
      x: Math.min(index, size - 1),
      y: Math.min(index, size - 1)
    }));
    
    // Expandir regiones
    posiciones.forEach((pos, index) => {
      const regionCells = new Set([`${pos.x},${pos.y}`]);
      const crecimiento = Math.floor((size * size) / numFlechas);
      
      for (let i = 0; i < crecimiento; i++) {
        const temp = Array.from(regionCells);
        const celda = temp[Math.floor(Math.random() * temp.length)].split(',').map(Number);
        
        // Obtener vecinos
        const vecinos = [
          [celda[0] - 1, celda[1]],
          [celda[0] + 1, celda[1]],
          [celda[0], celda[1] - 1],
          [celda[0], celda[1] + 1]
        ].filter(([x, y]) => 
          x >= 0 && x < size && 
          y >= 0 && y < size && 
          !regionCells.has(`${x},${y}`)
        );
        
        if (vecinos.length > 0) {
          const vecino = vecinos[Math.floor(Math.random() * vecinos.length)];
          regionCells.add(`${vecino[0]},${vecino[1]}`);
        }
      }
      
      // Marcar región en el grid
      regionCells.forEach(celda => {
        const [x, y] = celda.split(',').map(Number);
        if (grid[x][y].region === -1) {
          grid[x][y] = { region: index, flecha: 'VACIO' };
        }
      });
      
      regiones.push(regionCells);
    });
    
    return { grid, regiones };
  }, []);

  const colocarFlechas = useCallback((grid, regiones) => {
    const flechas = ['↑', '↓', '←', '→'];
    const nuevoGrid = [...grid];
    
    regiones.forEach((region, index) => {
      const celdas = Array.from(region);
      const celdaAleatoria = celdas[Math.floor(Math.random() * celdas.length)].split(',').map(Number);
      nuevoGrid[celdaAleatoria[0]][celdaAleatoria[1]].flecha = flechas[index % flechas.length];
    });
    
    return nuevoGrid;
  }, []);

  const crearTablero = useCallback((size, numFlechas) => {
    const { grid, regiones } = generarRegiones(size, numFlechas);
    return colocarFlechas(grid, regiones);
  }, [generarRegiones, colocarFlechas]);

  useEffect(() => {
    const flechas = ['↑', '↓', '←', '→'];
    const tableroInicial = crearTablero(size, flechas.length);
    setTablero(tableroInicial);
  }, [size, crearTablero]);

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
              style={{
                width: '50px',
                height: '50px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: `hsl(${celda.region * 60}, 30%, 90%)`,
                ...getBordeEstilo(x, y)
              }}
            >
              {celda.flecha !== 'VACIO' && celda.flecha}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Tablero;

//Funcion para crear la matriz
function crearTablero(n){
    const matriz = [];
    for(let i = 0; i<n; i++){
        const fila = [];
        for(let j = 0; j<n; j++){
            fila.push(0); //inicializa la celda como 0
        }
        matriz.push(fila);
    }
    return matriz;
}
*/

//Funcion para inicializar y crear el tablero
/*

function Tablero({ size }) {
    const [tablero, setTablero] = useState([]);
  
    const generarFlechasEnArea = useCallback((tablero, startX, startY, areaSize, flechas) => {
      const indice = getRandomNumber(0, flechas.length - 1);
      const flechaActual = flechas[indice];
  
      const posX = getRandomNumber(startX, startX + areaSize - 1);
      const posY = getRandomNumber(startY, startY + areaSize - 1);
  
      tablero[posX][posY] = flechaActual;
    }, []);
  
    const esAreaVacia = useCallback((tablero, startX, startY, areaSize) => {
      for (let i = startX; i < startX + areaSize; i++) {
        for (let j = startY; j < startY + areaSize; j++) {
          if (tablero[i][j] !== 'VACIO') {
            return false;
          }
        }
      }
      return true;
    }, []);
  
    const hayAreaVacia = useCallback((tablero) => {
      for (let i = 0; i < tablero.length; i++) {
        for (let j = 0; j < tablero[i].length; j++) {
          if (tablero[i][j] === 'VACIO') {
            return true;
          }
        }
      }
      return false;
    }, []);
  
    const crearAreas = useCallback((tablero) => {
      const flechas = ['↑', '↓', '←', '→'];
      const tableroSize = tablero.length;
      let intento = 0;
      const maxIntento = 1000; // Limitar el número de intentos
  
      while (hayAreaVacia(tablero) && intento < maxIntento) {
        const areaSize = getRandomNumber(1, Math.floor(tableroSize / 2));
        const startX = getRandomNumber(0, tableroSize - areaSize);
        const startY = getRandomNumber(0, tableroSize - areaSize);
  
        if (esAreaVacia(tablero, startX, startY, areaSize)) {
          generarFlechasEnArea(tablero, startX, startY, areaSize, flechas);
        }
  
        intento++;
      }
   
      if (intento === maxIntento) {
        console.warn('Se alcanzó el número máximo de intentos al poblar el tablero.');
      }
    }, [hayAreaVacia, esAreaVacia, generarFlechasEnArea]);
  
    const crearTablero = useCallback((size) => {
      const tablero = Array.from({ length: size },
        () => Array.from({ length: size }, () => 'VACIO'));
      crearAreas(tablero);
      return tablero;
    }, [crearAreas]);
  
    useEffect(() => {
      const tableroInicial = crearTablero(size);
      setTablero(tableroInicial);
    }, [size, crearTablero]);
  
    function getRandomNumber(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }
  
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: `repeat(${size}, 50px)`, 
          gridTemplateRows: `repeat(${size}, 50px)` 
        }}>
          {tablero.map((row, rowIndex) =>
            row.map((cell, cellIndex) =>
              <div
                key={`${rowIndex}-${cellIndex}`}
                style={{
                  width: '50px',
                  height: '50px',
                  border: '1px solid black',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                {cell !== 'VACIO' && cell !== 'OCUPADO' ? cell : ''}
              </div>
            ))
          }
            </div>
        </div>
      </div>
    );
  }

  
export default Tablero;

/*
    const manejarCambio = (filaIndex, colIndex, valor) => {
        const nuevoValor = parseInt(valor, 10);

        const nuevoTablero = tablero.map((fila, i) => {
            if (i === filaIndex) {
                return fila.map((celda, j) => {
                    if (j === colIndex) {
                        return nuevoValor >= 1 && nuevoValor <= 9 ? nuevoValor : 0;
                    }
                    return celda;
                });
            }
            return fila;
        });

        setTablero(nuevoTablero);
    };
    */
    /*
    return (
        <div 
            className="tablero"
            style={{
                gridTemplateColumns: `repeat(${tamaño}, 1fr)`,
                gridTemplateRows: `repeat(${tamaño}, 1fr)`
            }}
        >
            {tablero.map((fila, filaIndex) => (
                <div key={filaIndex} className="fila">
                    {fila.map((celda, colIndex) => (
                        <div
                            key={colIndex}
                            className={`celda ${celda === 0 ? 'vacía' : ''}`}
                        >
                            <input
                                type="number"
                                min="1"
                                max="9"
                                value={celda === 0 ? '' : celda}
                                onChange={(e) => manejarCambio(filaIndex, colIndex, e.target.value)}
                                disabled={celda !== 0}
                            />
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
    */
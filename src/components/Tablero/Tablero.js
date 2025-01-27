import React, { useState, useEffect, useCallback } from 'react';
import './Tablero.css';

/*
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
;

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
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
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
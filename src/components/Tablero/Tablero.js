import React, { useEffect, useState } from 'react';
import './Tablero.css';

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



function Tablero({tamaño}) {
    const tableroInicial = crearTablero(tamaño);
    const [tablero, setTablero] = useState(tableroInicial);

    useEffect(() => {
        setTablero(crearTablero(tamaño));
    }, [tamaño]);

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
}
export default Tablero;
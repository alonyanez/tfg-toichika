import React, { useState } from 'react';
import './Tablero.css';
const tableroInicial = [
    [5, 3, 0, 0, 7, 0, 0, 0, 0],
    [6, 0, 0, 1, 9, 5, 0, 0, 0],
    [0, 9, 8, 0, 0, 0, 0, 6, 0],
    [8, 0, 0, 0, 6, 0, 0, 0, 3],
    [4, 0, 0, 8, 0, 3, 0, 0, 1],
    [7, 0, 0, 0, 2, 0, 0, 0, 6],
    [0, 6, 0, 0, 0, 0, 2, 8, 0],
    [0, 0, 0, 4, 1, 9, 0, 0, 5],
    [0, 0, 0, 0, 8, 0, 0, 7, 9]
];

function Tablero() {
    const [tablero, setTablero] = useState(tableroInicial);

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
        <div className="tablero">
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
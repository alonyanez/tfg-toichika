import React, {useState} from "react";


const PedirValor = ( {onActualizar} ) => {
    const [valor, setValor] = useState("");

    const handleInputChange = (event) => {
        setValor(event.target.value); //actualiza el estado del valor
    };

    const handleSubmit = (event) => {
        event.preventDefault(); //evita que recargue la página
        //alert('El valor ingresado es: ${valor}');
        onActualizar(valor);
        setValor("");
    }

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <label htmlFor="valor">Ingresa un tamaño para el tablero:</label>
                <input
                    type = "number"
                    id = "valor"
                    value = {valor}
                    onChange={handleInputChange}
                />
                <button type = "submit">Generar tablero</button>
            </form>
        </div>
    );
};

export default PedirValor;
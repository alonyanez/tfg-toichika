import './App.css';
import Tablero from './components/Tablero/Tablero';
import PedirValor from './components/pedirValor';
import React, { useState } from 'react';

function App() {
  const [tamaño, setTamaño] = useState(3);

  const actualizarTamaño = (nuevoTamaño) => {
    setTamaño(parseInt(nuevoTamaño, 10));
  }

  return (
    <div >
      <div style={{ textAlign: 'center'}}>
        <h1>¡Bienvenido!</h1>
        <PedirValor onActualizar={actualizarTamaño}/>
      </div>

      <h1  style={{ textAlign: 'center'}}>Tablero de Toichika</h1>
      <Tablero tamaño={tamaño}/>
   </div>
  );
}

export default App;

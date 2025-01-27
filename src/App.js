import './App.css';
import Tablero from './components/Tablero/Tablero';
import PedirValor from './components/pedirValor';
import React, { useState } from 'react';

function App() {
  const [size, setSize] = useState(5);

  const actualizarSize = (nuevoSize) => {
    setSize(parseInt(nuevoSize, 10));
  }

  return (
    <div >
      <div style={{ textAlign: 'center'}}>
        <h1>¡Bienvenido!</h1>
        <PedirValor onActualizar={actualizarSize}/>
      </div>

      <h1  style={{ textAlign: 'center'}}>Tablero de Toichika</h1>
      <Tablero size={size}/>
   </div>
  );
}

export default App;

import './App.css';
import Tablero from './components/Tablero/Tablero';
import Resolver from './components/Tablero/ResolverToichika';
import PedirValor from './components/pedirValor';
import React, { useState } from 'react';

function App() {
  const [size, setSize] = useState(6);
  const [tableroState, setTableroState] = useState([]);

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
      <Tablero 
        size={size} 
        onTableroGenerado={setTableroState} // Pasa el callback
      />
      <Resolver tablero={tableroState}
                onSolucionInvalida={() => alert('¡Solución inválida!')}/> 
      <br/>
      
   </div>
  );
}

export default App;

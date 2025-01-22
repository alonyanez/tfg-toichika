import logo from './logo.svg';
import './App.css';
import Tablero from './components/Tablero/Tablero';

function App() {
  return (
    <div className='App'>
      <div style={{ textAlign: 'center'}}>
        <h1>Hello world!</h1>
        <p>primera prueba</p>
      </div>

      <h1>Tablero de Toichika</h1>
      <Tablero/>
   </div>
  );
}

export default App;

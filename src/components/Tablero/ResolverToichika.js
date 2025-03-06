import React, { useState, useEffect} from 'react';


// Función para encontrar las áreas en el tablero

const encontrarAreas = (tablero) => {
  const areas = {};
  tablero.forEach((fila, i) => {
    fila.forEach((celda, j) => {
      const region = celda.region;
      if (!areas[region]) areas[region] = [];
      areas[region].push([i, j]);
    });
  });
  return areas;
};

const obtenerDireccion = (actual, siguiente) => {
  const [x1, y1] = actual;
  const [x2, y2] = siguiente;
  
  if (x2 === x1 - 1) return '↑';
  if (x2 === x1 + 1) return '↓';
  if (y2 === y1 - 1) return '←';
  if (y2 === y1 + 1) return '→';
  return 'VACIO';
};

const solucionValida = (tableroSolucion, region) => {
  const celdas = encontrarAreas(tableroSolucion)[region];
  let current = celdas[0];
  const visited = new Set();
  
  while (true) {
    const [x, y] = current;
    if (visited.has(`${x},${y}`)) return false; // Ciclo detectado
    visited.add(`${x},${y}`);
    
    const flecha = tableroSolucion[x][y].flecha;
    if (flecha === 'VACIO') break;
    
    switch (flecha) {
      case '↑': current = [x - 1, y]; break;
      case '↓': current = [x + 1, y]; break;
      case '←': current = [x, y - 1]; break;
      case '→': current = [x, y + 1]; break;
    }
  }
  
  return visited.size === celdas.length;
};

// Mejorado con generación de caminos válidos
const resolverRegiones = (tablero) => {
  const areas = encontrarAreas(tablero);
  const nuevoTablero = JSON.parse(JSON.stringify(tablero));

  Object.entries(areas).forEach(([region, coordenadas]) => {
    // Generar camino usando BFS para conexión real
    const camino = [];
    const visitados = new Set();
    const cola = [coordenadas[0]];
    
    while (cola.length > 0) {
      const actual = cola.shift();
      const [x, y] = actual;
      
      if (!visitados.has(`${x},${y}`)) {
        visitados.add(`${x},${y}`);
        camino.push(actual);
        
        // Obtener vecinos válidos
        const vecinos = [
          [x - 1, y], // Arriba
          [x + 1, y], // Abajo
          [x, y - 1], // Izquierda
          [x, y + 1]  // Derecha
        ].filter(([nx, ny]) => 
          coordenadas.some(([cx, cy]) => cx === nx && cy === ny) &&
          !visitados.has(`${nx},${ny}`)
        );
        
        cola.push(...vecinos);
      }
    }

    // Asignar flechas
    camino.forEach(([x, y], index) => {
      if (index < camino.length - 1) {
        const direccion = obtenerDireccion([x, y], camino[index + 1]);
        nuevoTablero[x][y].flecha = direccion;
      } else {
        nuevoTablero[x][y].flecha = 'VACIO';
      }
    });
  });

  return nuevoTablero;
};

function Resolver({ tablero }) {
  const [solucion, setSolucion] = useState([]);
  const [intentos, setIntentos] = useState(0);

  useEffect(() => {
    if (tablero.length > 0) {
      let solucionGenerada;
      let valida = false;
      let maxIntentos = 5;
      
      // Intentar hasta encontrar solución válida
      do {
        solucionGenerada = resolverRegiones(tablero);
        const regiones = Object.keys(encontrarAreas(tablero));
        valida = regiones.every(region => 
          solucionValida(solucionGenerada, parseInt(region))
        );
        setIntentos(prev => prev + 1);
      } while (!valida && intentos < maxIntentos);

      if (valida) {
        setSolucion(solucionGenerada);
      } else {
        console.error("No se encontró solución válida");
      }
    }
  }, [tablero]);

  return (
    <div style={{ margin: '20px', padding: '20px', border: '1px solid #ccc' }}>
      <h3>Solución Generada:</h3>
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${tablero[0]?.length || 0}, 50px)`,
        gap: '2px',
        justifyContent: 'center'
      }}>
        {solucion.map((fila, x) =>
          fila.map((celda, y) => (
            <div
              key={`${x}-${y}`}
              style={{
                width: '50px',
                height: '50px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: `hsl(${celda.region * 40}, 70%, 90%)`,
                border: '1px solid #666'
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

export default Resolver;


/*
// Función para encontrar las áreas en el tablero
const encontrarAreas = (tablero) => {

    //Diccionario de areas, ej: {[0]:[(0,0),(0,1)],[1]:[(1,0)]}
    const areas = {};
    let areaIndex = 0;
  
    //Revisa el tablero para encontrar cada área
    const explorarArea = (i, j, areaIndex, visited) => {
      if (i < 0 || j < 0 || i >= tablero.length || j >= tablero[0].length || visited[i][j]) return;
  
      //Marca el punto (i,j) del tablero como visto y lo agrega a la lista de puntos visitados para ese area al diccionario
      visited[i][j] = true;
      areas[areaIndex].push([i, j]);
  
      const flechas = tablero[i][j];
      if (flechas.includes('↓')) explorarArea(i + 1, j, areaIndex, visited);
      if (flechas.includes('↑')) explorarArea(i - 1, j, areaIndex, visited);
      if (flechas.includes('→')) explorarArea(i, j + 1, areaIndex, visited);
      if (flechas.includes('←')) explorarArea(i, j - 1, areaIndex, visited);
    };
  
    const visited = Array.from({ length: tablero.length }, () => Array(tablero[0].length).fill(false));
  
    for (let i = 0; i < tablero.length; i++) {
      for (let j = 0; j < tablero[0].length; j++) {
        if (!visited[i][j]) {
          areas[areaIndex] = [];
          explorarArea(i, j, areaIndex, visited);
          areaIndex++;
        }
      }
    }
  
    return areas;
  };
  
  function Resolver({ tablero }) {
    const [puntos, setPuntos] = useState([]);
  
    useEffect(() => {
      const inicializarPuntos = () => {
        const nuevoPuntos = [];
        for (let i = 0; i < tablero.length; i++) {
          nuevoPuntos[i] = [];
          for (let j = 0; j < tablero[0].length; j++) {
            nuevoPuntos[i][j] = ['↑', '↓', '←', '→'];
            if (i === 0) {
              nuevoPuntos[i][j] = nuevoPuntos[i][j].filter(f => f !== '←');
            }
            if (j === 0) {
              nuevoPuntos[i][j] = nuevoPuntos[i][j].filter(f => f !== '↑');
            }
            if (i === tablero.length - 1) {
              nuevoPuntos[i][j] = nuevoPuntos[i][j].filter(f => f !== '→');
            }
            if (j === tablero[0].length - 1) {
              nuevoPuntos[i][j] = nuevoPuntos[i][j].filter(f => f !== '↓');
            }
          }
        }
        return nuevoPuntos;
      };
  
      setPuntos(inicializarPuntos());
    }, [tablero]);
  
    useEffect(() => {
      const resolverAreas = () => {
        const nuevoPuntos = [...puntos];
        const areas = encontrarAreas(tablero);
        Object.values(areas).forEach(area => {
          area.forEach((punto, index) => {
            const [i, j] = punto;
            const puntoFinalFila = [i, tablero[0].length - 1];
            const puntoFinalColumna = [tablero.length - 1, j];
  
            if (!area.includes(puntoFinalFila)) {
              const ultimoPuntoFila = area[area.length - 1];
              if (ultimoPuntoFila[0] + 1 !== tablero.length) {
                nuevoPuntos[i][j] = nuevoPuntos[i][j].filter(f => f !== '→');
              }
            }
  
            if (!area.includes(puntoFinalColumna)) {
              const ultimoPuntoColumna = area[area.length - 1];
              if (ultimoPuntoColumna[1] + 1 !== tablero[0].length) {
                nuevoPuntos[i][j] = nuevoPuntos[i][j].filter(f => f !== '↓');
              }
            }
          });
        });
        setPuntos(nuevoPuntos);
      };
  
      resolverAreas();
    }, [puntos, tablero]);
  
    return (
      <div>
        {puntos.map((fila, i) => (
          <div key={i} style={{ display: 'flex' }}>
            {fila.map((punto, j) => (
              <div key={j} style={{ margin: '0 10px' }}>
                {punto.join(', ')}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }
  
  export default Resolver;


/*
function Resolver(){
    const punto = ['↑', '↓', '←', '→']
    //primero eliminamos no posibles posiciones
    //recorremos cada posicion eliminando las no válidas
    for i in range tablero:
        for j in range tablero:
            if i==0:
                //eliminar flecha '←' del punto (i,j)
            if j==0:
                //eliminar flecha '↑' del punto (i,j)
            if i == tablero-1:
                //eliminar flecha '→' del punto (i,j)
            if j == tablero-1:
                //eliminar flecha '↓' del punto (i,j)
    
    //ahora recorremos las áreas
    //areas es un diccionario donde la clave es el numero del area y el valor una lista de puntos
    //entonces sería así {[0]:((0,0),(0,1),(0,2)),[1]:((0,3),(1,3))} 
    for area in areas:
        for listaPuntos in area:
            //ahora tenemos el punto (i,j) tenemos que comprobar con el ultimo punto de sus filas y de sus columnas
            //para averiguar cuantas áreas hay, si hay 2 o menos areas no se puede poner ninguna flecha y se pasa al siguiente punto
            if puntoFinalFila not in listaPuntos:
                if listaPuntos[-1] + (1,0) !== puntoFinalFila:
                    //Como el ultimo punto del area + i+1 no es el ultimo punto del tablero, eso quiere decir que al menos hay 3 areas por ende se cumple la condición
                    //posible valor flecha '→'  
            if puntoFinalColumna not in listaPuntos:
                if listaPuntos[-1] + (0,1) !== puntoFinalColumna:
                    //Como el ultimo punto del area + j+1 no es el ultimo punto del tablero, eso quiere decir que al menos hay 3 areas por ende se cumple la condición
                    //posible valor flecha '↓'  
}
*/
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
  const flechas = celdas.filter(([x, y]) => tableroSolucion[x][y].flecha !== 'VACIO');
  
  // Si la región ya tenía una flecha predefinida, validar su par
  if (flechas.length === 1) {
    const [x, y] = flechas[0];
    let tx = x, ty = y;
    let pasos = 0;
    
    while (true) {
      switch(tableroSolucion[tx][ty].flecha) {
        case '→': ty++; break;
        case '←': ty--; break;
        case '↓': tx++; break;
        case '↑': tx--; break;
        default: return false;
      }
      
      if (tx < 0 || ty < 0 || tx >= tableroSolucion.length || ty >= tableroSolucion[0].length) return false;
      
      if (tableroSolucion[tx][ty].flecha !== 'VACIO') {
        return (
          tableroSolucion[tx][ty].flecha === obtenerDireccion([tx, ty], [x, y]) &&
          pasos >= 1 &&
          !sonAdyacentes(region.toString(), tableroSolucion[tx][ty].region.toString(), encontrarAreas(tableroSolucion))
        );
      }
      
      pasos++;
      if (pasos > 10) return false; // Prevenir loops infinitos
    }
  }
  
  return flechas.length === 0; // Región vacía aún no resuelta
};

const sonAdyacentes = (regionA, regionB, areas) => {
  const celdasA = areas[regionA];
  const celdasB = areas[regionB];
  
  return celdasA.some(([x1, y1]) => 
    celdasB.some(([x2, y2]) => 
      (Math.abs(x1 - x2) === 1 && y1 === y2) || 
      (Math.abs(y1 - y2) === 1 && x1 === x2)
    )
  );
};

// Encuentra todos los posibles pares válidos entre regiones
const encontrarParesValidos = (areas) => {
  const regiones = Object.keys(areas);
  const pares = [];
  
  for (let i = 0; i < regiones.length; i++) {
    for (let j = i + 1; j < regiones.length; j++) {
      const regionA = regiones[i];
      const regionB = regiones[j];
      
      if (!sonAdyacentes(regionA, regionB, areas)) {
        pares.push([regionA, regionB]);
      }
    }
  }
  return pares;
};

// Genera solución válida
const resolverToichika = (tableroOriginal) => {
  const areas = encontrarAreas(tableroOriginal);
  const nuevoTablero = JSON.parse(JSON.stringify(tableroOriginal)); // Clona el tablero con flechas existentes
  const paresValidos = encontrarParesValidos(areas);
  const regionesDisponibles = new Set(
    Object.keys(areas).filter(region => 
      areas[region].every(([x, y]) => nuevoTablero[x][y].flecha === 'VACIO') // Solo regiones sin flechas
    )
  );

  // Asignar flechas a pares respetando las existentes
  paresValidos.forEach(([regionA, regionB]) => {
    if (!regionesDisponibles.has(regionA) || !regionesDisponibles.has(regionB)) return;

    const celdasA = areas[regionA].filter(([x, y]) => nuevoTablero[x][y].flecha === 'VACIO');
    const celdasB = areas[regionB].filter(([x, y]) => nuevoTablero[x][y].flecha === 'VACIO');

    // Encontrar pares alineados en celdas vacías
    const posiblesPares = [];
    celdasA.forEach(([x1, y1]) => {
      celdasB.forEach(([x2, y2]) => {
        if (x1 === x2 && Math.abs(y1 - y2) > 1) {
          posiblesPares.push({tipo: 'horizontal', c1: [x1, y1], c2: [x2, y2]});
        }
        if (y1 === y2 && Math.abs(x1 - x2) > 1) {
          posiblesPares.push({tipo: 'vertical', c1: [x1, y1], c2: [x2, y2]});
        }
      });
    });

    if (posiblesPares.length === 0) return;

    const par = posiblesPares[Math.floor(Math.random() * posiblesPares.length)];
    // Asignar flechas solo en celdas vacías
    if (par.tipo === 'horizontal') {
      nuevoTablero[par.c1[0]][par.c1[1]].flecha = par.c1[1] < par.c2[1] ? '→' : '←';
      nuevoTablero[par.c2[0]][par.c2[1]].flecha = par.c1[1] < par.c2[1] ? '←' : '→';
    } else {
      nuevoTablero[par.c1[0]][par.c1[1]].flecha = par.c1[0] < par.c2[0] ? '↓' : '↑';
      nuevoTablero[par.c2[0]][par.c2[1]].flecha = par.c1[0] < par.c2[0] ? '↑' : '↓';
    }

    regionesDisponibles.delete(regionA);
    regionesDisponibles.delete(regionB);
  });

  return nuevoTablero;
};

// Componente Resolver actualizado
function Resolver({ tablero }) {
  const [solucion, setSolucion] = useState([]);

  useEffect(() => {
    if (tablero.length === 0) return;
  
    const generarSolucionValida = () => {
      let mejorSolucion = null;
      let mejorPuntaje = -Infinity;
      
      // Ejecutar 100 iteraciones para encontrar la mejor solución
      for (let i = 0; i < 100; i++) {
        const solucionGenerada = resolverToichika(tablero);
        const regiones = Object.keys(encontrarAreas(tablero));
        const valida = regiones.every(region => solucionValida(solucionGenerada, parseInt(region)));
        
        if (valida) return solucionGenerada;
        
        // Calcular puntaje de solución parcial
        const puntaje = regiones.filter(region => 
          solucionValida(solucionGenerada, parseInt(region))
        ).length;
        
        if (puntaje > mejorPuntaje) {
          mejorPuntaje = puntaje;
          mejorSolucion = solucionGenerada;
        }
      }
      
      return mejorSolucion;
    };
  
    const solucion = generarSolucionValida();
    solucion ? setSolucion(solucion) : console.error("No se encontró solución perfecta");
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
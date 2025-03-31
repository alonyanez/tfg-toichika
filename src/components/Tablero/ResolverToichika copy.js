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
  
  console.log(areas);
  
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
      if (pasos > 100) return false; // Prevenir loops infinitos
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
  
  for (let i = 0; i <= regiones.length; i++) {
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
      for (let i = 0; i < 100000; i++) {
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





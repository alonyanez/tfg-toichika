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
  
  //console.log(areas);
  return areas;
};

const caminoRecto = (tablero, inicio, fin) => {
  // Verificar que fin sea un array válido
  if (!Array.isArray(fin)) return false;
  
  const [x1, y1] = inicio;
  const [x2, y2] = fin;
  
  // Solo verificar caminos rectos y adyacentes
  if (x1 === x2 && Math.abs(y1 - y2) > 0) return true; // Celdas adyacentes horizontal
  if (y1 === y2 && Math.abs(x1 - x2) > 0) return true; // Celdas adyacentes vertical
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
  console.log(celdas);
  const flechas = celdas.filter(([x, y]) => tableroSolucion[x][y].flecha !== 'VACIO');
  console.log(flechas, "flechas");
  if (flechas.length < 1){
    return false;
  }else{

    const [x, y] = flechas[0];
    let tx = x, ty = y;
    const flecha = tableroSolucion[x][y].flecha;
    let pasos = 0;
    let camino = [];
    let direccionEsperada = flecha;

    console.log(tableroSolucion, tableroSolucion[0], "Tablero solucion");
    while (true) {
      switch(flecha) {
        case '→': ty++; break;
        case '←': ty--; break;
        case '↓': tx++; break;
        case '↑': tx--; break;
        default: return false;
      }
      camino.push([tx, ty]); // Registrar camino

      if (tx < 0 || ty < 0 || tx >= tableroSolucion.length || ty >= tableroSolucion[0].length) return false;

      // Verificar si hay flecha en el camino (antes de llegar al par)
      if (pasos > 0 && tableroSolucion[tx][ty].flecha !== 'VACIO') return false;

      if (tableroSolucion[tx][ty].flecha !== 'VACIO') {
        // Chequear que todo el camino (excepto extremos) esté vacío
        const caminoIntermedio = camino.slice(0, -1);
        const caminoLimpio = caminoIntermedio.every(([cx, cy]) => 
          tableroSolucion[cx][cy].flecha === 'VACIO'
        );
        
        return (
          caminoLimpio &&
          tableroSolucion[tx][ty].flecha === obtenerDireccion([tx, ty], [x, y]) &&
          !sonAdyacentes(region.toString(), tableroSolucion[tx][ty].region.toString(), encontrarAreas(tableroSolucion))
        );
      }

      pasos++;
      if (pasos > 100) return false;
    }

    return flechas.length === 0; // Región vacía aún no resuelta

  }
  
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
  //console.log(regiones);
  const pares = [];
  
  for (let i = 0; i < regiones.length; i++) {
    for (let j = i+1; j < regiones.length; j++) {
      const regionA = regiones[i];
      const regionB = regiones[j];
      
      if (!sonAdyacentes(regionA, regionB, areas)) {
        pares.push([regionA, regionB]);
      }
    }
  }
  //console.log(pares, "pares");
  return pares;
};

// Genera solución válida
const resolverToichika = (tableroOriginal) => {

  const areas = encontrarAreas(tableroOriginal);
  const regiones = Object.keys(areas);

  const nuevoTablero = JSON.parse(JSON.stringify(tableroOriginal));
  const tableroBorrador = JSON.parse(JSON.stringify(tableroOriginal));
  
  //Identificar regiones can y sin flecha
  const regionesVacias = regiones.filter(region => 
    areas[region].every(([x, y]) => tableroOriginal[x][y].flecha === 'VACIO')
  );

  //console.log(regionesVacias, "region vacia");
  //console.log(areas)

  const regionesFlechaArriba = regiones.filter(region => 
    areas[region].every(([x, y]) => tableroOriginal[x][y].flecha === '↑')
  );

  //console.log(regionesFlechaArriba, "region flecha arriba");

  const regionesFlechasAbajo = regiones.filter(region => 
    areas[region].every(([x, y]) => tableroOriginal[x][y].flecha === '↓')
  );

  const regionesFlechaDer = regiones.filter(region => 
    areas[region].every(([x, y]) => tableroOriginal[x][y].flecha === '→')
  );

  const regionesFlechasIzq = regiones.filter(region => 
    areas[region].every(([x, y]) => tableroOriginal[x][y].flecha === '←')
  );

  // Rellenar el tablero Borrador con todas las posibles flechas que pueden tener
  for (let i=0; i<regionesVacias.length; i++) {
    let area = areas[regionesVacias[i]];
    for (let j=0; j<area.length; j++) {
      let posiblesFlechas = [];
      let punto = area[j];
      console.log(punto,"punto");
      
      if(caminoRecto(tableroOriginal, punto, [tableroBorrador.length-1, punto[1]])){
        posiblesFlechas.push('↓');
      } 

      if(caminoRecto(tableroOriginal, punto, [0, punto[1]])){
        posiblesFlechas.push('↑');
      } 

      if(caminoRecto(tableroOriginal, punto, [punto[0], 0])){
        posiblesFlechas.push('←');
      } 

      if(caminoRecto(tableroOriginal, punto, [punto[0], tableroBorrador.length-1])){
        posiblesFlechas.push('→');
      } 
      
      tableroBorrador[punto[0]][punto[1]].flecha = posiblesFlechas;
    }
  }

  for (let i = 0; i < tableroBorrador.length; i++){

  }


  // 2. Generar todos los pares posibles no adyacentes
  const paresValidos = [];
  for (let i = 0; i < regionesVacias.length; i++) {
    for (let j = i + 1; j < regionesVacias.length; j++) {
      const regionA = regionesVacias[i];
      const regionB = regionesVacias[j];
      if (!sonAdyacentes(regionA, regionB, areas)) {
        paresValidos.push([regionA, regionB]);
      }
    }
  }

  // 3. Mezclar pares para aleatoriedad
  paresValidos.sort(() => Math.random() - 0.5);

  // 4. Procesar pares y asignar flechas
  const regionesAsignadas = new Set();
  paresValidos.forEach(([regionA, regionB]) => {
    if (regionesAsignadas.has(regionA) || regionesAsignadas.has(regionB)) return;

    const posiblesPares = [];
    areas[regionA].forEach(([x1, y1]) => {
      areas[regionB].forEach(([x2, y2]) => {
        if ((x1 === x2 && Math.abs(y1 - y2) > 1) || (y1 === y2 && Math.abs(x1 - x2) > 1)) {
          if (caminoRecto(nuevoTablero, [x1, y1], [x2, y2])) {
            posiblesPares.push({
              tipo: x1 === x2 ? 'horizontal' : 'vertical',
              c1: [x1, y1],
              c2: [x2, y2]
            });
          }
        }
      });
    });

    if (posiblesPares.length === 0) return;

    const par = posiblesPares[Math.floor(Math.random() * posiblesPares.length)];
    // Asignar flechas
    if (par.tipo === 'horizontal') {
      nuevoTablero[par.c1[0]][par.c1[1]].flecha = par.c1[1] < par.c2[1] ? '→' : '←';
      nuevoTablero[par.c2[0]][par.c2[1]].flecha = par.c1[1] < par.c2[1] ? '←' : '→';
    } else {
      nuevoTablero[par.c1[0]][par.c1[1]].flecha = par.c1[0] < par.c2[0] ? '↓' : '↑';
      nuevoTablero[par.c2[0]][par.c2[1]].flecha = par.c1[0] < par.c2[0] ? '↑' : '↓';
    }

    regionesAsignadas.add(regionA);
    regionesAsignadas.add(regionB);
  });

  // 5. Manejar regiones no emparejadas (huérfanas)
  regionesVacias.forEach(region => {
    if (!regionesAsignadas.has(region)) {
      // Asignar flecha temporal y buscar pareja
      const celdas = areas[region];
      const [x, y] = celdas[Math.floor(Math.random() * celdas.length)];
      nuevoTablero[x][y].flecha = '→'; // Flecha temporal
    }
  });

  return tableroBorrador;
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
      for (let i = 0; i < 1000; i++) {
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


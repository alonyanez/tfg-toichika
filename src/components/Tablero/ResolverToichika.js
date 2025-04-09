import React, { useState, useEffect} from 'react';

function buscarFlechaEnDireccion(tablero, f) {
  let { x, y, flecha } = f;
  let dx = 0, dy = 0;
  if (flecha === '↑') dx = -1;
  if (flecha === '↓') dx = 1;
  if (flecha === '←') dy = -1;
  if (flecha === '→') dy = 1;

  x += dx;
  y += dy;

  while (x >= 0 && x < tablero.length && y >= 0 && y < tablero[0].length) {
    const celda = tablero[x][y];
    if (celda.flecha && celda.flecha !== 'VACIO') {
      return { x, y, flecha: celda.flecha, region: celda.region };
    }
    x += dx;
    y += dy;
  }

  return null;
}

function direccionOpuesta(flecha) {
  return { '↑': '↓', '↓': '↑', '←': '→', '→': '←' }[flecha];
}

function hayFlechasEntre(f1, f2, tablero) {
  let dx = Math.sign(f2.x - f1.x);
  let dy = Math.sign(f2.y - f1.y);
  let x = f1.x + dx;
  let y = f1.y + dy;

  while (x !== f2.x || y !== f2.y) {
    if (tablero[x][y].flecha && tablero[x][y].flecha !== 'VACIO') {
      return true;
    }
    x += dx;
    y += dy;
  }

  return false;
}

function sonAdyacentes(f1, f2) {
  const dx = Math.abs(f1.x - f2.x);
  const dy = Math.abs(f1.y - f2.y);
  return (dx + dy === 1);
}


function esValida(tablero) {
  const flechas = [];
  const filas = tablero.length;
  const columnas = tablero[0].length;

  // 1. Recolectar todas las flechas
  for (let x = 0; x < filas; x++) {
    for (let y = 0; y < columnas; y++) {
      const celda = tablero[x][y];
      if (celda.flecha && celda.flecha !== 'VACIO') {
        flechas.push({ x, y, flecha: celda.flecha, region: celda.region });
      }
    }
  }

  // 2. Validar que haya solo una flecha por región
  const flechasPorRegion = {};
  for (let f of flechas) {
    if (flechasPorRegion[f.region]) {
      return false; // Más de una flecha en una región
    }
    flechasPorRegion[f.region] = f;
  }

  const yaEmparejadas = new Set();

  // 3. Validar emparejamientos
  for (let f of flechas) {
    const id = `${f.x},${f.y}`;
    if (yaEmparejadas.has(id)) continue;

    const objetivo = buscarFlechaEnDireccion(tablero, f);

    if (!objetivo) return false; // No encontró una pareja

    // Validar que se apunten mutuamente
    const opuesta = direccionOpuesta(f.flecha);
    if (objetivo.flecha !== opuesta) return false;

    // Validar que no haya otra flecha en medio
    if (hayFlechasEntre(f, objetivo, tablero)) return false;

    // Validar que no estén en regiones adyacentes
    if (sonAdyacentes(f, objetivo)) return false;

    // Marcar como emparejadas
    yaEmparejadas.add(id);
    yaEmparejadas.add(`${objetivo.x},${objetivo.y}`);
  }

  return true;
  
}

const caminoRecto = (tablero, inicio, fin) => {
  // Verificar que fin sea un array válido
  if (!Array.isArray(fin)) return false;
  
  const [x1, y1] = inicio;
  const [x2, y2] = fin;
  
  // Solo verificar caminos rectos y adyacentes
  if (x1 === x2 && Math.abs(y1 - y2) > 0) return true; // Celdas adyacentes horizontal
  if (y1 === y2 && Math.abs(x1 - x2) > 0) return true; // Celdas adyacentes vertical
};

const encontrarAreas = (tablero) => {
  const areas = {};
  
  // Verificar si el tablero es válido
  if (!tablero || !Array.isArray(tablero)) return areas;

  tablero.forEach((fila, i) => {
    // Verificar si la fila es un array válido
    if (!Array.isArray(fila)) return;
    
    fila.forEach((celda, j) => {
      const region = celda?.region ?? 0;
      if (!areas[region]) areas[region] = [];
      areas[region].push([i, j]);
    });
  });
  
  return areas;
};

// Genera solución válida
const resolverToichika = (tableroOriginal) => {
  const areas = encontrarAreas(tableroOriginal);
  const regiones = Object.keys(areas);

  const tableroBorrador = JSON.parse(JSON.stringify(tableroOriginal));
  const tableroActual = JSON.parse(JSON.stringify(tableroOriginal));

  let mejorSolucion = null;

  const regionesVacias = regiones.filter(region => 
    areas[region].every(([x, y]) => tableroOriginal[x][y].flecha === 'VACIO')
  );

  regionesVacias.sort((a, b) => areas[a].length - areas[b].length);

  // Precalcular posibles flechas por celda
  for (let regionId of regionesVacias) {
    for (let punto of areas[regionId]) {
      let posiblesFlechas = [];

      if (caminoRecto(tableroOriginal, punto, [tableroBorrador.length - 1, punto[1]])) posiblesFlechas.push('↓');
      if (caminoRecto(tableroOriginal, punto, [0, punto[1]])) posiblesFlechas.push('↑');
      if (caminoRecto(tableroOriginal, punto, [punto[0], 0])) posiblesFlechas.push('←');
      if (caminoRecto(tableroOriginal, punto, [punto[0], tableroBorrador[0].length - 1])) posiblesFlechas.push('→');

      tableroBorrador[punto[0]][punto[1]].flecha = posiblesFlechas;
    }
  }

  function backtracking(profundidad = 0) {
    if (profundidad >= regionesVacias.length) {
      if (esValida(tableroActual)) {
        mejorSolucion = JSON.parse(JSON.stringify(tableroActual));
      }
      return;
    }

    const regionId = regionesVacias[profundidad];
    const celdasRegion = areas[regionId];

    for (let punto of celdasRegion) {
      const posiblesFlechas = tableroBorrador[punto[0]][punto[1]].flecha || [];

      for (let flecha of posiblesFlechas) {
        tableroActual[punto[0]][punto[1]].flecha = flecha;

        backtracking(profundidad + 1);

        tableroActual[punto[0]][punto[1]].flecha = 'VACIO';
      }
    }
  }

  backtracking();
  return mejorSolucion || tableroOriginal;
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
        const valida = regiones.every(region => esValida(solucionGenerada, parseInt(region)));
        
        if (valida) return solucionGenerada;
        
        // Calcular puntaje de solución parcial
        const puntaje = regiones.filter(region => 
          esValida(solucionGenerada, parseInt(region))
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
  const areas = {};
  
  // Verificar si el tablero es válido
  if (!tablero || !Array.isArray(tablero)) return areas;

  tablero.forEach((fila, i) => {
    // Verificar si la fila es un array válido
    if (!Array.isArray(fila)) return;
    
    fila.forEach((celda, j) => {
      const region = celda?.region ?? 0;
      if (!areas[region]) areas[region] = [];
      areas[region].push([i, j]);
    });
  });
  
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
  //console.log(celdas);
  const flechas = celdas.filter(([x, y]) => tableroSolucion[x][y].flecha !== 'VACIO');
  //console.log(flechas, "flechas");
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

  }
  
};

const direccionOpuesta = (flecha) => ({
  '↑': '↓', '↓': '↑', '←': '→', '→': '←'
}[flecha]);

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
*/

 /* // 2. Generar todos los pares posibles no adyacentes
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
};*/
/*
  const aplicarCombinacion = (tableroActual, celdas, combinacion) => {
    const nuevo = JSON.parse(JSON.stringify(tableroActual));
    if (combinacion) {
        nuevo[combinacion.posicion[0]][combinacion.posicion[1]].flecha = combinacion.flecha;
    }
    return nuevo;
  };

  const validacionParcial = (tableroActual, region) => {
    const celdasConFlecha = areas[region].filter(([x, y]) => 
        tableroActual[x][y].flecha !== 'VACIO'
    );
    
    // Validar máximo 2 flechas por región
    if (celdasConFlecha.length > 2) return false;
    
    // Validar dirección de flechas si hay 2
    if (celdasConFlecha.length === 2) {
        const [x1, y1] = celdasConFlecha[0];
        const [x2, y2] = celdasConFlecha[1];
        return validarPareja(tableroActual, [x1, y1], tableroActual[x1][y1].flecha);
    }
    
    return true;
  };

  function backtracking(regionIndex, tableroActual){

    if (regionIndex === regiones.length){
      if(esSolucionValida(tableroActual)){
        mejorSolucion = JSON.parse(JSON.stringify(tableroActual));
        return true;
      }else{
        return false;
      }
    }

    const regionActual = regiones[regionIndex];
    const celdasRegion = areas[regionActual];

    //tomar una flecha aleatoria de tablero borrador en la region y casilla actual 

    const combinaciones = generarCombinacionValida(tableroActual, regionesVacias);

    for (const combinacion of combinaciones){
      const nuevoTablero = aplicarCombinacion(tableroActual, celdasRegion, combinacion);

      if(validacionParcial(nuevoTablero, regionActual)){
        if(backtracking(regionIndex + 1, nuevoTablero)){
          return true;
        }
      }
    }

    return false;

  }

  function generarCombinacionValida(tablero, tableroBorrador) {
    const combinaciones = [];
    //const flechasExistentes = celdas.filter(c => tablero[c[0]][c[1]].flecha !== 'VACIO');

    const regionesArriba = regiones.filter(region => 
      areas[region].every(([x, y]) => tableroOriginal[x][y].flecha === '↑')
    );

    const regionesAbajo = regiones.filter(region => 
      areas[region].every(([x, y]) => tableroOriginal[x][y].flecha === '↓')
    );

    const regionesIzq = regiones.filter(region => 
      areas[region].every(([x, y]) => tableroOriginal[x][y].flecha === '←')
    );

    const regionesDer = regiones.filter(region => 
      areas[region].every(([x, y]) => tableroOriginal[x][y].flecha === '→')
    );
    
    //if (flechasExistentes.length === 2) return [null];

    for (let i = 0; i < regionesArriba.length; i++) {
       let punto = regionesArriba[i][0];
      for (let j = punto[0] + 1; j < (tablero.length-punto[0]); j--){
        tableroBorrador[punto[j]][punto[1]].flecha = '↓'
      }
    }

    for (let i = 0; i < regionesAbajo.length; i++) {
       let punto = regionesAbajo[i][0];
      for (let j = punto[0] + 1; j < (tablero.length-punto[0]); j++){
        tableroBorrador[punto[j]][punto[1]].flecha = '↑'
      }
    }

    for (let i = 0; i < regionesIzq.length; i++) {
      let punto = regionesIzq[i][0];
      for (let j = punto[1] + 1; j < (tablero.length-punto[1]); j--){
        tableroBorrador[punto[j]][punto[1]].flecha = '→'
      }
    }

    for (let i = 0; i < regionesDer.length; i++) {
      let punto = regionesDer[i][0];
      for (let j = punto[1] + 1; j < (tablero.length-punto[1]); j++){
        tableroBorrador[punto[j]][punto[1]].flecha = '←'
      }
    }

    //const celdasVacias = celdas.filter(c => tablero[c[0]][c[1]].flecha === 'VACIO');
    
    /*for (let i = 0; i < celdasVacias.length; i++) {
        const [x, y] = celdasVacias[i];
        // Añadir protección para posiblesFlechas
        const posibles = Array.isArray(tablero[x][y]?.posiblesFlechas) 
            ? tablero[x][y].posiblesFlechas 
            : [];
        
        for (const flecha of posibles) { // Ahora siempre será iterable
            const temp = JSON.parse(JSON.stringify(tablero));
            temp[x][y].flecha = flecha;
            
            if (validarPareja(temp, [x, y], flecha)) {
                combinaciones.push({
                    posicion: [x, y],
                    flecha: flecha
                });
            }
        }
    }
    
    return combinaciones;
}

  // Validación rápida de una pareja de flechas
  function validarPareja(tablero, posicion, flecha) {
      const [x, y] = posicion;
      let dx = 0, dy = 0;
      
      switch(flecha) {
          case '↑': dx = -1; break;
          case '↓': dx = 1; break;
          case '←': dy = -1; break;
          case '→': dy = 1; break;
      }

      let currentX = x + dx;
      let currentY = y + dy;
      
      while (currentX >= 0 && currentY >= 0 && 
            currentX < tablero.length && currentY < tablero[0].length) {
          
          const celda = tablero[currentX][currentY];
          if (celda.flecha !== 'VACIO') {
              return celda.flecha === direccionOpuesta(flecha) && 
                    !sonAdyacentes(tablero[x][y].region, celda.region, areas);
          }
          
          currentX += dx;
          currentY += dy;
      }
      
      return false;
  }

  // Función de validación completa
  function esSolucionValida(tablero) {
      return regiones.every(region => {
          const flechas = areas[region]
              .filter(([x, y]) => tablero[x][y].flecha !== 'VACIO');
          
          return flechas.length === 2 && 
                validarPareja(tablero, flechas[0], tablero[flechas[0][0]][flechas[0][1]].flecha);
      });
  }

// Iniciar el proceso
  backtracking(0, JSON.parse(JSON.stringify(tableroOriginal)));
  return mejorSolucion;
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
});*/
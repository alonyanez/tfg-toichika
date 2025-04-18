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

function haySeparacionDeRegion(f1, f2, tablero) {
  let dx = Math.sign(f2.x - f1.x);
  let dy = Math.sign(f2.y - f1.y);
  let x = f1.x + dx;
  let y = f1.y + dy;

  let hayRegionDiferente = false;

  while (x !== f2.x || y !== f2.y) {
    const celda = tablero[x][y];

    // Si hay una flecha, sigue siendo inválido igual
    if (celda.flecha && celda.flecha !== 'VACIO') return false;

    // Si encontramos una región diferente, marcamos
    if (celda.region !== f1.region) {
      hayRegionDiferente = true;
    }

    x += dx;
    y += dy;
  }

  return hayRegionDiferente;
}

function sonAdyacentes(f1, f2) {
  const dx = Math.abs(f1.x - f2.x);
  const dy = Math.abs(f1.y - f2.y);
  return (dx + dy === 1);
}

function recolectarFlechas(tablero) {
  const flechas = [];
  for (let x = 0; x < tablero.length; x++) {
    for (let y = 0; y < tablero[0].length; y++) {
      const celda = tablero[x][y];
      if (celda.flecha && celda.flecha !== 'VACIO') {
        flechas.push({ x, y, flecha: celda.flecha, region: celda.region });
      }
    }
  }
  return flechas;
}

function agruparFlechasPorRegion(flechas) {
  const flechasPorRegion = {};
  for (let f of flechas) {
    if (flechasPorRegion[f.region]) {
      return false; // Más de una flecha en una región
    }
    flechasPorRegion[f.region] = f;
  }
  return flechasPorRegion; 
}

function esValida(tablero) {
  const flechas = recolectarFlechas(tablero);
  
  const flechasPorRegion = agruparFlechasPorRegion(flechas);
  if(!flechasPorRegion) return false;

  const yaEmparejadas = new Set();
  for (let f of flechas) {
    const id = `${f.x},${f.y}`;
    if (yaEmparejadas.has(id)) continue;

    const objetivo = buscarFlechaEnDireccion(tablero, f);
    if (!objetivo) return false; 

    if (objetivo.flecha !== direccionOpuesta(f.flecha)) return false;
    if (!haySeparacionDeRegion(f, objetivo, tablero)) return false;
    if (sonAdyacentes(f, objetivo)) return false;

    yaEmparejadas.add(id);
    yaEmparejadas.add(`${objetivo.x},${objetivo.y}`);
  }

  return true;
  
}

function estadoParcialValido(tableroActual, x, y, flechasPorRegion){
  const f = tableroActual[x][y];
  if(f || f.flecha === 'VACIO') return true;

  const flecha = { x, y, flecha: f.flecha, region: f.region};

  if (flechasPorRegion.has(f.region)) {
    return false; // Ya hay una flecha en esta región
  }

  const objetivo = buscarFlechaEnDireccion(tableroActual, flecha);
  if (!objetivo) return true;

  if (objetivo.flecha !== direccionOpuesta(flecha, flecha)) return false;

  if (sonAdyacentes(flecha, objetivo)) return false;

  if (!haySeparacionDeRegion(flecha, objetivo, tableroActual)) return false;

  return true;
}

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
function Resolver({ tablero, onSolucionInvalida, onSolucionGenerada }) {
  const resolverToichika = (tableroOriginal) => {
    const areas = encontrarAreas(tableroOriginal);

    const regionesVacias = Object.keys(areas).filter(region => 
      areas[region].every(([x, y]) => tableroOriginal[x][y].flecha === 'VACIO')
    ).sort((a, b) => areas[a].length - areas[b].length);

    //const tableroBorrador = JSON.parse(JSON.stringify(tableroOriginal));
    const tableroActual = tableroOriginal.map(
        fila => fila.map(celda => ({ ...celda })));

    let mejorSolucion = null;

    const asignarFlechas = (regionCeldas, tablero) => {
      const opciones = [];
    
      for (const [x, y] of regionCeldas) {
        // Saltar si esta celda ya tiene flecha (aunque no debería pasar)
        if (tablero[x][y].flecha !== 'VACIO') continue;
    
        if (x > 0 && tablero[x - 1][y]?.flecha === 'VACIO') {
          opciones.push({ x, y, flecha: '↑' });
        }
        if (x < tablero.length - 1 && tablero[x + 1][y]?.flecha === 'VACIO') {
          opciones.push({ x, y, flecha: '↓' });
        }
        if (y > 0 && tablero[x][y - 1]?.flecha === 'VACIO') {
          opciones.push({ x, y, flecha: '←' });
        }
        if (y < tablero[0].length - 1 && tablero[x][y + 1]?.flecha === 'VACIO') {
          opciones.push({ x, y, flecha: '→' });
        }
      }
    
      return opciones;
    };

    const flechasPorRegion = new Map();

    function backtracking(profundidad = 0) {
      if (profundidad === regionesVacias.length) {
        if (esValida(tableroActual)) {
          mejorSolucion = JSON.parse(JSON.stringify(tableroActual));
        }
        return mejorSolucion;
      }

      const regionId = regionesVacias[profundidad];
      const celdas = areas[regionId];
      const opciones = asignarFlechas(celdas, tableroActual);

      for (const { x, y, flecha } of opciones) {
        if (flechasPorRegion.has(regionId)) continue;

        tableroActual[x][y].flecha = flecha;
        flechasPorRegion.set(regionId, { x, y, flecha });
      
        if (estadoParcialValido(tableroActual, x, y, flechasPorRegion)) {
          backtracking(profundidad + 1);
          if (mejorSolucion) return; // detener si encontró solución
        }
      
        tableroActual[x][y].flecha = 'VACIO';
        flechasPorRegion.delete(regionId);
      }

    }

    backtracking();
    return mejorSolucion || tableroOriginal;
  };

  // Componente Resolver actualizado
  const [solucion, setSolucion] = useState([]);

  useEffect(() => {
    if (tablero.length === 0) return;

    // Usar resolverToichika aquí para obtener la solución generada
    const solucionGenerada = resolverToichika(tablero);

    if (solucionGenerada) {
      setSolucion(solucionGenerada);
      onSolucionGenerada(solucionGenerada); // Notificas a los componentes padres
    } else {
      console.error("No se encontró solución perfecta");
      onSolucionInvalida();
    }
  }, [tablero, onSolucionGenerada, onSolucionInvalida]);

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

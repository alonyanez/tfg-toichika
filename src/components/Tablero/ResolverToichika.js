import React, { useState, useEffect } from 'react';


function buscarFlechaEnDireccion(tablero, f) {
  let { x, y, flecha } = f;
  let dx = 0, dy = 0;
  if (flecha === '↑') dx = -1;
  if (flecha === '↓') dx = 1;
  if (flecha === '←') dy = -1;
  if (flecha === '→') dy = 1;
  x += dx; y += dy;
  while (x >= 0 && y >= 0 && x < tablero.length && y < tablero[0].length) {
    const celda = tablero[x][y];
    if (celda.flecha && celda.flecha !== '') {
      return { x, y, flecha: celda.flecha, region: celda.region };
    }
    x += dx; y += dy;
  }
  return null;
}

export function calcularAdyacencias(tablero) {
  const ady = {};
  const filas = tablero.length, cols = tablero[0].length;
  for (let i = 0; i < filas; i++) {
    for (let j = 0; j < cols; j++) {
      const r = tablero[i][j].region;
      if (!ady[r]) ady[r] = new Set();
      const dirs = [[-1,0],[1,0],[0,-1],[0,1]];
      for (let [dx,dy] of dirs) {
        const ni = i+dx, nj = j+dy;
        if (ni >= 0 && nj >=0 && ni<filas && nj<cols) {
          const r2 = tablero[ni][nj].region;
          if (r2 !== r) {
            ady[r].add(r2);
          }
        }
      }
    }
  }
  return ady; 
}

function direccionOpuesta(flecha) {
  return { '↑': '↓', '↓': '↑', '←': '→', '→': '←' }[flecha];
}

function haySeparacionDeRegion(f1, f2, tablero) {
  const dx = Math.sign(f2.x - f1.x);
  const dy = Math.sign(f2.y - f1.y);
  let x = f1.x + dx, y = f1.y + dy;
  let vioDistinta = false;
  while (x !== f2.x || y !== f2.y) {
    const cel = tablero[x][y];
    if (cel.flecha && cel.flecha !== '') return false;
    if (cel.region !== f1.region && cel.region !== f2.region) {
      vioDistinta = true;
    }
    x += dx; y += dy;
  }
  return vioDistinta;
}

// Valida el tablero
export function esValida(tablero) {
  //Recoge todas las flechas del tablero
  const flechas = [];
  for (let i = 0; i < tablero.length; i++) {
    for (let j = 0; j < tablero[0].length; j++) {
      const cel = tablero[i][j];
      if (cel.flecha && cel.flecha !== '') {
        flechas.push({ x: i, y: j, flecha: cel.flecha, region: cel.region });
      }
    }
  }

  //Se comprueba que cada región tiene 1 sola flecha
  const usado = new Set();
  for (let f of flechas) {
    if (usado.has(f.region)) return false;
    usado.add(f.region);
  }

  const adyacencias = calcularAdyacencias(tablero);

  //Se buscan los pares de flechas
  const emparejadas = new Set();
  for (let f of flechas) {
    const id = `${f.x},${f.y}`;
    if (emparejadas.has(id)) continue;
    const objetivo = buscarFlechaEnDireccion(tablero, f);
    if (!objetivo) return false;
    if (objetivo.flecha !== direccionOpuesta(f.flecha)) return false;
    if (adyacencias[f.region].has(objetivo.region)) {
      return false;
    }
    //if (sonAdyacentes(f, objetivo)) return false;
    if (!haySeparacionDeRegion(f, objetivo, tablero)) return false;
    emparejadas.add(id);
    emparejadas.add(`${objetivo.x},${objetivo.y}`);
  }
  return true;
}

export function encontrarAreas(tablero) {
  const areas = {};
  tablero.forEach((fila, i) =>
    fila.forEach((celda, j) => {
      if (!areas[celda.region]) areas[celda.region] = [];
      areas[celda.region].push([i, j]);
    })
  );
  return areas;
}

function asignarFlechas(celdas, tablero) {
  const opcion = [];
  for (const [x, y] of celdas) {
    if (tablero[x][y].flecha) continue;
    if (x > 0   && !tablero[x-1][y].flecha) opcion.push({ x, y, flecha: '↑' });
    if (x < tablero.length-1 && !tablero[x+1][y].flecha) opcion.push({ x, y, flecha: '↓' });
    if (y > 0   && !tablero[x][y-1].flecha) opcion.push({ x, y, flecha: '←' });
    if (y < tablero[0].length-1 && !tablero[x][y+1].flecha) opcion.push({ x, y, flecha: '→' });
  }
  return opcion;
}

function esLocalValido(tablero, x, y) {
  const region = tablero[x][y].region;
  const f = { x, y, flecha: tablero[x][y].flecha, region };
  const vecino = buscarFlechaEnDireccion(tablero, f);
  if (!vecino) return true;
  if (vecino.flecha !== direccionOpuesta(f.flecha)) return false;
  if (!haySeparacionDeRegion(f, vecino, tablero)) return false;
  const ady = calcularAdyacencias(tablero);
  if (ady[region].has(vecino.region)) return false;
  return true;
}

export function obtenerSolucion(tableroOriginal) {
  const areas = encontrarAreas(tableroOriginal);
  const regionesVacias = Object.keys(areas)
    .filter(region => areas[region].every(([x,y]) => tableroOriginal[x][y].flecha === ''))
    .sort((a,b) => areas[a].length - areas[b].length);
  const sinAsignar = new Set(regionesVacias);

  const tableroAlgoritmo = tableroOriginal.map(fila => fila.map(celda => ({ ...celda })));
  let hallado = null;

  function dfs() {
    if (sinAsignar.size === 0) {
      if (esValida(tableroAlgoritmo)) {
        hallado = tableroAlgoritmo.map(fila => fila.map(celda => ({ ...celda })));
        return true;
      }
      return false;
    }
    // escogemos región con menos opciones
    let mejorRegion, mejorOpcion;
    for (let region of sinAsignar) {
      const opcion = asignarFlechas(areas[region], tableroAlgoritmo);
      if (opcion.length === 0) return false;
      if (!mejorOpcion || opcion.length < mejorOpcion.length) {
        mejorRegion = region;
        mejorOpcion = opcion;
      }
    }
    sinAsignar.delete(mejorRegion);

    for (let { x, y, flecha } of mejorOpcion) {
      tableroAlgoritmo[x][y].flecha = flecha;
      if (esLocalValido(tableroAlgoritmo, x, y) && dfs()) return true;
      tableroAlgoritmo[x][y].flecha = '';
    }
    sinAsignar.add(mejorRegion);
    return false;
  }

  dfs();
  return hallado;
}

//Resolver
export function Resolver({ tablero, onSolucionInvalida, onStartResolve, onEndResolve }) {
  const [solucion, setSolucion] = useState([]);

  const resolverToichika = (tableroOriginal) => {
    const areas = encontrarAreas(tableroOriginal);
    const regionesVacias = Object.keys(areas)
      .filter(region => areas[region].every(([x,y]) => tableroOriginal[x][y].flecha === ''))
      .sort((a,b) => areas[a].length - areas[b].length);
    const sinAsignar = new Set(regionesVacias);

    const tableroAlgoritmo = tableroOriginal.map(flecha => flecha.map(celda => ({ ...celda })));
    let hallado = null;

    const dfs = () => {
      if (sinAsignar.size === 0) {
        // validación global antes de aceptar
        if (esValida(tableroAlgoritmo)) {
          hallado = tableroAlgoritmo.map(flecha => flecha.map(celda => ({ ...celda })));
          return true;
        }
        return false;
      }

      let mejorRegion, mejorOpcion;
      for (let region of sinAsignar) {
        const opcion = asignarFlechas(areas[region], tableroAlgoritmo);
        if (opcion.length === 0) return false;
        if (!mejorOpcion || opcion.length < mejorOpcion.length) {
          mejorRegion = region; mejorOpcion = opcion;
        }
      }
      sinAsignar.delete(mejorRegion);

      //{ x, y, flecha } punto (x,y) y su flecha 
      for (let { x, y, flecha } of mejorOpcion) {
        tableroAlgoritmo[x][y].flecha = flecha;
        if (esLocalValido(tableroAlgoritmo, x, y) && dfs()) return true;
        tableroAlgoritmo[x][y].flecha = '';
      }
      sinAsignar.add(mejorRegion);
      return false;
    };

    dfs();
    
    return hallado ?? null;
    
  };

  
  useEffect(() => {
    if (!tablero.length) return;
    let activo = true;

    if (onStartResolve) onStartResolve();

    // Deferimos la ejecución
    setTimeout(() => {
      if (!activo) return;
      const solucion = resolverToichika(tablero);

      if (solucion){
        setSolucion(solucion);
        if (onEndResolve) onEndResolve();
      }else {
        console.error("¡El tablero no tiene solución!");
        if (onEndResolve) onEndResolve();
        onSolucionInvalida();
      }

    }, 0);

    return () => { activo = false };
  }, [tablero, onSolucionInvalida, onStartResolve, onEndResolve]);

  return (
    <div style={{ margin: 20, padding: 20, border: '1px solid #ccc' }}>
      <h3>Solución propuesta:</h3>
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${tablero[0]?.length||0}, 50px)`,
        gap: 2,
        justifyContent: 'center'
      }}>
        {solucion.map((fila,x) =>
          fila.map((celda,y) => (
            <div key={`${x}-${y}`}
                 style={{
                   width:50, height:50,
                   display:'flex', alignItems:'center', justifyContent:'center',
                   backgroundColor:`hsl(${celda.region*30},80%,75%)`,
                   border:'1px solid #666'
                 }}>
              {celda.flecha}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Resolver;
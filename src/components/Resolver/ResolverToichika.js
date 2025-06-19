import React, { useState, useEffect } from 'react';

function dirToDelta(dir) {
  switch (dir) {
    case '↑': return [-1, 0];
    case '↓': return [1, 0];
    case '←': return [0, -1];
    case '→': return [0, 1];
    default: return [0, 0];
  }
}

function generarOpcionesParaRegion(rId, tablero, celdasPorRegion, adyRegiones, regionesAsignadas) {
  const opciones = [];
  const filas = tablero.length, cols = tablero[0].length;

  for (const [i, j] of celdasPorRegion.get(rId)) {
    if (tablero[i][j].flecha) continue; 
    
    for (const dir1 of ['↑','↓','←','→']) {
      const [dx, dy] = dirToDelta(dir1);
      let x = i + dx, y = j + dy;
      while (x >= 0 && x < filas && y >= 0 && y < cols) {
        const cel = tablero[x][y];
        if (cel.flecha) {
          const sId = cel.region;

          if (sId !== rId && !regionesAsignadas.has(sId)
              && cel.flecha === direccionOpuesta(dir1)
              && !adyRegiones.get(rId).has(sId)) {
            opciones.push({ x1: i, y1: j, dir1, x2: x, y2: y, dir2: direccionOpuesta(dir1) });
          }
          break;
        }

        const sId = cel.region;

        if (sId !== rId && !regionesAsignadas.has(sId) && !adyRegiones.get(rId).has(sId)) {
          opciones.push({ x1: i, y1: j, dir1, x2: x, y2: y, dir2: direccionOpuesta(dir1) });
        }
        x += dx; y += dy;
      }
    }
  }
  return opciones;
}


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
    if (celda.flecha) {
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
      ady[r] = ady[r] || new Set();
      [[-1,0],[1,0],[0,-1],[0,1]].forEach(([dx, dy]) => {
        const ni = i + dx, nj = j + dy;
        if (ni >= 0 && nj >= 0 && ni < filas && nj < cols) {
          const r2 = tablero[ni][nj].region;
          if (r2 !== r) ady[r].add(r2);
        }
      });
    }
  }
  return ady;
}

function direccionOpuesta(flecha) {
  return { '↑': '↓', '↓': '↑', '←': '→', '→': '←' }[flecha];
}

function haySeparacionDeRegion(f1, f2, tablero) {
  const dx = Math.sign(f2.x - f1.x), dy = Math.sign(f2.y - f1.y);
  let x = f1.x + dx, y = f1.y + dy;
  let vioDistinta = false;
  while (x !== f2.x || y !== f2.y) {
    const cel = tablero[x][y];
    if (cel.flecha) return false;
    if (cel.region !== f1.region && cel.region !== f2.region) vioDistinta = true;
    x += dx; y += dy;
  }
  return vioDistinta;
}

export function esValida(tablero) {
  const flechas = [];
  tablero.forEach((fila, i) => fila.forEach((cel, j) => {
    if (cel.flecha) flechas.push({ x: i, y: j, flecha: cel.flecha, region: cel.region });
  }));

  const regionesUsadas = new Set();
  for (const f of flechas) {
    if (regionesUsadas.has(f.region)) return false;
    regionesUsadas.add(f.region);
  }

  const adyacencias = calcularAdyacencias(tablero);
  const emparejadas = new Set();

  for (const f of flechas) {
    const id = `${f.x},${f.y}`;
    if (emparejadas.has(id)) continue;
    const obj = buscarFlechaEnDireccion(tablero, f);
    if (!obj || obj.flecha !== direccionOpuesta(f.flecha)) return false;
    if (adyacencias[f.region].has(obj.region)) return false;
    if (!haySeparacionDeRegion(f, obj, tablero)) return false;
    emparejadas.add(id);
    emparejadas.add(`${obj.x},${obj.y}`);
  }
  return true;
}

export function encontrarAreas(tablero) {
  const areas = {};
  tablero.forEach((fila, i) => fila.forEach((cel, j) => {
    areas[cel.region] = areas[cel.region] || [];
    areas[cel.region].push([i, j]);
  }));
  return areas;
}

/*function asignarFlechas(celdas, tablero) {
  const ops = [];
  for (const [x, y] of celdas) {
    if (tablero[x][y].flecha) continue;
    if (x > 0 && !tablero[x-1][y].flecha) ops.push({ x, y, flecha: '↑' });
    if (x < tablero.length-1 && !tablero[x+1][y].flecha) ops.push({ x, y, flecha: '↓' });
    if (y > 0 && !tablero[x][y-1].flecha) ops.push({ x, y, flecha: '←' });
    if (y < tablero[0].length-1 && !tablero[x][y+1].flecha) ops.push({ x, y, flecha: '→' });
  }
  return ops;
}*/

export function contarSoluciones(tableroOriginal, maxCount = 2) {
  const filas = tableroOriginal.length, cols = tableroOriginal[0].length;
  const areas = new Map();
  for (let i = 0; i < filas; i++) {
    for (let j = 0; j < cols; j++) {
      const r = tableroOriginal[i][j].region;
      if (!areas.has(r)) areas.set(r, []);
      areas.get(r).push([i,j]);
    }
  }
  const rawAdy = calcularAdyacencias(tableroOriginal);
  const adyRegiones = new Map();
  for (const key in rawAdy) {
    adyRegiones.set(Number(key), new Set(rawAdy[key]));
  }
  const pendientes = new Set();
  for (const [r, celdas] of areas.entries()) {
    const tieneF = celdas.some(([i,j]) => !!tableroOriginal[i][j].flecha);
    if (!tieneF) pendientes.add(r);
  }
  const tablero = tableroOriginal.map(row => row.map(c => ({ ...c })));
  let contador = 0;

  function dfsContar(regPendientes) {
    if (contador >= maxCount) return;
    if (regPendientes.size === 0) {
      if (esValida(tablero)) {
        contador++;
      }
      return;
    }

    // MRV:
    let mejorR = null, mejorOpts = null;
    const regionesAsignadas = new Set([...areas.keys()].filter(rr => !regPendientes.has(rr)));
    for (const r of regPendientes) {
      const opts = generarOpcionesParaRegion(r, tablero, areas, adyRegiones, regionesAsignadas);
      if (opts.length === 0) {
        mejorR = r; mejorOpts = [];
        break;
      }
      if (mejorOpts == null || opts.length < mejorOpts.length) {
        mejorR = r; mejorOpts = opts;
      }
    }
    if (!mejorOpts || mejorOpts.length === 0) {
      return;
    }
    regPendientes.delete(mejorR);
    for (const opt of mejorOpts) {
      if (contador >= maxCount) break;
      const { x1, y1, dir1, x2, y2, dir2 } = opt;
      const prev1 = tablero[x1][y1].flecha;
      const prev2 = tablero[x2][y2].flecha;
      tablero[x1][y1].flecha = dir1;
      tablero[x2][y2].flecha = dir2;
      const sId = tablero[x2][y2].region;
      const quitS = regPendientes.has(sId);
      if (quitS) regPendientes.delete(sId);
      dfsContar(regPendientes);
      if (quitS) regPendientes.add(sId);
      tablero[x1][y1].flecha = prev1;
      tablero[x2][y2].flecha = prev2;
    }
    regPendientes.add(mejorR);
  }

  dfsContar(pendientes);
  return contador >= maxCount ? maxCount : contador;
}


export function obtenerSolucion(tableroOriginal) {
  const filas = tableroOriginal.length;
  const cols = tableroOriginal[0].length;
  const areas = new Map();

  for (let i = 0; i < filas; i++) {
    for (let j = 0; j < cols; j++) {
      const r = tableroOriginal[i][j].region;
      if (!areas.has(r)) areas.set(r, []);
      areas.get(r).push([i,j]);
    }
  }

  const rawAdy = calcularAdyacencias(tableroOriginal);
  const adyRegiones = new Map();
  for (const key in rawAdy) {
    const r = Number(key);
    adyRegiones.set(r, new Set(rawAdy[key]));
  }

  const pendientes = new Set();

  for (const [r, celdas] of areas.entries()) {
    const tieneF = celdas.some(([i,j]) => !!tableroOriginal[i][j].flecha);
    if (!tieneF) pendientes.add(r);
  }

  const tablero = tableroOriginal.map(row => row.map(c => ({ ...c })));

  function dfsAsignar(regPendientes) {

    if (regPendientes.size === 0) {
      return esValida(tablero);
    }

    // MRV: elegir región con menos opciones:
    let mejorR = null, mejorOpts = null;
    const regionesAsignadas = new Set([...areas.keys()].filter(rr => !regPendientes.has(rr)));
    for (const r of regPendientes) {
      const opts = generarOpcionesParaRegion(r, tablero, areas, adyRegiones, regionesAsignadas);
      if (opts.length === 0) {
        mejorR = r; mejorOpts = [];
        break;
      }
      if (mejorOpts == null || opts.length < mejorOpts.length) {
        mejorR = r; mejorOpts = opts;
      }
    }
    if (!mejorOpts || mejorOpts.length === 0) {
      return false; 
    }

    regPendientes.delete(mejorR);
    const regionesAsignadas2 = new Set([...areas.keys()].filter(rr => !regPendientes.has(rr)));

    for (const opt of mejorOpts) {
      const { x1, y1, dir1, x2, y2, dir2 } = opt;
      const prev1 = tablero[x1][y1].flecha;
      const prev2 = tablero[x2][y2].flecha;
      tablero[x1][y1].flecha = dir1;
      tablero[x2][y2].flecha = dir2;
      const sId = tablero[x2][y2].region;
      const quitS = regPendientes.has(sId);
      if (quitS) regPendientes.delete(sId);
      if (dfsAsignar(regPendientes)) {
        return true;
      }
      if (quitS) regPendientes.add(sId);
      tablero[x1][y1].flecha = prev1;
      tablero[x2][y2].flecha = prev2;
    }
    regPendientes.add(mejorR);
    return false;
  }

  const ok = dfsAsignar(pendientes);
  return ok ? tablero : null;
}


export function Resolver({ tablero, onSolucionInvalida, onStartResolve, onEndResolve }) {
  const [solucion, setSolucion] = useState([]);

  useEffect(() => {
    if (!tablero.length) return;
    onStartResolve?.();
    setTimeout(() => {
      const sol = obtenerSolucion(tablero);
      if (sol) {
        setSolucion(sol);
        onEndResolve?.();
      } else {
        console.error("¡El tablero no tiene solución!");
        onSolucionInvalida?.();
        onEndResolve?.();
      }
    }, 0);
  }, [tablero, onSolucionInvalida, onStartResolve, onEndResolve]);

  return (
    <div style={{ margin: 20, padding: 20, border: '1px solid #ccc' }}>
      <h3>Solución propuesta:</h3>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${tablero[0]?.length||0}, 50px)`, gap: 2, justifyContent: 'center' }}>
        {solucion.map((fila,x) => fila.map((celda,y) => (
          <div key={`${x}-${y}`} style={{ width:50, height:50, display:'flex', alignItems:'center', justifyContent:'center', backgroundColor:`hsl(${celda.region*30},80%,75%)`, border:'1px solid #666' }}>
            {celda.flecha}
          </div>
        )))}
      </div>
    </div>
  );
}

export default Resolver;

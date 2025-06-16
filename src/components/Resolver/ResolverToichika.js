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

function asignarFlechas(celdas, tablero) {
  const ops = [];
  for (const [x, y] of celdas) {
    if (tablero[x][y].flecha) continue;
    if (x > 0 && !tablero[x-1][y].flecha) ops.push({ x, y, flecha: '↑' });
    if (x < tablero.length-1 && !tablero[x+1][y].flecha) ops.push({ x, y, flecha: '↓' });
    if (y > 0 && !tablero[x][y-1].flecha) ops.push({ x, y, flecha: '←' });
    if (y < tablero[0].length-1 && !tablero[x][y+1].flecha) ops.push({ x, y, flecha: '→' });
  }
  return ops;
}

export function contarSoluciones(tableroOriginal, maxCount = 2) {
  const areas = encontrarAreas(tableroOriginal);
  const rawAdy = calcularAdyacencias(tableroOriginal);
  const adyacencias = new Map(
    Object.entries(rawAdy).map(([r, v]) => [Number(r), v])
  );

  const regiones = Object.keys(areas)
    .map(r => Number(r))
    .filter(r => areas[r].every(([i, j]) => !tableroOriginal[i][j].flecha))
    .sort((a, b) => areas[a].length - areas[b].length);

  const opcionesInicial = new Map();
  for (const r of regiones) {
    const opts = asignarFlechas(areas[r], tableroOriginal);
    if (!opts.length) return 0;
    opcionesInicial.set(r, opts);
  }

  const tableroAlg = tableroOriginal.map(row => row.map(c => ({ ...c })));
  const pendientes = new Set(regiones);
  let count = 0;

  function dfs(tab, sinAsig, opciones) {
    // 1) Si ya tenemos al menos maxCount, detenemos toda la búsqueda.
    if (count >= maxCount) return;

    // 2) Caso base: todas las regiones asignadas → validamos y contamos.
    if (sinAsig.size === 0) {
      if (esValida(tab)) {
        count++;
      }
      return;
    }

    // 3) Selección heurística de la región con menos opciones:
    let region = null;
    sinAsig.forEach(r => {
      if (region === null) region = r;
      else {
        const a = opciones.get(r).length;
        const b = opciones.get(region).length;
        if (
          a < b ||
          (a === b && adyacencias.get(r).size > adyacencias.get(region).size)
        ) {
          region = r;
        }
      }
    });

    sinAsig.delete(region);
    for (const move of opciones.get(region)) {
      const { x, y, flecha } = move;
      const old = tab[x][y].flecha;
      tab[x][y].flecha = flecha;

      const nuevasOpc = new Map(opciones);
      let podar = false;
      [region, ...adyacencias.get(region)].forEach(r2 => {
        if (podar) return;
        const ops2 = asignarFlechas(areas[r2], tab);
        if (!ops2.length) podar = true;
        else nuevasOpc.set(r2, ops2);
      });

      if (!podar) dfs(tab, sinAsig, nuevasOpc);

      // Restauramos y salimos si ya excedimos el umbral:
      tab[x][y].flecha = old;
      if (count >= maxCount) break;
    }
    sinAsig.add(region);
  }

  dfs(tableroAlg, pendientes, opcionesInicial);
  return count;
}

export function obtenerSolucion(tableroOriginal) {
  const areas = encontrarAreas(tableroOriginal);
  const rawAdy = calcularAdyacencias(tableroOriginal);
  const adyacencias = new Map(Object.entries(rawAdy).map(([r, v]) => [Number(r), v]));
  const regiones = Object.keys(areas)
    .map(r => Number(r))
    .filter(r => areas[r].every(([i,j]) => !tableroOriginal[i][j].flecha))
    .sort((a, b) => areas[a].length - areas[b].length);

  const opcionesInicial = new Map();
  for (const r of regiones) {
    const opts = asignarFlechas(areas[r], tableroOriginal);
    if (!opts.length) return null;
    opcionesInicial.set(r, opts);
  }

  const tableroAlg = tableroOriginal.map(row => row.map(c => ({ ...c })));
  const pendientes = new Set(regiones);

  function dfsF(tab, sinAsig, opciones) {
    if (!sinAsig.size) return esValida(tab);
    let reg = [...sinAsig].sort((a,b) => opciones.get(a).length - opciones.get(b).length)[0];
    sinAsig.delete(reg);
    for (const m of opciones.get(reg)) {
      const old = tab[m.x][m.y].flecha;
      tab[m.x][m.y].flecha = m.flecha;
      const opc2 = new Map(opciones);
      let pod = false;
      [reg, ...adyacencias.get(reg)].forEach(r2 => {
        if (pod) return;
        const rOps = asignarFlechas(areas[r2], tab);
        if (!rOps.length) pod = true;
        else opc2.set(r2, rOps);
      });
      if (!pod && dfsF(tab, sinAsig, opc2)) return true;
      tab[m.x][m.y].flecha = old;
    }
    sinAsig.add(reg);
    return false;
  }

  return dfsF(tableroAlg, pendientes, opcionesInicial) ? tableroAlg : null;
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

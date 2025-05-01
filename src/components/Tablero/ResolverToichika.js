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

function sonAdyacentes(f1, f2) {
  return Math.abs(f1.x - f2.x) + Math.abs(f1.y - f2.y) === 1;
}

function direccionOpuesta(flecha) {
  return { '↑': '↓', '↓': '↑', '←': '→', '→': '←' }[flecha];
}

/*function esAdyacente(regionA, regionB, tablero, x, y) {
  const dirs = [[-1,0],[1,0],[0,-1],[0,1]];
  return dirs.some(([dx,dy]) => {
    const nx = x+dx, ny = y+dy;
    return (
      nx >= 0 && ny >= 0 &&
      nx < tablero.length && ny < tablero[0].length &&
      tablero[nx][ny].region === regionB
    );
  });
}*/

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

  //Se buscan los pares de flechas
  const emparejadas = new Set();
  for (let f of flechas) {
    const id = `${f.x},${f.y}`;
    if (emparejadas.has(id)) continue;
    const objetivo = buscarFlechaEnDireccion(tablero, f);
    if (!objetivo) return false;
    if (objetivo.flecha !== direccionOpuesta(f.flecha)) return false;
    if (sonAdyacentes(f, objetivo)) return false;
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
  const opts = [];
  for (const [x, y] of celdas) {
    if (tablero[x][y].flecha) continue;
    if (x > 0   && !tablero[x-1][y].flecha) opts.push({ x, y, flecha: '↑' });
    if (x < tablero.length-1 && !tablero[x+1][y].flecha) opts.push({ x, y, flecha: '↓' });
    if (y > 0   && !tablero[x][y-1].flecha) opts.push({ x, y, flecha: '←' });
    if (y < tablero[0].length-1 && !tablero[x][y+1].flecha) opts.push({ x, y, flecha: '→' });
  }
  return opts;
}

function esLocalValido(tablero, x, y) {
  const region = tablero[x][y].region;
  const f = { x, y, flecha: tablero[x][y].flecha, region };
  const vecino = buscarFlechaEnDireccion(tablero, f);
  if (!vecino) return true;
  if (vecino.flecha !== direccionOpuesta(f.flecha)) return false;
  if (sonAdyacentes(f, vecino)) return false;
  if (!haySeparacionDeRegion(f, vecino, tablero)) return false;
  return true;
}

//Resolver
function Resolver({ tablero, onSolucionInvalida, onStartResolve, onEndResolve }) {
  const [solucion, setSolucion] = useState([]);

  const resolverToichika = (orig) => {
    const areas = encontrarAreas(orig);
    // sólo regiones sin flechas, MRV sobre tamaño
    const regionesVacias = Object.keys(areas)
      .filter(r => areas[r].every(([x,y]) => orig[x][y].flecha === ''))
      .sort((a,b) => areas[a].length - areas[b].length);
    const sinAsignar = new Set(regionesVacias);

    const t = orig.map(f => f.map(c => ({ ...c })));
    let hallado = null;

    const dfs = () => {
      if (sinAsignar.size === 0) {
        // validación global antes de aceptar
        if (esValida(t)) {
          hallado = t.map(f => f.map(c => ({ ...c })));
          return true;
        }
        return false;
      }
      // MRV local
      let mejorR, mejorOpts;
      for (let r of sinAsignar) {
        const opts = asignarFlechas(areas[r], t);
        if (opts.length === 0) return false;
        if (!mejorOpts || opts.length < mejorOpts.length) {
          mejorR = r; mejorOpts = opts;
        }
      }
      sinAsignar.delete(mejorR);
      for (let { x, y, flecha } of mejorOpts) {
        t[x][y].flecha = flecha;
        if (esLocalValido(t, x, y) && dfs()) return true;
        t[x][y].flecha = '';
      }
      sinAsignar.add(mejorR);
      return false;
    };

    dfs();
    
    if (hallado) {
      return hallado;
    } else {
      //alert('No pudo encontrar ninguna solución válida.'); 
      return null;
    }
  };

  
useEffect(() => {
  if (!tablero.length) return;
  let activo = true;

  if (onStartResolve) onStartResolve();

  // Deferimos la ejecución
  setTimeout(() => {
    if (!activo) return;
    const sol = resolverToichika(tablero);
    if (!activo) return;

    if (sol){
      setSolucion(sol);
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
                   backgroundColor:`hsl(${celda.region*40},70%,90%)`,
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
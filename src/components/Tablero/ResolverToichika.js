import React, { useState, useEffect, useCallback } from 'react';


// Función para encontrar las áreas en el tablero
const encontrarAreas = (tablero) => {
    const areas = {};
    tablero.forEach((fila, i) => {
      fila.forEach((area, j) => {
        if (!areas[area]) {
          areas[area] = [];
        }
        areas[area].push([i, j]);
      });
    });
    return areas;
  };
  
  function Resolver({ tablero }) {
    const [puntos, setPuntos] = useState([]);
  
    useEffect(() => {
      const inicializarPuntos = () => {
        const nuevoPuntos = tablero.map(fila => fila.map(() => ['↑', '↓', '←', '→']));
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
  
            if (!area.some(p => p[0] === i && p[1] === puntoFinalFila[1])) {
              const ultimoPuntoFila = area[area.length - 1];
              if (ultimoPuntoFila[0] + 1 !== tablero.length) {
                nuevoPuntos[i][j] = nuevoPuntos[i][j].filter(f => f !== '→');
              }
            }
  
            if (!area.some(p => p[0] === puntoFinalColumna[0] && p[1] === j)) {
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
import React, { useState, useEffect, useCallback } from 'react';

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
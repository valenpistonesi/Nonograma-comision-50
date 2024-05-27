import React, { useEffect, useState } from 'react';
import PengineClient from './PengineClient';
import Board from './Board';
import Boton from './Boton';
import BotonToggle from './BotonToggle';

let pengine;

function Game() {
  // State
  const [grid, setGrid] = useState(null);
  //const [gridResuelta, setGridResuelta] = useState(null);
 // const [gridAux, setGridAux] = useState(null);
  const [rowsClues, setRowsClues] = useState(null);
  const [colsClues, setColsClues] = useState(null);
  const [waiting, setWaiting] = useState(false);
  const [content, setContent] = useState('#');
  const [colsCluesSat, setColsCluesSat] = useState(null);
  const [rowsCluesSat, setRowsCluesSat] = useState(null);
  const [rowSatValue, setRowSatValue] = useState(false);
  const [colSatValue, setColSatValue] = useState(false);
  const [inicializado, setInicializado] = useState(false);
  const [jugando, setJugando] = useState(true);

  useEffect(() => {
    // Creation of the pengine server instance.    
    // This is executed just once, after the first render.    
    // The callback will run when the server is ready, and it stores the pengine instance in the pengine variable. 
    PengineClient.init(handleServerReady);
  }, []);

  function handleServerReady(instance) {
    pengine = instance;
    const queryS = 'init(RowClues, ColumClues, Grid)';
    pengine.query(queryS, (success, response) => {
      if (success) {
        setGrid(response['Grid']);
        setRowsClues(response['RowClues']);
        setColsClues(response['ColumClues']);
        setColsCluesSat(Array(response['ColumClues'].length));
        setRowsCluesSat(Array(response['RowClues'].length));
      }
    });

    //Crea la grilla ya resuelta para la funcion "Mostrar solucion"
   /* const querryP = 'grillaResuelta(RowClues, ColumClues, Grid, GridResuelta)';
    pengine.query(querryP, (success, response) => {
        if (success){
            setGridResuelta(response('GridResuelta'));
        }
    });*/
  }

  function handleClick(i, j) {
    // No action on click if we are waiting or the game is over.
    if (waiting | !jugando) {
      return;
    }

    if (!inicializado){
      //Inicializa los arreglos para pistas satisfechas en filas y columnas
      colsCluesSat.fill(false);
      rowsCluesSat.fill(false);
      chequearEstadoInicial(grid.length, grid[0].length);
      //checkearFinDeJuego(grid.length, grid[0].length);
      //hacer querry a pl preguntando por cada fila y columna a ver si estan satisfechas
      //set waiting?
      //actualizar cluesSat
      //chequear fin del juego
      setInicializado(true);
    }
    // Build Prolog query to make a move and get the new satisfacion status of the relevant clues.    
    const squaresS = JSON.stringify(grid).replaceAll('"_"', '_'); // Remove quotes for variables. squares = [["X",_,_,_,_],["X",_,"X",_,_],["X",_,_,_,_],["#","#","#",_,_],[_,_,"#","#","#"]]

    const rowsCluesS = JSON.stringify(rowsClues);
    const colsCluesS = JSON.stringify(colsClues);
    if (inicializado){
      const queryS = `put("${content}", [${i},${j}], ${rowsCluesS}, ${colsCluesS}, ${squaresS}, ResGrid, RowSat, ColSat)`; // queryS = put("#",[0,1],[], [],[["X",_,_,_,_],["X",_,"X",_,_],["X",_,_,_,_],["#","#","#",_,_],[_,_,"#","#","#"]], GrillaRes, FilaSat, ColSat)
      setWaiting(true);
      pengine.query(queryS, (success, response) => {
        if (success) {
          setGrid(response['ResGrid']);

          //Actualiza el arreglo de pistas de filas satisfechas luego de realizar el movimiento
          let newRowsCluesSat = [...rowsCluesSat];
          newRowsCluesSat[i] = (1 === response[`RowSat`]);
          setRowsCluesSat(newRowsCluesSat);

          //Actualiza el arreglo de pistas de columnas satisfechas luego de realizar el movimiento
          let newColsCluesSat = [...colsCluesSat];
          newColsCluesSat[j] = (1 === response[`ColSat`]);
          setColsCluesSat(newColsCluesSat);

          setRowSatValue(newRowsCluesSat);
          setColSatValue(newColsCluesSat);

          checkearFinDeJuego(newRowsCluesSat, newColsCluesSat);
        }
        setWaiting(false);
      });
  }
  }

  const cambiarContent = () => {
    // Cambia el content entre '#' y 'X'
    setContent(content === '#' ? 'X' : '#');
  }

  function chequearEstadoInicial(largoFilas, largoColumnas){
    const rowsCluesT = JSON.stringify(rowsClues);
    const colsCluesT = JSON.stringify(colsClues);
    //Para las filas

    for (let ii = 0; ii < largoFilas; ii++){
        const squaresT = JSON.stringify(grid[ii]).replaceAll('"_"', '"X"');
        const queryT = `checkeoSatShell(${squaresT}, [${rowsClues[ii]}], Resultado)`;

        let newRowsCluesSat = [...rowsCluesSat];
        setWaiting(true);
        pengine.query(queryT, (success, response) => {
          if(success){
            newRowsCluesSat[ii] = (1 === response[`Resultado`]);
            console.log(" newRowsCluesSat["+ii+"]: "+ newRowsCluesSat[ii]);
            setRowsCluesSat(newRowsCluesSat);
          }
        });
        setRowSatValue(newRowsCluesSat);
        console.log("newRowsCluesSat: "+newRowsCluesSat);
        setWaiting(false);
    }

    /*
      el tema es que necesitaria iterar para pintar todas las pistas, porque el repintado del board
      esta armado para el put, con una coordenada (i, j). Pero como ii es 5 es como que solo pinta la ultima
      pero en html no puedo iterar. y el metodo que repinta es un return
      entonces? como haago?
    */

    //para las columnas
   /* for (var j = 0; j < largoColumnas; j++){
      const queryR = `checkeoSatShell([${[grid[0][j]]}], ${colsClues[j]}, Resultado})`;
      pengine.query(queryR, (success, response) => {
        if(success){
          setColsCluesSat[j] = response(`Resultado`);
        }
      });
  }*/
  }

  function checkearFinDeJuego(rowsToCheck, colsToCheck){
    var bandera = true;

    //Chequea las filas que tienen las pistas satisfechas
    for (var c = 0; bandera && c < rowsCluesSat.length; c++){
      bandera = (rowsToCheck[c] === true);
    }

    //Chequea las columnas que tienen las pistas satisfechas
    for (var d = 0; bandera && d < colsCluesSat.length; d++){
      bandera = (colsToCheck[d] === true);
    }
    setJugando(!bandera);
  }

  function mostrarSolucion(){
    //setGridAux = grid
    //setGrid = setGridResuelta
    //setWaitingTrue o MostrandoSolucion como const
    //sino
    //setGrid = setGridAux
    //setWaitingFalse
    console.log('Toggle activado:');
    return true;
  }

  /*const mostrarSolucion = (activado) => {
    console.log('Toggle activado:', activado);
  };*/

  if (!grid) {
    return null;
  }

  return (
    <div className="game">
        <div className="game-info">
        {!inicializado ? "Haz click en el tablero para comenzar a jugar" : (jugando ? "Jugando" : "Fin del juego")}
     </div>
      <Board
        grid={grid}
        rowsClues={rowsClues}
        colsClues={colsClues}
        onClick={(i, j) => handleClick(i, j)}
        rowSat={rowSatValue}
        colSat={colSatValue}
      />
     <div className="boton-toggle">
        <BotonToggle activado={mostrarSolucion} />
        Mostrar soluciones
      </div>
     <div>
        <Boton text={content} clic={cambiarContent} />
     </div>
    </div>

  );
}
export default Game;
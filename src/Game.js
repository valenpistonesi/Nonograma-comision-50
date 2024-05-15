import React, { useEffect, useState } from 'react';
import PengineClient from './PengineClient';
import Board from './Board';
import Boton from './Boton';

let pengine;

function Game() {
  // State
  const [grid, setGrid] = useState(null);
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
      }
    });
  }

  function handleClick(i, j) {
    // No action on click if we are waiting or the game is over.
    if (waiting | !jugando) {
      return;
    }

    if (!inicializado){
      setColsCluesSat(Array(grid.length).fill(false));
      setRowsCluesSat(Array(grid[0].length).fill(false));
      setInicializado(true);
      console.log("Juego inicializado.");
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

          let newRowsCluesSat = [...rowsCluesSat];
          newRowsCluesSat[i] = (1 === response[`RowSat`]);
          setRowsCluesSat(newRowsCluesSat);

          let newColsCluesSat = [...colsCluesSat];
          newColsCluesSat[j] = (1 === response[`ColSat`]);
          setColsCluesSat(newColsCluesSat);

          console.log("Valores nuevos de RowSat del put: " + response[`RowSat`]);
          console.log("Valores nuevos de ColSat del put: " + response[`ColSat`]);
          setRowSatValue(newRowsCluesSat);
          setColSatValue(newColsCluesSat);

          console.log("Estoy dentro del succes. Imprimiento contenido de arreglos: ");
          imprimirArreglos();

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

  const imprimirArreglos = () => {
    // Imprimir colsCluesSat
    console.log("colsCluesSat:");
    colsCluesSat.forEach((valor, indice) => {
      console.log(`Índice ${indice}: ${valor}`);
    });
  
    // Imprimir rowsCluesSat
    console.log("rowsCluesSat:");
    rowsCluesSat.forEach((valor, indice) => {
      console.log(`Índice ${indice}: ${valor}`);
    });
  };

  function checkearFinDeJuego(rowsToCheck, colsToCheck){
    var bandera = true;

    for (var c = 0; bandera && c < rowsCluesSat.length; c++){
      bandera = (rowsToCheck[c] === true);
      console.log("Valor de rowClueSat en "+c+": "+rowsToCheck[c]);
    }

    for (var d = 0; bandera && d < colsCluesSat.length; d++){
      bandera = (colsToCheck[d] === true);
      console.log("Valor de ColClueSat en " +c+": "+colsToCheck[d]);
    }
    setJugando(!bandera);
  }

  if (!grid) {
    return null;
  }

  return (
    <div className="game">
      <Board
        grid={grid}
        rowsClues={rowsClues}
        colsClues={colsClues}
        onClick={(i, j) => handleClick(i, j)}
        rowSat={rowSatValue}
        colSat={colSatValue}
      />
      <div className="game-info">
        {jugando ? "Jugando" : "Fin del juego"}
      </div>
      <div>
            <Boton text={content} clic={cambiarContent} />
        </div>
    </div>
    
  );
}
export default Game;
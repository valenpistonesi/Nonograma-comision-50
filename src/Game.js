import React, { useEffect, useState } from 'react';
import PengineClient from './PengineClient';
import Board from './Board';
import Boton from './Boton';
import BotonToggle from './BotonToggle';
import BotonRevelar from './Boton-Revelar';

let pengine;

function Game() {
  // State
  const [grid, setGrid] = useState(null);
  const [gridResuelta, setGridResuelta] = useState(null);
  const [gridAux, setGridAux] = useState(null);
  const [rowsClues, setRowsClues] = useState(null);
  const [colsClues, setColsClues] = useState(null);
  const [waiting, setWaiting] = useState(false);
  const [content, setContent] = useState('#');
  const [colsCluesSat, setColsCluesSat] = useState(null);
  const [rowsCluesSat, setRowsCluesSat] = useState(null);
  const [jugando, setJugando] = useState(true);
  const [inicializado, setInicializado] = useState(false);

  useEffect(() => {
    // Creation of the pengine server instance.    
    // This is executed just once, after the first render.    
    // The callback will run when the server is ready, and it stores the pengine instance in the pengine variable. 
    PengineClient.init(handleServerReady);
  }, []);

  async function handleServerReady(instance) {
    callInit(instance);
  }

  async function callInit(instance){
    pengine = instance;
    const queryS = `init(RowClues, ColumClues, Grid)`;
    await pengine.query(queryS, async (success, response) => {
      if (success) {
        console.log(JSON.stringify(response['Grid']));
        setGridResuelta(response['Grid']);
        setGrid(response['Grid']);
        setRowsClues(response['RowClues']);
        setColsClues(response['ColumClues']);
        setColsCluesSat(Array(response['ColumClues'].length));
        setRowsCluesSat(Array(response['RowClues'].length));

        let auxGridResuelta = JSON.stringify(response['Grid']);
        auxGridResuelta = auxGridResuelta.replaceAll('"_"', '_'); 
        console.log('la grid antes de procesar '+auxGridResuelta);

        let auxRowsClues = JSON.stringify(response['RowClues']);
        auxRowsClues = auxRowsClues.replaceAll('"_"', '_'); 
        console.log('la rowclues antes de procesar '+auxRowsClues);

        let auxColClues = JSON.stringify(response['ColumClues']);
        auxColClues = auxColClues.replaceAll('"_"', '_'); 
        console.log('la gcolCLues antes de procesar '+auxColClues);


        const querryP = `mostrarSolucion(${auxGridResuelta}, ${auxRowsClues},${auxColClues},GridResuelta)`;
        console.log(querryP);
        await pengine.query(querryP, (success, response) => {
            if (success){
              setGridResuelta(response['GridResuelta']);
              console.log("la grid resuelta es: "+JSON.stringify(response['GridResuelta']));

              console.log(auxGridResuelta);
            }else{
              console.log("Fallo");
            }
        }
        );
      }
    } 
    );
    //Crea la grilla ya resuelta para la funcion "Mostrar solucion"
  }

  function handleClick(i, j) {
    // No action on click if we are waiting or the game is over.
    if (waiting | !jugando) {
      return;
    }

    if (!inicializado){
      checkearFinDeJuego(rowsCluesSat, colsCluesSat);
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

  function chequearEstadoInicial(filas, columnas, grilla){
    let nuevoRowsCluesSat= Array(filas.length).fill(false);
    let nuevoColsCluesSat= Array(columnas.length).fill(false);

    setWaiting(true);
    let pendingRowQuerys = filas.length;
    let pendingColQuerys = columnas.length;

    //Para las filas
    for (let ii = 0; ii < filas.length; ii++){
      const squaresT = JSON.stringify(grilla[ii]).replaceAll('"_"', '"X"');
      const queryT = `checkeoSatShell(${squaresT}, [${filas[ii]}], Resultado)`;

      pengine.query(queryT, (success, response) => {
        if(success){
          pendingRowQuerys--;
          nuevoRowsCluesSat[ii] = (1 === response[`Resultado`]);
          if (pendingRowQuerys === 0){
            setWaiting(false);
            setRowsCluesSat(nuevoRowsCluesSat);
          }
        }
      });
    }

    //Para columnas
    for (let jj = 0; jj < columnas.length; jj++){
      const squaresC = armarColumna(grilla, jj);

      const queryC = `checkeoSatShell(${squaresC}, [${columnas[jj]}], Resultado)`;

      pengine.query(queryC, (success, response) => {
        if(success){
          pendingColQuerys--;
          nuevoColsCluesSat[jj] = (1 === response[`Resultado`]);
          if (pendingColQuerys === 0){
            setWaiting(false);
            setColsCluesSat(nuevoColsCluesSat);
          }
        }
      });
    }
  }

  function armarColumna(grilla, jj){
    let tamaño = grilla[0].length;
    let columna = new Array(tamaño);

    for (let indice = 0; indice < grilla[0].length; indice++){
      columna[indice]=grilla[indice][jj];
    }

    const columnaArmada = JSON.stringify(columna).replaceAll('"_"', '"X"');
    return columnaArmada;
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
    console.log("mostrar solucion "+grid);
    console.log("mostrar solucion "+gridResuelta);

    setGridAux(grid);
    setGrid(gridResuelta);
    setWaiting(true);
    return true;
  }

  function ocultarSolucion(){
    setGrid(gridAux);
    setWaiting(false);
    return false;
  }

  function revelarPista(){

  }

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
        rowSat={rowsCluesSat}
        colSat={colsCluesSat}
      />
     <div className="boton-toggle">
        <BotonToggle mostrar={mostrarSolucion} ocultar={ocultarSolucion}/>
        Mostrar soluciones
      </div>
      <div className="botonRevelar">
        <BotonRevelar clic={revelarPista}/>
      </div>
     <div>
        <Boton text={content} clic={cambiarContent} />
     </div>
    </div>

  );
}
export default Game;
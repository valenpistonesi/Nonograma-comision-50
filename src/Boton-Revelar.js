import React from 'react';

function BotonRevelar({clic}){

    return (
        <button className={"botonRevelar"} onClick={clic}>{"Revelar pista"}</button>
    );
}

export default BotonRevelar;
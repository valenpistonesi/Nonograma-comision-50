import React from 'react';

function boton({text, clic}){
    const botonStyles = {
        position: 'absolute',
        top: '43px', // Cambia la posición vertical
        left: '26px', // Cambia la posición horizontal
        backgroundColor: 'red', 
        fontSize: '16px',
        padding: '18px 22px',
        border: 'none',
        borderRadius: '5px',
        color: 'white',
        cursor: 'pointer',
    };

    return (
        <button style={botonStyles} onClick={clic}>{text}</button>
    );
}

export default boton;
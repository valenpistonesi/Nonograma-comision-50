import React from 'react';

function Square({ value, onClick }) {
    return (
        <button className={(value === '#' ? " blackSquare" : "square")} onClick={onClick}>
            {value !== '_' ? value : null}
        </button>
    );
}

export default Square;

import React, { useState } from 'react';

function BotonToggle({ mostrar, ocultar }) { 
  const [encendido, setEncendido] = useState(false);//del boton toggle

  const cambiar = () => {
    setEncendido(!encendido);

    if (!encendido) {
      mostrar(!encendido);
    }else{
      ocultar(!encendido);
    }
  };

  return (
    <label className="switch">
      <input type="checkbox" checked={encendido} onChange={cambiar} />
      <span className="slider"></span>
    </label>
  );
};

export default BotonToggle;
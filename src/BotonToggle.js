import React, { useState } from 'react';

function BotonToggle({ activado }) { 
  const [encendido, setEncendido] = useState(false);

  const cambiar = () => {
    setEncendido(!encendido);
    if (activado) {
      activado(!encendido);
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
import React from 'react';
import { useNavigate } from 'react-router-dom';

function Cards({ nombre, capacidad, disponibilidad, tipo_mesa }) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (disponibilidad) {
      navigate('/menues', {
        state: { nombreMesa: nombre }
      });
    }
  };

  // ✅ Define la imagen según tipo_mesa
  const imagenSrc = tipo_mesa === 'delivery'
    ? '../src/img/delivery_cafe.webp'
    : '../src/img/ico_cafe.webp';

  return (
    <div className={`card ${disponibilidad ? 'bg-red-950' : 'bg-gray-500'} w-30 md:w-35 lg:w-40 shadow-md`}>
      <div className="card-body p-3 flex flex-col items-center">
        <h3 className="card-title justify-center text-white">{nombre}</h3>
        <img src={imagenSrc} alt="Pluvia Café" className="h-10 w-10 md:h-15 md:w-15" />
        <div className="card-actions justify-center">
          <button
            onClick={handleClick}
            className="btn btn-primary w-27 md:w-30 lg:w-35"
            disabled={!disponibilidad}
          >
            {capacidad}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Cards
// sistema_servicio/src/components/cards.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

function Cards({ id_mesas, nombre, capacidad, disponibilidad, tipo_mesa }) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (disponibilidad) {
      navigate('/menues', {
        state: { 
          nombreMesa: nombre,
          idMesa: id_mesas
        }
      });
    }
  };

  // ✅ Define la imagen según tipo_mesa
  const imagenSrc = tipo_mesa === 'delivery'
    ? '../src/img/delivery_cafe.webp'
    : '../src/img/ico_cafe.webp';

  const imagenSrcBlack = tipo_mesa === 'delivery'
    ? '../src/img/delivery_cafe_negro.webp'
    : '../src/img/ico_cafe_negro.webp';

  return (
    <div className={`card ${disponibilidad ? 'bg-green-400':'bg-secondary'} w-25 md:w-30 lg:w-35 shadow-md`}>
      <div className="card-body p-3 flex flex-col items-center">
        <h3 className={` card ${disponibilidad ? 'text-black':'text-white'} card-title justify-center text-center text-sm`}>{nombre}</h3>
        <img src={disponibilidad ? imagenSrcBlack : imagenSrc} alt="Pluvia Café" className="h-8 w-8 md:h-11 md:w-11" />
        <div className="card-actions justify-center">
          <button
            onClick={handleClick}
            className={`card ${disponibilidad ? 'text-black':'text-white'} btn bg-green-400 btn-outline text-black btn-square w-22 md:w-25 lg:w-28`}
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
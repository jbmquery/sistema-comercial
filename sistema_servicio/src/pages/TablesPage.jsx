import Cards from "../components/cards";
import HeaderNav from "../components/header_nav";
import { useEffect, useState } from "react";
import { API_BASE } from "../config";

function TablesPage() {
  const [mesas, setMesas] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE}/api/mesas`, {
      headers: {
        "ngrok-skip-browser-warning": "true"
      }
    })
      .then((res) => res.json())
      .then((data) => setMesas(data.mesas))
      .catch((err) => console.error("Error al obtener mesas:", err));
  }, []);

  // Filtrar por tipo de mesa
  const mesasFisicas = mesas.filter(mesa => mesa.tipo_mesa === 'mesa');
  const mesasDelivery = mesas.filter(mesa => mesa.tipo_mesa === 'delivery');

  return (
    <div className="flex flex-col justify-center items-center">
      <HeaderNav />

      {/* Mesas físicas */}
      <div className="flex flex-wrap items-center justify-center gap-4 p-4 md:gap-6 lg:gap-8 md:p-6 lg:p-8 max-w-5xl">
        <h2 className="w-full text-center text-xl font-bold mb-4">Mesas en el local</h2>
        {mesasFisicas.length === 0 ? (
          <div className="text-center">
            <span className="loading loading-bars loading-md"></span>
          </div>
        ) : (
          mesasFisicas.map((mesa) => (
            <Cards 
              key={mesa.id} 
              nombre={mesa.nombre} 
              capacidad={`${mesa.capacidad} personas`} 
              disponibilidad={mesa.disponibilidad}
              tipo_mesa={mesa.tipo_mesa}
            />
          ))
        )}
      </div>

      <div className="divider"></div>

      {/* Pedidos de delivery */}
      <div className="flex flex-wrap items-center justify-center gap-4 p-4 md:gap-6 lg:gap-8 md:p-6 lg:p-8 max-w-5xl">
        <h2 className="w-full text-center text-xl font-bold mb-4">Delivery o para llevar</h2>
        {mesasDelivery.length === 0 ? (
          <div className="text-center">
            <span className="loading loading-bars loading-md"></span>
          </div>
        ) : (
          mesasDelivery.map((mesa) => (
            <Cards 
              key={mesa.id} 
              nombre={mesa.nombre} 
              capacidad={`${mesa.capacidad} personas`} 
              disponibilidad={mesa.disponibilidad} 
              tipo_mesa={mesa.tipo_mesa}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default TablesPage;
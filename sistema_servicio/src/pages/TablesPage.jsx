// sistema_servicio/src/pages/TablesPage.jsx
import Cards from "../components/cards";
import HeaderNav from "../components/header_nav";
/*import { useEffect, useState } from "react";
import { API_BASE } from "../config";*/
import { useQuery } from "@tanstack/react-query";
import { getMesas } from "../api";

function TablesPage() {
  
  const {
    data: mesas = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["mesas"],
    queryFn: getMesas,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  if (isError) {
    return (
      <div className="text-red-500 text-center mt-10">
        Error al cargar mesas: {error.message}
      </div>
    );
  }

  // Filtrar por tipo de mesa
  const mesasFisicas = mesas.filter(mesa => mesa.tipo_mesa === 'mesa');
  const mesasDelivery = mesas.filter(mesa => mesa.tipo_mesa === 'delivery');
  //const mesasLlevar = mesas.filter(mesa => mesa.tipo_mesa === 'llevar');

  return (
    <div className="flex flex-col justify-start items-center bg-neutral-800 h-full min-h-screen">
      <HeaderNav />

      {/* Mesas físicas */}
      <div className="flex flex-wrap items-center justify-center gap-4 p-4 md:gap-6 lg:gap-8 md:p-6 lg:p-8">
        <h2 className="w-full text-center text-xl font-bold mb-4">Mesas en el local</h2>
        {isLoading ? (
          <div className="text-center">
            <span className="loading loading-bars loading-md"></span>
          </div>
        ) : (
          mesasFisicas.map((mesa) => (
            <Cards 
              key={mesa.id_mesas}
              id_mesas={mesa.id_mesas}
              nombre={mesa.nombre}
              capacidad={`${mesa.capacidad} personas`}
              disponibilidad={mesa.disponibilidad}
              tipo_mesa={mesa.tipo_mesa}
            />

          ))
        )}
      </div>

      {/* Pedidos de delivery */}
      <div className="flex flex-wrap items-center justify-center gap-4 p-4 md:gap-6 lg:gap-8 md:p-6 lg:p-8">
        <h2 className="w-full text-center text-xl font-bold mb-4">Delivery o para llevar</h2>
        {mesasDelivery.length === 0 ? (
          <div className="text-center">
            <span className="loading loading-bars loading-md"></span>
          </div>
        ) : (
          mesasDelivery.map((mesa) => (
            <Cards 
              key={mesa.id_mesas}
              id_mesas={mesa.id_mesas}
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
import Cards from "../components/cards"
import HeaderNav from "../components/header_nav"
import { useEffect, useState } from "react";

function TablesPage() {
  const [mesas, setMesas] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/mesas")
      .then((res) => res.json())
      .then((data) => setMesas(data.mesas))
      .catch((err) => console.error("Error al obtener mesas:", err));
  }, []);
  
  return (
    <div className="flex flex-col justify-center items-center">
      <HeaderNav/>
      <div className="flex flex-wrap items-center justify-center gap-4 p-4 md:gap-6 lg:gap-8 md:p-6 lg:p-8 max-w-5xl">
        {mesas.map((mesa) => (
          <Cards 
            key={mesa.id} 
            nombre={mesa.nombre} 
            capacidad={`${mesa.capacidad} personas`} 
            disponibilidad={mesa.disponibilidad} 
          />
        ))}
      </div>
    </div>
  )
}

export default TablesPage
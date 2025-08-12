import HeaderCom from "../components/header_com";
import CardsMenu from "../components/cardsmenu";
import { useLocation } from 'react-router-dom';
import { useState, useEffect } from "react";

function Menues() {
  const location = useLocation();
  const { nombreMesa } = location.state || {};

  const [search, setSearch] = useState("");
  const [porSubcategoria, setPorSubcategoria] = useState({});
  
  const categorias = [
    { id: 1, nombre: "Bebidas" },
    { id: 2, nombre: "Postres" },
    { id: 3, nombre: "Toppings" },
    { id: 4, nombre: "Promos" }
  ];
  const [categoria, setCategoria] = useState(categorias[0].nombre);

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const url = `/api/carta?categoria=${encodeURIComponent(categoria)}&search=${encodeURIComponent(search)}`;
        const res = await fetch(url);
        const data = await res.json();
        setPorSubcategoria(data.por_subcategoria || {});
      } catch (error) {
        console.error("Error al obtener productos:", error);
        setPorSubcategoria({});
      }
    };

    fetchProductos();
  }, [categoria, search]);

  return (
    <div className="flex flex-col justify-center">
      {/* Header */}
      <div className="w-full shadow-md">
        <HeaderCom/>
      </div>

      {/* Sección pedido */}
      <div className="flex flex-col md:flex-row justify-center bg-purple-500">
        {/* Sección menú */}
        <div className="md:w-250">
          {/* Categorías */}
          <div className="flex flex-wrap bg-red-500 justify-center items-center gap-2 py-2">
            {categorias.map((cat) => (
              <button
                key={cat.id}
                className={`btn md:btn-md btn-outline w-30 md:w-40 ${categoria === cat.nombre ? "bg-blue-500 text-white" : "bg-secondary text-white"}`}
                onClick={() => setCategoria(cat.nombre)}
              >
                {cat.nombre}
              </button>
            ))}
          </div>

          {/* Buscador */}
          <div className="bg-yellow-200 flex flex-row justify-between py-2 px-4 items-center">
            <p>Mesa seleccionada: <b>{nombreMesa}</b></p>
            <input
              type="text"
              className="input w-35 md:w-60 lg:w-80"
              placeholder="Buscar"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Productos */}
          <div className="bg-green-300 flex w-full flex-col py-2 px-4">
            {Object.keys(porSubcategoria).length > 0 ? (
              Object.entries(porSubcategoria).map(([subcat, prods]) => (
                <div key={subcat} className="mb-6">
                  <div className="divider divider-start"><b>{subcat}</b></div>
                  <div className="flex flex-wrap items-center justify-center gap-4 p-4 md:gap-6 lg:gap-8 md:p-6 lg:p-8 max-w-5xl">
                    {prods.map((prod) => (
                      <CardsMenu key={prod.id_carta} producto={prod} />
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center p-4">No hay productos</p>
            )}
          </div>
        </div>

        {/* Totales */}
        <div className="md:w-100 bg-gray-400 py-2 px-4">
          PEDIDO:
          <div></div>
          <div></div>
        </div>
      </div>

      {/* Confirmación */}
      <div className="flex flex-row justify-center items-center p-4 md:p-6 lg:p-8 bg-cyan-200 w-full">
        <button
          type="submit"
          className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Guardar
        </button>
      </div>
    </div>
  );
}

export default Menues;

// MenuPage.jsx

import HeaderCom from "../components/header_com";
import CardsMenu from "../components/cardsmenu";
import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCarta } from "../api";


function Menues() {
  const location = useLocation();
  const { nombreMesa } = location.state || {};
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [carrito, setCarrito] = useState([]);

  const categorias = [
    { id: 1, nombre: "Bebidas" },
    { id: 2, nombre: "Postres" },
    { id: 3, nombre: "Toppings" },
    { id: 4, nombre: "Promos" }
  ];
  const [categoria, setCategoria] = useState(categorias[0].nombre);
  // Simulación de usuario logueado (deberá venir del login)
  const idUsuario = 1; // Temporal: luego vendrá del contexto o login

  const {
    data: porSubcategoria = {},
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["carta", categoria, search],
    queryFn: () => getCarta({ categoria, search }),
    keepPreviousData: true,
  });

  {isError && (
  <p className="text-center p-4 text-red-500">
    Error al cargar productos
  </p>
  )}

  // Añadir producto al carrito
  const agregarAlCarrito = (producto) => {
    setCarrito(prev => {
      const existente = prev.find(item => item.id_carta === producto.id_carta);
      if (existente) {
        return prev.map(item =>
          item.id_carta === producto.id_carta
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      } else {
        return [...prev, { ...producto, cantidad: 1 }];
      }
    });
    mostrarAlerta();
  };

  // Eliminar o decrementar producto
  const eliminarDelCarrito = (id_carta) => {
    setCarrito(prev =>
      prev.map(item =>
        item.id_carta === id_carta
          ? { ...item, cantidad: item.cantidad - 1 }
          : item
      ).filter(item => item.cantidad > 0)
    );
  };

  // Calcular subtotal general
  const subtotalGeneral = useMemo(() => {
    return carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0).toFixed(2);
  }, [carrito]);



  // Guardar pedido en backend
const guardarPedido = async () => {
  if (carrito.length === 0) {
    alert("El carrito está vacío");
    return;
  }
  if (!nombreMesa) {
    alert("No se ha seleccionado una mesa");
    return;
  }

  try {
    const resMesas = await fetch('/api/mesas');
    const dataMesas = await resMesas.json();
    const mesa = dataMesas.mesas.find(m => m.nombre === nombreMesa);
    if (!mesa) {
      alert("Mesa no encontrada");
      return;
    }

    const idMesa = mesa.id_mesas;

    const pedido = {
      id_mesa: idMesa,
      id_usuario: idUsuario,
      id_cliente: null,
      estado: "Sin iniciar",
      cantidad_clientes: 1,
      observacion: "",
      forma_pago: "",
      puntos_canjeados_total: 0,
      monto_pagado: 0,
      monto_vuelto: 0,
      detalles: carrito.map(item => ({
        id_carta: item.id_carta,
        cantidad: item.cantidad,
        precio_unitario: item.precio,
        observacion: "",
        es_canjeable: false,
        estado: "Pendiente"
      }))
    };

    const response = await fetch('/api/pedidos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pedido)
    });

    const result = await response.json();

    if (response.ok) {
      alert("✅ Pedido guardado y mesa ocupada");
      setCarrito([]);
      navigate('/pedidos'); // ← Redirección a /pedidos
    } else {
      alert("Error al guardar: " + result.message);
    }
  } catch (error) {
    console.error("Error al guardar pedido:", error);
    alert("Error de conexión");
  }
};




// ✅ agrupar por grupo para las cardsmenu

  const agruparPorGrupo = (productos) => {
    return productos.reduce((acc, prod) => {
      const key = prod.grupo || prod.nombre;
      if (!acc[key]) acc[key] = [];
      acc[key].push(prod);
      return acc;
    }, {});
  };

// Alertas y renderizado
  
  const [alerts, setAlerts] = useState([]);

  const mostrarAlerta = () => {
  const id = Date.now();

  setAlerts((prev) => [
    ...prev,
    { id, visible: true }
  ]);

  // Inicia fade-out
  setTimeout(() => {
    setAlerts((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, visible: false } : a
      )
    );
  }, 800); // empieza a desvanecer

  // Elimina del DOM
  setTimeout(() => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }, 1000);
};



  return (
    <div className="flex flex-col justify-center">
      {/* Alertas */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 space-y-2">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            role="alert"
            className={`alert alert-success transition-opacity duration-200 w-90 ${
              alert.visible ? "opacity-100" : "opacity-0"
            }`}
          >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 shrink-0 stroke-current"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>Se agregó producto al carrito</span>
        </div>
      ))}
    </div>

      {/* Header */}
      <div className="w-full shadow-md z-10">
        <HeaderCom />
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
                className={`btn md:btn-md btn-outline w-20 md:w-40 ${categoria === cat.nombre ? "bg-blue-500 text-white" : "bg-secondary text-white"}`}
                onClick={() => setCategoria(cat.nombre)}
              >
                {cat.nombre}
              </button>
            ))}
          </div>

          {/* Buscador */}
          <div className="bg-yellow-200 flex flex-row justify-between py-2 px-4 items-center">
            <p>Pedido para: <b>{nombreMesa}</b></p>
            <input
              type="text"
              className="input w-35 md:w-60 lg:w-80"
              placeholder="Buscar"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

            {/* Productos */}
            <div 
              className="bg-gray-100 flex w-full flex-col py-2 px-4 m-0 overflow-y-auto"
              style={{ maxHeight: 'calc(100vh - 192px)', minHeight: '0', flex: '1 1 auto' }}
            >
              {isLoading ? (
                <p className="text-center p-4">Cargando productos...</p>
              ) : Object.keys(porSubcategoria).length > 0 ? (

                Object.entries(porSubcategoria).map(([subcat, prods]) => (
                  <div key={subcat} className="mb-6">
                    <div className="divider divider-start">
                      <b>{subcat}</b>
                    </div>

                    <div className="flex flex-wrap items-center justify-center xl:justify-start gap-4 p-4 md:gap-6 lg:gap-8 md:p-6 lg:p-8 max-w-5xl">

                      {Object.entries(agruparPorGrupo(prods)).map(
                        ([grupo, productosGrupo]) => (
                          <CardsMenu
                            key={grupo}
                            grupo={grupo}
                            productos={productosGrupo}
                            onAdd={agregarAlCarrito}
                          />
                        )
                      )}

                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center p-4">No hay productos</p>
              )}
            </div>

        </div>

        {/* Resumen pedidos */}
        <div className="md:w-100 bg-gray-300 pt-2 pb-10 px-4 flex flex-col justify-between">
          <div>
            <div className="pb-5 pt-3">
              <b>RESUMEN DEL PEDIDO:</b>
            </div>

            {carrito.length === 0 ? (
              <p className="text-center text-gray-500">No hay productos en el pedido</p>
            ) : (
              carrito.map((item) => {
                const subtotal = (item.precio * item.cantidad).toFixed(2);
                return (
                  <div key={item.id_carta} className="flex flex-row justify-between mb-4">
                    <div className="flex flex-col">
                      <p>- {item.nombre} {item.porcion ? ` (${item.porcion} ${item.unidad_medida})` : ""}</p>
                      <p className="italic">
                        S/ {Number(item.precio).toFixed(2)} - x{item.cantidad} - S/ {subtotal}
                      </p>
                    </div>
                    <button
                      className="w-10 h-10 bg-red-800 rounded-full flex items-center justify-center"
                      onClick={() => eliminarDelCarrito(item.id_carta)}
                    >
                      <img src="../src/img/eliminar.png" alt="Eliminar" className="w-10 h-10" />
                    </button>
                  </div>
                );
              })
            )}

            <div className="pb-10">
              <div className="divider divider-start"><b>SUB-TOTAL</b></div>
              <div className="flex justify-end bg-red italic"><b>S/ {subtotalGeneral}</b></div>
            </div>
          </div>

          {/* Confirmación */}
          <div className="flex flex-row justify-center items-center p-4 md:p-6 lg:p-8 bg-cyan-200 w-full gap-4">
            <button
              type="button"
              className="flex w-full justify-center rounded-md bg-red-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-red-500"
              onClick={() => setCarrito([])}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-500"
              onClick={guardarPedido}
              disabled={carrito.length === 0}
            >
              Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Menues;
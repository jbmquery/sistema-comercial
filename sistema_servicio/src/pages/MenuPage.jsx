// MenuPage.jsx

import HeaderCom from "../components/header_com";
import CardsMenu from "../components/cardsmenu";
import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from "react";
import React from 'react';

function Menues() {
  const location = useLocation();
  const { nombreMesa } = location.state || {};
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [porSubcategoria, setPorSubcategoria] = useState({});
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
  const subtotalGeneral = carrito.reduce(
    (total, item) => total + (item.precio * item.cantidad),
    0
  ).toFixed(2);

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

    const idMesa = mesa.id;

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
      navigate('/tables'); // ← Redirección a /tables
    } else {
      alert("Error al guardar: " + result.message);
    }
  } catch (error) {
    console.error("Error al guardar pedido:", error);
    alert("Error de conexión");
  }
};

  return (
    <div className="flex flex-col justify-center">
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
          <div 
            className="bg-gray-100 flex w-full flex-col py-2 px-4 m-0 overflow-y-auto"
            style={{ maxHeight: 'calc(100vh - 180px)', minHeight: '0', flex: '1 1 auto' }}
          >
            {Object.keys(porSubcategoria).length > 0 ? (
              Object.entries(porSubcategoria).map(([subcat, prods]) => (
                <div key={subcat} className="mb-6">
                  <div className="divider divider-start"><b>{subcat}</b></div>
                  <div className="flex flex-wrap items-center justify-center gap-4 p-4 md:gap-6 lg:gap-8 md:p-6 lg:p-8 max-w-5xl">
                    {prods.map((prod) => (
                      <CardsMenu 
                        key={prod.id_carta} 
                        producto={prod} 
                        onAdd={() => agregarAlCarrito(prod)} 
                      />
                    ))}
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
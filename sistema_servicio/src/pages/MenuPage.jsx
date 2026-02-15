// sistema_servicio/src/pages/MenuPage.jsx
import HeaderCom from "../components/header_com";
import CardsMenu from "../components/cardsmenu";
import { useLocation, useNavigate } from "react-router-dom";
import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCartaMenu, crearPedido } from "../api";

function Menues() {
  const location = useLocation();
  const { nombreMesa, idMesa } = location.state || {};
  const navigate = useNavigate();

  const [search, setSearch] = useState("");

  const [carrito, setCarrito] = useState(() => {
    const guardado = localStorage.getItem("carrito");
    return guardado ? JSON.parse(guardado) : [];
  });
  const [modalTopping, setModalTopping] = useState(false);
  const [productoTopping, setProductoTopping] = useState(null);

  const generarTempId = () => Date.now() + Math.random();

  const categorias = [
    { id: 1, nombre: "Bebidas" },
    { id: 2, nombre: "Postres" },
    { id: 3, nombre: "Toppings" },
    { id: 4, nombre: "Promos" },
  ];

  const [categoria, setCategoria] = useState(categorias[0].nombre);

  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
  const idUsuario = usuario.id_usuario;

  useEffect(() => {
    localStorage.setItem("carrito", JSON.stringify(carrito));
  }, [carrito]);

  // =========================
  // ✅ REACT QUERY OPTIMIZADO
  // (search ya NO afecta la consulta)
  // =========================
  const {
    data: porSubcategoria = {},
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["carta", categoria], // 👈 CLAVE CORRECTA
    queryFn: () => getCartaMenu({ categoria }),
    keepPreviousData: true,
    staleTime: 60_000, // 1 min "fresco"
    refetchOnWindowFocus: true,
  });

  // =========================
  // ✅ FILTRO VISUAL EN FRONTEND
  // =========================
  const filtrarPorBusqueda = (data) => {
    if (!search.trim()) return data;

    const resultado = {};

    Object.entries(data).forEach(([subcat, productos]) => {
      const filtrados = productos.filter((p) =>
        p.nombre.toLowerCase().includes(search.toLowerCase()),
      );

      if (filtrados.length > 0) {
        resultado[subcat] = filtrados;
      }
    });

    return resultado;
  };

  const productosFiltrados = filtrarPorBusqueda(porSubcategoria);

  // =========================
  // CARRITO (SIN CAMBIOS)
  // =========================
  const agregarAlCarrito = (producto) => {
    const esTopping = categoria === "Toppings";

    if (!esTopping) {
      setCarrito((prev) => [
        ...prev,
        {
          ...producto,
          cantidad: 1,
          tipo: "producto",
          tempId: generarTempId(),
          parentTempId: null,
        },
      ]);
    } else {
      setProductoTopping(producto);
      setModalTopping(true);
    }

    mostrarAlerta();
  };

  const eliminarDelCarrito = (tempId) => {
    setCarrito((prev) => prev.filter((item) => item.tempId !== tempId));
  };

  const subtotalGeneral = useMemo(() => {
    return carrito
      .reduce((total, item) => total + item.precio * item.cantidad, 0)
      .toFixed(2);
  }, [carrito]);

  const carritoAgrupado = useMemo(() => {
    const mapa = {};

    carrito.forEach((item) => {
      const key =
        item.id_carta + "-" + item.tipo + "-" + (item.parentTempId || "root");

      if (!mapa[key]) {
        mapa[key] = { ...item };
      } else {
        mapa[key].cantidad += 1;
      }
    });

    return Object.values(mapa);
  }, [carrito]);

  const toppingsPorProducto = useMemo(() => {
    const mapa = {};

    carrito.forEach((item) => {
      if (item.tipo === "topping" && item.parentTempId) {
        if (!mapa[item.parentTempId]) {
          mapa[item.parentTempId] = [];
        }
        mapa[item.parentTempId].push(item.abreviado);
      }
    });

    return mapa;
  }, [carrito]);

  // =========================
  // MUTATION (SIN CAMBIOS)
  // =========================
  const queryClient = useQueryClient();

  const crearPedidoMutation = useMutation({
    mutationFn: crearPedido,
    onSuccess: () => {
      alert("✅ Pedido guardado y mesa ocupada");
      setCarrito([]);
      localStorage.removeItem("carrito");

      queryClient.invalidateQueries({ queryKey: ["pedidos"] });
      queryClient.invalidateQueries({ queryKey: ["mesas"] });
      queryClient.invalidateQueries({ queryKey: ["carta"] }); // 👈 refresca menú si cambia BD

      navigate("/orden");
    },
    onError: (error) => {
      console.error(error);
      alert("❌ Error al guardar el pedido");
    },
  });

  const detalles = carrito.map((item) => ({
    id_carta: item.id_carta,
    cantidad: item.cantidad,
    precio_unitario: item.precio,
    observacion: "",
    es_canjeable: false,
    estado: "pendiente",
    cuenta: 1,
    tempId: item.tempId,
    parentTempId: item.parentTempId,
  }));

  const guardarPedido = () => {
    if (carrito.length === 0) {
      alert("El carrito está vacío");
      return;
    }

    if (!idMesa) {
      alert("No se ha seleccionado una mesa");
      return;
    }

    const pedido = {
      id_mesa: idMesa,
      id_usuario: idUsuario,
      id_cliente: null,
      estado: "abierto",
      cantidad_clientes: 1,
      observacion: "",
      forma_pago: "",
      puntos_canjeados_total: 0,
      monto_pagado: 0,
      monto_vuelto: 0,
      detalles,
    };

    crearPedidoMutation.mutate(pedido);
  };

  const agruparPorGrupo = (productos) => {
    return productos.reduce((acc, prod) => {
      const key = prod.grupo || prod.nombre;
      if (!acc[key]) acc[key] = [];
      acc[key].push(prod);
      return acc;
    }, {});
  };

  // =========================
  // ALERTAS (SIN CAMBIOS)
  // =========================
  const [alerts, setAlerts] = useState([]);

  const mostrarAlerta = () => {
    const id = Date.now();

    setAlerts((prev) => [...prev, { id, visible: true }]);

    setTimeout(() => {
      setAlerts((prev) =>
        prev.map((a) => (a.id === id ? { ...a, visible: false } : a)),
      );
    }, 800);

    setTimeout(() => {
      setAlerts((prev) => prev.filter((a) => a.id !== id));
    }, 1000);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* ALERTAS (igual) */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 space-y-2">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            role="alert"
            className={`alert alert-success transition-opacity duration-200 w-90 ${
              alert.visible ? "opacity-100" : "opacity-0"
            }`}
          >
            <span>Se agregó producto al carrito</span>
          </div>
        ))}
      </div>

      <div className="w-full shadow-md z-10">
        <HeaderCom />
      </div>

      <div className="flex-1 flex flex-col md:flex-row justify-start lg:justify-center bg-neutral-800">
        <div className="md:w-250">
          {/* CATEGORÍAS (ahora limpian buscador) */}
          <div className="flex flex-wrap bg-success justify-center items-center gap-2 py-2">
            {categorias.map((cat) => (
              <button
                key={cat.id}
                className={`btn md:btn-md btn-outline w-20 md:w-40 shadow-md ${
                  categoria === cat.nombre
                    ? "bg-black text-success"
                    : "bg-success text-black"
                }`}
                onClick={() => {
                  setCategoria(cat.nombre);
                  setSearch(""); // 👈 LIMPIA BUSCADOR
                }}
              >
                {cat.nombre}
              </button>
            ))}
          </div>

          {/* BUSCADOR VISUAL (SIN REQUEST) */}
          <div className="bg-neutral-600 flex flex-row justify-between py-2 px-4 items-center">
            <p>
              Pedido para: <b>{nombreMesa}</b>
            </p>
            <input
              type="text"
              className="input w-35 md:w-60 lg:w-80 text-gray-200 bg-neutral-800"
              placeholder="Buscar"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* PRODUCTOS (usa productosFiltrados) */}
          <div
            className="bg-neutral-500 flex w-full flex-col py-2 px-4 m-0 overflow-y-auto"
            style={{
              maxHeight: "calc(100vh - 192px)",
              minHeight: "0",
              flex: "1 1 auto",
            }}
          >
            {isLoading ? (
              <p className="text-center p-4">Cargando productos...</p>
            ) : isError ? (
              <p className="text-center text-red-600 p-4">
                ❌ Error al cargar el menú. Intenta nuevamente.
              </p>
            ) : Object.keys(productosFiltrados).length > 0 ? (
              Object.entries(productosFiltrados).map(([subcat, prods]) => (
                <div key={subcat} className="mb-6">
                  <div className="divider divider-start">
                    <b>{subcat}</b>
                  </div>

                  <div className="flex flex-wrap items-center justify-center xl:justify-start gap-2 p-3 md:gap-6 lg:gap-4 md:p-6 lg:p-8 max-w-5xl">
                    {Object.entries(agruparPorGrupo(prods)).map(
                      ([grupo, productosGrupo]) => (
                        <CardsMenu
                          key={grupo}
                          grupo={grupo}
                          productos={productosGrupo}
                          onAdd={agregarAlCarrito}
                        />
                      ),
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center p-4">No hay productos</p>
            )}
          </div>
        </div>

        {/* RESUMEN (SIN CAMBIOS) */}
        <div className="md:w-100 bg-neutral-800 pt-2 pb-10 px-4 flex flex-col justify-between">
          <div>
            <div className="pb-5 pt-3">
              <b>RESUMEN DEL PEDIDO:</b>
            </div>

            {carrito.length === 0 ? (
              <p className="text-center text-gray-500">
                No hay productos en el pedido
              </p>
            ) : (
              carritoAgrupado.map((item) => {
                const subtotal = (item.precio * item.cantidad).toFixed(2);
                return (
                  <div
                    key={item.tempId}
                    className="flex flex-row justify-between mb-4"
                  >
                    <div className="flex flex-col">
                      <p>
                        - {item.nombre}{" "}
                        {item.porcion
                          ? `(${item.porcion} ${item.unidad_medida})`
                          : ""}
                      </p>
                      <p className="italic">
                        S/ {Number(item.precio).toFixed(2)} - x{item.cantidad} -
                        S/ {subtotal}
                      </p>
                    </div>

                    <button
                      className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center"
                      onClick={() => eliminarDelCarrito(item.tempId)}
                    >
                      <img
                        src="../src/img/eliminar.png"
                        alt="Eliminar"
                        className="w-10 h-10"
                      />
                    </button>
                  </div>
                );
              })
            )}

            <div className="pb-10">
              <div className="divider divider-start">
                <b>SUB-TOTAL</b>
              </div>
              <div className="flex justify-end bg-red italic">
                <b>S/ {subtotalGeneral}</b>
              </div>
            </div>
          </div>

          <div className="flex flex-row justify-between gap-4">
            <button
              type="button"
              className="btn btn-md btn-outline text-secondary"
              onClick={() => setCarrito([])}
            >
              Cancelar
            </button>

            <button
              type="button"
              className="btn btn-md btn-accent"
              onClick={guardarPedido}
              disabled={carrito.length === 0 || crearPedidoMutation.isLoading}
            >
              {crearPedidoMutation.isLoading ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </div>
      </div>
      {/* MODAL TOPPINGS */}
      {modalTopping && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Seleccionar producto</h3>

            <div className="divider"></div>

            {carrito
              .filter((i) => i.tipo === "producto")
              .map((item, idx) => (
                <button
                  key={item.tempId}
                  className="btn btn-outline w-full mb-2 flex flex-row justify-start"
                  onClick={() => {
                    setCarrito((prev) => [
                      ...prev,
                      {
                        ...productoTopping,
                        cantidad: 1,
                        tipo: "topping",
                        tempId: generarTempId(),
                        parentTempId: item.tempId,
                      },
                    ]);
                    setModalTopping(false);
                  }}
                >
                  {idx + 1} - {item.nombre} ({item.porcion} {item.unidad_medida}
                  )
                  {toppingsPorProducto[item.tempId] && (
                    <span className="ml-2 text-xs text-success">
                      ({toppingsPorProducto[item.tempId].join(") - (")})
                    </span>
                  )}
                </button>
              ))}

            <div className="modal-action flex flex-row justify-start">
              <button
                className="btn btn-outline btn-secondary"
                onClick={() => setModalTopping(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </dialog>
      )}

      {/* FIN MODAL TOPPINGS */}
    </div>
  );
}

export default Menues;

// sistema_servicio/src/pages/OrdenPage.jsx
/*
Api.js
categorias_routes.py - categorias_controller.py
carta_routes.py - carta_controller.py
pedidos_routes.py - pedidos_controller.py
*/
import { Link } from "react-router-dom";
import HeaderNav from "../components/header_nav.jsx";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  pagarCuenta,
  getPedidoDetalle,
  getCuentaActual,
  agregarDetallePedido,
  getCartaOrden,
  actualizarEstadoDetalle,
  actualizarObservacionDetalle,
  imprimirCocina,
  imprimirVoucher,
  generarVoucherWhatsapp,
  cambiarMesaPedido,
  getMesas,
} from "../api";

import { useParams } from "react-router-dom";
import { getPedidos } from "../api";
import { useState } from "react";

function OrdenPage() {
  const [seleccionados, setSeleccionados] = useState([]);
  const { idPedido } = useParams();
  const [mostrarModalPago, setMostrarModalPago] = useState(false);
  const [mostrarModalWhatsapp, setMostrarModalWhatsapp] = useState(false);
  const [telefonoWhatsapp, setTelefonoWhatsapp] = useState("");
  const [pagos, setPagos] = useState([{ metodo: "efectivo", monto: "" }]);
  const [mensajeOk, setMensajeOk] = useState("");
  const [mostrarModalCambiarMesa, setMostrarModalCambiarMesa] = useState(false);
  const [mesaSeleccionada, setMesaSeleccionada] = useState(null);
  const hayPedidoSeleccionado = !!idPedido;

  // Estados para el modal de Agregar Producto
  const [mostrarModalProducto, setMostrarModalProducto] = useState(false);
  const [productoSel, setProductoSel] = useState(null);
  const [observacion, setObservacion] = useState("");
  // Estdados para el modal de eliminar productos
  const [mostrarModalBorrar, setMostrarModalBorrar] = useState(false);
  const [detalleABorrar, setDetalleABorrar] = useState(null);
  // Estados de Actualizar Observacion de Detalle_pedido
  const [mostrarModalEditar, setMostrarModalEditar] = useState(false);
  const [detalleEditar, setDetalleEditar] = useState(null);
  const [obsEditar, setObsEditar] = useState("");

  //CheckBox Logic

  const toggleDetalle = (idPadre) => {
    const padre = detallesAgrupados.find((p) => p.id_detalle === idPadre);
    if (!padre) return;

    const idsPadreEHijos = [
      padre.id_detalle,
      ...padre.toppings.map((t) => t.id_detalle),
    ];

    setSeleccionados((prev) => {
      const yaSeleccionado = prev.includes(padre.id_detalle);

      if (yaSeleccionado) {
        // QUITAR padre + hijos
        return prev.filter((id) => !idsPadreEHijos.includes(id));
      } else {
        // AGREGAR padre + hijos
        return Array.from(new Set([...prev, ...idsPadreEHijos]));
      }
    });
  };

  // Resumen de cuenta

  // useMutation para actualizar estado del detalle
  const queryClient = useQueryClient();

  const pagarMutation = useMutation({
    mutationFn: pagarCuenta,
    onSuccess: (res) => {
      // 🟢 Mensaje de confirmación
      setMensajeOk(`Pago registrado correctamente. Cuenta ${res.cuenta}`);

      // 🔄 Refrescar datos
      queryClient.invalidateQueries(["pedido", idPedido]);
      queryClient.invalidateQueries(["pedidos"]);
      queryClient.invalidateQueries(["cuentaActual", idPedido]);

      // 🧹 Reset UI
      setSeleccionados([]);
      setPagos([{ metodo: "efectivo", monto: "" }]);
      setMostrarModalPago(false);
      setTimeout(() => setMensajeOk(""), 3000);
    },
    onError: (err) => {
      alert(err.response?.data?.error || "❌ Error al procesar el pago");
    },
  });

  const { data: detalles = [] } = useQuery({
    queryKey: ["pedido", idPedido],
    queryFn: () => getPedidoDetalle(idPedido),
    enabled: !!idPedido,
  });

  // -------- AGRUPAR PADRES CON TOPPINGS --------
  const agruparDetalles = () => {
    const padres = detalles.filter((d) => !d.id_detalle_padre);

    return padres.map((padre) => {
      const toppings = detalles.filter(
        (d) => d.id_detalle_padre === padre.id_detalle,
      );

      return {
        ...padre,
        toppings,
      };
    });
  };

  const detallesAgrupados = agruparDetalles();

  const { data: cuentaData } = useQuery({
    queryKey: ["cuentaActual", idPedido],
    queryFn: () => getCuentaActual(idPedido),
    enabled: !!idPedido,
  });

  const cuentaActual = cuentaData?.cuenta_actual ?? 1;

  const detallesCuenta = detalles.filter(
    (d) => d.estado === "pendiente" && seleccionados.includes(d.id_detalle),
  );

  const totalCuenta = detallesCuenta.reduce((acc, d) => acc + d.precio, 0);

  const { data: pedidos = [] } = useQuery({
    queryKey: ["pedidos"],
    queryFn: getPedidos,
  });

  // Detalles seleccionados para pagar

  const detallesSeleccionados = detalles.filter(
    (d) => d.estado === "pendiente" && seleccionados.includes(d.id_detalle),
  );

  // Resumen de la cuenta

  const resumenCuenta = Object.values(
    detallesSeleccionados.reduce((acc, item) => {
      const key = `${item.nombre}-${item.precio}`;

      if (!acc[key]) {
        acc[key] = {
          nombre: item.nombre,
          porcion: item.porcion,
          unidad_medida: item.unidad_medida,
          cantidad: 1,
          precioTotal: item.precio,
        };
      } else {
        acc[key].cantidad += 1;
        acc[key].precioTotal += item.precio;
      }

      return acc;
    }, {}),
  );

  /**
   * ---------checkbox logic---------
   */

  // obtener los id visibles

  const idsVisibles = detalles
    .filter((d) => d.estado === "pendiente")
    .map((d) => d.id_detalle);

  // estados del checkbox maestro

  const todosSeleccionados =
    idsVisibles.length > 0 &&
    idsVisibles.every((id) => seleccionados.includes(id));

  // función toggle masivo

  const toggleTodos = () => {
    if (todosSeleccionados) {
      // desmarcar todos
      setSeleccionados((prev) =>
        prev.filter((id) => !idsVisibles.includes(id)),
      );
    } else {
      // marcar todos
      setSeleccionados((prev) =>
        Array.from(new Set([...prev, ...idsVisibles])),
      );
    }
  };

  // Agregar Pago compuesto

  /*  const agregarPago = () => {
    setPagos([...pagos, { metodo: "efectivo", monto: "" }]);
  }; */

  /* ----------- Modal Agregar Productos-----------*/

  const agregarProductoMutation = useMutation({
    mutationFn: agregarDetallePedido,
    onSuccess: () => {
      queryClient.invalidateQueries(["pedido", idPedido]);
      setMostrarModalProducto(false);
      setProductoSel(null);
      setObservacion("");
    },
    onError: () => {
      alert("❌ Error al agregar producto");
    },
  });

  // Borrar Detalle Mutation

  const borrarDetalleMutation = useMutation({
    mutationFn: actualizarEstadoDetalle,
    onSuccess: (res) => {
      setMensajeOk(res.mensaje);
      queryClient.invalidateQueries(["pedido", idPedido]);
      setMostrarModalBorrar(false);
      setDetalleABorrar(null);
      setTimeout(() => setMensajeOk(""), 3000);
    },
    onError: (err) => {
      alert(err.response?.data?.error || "Error al actualizar producto");
    },
  });

  // Actualizar Observacion Mutation

  const editarObservacionMutation = useMutation({
    mutationFn: actualizarObservacionDetalle,
    onSuccess: (res) => {
      setMensajeOk(res.mensaje);
      queryClient.invalidateQueries(["pedido", idPedido]);
      setMostrarModalEditar(false);
      setDetalleEditar(null);
      setObsEditar("");
      setTimeout(() => setMensajeOk(""), 3000);
    },
    onError: (err) => {
      alert(err.response?.data?.error || "Error al actualizar observación");
    },
  });

  /*--cerrar DrawerMobile---*/

  const cerrarDrawerMobile = () => {
    const drawer = document.getElementById("my-drawer-3");
    if (drawer && window.innerWidth < 1024) {
      drawer.checked = false;
    }
  };

  /* NUEVO BUSCADOR DE MODAL */

  // Nuevo estado para el buscador local
  const [busquedaProducto, setBusquedaProducto] = useState("");

  // Query modificada: Traemos todos los productos (sin depender de selectores)
  const { data: todosLosProductos = [] } = useQuery({
    queryKey: ["productos_todos"],
    queryFn: () => getCartaOrden({}), // Llamada sin filtros para traer todo
  });

  // Lógica de filtrado local
  const productosFiltrados = todosLosProductos.filter((p) =>
    p.nombre.toLowerCase().includes(busquedaProducto.toLowerCase()),
  );

  // Mutation de Cambiar Mesa

  const { data: mesas = [] } = useQuery({
    queryKey: ["mesas"],
    queryFn: getMesas,
  });

  const cambiarMesaMutation = useMutation({
    mutationFn: cambiarMesaPedido,
    onSuccess: (res) => {
      setMensajeOk(res.mensaje);

      queryClient.invalidateQueries(["pedidos"]);
      queryClient.invalidateQueries(["pedido", idPedido]);

      setMostrarModalCambiarMesa(false);
      setTimeout(() => setMensajeOk(""), 3000);
    },
    onError: (err) => {
      alert(err.response?.data?.error || "Error al cambiar de mesa");
    },
  });

  return (
    <div className="w-full shadow-md">
      {mensajeOk && (
        <div className="toast toast-top toast-end z-50">
          <div className="alert alert-success">
            <span>{mensajeOk}</span>
          </div>
        </div>
      )}

      <HeaderNav />

      <div className="flex flex-col md:flex-row w-full bg-neutral-800">
        <div className="drawer lg:drawer-open w-full">
          <input id="my-drawer-3" type="checkbox" className="drawer-toggle" />

          {/* CONTENIDO PRINCIPAL */}
          <div className="drawer-content p-4 w-full">
            <label
              htmlFor="my-drawer-3"
              className="btn drawer-button lg:hidden mb-4 btn-outline text-primary"
            >
              ☰
            </label>
            <div className="flex flex-row justify-between items-center">
              <h1 className="text-2xl font-bold mb-4">Detalles del Pedido</h1>
              <button
                className="btn btn-sm btn-warning mr-2 mb-2"
                disabled={!hayPedidoSeleccionado}
                onClick={() => {
                  if (!hayPedidoSeleccionado) return;
                  setMostrarModalCambiarMesa(true);
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"
                  />
                </svg>

                <span className="hidden md:inline">Cambiar de Mesa</span>
              </button>
            </div>

            {/* PRODUCTOS A PAGAR */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/*TABLA LISTA DE PRODUCTOS A ELEGIR */}
              <div className="flex flex-col bg-black p-4 rounded-lg shadow-md">
                {/* Botones de accion */}
                <div className="flex flex-row justify-between">
                  <div>
                    <button
                      className="btn btn-sm btn-dash btn-warning mr-2 mb-2"
                      onClick={() => {
                        if (seleccionados.length === 0) {
                          setMensajeOk("❌ No se seleccionó ningún producto");
                          setTimeout(() => setMensajeOk(""), 2500);
                          return;
                        }

                        imprimirCocina({
                          idPedido,
                          detalles: seleccionados,
                        });
                      }}
                    >
                      Cocina
                    </button>
                  </div>
                  <button
                    className="btn btn-sm btn-primary mr-2 mb-2"
                    onClick={() => setMostrarModalProducto(true)}
                  >
                    <svg
                      width="18"
                      height="18"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                      <path d="M12 8v8" />
                      <path d="M8 12h8" />
                    </svg>
                    <span className="hidden md:inline">Agregar Producto</span>
                  </button>
                </div>
                {/* Tabla de productos individuales para escoger*/}
                <div className="flex flex-col overflow-x-auto">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>
                          <input
                            type="checkbox"
                            className="checkbox checkbox-primary"
                            checked={todosSeleccionados}
                            onChange={toggleTodos}
                          />
                        </th>
                        <th>Nombre</th>
                        <th>Topping</th>
                        <th>Observacion</th>
                        <th>acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detallesAgrupados
                        .filter((d) => d.estado === "pendiente")
                        .map((d) => (
                          <tr key={d.id_detalle}>
                            <td>
                              <input
                                type="checkbox"
                                checked={seleccionados.includes(d.id_detalle)}
                                onChange={() => toggleDetalle(d.id_detalle)}
                                className="checkbox checkbox-primary"
                              />
                            </td>

                            <td className="min-w-27">
                              {d.nombre}
                              {d.porcion && (
                                <span className="opacity-70">
                                  {" "}
                                  ({d.porcion} {d.unidad_medida})
                                </span>
                              )}
                            </td>

                            {/* TOPPINGS */}
                            <td className="min-w-31 text-accent">
                              {d.toppings.length > 0 && (
                                <ul className="list-disc pl-4">
                                  {d.toppings.map((t) => (
                                    <li key={t.id_detalle}>{t.nombre}</li>
                                  ))}
                                </ul>
                              )}
                            </td>

                            <td>{d.observacion}</td>

                            <td className="flex gap-2">
                              <button
                                className="btn btn-sm btn-info btn-square"
                                onClick={() => {
                                  setDetalleEditar(d);
                                  setObsEditar(d.observacion || "");
                                  setMostrarModalEditar(true);
                                }}
                              >
                                {/* Boton Editar */}
                                <svg
                                  width="16"
                                  height="16"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  viewBox="0 0 24 24"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                </svg>
                              </button>

                              <button
                                className="btn btn-sm btn-secondary btn-square"
                                onClick={() => {
                                  setDetalleABorrar(d);
                                  setMostrarModalBorrar(true);
                                }}
                              >
                                {/* Boton Borrar */}
                                <svg
                                  width="18"
                                  height="18"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  viewBox="0 0 24 24"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path d="M3 6h18" />
                                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                </svg>
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
              {/* Total a pagar */}
              <div className="bg-black p-4 rounded-lg shadow-md">
                <div className="flex items-center gap-2">
                  <p className="text-xl font-bold">Cuenta {cuentaActual}</p>
                </div>

                <div className="divider"></div>
                {/**Tabla resumen a pagar por cuenta */}
                <div className="flex flex-col overflow-x-auto">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Cant.</th>
                        <th>Nombre</th>
                        <th>Precio Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {resumenCuenta.map((item, i) => (
                        <tr key={i}>
                          <td>{item.cantidad}</td>
                          <td>
                            {item.nombre}
                            {item.porcion && (
                              <span className="opacity-70">
                                {" "}
                                ({item.porcion} {item.unidad_medida})
                              </span>
                            )}
                          </td>
                          <td>{item.precioTotal.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex justify-end mt-4 p-4 border-t">
                  <span className="font-bold text-lg">Total: S/ </span>
                  <span className="font-bold text-lg">
                    {totalCuenta.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between p-4 gap-2">
                  <div className="flex flex-row gap-1">
                    <button
                      className="btn btn-md btn-dash btn-warning lg:btn-sm"
                      onClick={() => {
                        if (seleccionados.length === 0) {
                          setMensajeOk("❌ No hay productos seleccionados");
                          setTimeout(() => setMensajeOk(""), 2500);
                          return;
                        }

                        imprimirVoucher({
                          idPedido,
                          detalles: seleccionados,
                        });
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="size-5"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12 2.25a.75.75 0 0 1 .75.75v11.69l3.22-3.22a.75.75 0 1 1 1.06 1.06l-4.5 4.5a.75.75 0 0 1-1.06 0l-4.5-4.5a.75.75 0 1 1 1.06-1.06l3.22 3.22V3a.75.75 0 0 1 .75-.75Zm-9 13.5a.75.75 0 0 1 .75.75v2.25a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5V16.5a.75.75 0 0 1 1.5 0v2.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V16.5a.75.75 0 0 1 .75-.75Z"
                          clipRule="evenodd"
                        />
                      </svg>

                      <span className="hidden md:inline">Imprimir</span>
                    </button>
                    <button
                      className="btn btn-dash btn-accent btn-md lg:btn-sm text-accent"
                      onClick={() => {
                        if (seleccionados.length === 0) {
                          setMensajeOk("❌ No hay productos seleccionados");
                          setTimeout(() => setMensajeOk(""), 2500);
                          return;
                        }
                        setMostrarModalWhatsapp(true);
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="size-6"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z"
                        />
                      </svg>
                      <span className="hidden md:inline">whatsapp</span>
                    </button>
                  </div>
                  <button
                    className="btn btn-success btn-md lg:btn-sm"
                    disabled={seleccionados.length === 0}
                    onClick={() => setMostrarModalPago(true)}
                  >
                    Pagar
                  </button>
                </div>
              </div>
            </div>
            {/* FIN PRODUCTOS A PAGAR */}
          </div>
          {/* SIDEBAR */}
          <div className="drawer-side">
            <label htmlFor="my-drawer-3" className="drawer-overlay"></label>
            <ul className="menu bg-neutral-700 min-h-full w-80 p-4">
              <p className="text-xl font-bold">Pedidos</p>
              <div className="divider"></div>

              {pedidos.map((p) => (
                <li key={p.id_pedido}>
                  <Link
                    to={`/orden/${p.id_pedido}`}
                    onClick={cerrarDrawerMobile}
                    className={`flex justify-between mb-2 ${
                      Number(idPedido) === p.id_pedido
                        ? "btn bg-primary text-white"
                        : "btn btn-outline text-primary"
                    }`}
                  >
                    <span className="font-bold">#{p.id_pedido}</span>
                    <span>{p.mesa}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Modal de Pago */}

      {mostrarModalPago && (
        <dialog className="modal modal-open">
          <div className="modal-box max-w-lg">
            {/* HEADER */}
            <h3 className="font-bold text-lg flex items-center gap-2">
              <span>CUENTA {cuentaActual}</span>
              <span className="opacity-70">
                – {pedidos.find((p) => p.id_pedido == idPedido)?.mesa}
              </span>
            </h3>

            <div className="divider"></div>

            {/* TOTAL */}
            <p className="text-lg font-semibold">
              Total a pagar: S/ {totalCuenta.toFixed(2)}
            </p>

            {/* PAGOS */}
            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold">Pagos</span>
                <button
                  className="btn btn-xs btn-dash btn-warning"
                  onClick={() =>
                    setPagos([...pagos, { metodo: "efectivo", monto: "" }])
                  }
                >
                  + Agregar pago
                </button>
              </div>

              {pagos.map((pago, index) => (
                <div key={index} className="flex gap-2 mb-2 items-center">
                  <select
                    className="select select-bordered w-1/2"
                    value={pago.metodo}
                    onChange={(e) => {
                      const copia = [...pagos];
                      copia[index].metodo = e.target.value;
                      setPagos(copia);
                    }}
                  >
                    <option value="efectivo">Efectivo</option>
                    <option value="yape">Yape</option>
                    <option value="plin">Plin</option>
                    <option value="agora">Agora</option>
                    <option value="transferencia">Transferencia</option>
                  </select>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="input input-bordered w-1/2"
                    placeholder="Monto"
                    value={pago.monto}
                    onChange={(e) => {
                      let valor = e.target.value;
                      valor =
                        valor === "" ? "" : Math.max(0, parseFloat(valor));

                      const copia = [...pagos];
                      copia[index].monto = valor;
                      setPagos(copia);
                    }}
                  />

                  <button
                    className="btn btn-xs btn-secondary"
                    disabled={pagos.length === 1}
                    onClick={() => {
                      if (pagos.length === 1) return;
                      setPagos(pagos.filter((_, i) => i !== index));
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            {/* CALCULOS */}
            {(() => {
              const totalPagado = pagos.reduce(
                (acc, p) => acc + (parseFloat(p.monto) || 0),
                0,
              );

              const saldo = Math.max(totalCuenta - totalPagado, 0);
              const vuelto = Math.max(totalPagado - totalCuenta, 0);

              const pagoValido = totalPagado >= totalCuenta;

              return (
                <>
                  <div className="divider"></div>

                  <div className="flex justify-between">
                    <span>Saldo a pagar:</span>
                    <span className="font-semibold">S/ {saldo.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Vuelto:</span>
                    <span className="font-semibold">
                      S/ {vuelto.toFixed(2)}
                    </span>
                  </div>

                  {/* BOTONES */}
                  <div className="modal-action">
                    <button
                      className="btn btn-secondary"
                      onClick={() => {
                        setMostrarModalPago(false);
                        setPagos([{ metodo: "efectivo", monto: "" }]);
                      }}
                    >
                      Cancelar
                    </button>

                    <button
                      className="btn btn-success"
                      disabled={!pagoValido || pagarMutation.isLoading}
                      onClick={() => {
                        pagarMutation.mutate({
                          idPedido,
                          payload: {
                            detalles: seleccionados,
                            pagos: pagos.map((p) => ({
                              metodo: p.metodo,
                              monto: parseFloat(p.monto),
                            })),
                            vuelto,
                          },
                        });
                      }}
                    >
                      {pagarMutation.isLoading
                        ? "Procesando..."
                        : "Confirmar Pago"}
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </dialog>
      )}

      {/*Fin Modal de Pago */}

      {/*Modal de Agregar Producto */}

      {mostrarModalProducto && (
        <dialog className="modal modal-open">
          <div className="modal-box max-w-2xl h-[80vh] flex flex-col">
            <h3 className="font-bold text-lg">Seleccionar Producto</h3>
            <div className="divider my-1"></div>

            {/* Buscador */}
            <div className="relative mb-4">
              <input
                type="text"
                className="input input-bordered w-full pl-10"
                placeholder="Buscar producto por nombre..."
                value={busquedaProducto}
                onChange={(e) => setBusquedaProducto(e.target.value)}
                autoFocus
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 absolute left-3 top-3 opacity-50"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            {/* Tabla de Productos */}
            <div className="flex-grow overflow-y-auto border rounded-lg bg-base-200">
              <table className="table table-pin-rows table-sm">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Porción</th>
                    <th className="text-right">Precio</th>
                  </tr>
                </thead>
                <tbody>
                  {productosFiltrados.length > 0 ? (
                    productosFiltrados.map((p) => (
                      <tr
                        key={p.id_carta}
                        className={`cursor-pointer hover:bg-primary hover:text-white ${productoSel?.id_carta === p.id_carta ? "bg-primary text-white" : ""}`}
                        onClick={() => setProductoSel(p)}
                      >
                        <td className="font-medium">{p.nombre}</td>
                        <td>
                          {p.porcion} {p.unidad_medida}
                        </td>
                        <td className="text-right min-w-20">
                          S/ {p.precio.toFixed(2)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="text-center py-4">
                        No se encontraron productos
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Observación y Acción */}
            <div className="mt-4 space-y-3">
              {productoSel && (
                <div className="badge badge-primary gap-2 p-3">
                  Seleccionado: {productoSel.nombre}
                </div>
              )}

              <textarea
                className="textarea textarea-bordered w-full"
                placeholder="Agregar observación al producto..."
                rows="2"
                value={observacion}
                onChange={(e) => setObservacion(e.target.value)}
              />

              <div className="modal-action mt-0">
                <button
                  className="btn btn-outline"
                  onClick={() => {
                    setMostrarModalProducto(false);
                    setProductoSel(null);
                    setBusquedaProducto("");
                    setObservacion("");
                  }}
                >
                  Cancelar
                </button>

                <button
                  className="btn btn-success"
                  disabled={!productoSel || agregarProductoMutation.isLoading}
                  onClick={() =>
                    agregarProductoMutation.mutate({
                      idPedido,
                      payload: {
                        id_carta: productoSel.id_carta,
                        observacion,
                      },
                    })
                  }
                >
                  {agregarProductoMutation.isLoading
                    ? "Guardando..."
                    : "Agregar al Pedido"}
                </button>
              </div>
            </div>
          </div>
        </dialog>
      )}

      {/*FIN Modal de Agregar Producto */}

      {/*Modal de eliminar Producto */}

      {mostrarModalBorrar && detalleABorrar && (
        <dialog className="modal modal-open">
          <div className="modal-box max-w-md">
            <h3 className="font-bold text-lg">Borrar Producto</h3>
            <div className="divider"></div>

            <p className="mb-4 text-sm opacity-80">
              Selecciona el motivo para quitar el producto:
            </p>

            <ul className="list-disc pl-5 text-sm space-y-2 mb-6">
              <li>
                <b>Cancelado:</b> Quitar producto antes de ser preparado
              </li>
              <li>
                <b>Pérdida:</b> Producto preparado o dañado por accidente
              </li>
            </ul>

            <div className="modal-action flex justify-between">
              <button
                className="btn btn-outline text-secondary"
                onClick={() => {
                  setMostrarModalBorrar(false);
                  setDetalleABorrar(null);
                }}
              >
                Cerrar
              </button>

              <div className="flex gap-2">
                <button
                  className="btn btn-secondary"
                  onClick={() =>
                    borrarDetalleMutation.mutate({
                      idDetalle: detalleABorrar.id_detalle,
                      estado: "cancelado",
                    })
                  }
                >
                  Cancelar
                </button>

                <button
                  className="btn btn-secondary"
                  onClick={() =>
                    borrarDetalleMutation.mutate({
                      idDetalle: detalleABorrar.id_detalle,
                      estado: "perdida",
                    })
                  }
                >
                  Pérdida
                </button>
              </div>
            </div>
          </div>
        </dialog>
      )}

      {/*FIN Modal de eliminar Producto */}

      {/*Modal de actualizar observacion de detalle_pedido */}

      {mostrarModalEditar && detalleEditar && (
        <dialog className="modal modal-open">
          <div className="modal-box max-w-md">
            <h3 className="font-bold text-lg">Actualizar Producto</h3>
            <div className="divider"></div>
            <div className="flex flex-col gap-3 mb-3">
              <span>Lista de Toppings</span>
              <div className="flex-grow overflow-y-auto border rounded-lg bg-base-200">
                <table className="table table-pin-rows table-sm">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Chantilly</td>
                    </tr>
                    <tr>
                      <td>Chin Chin</td>
                    </tr>
                    <tr>
                      <td>Helado</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="flex flex-row gap-2">
                <div className="badge badge-primary gap-2 p-3">
                  Chantilly
                  <button>✕</button> 
                </div>
                <div className="badge badge-primary gap-2 p-3">
                  Chin Chin
                  <button>✕</button>
                </div>
              </div>
            </div>
            <textarea
              className="textarea textarea-bordered w-full"
              placeholder="Observación"
              value={obsEditar}
              onChange={(e) => setObsEditar(e.target.value)}
            />

            <div className="modal-action flex justify-between">
              <button
                className="btn btn-outline text-secondary"
                onClick={() => {
                  setMostrarModalEditar(false);
                  setDetalleEditar(null);
                }}
              >
                Cerrar
              </button>

              <button
                className="btn btn-success"
                onClick={() =>
                  editarObservacionMutation.mutate({
                    idDetalle: detalleEditar.id_detalle,
                    observacion: obsEditar,
                  })
                }
              >
                Actualizar
              </button>
            </div>
          </div>
        </dialog>
      )}

      {/*FIN Modal de actualizar observacion de detalle_pedido */}

      {/*Modal de enviar Voucher por Whatsapp */}

      {mostrarModalWhatsapp && (
        <dialog className="modal modal-open">
          <div className="modal-box max-w-md">
            <h3 className="font-bold text-lg">Enviar Voucher por WhatsApp</h3>
            <div className="divider"></div>

            <p className="mb-2">Número de celular (9 dígitos):</p>

            <input
              type="text"
              maxLength={9}
              placeholder="956228708"
              className="input input-bordered w-full"
              value={telefonoWhatsapp}
              onChange={(e) =>
                setTelefonoWhatsapp(e.target.value.replace(/\D/g, ""))
              }
            />

            <div className="modal-action flex justify-between mt-4">
              <button
                className="btn btn-outline text-secondary"
                onClick={() => {
                  setMostrarModalWhatsapp(false);
                  setTelefonoWhatsapp("");
                }}
              >
                Cancelar
              </button>

              <button
                className="btn btn-success"
                disabled={telefonoWhatsapp.length !== 9}
                onClick={async () => {
                  const texto = await generarVoucherWhatsapp({
                    idPedido,
                    detalles: seleccionados,
                  });

                  const numeroFinal = `+51${telefonoWhatsapp}`;

                  const whatsappURL = `https://wa.me/${numeroFinal}?text=${encodeURIComponent(texto)}`;

                  window.open(whatsappURL, "_blank");

                  setMostrarModalWhatsapp(false);
                  setTelefonoWhatsapp("");
                }}
              >
                Enviar
              </button>
            </div>
          </div>
        </dialog>
      )}

      {/*FIN Modal de enviar Voucher por Whatsapp*/}

      {/* MODAL cambiar de mesa */}

      {mostrarModalCambiarMesa && (
        <dialog className="modal modal-open">
          <div className="modal-box max-w-md">
            <h3 className="font-bold text-lg">Cambiar de Mesa</h3>

            <div className="divider"></div>

            <select
              className="select select-bordered w-full"
              value={mesaSeleccionada || ""}
              onChange={(e) => setMesaSeleccionada(e.target.value)}
            >
              <option disabled value="">
                Selecciona una mesa disponible
              </option>

              {mesas
                .filter((m) => m.disponibilidad)
                .map((m) => (
                  <option key={m.id_mesas} value={m.id_mesas}>
                    {m.nombre} (cap. {m.capacidad})
                  </option>
                ))}
            </select>

            <div className="modal-action">
              <button
                className="btn btn-outline"
                onClick={() => {
                  setMostrarModalCambiarMesa(false);
                  setMesaSeleccionada(null);
                }}
              >
                Cancelar
              </button>

              <button
                className="btn btn-success"
                disabled={!mesaSeleccionada}
                onClick={() =>
                  cambiarMesaMutation.mutate({
                    idPedido,
                    idMesaNueva: mesaSeleccionada,
                  })
                }
              >
                Confirmar
              </button>
            </div>
          </div>
        </dialog>
      )}

      {/* Fin MODAL cambiar de mesa */}
    </div>
  );
}

export default OrdenPage;

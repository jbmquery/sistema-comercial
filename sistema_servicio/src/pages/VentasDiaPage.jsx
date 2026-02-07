// sistema_servicio/src/pages/VentasDiaPage.jsx

import HeaderNav from "../components/header_nav.jsx";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import {
  getProductosVendidosDia,
  getProductosPerdidaDia,
  getTiposVentaDia,
  getVentasMesasDia,
  getResumenPedidosDia,
  getCajaDia,
  getDetallePedidoVentasDia,
  getProveedores,
  getCostosDia,
  crearCosto,
  getInsumosDistinct,
  buscarCostosPrevios,
  crearCaja,
  cerrarCaja,
} from "../api";

function VentasDiaPage() {
  const hoy = new Date(
    new Date().getTime() - new Date().getTimezoneOffset() * 60000,
  )
    .toISOString()
    .split("T")[0];

  // ESTADOS

  const [modalCosto, setModalCosto] = useState(false);
  const [insumoBusqueda, setInsumoBusqueda] = useState("");
  const [insumoSugerencias, setInsumoSugerencias] = useState([]);
  const [mostrarDropdownInsumo, setMostrarDropdownInsumo] = useState(false);
  const [busquedaCostoPrevio, setBusquedaCostoPrevio] = useState("");
  const [sugerenciasCostoPrevio, setSugerenciasCostoPrevio] = useState([]);
  const [mostrarDropdownCostoPrevio, setMostrarDropdownCostoPrevio] =
    useState(false);
  const [costosPreviosCache, setCostosPreviosCache] = useState([]);
  const [modalCaja, setModalCaja] = useState(false);
  const [modoCaja, setModoCaja] = useState("apertura"); // apertura | cierre
  const [montoApertura, setMontoApertura] = useState(0);
  const [dineroReal, setDineroReal] = useState(0);
  const [observacionCaja, setObservacionCaja] = useState("");
  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
  const [costoForm, setCostoForm] = useState({
    id_insumo: "",
    id_proveedor: "",
    precio_unitario: 0,
    cantidad: 1,
    unidad_medida: "",
    total_compra: 0,
    forma_pago: "efectivo",
    observacion: "",
  });

  //console.log("FECHA QUE ENVÍO A LA API:", hoy);

  const { data: productosVendidos = [], isLoading } = useQuery({
    queryKey: ["productosVendidos", hoy],
    queryFn: () => getProductosVendidosDia(hoy),
  });

  const { data: productosPerdida = [], isLoading: loadingPerdida } = useQuery({
    queryKey: ["productosPerdida", hoy],
    queryFn: () => getProductosPerdidaDia(hoy),
  });

  const { data: tiposVenta = [], isLoading: loadingTiposVenta } = useQuery({
    queryKey: ["tiposVenta", hoy],
    queryFn: () => getTiposVentaDia(hoy),
  });

  const { data: ventasMesas = [], isLoading: loadingMesas } = useQuery({
    queryKey: ["ventasMesas", hoy],
    queryFn: () => getVentasMesasDia(hoy),
  });

  const { data: resumenPedidos = [], isLoading: loadingResumen } = useQuery({
    queryKey: ["resumenPedidos", hoy],
    queryFn: () => getResumenPedidosDia(hoy),
  });

  const {
    data: caja = null,
    isLoading: loadingCaja,
    refetch: refetchCaja,
  } = useQuery({
    queryKey: ["cajaDia", hoy],
    queryFn: () => getCajaDia(hoy),
  });

  //QUERIES PARA COSTOS

  const { data: proveedores = [] } = useQuery({
    queryKey: ["proveedores"],
    queryFn: getProveedores,
  });

  const { data: costos = [], refetch: refetchCostos } = useQuery({
    queryKey: ["costos", hoy],
    queryFn: () => getCostosDia(hoy),
  });

  const APERTURA = caja?.monto_apertura || 0;
  const COSTOS = costos.reduce((acc, c) => acc + Number(c.total || 0), 0);

  const efectivo = caja?.efectivo || 0;
  const yape = caja?.yape || 0;
  const plin = caja?.plin || 0;
  const agora = caja?.agora || 0;
  const transferencia = caja?.transferencia || 0;
  const totalIngresos = caja?.total_ingresos || 0;
  const perdidas = caja?.perdidas || 0;

  const sumaIngresos = efectivo + yape + plin + agora + transferencia;

  const sumaEgresos = COSTOS;

  const vuelto = sumaIngresos - totalIngresos;

  const dineroEnCaja = APERTURA + efectivo - sumaEgresos - vuelto;

  // -----------* Agrupar detalles pedido del modal VER DETALLE PEDIDO *-------------

  const agruparDetalles = (detalles = []) => {
    const mapa = {};

    detalles.forEach((item) => {
      // Clave única por nombre + porción + unidad
      const clave = `${item.nombre}|${item.porcion || ""}|${item.unidad_medida || ""}`;

      if (!mapa[clave]) {
        mapa[clave] = { ...item };
      } else {
        mapa[clave].cantidad += item.cantidad;
        mapa[clave].precio_total += item.precio_total;
      }
    });

    return Object.values(mapa);
  };

  // ----*-------Apagartado para el modal VER DETALLLE PEDIDO -----------*----
  const [modalAbierto, setModalAbierto] = useState(false);
  const [detallePedido, setDetallePedido] = useState(null);
  const [pedidoActual, setPedidoActual] = useState(null);

  const verPedido = async (pedido) => {
    const data = await getDetallePedidoVentasDia(pedido.id_pedido);

    setPedidoActual({
      id_pedido: pedido.id_pedido,
      mesa: pedido.mesa,
    });

    setDetallePedido(data);
    setModalAbierto(true);
  };

  // CALCULOS DE TOTALES

  useEffect(() => {
    const total = costoForm.precio_unitario * costoForm.cantidad;
    setCostoForm((f) => ({ ...f, total_compra: total }));
  }, [costoForm.precio_unitario, costoForm.cantidad]);

  const { data: insumos = [] } = useQuery({
    queryKey: ["insumos-distinct"],
    queryFn: getInsumosDistinct,
  });

  useEffect(() => {
    if (!insumoBusqueda) {
      setInsumoSugerencias([]);
      return;
    }

    const filtrados = insumos.filter((i) =>
      i.nombre.toLowerCase().includes(insumoBusqueda.toLowerCase()),
    );

    setInsumoSugerencias(filtrados.slice(0, 5));
  }, [insumoBusqueda, insumos]);

  useEffect(() => {
    const total = costoForm.precio_unitario * costoForm.cantidad;
    setCostoForm((f) => ({
      ...f,
      total_compra: total || 0,
    }));
  }, [costoForm.precio_unitario, costoForm.cantidad]);

  useEffect(() => {
    if (!busquedaCostoPrevio) {
      setSugerenciasCostoPrevio(costosPreviosCache.slice(0, 10));
      return;
    }

    const filtrados = costosPreviosCache.filter((r) =>
      r.nombre_insumo.toLowerCase().includes(busquedaCostoPrevio.toLowerCase()),
    );

    setSugerenciasCostoPrevio(filtrados.slice(0, 10));
  }, [busquedaCostoPrevio, costosPreviosCache]);

  //pruebas log

  // console.log("Productos vendidos:", productosVendidos);
  // console.log("Productos perdida:", productosPerdida);
  // console.log("tipo de ventas:", tiposVenta);
  // console.log("ventas por mesa:", ventasMesas);
  // console.log("Resumen de pedidos:", resumenPedidos);

  return (
    <div className="flex flex-col justify-center items-center bg-neutral-800">
      <HeaderNav />
      {/* Cuerpo Principal */}
      <div className="flex flex-col m-3 w-[95vw] gap-5">
        {/* Encabezado de cierre */}
        <div className="bg-black rounded shadow p-3 w-full flex flex-col lg:flex-row justify-between gap-6 lg:gap-2">
          <div className="flex flex-col lg:flex-row ">
            <span className="text-lg lg:text-xl lg:mr-10 animate-pulse text-warning">
              PROXIMAMENTE - Apertura de caja 🥳😎
            </span>
          </div>
          <div className="flex flex-row gap-2 justify-end">
            <button
              className="btn btn-md btn-info"
              onClick={() => {
                if (!caja) {
                  setModoCaja("apertura");
                } else {
                  setModoCaja("cierre");
                }
                setModalCaja(true);
              }}
            >
              {!caja ? "Abrir Caja" : "Cerrar Caja"}
            </button>
          </div>
        </div>
        {/* Cuerpo de cuadros */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Columna Izquierda */}
          <div className="flex flex-col gap-5">
            {/* Resumen Ingresos Totales Dia */}
            <div className="flex flex-col gap-5 p-5 bg-black rounded shadow py-5">
              <span className="text-3xl font-bold text-center text-success">
                Total Ingresos: S/{totalIngresos.toFixed(2)}
              </span>
              <div className="overflow-x-auto">
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th></th>
                      <th>Monto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingCaja ? (
                      <tr>
                        <td colSpan={2} className="text-center">
                          Cargando...
                        </td>
                      </tr>
                    ) : (
                      <>
                        <tr className="font-bold">
                          <td>APERTURA</td>
                          <td>S/. {APERTURA.toFixed(2)}</td>
                        </tr>

                        <tr className="text-amber-500 font-bold">
                          <td>EFECTIVO</td>
                          <td>S/. {efectivo.toFixed(2)}</td>
                        </tr>

                        <tr className="text-purple-500 font-bold">
                          <td>YAPE</td>
                          <td>S/. {yape.toFixed(2)}</td>
                        </tr>

                        <tr className="text-teal-500 font-bold">
                          <td>PLIN</td>
                          <td>S/. {plin.toFixed(2)}</td>
                        </tr>

                        <tr className="text-sky-500 font-bold">
                          <td>AGORA</td>
                          <td>S/. {agora.toFixed(2)}</td>
                        </tr>

                        <tr className="text-gray-500 font-bold">
                          <td>TRANSFERENCIA</td>
                          <td>S/. {transferencia.toFixed(2)}</td>
                        </tr>

                        <tr>
                          <td>COSTOS</td>
                          <td>S/. {COSTOS.toFixed(2)}</td>
                        </tr>

                        <tr>
                          <td>PERDIDAS</td>
                          <td>S/. {perdidas.toFixed(2)}</td>
                        </tr>

                        <tr className="font-bold">
                          <td>SUMA INGRESOS</td>
                          <td>S/. {sumaIngresos.toFixed(2)}</td>
                        </tr>

                        <tr className="text-red-500 font-bold">
                          <td>SUMA EGRESOS</td>
                          <td>S/. {sumaEgresos.toFixed(2)}</td>
                        </tr>

                        <tr className="font-bold">
                          <td>VUELTO</td>
                          <td>S/. {vuelto.toFixed(2)}</td>
                        </tr>

                        <tr className="font-bold">
                          <td>DINERO EN CAJA</td>
                          <td>S/. {dineroEnCaja.toFixed(2)}</td>
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Tipos de Ventas */}
            <div className="bg-black rounded shadow flex flex-col p-5">
              <span className="pl-3 py-3 text-xl font-bold">
                Tipos de ventas
              </span>

              <div className="overflow-x-auto">
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>Tipo de mesa</th>
                      <th>Cantidad</th>
                      <th>Monto total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingTiposVenta ? (
                      <tr>
                        <td colSpan={3} className="text-center p-4">
                          Cargando...
                        </td>
                      </tr>
                    ) : (
                      tiposVenta.map((t) => (
                        <tr key={t.tipo_mesa}>
                          <td>{t.tipo_mesa}</td>
                          <td>{t.cantidad}</td>
                          <td>S/. {t.monto.toFixed(2)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Ventas por Mesas */}
            <div className="bg-black rounded shadow flex flex-col p-5">
              <span className="pl-3 py-3 text-xl font-bold">
                Ventas por Mesas
              </span>

              <div className="overflow-x-auto">
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>Mesa</th>
                      <th>Pedidos</th>
                      <th>Monto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingMesas ? (
                      <tr>
                        <td colSpan={3} className="text-center p-4">
                          Cargando...
                        </td>
                      </tr>
                    ) : (
                      ventasMesas.map((m) => (
                        <tr key={m.mesa}>
                          <td>{m.mesa}</td>
                          <td>{m.pedidos}</td>
                          <td>S/. {m.monto.toFixed(2)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Costo */}
            <div className="bg-black rounded shadow flex flex-col p-5">
              <div className="flex flex-row justify-between items-center">
                <span className="pl-3 py-3 text-xl font-bold">
                  Costos (insumos)
                </span>
                <button
                  className="btn btn-sm btn-primary mr-2 mb-2"
                  onClick={async () => {
                    if (proveedores.length === 0) return;

                    const data = await buscarCostosPrevios(""); // vacío trae todo
                    setCostosPreviosCache(data);

                    setModalCosto(true);
                  }}
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
                  <span className="hidden md:inline">Agregar Insumo</span>
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th></th>
                      <th>Monto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {costos.map((c) => (
                      <tr key={c.id}>
                        <td>{c.nombre}</td>
                        <td>S/. {c.total.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          {/* Columna Derecho */}
          <div className="flex flex-col gap-5">
            {/* Productos vendidos */}
            <div className="bg-black rounded shadow flex flex-col p-5">
              <span className="pl-3 py-3 text-xl font-bold">
                Productos vendidos
              </span>

              {isLoading ? (
                <p className="text-center p-4">Cargando...</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Carta</th>
                        <th>Cantidad</th>
                        <th>Monto</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productosVendidos.map((p) => (
                        <tr key={p.id_carta}>
                          <td>
                            {p.nombre}
                            {p.porcion && p.unidad_medida
                              ? ` (${p.porcion} ${p.unidad_medida})`
                              : ""}
                          </td>

                          <td>{p.cantidad}</td>
                          <td>S/. {p.monto.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            {/* Productos Perdida */}
            <div className="bg-black rounded shadow flex flex-col p-5">
              <span className="pl-3 py-3 text-xl font-bold">
                Productos Perdida
              </span>
              <div className="overflow-x-auto">
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>Carta</th>
                      <th>Cantidad</th>
                      <th>Monto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingPerdida ? (
                      <tr>
                        <td colSpan={3} className="text-center p-4">
                          Cargando...
                        </td>
                      </tr>
                    ) : (
                      productosPerdida.map((p) => (
                        <tr key={p.id_carta}>
                          <td>
                            {p.nombre}
                            {p.porcion && p.unidad_medida
                              ? ` (${p.porcion} ${p.unidad_medida})`
                              : ""}
                          </td>
                          <td>{p.cantidad}</td>
                          <td>S/. {p.monto.toFixed(2)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        {/* Resumen de Pedidos */}
        <div className="bg-black rounded shadow p-3 w-full flex flex-col gap-6 lg:gap-2 mb-10">
          <span className="pl-3 py-3 text-xl font-bold">
            Resumen de Pedidos
          </span>
          <div className="overflow-x-auto">
            <table className="table table-sm">
              <thead>
                <tr>
                  <th className="min-w-15">id_pedido</th>
                  <th className="min-w-20">Mesa</th>
                  <th className="min-w-25">fecha</th>
                  <th className="min-w-20">Hora Pedido</th>
                  <th className="min-w-20">Hora Pago</th>
                  <th className="min-w-20">Estado</th>
                  <th className="min-w-20">Forma de Pago</th>
                  <th className="min-w-20">Monto Pedido</th>
                  <th className="min-w-20">Monto Pagado</th>
                  <th className="min-w-20">Vuelto</th>
                  <th className="min-w-20">
                    Acciones<nav></nav>
                  </th>
                </tr>
              </thead>
              <tbody>
                {loadingResumen ? (
                  <tr>
                    <td colSpan={10} className="text-center p-4">
                      Cargando...
                    </td>
                  </tr>
                ) : (
                  resumenPedidos.map((p) => (
                    <tr key={p.id_pedido}>
                      <td>{p.id_pedido}</td>
                      <td>{p.mesa}</td>
                      <td>{p.fecha}</td>
                      <td>{p.hora_pedido}</td>
                      <td>{p.hora_pago}</td>
                      <td>{p.estado}</td>
                      <td>{p.forma_pago}</td>
                      <td>S/. {p.monto_pedido.toFixed(2)}</td>
                      <td>S/. {p.monto_pagado.toFixed(2)}</td>
                      <td>S/. {p.vuelto.toFixed(2)}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-info"
                          onClick={() => verPedido(p)}
                        >
                          Ver
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {/* Modal Detalle Pedido */}
      {modalAbierto && detallePedido && (
        <dialog className="modal modal-open">
          <div className="modal-box max-w-2xl">
            <h3 className="font-bold text-lg">
              Pedido {pedidoActual.id_pedido} - {pedidoActual.mesa}
            </h3>

            <div className="divider"></div>

            <div className="overflow-x-auto">
              <table className="table table-sm w-full">
                <thead>
                  <tr>
                    <th>Cant.</th>
                    <th>Nombre</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {agruparDetalles(detallePedido.detalles).map((item, i) => (
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
                      <td>{item.precio_total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="divider"></div>

            <div className="text-right font-bold text-xl">
              Total: S/ {detallePedido.total.toFixed(2)}
            </div>

            <div className="modal-action flex justify-between mt-4">
              <button
                className="btn btn-outline text-secondary"
                onClick={() => setModalAbierto(false)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </dialog>
      )}
      {/* FIN Modal Detalle Pedido */}
      {/* MODAL DE COSTOS*/}
      {/* MODAL DE COSTOS*/}
      {modalCosto && (
        <dialog className="modal modal-open">
          <div className="modal-box max-w-2xl">
            <h3 className="font-bold text-lg">Agregar Costo / Insumo</h3>

            <div className="divider"></div>

            <div className="flex flex-col gap-3">
              {/* Buscar Compra Previa */}
              <div className="relative w-full">
                <input
                  className="input input-bordered w-full input-info"
                  placeholder="Buscar compra previa..."
                  value={busquedaCostoPrevio}
                  onFocus={() => setMostrarDropdownCostoPrevio(true)}
                  onBlur={() =>
                    setTimeout(() => setMostrarDropdownCostoPrevio(false), 150)
                  }
                  onChange={(e) => setBusquedaCostoPrevio(e.target.value)}
                />

                {mostrarDropdownCostoPrevio &&
                  sugerenciasCostoPrevio.length > 0 && (
                    <ul className="absolute z-50 mt-1 w-full menu bg-base-100 rounded-box shadow-lg max-h-60 overflow-y-auto">
                      {sugerenciasCostoPrevio.map((r) => (
                        <li key={r.id_registro}>
                          <a
                            onMouseDown={() => {
                              setCostoForm({
                                id_insumo: r.id_insumo,
                                id_proveedor: r.id_proveedor || "",
                                precio_unitario: r.precio_unitario,
                                cantidad: r.cantidad,
                                unidad_medida: r.unidad_medida,
                                total_compra: r.precio_unitario * r.cantidad,
                                forma_pago: r.forma_pago || "efectivo",
                                observacion: r.observacion || "",
                              });

                              setInsumoBusqueda(r.nombre_insumo);
                              setBusquedaCostoPrevio("");
                              setMostrarDropdownCostoPrevio(false);
                            }}
                          >
                            <div className="flex flex-col">
                              <span className="font-bold">
                                {r.nombre_insumo}
                              </span>
                              <span className="text-xs opacity-70">
                                {r.nombre_proveedor || "Sin proveedor"} · S/.{" "}
                                {r.precio_unitario}
                              </span>
                            </div>
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
              </div>

              {/* Buscar Insumo */}
              <div className="relative w-full">
                <input
                  className="input input-bordered w-full"
                  placeholder="Buscar insumo"
                  value={insumoBusqueda}
                  onFocus={() => setMostrarDropdownInsumo(true)}
                  onBlur={() =>
                    setTimeout(() => setMostrarDropdownInsumo(false), 150)
                  }
                  onChange={(e) => setInsumoBusqueda(e.target.value)}
                />

                {mostrarDropdownInsumo && insumoSugerencias.length > 0 && (
                  <ul
                    className="
      absolute z-50 mt-1 w-full
      menu bg-base-100 rounded-box shadow-lg
      max-h-60 overflow-y-auto
    "
                  >
                    {insumoSugerencias.map((i) => (
                      <li key={i.id_insumo}>
                        <a
                          onMouseDown={() => {
                            setCostoForm({
                              ...costoForm,
                              id_insumo: i.id_insumo,
                              unidad_medida: i.unidad_medida_base,
                            });
                            setInsumoBusqueda(i.nombre);
                            setInsumoSugerencias([]);
                            setMostrarDropdownInsumo(false);
                          }}
                        >
                          {i.nombre}
                          <span className="text-xs opacity-60 ml-2">
                            {i.unidad_medida_base}
                          </span>
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Proveedor */}
              <select
                className="select select-bordered w-full"
                value={costoForm.id_proveedor}
                onChange={(e) =>
                  setCostoForm({ ...costoForm, id_proveedor: e.target.value })
                }
              >
                <option value="">Seleccionar proveedor</option>
                {proveedores.map((p) => (
                  <option
                    key={p.id_proveedor}
                    value={p.id_proveedor}
                    className="text-white"
                  >
                    {p.nombre}
                  </option>
                ))}
              </select>

              {/* Precio */}
              <div className="flex flex-row gap-2 items-center">
                <span className="text-xs min-w-25">Precio Unitario</span>
                <input
                  type="number"
                  className="input input-bordered w-full"
                  placeholder="Precio unitario"
                  value={costoForm.precio_unitario}
                  onChange={(e) =>
                    setCostoForm({
                      ...costoForm,
                      precio_unitario: Number(e.target.value),
                    })
                  }
                />
              </div>

              {/* Cantidad */}
              <div className="flex flex-row gap-2 items-center">
                <span className="text-xs min-w-25">Cantidad</span>
                <input
                  type="number"
                  className="input input-bordered w-full"
                  placeholder="Cantidad"
                  value={costoForm.cantidad}
                  onChange={(e) =>
                    setCostoForm({
                      ...costoForm,
                      cantidad: Number(e.target.value),
                    })
                  }
                />
              </div>
              {/* Total */}
              <div className="flex flex-row gap-2 items-center">
                <span className="text-xs min-w-25">Total precio</span>
                <input
                  type="number"
                  className="input input-bordered w-full"
                  value={costoForm.total_compra}
                  onChange={(e) =>
                    setCostoForm({
                      ...costoForm,
                      total_compra: Number(e.target.value),
                    })
                  }
                />
              </div>

              {/* Unidad_medida */}
              <div className="flex flex-row gap-2 items-center">
                <span className="text-xs min-w-25">Unidad Medida</span>
                <input
                  className="input input-bordered w-full"
                  value={costoForm.unidad_medida}
                  onChange={(e) =>
                    setCostoForm({
                      ...costoForm,
                      unidad_medida: e.target.value,
                    })
                  }
                />
              </div>

              <div className="flex flex-row gap-2 items-center">
                <span className="text-xs min-w-25">Tipo de pago</span>
                <select
                  className="select select-bordered w-full"
                  onChange={(e) =>
                    setCostoForm({ ...costoForm, forma_pago: e.target.value })
                  }
                >
                  <option>Efectivo</option>
                  <option>Yape</option>
                  <option>Plin</option>
                  <option>Transferencia</option>
                </select>
              </div>

              <textarea
                className="textarea textarea-bordered w-full"
                placeholder="Observación"
                onChange={(e) =>
                  setCostoForm({ ...costoForm, observacion: e.target.value })
                }
              />
            </div>

            <div className="divider"></div>

            <div className="modal-action flex justify-between mt-4">
              <button
                className="btn btn-outline text-secondary"
                onClick={() => setModalCosto(false)}
              >
                Cancelar
              </button>

              <button
                className="btn btn-success"
                onClick={async () => {
                  await crearCosto(costoForm);
                  refetchCostos();
                  setModalCosto(false);
                }}
              >
                Guardar
              </button>
            </div>
          </div>
        </dialog>
      )}
      {/* FIN MODAL DE COSTOS*/}
      {/* MODAL CAJA*/}
      {modalCaja && (
        <dialog className="modal modal-open">
          <div className="modal-box max-w-md">
            {modoCaja === "apertura" ? (
              <>
                <div className="flex flex-col gap-2 mb-5">
                  <h3 className="font-bold text-lg">
                    Hola {usuario.apodo || "Usuario"}
                  </h3>
                  <div className="flex flex-col text-xs lg:text-sm">
                    <span>Estás por aperturar la caja.</span>
                    <span>- Ingresa el monto que se te indica.</span>
                    <span>- Toda compra del día debe de provenir de este monto inicial. Para que al finalizar el día todo cuadre.</span>
                  </div>
                </div>
                <div className="divider"></div>
                <input
                  type="number"
                  className="input input-bordered w-full mt-4"
                  placeholder="Monto apertura"
                  value={montoApertura}
                  onChange={(e) => setMontoApertura(Number(e.target.value))}
                />
              </>
            ) : (
              <>
                <div className="flex flex-col gap-2 mb-5">
                  <h3 className="font-bold text-lg">
                    Hola {usuario.apodo || "Usuario"}
                  </h3>
                  <div className="flex flex-col text-xs lg:text-sm">
                    <span>Estás por cerrar la caja. Verifica lo siguiente:</span>
                    <span>- La DIFERENCIA debe ser CERO.</span>
                    <span>- En caso no cuadre, consultar con su encargado y colocar en OBSERVACION que es lo que sucedió.</span>
                  </div>
                </div>
                <div className="divider"></div>
                <label>Dinero esperado</label>
                <input
                  className="input input-bordered w-full"
                  value={dineroEnCaja}
                  disabled
                />

                <label className="mt-2">Dinero real en caja</label>
                <input
                  type="number"
                  className="input input-bordered w-full"
                  value={dineroReal}
                  onChange={(e) => setDineroReal(Number(e.target.value))}
                />

                <label>Diferencia</label>
                <input
                  className="input input-bordered w-full"
                  value={(dineroEnCaja - dineroReal).toFixed(2)}
                  disabled
                />

                <textarea
                  className="textarea textarea-bordered w-full mt-2"
                  placeholder="Observación"
                  onChange={(e) => setObservacionCaja(e.target.value)}
                />
              </>
            )}

            <div className="modal-action flex justify-between">
              <button className="btn btn-outline btn-secondary" onClick={() => setModalCaja(false)}>
                Cerrar
              </button>

              <button
                className="btn btn-success"
                onClick={async () => {
                  if (modoCaja === "apertura") {
                    await crearCaja({ monto_apertura: montoApertura });
                  } else {
                    await cerrarCaja({
                      dinero_real: dineroReal,
                      dinero_esperado: dineroEnCaja,
                      observacion: observacionCaja,
                    });
                  }

                  setModalCaja(false);
                  refetchCaja(); // usa react query
                }}
              >
                Guardar
              </button>
            </div>
          </div>
        </dialog>
      )}

      {/* FIN MODAL CAJA*/}
    </div>
  );
}

export default VentasDiaPage;

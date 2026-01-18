// VentasDiaPage.jsx

import HeaderNav from "../components/header_nav.jsx";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react"; 
import { 
  getProductosVendidosDia, 
  getProductosPerdidaDia,
  getTiposVentaDia,
  getVentasMesasDia,
  getResumenPedidosDia,
  getCajaDia,
  getDetallePedidoVentasDia
} from "../api";


function VentasDiaPage() {
  
  const hoy = new Date(
  new Date().getTime() - new Date().getTimezoneOffset() * 60000
  )
    .toISOString()
    .split("T")[0];

  //console.log("FECHA QUE ENVÍO A LA API:", hoy);

  const { data: productosVendidos = [], isLoading } = useQuery({
  queryKey: ["productosVendidos", hoy],
  queryFn: () => getProductosVendidosDia(hoy)
  });

  const { 
    data: productosPerdida = [], 
    isLoading: loadingPerdida 
  } = useQuery({
    queryKey: ["productosPerdida", hoy],
    queryFn: () => getProductosPerdidaDia(hoy)
  });

  const { 
    data: tiposVenta = [], 
    isLoading: loadingTiposVenta 
  } = useQuery({
    queryKey: ["tiposVenta", hoy],
    queryFn: () => getTiposVentaDia(hoy)
  });

  const { 
    data: ventasMesas = [], 
    isLoading: loadingMesas 
  } = useQuery({
    queryKey: ["ventasMesas", hoy],
    queryFn: () => getVentasMesasDia(hoy)
  });

  const { 
    data: resumenPedidos = [], 
    isLoading: loadingResumen 
  } = useQuery({
    queryKey: ["resumenPedidos", hoy],
    queryFn: () => getResumenPedidosDia(hoy)
  });

  const { 
    data: caja = null, 
    isLoading: loadingCaja 
  } = useQuery({
    queryKey: ["cajaDia", hoy],
    queryFn: () => getCajaDia(hoy)
  });

  const APERTURA = 0;
  const GASTOS = 0;

  const efectivo = caja?.efectivo || 0;
  const yape = caja?.yape || 0;
  const plin = caja?.plin || 0;
  const agora = caja?.agora || 0;
  const transferencia = caja?.transferencia || 0;
  const totalIngresos = caja?.total_ingresos || 0;
  const perdidas = caja?.perdidas || 0;

  const sumaIngresos =
    efectivo + yape + plin + agora + transferencia;

  const sumaEgresos = GASTOS;

  const vuelto = sumaIngresos - totalIngresos;

  const dineroEnCaja =
    APERTURA + sumaIngresos - sumaEgresos - vuelto;
  
  // ----*-------Apagartado para el modal VER DETALLLE PEDIDO -----------*----
  const [modalAbierto, setModalAbierto] = useState(false);
  const [detallePedido, setDetallePedido] = useState(null);
  const [pedidoActual, setPedidoActual] = useState(null);

  const verPedido = async (pedido) => {
    const data = await getDetallePedidoVentasDia(pedido.id_pedido);

    setPedidoActual({
      id_pedido: pedido.id_pedido,
      mesa: pedido.mesa
    });

    setDetallePedido(data);
    setModalAbierto(true);
  };






  //pruebas log

  // console.log("Productos vendidos:", productosVendidos);
  // console.log("Productos perdida:", productosPerdida);
  // console.log("tipo de ventas:", tiposVenta);
  // console.log("ventas por mesa:", ventasMesas);
  // console.log("Resumen de pedidos:", resumenPedidos);

  
  return (
    <div className="flex flex-col justify-center items-center">
      <HeaderNav />
      {/* Cuerpo Principal */}
      <div className="flex flex-col m-3 w-[95vw] gap-5">
        {/* Encabezado de cierre */}
        <div className="bg-white rounded shadow p-3 w-full flex flex-col lg:flex-row justify-between gap-6 lg:gap-2">
          <span className="text-lg lg:text-xl">
            Cierre Turno: 16/01/2024 - (16:00 hrs - 23:00 hrs) - Responsable:
            Juan Perez
          </span>
          <div className="flex flex-row gap-2 justify-between">
            <button className="btn btn-md">Imprimir</button>
            <button className="btn btn-md">Gastos</button>
            <button className="btn btn-md">Encargado</button>
          </div>
        </div>
        {/* Cuerpo de cuadros */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Columna Izquierda */}
          <div className="flex flex-col gap-5">
            {/* Resumen Ingresos Totales Dia */}
            <div className="flex flex-col gap-5 p-5 bg-white rounded shadow py-5">
              <span className="text-3xl font-bold text-center">
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
                        <td colSpan={2} className="text-center">Cargando...</td>
                      </tr>
                    ) : (
                      <>
                        <tr className="font-bold">
                          <td>APERTURA</td>
                          <td>S/. {APERTURA.toFixed(2)}</td>
                        </tr>

                        <tr>
                          <td>EFECTIVO</td>
                          <td>S/. {efectivo.toFixed(2)}</td>
                        </tr>

                        <tr>
                          <td>YAPE</td>
                          <td>S/. {yape.toFixed(2)}</td>
                        </tr>

                        <tr>
                          <td>PLIN</td>
                          <td>S/. {plin.toFixed(2)}</td>
                        </tr>

                        <tr>
                          <td>AGORA</td>
                          <td>S/. {agora.toFixed(2)}</td>
                        </tr>

                        <tr>
                          <td>TRANSFERENCIA</td>
                          <td>S/. {transferencia.toFixed(2)}</td>
                        </tr>

                        <tr>
                          <td>GASTOS</td>
                          <td>S/. {GASTOS.toFixed(2)}</td>
                        </tr>

                        <tr>
                          <td>PERDIDAS</td>
                          <td>S/. {perdidas.toFixed(2)}</td>
                        </tr>

                        <tr className="font-bold">
                          <td>SUMA INGRESOS</td>
                          <td>S/. {sumaIngresos.toFixed(2)}</td>
                        </tr>

                        <tr className="font-bold">
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
            <div className="bg-white rounded shadow flex flex-col p-5">
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
                      tiposVenta.map(t => (
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
            <div className="bg-white rounded shadow flex flex-col p-5">
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
                      ventasMesas.map(m => (
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

            {/* Gastos */}
            <div className="bg-white rounded shadow flex flex-col p-5">
              <span className="pl-3 py-3 text-xl font-bold">Gastos</span>
              <div className="overflow-x-auto">
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th></th>
                      <th>Monto</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>AUN NO DISPONIBLE</td>
                      <td>PIPIPIPI OÑO</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          {/* Columna Derecho */}
          <div className="flex flex-col gap-5">
            {/* Productos vendidos */}
            <div className="bg-white rounded shadow flex flex-col p-5">
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
                      {productosVendidos.map(p => (
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
            <div className="bg-white rounded shadow flex flex-col p-5">
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
                      productosPerdida.map(p => (
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
        <div className="bg-white rounded shadow p-3 w-full flex flex-col gap-6 lg:gap-2 mb-10">
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
                  resumenPedidos.map(p => (
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
                          className="btn btn-sm"
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
                    <th>Precio Total</th>
                  </tr>
                </thead>
                <tbody>
                  {detallePedido.detalles.map((item, i) => (
                    <tr key={i}>
                      <td>{item.cantidad}</td>
                      <td>
                        {item.nombre}
                        {item.porcion && (
                          <span className="opacity-70">
                            {" "}({item.porcion} {item.unidad_medida})
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

            <div className="text-right font-bold text-lg">
              Total: S/ {detallePedido.total.toFixed(2)}
            </div>

            <div className="modal-action flex justify-between mt-4">

              <button
                className="btn"
                onClick={() => setModalAbierto(false)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </dialog>
      )}


    </div>
  );
}

export default VentasDiaPage;

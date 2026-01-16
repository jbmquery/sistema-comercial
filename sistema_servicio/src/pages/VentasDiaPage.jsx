// VentasDiaPage.jsx

import HeaderNav from "../components/header_nav.jsx";
import { useQuery } from "@tanstack/react-query";
import { 
  getProductosVendidosDia, 
  getProductosPerdidaDia,
  getTiposVentaDia,
  getVentasMesasDia,
  getResumenPedidosDia
} from "../api";


function VentasDiaPage() {
  
  const hoy = new Date().toISOString().split("T")[0];

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
                Total Ingresos: S/150
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
                    <tr className="font-bold">
                      <td>APERTURA</td>
                      <td>S/. 50.00</td>
                    </tr>
                    <tr>
                      <td>EFECTIVO</td>
                      <td>S/. 135.20</td>
                    </tr>
                    <tr>
                      <td>YAPE</td>
                      <td>S/. 52.10</td>
                    </tr>
                    <tr>
                      <td>PLIN</td>
                      <td>S/. 00.00</td>
                    </tr>
                    <tr>
                      <td>AGORA</td>
                      <td>S/. 00.00</td>
                    </tr>
                    <tr>
                      <td>TRANSFERENCIA</td>
                      <td>S/. 00.00</td>
                    </tr>
                    <tr>
                      <td>GASTOS</td>
                      <td>S/. 35.00</td>
                    </tr>
                    <tr>
                      <td>PERDIDAS</td>
                      <td>S/. 00.00</td>
                    </tr>
                    <tr className="font-bold">
                      <td>SUMA INGRESOS</td>
                      <td>S/. 00.00</td>
                    </tr>
                    <tr  className="font-bold">
                      <td>SUMA EGRESOS</td>
                      <td>S/. 00.00</td>
                    </tr>
                    <tr  className="font-bold">
                      <td>DINERO EN CAJA</td>
                      <td>S/. 00.00</td>
                    </tr>
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
                      <th>Cantidad pedidos</th>
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
                        <button className="btn btn-sm">Ver</button>
                      </td>
                    </tr>

                  ))
                )}
              </tbody>

            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VentasDiaPage;

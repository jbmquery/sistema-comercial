// PedidosPage.jsx

import { useState, useEffect } from 'react';
import HeaderNav from "../components/header_nav";

function PedidosPage() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        const res = await fetch('/api/pedidos/activos');
        const data = await res.json();
        setPedidos(data);
      } catch (error) {
        console.error("Error al cargar pedidos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPedidos();

    // Refresco cada 5 segundos (polling)
    const interval = setInterval(fetchPedidos, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div>Cargando pedidos...</div>;

  return (
    <div className="flex flex-col justify-center items-center">
      <HeaderNav />
      <div className="pt-10 w-full max-w-4xl px-4">
        {pedidos.length === 0 ? (
          <p className="text-center">No hay pedidos activos</p>
        ) : (
          pedidos.map((pedido) => (
            <div key={pedido.id_pedido} className="collapse bg-base-100 border-base-300 border mb-4">
              <input type="checkbox" />
              <div className="collapse-title font-semibold flex flex-row justify-left md:justify-between items-center gap-3 !pr-4 pr-12">
                <div className="flex flex-row justify-center items-center gap-5">
                  <span>{pedido.nombre_mesa}</span>
                  <button className="btn btn-xs">
                    <svg
                      width="16"
                      height="16"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg">
                      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                      <path d="M12 8v8" />
                      <path d="M8 12h8" />
                    </svg>
                    <span className="hidden md:inline">Agregar</span>
                  </button>
                </div>
                <div className="flex flex-row justify-center items-center gap-5">
                  <button className="btn btn-xs">
                    <svg
                      width="16"
                      height="16"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 6h18" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                    <span className="hidden md:inline">Eliminar</span>
                  </button>
                  <button className={`btn btn-xs ${pedido.estado_pedido === 'Listo' ? 'btn-success' : pedido.estado_pedido === 'Proceso' ? 'btn-warning' : 'btn-outline'}`}>
                    {pedido.estado_pedido}
                  </button>
                </div>
              </div>

              <div className="collapse-content p-0">
                <div className="overflow-x-auto touch-pan-x">
                  <table className="table table-compact w-full min-w-[640px]">
                    <thead>
                      <tr className="text-center bg-base-200">
                        <th>Cant.</th>
                        <th>Nombre Producto</th>
                        <th>Estado</th>
                        <th>Precio Unit.</th>
                        <th>Observación</th>
                        <th>Settings</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pedido.productos.map((prod) => (
                        <tr key={prod.id_detalle} className="bg-base-100">
                          <td className="text-center">{prod.cantidad}</td>
                          <td>{prod.nombre_producto}</td>
                          <td className="flex justify-center">
                            <button className={`btn btn-xs btn-active ${prod.estado_detalle === 'Listo' ? 'btn-success' : ''}`}>
                              {prod.estado_detalle}
                            </button>
                          </td>
                          <td className="text-center">{prod.precio_unitario}</td>
                          <td>{prod.observacion || ''}</td>
                          <td className="flex justify-center gap-2">
                            <button className="btn btn-square btn-xs">
                              <svg
                                width="16"
                                height="16"
                                fill="none"
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                              </svg>
                            </button>
                            <button className="btn btn-square btn-xs">
                              <svg
                                width="16"
                                height="16"
                                fill="none"
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg">
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
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default PedidosPage;
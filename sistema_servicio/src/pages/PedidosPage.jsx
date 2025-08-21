// PedidosPage.jsx

import { useState, useEffect } from 'react';
import HeaderNav from "../components/header_nav";

function PedidosPage() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estado para el modal de "Agregar producto"
  const [showModal, setShowModal] = useState(false);
  const [selectedPedido, setSelectedPedido] = useState(null);
  const [formData, setFormData] = useState({
    id_carta: '',
    cantidad: 1,
    observacion: '',
    estado: 'Pendiente'
  });
  const [productos, setProductos] = useState([]); // Lista de productos del menú
  const [loadingProductos, setLoadingProductos] = useState(true); // Opcional: indicador de carga

  // Cargar pedidos activos
  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        const res = await fetch('/api/pedidos/activos');
        const data = await res.json();
        setPedidos(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error al cargar pedidos:", error);
        setPedidos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPedidos();

    // Refresco cada 5 segundos
    const interval = setInterval(fetchPedidos, 5000);
    return () => clearInterval(interval);
  }, []);

  // Cargar productos del menú (para el dropdown)
  useEffect(() => {
    const fetchProductos = async () => {
      setLoadingProductos(true);
      try {
        const res = await fetch('/api/carta?categoria=Bebidas');
        const data = await res.json();
        const productos = Array.isArray(data.productos) ? data.productos : [];
        setProductos(productos);
      } catch (error) {
        console.error("Error al cargar productos:", error);
        setProductos([]);
      } finally {
        setLoadingProductos(false);
      }
    };

    fetchProductos();
  }, []);

  // Abrir modal y asociar al pedido
  const handleOpenModal = (pedido) => {
    setSelectedPedido(pedido);
    setFormData({
      id_carta: '',
      cantidad: 1,
      observacion: '',
      estado: 'Pendiente'
    });
    setShowModal(true);
  };

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Enviar nuevo producto al backend
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedPedido) {
      alert("No hay pedido seleccionado");
      return;
    }
    if (!formData.id_carta) {
      alert("Selecciona un producto");
      return;
    }

    const nuevoDetalle = {
      id_pedido: selectedPedido.id_pedido,
      id_carta: parseInt(formData.id_carta),
      cantidad: parseInt(formData.cantidad),
      observacion: formData.observacion || '',
      estado: formData.estado
    };

    try {
      const response = await fetch('/api/detalle_pedido', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoDetalle)
      });

      const result = await response.json();

      if (response.ok) {
        alert("✅ Producto agregado al pedido");
        setShowModal(false);

        // Refrescar pedidos
        const res = await fetch('/api/pedidos/activos');
        const data = await res.json();
        setPedidos(Array.isArray(data) ? data : []);
      } else {
        alert("Error: " + result.message);
      }
    } catch (error) {
      console.error("Error al agregar producto:", error);
      alert("Error de conexión con el servidor");
    }
  };

  return (
    <div className="flex flex-col justify-center items-center">
      <HeaderNav />
      
      <div className="pt-10 w-full max-w-4xl px-4">
        {loading ? (
          <p>Cargando pedidos...</p>
        ) : pedidos.length === 0 ? (
          <p className="text-center">No hay pedidos activos</p>
        ) : (
          pedidos.map((pedido) => (
            <div key={pedido.id_pedido} className="collapse bg-base-100 border-base-300 border mb-4">
              <input type="checkbox" />
              <div className="collapse-title font-semibold flex flex-row justify-left md:justify-between items-center gap-3 !pr-4 pr-12">
                <div className="flex flex-row justify-center items-center gap-5">
                  <span>{pedido.nombre_mesa}</span>
                  <button 
                    className="btn btn-xs" 
                    onClick={(e) => {
                      e.stopPropagation(); // ✅ Evita que se despliegue el acordeón
                      handleOpenModal(pedido);
                    }}
                  >
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
                      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                      <path d="M12 8v8" />
                      <path d="M8 12h8" />
                    </svg>
                    <span className="hidden md:inline">Agregar</span>
                  </button>
                </div>
                <div className="flex flex-row justify-center items-center gap-5">
                  <button
                    className="btn btn-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      // handleEliminarPedido(pedido);
                    }}
                    >
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
                      <path d="M3 6h18" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                    <span className="hidden md:inline">Eliminar</span>
                  </button>
                  <button className={`btn btn-xs ${
                    pedido.estado_pedido === 'Listo' 
                      ? 'btn-success' 
                      : pedido.estado_pedido === 'Proceso' 
                        ? 'btn-warning' 
                        : 'btn-outline'
                  }`}>
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
                        <th>Configuraciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pedido.productos.map((prod) => (
                        <tr key={prod.id_detalle} className="bg-base-100">
                          <td className="text-center">{prod.cantidad}</td>
                          <td>{prod.nombre_producto}</td>
                          <td className="flex justify-center">
                            <button className={`btn btn-xs btn-active ${
                              prod.estado_detalle === 'Listo' ? 'btn-success' : ''
                            }`}>
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
                                xmlns="http://www.w3.org/2000/svg"
                              >
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
            </div>
          ))
        )}
      </div>

      {/* Modal: Agregar producto */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">
              Agregar a {selectedPedido?.nombre_mesa}
            </h3>

            {loadingProductos ? (
              <p>Cargando productos...</p>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Producto</label>
                  <select
                    name="id_carta"
                    value={formData.id_carta}
                    onChange={handleChange}
                    className="select select-bordered w-full"
                    required
                  >
                    <option value="">Seleccionar producto</option>
                    {productos.length === 0 ? (
                      <option disabled>No hay productos disponibles</option>
                    ) : (
                      productos.map((prod) => (
                        <option key={prod.id_carta} value={prod.id_carta}>
                          {prod.nombre} {prod.porcion && prod.unidad_medida 
                            ? `(${prod.porcion} ${prod.unidad_medida})` 
                            : ""}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Cantidad</label>
                  <input
                    type="number"
                    name="cantidad"
                    value={formData.cantidad}
                    onChange={handleChange}
                    min="1"
                    className="input input-bordered w-full"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Observación</label>
                  <input
                    type="text"
                    name="observacion"
                    value={formData.observacion}
                    onChange={handleChange}
                    placeholder="Ej: sin azúcar, extra hielo"
                    className="input input-bordered w-full"
                  />
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setShowModal(false)}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                  >
                    Guardar
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default PedidosPage;
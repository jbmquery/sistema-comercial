// PedidosPage.jsx

import { useState, useEffect } from 'react';
import HeaderNav from "../components/header_nav";

function PedidosPage() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estado para controlar qué pedidos están expandidos
  const [expanded, setExpanded] = useState({});

  // Estado para el modal de "Agregar producto"
  const [showModal, setShowModal] = useState(false);
  const [selectedPedido, setSelectedPedido] = useState(null);
  const [formData, setFormData] = useState({
    id_carta: '',
    cantidad: 1,
    observacion: '',
    estado: 'Pendiente'
  });

  // Estado para productos y filtros
  const [productos, setProductos] = useState([]);
  const [loadingProductos, setLoadingProductos] = useState(true);
  const [categorias, setCategorias] = useState([]);
  const [subcategorias, setSubcategorias] = useState([]);
  const [selectedCategoria, setSelectedCategoria] = useState('');
  const [selectedSubcategoria, setSelectedSubcategoria] = useState('');

  // Estado para el modal de editar observación
  const [showObservacionModal, setShowObservacionModal] = useState(false);
  const [selectedDetalle, setSelectedDetalle] = useState(null);
  const [nuevaObservacion, setNuevaObservacion] = useState('');

  // Cargar pedidos activos
  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        const res = await fetch('/api/pedidos/activos');
        const data = await res.json();
        const pedidosArray = Array.isArray(data) ? data : [];

        // Conservar estado de expansión
        setPedidos(pedidosArray);
        setExpanded(prev => {
          const newExpanded = { ...prev };
          pedidosArray.forEach(p => {
            if (!(p.id_pedido in newExpanded)) {
              newExpanded[p.id_pedido] = true; // nuevos: abiertos
            }
          });
          return newExpanded;
        });
      } catch (error) {
        console.error("Error al cargar pedidos:", error);
      } finally {
        setLoading(false);
      }
    };

    // Carga inicial
    fetchPedidos();

    // Polling cada 5 segundos
    const interval = setInterval(fetchPedidos, 5000);
    return () => clearInterval(interval);
  }, []); // ✅ Solo al montar



  
  // Cargar categorías al montar
  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const res = await fetch('/api/categorias');
        const data = await res.json();
        setCategorias(data.categorias || []);
      } catch (error) {
        console.error("Error al cargar categorías:", error);
        setCategorias([]);
      }
    };
    fetchCategorias();
  }, []);



  // Cargar subcategorías cuando cambie la categoría
  useEffect(() => {
    if (!selectedCategoria) {
      setSubcategorias([]);
      setSelectedSubcategoria('');
      return;
    }
    const fetchSubcategorias = async () => {
      try {
        const res = await fetch(`/api/subcategorias?categoria=${selectedCategoria}`);
        const data = await res.json();
        setSubcategorias(data.subcategorias || []);
        setSelectedSubcategoria(''); // Resetear subcategoría
      } catch (error) {
        console.error("Error al cargar subcategorías:", error);
        setSubcategorias([]);
        setSelectedSubcategoria('');
      }
    };
    fetchSubcategorias();
  }, [selectedCategoria]);

  // Cargar productos cuando cambie categoría o subcategoría
  useEffect(() => {
    if (!selectedCategoria) return;

    const fetchProductos = async () => {
      setLoadingProductos(true);
      try {
        let url = `/api/carta?categoria=${selectedCategoria}`;
        if (selectedSubcategoria) {
          url += `&sub_categoria=${selectedSubcategoria}`;
        }

        const res = await fetch(url);
        const data = await res.json();

        // Extraer todos los productos de por_subcategoria
        const productosArray = [];
        const porSubcategoria = data.por_subcategoria || {};

        Object.keys(porSubcategoria).forEach(subcat => {
          productosArray.push(...porSubcategoria[subcat]);
        });

        setProductos(productosArray);
      } catch (error) {
        console.error("Error al cargar productos:", error);
        setProductos([]);
      } finally {
        setLoadingProductos(false);
      }
    };

    fetchProductos();
  }, [selectedCategoria, selectedSubcategoria]);

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
    // Resetear filtros al abrir
    setSelectedCategoria('');
    setSelectedSubcategoria('');
    setProductos([]);
    setLoadingProductos(true);
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
        const pedidosArray = Array.isArray(data) ? data : [];

        // Conservar estado de expansión
        const newExpanded = { ...expanded };
        pedidosArray.forEach(p => {
          if (!(p.id_pedido in newExpanded)) {
            newExpanded[p.id_pedido] = true;
          }
        });

        setPedidos(pedidosArray);
        setExpanded(newExpanded);
      } else {
        alert("Error: " + result.message);
      }
    } catch (error) {
      console.error("Error al agregar producto:", error);
      alert("Error de conexión con el servidor");
    }
  };

  // Eliminar pedido (placeholder)
  const handleEliminarPedido = async (pedido) => {
    const confirmado = window.confirm(
      `¿Estás seguro de cancelar el pedido de ${pedido.nombre_mesa}?\n\nEsta acción no se puede deshacer.`
    );
    if (!confirmado) return;

    try {
      const response = await fetch('/api/pedidos/cancelar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_pedido: pedido.id_pedido })
      });

      const result = await response.json();

      if (response.ok) {
        alert("✅ Pedido cancelado");
        // Refrescar pedidos
        const res = await fetch('/api/pedidos/activos');
        const data = await res.json();
        const pedidosArray = Array.isArray(data) ? data : [];

        setPedidos(pedidosArray);

        // Conservar estado de expansión
        setExpanded(prev => {
          const newExpanded = { ...prev };
          pedidosArray.forEach(p => {
            if (!(p.id_pedido in newExpanded)) {
              newExpanded[p.id_pedido] = true;
            }
          });
          return newExpanded;
        });
      } else {
        alert("Error: " + result.message);
      }
    } catch (error) {
      console.error("Error al cancelar pedido:", error);
      alert("Error de conexión con el servidor");
    }
  };

  // Actualizar os estados de detalle_pedido en la tabla cuando se modifiquen

  const cambiarEstadoProducto = async (e, pedido, producto) => {
    e.stopPropagation(); // ✅ Ahora `e` está definido

    try {
      const response = await fetch('/api/detalle_pedido/actualizar', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_detalle: producto.id_detalle,
          estado: 'Listo'
        })
      });

      const result = await response.json();

      if (response.ok) {
        // Refrescar pedidos
        const res = await fetch('/api/pedidos/activos');
        const data = await res.json();
        const pedidosArray = Array.isArray(data) ? data : [];

        setPedidos(pedidosArray);

        // Conservar estado de expansión
        setExpanded(prev => {
          const newExpanded = { ...prev };
          pedidosArray.forEach(p => {
            if (!(p.id_pedido in newExpanded)) {
              newExpanded[p.id_pedido] = true;
            }
          });
          return newExpanded;
        });

        alert("✅ Estado actualizado");
      } else {
        alert("Error: " + result.message);
      }
    } catch (error) {
      console.error("Error al actualizar estado:", error);
      alert("Error de conexión");
    }
  };

  // Funcion para abrir el modal de editar detalle_pedido (observacion)
  const abrirModalObservacion = (e, detalle, observacion) => {
    e.stopPropagation();
    setSelectedDetalle(detalle);
    setNuevaObservacion(observacion || '');
    setShowObservacionModal(true);
  };

  // Funcion para guardar la nueva observacion
  const guardarObservacion = async () => {
    if (!selectedDetalle) return;

    try {
      const response = await fetch('/api/detalle_pedido/observacion', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_detalle: selectedDetalle.id_detalle,
          observacion: nuevaObservacion
        })
      });

      const result = await response.json();

      if (response.ok) {
        // Refrescar pedidos
        const res = await fetch('/api/pedidos/activos');
        const data = await res.json();
        const pedidosArray = Array.isArray(data) ? data : [];

        setPedidos(pedidosArray);

        // Conservar estado de expansión
        setExpanded(prev => {
          const newExpanded = { ...prev };
          pedidosArray.forEach(p => {
            if (!(p.id_pedido in newExpanded)) {
              newExpanded[p.id_pedido] = true;
            }
          });
          return newExpanded;
        });

        // Cerrar modal
        setShowObservacionModal(false);
        setSelectedDetalle(null);
        setNuevaObservacion('');
      } else {
        alert("Error: " + result.message);
      }
    } catch (error) {
      console.error("Error al guardar observación:", error);
      alert("Error de conexión");
    }
  };

// Eliminar Prodcuto de detalle_pedido
  const eliminarProducto = async (e, pedido, producto) => {
    e.stopPropagation();

    // No permitir eliminar si el producto está 'Listo'
    if (producto.estado_detalle === 'Listo') {
      alert("❌ No se puede eliminar un producto ya listo.");
      return;
    }

    const confirmado = window.confirm(
      `¿Estás seguro de eliminar "${producto.nombre_producto}" del pedido de ${pedido.nombre_mesa}?`
    );
    if (!confirmado) return;

    try {
      const response = await fetch('/api/detalle_pedido/eliminar', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_detalle: producto.id_detalle })
      });

      const result = await response.json();

      if (response.ok) {
        alert("✅ Producto eliminado");

        // Refrescar pedidos
        const res = await fetch('/api/pedidos/activos');
        const data = await res.json();
        const pedidosArray = Array.isArray(data) ? data : [];

        setPedidos(pedidosArray);

        // Conservar estado de expansión
        setExpanded(prev => {
          const newExpanded = { ...prev };
          pedidosArray.forEach(p => {
            if (!(p.id_pedido in newExpanded)) {
              newExpanded[p.id_pedido] = true;
            }
          });
          return newExpanded;
        });
      } else {
        alert("Error: " + result.message);
      }
    } catch (error) {
      console.error("Error al eliminar producto:", error);
      alert("Error de conexión");
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
            <div 
              key={pedido.id_pedido} 
              className="bg-base-100 border border-base-300 rounded-lg mb-4 overflow-hidden"
            >
              {/* Título del pedido */}
              <div
                className="font-semibold flex flex-row justify-left md:justify-between items-center gap-3 !pr-4 pr-12 px-4 py-3 bg-base-100 cursor-pointer"
                onClick={() => {
                  setExpanded(prev => ({
                    ...prev,
                    [pedido.id_pedido]: !prev[pedido.id_pedido]
                  }));
                }}
              >
                <div className="flex flex-row justify-center items-center gap-5">
                  <span>{pedido.nombre_mesa}</span>
                  <button 
                    className="btn btn-xs" 
                    onClick={(e) => {
                      e.stopPropagation(); // Evita que se togglee el acordeón
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
                      handleEliminarPedido(pedido);
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

              {/* Contenido expandido */}
              {expanded[pedido.id_pedido] && (
                <div className="p-0">
                  <div className="overflow-x-auto touch-pan-x">
                    {pedido.productos && pedido.productos.length > 0 ? (
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
                                <button 
                                  className={`btn btn-xs btn-active ${
                                    prod.estado_detalle === 'Listo' ? 'btn-success' : ''
                                  }`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (prod.estado_detalle !== 'Listo') {
                                      cambiarEstadoProducto(e, pedido, prod); // ✅ Pasa `e`
                                    }
                                  }}
                                >
                                  {prod.estado_detalle}
                                </button>
                              </td>
                              <td className="text-center">{prod.precio_unitario}</td>
                              <td>{prod.observacion?.trim() || ''}</td>
                              <td className="flex justify-center gap-2">
                                <button
                                  className="btn btn-square btn-xs"
                                  onClick={(e) => abrirModalObservacion(e, prod, prod.observacion)}
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
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                  </svg>
                                </button>
                                <button
                                  className="btn btn-square btn-xs"
                                  onClick={(e) => eliminarProducto(e, pedido, prod)}
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
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <p className="p-4 text-center text-gray-500">No hay productos en este pedido</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Modal: Agregar producto */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 min-h-[540px] md:min-h-[550px]">
            <h3 className="text-lg font-semibold mb-4">
              Agregar a {selectedPedido?.nombre_mesa}
            </h3>

            {/* Filtros */}
            <div className="space-y-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Categoría</label>
                <select
                  value={selectedCategoria}
                  onChange={(e) => setSelectedCategoria(e.target.value)}
                  className="select select-bordered w-full"
                  required
                >
                  <option value="">Seleccionar categoría</option>
                  {categorias.map(cat => (
                    <option key={cat.id_categoria} value={cat.id_categoria}>
                      {cat.nombre_cat}
                    </option>
                  ))}
                </select>
              </div>

              {selectedCategoria && subcategorias.length > 0 && (
                <div>
                  <label className="block text-sm font-medium mb-1">Subcategoría</label>
                  <select
                    value={selectedSubcategoria}
                    onChange={(e) => setSelectedSubcategoria(e.target.value)}
                    className="select select-bordered w-full"
                  >
                    <option value="">Todas</option>
                    {subcategorias.map(sub => (
                      <option key={sub.id_subcat} value={sub.id_subcat}>
                        {sub.nombre_subcat}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

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

      {/* Modal: Editar Observación */}
      {showObservacionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">
              Editar observación - {selectedDetalle?.nombre_producto}
            </h3>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Observación</label>
              <input
                type="text"
                value={nuevaObservacion}
                onChange={(e) => setNuevaObservacion(e.target.value)}
                placeholder="Ej: sin azúcar, extra hielo"
                className="input input-bordered w-full"
                autoFocus
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => {
                  setShowObservacionModal(false);
                  setSelectedDetalle(null);
                  setNuevaObservacion('');
                }}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={guardarObservacion}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default PedidosPage;
// PagosPage.jsx
import { useState, useEffect } from 'react';
import HeaderNav from "../components/header_nav";
import ModalBuscarCliente from '../components/ModalBuscarCliente';
import { API_BASE } from '../config';

function PagosPage() {
  const [pedidos, setPedidos] = useState([]);
  const [detalle, setDetalle] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [selectedPedido, setSelectedPedido] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [canBuscarCliente, setCanBuscarCliente] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);

  // Cargar pedidos entregados
  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/pedidos/entregados`, {
          headers: { 'ngrok-skip-browser-warning': 'true' }
        });
        const data = await res.json();
        setPedidos(data.pedidos || []);
      } catch (error) {
        console.error("Error al cargar pedidos:", error);
      }
    };
    fetchPedidos();
  }, []);

  // Cargar detalle del pedido seleccionado
  const handleSelectPedido = async (pedido) => {
    setSelectedPedido(pedido);
    try {
      const res = await fetch(`${API_BASE}/api/pedidos/${pedido.id_pedido}/detalle`, {
        headers: { 'ngrok-skip-browser-warning': 'true' }
      });
      const data = await res.json();
      const detalle = data.detalle || [];

      setDetalle(detalle);

      // Calcular subtotal
      const total = detalle.reduce((sum, item) => sum + (item.precio_unitario * item.cantidad), 0);
      setSubtotal(total);
    } catch (error) {
      console.error("Error al cargar detalle:", error);
      setDetalle([]);
      setSubtotal(0);
    }
  };

  const handleSelectCliente = (cliente) => {
    setClienteSeleccionado(cliente);
    setShowModal(false);
  };

  const handleClearCliente = () => {
    setClienteSeleccionado(null);
  };

  // Limpiar cliente si se desmarca el checkbox
  useEffect(() => {
    if (!canBuscarCliente) {
      setClienteSeleccionado(null);
    }
  }, [canBuscarCliente]);

  return (
    <div className="flex flex-col justify-center items-center">
      <HeaderNav />

      <div className='flex flex-col md:flex-row w-full max-w-7xl px-4 gap-4 mt-6'>
        
        {/* IZQUIERDA - Lista de pedidos */}
        <div className='bg-secondary-content p-4 rounded-lg md:w-80 flex-shrink-0'>
          <h3 className="font-bold mb-4">Pedidos Entregados</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {pedidos.length === 0 ? (
              <p className="text-gray-500">No hay pedidos entregados</p>
            ) : (
              pedidos.map((pedido) => (
                <div
                  key={pedido.id_pedido}
                  onClick={() => handleSelectPedido(pedido)}
                  className={`p-2 rounded shadow cursor-pointer ${
                    selectedPedido?.id_pedido === pedido.id_pedido ? 'bg-blue-100' : 'bg-white'
                  }`}
                >
                  <p><strong>Pedido #{pedido.numero_orden}</strong></p>
                  <p>Mesa: {pedido.nombre_mesa}</p>
                  {/* ❌ Hora eliminada */}
                </div>
              ))
            )}
          </div>
        </div>

        {/* DERECHA - Detalle del pedido */}
        <div className='bg-blue-200 p-6 rounded-lg flex-grow'>
          <h2 className="font-bold mb-6">Detalle del Pedido</h2>

          <div className='flex flex-col md:flex-row gap-6'>
            
            {/* TABLA PRODUCTOS */}
            <div className="flex-grow">
              {selectedPedido ? (
                <>
                  <div className="overflow-x-auto">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Cant.</th>
                          <th>Descripción</th>
                          <th>Importe</th>
                          <th>Acción</th>
                        </tr>
                      </thead>
                      <tbody>
                        {detalle.map((item) => (
                          <tr key={item.id_detalle}>
                            <th>{item.cantidad}</th>
                            <td>{item.nombre_producto}</td>
                            <td>S/ {(item.precio_unitario * item.cantidad).toFixed(2)}</td>
                            <td>
                              {item.cantidad > 1 && (
                                <button
                                    className="btn btn-warning btn-xs"
                                    onClick={async () => {
                                        if (!selectedPedido) return;

                                        const confirmado = window.confirm(
                                        `¿Dividir ${item.nombre_producto}?`
                                        );
                                        if (!confirmado) return;

                                        try {
                                        const response = await fetch(`${API_BASE}/api/detalle_pedido/dividir`, {
                                            method: 'POST',
                                            headers: {
                                            'Content-Type': 'application/json',
                                            'ngrok-skip-browser-warning': 'true'
                                            },
                                            body: JSON.stringify({ id_detalle: item.id_detalle })
                                        });

                                        const result = await response.json();

                                        if (response.ok) {
                                            // Refrescar el detalle del pedido
                                            const res = await fetch(`${API_BASE}/api/pedidos/${selectedPedido.id_pedido}/detalle`, {
                                            headers: { 'ngrok-skip-browser-warning': 'true' }
                                            });
                                            const data = await res.json();
                                            setDetalle(data.detalle || []);
                                            // Recalcular subtotal
                                            const total = data.detalle.reduce((sum, i) => sum + (i.precio_unitario * i.cantidad), 0);
                                            setSubtotal(total);
                                        } else {
                                            alert("Error: " + result.message);
                                        }
                                        } catch (error) {
                                        console.error("Error al dividir producto:", error);
                                        alert("Error de conexión");
                                        }
                                    }}
                                    >
                                    dividir
                                    </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className='divider divider-start'>Sub-total</div>
                  <div className='text-right font-bold text-lg'>S/ {subtotal.toFixed(2)}</div>
                </>
              ) : (
                <p className="text-gray-500">Selecciona un pedido para ver su detalle</p>
              )}
            </div>

            {/* Buscar cliente */}
            <div className="md:w-80 flex-shrink-0">
              <div className="form-control mb-6">
                <label className="label cursor-pointer">
                  <span className="label-text font-medium">¿Cliente registrado?</span>
                  <input
                    type="checkbox"
                    checked={canBuscarCliente}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setCanBuscarCliente(checked);
                      if (!checked) {
                        setClienteSeleccionado(null); // ✅ Limpiar cliente
                      }
                    }}
                    className="checkbox checkbox-primary"
                  />
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="DNI del cliente"
                    className="input input-bordered w-full"
                    value={clienteSeleccionado?.dni || ''}
                    readOnly
                  />
                  <button
                    onClick={() => canBuscarCliente && setShowModal(true)}
                    disabled={!canBuscarCliente}
                    className="btn btn-primary"
                  >
                    <svg width={16} height={16} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="m21 21-6-6m2-5a7.001 7.001 0 0 1-11.95 4.95A7 7 0 1 1 17 10Z" />
                    </svg>
                    <span className="hidden md:inline">Buscar</span>
                  </button>
                  {clienteSeleccionado && (
                    <button
                      onClick={handleClearCliente}
                      className="btn btn-secondary"
                    >
                      <svg width={16} height={16} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 11v6m4-6v6M4 7h16m-1 0-.867 12.142A2 2 0 0 1 16.138 21H7.862a2 2 0 0 1-1.995-1.858L5 7h14Zm-4 0V4a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v3h6Z" />
                      </svg>
                      <span className="hidden md:inline">Limpiar</span>
                    </button>
                  )}
                </div>
              </div>

              {clienteSeleccionado && (
                <div className="bg-white p-4 rounded-lg shadow mb-6">
                  <h4 className="font-semibold">Cliente Seleccionado</h4>
                  <p><strong>ID:</strong> {clienteSeleccionado.id_cliente}</p>
                  <p><strong>Nombre:</strong> {clienteSeleccionado.nombre_completo}</p>
                  <p><strong>DNI:</strong> {clienteSeleccionado.dni}</p>
                  <p><strong>Puntos:</strong> {clienteSeleccionado.puntos_acumulados}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ModalBuscarCliente
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSelectCliente={handleSelectCliente}
      />
    </div>
  );
}

export default PagosPage;
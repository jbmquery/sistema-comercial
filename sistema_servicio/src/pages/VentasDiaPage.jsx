// VentasDiaPage.jsx
import { useState, useEffect } from 'react';
import HeaderNav from '../components/header_nav.jsx';
import { API_BASE } from '../config';

function VentasDiaPage() {
  const [ventas, setVentas] = useState({
    pedidos: [],
    resumen_pagos: {
      efectivo: 0,
      yape: 0,
      plin: 0,
      transferencia: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVentas = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE}/api/ventas/dia`, {
          headers: {
            'ngrok-skip-browser-warning': 'true'
          }
        });
        
        if (!response.ok) {
          throw new Error('Error al cargar las ventas del día');
        }
        
        const data = await response.json();
        setVentas(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVentas();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <HeaderNav />
        <div className="text-center p-4">
          <span className="loading loading-spinner loading-lg"></span>
          <p className="mt-2">Cargando ventas del día...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center">
        <HeaderNav />
        <div className="alert alert-error shadow-lg max-w-md mx-auto mt-6">
          <div>
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-7V4a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-5m-10-3h4m-4 6h10" />
            </svg>
            <span>Error: {error}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center items-center">
      <HeaderNav />
      
      <div className='p-4 md:p-6 lg:p-8 max-w-5xl w-full'>
        <h1 className="text-2xl font-bold mb-6 text-center">Ventas del Día</h1>
        
        {/* Resumen de pagos */}
        <div className="bg-base-200 rounded-box p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-sm text-gray-500">Efectivo</p>
              <p className="text-xl font-bold text-green-700">S/ {ventas.resumen_pagos.efectivo.toFixed(2)}</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-gray-500">Yape</p>
              <p className="text-xl font-bold text-blue-700">S/ {ventas.resumen_pagos.yape.toFixed(2)}</p>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <p className="text-sm text-gray-500">Plin</p>
              <p className="text-xl font-bold text-purple-700">S/ {ventas.resumen_pagos.plin.toFixed(2)}</p>
            </div>
            <div className="bg-orange-50 p-3 rounded-lg">
              <p className="text-sm text-gray-500">Transferencia</p>
              <p className="text-xl font-bold text-orange-700">S/ {ventas.resumen_pagos.transferencia.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Lista de pedidos */}
        {ventas.pedidos.length === 0 ? (
          <div className="alert alert-info shadow-lg max-w-md mx-auto">
            <div>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-info shrink-0 w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span>No hay ventas registradas para hoy.</span>
            </div>
          </div>
        ) : (
          ventas.pedidos.map((pedido) => (
            <div key={pedido.id_pedido} className="mb-6 border border-base-300 rounded-box overflow-hidden">
              <div className="bg-base-100 p-4 flex justify-between items-center">
                <div className="flex flex-col md:flex-row md:items-center gap-2">
                  <span className="font-bold">Pedido: {pedido.numero_orden}</span>
                  <span>Mesa: {pedido.nombre_mesa}</span>
                  <span>Pago: {pedido.forma_pago}</span>
                  <span>Total: S/ {pedido.total.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="overflow-x-auto rounded-box border border-base-content/5 bg-base-100">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Id_detalle</th>
                      <th>Nombre</th>
                      <th>Cantidad</th>
                      <th>Canjeado</th>
                      <th>Precio Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pedido.detalle.map((item) => (
                      <tr key={item.id_detalle}>
                        <th>{item.id_detalle}</th>
                        <td>{item.nombre}</td>
                        <td>{item.cantidad}</td>
                        <td>{item.canjeado ? 'Sí' : 'No'}</td>
                        <td>S/ {item.precio_total.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default VentasDiaPage;
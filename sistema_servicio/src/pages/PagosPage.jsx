// PagosPage.jsx
import { useState } from 'react';
import HeaderNav from "../components/header_nav";
import ModalBuscarCliente from '../components/ModalBuscarCliente';

function PagosPage() {
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleSelectCliente = (cliente) => {
    setClienteSeleccionado(cliente);
    setShowModal(false);
  };

  const handleClearCliente = () => {
    setClienteSeleccionado(null);
  };

  return (
    <div className="flex flex-col justify-center items-center">
      <HeaderNav />
      
      <div className='flex flex-col md:flex-row w-full max-w-7xl px-4 gap-4 mt-6'>
        
        {/* IZQUIERDA - Lista de pedidos */}
        <div className='bg-secondary-content p-4 rounded-lg md:w-80 flex-shrink-0'>
          <h3 className="font-bold mb-4">Pedidos Pendientes</h3>
          {/* Aquí irá la lista de pedidos */}
          <div className="space-y-2">
            <div className="bg-white p-2 rounded shadow">Pedido #43 - Mesa 1</div>
            <div className="bg-white p-2 rounded shadow">Pedido #44 - Mesa 3</div>
          </div>
        </div>

        {/* DERECHA - Detalle del pedido */}
        <div className='bg-blue-200 p-6 rounded-lg flex-grow'>
          <h2 className="font-bold mb-6">Detalle del Pedido</h2>
            {/* DIVISION DENTRO DE DETALLE PEDIDO*/}
            <div className='flex flex-col md:flex-row gap-6'>
                {/* TABLA PRODUCTOS*/}
                <div>
                {/* Aquí irá el resumen del pedido y formulario de pago */}
                    <div className="overflow-x-auto">
                        <table className="table">
                            {/* head */}
                            <thead>
                            <tr>
                                <th>#</th>
                                <th>Descripcion</th>
                                <th>Importe</th>
                                <th>Acción</th>
                            </tr>
                            </thead>
                            <tbody>
                            {/* row 1 */}
                            <tr>
                                <th>1</th>
                                <td>Americano Frio</td>
                                <td>5.50</td>
                                <td></td>
                            </tr>
                            {/* row 2 */}
                            <tr>
                                <th>3</th>
                                <td>waffle de Durazno</td>
                                <td>11.00</td>
                                <td><button className='btn btn-warning btn-xs'>dividir</button></td>
                            </tr>
                            </tbody>
                        </table>
                        </div>
                        <div className='divider divider-start'>Sub-total</div>
                        <div className='text-right font-bold text-lg'>16.50</div>
                </div>
            <div>
                {/* Buscar cliente */}
            <div className="form-control mb-6">
                <label className="label">
                <span className="label-text font-medium">Cliente</span>
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
                    onClick={() => setShowModal(true)}
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

            {/* Información del cliente seleccionado */}
            {clienteSeleccionado && (
                <div className="bg-white p-4 rounded-lg shadow mb-6">
                <h4 className="font-semibold">Cliente Seleccionado</h4>
                <p><strong>ID:</strong> {clienteSeleccionado.id_cliente}</p>
                <p><strong>Nombre:</strong> {clienteSeleccionado.nombre_completo}</p>
                <p><strong>DNI:</strong> {clienteSeleccionado.dni}</p>
                <p><strong>Puntos acumulados:</strong> {clienteSeleccionado.puntos_acumulados}</p>
                </div>
            )}
            </div>
                </div>
        </div>
      </div>

      {/* Modal de búsqueda */}
      <ModalBuscarCliente
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSelectCliente={handleSelectCliente}
      />
    </div>
  );
}

export default PagosPage;
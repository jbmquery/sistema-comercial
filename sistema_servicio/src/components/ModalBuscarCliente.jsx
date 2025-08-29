// components/ModalBuscarCliente.jsx
import { useState, useEffect } from 'react';
import { API_BASE } from '../config';

function ModalBuscarCliente({ isOpen, onClose, onSelectCliente }) {
  const [dni, setDni] = useState('');
  const [clientes, setClientes] = useState([]);

  useEffect(() => {
    if (dni.length >= 3) {
      const fetchClientes = async () => {
        try {
          const response = await fetch(`${API_BASE}/api/clientes/buscar?dni=${dni}`, {
            method: 'GET',
            headers: { 'ngrok-skip-browser-warning': 'true' }
          });
          const data = await response.json();
          setClientes(data.clientes || []);
        } catch (error) {
          console.error("Error al buscar clientes:", error);
          setClientes([]);
        }
      };
      fetchClientes();
    } else {
      setClientes([]);
    }
  }, [dni]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Buscar Cliente</h3>
          <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost">✕</button>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Buscar por DNI</label>
          <input
            type="text"
            value={dni}
            onChange={(e) => setDni(e.target.value)}
            placeholder="Ingrese DNI..."
            className="input input-bordered w-full"
            autoFocus
          />
        </div>

        <div className="overflow-y-auto flex-grow">
          {clientes.length === 0 ? (
            <p className="text-center text-gray-500 py-4">
              {dni.length < 3 ? 'Ingrese al menos 3 dígitos' : 'No se encontraron clientes'}
            </p>
          ) : (
            <table className="table table-compact w-full">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>DNI</th>
                  <th>Puntos</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {clientes.map((cliente) => (
                  <tr key={cliente.id_cliente}>
                    <td>{cliente.id_cliente}</td>
                    <td>{cliente.nombre_completo}</td>
                    <td>{cliente.dni}</td>
                    <td>{cliente.puntos_acumulados}</td>
                    <td>
                      <button
                        onClick={() => onSelectCliente(cliente)}
                        className="btn btn-md btn-primary"
                      >
                        <svg width={16} height={16} fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M12.352 18.848a1.2 1.2 0 0 1 0-1.696L17.503 12l-5.151-5.152a1.2 1.2 0 1 1 1.696-1.696l6 6a1.2 1.2 0 0 1 0 1.696l-6 6a1.2 1.2 0 0 1-1.696 0Z" clipRule="evenodd" />
                        <path fillRule="evenodd" d="M5.152 18.848a1.2 1.2 0 0 1 0-1.696L10.303 12 5.152 6.848a1.2 1.2 0 0 1 1.696-1.696l6 6a1.2 1.2 0 0 1 0 1.696l-6 6a1.2 1.2 0 0 1-1.696 0Z" clipRule="evenodd" />
                        </svg>
                        <span className="hidden md:inline">Seleccionar</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="flex justify-end mt-4">
          <button onClick={onClose} className="btn btn-outline">Cerrar</button>
        </div>
      </div>
    </div>
  );
}

export default ModalBuscarCliente;
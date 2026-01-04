// ClientesPage.jsx
import { useState, useEffect } from 'react';
import HeaderNav from '../components/header_nav.jsx';
import { API_BASE } from '../config';

function ClientesPage() {
  const [clientes, setClientes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [currentCliente, setCurrentCliente] = useState({
    id_cliente: '',
    nombres: '',
    ape_paterno: '',
    ape_materno: '',
    celular: '',
    dni: '',
    estado: true
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar clientes al iniciar
  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/clientes`, {
        headers: { 'ngrok-skip-browser-warning': 'true' }
      });
      
      if (!response.ok) {
        throw new Error('Error al cargar clientes');
      }
      
      const data = await response.json();
      setClientes(data);
      setError(null);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredClientes = clientes.filter(cliente => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      cliente.nombres.toLowerCase().includes(searchTermLower) ||
      (cliente.ape_paterno && cliente.ape_paterno.toLowerCase().includes(searchTermLower)) ||
      (cliente.ape_materno && cliente.ape_materno.toLowerCase().includes(searchTermLower)) ||
      cliente.dni.toLowerCase().includes(searchTermLower)
    );
  });

  const handleAddCliente = () => {
    setCurrentCliente({
      id_cliente: '',
      nombres: '',
      ape_paterno: '',
      ape_materno: '',
      celular: '',
      dni: '',
      estado: true
    });
    setIsEditing(false);
  };

  const handleEditCliente = (cliente) => {
    setCurrentCliente({
      id_cliente: cliente.id_cliente,
      nombres: cliente.nombres,
      ape_paterno: cliente.ape_paterno,
      ape_materno: cliente.ape_materno,
      celular: cliente.celular,
      dni: cliente.dni,
      estado: cliente.estado
    });
    setIsEditing(true);
  };

  const handleDeleteCliente = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar este cliente?")) {
      try {
        const response = await fetch(`${API_BASE}/api/clientes/${id}`, {
          method: 'DELETE',
          headers: { 
            'ngrok-skip-browser-warning': 'true'
          }
        });
        
        if (response.ok) {
          // Actualizar la lista de clientes sin recargar
          setClientes(clientes.filter(cliente => cliente.id_cliente !== id));
          alert("Cliente eliminado exitosamente");
        } else {
          const errorData = await response.json();
          alert(`Error al eliminar cliente: ${errorData.error || 'Desconocido'}`);
        }
      } catch (error) {
        console.error("Error al eliminar cliente:", error);
        alert("Error de conexión");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentCliente.nombres || !currentCliente.dni) {
      alert("Los campos 'nombres' y 'dni' son requeridos");
      return;
    }
    
    // Validar longitud del DNI
    if (currentCliente.dni.length < 8 || currentCliente.dni.length > 12) {
      alert("El DNI debe tener entre 8 y 12 caracteres");
      return;
    }
    
    try {
      if (isEditing) {
        // Actualizar cliente existente
        const response = await fetch(`${API_BASE}/api/clientes/${currentCliente.id_cliente}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true'
          },
          body: JSON.stringify({
            nombres: currentCliente.nombres,
            ape_paterno: currentCliente.ape_paterno,
            ape_materno: currentCliente.ape_materno,
            celular: currentCliente.celular,
            dni: currentCliente.dni,
            estado: currentCliente.estado
          })
        });
        
        if (response.ok) {
          const updatedCliente = await response.json();
          setClientes(clientes.map(cliente => 
            cliente.id_cliente === updatedCliente.id_cliente ? updatedCliente : cliente
          ));
          resetForm();
          alert("Cliente actualizado exitosamente");
        } else {
          const errorData = await response.json();
          alert(`Error al actualizar cliente: ${errorData.error || 'Desconocido'}`);
        }
      } else {
        // Crear nuevo cliente
        const response = await fetch(`${API_BASE}/api/clientes`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true'
          },
          body: JSON.stringify({
            nombres: currentCliente.nombres,
            ape_paterno: currentCliente.ape_paterno,
            ape_materno: currentCliente.ape_materno,
            celular: currentCliente.celular,
            dni: currentCliente.dni
          })
        });
        
        if (response.ok) {
          const newCliente = await response.json();
          setClientes([...clientes, newCliente]);
          resetForm();
          alert("Cliente creado exitosamente");
        } else {
          const errorData = await response.json();
          alert(`Error al crear cliente: ${errorData.error || 'Desconocido'}`);
        }
      }
    } catch (error) {
      console.error("Error al procesar cliente:", error);
      alert("Error de conexión");
    }
  };

  const resetForm = () => {
    setCurrentCliente({
      id_cliente: '',
      nombres: '',
      ape_paterno: '',
      ape_materno: '',
      celular: '',
      dni: '',
      estado: true
    });
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <HeaderNav />
        <div className="text-center p-4">
          <span className="loading loading-spinner loading-lg"></span>
          <p className="mt-2">Cargando clientes...</p>
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
        <button 
          className="btn btn-primary mt-4"
          onClick={fetchClientes}
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center items-center">
      <HeaderNav />
      
      <div className='p-4 md:p-6 lg:p-8 max-w-7xl w-full'>
        <h1 className="text-2xl font-bold mb-6">Gestión de Clientes</h1>
        
        {/* Formulario */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              {isEditing ? 'Editar Cliente' : 'Nuevo Cliente'}
            </h2>
            {!isEditing && (
              <button 
                onClick={handleAddCliente}
                className="btn btn-sm btn-primary"
              >
                + Nuevo Cliente
              </button>
            )}
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Nombres *</span>
                </label>
                <input
                  type="text"
                  value={currentCliente.nombres}
                  onChange={e => setCurrentCliente({...currentCliente, nombres: e.target.value})}
                  className="input input-bordered"
                  required
                />
              </div>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Apellido Paterno</span>
                </label>
                <input
                  type="text"
                  value={currentCliente.ape_paterno}
                  onChange={e => setCurrentCliente({...currentCliente, ape_paterno: e.target.value})}
                  className="input input-bordered"
                />
              </div>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Apellido Materno</span>
                </label>
                <input
                  type="text"
                  value={currentCliente.ape_materno}
                  onChange={e => setCurrentCliente({...currentCliente, ape_materno: e.target.value})}
                  className="input input-bordered"
                />
              </div>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Celular</span>
                </label>
                <input
                  type="tel"
                  value={currentCliente.celular}
                  onChange={e => setCurrentCliente({...currentCliente, celular: e.target.value})}
                  className="input input-bordered"
                  placeholder="Ej: 987654321"
                />
              </div>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text">DNI *</span>
                </label>
                <input
                  type="text"
                  value={currentCliente.dni}
                  onChange={e => setCurrentCliente({...currentCliente, dni: e.target.value})}
                  className="input input-bordered"
                  required
                  maxLength={12}
                  placeholder="Ej: 76045247"
                />
                <label className="label">
                  <span className="label-text-alt">Debe tener entre 8 y 12 caracteres</span>
                </label>
              </div>
              
              <div className="form-control">
                <label className="label cursor-pointer">
                  <span className="label-text">Estado</span>
                  <input
                    type="checkbox"
                    checked={currentCliente.estado}
                    onChange={e => setCurrentCliente({...currentCliente, estado: e.target.checked})}
                    className="toggle"
                  />
                </label>
              </div>
              
              {isEditing && (
                <>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">ID Cliente</span>
                    </label>
                    <input
                      type="text"
                      value={currentCliente.id_cliente}
                      readOnly
                      className="input input-bordered bg-gray-100"
                    />
                  </div>
                  
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Puntos Acumulados</span>
                    </label>
                    <input
                      type="text"
                      value={currentCliente.puntos_acumulados}
                      readOnly
                      className="input input-bordered bg-gray-100"
                    />
                  </div>
                  
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Fecha Registro</span>
                    </label>
                    <input
                      type="text"
                      value={currentCliente.fecha_registro ? new Date(currentCliente.fecha_registro).toLocaleDateString('es-PE') : ''}
                      readOnly
                      className="input input-bordered bg-gray-100"
                    />
                  </div>
                </>
              )}
            </div>
            
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={resetForm} className="btn btn-outline">
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary">
                {isEditing ? 'Actualizar Cliente' : 'Agregar Cliente'}
              </button>
            </div>
          </form>
        </div>
        
        {/* Tabla de clientes */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
            <h2 className="text-xl font-semibold">Clientes Registrados</h2>
            <div className="form-control w-full md:w-auto">
              <input
                type="text"
                placeholder="Buscar por nombre, apellido o DNI..."
                value={searchTerm}
                onChange={handleSearch}
                className="input input-bordered w-full"
              />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombres</th>
                  <th>Apellidos</th>
                  <th>Celular</th>
                  <th>DNI</th>
                  <th>Puntos</th>
                  <th>Fecha Registro</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredClientes.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center py-4">
                      {searchTerm ? 'No se encontraron clientes que coincidan con la búsqueda' : 'No hay clientes registrados'}
                    </td>
                  </tr>
                ) : (
                  filteredClientes.map(cliente => (
                    <tr key={cliente.id_cliente}>
                      <td>{cliente.id_cliente}</td>
                      <td>{cliente.nombres}</td>
                      <td>
                        {cliente.ape_paterno} {cliente.ape_materno}
                      </td>
                      <td>{cliente.celular}</td>
                      <td>{cliente.dni}</td>
                      <td>{cliente.puntos_acumulados}</td>
                      <td>
                        {cliente.fecha_registro ? new Date(cliente.fecha_registro).toLocaleDateString('es-PE') : ''}
                      </td>
                      <td>
                        <span className={`badge ${cliente.estado ? 'badge-success' : 'badge-error'}`}>
                          {cliente.estado ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <button
                            onClick={() => handleEditCliente(cliente)}
                            className="btn btn-sm btn-primary"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDeleteCliente(cliente.id_cliente)}
                            className="btn btn-sm btn-error"
                          >
                            Eliminar
                          </button>
                        </div>
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

export default ClientesPage;
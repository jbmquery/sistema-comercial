//sistema_servicio/src/pages/EditTablesPage.jsx
import { useEffect, useState } from 'react';
import HeaderCom from '../components/header_com.jsx';
import { API_BASE } from '../config';
import { Link } from "react-router-dom";
import Sidebar from "../components/SiderbarAdmin.jsx";


function EditTablesPage() {

  const [mesas, setMesas] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentMesa, setCurrentMesa] = useState({
    id_mesas: '',
    nombre: '',
    capacidad: '',
    disponibilidad: true,
    tipo_mesa: ''
  });

  useEffect(() => {
    fetchMesas();
  }, []);

  const fetchMesas = async () => {
    const res = await fetch(`${API_BASE}/api/mesas`, {
      headers: { 'ngrok-skip-browser-warning': 'true' }
    });
    const data = await res.json();
    setMesas(data.mesas);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const method = isEditing ? 'PUT' : 'POST';
    const url = isEditing
      ? `${API_BASE}/api/mesas/${currentMesa.id_mesas}`
      : `${API_BASE}/api/mesas`;

    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify({
        nombre: currentMesa.nombre,
        capacidad: currentMesa.capacidad,
        disponibilidad: currentMesa.disponibilidad,
        tipo_mesa: currentMesa.tipo_mesa
      })
    });

    if (res.ok) {
      fetchMesas();
      resetForm();
    } else {
      alert('Error al guardar mesa');
    }
  };

  const handleEdit = (mesa) => {
    setCurrentMesa(mesa);
    setIsEditing(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar mesa?')) return;

    await fetch(`${API_BASE}/api/mesas/${id}`, {
      method: 'DELETE',
      headers: { 'ngrok-skip-browser-warning': 'true' }
    });

    fetchMesas();
  };

  const resetForm = () => {
    setCurrentMesa({
      id_mesas: '',
      nombre: '',
      capacidad: '',
      disponibilidad: true,
      tipo_mesa: ''
    });
    setIsEditing(false);
  };

  return (
    <div className="w-full shadow-md">
      <HeaderCom />

      <div className="flex flex-col md:flex-row w-full bg-neutral-800">
        <div className="drawer lg:drawer-open w-full">
          <input id="my-drawer-3" type="checkbox" className="drawer-toggle" />

          {/* CONTENIDO PRINCIPAL */}
          <div className="drawer-content p-4 w-full">

            <label htmlFor="my-drawer-3" className=" drawer-button btn btn-outline text-primary lg:hidden mb-4">
              ☰
            </label>

            <h1 className="text-2xl font-bold mb-4">Gestión de Mesas</h1>

            {/* FORMULARIO */}
            <form onSubmit={handleSubmit} className="bg-black p-4 rounded shadow mb-6 w-full">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <input
                  className="input input-bordered bg-neutral-800"
                  placeholder="Nombre"
                  value={currentMesa.nombre}
                  onChange={e => setCurrentMesa({ ...currentMesa, nombre: e.target.value })}
                  required
                />
                <input
                  type="number"
                  className="input input-bordered bg-neutral-800"
                  placeholder="Capacidad"
                  value={currentMesa.capacidad}
                  onChange={e => setCurrentMesa({ ...currentMesa, capacidad: e.target.value })}
                  required
                />
                <input
                  className="input input-bordered bg-neutral-800"
                  placeholder="Tipo de mesa"
                  value={currentMesa.tipo_mesa}
                  onChange={e => setCurrentMesa({ ...currentMesa, tipo_mesa: e.target.value })}
                />
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={currentMesa.disponibilidad}
                    onChange={e => setCurrentMesa({ ...currentMesa, disponibilidad: e.target.checked })}
                    className="toggle toggle-primary"
                  />
                  Disponible
                </label>
              </div>

              <div className="mt-4 flex justify-between items-center">
                <button type="button" onClick={resetForm} className="btn btn-outline text-secondary btn-sm">
                  Cancelar
                </button>
                <div className="flex gap-2">
                  {/* BOTÓN ELIMINAR SOLO CUANDO EDITAS */}
                  {isEditing && currentMesa.id_mesas && (
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleDelete(currentMesa.id_mesas)}
                    >
                      Eliminar
                    </button>
                  )}
                  <button type="submit" className="btn btn-success btn-sm">
                    {isEditing ? 'Actualizar' : 'Crear'}
                  </button>
                </div>
              </div>
            </form>

            {/* TABLA */}
            <div className="bg-black rounded shadow overflow-x-auto select-none">
              <table className="table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th className='min-w-30'>Nombre</th>
                    <th>Capacidad</th>
                    <th>Disponible</th>
                    <th>Tipo</th>
                  </tr>
                </thead>
                <tbody>
                  {mesas.map(mesa => (
                    <tr
                      key={mesa.id_mesas}
                      className="hover:bg-neutral-700 cursor-pointer"
                      onClick={() => handleEdit(mesa)}
                    >
                      <td>{mesa.id_mesas}</td>
                      <td>{mesa.nombre}</td>
                      <td>{mesa.capacidad}</td>
                      <td>
                        <span className={`badge ${mesa.disponibilidad ? 'badge-accent' : 'badge-secondary'}`}>
                          {mesa.disponibilidad ? 'Sí' : 'No'}
                        </span>
                      </td>
                      <td>{mesa.tipo_mesa}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>

          {/* SIDEBAR */}
           <Sidebar activePage="mesas" />
         
          {/* FIN SIDEBAR */}            
        </div>
      </div>
    </div>
  );
}

export default EditTablesPage;

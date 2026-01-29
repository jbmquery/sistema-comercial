// sistema_servicio/src/pages/EditTablesPage.jsx

 /* =========================
    IMPORTS
  ========================= */

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import HeaderCom from "../components/header_com.jsx";
import { API_BASE } from "../config";
import Sidebar from "../components/SiderbarAdmin.jsx";
import { getMesas } from "../api";

function EditTablesPage() {
  const queryClient = useQueryClient();
  const [mensajeOk, setMensajeOk] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [currentMesa, setCurrentMesa] = useState({
    id_mesas: "",
    nombre: "",
    capacidad: "",
    disponibilidad: true,
    tipo_mesa: "",
  });

  const {
    data: mesas = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["mesas"],
    queryFn: getMesas,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  /* =========================
     MUTATION: CREAR / EDITAR
  ========================= */

  const saveMesa = useMutation({
    mutationFn: async (mesa) => {
      const method = isEditing ? "PUT" : "POST";
      const url = isEditing
        ? `${API_BASE}/api/mesas/${mesa.id_mesas}`
        : `${API_BASE}/api/mesas`;

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify({
          nombre: mesa.nombre,
          capacidad: Number(mesa.capacidad),
          disponibilidad: mesa.disponibilidad,
          tipo_mesa: mesa.tipo_mesa,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw data;
      }

      return data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries(["mesas"]);
      resetForm();
    },

    onError: (error) => {
      if (
        error?.error ===
        "Hay un pedido aun abierto y no se puede cambiar el estado"
      ) {
        setMensajeOk(
          "❌ Hay un pedido aun abierto y no se puede cambiar el estado",
        );
        setTimeout(() => setMensajeOk(""), 2500);
      } else {
        setMensajeOk("❌ Error al actualizar mesa");
        setTimeout(() => setMensajeOk(""), 2500);
      }
    },
  });

  /* =========================
     MUTATION: ELIMINAR
  ========================= */

  const deleteMesa = useMutation({
    mutationFn: async (id) => {
      const res = await fetch(`${API_BASE}/api/mesas/${id}`, {
        method: "DELETE",
        headers: {
          "ngrok-skip-browser-warning": "true",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw data;
      }

      return data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries(["mesas"]);
      resetForm();
    },

    onError: (error) => {
      if (
        error?.error ===
        "Hay un pedido aun abierto y no se puede eliminar la mesa"
      ) {
        setMensajeOk(
          "❌ Hay un pedido aun abierto y no se puede eliminar la mesa",
        );
        setTimeout(() => setMensajeOk(""), 2500);
      } else {
        setMensajeOk("❌ Error al eliminar mesa");
        setTimeout(() => setMensajeOk(""), 2500);
      }
    },
  });

  if (isError) {
    return (
      <div className="text-red-500 text-center mt-10">
        Error al cargar mesas: {error.message}
      </div>
    );
  }

  /* =========================
     HANDLERS (IGUALES A LOS TUYOS)
  ========================= */

  const handleSubmit = (e) => {
    e.preventDefault();
    saveMesa.mutate(currentMesa);
  };

  const handleEdit = (mesa) => {
    setCurrentMesa(mesa);
    setIsEditing(true);
  };

  const handleDelete = (id) => {
    if (!window.confirm("¿Eliminar mesa?")) return;
    deleteMesa.mutate(id);
  };

  const resetForm = () => {
    setCurrentMesa({
      id_mesas: "",
      nombre: "",
      capacidad: "",
      disponibilidad: true,
      tipo_mesa: "",
    });
    setIsEditing(false);
  };

  return (
    <div className="w-full shadow-md">
      <HeaderCom />

      <div className="flex flex-col md:flex-row w-full bg-neutral-800">
        <div className="drawer lg:drawer-open w-full">
          {/* 👉 TU PIEZA CLAVE DEL DRAWER (TAL CUAL ORIGINAL) */}
          <input id="my-drawer-3" type="checkbox" className="drawer-toggle" />

          {/* CONTENIDO PRINCIPAL */}
          <div className="drawer-content p-4 w-full">
            {/* 👉 BOTÓN DEL DRAWER (TAL CUAL ORIGINAL) */}
            <label
              htmlFor="my-drawer-3"
              className="drawer-button btn btn-outline text-primary lg:hidden mb-4"
            >
              ☰
            </label>

            <h1 className="text-2xl font-bold mb-4">Gestión de Mesas</h1>
            {mensajeOk && (
              <div className="alert alert-warning mb-4">{mensajeOk}</div>
            )}

            {/* FORMULARIO (IGUAL AL TUYO) */}
            <form
              onSubmit={handleSubmit}
              className="bg-black p-4 rounded shadow mb-6 w-full"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <input
                  className="input input-bordered bg-neutral-800"
                  placeholder="Nombre"
                  value={currentMesa.nombre}
                  onChange={(e) =>
                    setCurrentMesa({ ...currentMesa, nombre: e.target.value })
                  }
                  required
                />
                <input
                  type="number"
                  className="input input-bordered bg-neutral-800"
                  placeholder="Capacidad"
                  value={currentMesa.capacidad}
                  onChange={(e) =>
                    setCurrentMesa({
                      ...currentMesa,
                      capacidad: e.target.value,
                    })
                  }
                  required
                />
                <input
                  className="input input-bordered bg-neutral-800"
                  placeholder="Tipo de mesa"
                  value={currentMesa.tipo_mesa}
                  onChange={(e) =>
                    setCurrentMesa({
                      ...currentMesa,
                      tipo_mesa: e.target.value,
                    })
                  }
                />
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={currentMesa.disponibilidad}
                    onChange={(e) =>
                      setCurrentMesa({
                        ...currentMesa,
                        disponibilidad: e.target.checked,
                      })
                    }
                    className="toggle toggle-primary"
                  />
                  Disponible
                </label>
              </div>

              <div className="mt-4 flex justify-between items-center">
                <button
                  type="button"
                  onClick={resetForm}
                  className="btn btn-outline text-secondary btn-sm"
                >
                  Cancelar
                </button>
                <div className="flex gap-2">
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
                    {isEditing ? "Actualizar" : "Crear"}
                  </button>
                </div>
              </div>
            </form>

            {/* TABLA (IGUAL A LA TUYA) */}
            <div className="bg-black rounded shadow overflow-x-auto select-none">
              {isLoading ? (
                <p className="p-4 text-center">Cargando mesas...</p>
              ) : (
                <table className="table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th className="min-w-30">Nombre</th>
                      <th>Capacidad</th>
                      <th>Disponible</th>
                      <th>Tipo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mesas.map((mesa) => (
                      <tr
                        key={mesa.id_mesas}
                        className="hover:bg-neutral-700 cursor-pointer"
                        onClick={() => handleEdit(mesa)}
                      >
                        <td>{mesa.id_mesas}</td>
                        <td>{mesa.nombre}</td>
                        <td>{mesa.capacidad}</td>
                        <td>
                          <span
                            className={`badge ${mesa.disponibilidad ? "badge-accent" : "badge-secondary"}`}
                          >
                            {mesa.disponibilidad ? "Sí" : "No"}
                          </span>
                        </td>
                        <td>{mesa.tipo_mesa}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* 👉 TU SIDEBAR EN SU LUGAR ORIGINAL */}
          <Sidebar activePage="mesas" />
        </div>
      </div>
    </div>
  );
}

export default EditTablesPage;

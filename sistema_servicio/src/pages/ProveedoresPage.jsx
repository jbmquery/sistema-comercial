import React from "react";
import HeaderCom from "../components/header_com.jsx";
import Sidebar from "../components/SiderbarAdmin.jsx";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getProveedores,
  crearProveedor,
  actualizarProveedor,
  eliminarProveedor,
} from "../api";

function ProveedoresPage() {
  const [busquedaLocal, setBusquedaLocal] = useState("");
  const queryClient = useQueryClient();

  const [proveedorForm, setProveedorForm] = useState({
    id_proveedor: "",
    nombre: "",
    ruc_dni: "",
    celular: "",
    correo: "",
    direccion: "",
    estado: true,
    observaciones: "",
  });

  const { data: proveedores = [] } = useQuery({
    queryKey: ["proveedores"],
    queryFn: getProveedores,
  });

  const proveedoresFiltrados = proveedores.filter((p) => {
    if (!busquedaLocal.trim()) return true;

    const texto = busquedaLocal.toLowerCase();

    return Object.values(p).some((v) =>
      String(v).toLowerCase().includes(texto),
    );
  });

  const editarProveedor = (p) => {
    setProveedorForm({
      id_proveedor: p.id_proveedor,
      nombre: p.nombre ?? "",
      ruc_dni: p.ruc_dni ?? "",
      celular: p.celular ?? "",
      correo: p.correo ?? "",
      direccion: p.direccion ?? "",
      estado: !!p.estado,
      observaciones: p.observaciones ?? "",
    });

    document.getElementById("modal_proveedor").checked = true;
  };

  const saveProveedor = useMutation({
    mutationFn: () =>
      proveedorForm.id_proveedor
        ? actualizarProveedor(proveedorForm)
        : crearProveedor(proveedorForm),

    onSuccess: () => {
      queryClient.invalidateQueries(["proveedores"]);
      document.getElementById("modal_proveedor").checked = false;
    },
  });

  const deleteProveedor = useMutation({
    mutationFn: eliminarProveedor,
    onSuccess: () => {
      queryClient.invalidateQueries(["proveedores"]);
      document.getElementById("modal_proveedor").checked = false;
    },
  });

  /* Contador */

  const totalCoincidencias = (() => {
    if (!busquedaLocal.trim()) return 0;

    let contador = 0;

    proveedoresFiltrados.forEach((p) => {
      Object.values(p).forEach((v) => {
        const matches = String(v)
          .toLowerCase()
          .match(new RegExp(busquedaLocal, "gi"));

        if (matches) contador += matches.length;
      });
    });

    return contador;
  })();

  /* Resaltar */

  const resaltarTexto = (texto) => {
    if (!busquedaLocal.trim()) return texto;

    const regex = new RegExp(`(${busquedaLocal})`, "gi");

    return String(texto)
      .split(regex)
      .map((parte, i) =>
        parte.toLowerCase() === busquedaLocal.toLowerCase() ? (
          <span key={i} className="bg-warning text-black px-1 rounded">
            {parte}
          </span>
        ) : (
          parte
        ),
      );
  };

  /* CSV descargar */

  const descargarCSV = () => {
    if (!proveedoresFiltrados.length) return;

    const headers = [
      "ID",
      "Nombre",
      "RUC/DNI",
      "Celular",
      "Correo",
      "Dirección",
      "Estado",
      "Fecha",
      "Observaciones",
    ];

    const filas = proveedoresFiltrados.map((p) => [
      p.id_proveedor,
      p.nombre,
      p.ruc_dni,
      p.celular,
      p.correo,
      p.direccion,
      p.estado ? "Activo" : "Inactivo",
      p.fecha_registro,
      p.observaciones,
    ]);

    const csv =
      "data:text/csv;charset=utf-8," +
      [headers, ...filas].map((e) => e.join(",")).join("\n");

    const link = document.createElement("a");
    link.href = encodeURI(csv);
    link.download = "proveedores.csv";
    link.click();
  };

  return (
    <div className="w-full shadow-md">
      <div className="toast toast-top toast-center z-[9999]">
        {/* {mensajeOk && (
          <div className="alert alert-warning mb-4">{mensajeOk}</div>
        )} */}
      </div>

      <HeaderCom />
      <div className="drawer lg:drawer-open bg-neutral-800">
        <input id="my-drawer-3" type="checkbox" className="drawer-toggle" />
        {/* ================= CONTENIDO ================= */}
        <div className="drawer-content p-4">
          <label
            htmlFor="my-drawer-3"
            className="btn drawer-button btn-outline btn-primary lg:hidden mb-4"
          >
            ☰
          </label>
          <h1 className="text-2xl font-bold mb-6">Gestión de Proveedores</h1>
          {/* ================= FILTROS ================= */}
          <div className="pt-4 pb-4 px-2 bg-black rounded-t-lg flex flex-col gap-4">
            {/* Titulo */}
            <span className="font-bold text-lg">Lista de Proveedores</span>
            <div className=" flex flex-row justify-between items-center">
              {/* Filtro Carta*/}
              <div className="flex items-center gap-2 md:gap-3">
                {/* 🔎 INPUT BUSCAR LOCAL */}
                <input
                  type="text"
                  placeholder="Buscar"
                  className="input input-bordered bg-neutral-800 max-w-20 md:max-w-30"
                  value={busquedaLocal}
                  onChange={(e) => setBusquedaLocal(e.target.value)}
                />

                {/* 🧮 CONTADOR DE COINCIDENCIAS */}
                <div className=" text-xs md:text-sm opacity-80 flex flex-col md:flex-row items-center">
                  <span className="mr-1">Hay </span>
                  <span className="mr-1">{totalCoincidencias}</span>
                  <span className="hidden md:inline">coincidencias</span>
                </div>
              </div>

              <div className="flex flex-row justify-between items-center gap-2">
                {/* Boton descargar CSV*/}
                <button
                  className="btn btn-dash btn-warning btn-sm"
                  onClick={descargarCSV}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="size-5"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 2.25a.75.75 0 0 1 .75.75v11.69l3.22-3.22a.75.75 0 1 1 1.06 1.06l-4.5 4.5a.75.75 0 0 1-1.06 0l-4.5-4.5a.75.75 0 1 1 1.06-1.06l3.22 3.22V3a.75.75 0 0 1 .75-.75Zm-9 13.5a.75.75 0 0 1 .75.75v2.25a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5V16.5a.75.75 0 0 1 1.5 0v2.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V16.5a.75.75 0 0 1 .75-.75Z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="hidden md:inline">CSV</span>
                </button>
                {/* Boton agregar nuevo registro de carta*/}
                <label
                  htmlFor="modal_proveedor"
                  className="btn btn-primary btn-sm"
                  onClick={() =>
                    setProveedorForm({
                      id_proveedor: "",
                      nombre: "",
                      ruc_dni: "",
                      celular: "",
                      correo: "",
                      direccion: "",
                      estado: true,
                      observaciones: "",
                    })
                  }
                >
                  Añadir Proveedor
                </label>
              </div>
            </div>
          </div>
          {/* ================= TABLA CARTA ================= */}
          <div className="overflow-x-auto bg-black rounded-b-lg shadow select-none max-h-[500px] overflow-y-auto">
            <table className="table table-sm">
              <thead className="sticky top-0 z-0 bg-black shadow-md">
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>RUC / DNI</th>
                  <th>Celular</th>
                  <th>Correo</th>
                  <th>Dirección</th>
                  <th>Estado</th>
                  <th>Fecha Registro</th>
                  <th>Observaciones</th>
                </tr>
              </thead>
              <tbody>
                {proveedoresFiltrados.map((p) => (
                  <tr key={p.id_proveedor} onClick={() => editarProveedor(p)} className="cursor-pointer hover:bg-neutral-700">
                    <td>{p.id_proveedor}</td>
                    <td>{resaltarTexto(p.nombre)}</td>
                    <td>{resaltarTexto(p.ruc_dni)}</td>
                    <td>{resaltarTexto(p.celular)}</td>
                    <td>{resaltarTexto(p.correo)}</td>
                    <td>{resaltarTexto(p.direccion)}</td>
                    <td>{p.estado ? "Activo" : "Inactivo"}</td>
                    <td>{resaltarTexto(p.fecha_registro)}</td>
                    <td>{resaltarTexto(p.observaciones)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {/* ================= SIDEBAR ================= */}
        {/* SIDEBAR */}
        <Sidebar activePage="proveedores" />
        {/* FIN SIDEBAR */}
      </div>
      {/* ================= MODALES ================= */}
      <input type="checkbox" id="modal_proveedor" className="modal-toggle" />
      <div className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">
            {proveedorForm.id_proveedor
              ? "Editar Proveedor"
              : "Nuevo Proveedor"}
          </h3>

          <input
            className="input input-bordered w-full my-2"
            placeholder="Nombre"
            value={proveedorForm.nombre}
            onChange={(e) =>
              setProveedorForm({ ...proveedorForm, nombre: e.target.value })
            }
          />

          <input
            className="input input-bordered w-full my-2"
            placeholder="RUC / DNI"
            value={proveedorForm.ruc_dni}
            onChange={(e) =>
              setProveedorForm({ ...proveedorForm, ruc_dni: e.target.value })
            }
          />

          <input
            className="input input-bordered w-full my-2"
            placeholder="Celular"
            value={proveedorForm.celular}
            onChange={(e) =>
              setProveedorForm({ ...proveedorForm, celular: e.target.value })
            }
          />

          <input
            className="input input-bordered w-full my-2"
            placeholder="Correo"
            value={proveedorForm.correo}
            onChange={(e) =>
              setProveedorForm({ ...proveedorForm, correo: e.target.value })
            }
          />

          <input
            className="input input-bordered w-full my-2"
            placeholder="Dirección"
            value={proveedorForm.direccion}
            onChange={(e) =>
              setProveedorForm({ ...proveedorForm, direccion: e.target.value })
            }
          />

          <textarea
            className="textarea textarea-bordered w-full my-2"
            placeholder="Observaciones"
            value={proveedorForm.observaciones}
            onChange={(e) =>
              setProveedorForm({
                ...proveedorForm,
                observaciones: e.target.value,
              })
            }
          />

          <label className="flex items-center gap-2 my-2">
            <input
              type="checkbox"
              className="toggle toggle-success"
              checked={proveedorForm.estado}
              onChange={(e) =>
                setProveedorForm({ ...proveedorForm, estado: e.target.checked })
              }
            />
            Activo
          </label>

          <div className="modal-action flex justify-between">
            <label htmlFor="modal_proveedor" className="btn btn-outline btn-secondary">
              Cancelar
            </label>

            <div className="flex gap-2">
              {proveedorForm.id_proveedor && (
                <button
                  className="btn btn-secondary"
                  onClick={() =>
                    deleteProveedor.mutate(proveedorForm.id_proveedor)
                  }
                >
                  Eliminar
                </button>
              )}

              <button
                className="btn btn-success"
                onClick={() => saveProveedor.mutate()}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProveedoresPage;

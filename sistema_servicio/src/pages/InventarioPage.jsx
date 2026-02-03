//sistema_servicio/src/pages/InventarioPage.jsx
import React from "react";
import HeaderCom from "../components/header_com.jsx";
import Sidebar from "../components/SiderbarAdmin.jsx";

function InventarioPage() {
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
          <h1 className="text-2xl font-bold mb-6">Gestión de Inventario</h1>
          {/* ================= FILTROS ================= */}
          <div className="pt-4 pb-4 px-2 bg-black rounded-t-lg flex flex-col gap-4">
            {/* Titulo */}
            <span className="font-bold text-lg">Lista de Insumos</span>
            <div className=" flex flex-row justify-between items-center">
              {/* Filtro Carta*/}
              <div className="flex items-center gap-2 md:gap-3">
                <select className="select select-bordered max-w-20 lg:max-w-30 bg-neutral-800">
                  <option value="">Categorías</option>
                </select>
                {/* 🔎 INPUT BUSCAR LOCAL */}
                <input
                  type="text"
                  placeholder="Buscar"
                  className="input input-bordered bg-neutral-800 max-w-20 md:max-w-30"
                />

                {/* 🧮 CONTADOR DE COINCIDENCIAS */}
                <div className=" text-xs md:text-sm opacity-80 flex flex-col md:flex-row items-center">
                  <span className="mr-1">Hay </span>
                  <span className="mr-1">0</span>
                  <span className="hidden md:inline">coincidencias</span>
                </div>
              </div>

              <div className="flex flex-row justify-between items-center gap-2">
                {/* Boton descargar CSV*/}
                <button className="btn btn-dash btn-warning btn-sm">
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
                <label htmlFor="modal_carta" className="btn btn-sm btn-primary">
                  <svg
                    width="18"
                    height="18"
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
                  <span className="hidden md:inline">Añadir Insumos</span>
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
                  <th>Categoría</th>
                  <th>Clase</th>
                  <th>Unidad de medida</th>
                  <th>Estado</th>
                  <th>Fecha Registro</th>
                </tr>
              </thead>
              <tbody>
                <tr className="hover:bg-neutral-700 cursor-pointer">
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        {/* ================= SIDEBAR ================= */}
        {/* SIDEBAR */}
        <Sidebar activePage="inventario" />
        {/* FIN SIDEBAR */}
      </div>
      {/* ================= MODALES ================= */}
    </div>
  );
}

export default InventarioPage;

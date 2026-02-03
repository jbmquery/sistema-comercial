import React from 'react'
import HeaderCom from "../components/header_com.jsx";
import Sidebar from "../components/SiderbarAdmin.jsx";

function RecetasPage() {
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
          <h1 className="text-2xl font-bold mb-6">Gestión Recetas</h1>
        </div>
        {/* ================= SIDEBAR ================= */}
        {/* SIDEBAR */}
        <Sidebar activePage="recetas" />
        {/* FIN SIDEBAR */}
      </div>
      {/* ================= MODALES ================= */}
    </div>
  )
}

export default RecetasPage
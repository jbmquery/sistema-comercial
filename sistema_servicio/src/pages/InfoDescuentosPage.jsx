import React from "react";
import HeaderCom from "../components/header_com.jsx";
import SiderbarInfo from "../components/SiderbarInfo.jsx";

function InfoDescuentosPage() {
  return (
        <div className="w-full shadow-md">
      <HeaderCom />
      <div className="drawer lg:drawer-open bg-neutral-800">
        <input id="my-drawer-3" type="checkbox" className="drawer-toggle" />
        {/* Contenido principal */}
        <div className="drawer-content p-4">
          <label
            htmlFor="my-drawer-3"
            className="btn drawer-button btn-outline btn-primary lg:hidden mb-4"
          >
            ☰
          </label>
          <h1 className="text-2xl font-bold mb-6">Resumen de Descuentos</h1>
          <div className="w-full items-center">

          </div>
        </div>
        <SiderbarInfo activePage="descuentos"></SiderbarInfo>
      </div>
    </div>
  );
}

export default InfoDescuentosPage;

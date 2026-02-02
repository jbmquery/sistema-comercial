// sistema_servicio/src/pages/NotificacionesPage.jsx
import React from "react";
import HeaderCom from "../components/header_com";
import { useEffect, useState } from "react";
import {
  getMisNotificaciones,
  marcarNotificacionVista,
  getPendientesCount,
} from "../api";

function NotificacionesPage() {
  const [lista, setLista] = useState([]);
  const [seleccionada, setSeleccionada] = useState(null);

  const cargar = async () => {
    setLista(await getMisNotificaciones());
  };

  useEffect(() => {
    cargar();
  }, []);

  const abrirModal = async (n) => {
    setSeleccionada(n);

    if (n.estado === "pendiente") {
      await marcarNotificacionVista(n.id_notificacion);
      cargar();
      getPendientesCount();
    }
  };

  const colorTipo = (tipo) => {
    if (tipo === "ANUNCIO") return "text-warning";
    if (tipo === "FALTA") return "text-secondary";
    if (tipo === "FELICIDADES") return "text-accent";
    return "";
  };

  return (
    <div className="w-full shadow-md bg-neutral-800 h-screen">
      <HeaderCom />
      <div className="drawer-content md:p-6 lg:p-12 w-full">
        <div className="flex flex-col  gap-4">
          <h1 className="text-2xl font-bold mb-2 px-4 pt-4">
            Área de Notificaciones
          </h1>
          <div className="flex flex-col md:flex-row w-full p-4 justify-center">
            <div>
              <div className="bg-black rounded-lg shadow-md w-full  md:w-2xl lg:w-4xl xl:w-7xl flex flex-col mb-10">
                <span className="pl-3 py-3 text-xl font-bold">
                  Cuadro de Notificaciones
                </span>
                <div className="overflow-x-auto">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th className="min-w-25">Fecha</th>
                        <th className="min-w-15">Tipo</th>
                        <th className="min-w-15">Asunto</th>
                        <th className=""></th>
                      </tr>
                    </thead>
                    <tbody>
                      {lista.map((n) => (
                        <tr
                          key={n.id_notificacion}
                          className={`cursor-pointer ${n.estado === "pendiente" ? "animate-pulse" : ""}`}
                          onClick={() => abrirModal(n)}
                        >
                          <td>{n.fecha}</td>
                          <td className={colorTipo(n.tipo)}>{n.tipo}</td>
                          <td>{n.titulo}</td>
                          
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {seleccionada && (
        <dialog className="modal modal-open">
          <div className="modal-box max-w-lg">
            <h3 className="font-bold text-lg flex justify-between">
              NOTIFICACIÓN
              <span className={colorTipo(seleccionada.tipo)}>
                {seleccionada.tipo}
              </span>
            </h3>

            <div className="divider"></div>

            <h4 className="font-semibold mb-4">Asunto: {seleccionada.titulo}</h4>
            <p className="mt-2 mb-4">{seleccionada.descripcion}</p>
            <span className="text-info text-sm">Recomendaciones</span>
            {seleccionada.recomendacion && (
              
              <p className="mt-3 text-sm text-info">
                {seleccionada.recomendacion}
              </p>
            )}

            <div className="text-right text-xs mt-4 italic"> fecha: {seleccionada.fecha}</div>

            <div className="modal-action">
              <button className="btn" onClick={() => setSeleccionada(null)}>
                Cerrar
              </button>
            </div>
          </div>
        </dialog>
      )}
    </div>
  );
}

export default NotificacionesPage;

// sistema_servicio/src/pages/NotificacionesPage.jsx
import React from "react";
import HeaderCom from "../components/header_com";

function NotificacionesPage() {
  return (
    <div className="w-full shadow-md bg-neutral-800 h-screen">
      <HeaderCom />
      <div className="drawer-content md:p-6 lg:p-12 w-full">
        <div className="flex flex-col  gap-4">
          <h1 className="text-2xl font-bold mb-2 px-4 pt-4">Área de Notificaciones</h1>
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
                        <th className="min-w-15">Fecha</th>
                        <th className="min-w-15">Tipo</th>
                        <th className="min-w-15">Asunto</th>
                        <th className=""></th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="font-bold animate-pulse">
                        <td>30/01/2026</td>
                        <td className="text-secondary">FALTA</td>
                        <td>Marcación de Asistencia</td>
                        <td>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="size-6"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="m5.25 4.5 7.5 7.5-7.5 7.5m6-15 7.5 7.5-7.5 7.5"
                            />
                          </svg>
                        </td>
                      </tr>
                      <tr>
                        <td>30/01/2026</td>
                        <td className="text-warning">ANUNCIO</td>
                        <td>Actividades en el Horario Laboral</td>
                        <td>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="size-6"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="m5.25 4.5 7.5 7.5-7.5 7.5m6-15 7.5 7.5-7.5 7.5"
                            />
                          </svg>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotificacionesPage;

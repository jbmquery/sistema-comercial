import React, { useState } from "react";
import HeaderCom from "../components/header_com.jsx";

function MarcarAsistenciaPage() {
  const [mostrarModal, setMostrarModal] = useState(false);

  return (
    <div className="w-full shadow-md">
      <HeaderCom />
      <div className="bg-neutral-800 flex flex-col items-center min-h-screen">
        <div className=" flex flex-col md:flex-row justify-center items-center text-white mb-10 mt-10 lg:mt-15">
          <span className="text-xl md:mr-2">Marcar Asistencia</span>
          <span className="text-2xl font-bold">Sede Pluvia KM22</span>
        </div>

        {/* Contenedor relativo para posicionar los elementos */}
        <div className="relative flex justify-center items-center">
          {/* Fondo brillante (posición base) */}
          <div className="w-45 h-45 bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 rounded-full flex justify-center items-center  shadow-[0_0_15px_5px] shadow-blue-500 animate-pulse">
            {/* Punto central opcional */}
            <div className="w-10 h-10 bg-blue-300 rounded-full opacity-50"></div>
          </div>

          {/* Botón encima del fondo (posición absoluta) */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="btn flex flex-row justify-center bg-primary w-45 h-45 rounded-full items-center cursor-pointer hover:scale-105 transition-transform duration-300">
              <div className="flex flex-col justify-center items-center bg-neutral-800 w-35 h-35 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="size-7 text-white"
                >
                  <path
                    fillRule="evenodd"
                    d="M6.75 2.25A.75.75 0 0 1 7.5 3v1.5h9V3A.75.75 0 0 1 18 3v1.5h.75a3 3 0 0 1 3 3v11.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V7.5a3 3 0 0 1 3-3H6V3a.75.75 0 0 1 .75-.75Zm13.5 9a1.5 1.5 0 0 0-1.5-1.5H5.25a1.5 1.5 0 0 0-1.5 1.5v7.5a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5v-7.5Z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-4xl font-bold text-white">21</span>
                <span className="text-white">ENERO</span>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-10 flex flex-row items-center">
          <select
            name="sede"
            id="sede"
            className="select select-bordered my-2 mx-3 bg-neutral-800"
          >
            <option value="">Selecciona Horario</option>
            <option value="pluvia_km22">08:00Hrs-15:00Hrs</option>
            <option value="pluvia_km22">16:00Hrs-23:00Hrs</option>
          </select>
          <button
            className="btn btn-soft btn-warning"
            onClick={() => setMostrarModal(true)}
          >
            ?
          </button>
        </div>
        {/* Texto adicional debajo */}
        <div className="mt-7 text-center">
          <p className="text-gray-300 mb-4">
            Presiona el botón para marcar tu asistencia
          </p>
          <p className="text-sm text-gray-400">
            Hoy es Miércoles, 21 de Enero 2026
          </p>
        </div>
      </div>

      {/* Modal de información */}
      {mostrarModal && (
        <dialog className="modal modal-open">
          <div className="modal-box max-w-lg">
            <h3 className="font-bold text-lg mb-4">Información</h3>
            <div className="divider"></div>
            <div className="max-h-[350px] overflow-y-auto">
              <span className="text-info font-bold">Instrucciones</span>
              <ol className="list-inside space-y-2 text-sm bt-4 ml-5">
                <li>✅ Activa tu ubicación GPS.</li>
                <li>✅ Asegúrate de estar dentro del radio de 30 metros de tu lugar de trabajo.</li>
                <li>✅ Elige tu horario de asistencia.</li>
                <li>✅ Confirma con un clic en el botón.</li>
                <li>✅ Marcación obligatoria: entrada + salida</li>
              </ol>
              <br />
              <span className="text-warning font-bold">Reglas</span>
              <ol className="list-inside space-y-2 text-sm ml-5">
                <li>⏰ 10 min de tolerancia máxima sin descuento.</li>
                <li>
                  💰 Tras los 10 minutos: descuento por cada minuto adicional de
                  retardo.
                </li>
                <li>📊 3 tardanzas en el mes = 1 falta automática.</li>
                <li>🚫 Salida anticipada solo con autorización</li>
              </ol>
            </div>

            {/* Contenido de Instrucciones */}
            <div className="tab-content hidden">
              <div className="space-y-4">
                <p className="font-medium">Instrucciones:</p>
                <ol className="list-decimal list-inside space-y-2 text-sm"></ol>
              </div>
            </div>
            <div className="modal-action">
              <button
                className="btn btn-outline text-secondary"
                onClick={() => setMostrarModal(false)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </dialog>
      )}
    </div>
  );
}

export default MarcarAsistenciaPage;

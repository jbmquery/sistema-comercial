// sistema_servicio/src/pages/MarcarAsistenciaPage.jsx
import React, { useState, useEffect } from "react";
import api from "../api";
import HeaderCom from "../components/header_com.jsx";
import { useMutation } from "@tanstack/react-query";
import { marcarAsistencia } from "../api";



function distanciaMetros(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const toRad = (x) => (x * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function MarcarAsistenciaPage() {
  const [mostrarModal, setMostrarModal] = useState(false);
  //Estados para traer los datos de marcacion (sedes,ubicacion y turnos)
  const [ubicacion, setUbicacion] = useState(null);
  const [sedeActual, setSedeActual] = useState(null);
  const [turnos, setTurnos] = useState([]);
  const [turnoSeleccionado, setTurnoSeleccionado] = useState("");
  const botonActivo = sedeActual && turnoSeleccionado;

  const fecha = new Date();
  const dia = fecha.getDate();
  const mes = fecha.toLocaleString("es-PE", { month: "long" }).toUpperCase();
  const texto = fecha.toLocaleDateString("es-PE", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUbicacion({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        });
      },
      () => alert("Activa tu GPS"),
      { enableHighAccuracy: true },
    );
  }, []);

  useEffect(() => {
    if (!ubicacion) return;

    api.get("/api/sedes").then((res) => {
      const sedes = res.data.sedes;

      let sedeEncontrada = null;

      for (const sede of sedes) {
        const d = distanciaMetros(
          ubicacion.lat,
          ubicacion.lon,
          sede.latitud,
          sede.longitud,
        );

        if (d <= 30) {
          sedeEncontrada = sede;
          break;
        }
      }

      setSedeActual(sedeEncontrada);
    });
  }, [ubicacion]);

  useEffect(() => {
    if (!sedeActual) return;

    api
      .get("/api/turnos", {
        params: { id_sede: sedeActual.id_sede },
      })
      .then((res) => setTurnos(res.data.turnos));
  }, [sedeActual]);

// HOOK DE MARCACIÓN

  const marcarMutation = useMutation({
    mutationFn: marcarAsistencia,
    onSuccess: (data) => {
      alert(data.message);
    },
    onError: (err) => {
      alert(err.response?.data?.message || "Error al marcar");
    }
  });


  return (
    <div className="w-full shadow-md">
      <HeaderCom />
      <div className="bg-neutral-800 flex flex-col items-center min-h-screen">
        <div className=" flex flex-col md:flex-row justify-center items-center text-white mb-10 mt-10 lg:mt-15">
          <span className="text-xl md:mr-2">Asistencia Sede</span>
          <span className="text-2xl font-bold">
            {sedeActual ? sedeActual.nombre : "Fuera de rango"}
          </span>
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
            <div
              onClick={() => {
                if (!botonActivo) return;

                marcarMutation.mutate({
                  id_turno: turnoSeleccionado,
                  id_sede: sedeActual.id_sede
                });
              }}
              className={`btn flex flex-row justify-center w-45 h-45 rounded-full items-center transition-transform duration-300 ${
                botonActivo
                  ? "bg-primary cursor-pointer hover:scale-105"
                  : "bg-gray-600 opacity-50 cursor-not-allowed"
              }`}
            >

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
                <span className="text-4xl font-bold text-white">{dia}</span>
                <span className="text-white">{mes}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-10 flex flex-row items-center">
          <select
            className="select select-bordered my-2 mx-3 bg-neutral-800"
            value={turnoSeleccionado}
            onChange={(e) => setTurnoSeleccionado(e.target.value)}
            disabled={!sedeActual}
          >
            <option value="">Selecciona Horario</option>
            {turnos.map((t) => (
              <option key={t.id_turno} value={t.id_turno}>
                {t.inicio} - {t.fin}
              </option>
            ))}
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
            Hoy es {texto}
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
                <li>
                  ✅ Asegúrate de estar dentro del radio de 30 metros de tu
                  lugar de trabajo.
                </li>
                <li>✅ Elige tu horario de asistencia.</li>
                 <li>
                  ✅ Registro habilitado 30 minutos antes del turno seleccionado.
                </li>
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
                <li>⚠️ En caso de no marcar su SALIDA, el sistema la considerará como FALTA</li>
              </ol>
              <br />
              <span className="text-secondary font-bold">Advertencia</span>
              <ol className="list-inside space-y-2 text-sm ml-5">
                <li>‼️ El registro de asistencia es responsabilidad individual y definitiva; al ser un proceso automático, el sistema no permite ajustes manuales ni reclamaciones por omisión de registro ‼️</li>
              </ol>
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

// sistema_servicio/src/pages/InfoAsistenciasPage.jsx
import React from "react";
import { useQuery } from "@tanstack/react-query";
import HeaderCom from "../components/header_com.jsx";
import Sidebar from "../components/SiderbarInfo.jsx";
import { getMisAsistencias } from "../api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
} from "recharts";

function InfoAsistenciasPage() {
  const { data: asistencias = [], isLoading } = useQuery({
    queryKey: ["mis-asistencias"],
    queryFn: getMisAsistencias,
  });

  //Preparacion para grafica de lineas
  const dataLinea = [...asistencias]
    .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
    .map((a) => ({
      fecha: a.fecha,
      minutos: a.minutos_tarde,
    }));

  //preparacuion para grafica de barras
  const estadosBase = [
    "puntual",
    "tarde",
    "justificado",
    "falta",
    "vacaciones",
    "licencia con goce",
    "licencia sin goce",
  ];

  const dataEstados = estadosBase.map((estado) => ({
    estado,
    total: asistencias.filter((a) => a.estado === estado).length,
  }));

  //preparacion para grafica de barras por semana
  const diasSemana = [
    "Domingo",
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
  ];

  const dataDias = diasSemana.map((dia, index) => ({
    dia,
    minutos: asistencias
      .filter((a) => new Date(a.fecha).getDay() === index)
      .reduce((acc, a) => acc + a.minutos_tarde, 0),
  }));

  if (isLoading) {
    return (
      <div className="w-full shadow-md h-screen bg-neutral-800">
        <HeaderCom />
        <div className="flex flex-col md:flex-row w-full">
          <div className="drawer lg:drawer-open w-full">
            <input id="my-drawer-3" type="checkbox" className="drawer-toggle" />
            {/* CONTENIDO PRINCIPAL */}
            <div className="drawer-content p-4 w-full">
              <label
                htmlFor="my-drawer-3"
                className="drawer-button btn btn-outline text-primary lg:hidden mb-4"
              >
                ☰
              </label>
              <div className="flex flex-row justify-center text-center">
                <span className="loading loading-bars loading-md"></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full shadow-md">
      <HeaderCom />
      <div className="flex flex-col md:flex-row w-full bg-neutral-800">
        <div className="drawer lg:drawer-open w-full">
          <input id="my-drawer-3" type="checkbox" className="drawer-toggle" />
          {/* CONTENIDO PRINCIPAL */}
          <div className="drawer-content p-4 w-full">
            <label
              htmlFor="my-drawer-3"
              className="drawer-button btn btn-outline text-primary lg:hidden mb-4"
            >
              ☰
            </label>
            <h1 className="text-2xl font-bold mb-4">Resumen de Marcaciones</h1>
            <div>
              {/*GRAFICOS DE MARCACIONES */}
              <div className="grid grid-cols-1 lg:grid-cols-7 gap-3">
                <div className="col-span-1 lg:col-span-3 h-65 bg-black rounded-lg p-3">
                  <h3 className="text-sm text-gray-300 mb-2">
                    Evolución de tardanzas
                  </h3>

                  <ResponsiveContainer width="100%" height="90%">
                    <LineChart data={dataLinea}>
                      <XAxis dataKey="fecha" stroke="#aaa" />
                      <YAxis stroke="#aaaa" />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="minutos"
                        stroke="#ff0303ff"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="col-span-1 lg:col-span-2 h-65 bg-black rounded-lg p-3">
                  <h3 className="text-sm text-gray-300 mb-2">
                    Estados de asistencia
                  </h3>

                  <ResponsiveContainer width="100%" height="90%">
                    <BarChart data={dataEstados}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="estado" stroke="#aaa" />
                      <YAxis stroke="#aaa" />
                      <Tooltip />
                      <Bar dataKey="total" fill="#60a5fa" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="col-span-1 lg:col-span-2 h-65 bg-black rounded-lg p-3">
                  <h3 className="text-sm text-gray-300 mb-2">
                    Tardanzas por día
                  </h3>

                  <ResponsiveContainer width="100%" height="90%">
                    <BarChart data={dataDias}>
                      <XAxis dataKey="dia" stroke="#aaa" />
                      <YAxis stroke="#aaa" />
                      <Tooltip />
                      <Bar dataKey="minutos" fill="#fbbf24" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="mb-4">
                <select className="select select-bordered mt-4 bg-neutral-800">
                  <option value="ultimas_marcaciones">Selecciona Mes</option>
                  <option value="marcaciones_mes">2026 - Enero</option>
                </select>
              </div>
              {/*TABLA DE MARCACIONES */}
              <div className="overflow-x-auto select-none max-h-[400px] overflow-y-auto">
                <table className="table bg-black">
                  <thead className="sticky top-0 z-0 bg-black shadow-md">
                    <tr>
                      <th className="min-w-30">Sede</th>
                      <th className="min-w-30">Turno</th>
                      <th className="min-w-30">Fecha</th>
                      <th>Hora Entrada</th>
                      <th>Hora Salida</th>
                      <th>Estado</th>
                      <th>Minutos tardes</th>
                      <th>Observación</th>
                    </tr>
                  </thead>
                  <tbody>
                    {asistencias.map((a, i) => (
                      <tr key={i}>
                        <td>{a.sede}</td>
                        <td>{a.turno}</td>
                        <td>{a.fecha}</td>
                        <td>{a.hora_entrada}</td>
                        <td>{a.hora_salida}</td>
                        <td
                          className={
                            a.estado === "tarde"
                              ? "text-secondary"
                              : a.estado === "justificado"
                                ? "text-warning"
                                : "text-accent"
                          }
                        >
                          {a.estado}
                        </td>
                        <td
                          className={
                            a.minutos_tarde > 0 ? "text-secondary" : ""
                          }
                        >
                          {a.minutos_tarde}
                        </td>
                        <td>{a.observacion}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <Sidebar activePage="asistencias" />
        </div>
      </div>
    </div>
  );
}

export default InfoAsistenciasPage;

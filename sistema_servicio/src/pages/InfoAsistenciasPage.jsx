import React from "react";
import HeaderCom from "../components/header_com.jsx";
import Sidebar from "../components/SiderbarInfo.jsx";

function InfoAsistenciasPage() {
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
                <div className="col-span-1 lg:col-span-3 h-65 bg-black rounded-lg">grafico de Lineas</div>
                <div className="col-span-1 lg:col-span-2 h-65 bg-black rounded-lg">grafico de barras</div>
                <div className="col-span-1 lg:col-span-2 h-65 bg-black rounded-lg">grafico de indicador</div>
              </div>
              <div className="mb-4">
                <select className="select select-bordered mt-4 bg-neutral-800">
                    <option value="ultimas_marcaciones">Selecciona Mes</option>
                    <option value="marcaciones_mes">Enero</option>
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
                    <tr>
                      <td>PLuvia Km22</td>
                      <td>16:00Hrs-23:00Hrs</td>
                      <td>2026-01-10</td>
                      <td>16:01</td>
                      <td>23:04</td>
                      <td className="text-accent">puntual</td>
                      <td>0</td>
                      <td></td>
                    </tr>
                    <tr>
                      <td>PLuvia Km22</td>
                      <td>16:00Hrs-23:00Hrs</td>
                      <td>2026-01-11</td>
                      <td>16:20</td>
                      <td>23:10</td>
                      <td className="text-secondary">tarde</td>
                      <td className="text-secondary">10</td>
                      <td></td>
                    </tr>
                                        <tr>
                      <td>PLuvia Km22</td>
                      <td>16:00Hrs-23:00Hrs</td>
                      <td>2026-01-13</td>
                      <td>16:05</td>
                      <td>23:01</td>
                      <td className="text-accent">puntual</td>
                      <td>0</td>
                      <td></td>
                    </tr>
                    <tr>
                      <td>PLuvia Km22</td>
                      <td>16:00Hrs-23:00Hrs</td>
                      <td>2026-01-14</td>
                      <td>16:00</td>
                      <td>23:00</td>
                      <td className="text-accent">puntual</td>
                      <td>0</td>
                      <td></td>
                    </tr>
                    <tr>
                      <td>PLuvia Km22</td>
                      <td>16:00Hrs-23:00Hrs</td>
                      <td>2026-01-16</td>
                      <td>-</td>
                      <td>-</td>
                      <td className="text-warning">justificado</td>
                      <td>0</td>
                      <td>Cita Médica</td>
                    </tr>
                    <tr>
                      <td>PLuvia Km22</td>
                      <td>16:00Hrs-23:00Hrs</td>
                      <td>2026-01-17</td>
                      <td>16:01</td>
                      <td>23:15</td>
                      <td className="text-accent">puntual</td>
                      <td>0</td>
                      <td></td>
                    </tr>
                    <tr>
                      <td>PLuvia Km22</td>
                      <td>16:00Hrs-23:00Hrs</td>
                      <td>2026-01-18</td>
                      <td>16:00</td>
                      <td>23:05</td>
                      <td className="text-accent">puntual</td>
                      <td>0</td>
                      <td></td>
                    </tr>
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

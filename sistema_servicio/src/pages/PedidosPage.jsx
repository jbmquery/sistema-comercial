import Cards from "../components/cards";
import HeaderNav from "../components/header_nav";

function PedidosPage() {
  return (
    <div className="flex flex-col justify-center items-center">
      <HeaderNav />
      <div className="pt-10 w-full max-w-4xl px-4">
        {/* Collapse - Orden 1 */}
        <div className="collapse bg-base-100 border-base-300 border mb-4">
          <input type="checkbox" />
          <div className="collapse-title font-semibold flex flex-row justify-left md:justify-between items-center gap-3 !pr-4 pr-12">
            <div className="flex flex-row justify-center items-center gap-5">
              <span>Mesa 1</span>
              <button className="btn btn-xs">
                <svg
                  width="16"
                  height="16"
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
                <span className="hidden md:inline">Agregar</span>
              </button>
            </div>
            <div className="flex flex-row justify-center items-center gap-5">
              <button className="btn btn-xs">
                <svg
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M3 6h18" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
                <span className="hidden md:inline">Eliminar</span>
              </button>
              <button className="btn btn-xs btn-dash btn-warning">Proceso</button>
            </div>
          </div>

          {/* ✅ Contenido con scroll horizontal optimizado para móviles */}
          <div className="collapse-content p-0">
            <div className="overflow-x-auto touch-pan-x scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
              <table className="table table-compact w-full min-w-[640px]">
                <thead>
                  <tr className="text-center bg-base-200">
                    <th className="whitespace-nowrap">Cant.</th>
                    <th className="whitespace-nowrap">Nombre Producto</th>
                    <th className="whitespace-nowrap">Estado</th>
                    <th className="whitespace-nowrap">Precio Unit.</th>
                    <th className="whitespace-nowrap">Observación</th>
                    <th className="whitespace-nowrap">Configuraciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-base-200">
                    <td className="text-center">4</td>
                    <td>Americano Frio</td>
                    <td className="flex justify-center">
                      <button className="btn btn-xs btn-active btn-success">Listo</button>
                    </td>
                    <td className="text-center">5.50</td>
                    <td>Sin leche, extra hielo</td>
                    <td className="flex justify-center gap-2">
                      <button className="btn btn-square btn-xs">
                        <svg
                          width="16"
                          height="16"
                          fill="none"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button className="btn btn-square btn-xs">
                        <svg
                          width="16"
                          height="16"
                          fill="none"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M3 6h18" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                  <tr className="bg-base-100">
                    <td className="text-center">1</td>
                    <td>Espresso</td>
                    <td className="flex justify-center">
                      <button className="btn btn-xs btn-active btn-success">Listo</button>
                    </td>
                    <td className="text-center">3.50</td>
                    <td></td>
                    <td className="flex justify-center gap-2">
                      <button className="btn btn-square btn-xs">
                        <svg
                          width="16"
                          height="16"
                          fill="none"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button className="btn btn-square btn-xs">
                        <svg
                          width="16"
                          height="16"
                          fill="none"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M3 6h18" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                  <tr className="bg-base-100">
                    <td className="text-center">2</td>
                    <td>Frappe de Menta (12 Oz)</td>
                    <td className="flex justify-center">
                      <button className="btn btn-xs btn-active">Pendiente</button>
                    </td>
                    <td className="text-center">13.00</td>
                    <td></td>
                    <td className="flex justify-center gap-2">
                      <button className="btn btn-square btn-xs">
                        <svg
                          width="16"
                          height="16"
                          fill="none"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button className="btn btn-square btn-xs">
                        <svg
                          width="16"
                          height="16"
                          fill="none"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M3 6h18" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                  <tr className="bg-base-100">
                    <td className="text-center">6</td>
                    <td>Frappe de Menta (16 Oz)</td>
                    <td className="flex justify-center">
                      <button className="btn btn-xs btn-active">Pendiente</button>
                    </td>
                    <td className="text-center">14.50</td>
                    <td></td>
                    <td className="flex justify-center gap-2">
                      <button className="btn btn-square btn-xs">
                        <svg
                          width="16"
                          height="16"
                          fill="none"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button className="btn btn-square btn-xs">
                        <svg
                          width="16"
                          height="16"
                          fill="none"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M3 6h18" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Collapse - Orden 2 */}
        <div className="collapse bg-base-100 border-base-300 border mb-4">
          <input type="checkbox" />
          <div className="collapse-title font-semibold flex flex-row justify-left md:justify-between items-center gap-3 !pr-4 pr-12">
            <div className="flex flex-row justify-center items-center gap-5">
              <span>Mesa 5</span>
              <button className="btn btn-xs">
                <svg
                  width="16"
                  height="16"
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
                <span className="hidden md:inline">Agregar</span>
              </button>
            </div>
            <div className="flex flex-row justify-center items-center gap-5">
              <button className="btn btn-xs">
                <svg
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M3 6h18" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
                <span className="hidden md:inline">Eliminar</span>
              </button>
              <button className="btn btn-xs btn-dash">Sin iniciar</button>
            </div>
          </div>

          {/* ✅ Contenido con scroll horizontal optimizado para móviles */}
          <div className="collapse-content p-0">
            <div className="overflow-x-auto touch-pan-x scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
              <table className="table table-compact w-full min-w-[640px]">
                <thead>
                  <tr className="text-center bg-base-200">
                    <th className="whitespace-nowrap">Cant.</th>
                    <th className="whitespace-nowrap">Nombre Producto</th>
                    <th className="whitespace-nowrap">Estado</th>
                    <th className="whitespace-nowrap">Precio Unit.</th>
                    <th className="whitespace-nowrap">Observación</th>
                    <th className="whitespace-nowrap">Configuraciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-base-200">
                    <td className="text-center">4</td>
                    <td>Americano Frio</td>
                    <td className="flex justify-center">
                      <button className="btn btn-xs btn-active">pendiente</button>
                    </td>
                    <td className="text-center">5.50</td>
                    <td>Sin leche, extra hielo</td>
                    <td className="flex justify-center gap-2">
                      <button className="btn btn-square btn-xs">
                        <svg
                          width="16"
                          height="16"
                          fill="none"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button className="btn btn-square btn-xs">
                        <svg
                          width="16"
                          height="16"
                          fill="none"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M3 6h18" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PedidosPage;
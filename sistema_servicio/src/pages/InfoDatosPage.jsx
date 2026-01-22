import React from "react";
import HeaderCom from "../components/header_com.jsx";
import SiderbarInfo from "../components/SiderbarInfo.jsx";

function InfoDatosPage() {
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
          <h1 className="text-2xl font-bold mb-6">Información Personal</h1>
          <div className="w-full items-center">
            <div className="max-w-5xl mx-auto">
              <table className="table bg-black">
                <thead>
                  <tr>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="hover:bg-neutral-700">
                    <td className="flex flex-row gap-4 items-center ">
                      <div className="w-10 md:w-15 items-center justify-center flex">
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
                            d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                          />
                        </svg>
                      </div>
                      <div className="flex flex-col text-base md:text-lg">
                        <span className="font-bold">Nombre</span>
                        <span>Jheferson Blanco Martín</span>
                      </div>
                    </td>
                  </tr>
                  <tr className="hover:bg-neutral-700">
                    <td className="flex flex-row gap-4 items-center text-lg">
                      <div className="w-10 md:w-15 items-center justify-center flex">
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
                            d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z"
                          />
                        </svg>
                      </div>
                      <div className="flex flex-col text-base md:text-lg">
                        <span className="font-bold">Apodo</span>
                        <span>Shandey</span>
                      </div>
                    </td>
                  </tr>
                  <tr className="hover:bg-neutral-700">
                    <td className="flex flex-row gap-4 items-center text-lg">
                      <div className="w-10 md:w-15 items-center justify-center flex">
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
                            d="M16.5 12a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Zm0 0c0 1.657 1.007 3 2.25 3S21 13.657 21 12a9 9 0 1 0-2.636 6.364M16.5 12V8.25"
                          />
                        </svg>
                      </div>
                      <div className="flex flex-col text-base md:text-lg">
                        <span className="font-bold">Correo</span>
                        <span>jhefersonbm.query@gmail.com</span>
                      </div>
                    </td>
                  </tr>
                  <tr className="hover:bg-neutral-700">
                    <td className="flex flex-row gap-4 items-center text-lg">
                      <div className="w-10 md:w-15 items-center justify-center flex">
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
                            d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z"
                          />
                        </svg>
                      </div>
                      <div className="flex flex-col text-base md:text-lg">
                        <span className="font-bold">Celular</span>
                        <span>+51 987654321</span>
                      </div>
                    </td>
                  </tr>
                  <tr className="hover:bg-neutral-700">
                    <td className="flex flex-row gap-4 items-center text-lg">
                      <div className="w-10 md:w-15 items-center justify-center flex">
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
                            d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.871c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513M15 8.25v-1.5m-6 1.5v-1.5m12 9.75-1.5.75a3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0L3 16.5m15-3.379a48.474 48.474 0 0 0-6-.371c-2.032 0-4.034.126-6 .371m12 0c.39.049.777.102 1.163.16 1.07.16 1.837 1.094 1.837 2.175v5.169c0 .621-.504 1.125-1.125 1.125H4.125A1.125 1.125 0 0 1 3 20.625v-5.17c0-1.08.768-2.014 1.837-2.174A47.78 47.78 0 0 1 6 13.12M12.265 3.11a.375.375 0 1 1-.53 0L12 2.845l.265.265Zm-3 0a.375.375 0 1 1-.53 0L9 2.845l.265.265Zm6 0a.375.375 0 1 1-.53 0L15 2.845l.265.265Z"
                          />
                        </svg>
                      </div>
                      <div className="flex flex-col text-base md:text-lg">
                        <span className="font-bold">Fecha de nacimiento</span>
                        <span>12 de marzo de 2000</span>
                      </div>
                    </td>
                  </tr>
                  <tr className="hover:bg-neutral-700">
                    <td className="flex flex-row gap-4 items-center text-lg">
                      <div className="w-10 md:w-15 items-center justify-center flex">
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
                            d="M5.636 5.636a9 9 0 1 0 12.728 0M12 3v9"
                          />
                        </svg>
                      </div>
                      <div className="flex flex-col text-base md:text-lg">
                        <span className="font-bold">Estado</span>
                        <span>Activo</span>
                      </div>
                    </td>
                  </tr>
                  <tr className="hover:bg-neutral-700">
                    <td className="flex flex-row gap-4 items-center text-lg">
                      <div className="w-10 md:w-15 items-center justify-center flex">
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
</svg>

                      </div>
                      <div className="flex flex-col text-base md:text-lg">
                        <span className="font-bold">Fecha de Contratación</span>
                        <span>12 de marzo de 2020</span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <SiderbarInfo activePage="personales"></SiderbarInfo>
      </div>
    </div>
  );
}

export default InfoDatosPage;

import HeaderCom from "../components/header_com"
import CardsMenu from "../components/cardsmenu";
import { useLocation } from 'react-router-dom';

function Menues() {
  const location = useLocation();
  const { nombreMesa } = location.state || {};
  
  return (
    <div className="flex flex-col justify-center">
      {/*Header*/}
      <div className="w-full shadow-md">
        <HeaderCom/>
      </div>

      {/*Seccion pedido*/}
      <div className="flex flex-col md:flex-row justify-center bg-purple-500">
        {/*Seccion menu*/}
        <div className="md:w-250">
          {/*Seccion categorias*/}
          <div className="flex flex-wrap bg-red-500 justify-center items-center gap-2 py-2">
            <button className="btn md:btn-md btn-outline w-30 md:w-40 bg-secondary text-white">Bebidas</button>
            <button className="btn md:btn-md btn-outline w-30 md:w-40 bg-secondary text-white">Postres</button>
            <button className="btn md:btn-md btn-outline w-30 md:w-40 bg-secondary text-white">Topings</button>
            <button className="btn md:btn-md btn-outline w-30 md:w-40 bg-secondary text-white">Promos</button>
          </div>
          {/*Seccion busqueda*/}
          <div className="bg-yellow-200 flex flex-row justify-between py-2 px-4 items-center">
            <p>Mesa seleccionada: <b>{nombreMesa}</b></p>
            <input type="text" className="input w-35 md:w-60 lg:w-80" placeholder="Buscar" />
          </div>
          {/*Seccion productos*/}
          <div className="bg-green-300 flex w-full flex-col py-2 px-4">
            <div className="divider divider-start"><b>Café sin Leche</b></div>
            <div className="flex flex-wrap items-center justify-center gap-4 p-4 md:gap-6 lg:gap-8 md:p-6 lg:p-8 max-w-5xl">
              <CardsMenu/>
              <CardsMenu/>
            </div>
            <div className="divider divider-start"><b>Café con Leche</b></div>
            <div className="flex flex-wrap items-center justify-center gap-4 p-4 md:gap-6 lg:gap-8 md:p-6 lg:p-8 max-w-5xl">
              <CardsMenu/>
              <CardsMenu/>
            </div>
            <div className="divider divider-start"><b>Bebidas sin Café</b></div>
            <div className="flex flex-wrap items-center justify-center gap-4 p-4 md:gap-6 lg:gap-8 md:p-6 lg:p-8 max-w-5xl">
              <CardsMenu/>
              <CardsMenu/>
            </div>
            <div className="divider divider-start"><b>Bebidas con café</b></div>
            <div className="flex flex-wrap items-center justify-center gap-4 p-4 md:gap-6 lg:gap-8 md:p-6 lg:p-8 max-w-5xl">
              <CardsMenu/>
              <CardsMenu/>
            </div>
            <div className="divider divider-start"><b>Otros</b></div>

          </div>
        </div>
        {/*Seccion totales*/}
        <div className="md:w-100 bg-gray-400 py-2 px-4">
          PEDIDO:
          {/*Seccion subTotal*/}
          <div></div>
          {/*Seccion PagoTotal*/}
          <div></div>
        </div>
      </div>

      {/*Seccion confirmacion*/}
      <div flex="1" className="flex flex-row justify-center items-center p-4 md:p-6 lg:p-8 bg-cyan-200 w-full">
        <button
          type="submit" className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">Cancelar
        </button>
        <button
          type="submit" className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">Guardar
        </button>
      </div>
    </div>
  )
}

export default Menues
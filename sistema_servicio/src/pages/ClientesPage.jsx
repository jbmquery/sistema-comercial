import HeaderNav from '../components/header_nav.jsx'

function PagosPage() {
  return (
    <div className="flex flex-col justify-center items-center">
        <HeaderNav />
 {/* Contenedor principal: columna en móvil, fila en desktop */}
      <div className="flex flex-col md:flex-row w-full max-w-7xl px-4 gap-4 mt-6">
        
        {/* IZQUIERDA - Lista de pedidos */}
        <div className="bg-secondary-content p-4 rounded-lg md:w-80 flex-shrink-0">
          {/* md:w-80 = ~320px, ideal para sidebar */}
          <h3 className="font-bold mb-4">Lista de Pedidos</h3>
          {/* Aquí va tu lista de pedidos */}
          <div className="space-y-2">
            <button className="btn btn-block btn-accent">Pedido #15 - Mesa 3</button>
            <button className="btn btn-block btn-accent">Pedido #16 - Mesa 5</button>
            <button className="btn btn-block btn-accent">Pedido #17 - Mesa 7</button>
          </div>
        </div>
        {/* DERECHA - Detalle del pedido */}
        <div className="bg-blue-200 p-6 rounded-lg flex-grow">
          <h2 className="font-bold mb-4">Detalle del Pedido</h2>
          <p>Selecciona un pedido para ver su detalle y procesar el pago.</p>
          {/* Aquí va el formulario de pago, resumen, etc. */}
        </div>
      </div>
    </div>
  )
}

export default PagosPage


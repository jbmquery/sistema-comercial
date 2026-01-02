function cardsmenu({ producto, onAdd }) {
  // precio puede ser number o string; aseguramos formato
  const precioNum = producto?.precio ? Number(producto.precio) : 0;
  const precioStr = !isNaN(precioNum) ? precioNum.toFixed(2) : "0.00";
  
  return (
    <div className="card bg-white shadow-md">
        <div className="card-body flex flex-row md:flex-col items-center p-0">
            <div className="card-actions flex flex-row items-center mx-2 min-w-30 w-85 md:w-100 ">
              <p className="card-title justify-left text-black float-start text-sm">{producto.nombre}</p>
              <p className="card-title justify-center text-black float-start text-sm max-w-12 py-3 font-black">{producto.porcion} {producto.unidad_medida}</p>
              <p className="card-title justify-center text-black float-start text-sm max-w-17 min-w-17">{precioStr ? ` S/ ${precioStr}` : ""}</p>
              <div className="card-actions justify-center my-2">
                  <button className="btn btn-secondary rounded-xl" onClick={onAdd} >
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
                    <span className="hidden lg:inline">Añadir</span>
                  </button>
              </div>
            </div>
        </div>
    </div>
  )
}

export default cardsmenu
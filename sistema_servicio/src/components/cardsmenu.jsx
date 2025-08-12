function cardsmenu({ producto }) {
  // precio puede ser number o string; aseguramos formato
  const precioNum = producto?.precio ? Number(producto.precio) : null;
  const precioStr = precioNum !== null && !isNaN(precioNum) ? precioNum.toFixed(2) : "";
  
  return (
    <div className="card bg-white shadow-md">
        <div className="card-body flex flex-row md:flex-col items-center p-0 ">
            <img src={`/img/${producto.url_imagen}`} alt={producto.nombre} className="h-30 w-30 md:h-45 md:w-45 rounded-l-lg md:rounded-none md:rounded-t-lg" />
            <div className="card-actions flex flex-col items-center mx-2">
              <p className="card-title justify-center text-black float-start text-sm">{producto.nombre}</p>
              <p className="card-title justify-center text-black float-start text-sm">{producto.porcion} {producto.unidad_medida}
            {precioStr ? ` - S/ ${precioStr}` : ""}</p>
              <div className="card-actions justify-center md:mb-3">
                  <button className="btn btn-secondary rounded-full">Añadir</button>
              </div>
            </div>
        </div>
    </div>
  )
}

export default cardsmenu
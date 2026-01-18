function CardsMenu({ grupo, productos, onAdd }) {
  // Ordenar por porción ascendente (null al final)
  const productosOrdenados = [...productos].sort((a, b) => {
    if (a.porcion == null) return 1;
    if (b.porcion == null) return -1;
    return Number(a.porcion) - Number(b.porcion);
  });

  const unico = productosOrdenados.length === 1;
  const productoUnico = productosOrdenados[0];

  console.log(productos);


  return (
    <div className="card bg-black shadow-md">
      <div className="card-body flex flex-row md:flex-col items-center p-0">
        <div className="card-actions flex flex-row items-center mx-2 min-w-30 w-85 md:w-100">
          
          {/* Nombre del producto */}
          <p className="card-title text-gray-200 text-sm">
            {grupo}
          </p>

          {/* Botones dinámicos */}
          <div className="card-actions justify-center my-2 flex gap-1 md:gap-2">

            {/* CASO: UN SOLO PRODUCTO */}
            {unico ? (
              <button
                className="btn btn-info font-bold rounded-lg btn-sm min-w-13 text-white"
                disabled={!productoUnico.disponible}
                onClick={() => onAdd(productoUnico)}
              >
                <span className="">
                  {productoUnico.porcion != null
                    ? productoUnico.porcion + " " + (productoUnico.unidad_medida || "")
                    : "+"}
                </span>
              </button>
            ) : (
              /* CASO: VARIOS PRODUCTOS */
              productosOrdenados.map((prod) => (
                <button
                  key={prod.id_carta}
                  className="btn btn-info font-bold rounded-lg btn-sm text-white"
                  disabled={!prod.disponible}
                  onClick={() => onAdd(prod)}
                >
                  <span className="">
                    {prod.porcion + " " + (prod.unidad_medida || "")}
                  </span>
                </button>
              ))
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

export default CardsMenu;

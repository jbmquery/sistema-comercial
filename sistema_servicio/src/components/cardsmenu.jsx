function cardsmenu() {
  return (
    <div className="card bg-white shadow-md">
        <div className="card-body flex flex-row md:flex-col items-center p-0 ">
            <img src="../src/img/expresso.webp" alt="Pluvia Café" className="h-30 w-30 md:h-45 md:w-45 rounded-l-lg md:rounded-none md:rounded-t-lg" />
            <div className="card-actions flex flex-col items-center mx-2">
              <p className="card-title justify-center text-black float-start text-sm">Capucchino</p>
              <p className="card-title justify-center text-black float-start text-sm">12 Oz - S/ 7.00</p>
              <div className="card-actions justify-center md:mb-3">
                  <button className="btn btn-secondary rounded-full">Añadir</button>
              </div>
            </div>
        </div>
    </div>
  )
}

export default cardsmenu
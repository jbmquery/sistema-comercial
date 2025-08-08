function cardsmenu() {
  return (
    <div className="card bg-gray-300 w-30 md:w-35 lg:w-40 shadow-md">
        <div className="card-body pt-1 pb-3 flex flex-col items-center">
            <p className="card-title justify-center text-black">Expreso</p>
            <img src="../src/img/expresso.webp" alt="Pluvia Café" className="h-20 w-20 rounded-lg" />
            <div className="card-actions justify-center">
                <button className="btn btn-secondary w-27 md:w-30 lg:w-35">Pedir</button>
            </div>
        </div>
    </div>
  )
}

export default cardsmenu
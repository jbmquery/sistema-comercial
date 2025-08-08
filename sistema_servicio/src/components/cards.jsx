import React from 'react'

function cards() {
  return (
    <div className="card bg-red-950 w-30 md:w-35 lg:w-40 shadow-md">
        <div className="card-body p-3 flex flex-col items-center">
            <h3 className="card-title justify-center text-white">Mesa 1</h3>
            <img src="../src/img/ico_cafe.webp" alt="Pluvia Café" className="h-10 w-10 md:h-15 md:w-15" />
            <div className="card-actions justify-center">
                <button className="btn btn-primary w-27 md:w-30 lg:w-35">2 personas</button>
            </div>
        </div>
    </div>
  )
}

export default cards
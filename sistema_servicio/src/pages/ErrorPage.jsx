import React from 'react'

function ErrorPage() {
  return (
    <div className='flex flex-col justify-center items-center h-screen gap-4 p-8 bg-white'>
        <h1 className='text-xl md:text-3xl'><b>Uy… ¡Derramamos el café!</b></h1>
        <h2 className='text-md md:text-xl pb-10'>La página que buscas no existe o se ha roto como esta taza.</h2>
        <img src="../src/img/error_taza.webp" alt="Pluvia Café" className="h-30 md:h-50 w-auto rounded-lg" />
        <button className="btn md:btn-md btn-outline w-45 md:w-30 md:w-40 bg-secondary text-white mt-5">Volver al Inicio</button>
    </div>
  )
}

export default ErrorPage
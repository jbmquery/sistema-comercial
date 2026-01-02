// GuiaPages.jsx
import { useState, useEffect } from 'react';

function GuiaPages() {
  const [currentSlide, setCurrentSlide] = useState(1);
  const [progress, setProgress] = useState(0);
  
  // Definimos los slides con sus datos
  const slides = [
    {
      id: 1,
      title: "Hola :),",
      description: "Hola Voni, te estarás preguntando para que te envie a revisar la pagina de Pluvia. Bueno, sentí que esta sería la forma más bonita de poder llamar tu atención. Tal vez existan mejores formas, pero para un desarrollador / ingeniero de sistemas hacer una pagina web o un programita es la mejor forma de expresar lo que sentimos. Espero que te guste :)",
      image: "https://img.daisyui.com/images/stock/photo-1507358522600-9f71e620c44e.webp",
      buttonText: "Comenzar"
    },
    {
      id: 2,
      title: "Mientras",
      description: "Lees esto, te estarás preguntando que estuve haciendo abajo, y porque te pedí que no bajarás. Sorry por demorar. Tomó su tiempito hacer todo los arreglos jejeje.",
      image: "https://img.daisyui.com/images/stock/photo-1625726411847-8cbb60cc71e6.webp",
      buttonText: "Ver menú"
    },
    {
      id: 3,
      title: "Continuemos,",
      description: "Hay algo que quiero decirte hace mucho tiempo, pero estaba esperando el momento adecuado para poder decirlo. Me dirás pendejo, pero para mí era algo muy importante y quería hacerlo de la mejor forma posible.",
      image: "https://img.daisyui.com/images/stock/photo-1609621838510-5ad474b7d25d.webp",
      buttonText: "Conocer más"
    },
    {
      id: 4,
      title: "Me gustas mucho :)",
      description: "Si te habrás dado cuenta de mis sentimientos (preguntas pendejas que me gusta hacer jeejje), pero la forma en como te veo, como te abrazo, como me expreso, como te cuido y preocupo por ti. Son formas de expresarte mis sentimientos. Ya te mencioné multiples veces que cosas son las que me gustan de ti. Eres una persona increíble, hermosa, inteligente, dulce, amable, cariñosa, detallista, divertida, y muchas cosas más que me encantas de ti. Bueno la estoy haciendo larga.",
      image: "https://img.daisyui.com/images/stock/photo-1414694762283-acccc27bca85.webp",
      buttonText: "Ver detalles"
    },
    {
      id: 5,
      title: "Guía",
      description: "Una vez haz leído todo esto, Baja las escaleras por favor, pero primero anunciame que vas a bajar levantando la voz. Bueno te espero abajo :)",
      image: "https://img.daisyui.com/images/stock/photo-1414694762283-acccc27bca85.webp",
      buttonText: "Ver detalles"
    }
  ];

  // Actualizar el progreso según el slide actual
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + 1;
        if (newProgress >= 100) {
          // Pasar al siguiente slide cuando el progreso llegue al 100%
          const nextSlide = currentSlide === slides.length ? 1 : currentSlide + 1;
          setCurrentSlide(nextSlide);
          return 0;
        }
        return newProgress;
      });
    }, 1000); // Ajusta este valor para cambiar la velocidad del progreso

    return () => clearInterval(timer);
  }, [currentSlide, slides.length]);

  // Reiniciar progreso cuando cambia el slide
  useEffect(() => {
    setProgress(0);
  }, [currentSlide]);

  // Manejar cambios de slide
  const handleSlideChange = (slideId) => {
    setCurrentSlide(slideId);
    setProgress(0);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Indicador de progreso en la parte superior (sobrepuesto) */}
      <div className="absolute top-4 w-full z-20">
        <div className="max-w-md mx-auto px-4">
          <ul className="steps steps-horizontal w-full">
            {slides.map((slide) => (
              <li 
                key={slide.id}
                className={`step ${currentSlide >= slide.id ? 'step-primary' : ''}`}
                onClick={() => handleSlideChange(slide.id)}
              >
                {slide.id}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Carrusel de heros */}
      <div className="carousel carousel-vertical md:carousel-horizontal w-full h-screen">
        {slides.map((slide) => (
          <div 
            id={`slide${slide.id}`} 
            key={slide.id}
            className={`carousel-item relative w-full h-full ${currentSlide === slide.id ? 'block' : 'hidden md:block'}`}
          >
            {/* Imagen de fondo */}
            <div 
              className="hero min-h-screen w-full"
              style={{ 
                backgroundImage: `url(${slide.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              <div className="hero-overlay bg-opacity-60"></div>
              
              {/* Contenido */}
              <div className="hero-content text-neutral-content text-center p-4 md:p-8">
                <div className="max-w-xl">
                  <h1 className="mb-4 text-3xl md:text-5xl font-bold drop-shadow-lg">
                    {slide.title}
                  </h1>
                  <p className="mb-6 text-base md:text-lg drop-shadow">
                    {slide.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Botones de navegación */}
            <div className="absolute left-4 right-4 bottom-20 md:bottom-auto md:top-1/2 flex justify-between transform -translate-y-1/2 z-10">
              <a 
                href={`#slide${slide.id === 1 ? slides.length : slide.id - 1}`} 
                className="btn btn-circle btn-primary btn-lg opacity-80 hover:opacity-100"
                onClick={() => handleSlideChange(slide.id === 1 ? slides.length : slide.id - 1)}
              >
                ❮
              </a>
              <a 
                href={`#slide${slide.id === slides.length ? 1 : slide.id + 1}`} 
                className="btn btn-circle btn-primary btn-lg opacity-80 hover:opacity-100"
                onClick={() => handleSlideChange(slide.id === slides.length ? 1 : slide.id + 1)}
              >
                ❯
              </a>
            </div>
            
            {/* Indicador de progreso */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-4/5 max-w-md z-20">
              <div className="bg-base-200 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-primary h-2 transition-all duration-500" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default GuiaPages;
import { useState} from 'react';
import { useNavigate } from 'react-router-dom';

{/*import { useState, useEffect } from 'react';*/}


function LoginPage() {
  
  {/*const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/users')
      .then(response => response.json())
      .then(data => setUsers(data.users))
  });*/}

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      if (data.success) {
        navigate('/tables'); // Redirige a la página de tablas
        alert("Login exitoso");
        // Aquí puedes redirigir, guardar token, etc.
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
    }
  };

  
  return (
    <div className="flex justify-center h-screen px-6 py-12 lg:px-8 bg-black bg-[url('../src/img/portada_web4.png')]  bg-cover bg-center">
      {/* CARD */}
      <div className="px-4 py-7 lg:px-8 bg-neutral-900 h-100 w-70 md:w-85 flex flex-col justify-center items-center rounded-4xl shadow-lg">
        {/* LOGO */}
        <div className="mx-auto w-full max-w-sm">
          <img className="mx-auto h-auto w-20" alt="Pluvia Café" src="../src/img/logo_pluvia_blanco_completo.webp"/>
        </div>
        
        <div className="mt-10 mx-auto w-full max-w-sm">
          <form onSubmit={handleLogin} className="space-y-6">
            {/* CORREO ELECTRONICO */}
            <div>
              <div className="mt-2">
                <input id="email" name="email" type="email" required autoComplete="email" className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6" placeholder="Correo Electrónico" value={email} onChange={(e) => setEmail(e.target.value)}/>
              </div>
            </div>
            {/* CONTRASEÑA */}
            <div>
              <div className="mt-2">
                <input id="password" name="password" type="password" required autoComplete="current-password" className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)}/>
              </div>
            </div>
            {/* BOTON INGRESO */}
            <div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">Ingresar
              </button>
            </div>
          </form>
        </div>
      </div>  
    </div>
  )
}

export default LoginPage
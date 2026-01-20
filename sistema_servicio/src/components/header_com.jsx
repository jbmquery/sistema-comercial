// sistema_servicio/src/components/header_com.jsx
import { Link } from "react-router-dom";

function HeaderCom() {
  return (
    <header className="flex justify-center py-4 bg-black">
        <Link to='/tables'>
          <img src="../src/img/logo_pluvia_blanco.webp" alt="Pluvia Café" className="h-12" />
        </Link>
    </header>
  )
}

export default HeaderCom
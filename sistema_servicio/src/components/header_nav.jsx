// sistema_servicio/src/components/header_nav.jsx
import HeaderCom from "./header_com";
import { Link } from "react-router-dom";

export default function HeaderNav() {
  return (
    <div className="w-full shadow-md">
      <HeaderCom/>
      <nav className="flex flex-wrap items-center gap-2 xl:gap-10 py-3 md:py-1 md:flex-row justify-center bg-black">
        <Link className="link btn btn-md xl:btn-lg btn-outline w-20 md:w-40 bg-black text-white" to='/tables'>Mesas</Link>
        <Link className="link btn btn-md xl:btn-lg btn-outline w-20 md:w-40 bg-black text-white" to='/orden'>Orden</Link>
        <Link className="link btn btn-md xl:btn-lg btn-outline w-20 md:w-40 bg-black text-white" to='/ventas_dia'>Ventas</Link>
        <Link className="link btn btn-md xl:btn-lg btn-outline w-20 md:w-40 bg-black text-white" to='/edit-tables'>Admin</Link>
      </nav>
    </div>
  );
}
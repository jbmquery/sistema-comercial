import HeaderCom from "./header_com";
import { Link } from "react-router-dom";

export default function HeaderNav() {
  return (
    <div className="w-full shadow-md">
      <HeaderCom/>
      <nav className="flex flex-wrap items-center gap-2 lg:gap-10 border-t py-3 md:py-1 md:flex-row justify-center bg-secondary md:bg-secondary-content">
        <Link className="link btn btn-md lg:btn-lg btn-outline w-35 md:w-40 bg-secondary text-white" to='/tables'>Mesas</Link>
        <Link className="link btn btn-md lg:btn-lg btn-outline w-35 md:w-40 bg-secondary text-white" to='/delivery'>Para llevar</Link>
        <Link className="link btn btn-md lg:btn-lg btn-outline w-35 md:w-40 bg-secondary text-white" to='/pedidos'>Pedidos</Link>
        <Link className="link btn btn-md lg:btn-lg btn-outline w-35 md:w-40 bg-secondary text-white" to='/pagos'>Pagos</Link>
        <Link className="link btn btn-md lg:btn-lg btn-outline w-35 md:w-40 bg-secondary text-white" to='/pedidos'>Clientes</Link>
        <Link className="link btn btn-md lg:btn-lg btn-outline w-35 md:w-40 bg-secondary text-white" to='/settings'>Ajustes</Link>
      </nav>
    </div>
  );
}
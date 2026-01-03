import { Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage.jsx';
import TablesPage from './pages/TablesPage.jsx';
import Menues from './pages/MenuPage.jsx';
import ErrorPage from './pages/ErrorPage.jsx';
import PedidosPage from './pages/PedidosPage.jsx';
import PagosPage from './pages/PagosPage.jsx';
import VentasDiaPage from './pages/VentasDiaPage.jsx';
import ClientesPage from './pages/ClientesPage.jsx';
import GuiaPages from './pages/GuiaPage.jsx';
import CartaPage from './pages/CartaPage.jsx';
import EditTablesPage from './pages/EditTablesPage.jsx';

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/tables" element={<TablesPage />} />
        <Route path="/menues" element={<Menues />} />
        <Route path="/pedidos" element={<PedidosPage />} />
        <Route path="/pagos" element={<PagosPage/>} />
        <Route path="/ventas_dia" element={<VentasDiaPage/>} />
        <Route path="/clientes" element={<ClientesPage/>} />
        <Route path="/guia" element={<GuiaPages/>} />
        <Route path="/carta" element={<CartaPage/>} />
        <Route path="*" element={<ErrorPage />} />
        <Route path="/admin_settings" element={<EditTablesPage/>} />
      </Routes>
    </div>
  );
}

export default App
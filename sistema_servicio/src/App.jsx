import { Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage.jsx';
import TablesPage from './pages/TablesPage.jsx';
import Menues from './pages/MenuPage.jsx';
import ErrorPage from './pages/ErrorPage.jsx';
import PedidosPage from './pages/PedidosPage.jsx';
import PagosPage from './pages/PagosPage.jsx';

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/tables" element={<TablesPage />} />
        <Route path="/menues" element={<Menues />} />
        <Route path="/pedidos" element={<PedidosPage />} />
        <Route path="/pagos" element={<PagosPage/>} />
        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </div>
  );
}

export default App
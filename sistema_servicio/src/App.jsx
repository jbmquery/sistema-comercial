// sistema_servicio/src/App.jsx
import { Routes, Route } from 'react-router-dom';
import PrivateRoute from '../../server-flask/src/routes/PrivateRoute.jsx';
import LoginPage from './pages/LoginPage.jsx';
import TablesPage from './pages/TablesPage.jsx';
import Menues from './pages/MenuPage.jsx';
import ErrorPage from './pages/ErrorPage.jsx';
import VentasDiaPage from './pages/VentasDiaPage.jsx';
import ClientesPage from './pages/ClientesPage.jsx';
import GuiaPages from './pages/GuiaPage.jsx';
import CartaPage from './pages/CartaPage.jsx';
import EditTablesPage from './pages/EditTablesPage.jsx';
import EditCartaPage from './pages/EditCartaPage.jsx';
import OrdenPage from './pages/OrdenPage.jsx';
import MarcarAsistenciaPage from './pages/MarcarAsistenciaPage.jsx';
import InfoDatosPage from './pages/InfoDatosPage.jsx';
import InfoAsistenciasPage from './pages/InfoAsistenciasPage.jsx';
import InfoDescuentosPage from './pages/InfoDescuentosPage.jsx';

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        {/* Rutas protegidas */}
        <Route element={<PrivateRoute />}>
          {/* Rutas protegidas - operaciones */}
          <Route path="/tables" element={<TablesPage />} />
          <Route path="/menues" element={<Menues />} />
          <Route path="/orden" element={<OrdenPage/>} />
          <Route path="/ventas_dia" element={<VentasDiaPage/>} />
          <Route path="/orden/:idPedido" element={<OrdenPage />} />
          <Route path="/marcar-asistencia" element={<MarcarAsistenciaPage />} />
          <Route path="/info-datos_personales" element={<InfoDatosPage />} />
          <Route path="/info-datos_asistencia" element={<InfoAsistenciasPage />} />
          <Route path="/info-datos_descuentos" element={<InfoDescuentosPage />} />
          {/* Rutas protegidas - Administracion */}
          <Route path="/clientes" element={<ClientesPage/>} />
          <Route path="/guia" element={<GuiaPages/>} />
          <Route path="/carta" element={<CartaPage/>} />
          <Route path="/edit-tables" element={<EditTablesPage/>} />
          <Route path="/edit-carta" element={<EditCartaPage/>} />
          <Route path="*" element={<ErrorPage />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App
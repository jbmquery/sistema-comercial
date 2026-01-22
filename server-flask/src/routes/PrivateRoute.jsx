/* server-flask/src/routes/PrivateRoute.jsx */
import { Navigate, Outlet } from "react-router-dom";

function PrivateRoute() {
  const refreshToken = localStorage.getItem("refreshToken");

  // Si NO hay refresh token → sesión muerta
  if (!refreshToken) {
    return <Navigate to="/" replace />;
  }

  // Si hay refresh token → deja pasar
  return <Outlet />;
}

export default PrivateRoute;

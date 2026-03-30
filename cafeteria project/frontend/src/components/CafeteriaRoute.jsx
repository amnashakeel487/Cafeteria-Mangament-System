import { Navigate, Outlet } from 'react-router-dom';

export default function CafeteriaRoute() {
  const token = localStorage.getItem('cafeteriaToken');
  return token ? <Outlet /> : <Navigate to="/cafeteria/login" replace />;
}

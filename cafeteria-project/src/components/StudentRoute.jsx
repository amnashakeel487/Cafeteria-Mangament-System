import { Navigate, Outlet } from 'react-router-dom';

export default function StudentRoute() {
  const token = localStorage.getItem('studentToken');
  
  if (!token) {
    return <Navigate to="/student/login" replace />;
  }
  
  return <Outlet />;
}

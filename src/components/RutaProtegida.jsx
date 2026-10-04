import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RutaProtegida({ children }) {
  const { alumno } = useAuth();
  const location = useLocation();

  if (!alumno) {
    return <Navigate to="/login" replace state={{ desde: location.pathname }} />;
  }
  return children;
}

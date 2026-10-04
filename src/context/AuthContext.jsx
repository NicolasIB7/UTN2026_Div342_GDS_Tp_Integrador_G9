import { createContext, useContext, useState } from 'react';
import * as api from '../api/cliente';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [alumno, setAlumno] = useState(() => api.sesionGuardada());

  const iniciarSesion = async (legajo, password) => {
    const datos = await api.login(legajo, password);
    setAlumno(datos);
  };

  const cerrarSesion = () => {
    api.logout();
    setAlumno(null);
  };

  return (
    <AuthContext.Provider value={{ alumno, iniciarSesion, cerrarSesion }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

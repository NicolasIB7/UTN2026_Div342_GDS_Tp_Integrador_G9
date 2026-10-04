import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import RutaProtegida from './components/RutaProtegida';
import Login from './pages/Login';
import Oferta from './pages/Oferta';
import DetalleMateria from './pages/DetalleMateria';
import MisInscripciones from './pages/MisInscripciones';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<RutaProtegida><Layout /></RutaProtegida>}>
        <Route path="/oferta" element={<Oferta />} />
        <Route path="/oferta/:materiaId" element={<DetalleMateria />} />
        <Route path="/inscripciones" element={<MisInscripciones />} />
      </Route>
      <Route path="*" element={<Navigate to="/oferta" replace />} />
    </Routes>
  );
}

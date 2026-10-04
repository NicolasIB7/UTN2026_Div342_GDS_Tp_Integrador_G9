import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Layout.module.css';

export default function Layout() {
  const { alumno, cerrarSesion } = useAuth();
  const navigate = useNavigate();

  const salir = () => {
    cerrarSesion();
    navigate('/login', { replace: true });
  };

  const claseLink = ({ isActive }) => (isActive ? `${styles.link} ${styles.activo}` : styles.link);

  return (
    <div className={styles.pagina}>
      <header className={styles.encabezado}>
        <div className={styles.barra}>
          <span className={styles.marca}>Autogestión</span>
          <nav className={styles.nav} aria-label="Principal">
            <NavLink to="/oferta" className={claseLink}>Oferta de materias</NavLink>
            <NavLink to="/inscripciones" className={claseLink}>Mis inscripciones</NavLink>
          </nav>
          <div className={styles.usuario}>
            <span className={styles.nombre}>
              {alumno.nombre} {alumno.apellido}
              <small>Legajo {alumno.legajo}</small>
            </span>
            <button className={styles.salir} onClick={salir}>Cerrar sesión</button>
          </div>
        </div>
      </header>
      <main className={styles.contenido}>
        <Outlet />
      </main>
    </div>
  );
}

import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Aviso from '../components/Aviso';
import styles from './Login.module.css';

export default function Login() {
  const { alumno, iniciarSesion } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [legajo, setLegajo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  if (alumno) return <Navigate to="/oferta" replace />;

  const enviar = async (e) => {
    e.preventDefault();
    if (!legajo.trim() || !password) {
      setError('Completá el legajo y la contraseña');
      return;
    }
    setError('');
    setEnviando(true);
    try {
      await iniciarSesion(legajo, password);
      navigate(location.state?.desde ?? '/oferta', { replace: true });
    } catch (err) {
      setError(err.message);
      setEnviando(false);
    }
  };

  return (
    <div className={styles.pantalla}>
      <div className={styles.tarjeta}>
        <p className={styles.sistema}>Autogestión de alumnos</p>
        <h1>Ingresá con tu legajo</h1>
        <p className={styles.bajada}>Inscripción a cursadas · 2° cuatrimestre 2026</p>

        <form className={styles.formulario} onSubmit={enviar} noValidate>
          <label className="campo">
            Legajo
            <input
              value={legajo}
              onChange={(e) => setLegajo(e.target.value)}
              inputMode="numeric"
              autoComplete="username"
            />
          </label>
          <label className="campo">
            Contraseña
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </label>

          {error && <Aviso tipo="error">{error}</Aviso>}

          <button className="boton boton-primario" type="submit" disabled={enviando}>
            {enviando ? 'Ingresando…' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  );
}

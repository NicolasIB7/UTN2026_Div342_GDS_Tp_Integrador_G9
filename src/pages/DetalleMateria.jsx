import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { inscribir, obtenerMateria } from '../api/cliente';
import Spinner from '../components/Spinner';
import Aviso from '../components/Aviso';
import Dialogo from '../components/Dialogo';
import styles from './DetalleMateria.module.css';

export default function DetalleMateria() {
  const { materiaId } = useParams();
  const [materia, setMateria] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState(null);
  const [seleccionada, setSeleccionada] = useState(null);
  const [procesando, setProcesando] = useState(false);

  const cargar = useCallback(async () => {
    try {
      setMateria(await obtenerMateria(materiaId));
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }, [materiaId]);

  useEffect(() => {
    setCargando(true);
    cargar();
  }, [cargar]);

  const confirmar = async () => {
    setProcesando(true);
    try {
      await inscribir(materia.id, seleccionada.id);
      await cargar();
      setAviso({ tipo: 'exito', texto: `Te inscribiste en ${materia.nombre}, comisión ${seleccionada.id}.` });
    } catch (err) {
      setAviso({ tipo: 'error', texto: err.message });
    } finally {
      setProcesando(false);
      setSeleccionada(null);
    }
  };

  const cerrarDialogo = useCallback(() => setSeleccionada(null), []);

  if (cargando) return <Spinner texto="Cargando materia…" />;
  if (error) return <Aviso tipo="error">{error}</Aviso>;

  return (
    <section>
      <Link to="/oferta" className={styles.volver}>← Volver a la oferta</Link>

      <div className={styles.encabezado}>
        <h1>{materia.nombre}</h1>
        <p className={styles.datos}>
          {materia.cuatrimestre}° cuatrimestre ·{' '}
          {materia.correlativasDetalle.length
            ? `Correlativas: ${materia.correlativasDetalle.map((c) => c.nombre).join(', ')}`
            : 'Sin correlativas'}
        </p>
      </div>

      {aviso && <div className={styles.aviso}><Aviso tipo={aviso.tipo}>{aviso.texto}</Aviso></div>}

      <div className={styles.tablaContenedor}>
        <table className={styles.tabla}>
          <caption className={styles.oculto}>Comisiones de {materia.nombre}</caption>
          <thead>
            <tr>
              <th>Comisión</th>
              <th className={styles.turno}>Turno</th>
              <th>Horario</th>
              <th>Cupo</th>
              <th><span className={styles.oculto}>Acción</span></th>
            </tr>
          </thead>
          <tbody>
            {materia.comisiones.map((c) => (
              <tr key={c.id}>
                <td className={styles.codigo}>{c.id}</td>
                <td className={styles.turno}>{c.turno}</td>
                <td>{c.horario}</td>
                <td>
                  <span data-testid="cupo-disponible" className={c.disponibles > 0 ? '' : styles.agotado}>
                    {c.disponibles > 0 ? `${c.disponibles} lugares` : 'Sin cupo'}
                  </span>
                </td>
                <td className={styles.accion}>
                  {materia.inscriptoEn === c.id ? (
                    <span className={styles.inscripto}>Inscripto</span>
                  ) : (
                    <button
                      className="boton boton-primario"
                      disabled={c.disponibles <= 0 || Boolean(materia.inscriptoEn)}
                      onClick={() => { setAviso(null); setSeleccionada(c); }}
                    >
                      Inscribirme
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {seleccionada && (
        <Dialogo
          titulo="Confirmar inscripción"
          textoConfirmar="Confirmar inscripción"
          procesando={procesando}
          onConfirmar={confirmar}
          onCancelar={cerrarDialogo}
        >
          Vas a inscribirte en <strong>{materia.nombre}</strong>, comisión <strong>{seleccionada.id}</strong>{' '}
          ({seleccionada.horario}).
        </Dialogo>
      )}
    </section>
  );
}

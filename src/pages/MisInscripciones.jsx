import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { darDeBaja, obtenerInscripciones } from '../api/cliente';
import Spinner from '../components/Spinner';
import Aviso from '../components/Aviso';
import Dialogo from '../components/Dialogo';
import styles from './MisInscripciones.module.css';

export default function MisInscripciones() {
  const [inscripciones, setInscripciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [aviso, setAviso] = useState(null);
  const [aBorrar, setABorrar] = useState(null);
  const [procesando, setProcesando] = useState(false);

  const cargar = useCallback(async () => {
    setInscripciones(await obtenerInscripciones());
    setCargando(false);
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const confirmarBaja = async () => {
    setProcesando(true);
    try {
      await darDeBaja(aBorrar.materiaId);
      await cargar();
      setAviso({ tipo: 'exito', texto: `Se dio de baja la inscripción a ${aBorrar.materia}.` });
    } catch (err) {
      setAviso({ tipo: 'error', texto: err.message });
    } finally {
      setProcesando(false);
      setABorrar(null);
    }
  };

  const cerrarDialogo = useCallback(() => setABorrar(null), []);

  return (
    <section>
      <h1>Mis inscripciones</h1>
      <p className={styles.bajada}>Cursadas a las que te inscribiste en este período</p>

      {aviso && <div className={styles.aviso}><Aviso tipo={aviso.tipo}>{aviso.texto}</Aviso></div>}

      {cargando && <Spinner texto="Cargando inscripciones…" />}

      {!cargando && inscripciones.length === 0 && (
        <div className={styles.vacio}>
          <p>No tenés inscripciones activas.</p>
          <Link to="/oferta">Ir a la oferta de materias</Link>
        </div>
      )}

      {!cargando && inscripciones.length > 0 && (
        <div className={styles.tablaContenedor}>
          <table className={styles.tabla}>
            <thead>
              <tr>
                <th>Materia</th>
                <th>Comisión</th>
                <th className={styles.horario}>Horario</th>
                <th><span className={styles.oculto}>Acción</span></th>
              </tr>
            </thead>
            <tbody>
              {inscripciones.map((i) => (
                <tr key={i.materiaId}>
                  <td className={styles.materia}>{i.materia}</td>
                  <td>{i.comisionId}</td>
                  <td className={styles.horario}>{i.horario}</td>
                  <td className={styles.accion}>
                    <button className="boton boton-peligro" onClick={() => { setAviso(null); setABorrar(i); }}>
                      Dar de baja
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {aBorrar && (
        <Dialogo
          titulo="Dar de baja inscripción"
          textoConfirmar="Confirmar baja"
          procesando={procesando}
          onConfirmar={confirmarBaja}
          onCancelar={cerrarDialogo}
        >
          Vas a liberar tu lugar en <strong>{aBorrar.materia}</strong>, comisión <strong>{aBorrar.comisionId}</strong>.
          Si te arrepentís, vas a tener que volver a inscribirte y depende del cupo disponible.
        </Dialogo>
      )}
    </section>
  );
}

import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { obtenerOferta } from '../api/cliente';
import Spinner from '../components/Spinner';
import Aviso from '../components/Aviso';
import styles from './Oferta.module.css';

export default function Oferta() {
  const [params, setParams] = useSearchParams();
  const cuatrimestre = params.get('cuatrimestre') ?? '';
  const [texto, setTexto] = useState(params.get('q') ?? '');
  const [materias, setMaterias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  // Espera a que el usuario deje de escribir antes de consultar
  useEffect(() => {
    const id = setTimeout(() => {
      const nuevos = {};
      if (texto.trim()) nuevos.q = texto.trim();
      if (cuatrimestre) nuevos.cuatrimestre = cuatrimestre;
      setParams(nuevos, { replace: true });
    }, 300);
    return () => clearTimeout(id);
  }, [texto, cuatrimestre, setParams]);

  const q = params.get('q') ?? '';

  useEffect(() => {
    let vigente = true;
    setCargando(true);
    setError('');
    obtenerOferta({ texto: q, cuatrimestre })
      .then((datos) => vigente && setMaterias(datos))
      .catch((err) => vigente && setError(err.message))
      .finally(() => vigente && setCargando(false));
    return () => { vigente = false; };
  }, [q, cuatrimestre]);

  const cambiarCuatrimestre = (valor) => {
    const nuevos = Object.fromEntries(params);
    if (valor) nuevos.cuatrimestre = valor; else delete nuevos.cuatrimestre;
    setParams(nuevos, { replace: true });
  };

  return (
    <section>
      <div className={styles.encabezado}>
        <div>
          <h1>Oferta de materias</h1>
          <p className={styles.bajada}>Materias que podés cursar según tu plan de estudios</p>
        </div>
      </div>

      <div className={styles.filtros}>
        <label className={`campo ${styles.buscador}`}>
          Buscar materia
          <input
            type="search"
            placeholder="Ej: Programación"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
          />
        </label>
        <label className="campo">
          Cuatrimestre
          <select value={cuatrimestre} onChange={(e) => cambiarCuatrimestre(e.target.value)}>
            <option value="">Todos</option>
            <option value="2">2° cuatrimestre</option>
            <option value="3">3° cuatrimestre</option>
            <option value="4">4° cuatrimestre</option>
          </select>
        </label>
      </div>

      {cargando && <Spinner texto="Cargando materias…" />}
      {!cargando && error && <Aviso tipo="error">{error}</Aviso>}
      {!cargando && !error && materias.length === 0 && (
        <Aviso>No se encontraron materias con esos filtros.</Aviso>
      )}

      {!cargando && materias.length > 0 && (
        <>
          <p className={styles.resultados}>
            {materias.length} {materias.length === 1 ? 'materia' : 'materias'}
          </p>
          <ul className={styles.lista} aria-label="Materias disponibles">
            {materias.map((m) => {
              const sinCupo = m.comisiones.every((c) => c.disponibles <= 0);
              return (
                <li key={m.id} className={styles.tarjeta}>
                  <div className={styles.cabecera}>
                    <h2 className={styles.nombre}>{m.nombre}</h2>
                    {m.inscriptoEn && <span className={`${styles.etiqueta} ${styles.inscripto}`}>Inscripto</span>}
                    {!m.inscriptoEn && sinCupo && <span className={`${styles.etiqueta} ${styles.lleno}`}>Sin cupo</span>}
                  </div>
                  <p className={styles.datos}>
                    <span>{m.cuatrimestre}° cuatrimestre</span>
                    <span>{m.comisiones.length} {m.comisiones.length === 1 ? 'comisión' : 'comisiones'}</span>
                  </p>
                  <div className={styles.pie}>
                    <Link to={`/oferta/${m.id}`} className="boton boton-secundario">Ver comisiones</Link>
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </section>
  );
}

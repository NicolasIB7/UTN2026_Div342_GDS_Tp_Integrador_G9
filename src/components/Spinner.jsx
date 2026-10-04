import styles from './Spinner.module.css';

export default function Spinner({ texto = 'Cargando…' }) {
  return (
    <div className={styles.contenedor} role="status">
      <span className={styles.circulo} aria-hidden="true" />
      <span>{texto}</span>
    </div>
  );
}

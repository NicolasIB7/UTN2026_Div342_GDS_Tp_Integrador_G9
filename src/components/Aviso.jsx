import styles from './Aviso.module.css';

export default function Aviso({ tipo = 'info', children }) {
  return (
    <div className={`${styles.aviso} ${styles[tipo]}`} role={tipo === 'error' ? 'alert' : 'status'}>
      {children}
    </div>
  );
}

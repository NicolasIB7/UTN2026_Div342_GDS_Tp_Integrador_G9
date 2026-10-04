import { useEffect, useId, useRef } from 'react';
import styles from './Dialogo.module.css';

export default function Dialogo({ titulo, children, textoConfirmar, procesando, onConfirmar, onCancelar }) {
  const idTitulo = useId();
  const botonCancelar = useRef(null);

  useEffect(() => {
    botonCancelar.current?.focus();
    const alPresionar = (e) => e.key === 'Escape' && !procesando && onCancelar();
    window.addEventListener('keydown', alPresionar);
    return () => window.removeEventListener('keydown', alPresionar);
  }, [procesando, onCancelar]);

  return (
    <div className={styles.fondo}>
      <div className={styles.dialogo} role="dialog" aria-modal="true" aria-labelledby={idTitulo}>
        <h2 id={idTitulo} className={styles.titulo}>{titulo}</h2>
        <div className={styles.cuerpo}>{children}</div>
        <div className={styles.acciones}>
          <button ref={botonCancelar} className="boton boton-secundario" onClick={onCancelar} disabled={procesando}>
            Cancelar
          </button>
          <button className="boton boton-primario" onClick={onConfirmar} disabled={procesando}>
            {procesando ? 'Procesando…' : textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  );
}

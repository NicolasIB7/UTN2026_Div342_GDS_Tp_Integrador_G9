import { alumnos } from '../data/alumnos';
import { materias, nombreMateria } from '../data/materias';

// Simula la latencia de un backend real
const esperar = () => new Promise((r) => setTimeout(r, 300 + Math.random() * 400));

const CLAVE_SESION = 'autogestion.sesion';
const CLAVE_INSCRIPCIONES = 'autogestion.inscripciones';

const leer = (clave, porDefecto) => {
  const valor = sessionStorage.getItem(clave);
  return valor ? JSON.parse(valor) : porDefecto;
};
const guardar = (clave, valor) => sessionStorage.setItem(clave, JSON.stringify(valor));

const alumnoActual = () => {
  const legajo = leer(CLAVE_SESION, null);
  const alumno = alumnos.find((a) => a.legajo === legajo);
  if (!alumno) throw new Error('Sesión expirada');
  return alumno;
};

const sinPassword = ({ password, ...resto }) => resto;

const armarMateria = (materia, inscripciones) => {
  const propia = inscripciones.find((i) => i.materiaId === materia.id);
  return {
    ...materia,
    inscriptoEn: propia?.comisionId ?? null,
    comisiones: materia.comisiones.map((c) => {
      const inscriptos = c.inscriptos + (propia?.comisionId === c.id ? 1 : 0);
      return { ...c, inscriptos, disponibles: c.cupo - inscriptos };
    }),
  };
};

const normalizar = (texto) => texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export const sesionGuardada = () => {
  const legajo = leer(CLAVE_SESION, null);
  const alumno = alumnos.find((a) => a.legajo === legajo);
  return alumno ? sinPassword(alumno) : null;
};

export async function login(legajo, password) {
  await esperar();
  const alumno = alumnos.find((a) => a.legajo === legajo.trim() && a.password === password);
  if (!alumno) throw new Error('Legajo o contraseña incorrectos');
  guardar(CLAVE_SESION, alumno.legajo);
  return sinPassword(alumno);
}

export function logout() {
  sessionStorage.removeItem(CLAVE_SESION);
}

export async function obtenerOferta({ texto = '', cuatrimestre = '' } = {}) {
  await esperar();
  const alumno = alumnoActual();
  const inscripciones = leer(CLAVE_INSCRIPCIONES, []);
  const buscado = normalizar(texto.trim());

  return materias
    .filter((m) => !alumno.aprobadas.includes(m.id))
    .filter((m) => !cuatrimestre || m.cuatrimestre === Number(cuatrimestre))
    .filter((m) => !buscado || normalizar(m.nombre).includes(buscado))
    .map((m) => armarMateria(m, inscripciones));
}

export async function obtenerMateria(id) {
  await esperar();
  alumnoActual();
  const materia = materias.find((m) => m.id === id);
  if (!materia) throw new Error('La materia no existe');
  return {
    ...armarMateria(materia, leer(CLAVE_INSCRIPCIONES, [])),
    correlativasDetalle: materia.correlativas.map((c) => ({ id: c, nombre: nombreMateria(c) })),
  };
}

export async function inscribir(materiaId, comisionId) {
  await esperar();
  const alumno = alumnoActual();
  const inscripciones = leer(CLAVE_INSCRIPCIONES, []);
  const materia = materias.find((m) => m.id === materiaId);
  const comision = materia?.comisiones.find((c) => c.id === comisionId);
  if (!comision) throw new Error('La comisión no existe');

  if (inscripciones.some((i) => i.materiaId === materiaId)) {
    throw new Error('Ya estás inscripto en esta materia');
  }

  const faltantes = materia.correlativas.filter((c) => !alumno.aprobadas.includes(c));
  if (faltantes.length) {
    throw new Error(`No cumplís las correlativas: ${faltantes.map(nombreMateria).join(', ')} sin aprobar`);
  }

  if (comision.inscriptos >= comision.cupo) {
    throw new Error('La comisión no tiene cupo disponible');
  }

  guardar(CLAVE_INSCRIPCIONES, [
    ...inscripciones,
    { materiaId, comisionId, fecha: new Date().toISOString() },
  ]);
}

export async function darDeBaja(materiaId) {
  await esperar();
  alumnoActual();
  const inscripciones = leer(CLAVE_INSCRIPCIONES, []);
  guardar(CLAVE_INSCRIPCIONES, inscripciones.filter((i) => i.materiaId !== materiaId));
}

export async function obtenerInscripciones() {
  await esperar();
  alumnoActual();
  return leer(CLAVE_INSCRIPCIONES, []).map((i) => {
    const materia = materias.find((m) => m.id === i.materiaId);
    const comision = materia.comisiones.find((c) => c.id === i.comisionId);
    return { ...i, materia: materia.nombre, cuatrimestre: materia.cuatrimestre, horario: comision.horario, turno: comision.turno };
  });
}

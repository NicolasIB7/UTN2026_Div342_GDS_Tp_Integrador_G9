// Plan de estudios 2024 - Tecnicatura Universitaria en Programación (UTN)
// Nombres de todas las asignaturas del plan, para mostrar correlativas
// aunque la materia no esté en la oferta (ya fue aprobada).
export const todasLasMaterias = {
  1: 'Programación I',
  2: 'Arquitectura y Sistemas Operativos',
  3: 'Matemática',
  4: 'Inglés I',
  5: 'Programación II',
  6: 'Probabilidad y Estadística',
  7: 'Base de Datos I',
  8: 'Organización Empresarial',
  9: 'Programación III',
  10: 'Base de Datos II',
  11: 'Metodología de Sistemas I',
  12: 'Inglés II',
  13: 'Programación IV',
  14: 'Metodología de Sistemas II',
  15: 'Introducción al Análisis de Datos',
  16: 'Legislación',
  17: 'Gestión de Desarrollo de Software',
};

export const nombreMateria = (id) => todasLasMaterias[id] ?? id;

// Solo las materias que el alumno de prueba todavía no aprobó entran acá,
// con sus comisiones. Las correlativas se guardan como ids de todasLasMaterias.
export const materias = [
  {
    id: '8', nombre: 'Organización Empresarial', cuatrimestre: 2, correlativas: [],
    comisiones: [
      { id: '2K1', turno: 'Mañana', horario: 'Martes 8:00 a 11:45', cupo: 40, inscriptos: 15 },
    ],
  },
  {
    id: '11', nombre: 'Metodología de Sistemas I', cuatrimestre: 3, correlativas: ['1', '5', '7', '8'],
    comisiones: [
      { id: '3N1', turno: 'Noche', horario: 'Lunes 19:00 a 22:45', cupo: 40, inscriptos: 20 },
    ],
  },
  {
    id: '13', nombre: 'Programación IV', cuatrimestre: 4, correlativas: ['5', '7', '9', '10', '11'],
    comisiones: [
      { id: '4N1', turno: 'Noche', horario: 'Martes y jueves 19:00 a 22:45', cupo: 35, inscriptos: 10 },
    ],
  },
  {
    id: '14', nombre: 'Metodología de Sistemas II', cuatrimestre: 4, correlativas: ['8', '11'],
    comisiones: [
      { id: '4N1', turno: 'Noche', horario: 'Miércoles 19:00 a 22:45', cupo: 35, inscriptos: 9 },
    ],
  },
  {
    id: '15', nombre: 'Introducción al Análisis de Datos', cuatrimestre: 4, correlativas: ['6', '7', '10'],
    comisiones: [
      { id: '4K1', turno: 'Mañana', horario: 'Viernes 8:00 a 11:45', cupo: 30, inscriptos: 30 },
      { id: '4N1', turno: 'Noche', horario: 'Jueves 19:00 a 22:45', cupo: 30, inscriptos: 30 },
    ],
  },
  {
    id: '16', nombre: 'Legislación', cuatrimestre: 4, correlativas: ['7', '8'],
    comisiones: [
      { id: '4N1', turno: 'Noche', horario: 'Lunes 19:00 a 20:30', cupo: 45, inscriptos: 18 },
    ],
  },
  {
    id: '17', nombre: 'Gestión de Desarrollo de Software', cuatrimestre: 4, correlativas: ['5', '7', '9', '10'],
    comisiones: [
      { id: '4K1', turno: 'Mañana', horario: 'Viernes 8:00 a 11:45', cupo: 35, inscriptos: 20 },
      { id: '4N1', turno: 'Noche', horario: 'Martes 19:00 a 22:45', cupo: 35, inscriptos: 33 },
    ],
  },
];

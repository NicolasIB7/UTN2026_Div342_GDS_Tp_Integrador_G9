import { test, expect } from './fixtures';
import { MATERIAS } from './support/datos';

test.describe('F3 - Inscripción a cursadas', () => {
  // El login lo resuelve la fixture alumnoLogueado
  test.beforeEach(async ({ alumnoLogueado }) => {});

  test('TC-09 se inscribe en una comisión con cupo @mobile', async ({ ofertaPage, materiaPage, inscripcionesPage }) => {
    await ofertaPage.abrirMateria(MATERIAS.gestionDesarrollo);
    await expect(materiaPage.titulo).toHaveText(MATERIAS.gestionDesarrollo);
    const lugaresAntes = await materiaPage.lugaresDisponibles('4K1');

    await materiaPage.inscribirseEn('4K1');

    await expect(materiaPage.avisoExito).toHaveText(`Te inscribiste en ${MATERIAS.gestionDesarrollo}, comisión 4K1.`);
    await expect(materiaPage.comision('4K1')).toContainText('Inscripto');
    await expect(materiaPage.cupo('4K1')).toHaveText(`${lugaresAntes - 1} lugares`);
    await expect(materiaPage.botonInscribirme('4N1')).toBeDisabled();

    await materiaPage.irAInscripciones();
    await expect(inscripcionesPage.inscripcion(MATERIAS.gestionDesarrollo)).toContainText('4K1');
  });

  test('TC-10 rechaza la inscripción si falta una correlativa', async ({ ofertaPage, materiaPage }) => {
    await ofertaPage.abrirMateria(MATERIAS.legislacion);

    await materiaPage.inscribirseEn('4N1');

    await expect(materiaPage.avisoError).toHaveText(`No cumplís las correlativas: ${MATERIAS.organizacionEmpresarial} sin aprobar`);
    await expect(materiaPage.botonInscribirme('4N1')).toBeEnabled();
    await expect(materiaPage.comision('4N1')).not.toContainText('Inscripto');
  });

  test('TC-11 rechaza la inscripción si faltan dos correlativas', async ({ ofertaPage, materiaPage }) => {
    await ofertaPage.abrirMateria(MATERIAS.metodologia2);

    await materiaPage.inscribirseEn('4N1');

    await expect(materiaPage.avisoError).toHaveText(
      `No cumplís las correlativas: ${MATERIAS.organizacionEmpresarial}, ${MATERIAS.metodologia1} sin aprobar`,
    );
  });

  test('TC-12 no permite inscribirse en una comisión sin cupo', async ({ ofertaPage, materiaPage }) => {
    await expect(ofertaPage.tarjeta(MATERIAS.analisisDatos)).toContainText('Sin cupo');

    await ofertaPage.abrirMateria(MATERIAS.analisisDatos);

    for (const codigo of ['4K1', '4N1']) {
      await expect(materiaPage.cupo(codigo)).toHaveText('Sin cupo');
      await expect(materiaPage.botonInscribirme(codigo)).toBeDisabled();
    }
  });

  test('TC-13 da de baja una inscripción y se libera el lugar', async ({ ofertaPage, materiaPage, inscripcionesPage }) => {
    await ofertaPage.abrirMateria(MATERIAS.gestionDesarrollo);
    const lugaresIniciales = await materiaPage.lugaresDisponibles('4N1');
    await materiaPage.inscribirseEn('4N1');
    await expect(materiaPage.avisoExito).toBeVisible();

    await materiaPage.irAInscripciones();
    await inscripcionesPage.darDeBaja(MATERIAS.gestionDesarrollo);

    await expect(inscripcionesPage.avisoExito).toBeVisible();
    await expect(inscripcionesPage.sinInscripciones).toBeVisible();

    await inscripcionesPage.irAOferta();
    await ofertaPage.abrirMateria(MATERIAS.gestionDesarrollo);
    await expect(materiaPage.cupo('4N1')).toHaveText(`${lugaresIniciales} lugares`);
  });
});

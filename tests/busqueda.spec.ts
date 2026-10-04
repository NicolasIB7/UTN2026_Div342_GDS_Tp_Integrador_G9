import { test, expect } from './fixtures';
import { MATERIAS } from './support/datos';

test.describe('F2 - Búsqueda en la oferta de materias', () => {
  // El login lo resuelve la fixture alumnoLogueado
  test.beforeEach(async ({ alumnoLogueado }) => {});

  test('TC-06 busca materias por nombre', async ({ page, ofertaPage }) => {
    await ofertaPage.buscar('metodolog');

    await expect(ofertaPage.nombresMaterias).toHaveText([MATERIAS.metodologia1, MATERIAS.metodologia2]);
    await expect(page).toHaveURL(/q=metodolog/);
  });

  test('TC-07 filtra las materias por cuatrimestre', async ({ ofertaPage }) => {
    await ofertaPage.filtrarPorCuatrimestre('4° cuatrimestre');

    await expect(ofertaPage.materias).toHaveCount(5);
    for (const materia of await ofertaPage.materias.all()) {
      await expect(materia).toContainText('4° cuatrimestre');
    }
  });

  test('TC-08 informa cuando no hay resultados', async ({ ofertaPage }) => {
    await ofertaPage.buscar('Física');

    await expect(ofertaPage.sinResultados).toBeVisible();
    await expect(ofertaPage.materias).toHaveCount(0);
  });
});

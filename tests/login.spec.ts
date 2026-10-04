import { test, expect } from './fixtures';
import { ALUMNO } from './support/datos';

test.describe('F1 - Autenticación', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test('TC-01 ingresa con credenciales válidas @mobile', async ({ page, loginPage, ofertaPage }) => {
    await loginPage.ingresar(ALUMNO.legajo, ALUMNO.password);

    await expect(page).toHaveURL(/\/oferta$/);
    await expect(ofertaPage.encabezado).toContainText(ALUMNO.nombreCompleto);
    await expect(ofertaPage.materias.first()).toBeVisible();
  });

  test('TC-02 rechaza una contraseña incorrecta', async ({ page, loginPage }) => {
    await loginPage.ingresar(ALUMNO.legajo, 'clave-incorrecta');

    await expect(loginPage.error).toHaveText('Legajo o contraseña incorrectos');
    await expect(page).toHaveURL(/\/login$/);
  });

  test('TC-03 pide completar legajo y contraseña', async ({ page, loginPage }) => {
    await loginPage.botonIngresar.click();

    await expect(loginPage.error).toHaveText('Completá el legajo y la contraseña');
    await expect(page).toHaveURL(/\/login$/);
  });

  test('TC-04 no deja entrar a una ruta privada sin sesión', async ({ page, loginPage, ofertaPage }) => {
    await page.goto('/inscripciones');

    await expect(page).toHaveURL(/\/login$/);
    await expect(loginPage.titulo).toBeVisible();
    await expect(ofertaPage.linkInscripciones).toHaveCount(0);
  });

  test('TC-05 al cerrar sesión vuelve a pedir credenciales', async ({ page, loginPage, ofertaPage }) => {
    await loginPage.ingresar(ALUMNO.legajo, ALUMNO.password);
    await expect(ofertaPage.titulo).toBeVisible();

    await ofertaPage.cerrarSesion();
    await expect(page).toHaveURL(/\/login$/);

    await page.goto('/oferta');
    await expect(page).toHaveURL(/\/login$/);
  });
});

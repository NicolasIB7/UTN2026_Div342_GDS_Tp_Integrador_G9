import { test as base, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { OfertaPage } from './pages/OfertaPage';
import { MateriaPage } from './pages/MateriaPage';
import { InscripcionesPage } from './pages/InscripcionesPage';
import { ALUMNO } from './support/datos';

type Fixtures = {
  loginPage: LoginPage;
  ofertaPage: OfertaPage;
  materiaPage: MateriaPage;
  inscripcionesPage: InscripcionesPage;
  alumnoLogueado: void;
};

export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  ofertaPage: async ({ page }, use) => {
    await use(new OfertaPage(page));
  },
  materiaPage: async ({ page }, use) => {
    await use(new MateriaPage(page));
  },
  inscripcionesPage: async ({ page }, use) => {
    await use(new InscripcionesPage(page));
  },

  // Deja al alumno logueado y parado en la oferta de materias
  alumnoLogueado: async ({ loginPage, ofertaPage }, use) => {
    await loginPage.goto();
    await loginPage.ingresar(ALUMNO.legajo, ALUMNO.password);
    await expect(ofertaPage.titulo).toBeVisible();
    await use();
  },
});

export { expect };

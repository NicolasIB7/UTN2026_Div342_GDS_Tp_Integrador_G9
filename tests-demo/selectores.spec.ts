import { test, expect } from '@playwright/test';

/**
 * Mismo flujo escrito dos veces: con selectores atados a la estructura del DOM
 * y con locators semánticos. Sirve para mostrar qué pasa cuando cambia el markup
 * de la SPA sin que cambie el comportamiento (ver README, sección Demo).
 */

test.describe('Selectores frágiles', () => {
  test('login e ingreso a una materia con XPath y CSS estructural', async ({ page }) => {
    await page.goto('/login');
    await page.locator('xpath=//*[@id="root"]/div/div/form/label[1]/input').fill('103980');
    await page.locator('xpath=//*[@id="root"]/div/div/form/label[2]/input').fill('utn2024');
    await page.locator('#root > div > div > form > button').click();

    // segunda tarjeta de la lista, tercer bloque, primer link
    await page.locator('main ul > li:nth-child(2) > div:nth-child(3) > a').click();
    await expect(page.locator('main section > div:nth-child(2) > h1')).toHaveText('Metodología de Sistemas I');
  });
});

test.describe('Locators semánticos', () => {
  test('login e ingreso a una materia con getByRole y getByLabel', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Legajo').fill('103980');
    await page.getByLabel('Contraseña').fill('utn2024');
    await page.getByRole('button', { name: 'Ingresar' }).click();

    await page
      .getByRole('listitem')
      .filter({ has: page.getByRole('heading', { name: 'Metodología de Sistemas I', exact: true }) })
      .getByRole('link', { name: 'Ver comisiones' })
      .click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Metodología de Sistemas I');
  });
});

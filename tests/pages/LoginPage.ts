import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  readonly titulo: Locator;
  readonly campoLegajo: Locator;
  readonly campoPassword: Locator;
  readonly botonIngresar: Locator;
  readonly error: Locator;

  constructor(page: Page) {
    super(page);
    this.titulo = page.getByRole('heading', { name: 'Ingresá con tu legajo' });
    this.campoLegajo = page.getByLabel('Legajo');
    this.campoPassword = page.getByLabel('Contraseña');
    this.botonIngresar = page.getByRole('button', { name: 'Ingresar' });
    this.error = page.getByRole('alert');
  }

  async goto() {
    await this.page.goto('/login');
  }

  async ingresar(legajo: string, password: string) {
    await (await this.elemento(this.campoLegajo, 'campo de texto del legajo')).fill(legajo);
    await (await this.elemento(this.campoPassword, 'campo de la contraseña')).fill(password);
    await (await this.elemento(this.botonIngresar, 'botón para ingresar al sistema')).click();
  }
}

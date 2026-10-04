import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class MateriaPage extends BasePage {
  readonly titulo: Locator;
  readonly dialogo: Locator;
  readonly botonConfirmar: Locator;
  readonly avisoExito: Locator;
  readonly avisoError: Locator;

  constructor(page: Page) {
    super(page);
    this.titulo = page.getByRole('heading', { level: 1 });
    this.dialogo = page.getByRole('dialog', { name: 'Confirmar inscripción' });
    this.botonConfirmar = this.dialogo.getByRole('button', { name: 'Confirmar inscripción' });
    this.avisoExito = page.getByRole('status').filter({ hasText: 'Te inscribiste' });
    this.avisoError = page.getByRole('alert');
  }

  comision(codigo: string) {
    return this.page.getByRole('row').filter({
      has: this.page.getByRole('cell', { name: codigo, exact: true }),
    });
  }

  botonInscribirme(codigo: string) {
    return this.comision(codigo).getByRole('button', { name: 'Inscribirme' });
  }

  cupo(codigo: string) {
    return this.comision(codigo).getByTestId('cupo-disponible');
  }

  async lugaresDisponibles(codigo: string) {
    const texto = await this.cupo(codigo).innerText();
    return Number.parseInt(texto, 10) || 0;
  }

  async inscribirseEn(codigo: string) {
    const boton = await this.elemento(this.botonInscribirme(codigo), `botón "Inscribirme" de la comisión ${codigo}`);
    await boton.click();
    await (await this.elemento(this.botonConfirmar, 'botón que confirma la inscripción en el diálogo')).click();
  }
}

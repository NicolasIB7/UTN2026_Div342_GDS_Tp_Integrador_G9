import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class InscripcionesPage extends BasePage {
  readonly titulo: Locator;
  readonly sinInscripciones: Locator;
  readonly avisoExito: Locator;
  readonly dialogoBaja: Locator;

  constructor(page: Page) {
    super(page);
    this.titulo = page.getByRole('heading', { name: 'Mis inscripciones', level: 1 });
    this.sinInscripciones = page.getByText('No tenés inscripciones activas.');
    this.avisoExito = page.getByRole('status').filter({ hasText: 'Se dio de baja' });
    this.dialogoBaja = page.getByRole('dialog', { name: 'Dar de baja inscripción' });
  }

  async goto() {
    await this.page.goto('/inscripciones');
  }

  inscripcion(materia: string) {
    return this.page.getByRole('row').filter({
      has: this.page.getByRole('cell', { name: materia, exact: true }),
    });
  }

  async darDeBaja(materia: string) {
    const boton = this.inscripcion(materia).getByRole('button', { name: 'Dar de baja' });
    await (await this.elemento(boton, `botón "Dar de baja" de ${materia}`)).click();
    const confirmar = this.dialogoBaja.getByRole('button', { name: 'Confirmar baja' });
    await (await this.elemento(confirmar, 'botón que confirma la baja en el diálogo')).click();
  }
}

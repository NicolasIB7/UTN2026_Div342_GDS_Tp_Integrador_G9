import type { Locator, Page } from '@playwright/test';

export abstract class BasePage {
  readonly encabezado: Locator;
  readonly linkOferta: Locator;
  readonly linkInscripciones: Locator;
  readonly botonCerrarSesion: Locator;

  constructor(readonly page: Page) {
    this.encabezado = page.getByRole('banner');
    const menu = page.getByRole('navigation', { name: 'Principal' });
    this.linkOferta = menu.getByRole('link', { name: 'Oferta de materias' });
    this.linkInscripciones = menu.getByRole('link', { name: 'Mis inscripciones' });
    this.botonCerrarSesion = page.getByRole('button', { name: 'Cerrar sesión' });
  }

  async irAInscripciones() {
    await this.linkInscripciones.click();
  }

  async irAOferta() {
    await this.linkOferta.click();
  }

  async cerrarSesion() {
    await this.botonCerrarSesion.click();
  }
}

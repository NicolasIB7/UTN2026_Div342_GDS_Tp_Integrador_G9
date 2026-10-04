import type { Locator, Page } from '@playwright/test';
import { resolver } from '../support/self-healing';

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

  /** Devuelve el locator, o uno reparado por el LLM si está activo el self-healing. */
  protected elemento(locator: Locator, descripcion: string) {
    return resolver(this.page, locator, descripcion);
  }

  async irAInscripciones() {
    await (await this.elemento(this.linkInscripciones, 'link del menú a Mis inscripciones')).click();
  }

  async irAOferta() {
    await (await this.elemento(this.linkOferta, 'link del menú a la oferta de materias')).click();
  }

  async cerrarSesion() {
    await (await this.elemento(this.botonCerrarSesion, 'botón para cerrar sesión')).click();
  }
}

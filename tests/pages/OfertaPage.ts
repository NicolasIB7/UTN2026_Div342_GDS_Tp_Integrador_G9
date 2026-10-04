import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class OfertaPage extends BasePage {
  readonly titulo: Locator;
  readonly buscador: Locator;
  readonly filtroCuatrimestre: Locator;
  readonly materias: Locator;
  readonly nombresMaterias: Locator;
  readonly sinResultados: Locator;

  constructor(page: Page) {
    super(page);
    this.titulo = page.getByRole('heading', { name: 'Oferta de materias', level: 1 });
    this.buscador = page.getByLabel('Buscar materia');
    this.filtroCuatrimestre = page.getByLabel('Cuatrimestre');
    this.materias = page.getByRole('list', { name: 'Materias disponibles' }).getByRole('listitem');
    this.nombresMaterias = this.materias.getByRole('heading');
    this.sinResultados = page.getByText('No se encontraron materias');
  }

  async goto() {
    await this.page.goto('/oferta');
  }

  tarjeta(nombre: string) {
    return this.materias.filter({
      has: this.page.getByRole('heading', { name: nombre, exact: true }),
    });
  }

  async buscar(texto: string) {
    await (await this.elemento(this.buscador, 'campo para buscar materias por nombre')).fill(texto);
  }

  async filtrarPorCuatrimestre(opcion: string) {
    await (await this.elemento(this.filtroCuatrimestre, 'selector para filtrar por cuatrimestre')).selectOption({ label: opcion });
  }

  async abrirMateria(nombre: string) {
    const link = this.tarjeta(nombre).getByRole('link', { name: 'Ver comisiones' });
    await (await this.elemento(link, `link "Ver comisiones" de la materia ${nombre}`)).click();
  }
}

import { test, expect } from '@playwright/test';
import { resolver } from '../tests/support/self-healing';

// Prueba del módulo sin la app ni un LLM real: se reemplaza fetch en este worker.
test.describe('self-healing (modelo simulado)', () => {
  let prompts: string[] = [];
  const fetchOriginal = globalThis.fetch;

  test.beforeEach(() => {
    prompts = [];
    process.env.SELF_HEALING = '1';
    process.env.GEMINI_API_KEY = 'clave-falsa';
    delete process.env.LLM_PROVIDER;
    globalThis.fetch = (async (_url: string | URL | Request, init?: RequestInit) => {
      prompts.push(JSON.parse(String(init?.body)).contents[0].parts[0].text);
      const text = '{"metodo":"getByRole","valor":"button","nombre":"Iniciar sesión"}';
      return new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text }] } }] }), { status: 200 });
    }) as typeof fetch;
  });
  test.afterEach(() => { globalThis.fetch = fetchOriginal; });

  test('repara un botón renombrado y no manda la contraseña', async ({ page }) => {
    await page.setContent(`<label>Legajo <input type="text" value="103980"></label>
      <label>Contraseña <input type="password" value="utn2024"></label>
      <button>Iniciar sesión</button>`);
    const roto = page.getByRole('button', { name: 'Ingresar' });
    const reparado = await resolver(page, roto, 'botón para ingresar al sistema');

    await expect(reparado).toHaveText('Iniciar sesión');
    expect(prompts).toHaveLength(1);
    expect(prompts[0]).not.toContain('utn2024');
    expect(prompts[0]).not.toContain('103980');
    expect(prompts[0]).toContain('[REDACTADO]');
    expect(test.info().annotations.some((a) => a.type === 'self-healing')).toBe(true);
  });

  test('si la propuesta no existe en la página, devuelve el locator original', async ({ page }) => {
    await page.setContent('<button>Otra cosa</button>');
    const roto = page.getByRole('button', { name: 'Ingresar' });
    expect(await resolver(page, roto, 'botón para ingresar')).toBe(roto);
  });
});

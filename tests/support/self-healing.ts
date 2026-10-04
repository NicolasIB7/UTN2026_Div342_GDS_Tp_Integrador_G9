import { test, type Locator, type Page } from '@playwright/test';

/**
 * Reparación de locators asistida por un LLM.
 *
 * Si un locator no encuentra su elemento, se le manda al modelo el snapshot
 * de accesibilidad de la página y la descripción del elemento buscado. El
 * modelo propone un locator nuevo, que solo se usa si resuelve a un único
 * elemento visible. Nunca toca las aserciones del test.
 *
 * Se activa con SELF_HEALING=1 (ver .env.example). En CI queda apagado.
 */

type Propuesta = {
  metodo: 'getByRole' | 'getByLabel' | 'getByText' | 'getByPlaceholder' | 'getByTestId';
  valor: string;
  nombre?: string;
};

export const healingActivo = () => process.env.SELF_HEALING === '1' && !process.env.CI;

export async function resolver(page: Page, locator: Locator, descripcion: string): Promise<Locator> {
  if (!healingActivo()) return locator;

  try {
    await locator.first().waitFor({ state: 'visible', timeout: 4_000 });
    return locator;
  } catch {
    // no apareció: intentamos repararlo
  }

  const snapshot = await page.locator('body').ariaSnapshot();
  const propuesta = await consultarModelo(descripcion, locator.toString(), snapshot);
  if (!propuesta) return locator;

  const candidato = construir(page, propuesta);
  const valido = (await candidato.count()) === 1 && (await candidato.isVisible());
  if (!valido) return locator;

  const detalle = `"${descripcion}": ${locator} → ${candidato}`;
  test.info().annotations.push({ type: 'self-healing', description: detalle });
  console.warn(`[self-healing] ${detalle}`);
  return candidato;
}

function construir(page: Page, p: Propuesta): Locator {
  switch (p.metodo) {
    case 'getByRole':
      return page.getByRole(p.valor as Parameters<Page['getByRole']>[0], p.nombre ? { name: p.nombre } : {});
    case 'getByLabel':
      return page.getByLabel(p.valor);
    case 'getByPlaceholder':
      return page.getByPlaceholder(p.valor);
    case 'getByTestId':
      return page.getByTestId(p.valor);
    default:
      return page.getByText(p.valor);
  }
}

async function consultarModelo(descripcion: string, original: string, snapshot: string): Promise<Propuesta | null> {
  const prompt = `Sos un asistente de testing con Playwright. Un locator dejó de encontrar su elemento.

Elemento buscado: ${descripcion}
Locator original: ${original}

Snapshot de accesibilidad actual de la página:
${snapshot}

Respondé SOLO con un JSON, sin texto adicional, con esta forma:
{"metodo": "getByRole" | "getByLabel" | "getByText" | "getByPlaceholder" | "getByTestId", "valor": "...", "nombre": "..."}
Para getByRole, "valor" es el rol y "nombre" el nombre accesible. Para el resto, omití "nombre".
Priorizá getByRole. Si el elemento no existe en el snapshot, respondé {"metodo": null}.`;

  try {
    const texto = process.env.LLM_PROVIDER === 'anthropic'
      ? await llamarAnthropic(prompt)
      : await llamarGemini(prompt);
    const json = texto.match(/\{[\s\S]*\}/)?.[0];
    const propuesta = json ? JSON.parse(json) : null;
    return propuesta?.metodo ? propuesta : null;
  } catch (err) {
    console.warn(`[self-healing] no se pudo consultar el modelo: ${(err as Error).message}`);
    return null;
  }
}

async function llamarGemini(prompt: string): Promise<string> {
  const modelo = process.env.LLM_MODEL || 'gemini-2.5-flash';
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      signal: AbortSignal.timeout(15_000),
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0 },
      }),
    },
  );
  if (!res.ok) throw new Error(`Gemini respondió ${res.status}`);
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
}

async function llamarAnthropic(prompt: string): Promise<string> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    signal: AbortSignal.timeout(15_000),
    headers: {
      'content-type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY ?? '',
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: process.env.LLM_MODEL || 'claude-haiku-4-5-20251001',
      max_tokens: 200,
      temperature: 0,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  if (!res.ok) throw new Error(`Anthropic respondió ${res.status}`);
  const data = await res.json();
  return data.content?.[0]?.text ?? '';
}

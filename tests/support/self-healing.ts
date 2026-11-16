import { test, type Locator, type Page } from '@playwright/test';
import { appendFileSync, mkdirSync, writeFileSync } from 'node:fs';

/**
 * Reparación de locators asistida por un LLM.
 *
 * Si un locator no encuentra su elemento, se le manda al modelo el snapshot
 * de accesibilidad de la página y la descripción del elemento buscado. El
 * modelo propone un locator nuevo, que solo se usa si resuelve a un único
 * elemento visible. Nunca toca las aserciones del test.
 *
 * SELF_HEALING=1 repara y sigue; SELF_HEALING=sugerir solo registra la propuesta
 * (en el reporte y en self-healing/propuestas.jsonl) y deja fallar el test.
 * Los valores de los campos de texto se tapan antes de mandar la página al modelo.
 * Ver .env.example. En CI queda siempre apagado.
 */

type Propuesta = {
  metodo: 'getByRole' | 'getByLabel' | 'getByText' | 'getByPlaceholder' | 'getByTestId';
  valor: string;
  nombre?: string;
};

const MODO = () => process.env.SELF_HEALING; // '1' = reparar, 'sugerir' = solo proponer
export const healingActivo = () => (MODO() === '1' || MODO() === 'sugerir') && !process.env.CI;

const cache = new Map<string, Propuesta>(); // por worker: un locator roto = 1 sola consulta

function redactar(snapshot: string): string {
  return snapshot
    .replace(/^(\s*- (?:textbox|searchbox)[^:\n]*): .+$/gm, '$1: "[REDACTADO]"')
    .slice(0, 8_000);
}

function registrar(entrada: Record<string, unknown>) {
  mkdirSync('self-healing', { recursive: true });
  appendFileSync('self-healing/propuestas.jsonl', JSON.stringify({ fecha: new Date().toISOString(), ...entrada }) + '\n');
}

export async function resolver(page: Page, locator: Locator, descripcion: string): Promise<Locator> {
  if (!healingActivo()) return locator;

  try {
    await locator.first().waitFor({ state: 'visible', timeout: 4_000 });
    return locator;
  } catch {
    // no apareció: intentamos repararlo
  }

  const clave = locator.toString();
  let propuesta = cache.get(clave) ?? null;
  if (!propuesta) {
    const snapshot = redactar(await page.locator('body').ariaSnapshot());
    propuesta = await consultarModelo(descripcion, clave, snapshot);
    if (!propuesta) return locator;
  }

  let candidato: Locator;
  try {
    candidato = construir(page, propuesta);
    const valido = (await candidato.count()) === 1 && (await candidato.isVisible());
    if (!valido) return locator;
  } catch {
    return locator; // p. ej. un rol inexistente propuesto por el modelo
  }
  cache.set(clave, propuesta);

  const aplicado = MODO() === '1';
  const detalle = `"${descripcion}": ${locator} → ${candidato}${aplicado ? '' : ' (solo sugerido)'}`;
  test.info().annotations.push({ type: 'self-healing', description: detalle });
  console.warn(`[self-healing] ${detalle}`);
  registrar({
    test: test.info().titlePath.join(' › '),
    descripcion, original: clave, propuesto: candidato.toString(), aplicado,
    proveedor: process.env.LLM_PROVIDER || 'gemini', modelo: process.env.LLM_MODEL || '(default)',
  });
  return aplicado ? candidato : locator;
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

  if (process.env.SELF_HEALING_DEBUG === '1') {
    mkdirSync('self-healing', { recursive: true });
    writeFileSync('self-healing/ultimo-prompt.txt', prompt);
  }

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
  const modelo = process.env.LLM_MODEL || 'gemini-3.5-flash-lite';
  if (!process.env.GEMINI_API_KEY) throw new Error('falta GEMINI_API_KEY en .env');
  const res = await conReintento(() => fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent`,
    {
      method: 'POST',
      signal: AbortSignal.timeout(Number(process.env.LLM_TIMEOUT_MS) || 20_000),
      headers: { 'content-type': 'application/json', 'x-goog-api-key': process.env.GEMINI_API_KEY ?? '' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0, responseMimeType: 'application/json' },
      }),
    },
  ));
  if (!res.ok) throw new Error(`Gemini respondió ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
}

async function llamarAnthropic(prompt: string): Promise<string> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    signal: AbortSignal.timeout(Number(process.env.LLM_TIMEOUT_MS) || 20_000),
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

async function conReintento(llamar: () => Promise<Response>): Promise<Response> {
  const res = await llamar();
  if (res.status !== 429 && res.status !== 503) return res;
  console.warn(`[self-healing] el modelo respondió ${res.status}, reintento en 5 s`);
  await new Promise((r) => setTimeout(r, 5_000));
  return llamar();
}

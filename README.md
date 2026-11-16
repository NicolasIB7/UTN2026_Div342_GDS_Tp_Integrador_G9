# Autogestión de inscripciones · Testing E2E con Playwright

Trabajo práctico de Gestión del Desarrollo de Software – Equipo 9.

SPA de inscripción a cursadas (React + Vite) y su suite de pruebas end-to-end con Playwright.

## Requisitos

- Node.js 20 o superior
- npm

## Instalación

```bash
npm ci
npx playwright install --with-deps
```

## Levantar la app

```bash
npm run dev
```

Queda en http://localhost:5173. Usuario de prueba: legajo `103980`, contraseña `utn2024`.

## Correr los tests

No hace falta levantar la app antes: Playwright la levanta sola (`webServer` en `playwright.config.ts`).

| Comando | Qué hace |
| --- | --- |
| `npx playwright test` | Corre toda la suite en Chromium, Firefox, WebKit y mobile |
| `npx playwright test --project=chromium` | Solo en Chromium |
| `npx playwright test tests/login.spec.ts` | Un solo archivo |
| `npx playwright test -g "TC-09"` | Un caso puntual |
| `npm run test:ui` | Modo UI, para ver y depurar paso a paso |
| `npm run test:headed` | Con el navegador visible |
| `npm run report` | Abre el último reporte HTML |
| `npx playwright show-trace <archivo.zip>` | Abre un trace |

## Estructura

```
src/                     SPA
  api/cliente.js         API simulada (con demora)
  data/                  alumno, plan de estudios y comisiones
  pages/                 Login, Oferta, DetalleMateria, MisInscripciones
  components/
tests/
  pages/                 Page Objects
  support/               datos de prueba
  fixtures.ts            fixtures propias (Page Objects y alumno logueado)
  login.spec.ts          F1 – Autenticación
  busqueda.spec.ts       F2 – Búsqueda
  inscripcion.spec.ts    F3 – Inscripción
docs/SPEC.md             spec de testing
playwright.config.ts
```

La spec completa, con los criterios de aceptación de cada caso, está en [docs/SPEC.md](docs/SPEC.md).

## Self-healing de locators (opcional)

Si un locator deja de encontrar su elemento (por un cambio de texto o de rol), el módulo puede consultar un LLM (Gemini o Anthropic) y proponer uno nuevo. Las aserciones no se tocan. En CI queda siempre apagado (GitHub Actions define `CI=true` y el módulo no llama al modelo). Los valores de los campos de texto se tapan como `[REDACTADO]` antes de mandar la página al modelo.

El repo incluye un `.env` listo para usar. También podés copiar `.env.example` y completar tu propia key.

En `SELF_HEALING` elegís el modo:

- `0` — apagado (los tests se comportan como siempre)
- `1` — repara el locator roto y sigue el test (queda anotado en el reporte)
- `sugerir` — solo registra la propuesta en el reporte y en `self-healing/propuestas.jsonl`; el test falla igual

Para probar el módulo sin la app y sin gastar la API (el modelo se simula):

```bash
npm run test:demo
```

Para verlo con la app, cambiá el texto del botón "Ingresar" en `src/pages/Login.jsx` y corré:

```bash
npx playwright test tests/login.spec.ts --project=chromium --workers=1
```

En el reporte HTML, los tests reparados muestran una anotación **self-healing** con el locator original y el propuesto.

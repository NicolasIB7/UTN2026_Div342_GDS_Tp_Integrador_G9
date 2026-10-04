# Autogestión de inscripciones · Testing E2E con Playwright

Trabajo práctico de Gestión del Desarrollo de Software – Equipo 9.

SPA de inscripción a cursadas (React + Vite) y su suite de pruebas end-to-end con Playwright. La suite incluye un mecanismo opcional de *self-healing* de locators con un LLM.

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
  support/               datos de prueba y self-healing
  fixtures.ts            fixtures propias (Page Objects y alumno logueado)
  login.spec.ts          F1 – Autenticación
  busqueda.spec.ts       F2 – Búsqueda
  inscripcion.spec.ts    F3 – Inscripción
tests-demo/              demo de selectores frágiles vs. semánticos
docs/SPEC.md             spec de testing
playwright.config.ts
```

La spec completa, con los criterios de aceptación de cada caso, está en [docs/SPEC.md](docs/SPEC.md).

## Demo: selectores frágiles

```bash
npm run test:demo
```

Corre el mismo flujo dos veces: una con XPath y CSS estructural, otra con `getByRole` / `getByLabel`, entrando a Metodología de Sistemas I. Los dos pasan. Para ver la diferencia, cambiar el markup sin cambiar el comportamiento, por ejemplo en `src/pages/Login.jsx` envolver los dos `<label>` en un `<div>`. El test con XPath se rompe y el semántico sigue pasando.

## Self-healing con LLM

Cuando un locator no encuentra su elemento, `tests/support/self-healing.ts` le manda al modelo el snapshot de accesibilidad de la página y la descripción del elemento. Si el locator que propone resuelve a un único elemento visible, el test sigue y queda registrado en el reporte como anotación `self-healing`. Nunca modifica las aserciones.

Está apagado por defecto. Para usarlo:

1. Copiar `.env.example` a `.env`.
2. Poner `SELF_HEALING=1` y la API key del proveedor (`gemini` o `anthropic`).
3. Correr los tests normalmente.

En CI no se activa aunque la variable esté seteada.


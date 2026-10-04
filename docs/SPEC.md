# Spec de testing – Autogestión de inscripciones

## 1. Contexto de la aplicación

SPA de autogestión para que un alumno se inscriba a cursadas, modelada sobre el plan de estudios 2024 de la Tecnicatura Universitaria en Programación (UTN). Está hecha con React + Vite, usa React Router para la navegación y CSS Modules para los estilos.

No tiene backend: los datos (alumno, plan de estudios y comisiones) están en `src/data` y se acceden a través de `src/api/cliente.js`, que simula una API con una demora de 300 a 700 ms por pedido. La sesión y las inscripciones se guardan en `sessionStorage`, así que cada test arranca con los datos iniciales (cada test corre en un browser context nuevo).

Reglas de negocio:

- Solo se ofrecen las materias que el alumno todavía no aprobó.
- Para inscribirse hay que tener aprobadas todas las correlativas de la materia.
- No se puede inscribir en una comisión sin cupo.
- Solo se puede estar inscripto en una comisión por materia.

### Alumno de prueba

Legajo `103980` (Nicolás Bouvet). Aprobó todas las materias de 1°, 2° y 3° cuatrimestre salvo **Organización Empresarial** y **Metodología de Sistemas I**. Eso deja, en la oferta de 4° cuatrimestre, una combinación realista de materias habilitadas y bloqueadas:

| Materia | Estado | Motivo |
| --- | --- | --- |
| Introducción al Análisis de Datos | Correlativas OK, sin cupo | — |
| Gestión de Desarrollo de Software | Habilitada | — |
| Legislación | Bloqueada | Falta Organización Empresarial |
| Programación IV | Bloqueada | Falta Metodología de Sistemas I |
| Metodología de Sistemas II | Bloqueada por 2 motivos | Faltan Organización Empresarial **y** Metodología de Sistemas I |
| Metodología de Sistemas I (recursar) | Bloqueada | Falta Organización Empresarial |

## 2. Flujos críticos

| Flujo | Descripción |
| --- | --- |
| F1 – Autenticación | Ingreso con legajo y contraseña, validaciones, rutas protegidas y cierre de sesión |
| F2 – Búsqueda | Búsqueda por nombre y filtro por cuatrimestre sobre la oferta de materias |
| F3 – Inscripción | Alta de una inscripción, validación de correlativas (una y dos faltantes) y de cupo, baja de la inscripción |

## 3. Casos de prueba y criterios de aceptación

| ID | Flujo | Escenario | Criterio de aceptación |
| --- | --- | --- | --- |
| TC-01 | F1 | Login con credenciales válidas | Navega a `/oferta`, el encabezado muestra "Nicolás Bouvet" y se lista al menos una materia |
| TC-02 | F1 | Contraseña incorrecta | Sigue en `/login` y se muestra "Legajo o contraseña incorrectos" |
| TC-03 | F1 | Formulario vacío | Sigue en `/login` y se muestra "Completá el legajo y la contraseña" |
| TC-04 | F1 | Ruta privada sin sesión | Al entrar a `/inscripciones` redirige a `/login` y no se muestra el menú |
| TC-05 | F1 | Cerrar sesión | Vuelve a `/login` y al intentar entrar a `/oferta` vuelve a redirigir |
| TC-06 | F2 | Búsqueda por nombre | Buscando "metodolog" se listan Metodología de Sistemas I y II, y la URL incluye el filtro |
| TC-07 | F2 | Filtro por cuatrimestre | Con "4° cuatrimestre" se listan 5 materias y todas son de ese cuatrimestre |
| TC-08 | F2 | Sin resultados | Se muestra "No se encontraron materias" y la lista queda vacía |
| TC-09 | F3 | Inscripción con cupo | Se muestra la confirmación, la comisión queda como "Inscripto", el cupo baja en 1, la otra comisión se deshabilita y la inscripción aparece en Mis inscripciones |
| TC-10 | F3 | Falta una correlativa | Se muestra "No cumplís las correlativas: Organización Empresarial sin aprobar" |
| TC-11 | F3 | Faltan dos correlativas | Se muestra "No cumplís las correlativas: Organización Empresarial, Metodología de Sistemas I sin aprobar" |
| TC-12 | F3 | Comisión sin cupo | La materia aparece con la etiqueta "Sin cupo" y en el detalle todas sus comisiones tienen el botón deshabilitado |
| TC-13 | F3 | Baja de inscripción | Se confirma la baja, Mis inscripciones queda vacía y el cupo de la comisión vuelve al valor original |

Criterios generales:

- No se usan esperas fijas (`waitForTimeout`). Todas las esperas son por estado, con aserciones web-first.
- Los locators viven en los Page Objects y priorizan rol, label y texto visible.
- Cada test es independiente y puede correr en cualquier orden o en paralelo.

## 4. Restricciones técnicas

| Aspecto | Definición |
| --- | --- |
| Navegadores | Chromium, Firefox y WebKit |
| Viewport | 1280 × 720 en escritorio. Proyecto `mobile` (Pixel 7) solo para los tests con tag `@mobile` (TC-01 y TC-09) |
| Datos de prueba | Alumno legajo `103980`, contraseña `utn2024` (Nicolás Bouvet), plan 2024 de la Tecnicatura Universitaria en Programación |
| Entorno | Node.js 20 o superior. La app se levanta sola en `http://localhost:5173` con `webServer` |
| Timeouts | 30 s por test, 5 s por aserción |
| Reintentos | 0 en local, 2 en CI |
| Evidencia | Reporte HTML siempre. Trace en el primer reintento. Captura y video solo si el test falla |

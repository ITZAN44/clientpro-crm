# Plan de Remediación — ClientPro CRM

> **Documento vivo.** Fuente de verdad del trabajo pendiente para llevar el proyecto a producción.
> Cada hallazgo tiene causa raíz verificada y criterio de aceptación. Se tilda a medida que se resuelve.

- **Fecha de auditoría:** 2026-07-15
- **Método:** revisión de código + pruebas funcionales en vivo sobre el entorno Docker (Chrome DevTools).
- **Estado del entorno auditado:** aplicación corriendo en Docker, rama `develop` con árbol de trabajo sucio (refactor "Trading Floor" a medio integrar).

---

## 0. Contexto verificado (no confiar en docs previos)

Varios documentos de `docs/` están desactualizados. Estos son los datos **reales** confirmados en código/runtime:

| Ítem | Realidad verificada |
|---|---|
| Stack backend | NestJS 11 + Prisma 7 + PostgreSQL 16 + Redis + JWT + WebSockets (socket.io) |
| Stack frontend | Next.js 16 + React 19 + Tailwind v4 + TanStack Query/Table + Radix |
| URLs runtime | Frontend `http://localhost:3000`, API vía nginx en `http://localhost/api` |
| Credencial admin real | `admin@clientpro.com` / `Admin123!` (los docs dicen `password123` — **incorrecto**) |
| Reverse proxy | nginx **SÍ está en uso** en runtime (`server: nginx/1.25.5`) |

---

## Leyenda de prioridad

- **P0 — Bloqueante de producción.** Sin esto no se puede desplegar de forma fiable.
- **P1 — Bug visible para el cliente.** Rompe un flujo real o muestra datos incorrectos.
- **P2 — Funcional secundario.** Feature roto pero no crítico para operar.
- **P3 — Deuda / housekeeping.** Limpieza, incompletos, documentación.

---

## P0 — Bloqueantes de producción

### [ ] REM-001 · Divergencia infraestructura repo vs runtime
- **Severidad:** P0
- **Síntoma:** el Docker que corre usa nginx en puerto 80 y el frontend llama a `http://localhost/api`, pero el `docker-compose.yml` del repo **no define el servicio nginx** y `.env.docker` apunta a `NEXT_PUBLIC_API_URL=http://localhost:4000`.
- **Causa raíz:** la imagen en ejecución se construyó con una configuración distinta a la que hoy existe en el repositorio. `nginx/nginx.conf` es un reverse proxy production-grade (rate limiting, gzip, security headers, proxy `/api`→backend, `/api/auth`→frontend, `/socket.io`→backend, `/health` y `/metrics`→backend) pero está huérfano del compose.
- **Impacto:** desplegar desde el repo tal cual deja el sistema **sin nginx, sin rate-limiting, sin security headers y con el frontend apuntando al puerto equivocado**.
- **Evidencia de runtime:** hay un contenedor `clientpro-nginx` (imagen `clientpro-crm-develop-nginx`) corriendo, construido desde un compose de este proyecto **con** servicio nginx — que no coincide con el `docker-compose.yml` versionado. No existe otro `docker-compose*.yml` en el repo.
- **Archivos:** `docker-compose.yml`, `.env.docker`, `nginx/nginx.conf`, `frontend/Dockerfile` (build-arg de `NEXT_PUBLIC_API_URL`).
- **Fix propuesto:** reconstruir el `docker-compose.yml` para que incluya el servicio `nginx` (puerto 80, `depends_on` frontend+backend) y alinear `NEXT_PUBLIC_API_URL` con la ruta real vía proxy. Verificar que `docker compose up` desde cero reproduzca exactamente el entorno que hoy corre.
- **Criterio de aceptación:** `docker compose down -v && docker compose up --build` levanta el sistema completo (nginx incluido) y todos los flujos funcionan igual que el runtime actual, usando solo archivos versionados en el repo.

- **REVISIÓN 2026-07-16 — la causa raíz era otra (mejor noticia):** el `docker-compose.yml` **commiteado (HEAD)** SÍ tiene el servicio nginx + los build args del frontend (`NEXT_PUBLIC_API_URL=http://localhost/api`, `NEXT_PUBLIC_SOCKET_URL`, `NEXTAUTH_URL=http://localhost`). Lo que estaba roto era la copia **sin commitear** del working tree, que alguien **destripó** (borró nginx, borró los build args, cambió a `:4000`). Mismo destripe en `.env.docker` y en `backend/package.json` (removió `@nestjs/terminus`, `@nestjs/throttler`, `helmet`, `nest-winston`, `winston`). La auditoría previa leyó los archivos destripados y concluyó mal.
  - **Acción tomada:** `git checkout HEAD -- docker-compose.yml` (restaurado). Rebuild de backend+frontend OK con nginx intacto.
  - **Sub-hallazgo RESUELTO (2026-07-16):** el frontend hacía llamadas a `http://localhost:4000` directo (fallback) porque el `frontend/Dockerfile` **no declaraba** `ARG NEXT_PUBLIC_API_URL` ni lo exponía como `ENV` antes de `next build`, así que el build-arg del compose se ignoraba. **Fix:** agregados `ARG`/`ENV` para `NEXT_PUBLIC_API_URL` y `NEXT_PUBLIC_SOCKET_URL` en el stage builder. Tras rebuild, el bundle hornea `/api` → el browser pasa por nginx. **Verificar en runtime.**
  - **Sub-hallazgo pendiente (visual):** la build del working tree muestra el tema **azul/púrpura viejo**, no el "Trading Floor" dark commiteado en HEAD (`66d12ef`). El working tree del frontend está **medio revertido** respecto al rediseño. Decisión pendiente del usuario: ¿se descartan esos cambios sin commitear del frontend o hay WIP a conservar?

---

## P1 — Bugs visibles para el cliente

### [x] REM-002 · Notificaciones no se muestran en el dropdown — RESUELTO EN CÓDIGO (2026-07-15, pendiente verificación live tras rebuild)
- **Severidad:** P1
- **Síntoma:** el badge dice "2 sin leer", pero el panel de notificaciones parecía renderizar 0 ítems.
- **Diagnóstico del resumen previo (INCORRECTO):** decía "desajuste de forma de la respuesta". **Verificado y descartado:** el backend responde `{ notificaciones: [...], total, pagina, limite }` (comprobado por `:4000` y por nginx `/api`, ambos 200 con 10 ítems, total 49) y el frontend lee `data?.notificaciones` correctamente. El parseo **está bien**.
- **Causa raíz REAL (frontend, contraste):** verificado en vivo con Chrome DevTools — los ítems **sí están en el DOM** (confirmado por `innerText`), pero `notification-item.tsx` y `notification-dropdown.tsx` **nunca se migraron a los tokens del rediseño "Trading Floor"**. Usaban colores light-mode hardcodeados sin variante `dark:` (`text-stone-900/600/500`, `bg-orange-50`, `bg-white/95 dark:bg-slate-900/95`, gradiente `from-blue-50 to-purple-50`). Sobre el fondo near-black del tema dark, el texto queda oscuro-sobre-oscuro = **invisible**. No es un bug de datos, es de contraste.
- **Archivos:** `frontend/src/components/notifications/notification-item.tsx`, `frontend/src/components/notifications/notification-dropdown.tsx`.
- **Fix aplicado:** migración a tokens semánticos — `text-foreground`, `text-muted-foreground`, `bg-popover`, `bg-card`, `border-border`, `bg-primary` (dot / no-leídas `bg-primary/10`), spinner/íconos `text-primary`, hovers `hover:bg-muted` (se evitó `bg-accent` porque en este sistema `--accent` es lime vivo, no un gris de hover).
- **SEGUNDO BUG (layout, descubierto 2026-07-16):** aun con el color arreglado, el dropdown seguía "sin mostrar nada". Causa: el componente base `frontend/src/components/ui/dropdown-menu.tsx` tenía en `DropdownMenuContent` el **className de un `DropdownMenuItem`** (`focus:bg-blue-50 ... flex cursor-default items-center gap-2 ... pl-8`). Ese `flex` (dirección `row`) apilaba header + lista + footer en **horizontal**, colapsando el `ScrollArea` a ancho 0 (los ítems quedaban exprimidos en ~73px contra el borde). Era un bug del primitivo en HEAD, afecta a todo dropdown con varios hijos.
  - **Fix:** reemplazado el className de `DropdownMenuContent` por el de panel correcto (block, `bg-popover`, `border`, `rounded-md`, `p-1`, animaciones; sin `flex items-center`). Verificado en vivo (parche DOM): `ScrollArea` 0→380px, título 73→296px, ítems legibles y apilados.
- **Criterio de aceptación:** ✅ **VERIFICADO LIVE (2026-07-16)** — color: 10 ítems `rgb(242,242,242)` visible; layout: ítems apilados y legibles con ícono, título, mensaje, fecha y negocio relacionado. Antes: `text-stone-900` invisible + layout colapsado.

### [x] REM-003 · Crear negocio sin fecha de cierre falla (400) — RESUELTO EN CÓDIGO (2026-07-15, pendiente verificación live tras rebuild)
- **Severidad:** P1
- **Síntoma:** al crear un negocio dejando "Fecha de cierre" vacía, no se crea nada (falla silenciosa). Con fecha válida funciona (201).
- **Causa raíz:** el formulario envía `fechaCierreEsperada: ""` (string vacío) en un campo **opcional** (`DateTime?`). `@IsOptional()` de class-validator solo saltea `null`/`undefined`, **no** `""`, así que `@IsDateString` falla → 400 "Fecha de cierre esperada inválida". El formulario de Actividades ya omitía la fecha vacía → inconsistencia.
- **Archivos:** `frontend/src/app/(dashboard)/negocios/negocio-form-dialog.tsx`; `backend/src/negocios/dto/create-negocio.dto.ts`; `backend/src/negocios/dto/update-negocio.dto.ts`.
- **Fix aplicado (defensa en profundidad):**
  1. **Frontend:** `handleFormSubmit` ahora envía `fechaCierreEsperada: data.fechaCierreEsperada || undefined` (omite el campo cuando está vacío).
  2. **Backend:** `@Transform(({ value }) => value === '' ? undefined : value)` en `fechaCierreEsperada` (create, heredado por update vía `PartialType`) y en `fechaCierreReal` (update) — blinda la API ante cualquier cliente. `ValidationPipe` global ya tiene `transform: true`.
- **Test:** nuevo `backend/src/negocios/dto/create-negocio.dto.spec.ts` (4 casos: `""`→undefined válido, ISO válida, ausente, y rechazo de fecha malformada). 4/4 verdes.
- **Criterio de aceptación:** ✅ **VERIFICADO LIVE (2026-07-16)** tras rebuild — se creó un negocio "QA REM-003 sin fecha" desde el formulario con la fecha vacía; quedó en BD con `fecha_cierre_esperada = NULL`, etapa PROSPECTO (antes: 400). Dato de prueba eliminado, conteo restaurado a 13.

### [x] REM-004 · "Tasa de cierre" puede superar el 100% (700%) — RESUELTO (2026-07-15)
- **Severidad:** P1
- **Síntoma:** con 7 negocios ganados y 1 en prospecto, el reporte de conversión muestra **TASA DE CIERRE: 700%**.
- **Causa raíz:** **backend**. En `backend/src/reportes/reportes.service.ts:90-92` el cálculo era `tasaCierre = ganados / prospectos * 100`. Estuvo oculto porque con `PROSPECTO = 0` devolvía 0%.
- **Decisión de negocio:** métrica definida como **win rate** = `ganados / (ganados + perdidos)`. Los negocios aún abiertos en el pipeline no cuentan.
- **Fix aplicado:** `reportes.service.ts` ahora calcula `cerrados = GANADO + PERDIDO` y `tasaCierre = GANADO / cerrados * 100` (0 si no hay cerrados).
- **Test:** nuevo `backend/src/reportes/reportes.service.spec.ts` (3 casos: win rate correcto, guard de regresión que antes daba 700% con negocios abiertos, y guard de división por cero). 3/3 verdes.
- **Criterio de aceptación:** ✅ **VERIFICADO LIVE (2026-07-16)** tras rebuild — API `/reportes/conversion` devuelve `tasaCierre: 77.78` (GANADO=7, PERDIDO=2 → 7/9) y la UI lo muestra. Antes: 700%.
- **Polish adicional:** la UI mostraba el float crudo `77.77777777777779%`; se redondeó a `.toFixed(1)` (`77.8%`) — pendiente re-verificar en el rebuild del frontend.

---

## P2 — Funcional secundario

### [x] REM-005 · Exportar PDF roto (colores oklab/oklch) — RESUELTO EN CÓDIGO (2026-07-15, pendiente verificación live tras rebuild)
- **Severidad:** P2
- **Síntoma:** el botón "Exportar PDF" en `/reportes` no genera nada; consola: `Error al exportar PDF: Attempting to parse an unsupported color function "oklab"`.
- **Causa raíz:** `html2canvas` (usado por el export con `jspdf`) no soporta las funciones de color `oklab`/`oklch` que introdujo **Tailwind v4**. Secuela directa del upgrade bleeding-edge.
- **Archivos:** `frontend/src/app/(dashboard)/reportes/reportes-client.tsx` (`exportToPDF`).
- **Primer intento (FALLIDO):** `onclone` copiando `getComputedStyle().color/...` — **no funcionó**. Verificado en vivo: en este Chrome `getComputedStyle` devuelve los colores en el mismo espacio moderno (`lab()`/`oklab()`), no `rgb`, así que se copiaba `oklab`→`oklab`. El error persistió idéntico tras el primer rebuild.
- **Fix real (aplicado):** `onclone` que convierte cada color a sRGB pintándolo en un canvas 1×1 y leyendo el píxel con `getImageData` (probado en vivo: `oklab(...)`→`rgba(22,37,86)`, con alpha). Cubre `color`, `backgroundColor`, los 4 `border*Color`, `outlineColor`, `textDecorationColor`; y descarta `backgroundImage`/`boxShadow` con stops modernos.
- **Criterio de aceptación:** ✅ **VERIFICADO LIVE (2026-07-16)** — "Exportar PDF" descargó `reportes-crm-2026-07-15.pdf` (17.6 MB) sin el error `oklab` en consola. El botón volvió a su estado normal (no quedó colgado).

---

## P3 — Deuda técnica y funcionalidad incompleta

### [ ] REM-006 · Sección "Configuración" ausente
- **Severidad:** P3
- **Detalle:** el botón existe pero no hay pantalla de configuración funcional. Definir alcance (perfil, equipo, preferencias) antes de implementar.

### [ ] REM-007 · Modelos `Email` y `Nota` sin API
- **Severidad:** P3
- **Detalle:** existen en `schema.prisma` pero no tienen módulo NestJS ni pantalla. Decidir si se completan o se descartan del alcance.

### [ ] REM-008 · Módulos `health` y `metrics` sin cablear
- **Severidad:** P3
- **Detalle:** `backend/src/health` y `backend/src/metrics` existen como código pero **no están importados** en `app.module.ts`. nginx ya enruta `/health` y `/metrics` hacia el backend, así que hoy responderían 404. Cablearlos habilita observabilidad para producción.
- **Nota 2026-07-16:** el working tree removió `@nestjs/terminus` de `package.json`, y `health.module.ts` lo importa → el backend no compilaba. Se excluyeron `src/health` y `src/metrics` de `tsconfig.build.json`.
- **AVANCE 2026-07-16 (vía REM-012):** `HealthModule` **cableado** en `app.module.ts` (terminus re-instalado), `src/health` sacado del `exclude`. `/health` (DB + memoria + Redis) queda funcional. **Falta:** cablear `MetricsModule` (`src/metrics` sigue excluido; solo depende del interceptor local `metrics.interceptor`, sin dep npm) → registrar el interceptor de métricas y wire del módulo.

### [ ] REM-009 · Dependencias basura en backend
- **Severidad:** P3
- **Detalle:** `@nestjs/typeorm` declarado pero sin uso (se migró a Prisma); `recharts` (librería de gráficos de frontend) colada en `backend/package.json`. Eliminar ambas.

### [x] REM-012 · Re-cablear hardening de seguridad (Helmet + Throttler + Health) — RESUELTO (2026-07-16)
- **Severidad:** P2 (seguridad + docs)
- **Detalle:** el working tree removió de `backend/package.json`: `@nestjs/terminus`, `@nestjs/throttler`, `helmet`, `nest-winston`, `winston`. Los docs de seguridad afirmaban que estaban implementados. `health/` importa terminus → el backend no compilaba.
- **Decisión del usuario:** re-cablear **Helmet + Throttler + Health** (Winston queda para después). Justificación: el puerto `:4000` del backend está expuesto en el host → accesible bypasseando nginx, así que el hardening a nivel app es defense-in-depth real, no solapamiento inútil.
- **Fix aplicado:**
  - `npm install @nestjs/terminus @nestjs/throttler helmet` (package.json + lock actualizados).
  - `main.ts`: `app.use(helmet())` (security headers a nivel app).
  - `app.module.ts`: `ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }])` + `APP_GUARD` global `ThrottlerGuard` + import de `HealthModule`.
  - `@SkipThrottle()` en `HealthController` (los health checks no se rate-limitean) y en `NotificacionesGateway` (evita que el guard HTTP rompa el contexto WebSocket).
  - `tsconfig.build.json`: se sacó `src/health` del `exclude` (queda solo `src/metrics`).
- **Tests:** se arreglaron 2 specs **pre-existentes rotos por el dev anterior** (no por REM-012): `clientes.service.spec` y `negocios.service.spec` no mockeaban el `RedisCacheService` que el working tree agregó a esos servicios. Se agregó el mock. **Suite: 138/138 verdes.**
- **VERIFICADO EN RUNTIME (2026-07-16, rebuild `b6hla6lnu`):**
  - **Helmet ✅** — headers presentes: `X-Frame-Options: SAMEORIGIN`, `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `Cross-Origin-Opener-Policy`/`Cross-Origin-Resource-Policy: same-origin`, `X-DNS-Prefetch-Control: off`.
  - **Health ✅** — `GET /health` → `200` con `{database, memory_heap, redis}` todos `up`. (Vía nginx es `/api/health`; nginx quita el `/api`.)
  - **Throttler ✅** — 150× `POST /auth/login` → exactamente `100×400` (pasan) + `50×429`. Corta en la request 101. Límite 100/60s correcto.
- **Gotchas de verificación (para no re-tropezar):** (1) el backend NO tiene prefijo global `api`; las rutas están en raíz (`/health`, `/auth/login`) — el `/api` es solo de nginx. (2) Los guards de Nest (incl. Throttler) NO corren en rutas 404; hay que pegarle a una ruta REAL o nunca cuenta. (3) El compilado está anidado en `dist/src/*.js`.
- **Pendiente:** Winston (logging) sigue abierto. `@prisma/client` sigue en `^7.2.0` (no se re-subió a `^7.4.2`).
- **Relacionado:** [[REM-001]] (mismo destripe de working tree), [[REM-008]] (health cableado; falta metrics).

### [ ] REM-010 · Documentación desactualizada en `docs/`
- **Severidad:** P3
- **Detalle:** credenciales incorrectas (`password123` vs real `Admin123!`), y otros docs que no reflejan el stack real. Requiere pasada de limpieza (tarea aparte, ya planificada).
- **Referencias rotas a corregir en esta pasada:** al archivar las sesiones (ver housekeeping), quedaron 8 docs apuntando a la ruta vieja `docs/sessions/` — corregir a `docs/archive/sessions/` o reescribir según corresponda: `docs/README.md` (múltiples refs + instrucciones de flujo de documentación de sesión), `docs/roadmap/COMPLETED.md`, `docs/roadmap/BACKLOG.md`, `docs/roadmap/README.md`, `docs/decisions/README.md`, `docs/context/OVERVIEW.md`, `docs/context/ARCHITECTURE.md`, `docs/context/README.md`.
- **Estrategia de timing acordada:** el contenido real de los docs se corrige **durante** cada ítem de remediación (cada fix actualiza su propio doc como criterio de aceptación) y una **pasada de consolidación final después** de la remediación. No hacer una reescritura masiva antes de arreglar el código.

---

## Housekeeping de esta auditoría

### [x] REM-011 · Eliminar datos de prueba de la BD Docker — RESUELTO (2026-07-15)
- Registros creados durante la auditoría: cliente `Cliente Prueba QA`, negocio `Negocio Prueba QA` (en PROSPECTO — disparaba el 700% de REM-004), actividad `Actividad Prueba QA`.
- **Eliminados** vía `psql` en el contenedor `clientpro-postgres`. Conteos restaurados: 11 clientes / 13 negocios / 9 actividades.
- **Nota:** al eliminar el negocio de prueba, REM-004 volvió a quedar oculto (PROSPECTO=0). Sigue **sin resolver** — no confundir "oculto" con "arreglado".

### [x] REM-013 · Archivar logs de sesiones históricas — RESUELTO (2026-07-15)
- `docs/sessions/**` (19 archivos: índices + sesiones ene–mar 2026 + `template.md`) movido a `docs/archive/sessions/` vía `git mv` (historial preservado).
- **Pendiente asociado:** corregir las 8 referencias rotas a la ruta vieja (ver REM-010).

### [x] REM-014 · Frontend working tree revertido a HEAD (Trading Floor) — RESUELTO (2026-07-16)
- El working tree del frontend tenía 21 archivos (parte de un diff de 25; los otros 4 eran mis fixes) de un **rework inconsistente y sin commitear** que regresaba el rediseño "Trading Floor" commiteado (blue/purple de vuelta en 17 archivos, 10 solo en el sidebar; `globals.css` cambiado a otro sistema stone/naranja).
- **Decisión del usuario:** descartarlo. `git checkout HEAD -- frontend/src`. Los 4 fixes de frontend (REM-002/003/004/005) se **re-aplicaron sobre las versiones de HEAD** y se verificaron en vivo sobre el Trading Floor.
- **Nota:** el rebuild que destapó esto también reveló que la build corriendo era una imagen vieja del 2026-03-07 (ver [[REM-001]]).

---

## Orden de ataque sugerido

1. **REM-004** y **REM-002** — baratos y muy visibles (métrica incorrecta + notificaciones).
2. **REM-003** — flujo core (crear negocio).
3. **REM-005** — export PDF.
4. **REM-001** — infraestructura (requiere más tiempo y validación de despliegue).
5. **P3** — limpieza y decisiones de alcance.

> Antes de tocar código, confirmar el criterio de negocio de REM-004 (qué es "tasa de cierre" para este producto).

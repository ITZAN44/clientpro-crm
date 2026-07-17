# Plan de Remediación — ClientPro CRM

> **Backlog de trabajo abierto.** Solo ítems verificados contra código commiteado o runtime.
>
> **Reglas de este documento:**
> - Un ítem solo entra si tiene **evidencia citada** (`archivo:línea`, o un comando y su salida).
> - Un ítem cerrado **se borra**, no se tacha. El historial vive en git.
> - Si un ítem resulta falso, **se borra**. No se le agrega una nota de corrección encima.
>
> El motivo de esas reglas: la versión anterior de este archivo acumuló notas de "REVISIÓN"
> sobre ítems que ya eran falsos, y había que leer el ítem entero para saber si el título mentía.
> Eso costó un ciclo de remediación completo. Ver
> `docs/archive/auditorias/2026-07-15-auditoria-remediacion.md`.

- **Última verificación:** 2026-07-17 contra `HEAD` de `fix/remediacion-produccion`
- **Método:** `git show HEAD:<archivo>` + `rg` sobre el código + `curl` contra contenedores reconstruidos

---

## Contexto verificado

| Ítem | Realidad | Evidencia |
|---|---|---|
| Credencial admin | `admin@clientpro.com` / `Admin123!` | `POST :4000/auth/login` → `200` (2026-07-17) |
| Prefijo API backend | **No hay prefijo global.** Rutas en raíz (`/health`, `/auth/login`) | `CLAUDE.md` regla 5 |
| `/api` | Es solo de nginx; el proxy lo quita | `nginx.conf:116` |
| `/api/auth/*` | Va al **frontend** (NextAuth), no al backend | `nginx.conf:102` |
| Suite de tests | 138/138 verdes, 11 suites | `npx jest` (2026-07-17) |

---

## Leyenda de prioridad

- **P0** — Bloqueante de producción.
- **P1** — Bug visible para el cliente.
- **P2** — Funcional secundario.
- **P3** — Deuda / housekeeping.

---

## P0 — Bloqueantes de producción

### [ ] REM-015 · Secretos placeholder en producción
- **Severidad:** P0
- **Evidencia:** `docker-compose.yml:56` define `JWT_SECRET: ${JWT_SECRET:-your-super-secret-jwt-key-change-in-production}`; `:92` lo mismo con `NEXTAUTH_SECRET`; `:9` con `POSTGRES_PASSWORD:-postgres`. Los valores del `.env` local son todos placeholders.
- **Impacto:** un `JWT_SECRET` conocido permite **firmar tokens válidos** para cualquier usuario, incluido admin. El repositorio es público, así que el placeholder es de dominio público.
- **Nota:** `backend/src/common/get-jwt-secret.ts` solo rechaza el secreto **vacío o ausente**, no el placeholder — es intencional, para no bloquear desarrollo local. No protege producción.
- **Criterio de aceptación:** los tres secretos generados con entropía real (mín. 32 bytes) e inyectados por el entorno de despliegue, nunca versionados. Verificar que un token firmado con el placeholder sea rechazado.

---

## P2 — Funcional secundario

### [ ] REM-016 · Vulnerabilidades en dependencias npm
- **Severidad:** P2 (a re-evaluar por ítem; puede haber P0 escondido)
- **Evidencia (`npm audit`, 2026-07-17):**
  - **backend:** 38 vulnerabilidades — 1 crítica, 19 high, 17 moderate, 1 low
  - **frontend:** 20 vulnerabilidades — 1 crítica, 9 high, 9 moderate, 1 low
- **Detalle:** sin triage. El conteo crudo no es accionable: hay que separar lo explotable en runtime de lo que solo afecta al toolchain de build.
- **Criterio de aceptación:** cada crítica y high triada con veredicto explícito (parchear / no aplica y por qué / aceptada con justificación). Las dos críticas resueltas o formalmente aceptadas.

---

## P3 — Deuda técnica y alcance incompleto

### [ ] REM-006 · Sección "Configuración" ausente
- **Severidad:** P3
- **Evidencia:** no existe ruta de configuración en `frontend/src/app`. El botón existe en la navegación pero no lleva a ninguna pantalla funcional.
- **Bloqueado por:** decisión de alcance. Definir qué entra (perfil, equipo, preferencias) antes de estimar.

### [ ] REM-007 · Modelos `Email` y `Nota` sin API
- **Severidad:** P3
- **Evidencia:** `backend/prisma/schema.prisma:206` (`model Email`) y `:230` (`model Nota`) existen. No hay módulo `email/` ni `nota/` en `backend/src` (verificado con `ls backend/src`), ni pantalla en el frontend.
- **Bloqueado por:** decisión de alcance. O se completan, o se sacan del schema. Un modelo sin API es deuda que confunde a quien lee el schema como fuente de verdad del dominio.

### [ ] REM-010 · Documentación desactualizada en `docs/`
- **Severidad:** P3
- **Evidencia verificada:** `AGENTS.md` declara valores de enum que **no existen** en `backend/prisma/schema.prisma` (`CALIFICACION`, `CERRADO_GANADO`, `CERRADO_PERDIDO`, `COP`), y afirma que los tests están sin implementar cuando hay 138 pasando. Escribir código desde ese doc produce código que no compila.
- **Detalle:** además, la credencial documentada (`password123`) es incorrecta; la real es `Admin123!`. Al archivar las sesiones quedaron 8 docs apuntando a la ruta vieja `docs/sessions/`: `docs/README.md`, `docs/roadmap/{COMPLETED,BACKLOG,README}.md`, `docs/decisions/README.md`, `docs/context/{OVERVIEW,ARCHITECTURE,README}.md` → corregir a `docs/archive/sessions/`.
- **Criterio de aceptación:** cada doc reescrito **desde lectura de código verificada**, citando archivo y línea. Un doc que no se pueda respaldar con una cita, se borra. Ver `CLAUDE.md` regla 6.

### [ ] REM-017 · Imagen del backend arrastra el toolchain de Prisma 7
- **Severidad:** P3
- **Evidencia:** la imagen pesa **992MB**; la capa `npm ci --omit=dev` son 580MB. `npm ls` confirma la cadena: `@prisma/client@7.4.2` → `prisma@7.4.2` (CLI) → `@prisma/config` → `effect` (34MB) y `@prisma/dev` → `@mrleebo/prisma-ast` → `chevrotain`. Más `typescript` (23MB) y `@electric-sql` (23MB).
- **Detalle:** ~250MB de herramientas de desarrollo en la imagen de producción **por diseño del packaging de Prisma 7** — el CLI es una dependencia normal, no `dev`, así que `--omit=dev` no lo toca.
- **Decisión tomada (2026-07-17):** **no se poda.** Podarlo requiere borrar `node_modules` a mano después del install y rompería `prisma migrate deploy` si algún día se corre al arrancar el contenedor. Hoy el `CMD` es `node dist/src/main.js` y nadie migra al arranque, pero el costo/beneficio no lo justifica.
- **Reabrir si:** el tamaño de la imagen se vuelve un problema real de despliegue (tiempos de pull, costos de registry).

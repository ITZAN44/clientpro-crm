# Changelog - ClientPro CRM

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

---

## [Unreleased]

### En Desarrollo
- Testing completo (Fase 5)
- Deployment a producción (Fase 6)

---

## [0.4.1] - 2026-02-03

### Added
- **Semgrep MCP - Análisis Estático de Código**
  - Integración de `mcp-server-semgrep` para análisis estático del backend
  - 9 reglas personalizadas en `.semgrep/backend-rules.yaml`:
    - **Calidad**: Detección de console.log/error, magic numbers
    - **Consistencia**: Validación de decoradores @ApiTags en controllers
    - **Seguridad**: Detección de secrets hardcodeados, SQL injection, JWT sin expiración
    - **Best Practices**: Validación de Prisma null checks, async return types
  - Scripts npm: `scan`, `scan:detailed`, `scan:json`
  - Configuración en `.mcp.json` y `opencode.jsonc`
  - Documentación completa en `docs/workflows/STATIC_ANALYSIS.md`
  - ADR 006: Decisión de usar Semgrep en `docs/decisions/006-semgrep-static-analysis.md`

### Changed
- `package.json`: Agregados 3 nuevos scripts de análisis + 2 devDependencies MCP
- `.mcp.json`: Servidor semgrep añadido a la configuración MCP
- `opencode.jsonc`: Semgrep MCP habilitado
- `AGENTS.md`: Actualizado checklist pre-commit (scan opcional)
- `frontend/postcss.config.mjs`: Corregida configuración Tailwind v4 (removido parámetro `base` incorrecto)

### Fixed
- **Frontend sin estilos**: Corregido error de Tailwind CSS v4 que impedía carga de estilos
  - Causa: Parámetro `base` incorrecto en `postcss.config.mjs`
  - Solución: Revertido a configuración estándar `@tailwindcss/postcss: {}`
- **Semgrep MCP Error -32000**: Instaladas dependencias faltantes
  - Instalado `mcp-server-semgrep@1.0.0` localmente (antes usaba npx -y)
  - Instalado `@modelcontextprotocol/sdk@1.25.3` (dependencia requerida)
- **Next.js lock file**: Limpiado `.next/` para resolver conflictos de procesos zombie

### Documentation
- **3 nuevos archivos** de documentación:
  - `docs/workflows/STATIC_ANALYSIS.md` (~300 líneas) - Guía completa de Semgrep
  - `docs/decisions/006-semgrep-static-analysis.md` (~250 líneas) - ADR
  - `docs/sessions/2026/02-FEBRERO/SESION_03_FEBRERO_2026.md` - Log de sesión
- **5 archivos actualizados**: README.md, CHANGELOG.md, docs/README.md, AGENTS.md, índices

### Dependencies
- `mcp-server-semgrep@1.0.0` - Servidor MCP para integración con editores (devDependency)
- `@modelcontextprotocol/sdk@1.25.3` - SDK requerido por MCP servers (devDependency)

### Technical
- **Semgrep CLI**: v1.150.0 instalado vía pip
- **MCP Server**: mcp-server-semgrep@1.0.0 (instalado localmente)
- **Reglas**: 9 custom rules (0 errores de validación)
- **Primera escaneo**: 86 findings en 48 archivos (mayoría INFO/WARNING)
- **Total dependencias nuevas**: 108 packages (24 + 84)

---

## [0.5.0] - 2026-01-30

### Added
- **Reorganización Completa de Documentación**
  - `docs/context/` - 5 archivos (OVERVIEW, STACK, DATABASE, ARCHITECTURE, README)
  - `docs/workflows/` - 6 archivos (DEVELOPMENT, ERROR_HANDLING, TESTING, CODE_REVIEW, DEPLOYMENT, README)
  - `docs/decisions/` - 7 archivos ADRs + template (NestJS, Next.js, Socket.io, Prisma, shadcn/ui)
  - `docs/sessions/` - Reorganizado por año/mes (6 sesiones movidas a 2026/01-ENERO/)
  - `docs/roadmap/` - 4 archivos (COMPLETED, CURRENT, BACKLOG, README)
  - `docs/design/` - README + wireframes + assets/
  - `docs/README.md` - Índice maestro de toda la documentación (~800 líneas)
- **Templates de Documentación**
  - `docs/sessions/template.md` - Plantilla para nuevas sesiones
  - `docs/decisions/template.md` - Plantilla para nuevos ADRs

### Changed
- Movido `docs/wireframe.md` → `docs/design/wireframes.md`
- Movido `docs/image.png` → `docs/design/assets/image.png`
- Movido 6 sesiones de `docs/SESION_*.md` → `docs/sessions/2026/01-ENERO/`
- Toda la documentación reescrita en español (100%)
- Estilo de documentación: claro, conciso, solo información esencial

### Documentation
- **5 subdirectorios** creados en `docs/` para mejor organización
- **33 archivos** de documentación creados/reorganizados
- **~4,000 líneas** de documentación escrita en español
- **Índices README.md** en cada subdirectorio para navegación
- **Mapa mental** de documentación en `docs/README.md`

---

## [0.4.0] - 2026-01-30

### Added
- **Estructura de Skills para OpenCode**
  - Skill: `error-debugging` - Workflow sistemático de debugging (2-3 intentos → pivotar)
  - Skill: `session-report` - Automatización de informes de sesión
  - Skill: `backend-module` - Generador de módulos NestJS completos
- **opencode.jsonc mejorado**
  - Campo `instructions` para auto-cargar documentación clave
  - Configuración de formatters (Prettier backend/frontend)
  - Permissions para Skills, MCP, bash, read, write
  - Compactación automática al 80% de tokens
  - Descripciones detalladas de cada MCP
- **CHANGELOG.md** - Historial de versiones del proyecto

### Changed
- Estructura de carpetas `.opencode/` creada (skills, commands, agents)
- Documentación más organizada y modular

---

## [0.3.0] - 2026-01-23

### Added
- **Módulo de Notificaciones Real-Time**
  - WebSocket con Socket.io 4.8
  - Autenticación JWT en handshake
  - Sistema dual: Persistentes (DB) + Efímeras (WebSocket)
  - Badge de notificaciones con contador
  - Dropdown de notificaciones con auto-actualización
- **Testing Framework**
  - Jest 30 configurado en frontend
  - React Testing Library
  - Mocks para next/navigation, next-auth, socket.io
  - Test de ejemplo para NotificationBadge

### Fixed
- Error 404 en `/api/notificaciones` (faltaba crear endpoint)
- Enums TypeScript no sincronizados con Prisma
- Auto-actualización de notificaciones (polling cada 30s)
- Hydration warnings en componentes de notificaciones

### Changed
- Metodología de trabajo: `get_errors` tool antes de ejecutar código
- Estrategia de debugging: 2-3 intentos → cambiar approach

---

## [0.2.0] - 2026-01-19

### Added
- **TanStack Query v5** integración completa
  - QueryClient configurado en frontend
  - Cache de queries con stale time
  - Mutaciones optimistas
  - Refetch automático
- **Módulo de Actividades**
  - CRUD completo de actividades
  - Tipos: LLAMADA, REUNION, EMAIL, TAREA, NOTA
  - Relación con Clientes y Usuarios
- **Módulo de Reportes**
  - Reporte de ventas por periodo
  - Reporte de actividades por usuario
  - Reporte de conversión de negocios

### Changed
- Migración de fetch nativo a TanStack Query
- Mejora en manejo de estados de carga/error

---

## [0.1.0] - 2026-01-13

### Added
- **Setup Inicial del Proyecto**
  - Monorepo con backend (NestJS 11) y frontend (Next.js 16)
  - Base de datos PostgreSQL con Prisma 7
  - Autenticación JWT
  - Scripts de Concurrently para dev
- **Módulo de Clientes**
  - CRUD completo de clientes
  - Validación con class-validator
  - Paginación y filtros
- **Módulo de Negocios**
  - CRUD de negocios
  - Kanban board con 6 etapas
  - Monedas: USD, EUR, COP, MXN
  - Relación con Clientes
- **Módulo de Estadísticas**
  - Dashboard con métricas del CRM
  - Total de clientes, negocios, valor del pipeline
  - Tasa de conversión

### Technical
- **Backend**:
  - NestJS 11.0.6
  - Prisma 7.0.1
  - PostgreSQL
  - JWT authentication
  - Validación con class-validator
  - 8 modelos Prisma, 5 enums
- **Frontend**:
  - Next.js 16.1.3 (App Router)
  - TypeScript 5.7.3
  - Tailwind CSS v4
  - shadcn/ui (16 componentes)
  - TanStack Query v5
  - Socket.io-client 4.8.1
- **MCPs Configurados**:
  - pgsql (PostgreSQL)
  - chrome-devtools (Browser testing)
  - next-devtools (Next.js monitoring)
  - context7 (Documentation)

---

## Tipos de Cambios

- `Added` - Nuevas funcionalidades
- `Changed` - Cambios en funcionalidades existentes
- `Deprecated` - Funcionalidades que serán eliminadas
- `Removed` - Funcionalidades eliminadas
- `Fixed` - Corrección de bugs
- `Security` - Correcciones de seguridad

---

## Versionamiento

Este proyecto usa [Semantic Versioning](https://semver.org/lang/es/):
- **MAJOR** (X.0.0): Cambios incompatibles en la API
- **MINOR** (0.X.0): Nuevas funcionalidades compatibles
- **PATCH** (0.0.X): Corrección de bugs compatibles

---

**Última actualización**: 30 de Enero de 2026

# Project Context Analysis Agent

> **Propósito**: Prompt reutilizable para análisis completo del proyecto ClientPro CRM
> **Uso**: Invocar al inicio de cada sesión nueva para obtener contexto completo
> **Última actualización**: 27 de febrero de 2026

---

## 🎯 Objetivo

Este agente realiza un análisis exhaustivo del proyecto **ClientPro CRM** para comprender:

1. **Estado actual**: Arquitectura, features implementadas, versión, rama activa
2. **Progreso**: Fases completadas, cobertura de testing, score del roadmap
3. **Infraestructura**: Git Flow, Docker, CI/CD, hooks, workflows
4. **Planificación**: Roadmap, prioridades, siguiente fase recomendada

---

## 📋 Instrucciones de Análisis

### **Paso 1: Información Rápida (AGENTS.md)**

**Archivo a leer**: `/AGENTS.md` (619 líneas)

**Objetivo**: Obtener información resumida del proyecto

**Qué extraer**:

- Stack tecnológico (Backend: NestJS, Frontend: Next.js, DB: PostgreSQL)
- Comandos de desarrollo (`npm run dev`, testing, linting)
- Convenciones de código (naming, import order, TypeScript strict mode)
- Patrones comunes (API client, TanStack Query, NestJS services)
- Reglas críticas (Git hooks, error verification workflow)

---

### **Paso 2: Infraestructura GitHub (.github/)**

**Carpetas a analizar**:

- `.github/workflows/` - CI/CD workflows (test.yml, lint.yml, build.yml)
- `.github/ISSUE_TEMPLATE/` - Templates de issues y PRs
- `.github/copilot/` - Instrucciones y reglas para Copilot

**Desplegar agente especializado**: Sí (opcional si hay muchos workflows)

**Objetivo**: Entender la configuración de CI/CD y DevOps

**Qué extraer**:

- Workflows activos (testing, linting, build, Dependabot)
- Quality gates configurados (coverage mínima, required checks)
- Templates de PR y issue tracking
- Instrucciones de desarrollo (`.github/copilot/instructions.md`)
- Reglas fijas de desarrollo (`.github/copilot/rules.md` - 677 líneas)

---

### **Paso 3: Git Hooks (.husky/)**

**Carpeta a analizar**: `.husky/`

**Objetivo**: Entender los git hooks configurados

**Qué extraer**:

- Pre-commit hook (ESLint + Prettier + lint-staged)
- Commit-msg hook (Conventional Commits validation)
- Pre-push hook (TypeScript check + build validation + bloqueo a master)
- Impacto en el workflow de desarrollo

---

### **Paso 4: Contexto del Proyecto (docs/context/)**

**Archivos críticos**:

- `docs/context/STACK.md` - Stack tecnológico completo
- `docs/context/OVERVIEW.md` - Visión general y arquitectura
- `docs/context/DATABASE.md` - Schema de Prisma (8 modelos, 5 enums)
- `docs/context/ARCHITECTURE.md` - Estructura de archivos y patrones

**Desplegar agente especializado**: Sí (RECOMENDADO - archivos densos)

**Objetivo**: Comprender la arquitectura y decisiones técnicas

**Qué extraer**:

- Versiones exactas de dependencias principales
- Estructura de módulos (backend: 8 módulos, frontend: 7 páginas)
- Modelos de Prisma (Usuario, Cliente, Negocio, Actividad, etc.)
- Enums importantes (RolUsuario, EtapaNegocio, TipoActividad, TipoNotificacion)
- Patrones arquitectónicos (NestJS modules, Next.js App Router, Socket.io)

---

### **Paso 5: Decisiones Arquitectónicas (docs/decisions/)**

**Carpeta a analizar**: `docs/decisions/` (ADRs - Architecture Decision Records)

**Desplegar agente especializado**: Sí (RECOMENDADO - 8 ADRs, algunos con 500+ líneas)

**Objetivo**: Entender el "por qué" de las decisiones técnicas

**ADRs existentes**:

1. `001-nestjs-backend.md` - Por qué NestJS
2. `002-nextjs-16-app-router.md` - Por qué Next.js 16 App Router
3. `003-socket-io-realtime.md` - Por qué Socket.io para real-time
4. `004-prisma-orm.md` - Por qué Prisma como ORM
5. `005-shadcn-ui.md` - Por qué shadcn/ui para componentes
6. `006-semgrep-static-analysis.md` - Por qué Semgrep
7. `007-docker-containerization.md` - Por qué Docker (573 líneas)
8. `008-github-actions-cicd.md` - Por qué GitHub Actions (653 líneas)

**Qué extraer**:

- Justificaciones técnicas
- Alternativas consideradas
- Trade-offs aceptados
- Consecuencias de cada decisión

---

### **Paso 6: Guías de Desarrollo (docs/guides/)**

**Carpetas críticas**:

- `docs/guides/ci-cd/` - GitHub Actions workflows (GITHUB_ACTIONS.md - 925 líneas)
- `docs/guides/docker/` - Docker y docker-compose (DOCKER.md - 495 líneas)
- `docs/guides/git/` - Git Flow, hooks, convenciones (GIT_WORKFLOW.md - 393 líneas)

**Desplegar agente especializado**: Sí (ALTAMENTE RECOMENDADO - archivos muy densos)

**Objetivo**: Comprender los workflows operativos

**Qué extraer**:

- Cómo funciona el Git Flow (develop → staging → master)
- Estrategia de branching (feature/, bugfix/, hotfix/)
- Cómo funcionan los git hooks (pre-commit, commit-msg, pre-push)
- Comandos Docker comunes (build, up, down, logs, troubleshooting)
- Configuración de CI/CD (workflows, secrets, caching, matrix strategy)
- Troubleshooting común (puerto en uso, cache invalido, build failures)

**Otros archivos útiles**:

- `docs/guides/ACCESSIBILITY.md` - WCAG 2.1 AA compliance
- `docs/guides/KEYBOARD_SHORTCUTS.md` - Atajos implementados

---

### **Paso 7: Roadmap y Planificación (docs/roadmap/)**

**Archivos críticos**:

- `docs/roadmap/CURRENT.md` - Sprint/fase actual
- `docs/roadmap/COMPLETED.md` - Histórico de features completadas (1,762 líneas)
- `docs/roadmap/BACKLOG.md` - Próximas fases y features (828 líneas)

**Desplegar agente especializado**: Opcional (archivos grandes pero bien estructurados)

**Objetivo**: Entender el progreso y próximos pasos

**Qué extraer**:

- **Estado actual del MVP**: % de completitud (98%+)
- **Backend Roadmap Score**: % actual vs objetivo (71% → 75-80%)
- **Fases completadas**: Fases 1-5 (MVP core, Testing & Quality)
- **Fase en progreso**: Fase 6 (Producción & DevOps) - Subfases 6.1-6.3 completadas
- **Próxima subfase recomendada**: 6.4 (Redis Caching) o siguiente prioridad
- **Timeline estimado**: Fechas y estimaciones de tiempo
- **Features post-MVP**: Backlog de features futuras (Emails, Búsqueda Global, Exportación)

**Cálculo de impacto**:

- Cada subfase indica su impacto en el Backend Roadmap Score
- Ejemplo: Subfase 6.4 (Redis) → +8% (71% → 79%)

---

### **Paso 8: Sesiones de Desarrollo (docs/sessions/)** - OPCIONAL

**Carpeta a analizar**: `docs/sessions/` (8 sesiones documentadas)

**Objetivo**: Entender la evolución del proyecto y lecciones aprendidas

**Cuándo analizar**:

- Si hay errores recurrentes (ver soluciones en sesiones anteriores)
- Si necesitas contexto histórico de una decisión
- Si quieres evitar repetir errores pasados

**Qué extraer**:

- Problemas encontrados y soluciones aplicadas
- Cambios importantes por fecha
- Lecciones aprendidas (qué NO hacer)

**Nota**: Puede omitirse en análisis rápidos (archivos muy largos)

---

## 🤖 Estrategia de Agentes Paralelos

Para maximizar eficiencia, desplegar **agentes especializados** en paralelo para analizar:

### **Agente 1: Infraestructura**

- Análisis de `.github/workflows/`
- Análisis de `.husky/`
- Resultado: Estado de CI/CD, git hooks, quality gates

### **Agente 2: Arquitectura y Decisiones**

- Análisis de `docs/context/`
- Análisis de `docs/decisions/` (8 ADRs)
- Resultado: Stack completo, justificaciones técnicas, arquitectura

### **Agente 3: Workflows Operativos**

- Análisis de `docs/guides/ci-cd/`
- Análisis de `docs/guides/docker/`
- Análisis de `docs/guides/git/`
- Resultado: Cómo trabajar con Git Flow, Docker, CI/CD

### **Agente 4: Roadmap y Planificación**

- Análisis de `docs/roadmap/CURRENT.md`
- Análisis de `docs/roadmap/COMPLETED.md`
- Análisis de `docs/roadmap/BACKLOG.md`
- Resultado: Progreso actual, próxima prioridad recomendada

### **Coordinación Central**

- Leer `AGENTS.md` primero (información rápida)
- Desplegar 4 agentes en paralelo
- Consolidar resultados en un reporte único

---

## 📊 Reporte de Salida Esperado

Al finalizar el análisis, el agente debe proporcionar:

### **1. Estado Actual del Proyecto**

```
Proyecto: ClientPro CRM
Versión: v0.7.3
Rama activa: develop (commits pendientes de push)
MVP: 98% completo
Backend Roadmap Score: 71% (Objetivo: 75-80%)
Testing Coverage: Backend 96.25%, Frontend 93.75%
```

### **2. Stack Tecnológico**

```
Backend: NestJS 11 + Prisma 7 + PostgreSQL 16 + Redis 7
Frontend: Next.js 16 (App Router) + React 19 + TanStack Query v5
Real-time: Socket.io 4.8 con autenticación JWT
Testing: Jest 30 (96 tests backend, 144 tests frontend)
DevOps: Docker Compose (4 servicios), GitHub Actions (3 workflows), Husky (3 hooks)
```

### **3. Fases Completadas**

```
✅ Fase 1-4: MVP Core (Auth, CRUD, Dashboard, Real-time)
✅ Fase 5: Testing & Quality (96%+ cobertura, Dark Mode)
✅ Subfase 6.1: Version Control (Git Flow + GitHub)
✅ Subfase 6.2: Containerization (Docker + docker-compose)
✅ Subfase 6.3: CI/CD Pipeline (GitHub Actions workflows)
```

### **4. Fase en Progreso**

```
🔄 Fase 6: Producción & DevOps (35% completada)
  - Subfases 6.1-6.3: COMPLETADAS
  - Subfases 6.4-6.7: PENDIENTES
```

### **5. Próxima Prioridad RECOMENDADA**

```
🎯 Subfase 6.4: Redis Caching
  - Tiempo estimado: 1 semana
  - Impacto: +8% al Backend Roadmap Score (71% → 79%)
  - Redis ya disponible en docker-compose
  - Beneficio: Response times < 100ms para queries cacheadas
  - Tareas: Instalar paquetes, implementar cache en servicios, configurar TTLs, invalidación automática
```

### **6. Infraestructura DevOps**

```
Git Flow: develop → staging → master (branch protection pendiente)
Git Hooks: pre-commit (lint), commit-msg (conventional commits), pre-push (TypeScript + build)
Docker: 4 servicios (postgres, redis, backend, frontend) con healthchecks
CI/CD: 3 workflows (test, lint, build) + Dependabot
```

### **7. Archivos Importantes**

```
- AGENTS.md (619 líneas) - Quick reference para agentes
- .github/copilot/rules.md (677 líneas) - Reglas de desarrollo
- docs/context/STACK.md - Stack tecnológico completo
- docs/roadmap/BACKLOG.md (828 líneas) - Próximas fases detalladas
- docker-compose.yml - Orquestación de 4 servicios
```

### **8. Issues Pendientes (si aplica)**

```
- Commit pendiente de push en rama develop
- Archivos untracked: backup_local_db.sql, docs/nul
- Branch protection no aplicada en GitHub (documentada pero pendiente)
```

### **9. Recomendación Final**

```
ACCIÓN RECOMENDADA: Implementar Subfase 6.4 (Redis Caching)
ALTERNATIVA: Push pendiente commit + implementar Subfase 6.5 (Nginx)
JUSTIFICACIÓN: Redis ya está en docker-compose, alto impacto (+8%), plan de implementación claro en BACKLOG.md (líneas 234-301)
```

---

## 🚀 Cómo Invocar Este Agente

### **Opción 1: Prompt Directo**

```
Ejecuta el análisis completo del proyecto usando las instrucciones de .github/copilot/project-context-agent.md
```

### **Opción 2: Prompt Mejorado (Recomendado)**

```
Necesito contexto completo del proyecto ClientPro CRM.

Por favor:
1. Lee AGENTS.md para información rápida
2. Despliega agentes paralelos para analizar:
   - Infraestructura (.github/, .husky/)
   - Arquitectura (docs/context/, docs/decisions/)
   - Workflows operativos (docs/guides/)
   - Roadmap (docs/roadmap/)
3. Consolida resultados siguiendo el formato de .github/copilot/project-context-agent.md
4. Proporciona la próxima acción recomendada

Objetivo: Entender estado actual, progreso, infraestructura DevOps, y qué hacer a continuación.
```

### **Opción 3: Slash Command Personalizado** (Si está disponible)

```
/analyze-project-context
```

---

## ⚙️ Configuración del Agente

**Características**:

- ✅ Análisis paralelo de carpetas (eficiencia)
- ✅ Enfoque en información crítica (priorización)
- ✅ Reporte estructurado (fácil de leer)
- ✅ Recomendación accionable (next steps claros)
- ✅ Reutilizable en cada sesión nueva

**Tiempo estimado de ejecución**: 2-3 minutos (con agentes paralelos)

**Actualización del prompt**: Cada vez que se complete una fase mayor o cambie el roadmap

---

## 📚 Referencias

- `AGENTS.md` - Quick reference guide
- `.github/copilot/rules.md` - Fixed development rules
- `.github/copilot/instructions.md` - Session startup checklist
- `docs/roadmap/BACKLOG.md` - Detailed planning

---

**Fin de project-context-agent.md** | Prompt reutilizable para análisis completo del proyecto ClientPro CRM

# 🔍 Project Context Analysis Skill

> **Propósito**: Análisis completo y automático del proyecto ClientPro CRM al inicio de cada sesión
> **Basado en**: Análisis paralelo de documentación, infraestructura, y roadmap
> **Última actualización**: 27 de febrero de 2026

---

## 📋 ¿Cuándo usar este Skill?

Invoca este skill cuando:

- Inicias una nueva sesión de desarrollo
- Necesitas contexto completo del proyecto
- Quieres saber qué hacer a continuación
- Regresas después de días/semanas sin trabajar en el proyecto
- Necesitas entender el estado actual del MVP

**Comando de invocación**: `/analyze-project` o "analiza el contexto completo del proyecto"

---

## 🎯 Objetivo

Este skill realiza un análisis exhaustivo del proyecto **ClientPro CRM** para comprender:

1. **Estado actual**: Arquitectura, features implementadas, versión, rama activa
2. **Progreso**: Fases completadas, cobertura de testing, score del roadmap
3. **Infraestructura**: Git Flow, Docker, CI/CD, hooks, workflows
4. **Planificación**: Roadmap, prioridades, siguiente fase recomendada

---

## 🤖 Estrategia de Ejecución

### **Análisis Secuencial con Priorización**

El análisis se realiza en **4 fases** con información progresivamente más detallada:

---

### **FASE 1: Contexto Rápido (OBLIGATORIO)**

**Archivos a leer** (2 archivos):

1. `AGENTS.md` (619 líneas) - Quick reference completo
2. `docs/roadmap/BACKLOG.md` (828 líneas) - Próximas fases

**Objetivo**: Obtener información crítica en < 30 segundos

**Qué extraer**:

- ✅ Stack tecnológico (Backend: NestJS 11, Frontend: Next.js 16, DB: PostgreSQL 16, Redis 7)
- ✅ Comandos de desarrollo (`npm run dev`, `npm test`, `npm run lint`)
- ✅ Convenciones de código (naming, import order, TypeScript strict)
- ✅ Estado del MVP (% completitud)
- ✅ Backend Roadmap Score actual vs objetivo
- ✅ Próxima subfase recomendada (6.4, 6.5, 6.6, etc.)
- ✅ Impacto estimado de cada subfase en el score

**Output esperado**:

```
📊 ESTADO ACTUAL:
Proyecto: ClientPro CRM v0.7.3
Rama: develop
MVP: 98% completo
Backend Score: 71% (Objetivo: 75-80%)
Testing: Backend 96.25%, Frontend 93.75%

🎯 PRÓXIMA PRIORIDAD:
Subfase 6.4: Redis Caching
- Tiempo: 1 semana
- Impacto: +8% (71% → 79%)
- Tareas: 4 principales (instalar, implementar, TTLs, docs)
```

---

### **FASE 2: Infraestructura DevOps (SI SE REQUIERE)**

**Carpetas a analizar**:

1. `.github/workflows/` - CI/CD workflows (3 archivos)
2. `.github/ISSUE_TEMPLATE/` - Templates
3. `.husky/` - Git hooks (3 archivos)

**Cuándo ejecutar**: Si el usuario pregunta por:

- Git Flow, branching strategy, commit conventions
- CI/CD pipeline, workflows, quality gates
- Pre-commit hooks, linting, formatting

**Desplegar agente especializado**: Sí (opcional para eficiencia)

**Qué extraer**:

- ✅ Workflows activos (test.yml, lint.yml, build.yml, dependabot.yml)
- ✅ Quality gates (coverage mínima 85%, required checks)
- ✅ Git hooks activos (pre-commit, commit-msg, pre-push)
- ✅ Impacto de hooks en desarrollo (ESLint auto-fix, bloqueo a master)

**Output esperado**:

```
🔧 INFRAESTRUCTURA DEVOPS:
Git Flow: develop → staging → master
Branches: feature/, bugfix/, hotfix/
Commits: Conventional Commits (feat, fix, docs, etc.)

Hooks activos:
✅ pre-commit: ESLint + Prettier (auto-fix)
✅ commit-msg: Validates format
✅ pre-push: TypeScript check + build + blocks master

CI/CD Workflows:
✅ test.yml: Backend (96 tests) + Frontend (144 tests)
✅ lint.yml: ESLint + TypeScript check
✅ build.yml: Build both + Docker validation
✅ dependabot.yml: Weekly npm updates
```

---

### **FASE 3: Arquitectura y Decisiones (SI SE REQUIERE)**

**Carpetas a analizar**:

1. `docs/context/` - Stack, overview, architecture, database
2. `docs/decisions/` - 8 ADRs (Architecture Decision Records)

**Cuándo ejecutar**: Si el usuario pregunta por:

- "¿Por qué se eligió NestJS/Next.js/Prisma/Socket.io?"
- "¿Qué modelos hay en la base de datos?"
- "¿Cómo está estructurado el proyecto?"
- "¿Qué enums existen?"

**Desplegar agente especializado**: Sí (RECOMENDADO - ADRs con 500+ líneas cada uno)

**Qué extraer**:

- ✅ Modelos de Prisma (8 modelos: Usuario, Cliente, Negocio, Actividad, Email, Nota, Notificacion, Equipo)
- ✅ Enums principales (RolUsuario, EtapaNegocio, TipoActividad, TipoNotificacion, TipoMoneda)
- ✅ Justificaciones técnicas de decisiones (por qué X en lugar de Y)
- ✅ Trade-offs aceptados
- ✅ Estructura de módulos (backend: 8 módulos, frontend: 7 páginas)

**Output esperado**:

```
🏗️ ARQUITECTURA:
Backend: 8 módulos (auth, clientes, negocios, actividades, reportes, stats, notificaciones, usuarios)
Frontend: 7 páginas (login, dashboard, clientes, negocios, actividades, reportes, configuracion)
Database: 8 modelos, 5 enums

Decisiones clave (ADRs):
✅ NestJS: Arquitectura modular, TypeScript nativo, decorators
✅ Next.js 16: App Router, Server Components, mejor SEO
✅ Prisma: Type-safety, migraciones automáticas, mejor DX
✅ Socket.io: Real-time bi-direccional, JWT auth, rooms
✅ Docker: Containerization completa (4 servicios)
```

---

### **FASE 4: Workflows Operativos (SI SE REQUIERE)**

**Carpetas a analizar**:

1. `docs/guides/ci-cd/` - GitHub Actions workflows (925 líneas)
2. `docs/guides/docker/` - Docker y docker-compose (495 líneas)
3. `docs/guides/git/` - Git Flow, hooks, convenciones (393 líneas)

**Cuándo ejecutar**: Si el usuario pregunta por:

- "¿Cómo ejecuto el proyecto con Docker?"
- "¿Cómo funciona el workflow de Git?"
- "¿Cómo funcionan los workflows de CI/CD?"
- Troubleshooting de Docker/Git/CI

**Desplegar agente especializado**: Sí (ALTAMENTE RECOMENDADO - archivos muy densos)

**Qué extraer**:

- ✅ Comandos Docker comunes (build, up, down, logs, exec)
- ✅ Troubleshooting Docker (puerto en uso, cache inválido, healthchecks)
- ✅ Estrategia de branching detallada
- ✅ Configuración de workflows (secrets, caching, matrix strategy)
- ✅ Cómo crear feature branches y PRs

**Output esperado**:

```
🛠️ WORKFLOWS OPERATIVOS:
Docker:
- Levantar stack: docker-compose up -d
- Ver logs: docker-compose logs -f [service]
- Rebuild: docker-compose up -d --build
- 4 servicios: postgres, redis, backend, frontend

Git Flow:
1. git checkout develop
2. git pull origin develop
3. git checkout -b feature/nombre-feature
4. [Develop feature]
5. git add . && git commit -m "feat(scope): description"
6. git push -u origin feature/nombre-feature
7. [Create PR on GitHub]

CI/CD:
- Tests run en cada push/PR (GitHub Actions)
- Coverage mínima: 85%
- Build validation antes de merge
```

---

## 📊 Output Final Consolidado

Al completar el análisis, el skill debe generar un **reporte estructurado**:

### **1. Resumen Ejecutivo**

```
📦 ClientPro CRM - Estado Actual
========================================
Versión: v0.7.3
Rama: develop (1 commit pendiente de push)
MVP: 98% completo ✅
Backend Roadmap Score: 71% → Objetivo: 75-80%

Stack Principal:
- Backend: NestJS 11 + Prisma 7 + PostgreSQL 16 + Redis 7
- Frontend: Next.js 16 (App Router) + React 19 + TanStack Query v5
- Real-time: Socket.io 4.8 con JWT auth
- Testing: Jest 30 (Backend 96.25%, Frontend 93.75%)
- DevOps: Docker (4 servicios), GitHub Actions (3 workflows), Husky (3 hooks)
```

### **2. Progreso del Proyecto**

```
✅ Fases Completadas:
- Fase 1-4: MVP Core (Auth, CRUD, Dashboard, Real-time) - 100%
- Fase 5: Testing & Quality (96%+ coverage, Dark Mode) - 100%
- Subfase 6.1: Version Control (Git Flow + GitHub) - 90%
- Subfase 6.2: Containerization (Docker) - 85%
- Subfase 6.3: CI/CD Pipeline (GitHub Actions) - 71%

🔄 Fase en Progreso:
- Fase 6: Producción & DevOps - 35% completa
  - Subfases completadas: 6.1, 6.2, 6.3
  - Subfases pendientes: 6.4, 6.5, 6.6, 6.7
```

### **3. Próxima Acción RECOMENDADA**

```
🎯 SUBFASE 6.4: REDIS CACHING
========================================
Prioridad: ALTA
Tiempo estimado: 1 semana
Impacto: +8% (71% → 79% Backend Score)

¿Por qué esta subfase?
✅ Redis ya disponible en docker-compose (puerto 6379)
✅ Alto impacto en performance (< 100ms cached queries)
✅ Plan de implementación claro en BACKLOG.md (líneas 234-301)
✅ Siguiente paso lógico después de CI/CD

Tareas principales:
1. Instalar paquetes (ioredis, @nestjs/cache-manager, cache-manager-redis-yet)
2. Crear módulo Redis (backend/src/redis/)
3. Implementar cache en servicios (clientes, negocios, stats)
4. Configurar TTLs (Time To Live) por tipo de dato
5. Implementar invalidación automática en mutations
6. HTTP caching headers (Cache-Control, ETags)
7. Documentar estrategia de caching

Archivos a crear/modificar:
- backend/package.json (agregar dependencias)
- backend/src/redis/redis.module.ts (nuevo)
- backend/src/clientes/clientes.service.ts (modificar)
- backend/src/negocios/negocios.service.ts (modificar)
- backend/src/stats/stats.service.ts (modificar)
- docs/guides/CACHING.md (nuevo - documentación)

Validación de completitud:
✅ Redis funcionando en Docker
✅ Cache hits medibles en logs
✅ Response times < 100ms para queries cacheadas
✅ Invalidación automática funcionando
✅ Backend Roadmap Score aumentado a 79%
```

### **4. Alternativas (si no quiere Redis ahora)**

```
Otras opciones:
- Subfase 6.5: Nginx Web Server (2 días, +5%, Nginx reverse proxy)
- Subfase 6.6: Security & Observability (1 semana, +5%, Helmet + Winston + Health checks)
- Subfase 6.7: API Documentation (2 días, Swagger/OpenAPI)
- Features Post-MVP: Emails, Búsqueda Global, Exportación de datos
```

### **5. Issues Pendientes (si aplica)**

```
⚠️ Acciones requeridas:
- [ ] Push commit pendiente en rama develop
- [ ] Limpiar archivos untracked: backup_local_db.sql, docs/nul
- [ ] Aplicar branch protection en GitHub (documentado pero no activado)
```

---

## ✅ Checklist de Ejecución del Skill

### **Paso 1: Leer AGENTS.md + BACKLOG.md**

- [ ] Extraer stack tecnológico
- [ ] Extraer comandos de desarrollo
- [ ] Extraer estado del MVP (%)
- [ ] Extraer Backend Roadmap Score actual
- [ ] Identificar próxima subfase recomendada
- [ ] Calcular impacto de próxima subfase

### **Paso 2: Verificar estado de Git**

- [ ] `git status` - Ver rama actual, commits pendientes, archivos untracked
- [ ] `git log -1` - Ver último commit
- [ ] `git branch -a` - Ver todas las ramas

### **Paso 3: Análisis opcional (según contexto)**

- [ ] Si usuario pregunta por Git/CI/Hooks → Ejecutar **FASE 2**
- [ ] Si usuario pregunta por arquitectura/decisiones → Ejecutar **FASE 3**
- [ ] Si usuario pregunta por workflows/troubleshooting → Ejecutar **FASE 4**

### **Paso 4: Generar reporte consolidado**

- [ ] Sección 1: Resumen Ejecutivo (stack, versión, score)
- [ ] Sección 2: Progreso del Proyecto (fases completadas)
- [ ] Sección 3: Próxima Acción RECOMENDADA (con justificación)
- [ ] Sección 4: Alternativas (si no quiere la recomendación)
- [ ] Sección 5: Issues Pendientes (git status, archivos untracked)

### **Paso 5: Preguntar al usuario**

- [ ] "¿Quieres que empiece con [Subfase Recomendada]?"
- [ ] "¿O prefieres trabajar en otra cosa?"

---

## 🎓 Tips y Best Practices

1. **Siempre leer AGENTS.md primero** - Tiene toda la información crítica en 619 líneas
2. **Priorizar información accionable** - El usuario quiere saber QUÉ HACER, no solo QUÉ EXISTE
3. **Desplegar agentes solo cuando sea necesario** - No analizar FASE 3/4 si no se pregunta por ello
4. **Recomendar SIEMPRE la próxima subfase** - El usuario espera una recomendación clara
5. **Justificar la recomendación** - Explicar por qué esa subfase es la mejor opción
6. **Ser conciso** - Reporte de máximo 100 líneas, no 500+

---

## 📚 Referencias

- **AGENTS.md** - Quick reference completo (619 líneas)
- **docs/roadmap/BACKLOG.md** - Próximas fases detalladas (828 líneas)
- **docs/roadmap/COMPLETED.md** - Histórico de features (1,762 líneas)
- **docs/roadmap/CURRENT.md** - Sprint actual
- **.github/copilot/rules.md** - Reglas de desarrollo (677 líneas)

---

## 🚀 Ejemplo de Invocación

**Usuario dice**:

```
Analiza el contexto completo del proyecto
```

**Skill ejecuta**:

1. Lee `AGENTS.md` (stack, comandos, convenciones)
2. Lee `docs/roadmap/BACKLOG.md` (próximas subfases)
3. Ejecuta `git status` (estado actual)
4. Genera reporte consolidado (5 secciones)
5. Pregunta: "¿Quieres que empiece con Subfase 6.4 (Redis Caching)?"

**Tiempo estimado**: 30-60 segundos (sin agentes adicionales)

---

**Última actualización**: 27 de febrero de 2026
**Versión**: 1.0.0
**Autor**: ClientPro CRM Team

# Git Workflow - ClientPro CRM

## Estrategia de Branching: Git Flow

Este proyecto utiliza una estrategia de Git Flow adaptada para equipos pequeños y desarrollo continuo.

### Ramas Principales

#### `master` (Producción)
- **Propósito**: Código en producción, estable y probado
- **Protección**: Requiere PR con revisión aprobada
- **Deploy**: Automático a producción (cuando se configure CI/CD)
- **Commits directos**: ❌ Prohibidos

#### `staging` (Pre-producción)
- **Propósito**: Testing final antes de producción
- **Protección**: Requiere PR desde `develop`
- **Deploy**: Automático a entorno de staging (cuando se configure CI/CD)
- **Merges desde**: Solo `develop` o hotfixes
- **Merges hacia**: `master`

#### `develop` (Desarrollo)
- **Propósito**: Integración continua de features
- **Protección**: Requiere PR con tests pasando
- **Deploy**: Automático a entorno de desarrollo (cuando se configure CI/CD)
- **Merges desde**: Feature branches
- **Merges hacia**: `staging`

### Ramas de Trabajo

#### Feature Branches (`feature/*`)
```bash
# Crear feature branch desde develop
git checkout develop
git pull origin develop
git checkout -b feature/nombre-descriptivo

# Ejemplo:
git checkout -b feature/client-filters
git checkout -b feature/email-notifications
```

**Nomenclatura**:
- `feature/client-filters` - Nueva funcionalidad de filtros de clientes
- `feature/kanban-drag-drop` - Drag & drop en el tablero Kanban
- `feature/dashboard-widgets` - Nuevos widgets para el dashboard

**Workflow**:
1. Trabajar en la feature
2. Commitear frecuentemente con mensajes descriptivos
3. Hacer push regularmente
4. Crear PR a `develop` cuando esté listo
5. Esperar revisión y aprobación
6. Mergear a `develop`
7. Eliminar la rama feature

#### Bugfix Branches (`bugfix/*`)
```bash
# Crear bugfix branch desde develop
git checkout develop
git pull origin develop
git checkout -b bugfix/descripcion-bug

# Ejemplo:
git checkout -b bugfix/notification-badge-count
git checkout -b bugfix/date-picker-timezone
```

**Workflow**: Igual que feature branches

#### Hotfix Branches (`hotfix/*`)
```bash
# Crear hotfix branch desde master (urgente)
git checkout master
git pull origin master
git checkout -b hotfix/critical-issue

# Ejemplo:
git checkout -b hotfix/auth-token-expiration
```

**Workflow**:
1. Trabajar en el fix crítico
2. Crear PR a `master` Y `develop`
3. Mergear en ambas ramas
4. Tag de versión patch (v0.7.1)

#### Release Branches (`release/*`)
```bash
# Crear release branch desde develop
git checkout develop
git pull origin develop
git checkout -b release/v1.0.0
```

**Propósito**: Preparación de release (bump de versión, changelog, bug fixes finales)

**Workflow**:
1. Crear desde `develop`
2. Bump version en `package.json`
3. Actualizar `CHANGELOG.md`
4. Solo bug fixes, no features nuevas
5. PR a `staging` para testing final
6. PR a `master` para producción
7. Tag de versión
8. Merge back a `develop`

---

## Convenciones de Commits

Usamos **Conventional Commits** para mensajes de commit consistentes:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Tipos de Commit

- `feat`: Nueva funcionalidad
- `fix`: Corrección de bug
- `docs`: Cambios en documentación
- `style`: Formateo, punto y coma faltantes, etc. (no cambios de código)
- `refactor`: Refactorización (ni fix ni feature)
- `perf`: Mejora de rendimiento
- `test`: Agregar o modificar tests
- `chore`: Mantenimiento (deps, config, etc.)
- `ci`: Cambios en CI/CD
- `build`: Cambios en sistema de build
- `revert`: Revertir commit anterior

### Ejemplos de Commits

```bash
# Feature
feat(clientes): add advanced filter with multiple criteria

# Bug fix
fix(auth): resolve token expiration issue on page refresh

# Documentation
docs(readme): update installation instructions for Windows

# Refactor
refactor(negocios): extract Kanban logic to custom hook

# Performance
perf(dashboard): optimize stats query with database indexing

# Test
test(notificaciones): add unit tests for WebSocket gateway

# Chore
chore(deps): update NestJS to v11.0.5
```

### Scope Guidelines

**Backend scopes**:
- `auth` - Autenticación y autorización
- `clientes` - Módulo de clientes
- `negocios` - Módulo de negocios/deals
- `actividades` - Módulo de actividades
- `notificaciones` - Módulo de notificaciones
- `reportes` - Módulo de reportes
- `stats` - Estadísticas del dashboard
- `prisma` - Cambios en schema o migraciones
- `api` - Cambios generales en API

**Frontend scopes**:
- `ui` - Componentes de UI (shadcn/ui)
- `dashboard` - Página del dashboard
- `kanban` - Tablero Kanban
- `forms` - Formularios
- `hooks` - React hooks
- `routing` - Next.js routing
- `state` - State management (TanStack Query)
- `socket` - Socket.io client

**General scopes**:
- `deps` - Dependencias
- `config` - Configuración
- `ci` - CI/CD
- `docs` - Documentación
- `security` - Seguridad

---

## Proceso de Pull Request

### 1. Antes de crear el PR

```bash
# Asegurarse de tener los últimos cambios
git checkout develop
git pull origin develop

# Mergear develop en tu feature branch
git checkout feature/tu-feature
git merge develop

# Resolver conflictos si existen
# Ejecutar tests
npm test

# Verificar lint
npm run lint:backend
npm run lint:frontend

# Build completo
npm run build
```

### 2. Crear Pull Request

1. Push de tu rama a GitHub
2. Ir a GitHub y crear PR
3. Completar el template de PR
4. Asignar revisores (si aplica)
5. Agregar labels apropiados
6. Vincular issues relacionados

### 3. Durante la revisión

- Responder a comentarios
- Hacer commits adicionales con fixes
- No hacer force push (conservar el historial de revisión)
- Mantener la conversación profesional y constructiva

### 4. Después de la aprobación

- Verificar que todos los checks pasen (CI/CD cuando se configure)
- Usar **Squash and Merge** para features pequeñas
- Usar **Merge Commit** para features grandes o releases
- Eliminar la rama feature después del merge

---

## Branch Protection Rules (GitHub)

### Configuración recomendada para `master`:

- ✅ Require pull request before merging
- ✅ Require approvals: 1
- ✅ Dismiss stale reviews when new commits are pushed
- ✅ Require status checks to pass (cuando se configure CI/CD)
- ✅ Require branches to be up to date
- ✅ Restrict who can push (solo admins)
- ✅ Do not allow force pushes
- ✅ Do not allow deletions

### Configuración recomendada para `develop`:

- ✅ Require pull request before merging
- ⚠️ Require approvals: 0 (para equipos pequeños) o 1 (para equipos más grandes)
- ✅ Require status checks to pass
- ✅ Do not allow force pushes

### Configuración recomendada para `staging`:

- ✅ Require pull request before merging
- ✅ Require approvals: 1
- ✅ Require status checks to pass
- ✅ Do not allow force pushes

---

## Versionado Semántico

Seguimos **Semantic Versioning 2.0.0** (semver.org):

```
MAJOR.MINOR.PATCH (ej: 1.4.2)
```

- **MAJOR** (1.0.0): Cambios incompatibles en la API
- **MINOR** (0.1.0): Nuevas funcionalidades backwards-compatible
- **PATCH** (0.0.1): Bug fixes backwards-compatible

### Ejemplos:

- `v0.7.0` → `v0.7.1`: Bug fix menor
- `v0.7.0` → `v0.8.0`: Nueva feature (reportes mejorados)
- `v0.9.0` → `v1.0.0`: Primera versión estable (breaking changes)

### Cómo crear un tag:

```bash
# Después de mergear a master
git checkout master
git pull origin master

# Crear tag anotado
git tag -a v1.0.0 -m "Release v1.0.0 - Production ready"

# Push del tag
git push origin v1.0.0

# Ver todos los tags
git tag -l
```

---

## Comandos Útiles

### Sincronizar tu rama con develop

```bash
git checkout develop
git pull origin develop
git checkout feature/tu-feature
git merge develop
# O usar rebase (para historia más limpia, pero más riesgoso):
# git rebase develop
```

### Ver ramas locales y remotas

```bash
git branch -a
git branch -vv  # Con info de tracking
```

### Eliminar ramas

```bash
# Local
git branch -d feature/completed-feature

# Forzar eliminación local
git branch -D feature/abandoned-feature

# Remoto
git push origin --delete feature/old-feature
```

### Ver el estado del repositorio

```bash
git status
git log --oneline --graph --all --decorate
git remote -v
```

### Deshacer cambios

```bash
# Descartar cambios no comiteados en archivo
git checkout -- archivo.ts

# Descartar todos los cambios no comiteados
git reset --hard

# Volver al último commit
git reset HEAD~1

# Crear commit que revierte otro commit
git revert <commit-hash>
```

---

## Recursos

- [Git Flow Original](https://nvie.com/posts/a-successful-git-branching-model/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)
- [GitHub Flow](https://guides.github.com/introduction/flow/)
- [Keep a Changelog](https://keepachangelog.com/)

---

**Última actualización**: Febrero 23, 2026  
**Versión del documento**: 1.0.0

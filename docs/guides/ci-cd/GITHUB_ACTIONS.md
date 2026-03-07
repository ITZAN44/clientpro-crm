# GitHub Actions - Guía de CI/CD

> **Última actualización**: 24 de febrero de 2026  
> **Versión**: v0.7.3  
> **Estado**: Producción Ready ✅

---

## 📋 Tabla de Contenidos

1. [Introducción](#-introducción)
2. [Workflows Implementados](#-workflows-implementados)
3. [Configuración Local](#-configuración-local)
4. [Interpretación de Resultados](#-interpretación-de-resultados)
5. [Branch Protection Rules](#-branch-protection-rules)
6. [Dependabot](#-dependabot)
7. [Troubleshooting](#-troubleshooting)
8. [Badges en README](#-badges-en-readme)
9. [Referencias](#-referencias)

---

## 🚀 Introducción

### ¿Qué es CI/CD?

**CI/CD** (Continuous Integration/Continuous Deployment) es una metodología de desarrollo que automatiza:

- **CI (Integración Continua)**: Validación automática de código en cada push/PR
- **CD (Despliegue Continuo)**: Automatización del proceso de deployment

### ¿Por qué GitHub Actions?

GitHub Actions es la plataforma de CI/CD nativa de GitHub que permite:

✅ **Ejecución automática** en eventos (push, PR, release)  
✅ **Runners gratuitos** (Ubuntu, Windows, macOS)  
✅ **Integración nativa** con repositorios GitHub  
✅ **Marketplace** con miles de acciones reutilizables  
✅ **Caché inteligente** para optimizar tiempos de build

### Beneficios en ClientPro CRM

1. **Detección temprana de errores**: Los tests corren antes de mergear código
2. **Calidad de código**: Linting automático en cada push
3. **Builds validados**: Asegura que el código compile correctamente
4. **Cobertura de tests**: Valida que la cobertura sea >= 85%
5. **Seguridad**: Dependabot actualiza dependencias vulnerables

---

## 📦 Workflows Implementados

ClientPro CRM tiene **3 workflows principales** y **1 configuración de Dependabot**:

### 1. test.yml - Testing Automático

**Archivo**: `.github/workflows/test.yml`  
**Trigger**: Push/PR a `master` o `develop`  
**Tiempo estimado**: 3-5 minutos

#### Jobs Ejecutados

##### Backend Tests

```yaml
test-backend:
  - Checkout repository
  - Setup Node.js 20.x
  - Install dependencies (npm ci)
  - Run Prisma generate
  - Run tests with coverage
  - Check coverage threshold (>= 85%)
  - Upload coverage artifacts
```

**Comandos equivalentes locales**:
```bash
cd backend
npm ci
npx prisma generate
npm run test:cov
```

##### Frontend Tests

```yaml
test-frontend:
  - Checkout repository
  - Setup Node.js 20.x
  - Install dependencies (npm ci)
  - Run tests with coverage
  - Check coverage threshold (>= 85%)
  - Upload coverage artifacts
```

**Comandos equivalentes locales**:
```bash
cd frontend
npm ci
npm run test:coverage
```

#### Coverage Threshold

**CRÍTICO**: El workflow **falla si la cobertura es < 85%** en statements, branches, functions o lines.

```bash
# Validación automática
COVERAGE=$(cat coverage/coverage-summary.json | jq '.total.statements.pct')
if (( $(echo "$COVERAGE < 85" | bc -l) )); then
  echo "❌ Coverage $COVERAGE% is below 85%"
  exit 1
fi
```

**Cómo cumplir el threshold**:
- Escribe tests unitarios para servicios/controllers (backend)
- Escribe tests de componentes con React Testing Library (frontend)
- Usa `npm run test:cov` localmente para verificar cobertura

---

### 2. lint.yml - Linting y Type Checking

**Archivo**: `.github/workflows/lint.yml`  
**Trigger**: Push/PR a `master` o `develop`  
**Tiempo estimado**: 2-3 minutos

#### Jobs Ejecutados

##### Backend Linting

```yaml
lint-backend:
  - Checkout repository
  - Setup Node.js 20.x
  - Install dependencies (npm ci)
  - Run Prisma generate
  - Run ESLint
  - Check Prettier formatting
  - TypeScript type checking (tsc --noEmit)
```

**Comandos equivalentes locales**:
```bash
cd backend
npm run lint                              # ESLint
npx prettier --check "src/**/*.ts"        # Prettier
npx tsc --noEmit                          # TypeScript
```

##### Frontend Linting

```yaml
lint-frontend:
  - Checkout repository
  - Setup Node.js 20.x
  - Install dependencies (npm ci)
  - Run ESLint
  - TypeScript type checking (tsc --noEmit)
```

**Comandos equivalentes locales**:
```bash
cd frontend
npm run lint                              # ESLint + Next.js rules
npx tsc --noEmit                          # TypeScript
```

#### Reglas de Linting

**Backend** (`.eslintrc.js`):
- `@nestjs/recommended`
- `plugin:@typescript-eslint/recommended`
- `plugin:prettier/recommended`

**Frontend** (`.eslintrc.json`):
- `next/core-web-vitals`
- `plugin:@typescript-eslint/recommended`

---

### 3. build.yml - Build Validation

**Archivo**: `.github/workflows/build.yml`  
**Trigger**: Push/PR a `master` o `develop`  
**Tiempo estimado**: 4-6 minutos

#### Jobs Ejecutados

##### Backend Build

```yaml
build-backend:
  - Checkout repository
  - Setup Node.js 20.x
  - Install dependencies (npm ci)
  - Run Prisma generate
  - Build project (npm run build)
  - Upload dist/ artifacts (retención 7 días)
```

**Salida**: `backend/dist/` compilado con NestJS

##### Frontend Build

```yaml
build-frontend:
  - Checkout repository
  - Setup Node.js 20.x
  - Install dependencies (npm ci)
  - Build project (npm run build)
  - Upload .next/ artifacts (retención 7 días)
```

**Salida**: `frontend/.next/` compilado con Next.js 16

##### Docker Build

```yaml
build-docker:
  needs: [build-backend, build-frontend]  # Espera a que builds terminen
  - Checkout repository
  - Set up Docker Buildx
  - Build backend Docker image (no push)
  - Build frontend Docker image (no push)
  - Test docker-compose configuration
```

**IMPORTANTE**: Las imágenes Docker **NO se pushean** a registry en este workflow. Solo valida que se puedan construir.

---

### 4. dependabot.yml - Actualizaciones Automáticas

**Archivo**: `.github/dependabot.yml`  
**Trigger**: Lunes 9:00 AM (semanal)

#### Ecosistemas Monitoreados

##### Backend (`/backend`)

```yaml
Grupos de dependencias:
  - nestjs: @nestjs/* (minor/patch)
  - prisma: @prisma/*, prisma (minor/patch)
  - testing: jest, supertest (minor/patch)

Configuración:
  - Schedule: Weekly (Monday 9 AM)
  - Max PRs: 10
  - Labels: dependencies, backend
  - Reviewer: ITZAN44
  - Commit prefix: chore(deps)
```

##### Frontend (`/frontend`)

```yaml
Grupos de dependencias:
  - nextjs: next, react, react-dom (minor/patch)
  - radix-ui: @radix-ui/* (minor/patch)
  - tanstack: @tanstack/* (minor/patch)

Configuración:
  - Schedule: Weekly (Monday 9 AM)
  - Max PRs: 10
  - Labels: dependencies, frontend
  - Reviewer: ITZAN44
  - Commit prefix: chore(deps)
```

##### GitHub Actions (`/`)

```yaml
Updates:
  - actions/checkout
  - actions/setup-node
  - actions/upload-artifact
  - docker/setup-buildx-action
  - docker/build-push-action

Configuración:
  - Schedule: Weekly (Monday 9 AM)
  - Labels: ci/cd, github-actions
  - Commit prefix: chore(ci)
```

---

## 🔧 Configuración Local

### Verificar workflows antes de push

#### 1. Validar sintaxis de workflow

```bash
# Instalar act (opcional - simula GitHub Actions localmente)
# Windows (Chocolatey)
choco install act-cli

# Linux/macOS
brew install act

# Validar sintaxis sin ejecutar
act --dryrun
```

#### 2. Ejecutar validaciones locales

**Backend**:
```bash
cd backend

# Linting
npm run lint
npx prettier --check "src/**/*.ts"

# Type checking
npx tsc --noEmit

# Tests con cobertura
npm run test:cov

# Build
npm run build
```

**Frontend**:
```bash
cd frontend

# Linting
npm run lint

# Type checking
npx tsc --noEmit

# Tests con cobertura
npm run test:coverage

# Build
npm run build
```

**Docker**:
```bash
# Validar docker-compose
docker compose config

# Build (sin levantar servicios)
docker compose build
```

#### 3. Usar Git Hooks (Husky)

ClientPro tiene **hooks automáticos** que ejecutan las mismas validaciones:

**Pre-commit** (antes de `git commit`):
- ESLint auto-fix en archivos staged
- Prettier format en archivos staged

**Commit-msg** (valida formato):
- Conventional Commits format

**Pre-push** (antes de `git push`):
- TypeScript type checking (backend + frontend)
- Build completo (`npm run build`)

**Ver guía completa**: `docs/guides/git/GIT_HOOKS.md`

---

## 📊 Interpretación de Resultados

### Estados de Workflow

| Estado | Emoji | Significado |
|--------|-------|-------------|
| ✅ Success | 🟢 | Todos los checks pasaron |
| ❌ Failure | 🔴 | Al menos un check falló |
| 🟡 In Progress | 🟡 | Ejecutándose actualmente |
| ⚪ Skipped | ⚪ | No se ejecutó (condicional) |

### Ejemplo de Workflow Exitoso

```
✅ Tests / Backend Tests (20.x)                2m 34s
✅ Tests / Frontend Tests (20.x)               1m 58s
✅ Linting / Backend Linting                   1m 42s
✅ Linting / Frontend Linting                  1m 15s
✅ Build / Backend Build                       2m 12s
✅ Build / Frontend Build                      3m 08s
✅ Build / Docker Build                        4m 35s
```

### Ejemplo de Workflow Fallido

```
✅ Tests / Backend Tests (20.x)                2m 34s
❌ Tests / Frontend Tests (20.x)               0m 45s
   └─ Error: Coverage 82.3% is below 85%

⚪ Build / Docker Build                        Skipped
   └─ Waiting for tests to pass
```

### Cómo Ver Logs Detallados

1. Ve a la pestaña **Actions** en GitHub
2. Haz click en el workflow fallido
3. Haz click en el job fallido (ej: "Frontend Tests")
4. Expande el step que falló (ej: "Run tests with coverage")
5. Lee el error en los logs

**Ejemplo de log de error**:
```
Run npm run test:coverage
> frontend@0.1.0 test:coverage
> jest --coverage

 FAIL  src/components/notifications/notification-badge.test.tsx
  NotificationBadge Component
    ✓ renders with zero notifications (25 ms)
    ✕ renders with notification count (18 ms)

  ● NotificationBadge Component › renders with notification count

    expect(received).toBeInTheDocument()

    received value must be an HTMLElement or an SVGElement.
    Received has value: null

      12 |     render(<NotificationBadge count={5} />);
      13 |     const badge = screen.getByText('5');
    > 14 |     expect(badge).toBeInTheDocument();
         |                   ^
      15 |   });

Test Suites: 1 failed, 0 passed, 1 total
Coverage: 82.3% (below threshold 85%)
```

### Artifacts (Artefactos)

Los workflows suben **artifacts** que puedes descargar:

| Artifact | Workflow | Retención | Contenido |
|----------|----------|-----------|-----------|
| `backend-coverage` | test.yml | 90 días | `backend/coverage/` |
| `frontend-coverage` | test.yml | 90 días | `frontend/coverage/` |
| `backend-dist` | build.yml | 7 días | `backend/dist/` |
| `frontend-build` | build.yml | 7 días | `frontend/.next/` |

**Cómo descargar**:
1. Ve a la pestaña **Actions**
2. Haz click en un workflow exitoso
3. Scroll down a **Artifacts**
4. Haz click en **Download**

---

## 🔒 Branch Protection Rules

### Configuración Recomendada

Para asegurar calidad de código, configura **Branch Protection** en GitHub:

#### Master Branch

```yaml
Settings → Branches → Add rule → master

✅ Require a pull request before merging
   ✅ Require approvals: 1
   ✅ Dismiss stale pull request approvals when new commits are pushed

✅ Require status checks to pass before merging
   ✅ Require branches to be up to date before merging
   Required checks:
      ✅ Backend Tests (20.x)
      ✅ Frontend Tests (20.x)
      ✅ Backend Linting
      ✅ Frontend Linting
      ✅ Backend Build
      ✅ Frontend Build
      ✅ Docker Build

✅ Require conversation resolution before merging

✅ Do not allow bypassing the above settings
   (Ni siquiera admins pueden pushear sin checks)

❌ Allow force pushes (DESHABILITADO)
❌ Allow deletions (DESHABILITADO)
```

#### Develop Branch

```yaml
Settings → Branches → Add rule → develop

✅ Require a pull request before merging
   ✅ Require approvals: 0 (opcional para develop)

✅ Require status checks to pass before merging
   ✅ Require branches to be up to date before merging
   Required checks:
      ✅ Backend Tests (20.x)
      ✅ Frontend Tests (20.x)
      ✅ Backend Linting
      ✅ Frontend Linting
      ✅ Backend Build
      ✅ Frontend Build

✅ Require conversation resolution before merging

❌ Do not allow bypassing the above settings

❌ Allow force pushes (DESHABILITADO)
❌ Allow deletions (DESHABILITADO)
```

### Cómo Aplicar las Reglas

1. Ve a **Settings** → **Branches** en GitHub
2. Click en **Add branch protection rule**
3. En "Branch name pattern" escribe `master`
4. Habilita las opciones listadas arriba
5. Click en **Create** (al final de la página)
6. Repite para `develop` y `staging`

### Bypass Emergency

Si necesitas mergear sin pasar checks (emergencia):

1. Ve a **Settings** → **Branches**
2. Click en **Edit** en la regla de protección
3. Temporalmente deshabilita "Do not allow bypassing"
4. Mergea el PR crítico
5. **IMPORTANTE**: Re-habilita la protección inmediatamente

---

## 🤖 Dependabot

### ¿Qué hace Dependabot?

Dependabot revisa **semanalmente** (lunes 9 AM) todas las dependencias y:

1. **Detecta actualizaciones** disponibles (minor/patch)
2. **Crea PRs automáticos** para cada grupo de dependencias
3. **Ejecuta CI/CD** en cada PR (tests, lint, build)
4. **Asigna reviewer** (ITZAN44 por defecto)

### Grupos de Dependencias

**Backend**:
- `nestjs`: Todas las dependencias de NestJS
- `prisma`: Prisma Client y CLI
- `testing`: Jest, Supertest

**Frontend**:
- `nextjs`: Next.js, React, React DOM
- `radix-ui`: Componentes de Radix UI
- `tanstack`: TanStack Query, Table

**GitHub Actions**:
- `actions/*`: Acciones de GitHub
- `docker/*`: Acciones de Docker

### Cómo Revisar PRs de Dependabot

1. **Ve a Pull Requests** en GitHub
2. **Busca PRs** con label `dependencies`
3. **Revisa los cambios**:
   - Click en "Files changed"
   - Verifica `package.json` y `package-lock.json`
4. **Espera a CI/CD**:
   - Todos los workflows deben pasar ✅
5. **Mergea o cierra**:
   - Si todo pasa → **Merge pull request**
   - Si hay breaking changes → **Close** y actualiza manualmente

### Comandos en PRs de Dependabot

Puedes comentar en PRs de Dependabot para controlarlo:

```bash
@dependabot rebase           # Rebase PR con base branch
@dependabot recreate         # Recrear PR desde cero
@dependabot merge            # Auto-merge si CI pasa
@dependabot squash and merge # Squash commits al mergear
@dependabot cancel merge     # Cancelar auto-merge
@dependabot close            # Cerrar PR sin mergear
@dependabot ignore this dependency           # Ignorar esta dependencia
@dependabot ignore this major version        # Ignorar esta major version
@dependabot ignore this minor version        # Ignorar esta minor version
```

### Configurar Auto-merge

Para que Dependabot auto-mergee PRs **solo si CI pasa**:

```bash
# En un PR de Dependabot, comenta:
@dependabot merge

# O configura auto-merge global en Settings:
Settings → Code security and analysis → Dependabot
  ✅ Enable auto-merge for patch and minor updates
```

**ADVERTENCIA**: Solo usa auto-merge si confías 100% en tus tests.

---

## 🐛 Troubleshooting

### Problema 1: Tests Fallan en CI pero Pasan Local

**Síntoma**:
```
❌ Tests / Backend Tests (20.x)
   Error: Test suite failed to run
```

**Causa**: Diferencias entre entorno local y CI (variables de entorno, caché)

**Solución**:
```bash
# 1. Limpia caché local
cd backend
rm -rf node_modules dist coverage .jest-cache
npm ci
npm run test:cov

# 2. Verifica variables de entorno
# CI no tiene acceso a .env local
# Asegúrate de que tests no dependan de .env

# 3. Verifica archivos ignorados
# CI no tiene acceso a archivos en .gitignore
git ls-files --others --ignored --exclude-standard
```

### Problema 2: Coverage < 85%

**Síntoma**:
```
❌ Check coverage threshold
   Coverage 82.3% is below 85%
```

**Solución**:
```bash
# 1. Identifica archivos sin cobertura
cd backend
npm run test:cov
cat coverage/coverage-summary.json | jq

# 2. Escribe tests para archivos sin cobertura
# Ejemplo: src/clientes/clientes.service.spec.ts

# 3. Verifica nueva cobertura
npm run test:cov
```

### Problema 3: Docker Build Falla

**Síntoma**:
```
❌ Build / Docker Build
   Error: failed to solve: process "/bin/sh -c npm run build" did not complete
```

**Solución**:
```bash
# 1. Verifica Dockerfile local
cd backend
docker build -t test-backend .

# 2. Revisa logs de build
docker build --progress=plain -t test-backend .

# 3. Verifica .dockerignore
cat .dockerignore
# Asegúrate de que node_modules, dist, coverage estén ignorados
```

### Problema 4: Linting Falla en CI

**Síntoma**:
```
❌ Linting / Backend Linting
   Error: 'clientes' is defined but never used (no-unused-vars)
```

**Solución**:
```bash
# 1. Ejecuta linting local
cd backend
npm run lint

# 2. Auto-fix errores
npm run lint -- --fix

# 3. Commit cambios
git add .
git commit -m "fix(lint): resolve linting errors"
git push
```

### Problema 5: TypeScript Compilation Falla

**Síntoma**:
```
❌ Linting / Backend Linting
   Error: TS2304: Cannot find name 'Cliente'
```

**Solución**:
```bash
# 1. Verifica errores TypeScript local
cd backend
npx tsc --noEmit

# 2. Genera Prisma types (si usa Prisma)
npx prisma generate

# 3. Verifica imports
# Asegúrate de importar tipos correctamente
import { Cliente } from '@prisma/client';
```

### Problema 6: Dependabot PRs Fallan Tests

**Síntoma**:
```
Dependabot PR: chore(deps): bump @nestjs/core from 11.0.0 to 11.1.0
❌ Tests / Backend Tests
   Error: Cannot find module '@nestjs/core'
```

**Solución**:
```bash
# 1. Checkout PR localmente
gh pr checkout 123

# 2. Reinstala dependencias
cd backend
rm -rf node_modules package-lock.json
npm install

# 3. Ejecuta tests
npm run test:cov

# 4. Si pasan, push fix
git add package-lock.json
git commit -m "fix(deps): regenerate lockfile"
git push

# 5. Si no pasan, cierra PR y actualiza manualmente
gh pr close 123
```

### Problema 7: Workflow No Se Ejecuta

**Síntoma**: Hiciste push pero no aparece ningún workflow en Actions

**Causas posibles**:
1. Push a branch que no es `master` o `develop`
2. Archivo de workflow tiene errores de sintaxis
3. Workflow deshabilitado manualmente

**Solución**:
```bash
# 1. Verifica branch actual
git branch

# 2. Valida sintaxis de workflow
# Instala yamllint
npm install -g yaml-lint
yamllint .github/workflows/test.yml

# 3. Verifica que workflows estén habilitados
# GitHub → Settings → Actions → General
# ✅ Allow all actions and reusable workflows
```

### Problema 8: Artefactos No Se Suben

**Síntoma**:
```
✅ Build / Backend Build
   ⚠️ No artifacts were uploaded
```

**Solución**:
```bash
# 1. Verifica que la carpeta exista después del build
cd backend
npm run build
ls -la dist/  # Debe existir

# 2. Verifica path en workflow
# .github/workflows/build.yml
- name: Upload build artifacts
  uses: actions/upload-artifact@v4
  with:
    name: backend-dist
    path: backend/dist  # ← Verifica que coincida con npm run build
```

---

## 🏅 Badges en README

Agrega badges de status en tu `README.md` para mostrar el estado de CI/CD:

### Badges Disponibles

```markdown
<!-- Tests -->
![Tests](https://github.com/ITZAN44/clientpro-crm/actions/workflows/test.yml/badge.svg)

<!-- Linting -->
![Linting](https://github.com/ITZAN44/clientpro-crm/actions/workflows/lint.yml/badge.svg)

<!-- Build -->
![Build](https://github.com/ITZAN44/clientpro-crm/actions/workflows/build.yml/badge.svg)

<!-- Coverage (requiere codecov.io configurado) -->
![Coverage](https://codecov.io/gh/ITZAN44/clientpro-crm/branch/master/graph/badge.svg)

<!-- Version -->
![Version](https://img.shields.io/badge/version-0.7.3-blue.svg)

<!-- License -->
![License](https://img.shields.io/badge/license-MIT-green.svg)
```

### Ejemplo en README

```markdown
# ClientPro CRM

![Tests](https://github.com/ITZAN44/clientpro-crm/actions/workflows/test.yml/badge.svg)
![Linting](https://github.com/ITZAN44/clientpro-crm/actions/workflows/lint.yml/badge.svg)
![Build](https://github.com/ITZAN44/clientpro-crm/actions/workflows/build.yml/badge.svg)
![Version](https://img.shields.io/badge/version-0.7.3-blue.svg)

Sistema de gestión de clientes con NestJS y Next.js.
```

### Badges Personalizados (shields.io)

```markdown
<!-- Custom badge -->
![Stack](https://img.shields.io/badge/stack-NestJS%20%7C%20Next.js-blueviolet)

<!-- Node version -->
![Node](https://img.shields.io/badge/node-20.x-brightgreen)

<!-- PRs welcome -->
![PRs](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)
```

---

## 📚 Referencias

### Documentación Oficial

- **GitHub Actions**: https://docs.github.com/en/actions
- **Dependabot**: https://docs.github.com/en/code-security/dependabot
- **Branch Protection**: https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches

### Acciones Usadas

- `actions/checkout@v4`: https://github.com/actions/checkout
- `actions/setup-node@v4`: https://github.com/actions/setup-node
- `actions/upload-artifact@v4`: https://github.com/actions/upload-artifact
- `docker/setup-buildx-action@v3`: https://github.com/docker/setup-buildx-action
- `docker/build-push-action@v5`: https://github.com/docker/build-push-action

### Guías Relacionadas

- **Git Workflow**: `docs/guides/git/GIT_WORKFLOW.md`
- **Git Hooks**: `docs/guides/git/GIT_HOOKS.md`
- **Docker**: `docs/guides/docker/DOCKER.md`
- **Testing**: (Pendiente)

### Herramientas de Validación

- **act** (GitHub Actions local): https://github.com/nektos/act
- **yamllint** (YAML linter): https://github.com/adrienverge/yamllint
- **actionlint** (GitHub Actions linter): https://github.com/rhysd/actionlint

---

## 🎯 Checklist de Verificación

Antes de crear un PR, asegúrate de:

- [ ] Todos los tests pasan localmente (`npm run test:cov`)
- [ ] Linting pasa sin errores (`npm run lint`)
- [ ] TypeScript compila sin errores (`npx tsc --noEmit`)
- [ ] Build es exitoso (`npm run build`)
- [ ] Coverage >= 85% en backend y frontend
- [ ] Commits siguen Conventional Commits
- [ ] PR tiene descripción clara
- [ ] PR está asignado a reviewer

---

**Última actualización**: 24 de febrero de 2026  
**Versión**: v0.7.3  
**Mantenedor**: ITZAN44

**Notas**:
- Esta guía se actualiza con cada cambio en workflows
- Reporta errores o mejoras en GitHub Issues
- Consulta `docs/guides/git/GIT_HOOKS.md` para validaciones locales

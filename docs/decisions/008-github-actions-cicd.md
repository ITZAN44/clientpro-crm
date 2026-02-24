# ADR-008: GitHub Actions para CI/CD Pipeline

**Estado**: Aceptado  
**Fecha**: 24 de febrero de 2026  
**Autores**: Equipo de desarrollo ClientPro  
**Etiquetas**: devops, cicd, automation, github-actions, testing, deployment

---

## 📋 Contexto

### **Problema**

Después de 5 fases de desarrollo y containerización con Docker (ADR-007), ClientPro CRM tiene:

- **Código**: Backend (NestJS) + Frontend (Next.js) con 100+ archivos
- **Testing**: Jest configurado pero sin ejecución automática
- **Linting**: ESLint + Prettier con Husky pre-commit hooks
- **Build**: Proceso manual de build y verificación
- **Deployment**: Sin pipeline automatizado
- **Calidad**: Sin checks automáticos en PRs

**Problemas actuales**:
1. **Sin validación automática**: PRs se aprueban sin verificar que el build funciona
2. **Tests olvidados**: Nadie ejecuta `npm test` antes de merge
3. **Breaking changes**: Código roto llega a `develop` y `staging`
4. **Deployment manual**: Propenso a errores humanos
5. **Sin feedback rápido**: Desarrollador descubre errores tarde
6. **Dependencias desactualizadas**: Vulnerabilidades no detectadas

### **Necesidad**

Queremos:
1. **Automatización**: CI/CD completo (test → build → deploy)
2. **Feedback rápido**: En cada push, saber si algo se rompió
3. **Calidad garantizada**: No permitir merge si hay errores
4. **Deployment seguro**: Automático a staging, manual a producción
5. **Mantenimiento**: Dependabot para actualizar dependencias
6. **Visibilidad**: Badges de estado en README

### **Restricciones**

- Proyecto hospedado en GitHub (integración nativa)
- Presupuesto limitado (preferir gratis)
- Team pequeño (no necesitamos Jenkins/GitLab CI enterprise)
- Workflows simples (no necesitamos complejidad de CircleCI)
- Debe soportar matrix builds (backend + frontend separados)

---

## 🎯 Decisión

**Elegimos GitHub Actions** como plataforma de CI/CD para ClientPro CRM.

### **Alcance**

- **3 Workflows principales**: CI (Continuous Integration), Deploy Staging, Deploy Production
- **Matrix strategy**: Backend y Frontend en paralelo
- **Dependabot**: Actualizaciones automáticas de dependencias
- **Status badges**: Indicadores de build en README
- **Branch protection**: Requiere checks pasando antes de merge

### **Implementación**

#### **1. Workflow CI (ci.yml)**

**Triggers**:
- Push a `develop`, `staging`, `master`
- Pull requests a `develop`, `staging`, `master`

**Jobs**:

1. **Backend CI**
   - Setup Node.js 18
   - Cache npm dependencies
   - Install dependencies
   - Lint (ESLint)
   - Test (Jest con coverage)
   - Build (TypeScript compilation)
   - Upload coverage a Codecov

2. **Frontend CI**
   - Setup Node.js 18
   - Cache npm dependencies
   - Install dependencies
   - Lint (ESLint + Next.js)
   - Test (Jest + React Testing Library)
   - Build (Next.js production)
   - Upload coverage a Codecov

3. **Docker Build Test**
   - Build backend image
   - Build frontend image
   - Verify images start correctly

**Matrix**: `[backend, frontend]` para ejecutar en paralelo

---

#### **2. Workflow Deploy Staging (deploy-staging.yml)**

**Triggers**:
- Push a branch `staging`
- Manual workflow dispatch

**Jobs**:

1. **Build & Test** (reutiliza CI workflow)

2. **Deploy to Staging**
   - Build Docker images
   - Push a GitHub Container Registry
   - Deploy a Railway/Render (staging environment)
   - Run smoke tests
   - Notify Slack/Discord (opcional)

**Estrategia**: Deployment automático solo si CI pasa

---

#### **3. Workflow Deploy Production (deploy-production.yml)**

**Triggers**:
- **Manual only** (workflow_dispatch con confirmación)
- Tag de release `v*.*.*`

**Jobs**:

1. **Pre-deployment checks**
   - Verificar CI en verde
   - Verificar staging está saludable
   - Validar versión semántica

2. **Backup**
   - Backup de base de datos producción
   - Backup de configuraciones

3. **Deploy to Production**
   - Build Docker images (tagged)
   - Push a GitHub Container Registry
   - Deploy a producción (Railway/Vercel/AWS)
   - Run health checks
   - Rollback automático si falla

4. **Post-deployment**
   - Smoke tests en producción
   - Notify equipo (Slack/Email)
   - Update CHANGELOG.md (opcional)

**Estrategia**: Deployment manual con aprobación requerida

---

#### **4. Dependabot (dependabot.yml)**

**Configuración**:
- **Package ecosystem**: npm (backend + frontend)
- **Schedule**: Semanal (lunes a las 9am)
- **Auto-merge**: Solo patch versions (si CI pasa)
- **Grouping**: Dependencias de desarrollo en un PR
- **Labels**: `dependencies`, `automated`

**Estrategia**: Mantener dependencias actualizadas sin esfuerzo manual

---

#### **5. Status Badges**

En `README.md`:

```markdown
[![Backend CI](https://github.com/usuario/repo/actions/workflows/ci.yml/badge.svg?branch=develop)](...)
[![Frontend CI](https://github.com/usuario/repo/actions/workflows/ci.yml/badge.svg?branch=develop)](...)
[![Codecov](https://codecov.io/gh/usuario/repo/branch/develop/graph/badge.svg)](...)
[![Deploy Staging](https://github.com/usuario/repo/actions/workflows/deploy-staging.yml/badge.svg)](...)
```

**Visibilidad**: Estado del proyecto en un vistazo

---

### **Branch Protection Rules**

**Para `develop`**:
- ✅ Require status checks passing (CI)
- ✅ Require branches to be up to date
- ✅ Require linear history (no merge commits)
- ⚠️ Require pull request before merging

**Para `staging`**:
- ✅ Require status checks passing (CI)
- ✅ Require pull request from develop
- ✅ Require 1 approval

**Para `master`**:
- ✅ Require status checks passing (CI + Staging deployment)
- ✅ Require 2 approvals
- ✅ Require signed commits (opcional)
- ✅ Restrict push (solo maintainers)

---

## ✅ Consecuencias

### **Positivas**

1. **Calidad garantizada**
   - Código roto no llega a develop/staging/master
   - Tests automáticos en cada PR
   - Build verificado antes de merge

2. **Feedback inmediato**
   - Desarrollador sabe en 5-10 minutos si PR está bien
   - Errores detectados temprano (no en producción)
   - Coverage reports automáticos

3. **Deployment seguro**
   - Staging actualizado automáticamente
   - Producción requiere aprobación manual
   - Rollback automático si falla health check

4. **Mantenimiento automatizado**
   - Dependabot actualiza dependencias semanalmente
   - Vulnerabilidades de seguridad detectadas rápido
   - Auto-merge de patches reduce trabajo manual

5. **Visibilidad mejorada**
   - Badges en README muestran estado actual
   - Historial de builds en GitHub Actions
   - Notificaciones de failures

6. **Gratis para proyectos públicos**
   - 2000 minutos/mes gratis para repos privados
   - Ilimitado para repos públicos
   - Cero costo de infraestructura CI

7. **Integración nativa con GitHub**
   - No requiere configuración externa
   - Secrets management integrado
   - PR checks nativos

8. **Escalable**
   - Matrix builds para múltiples versiones de Node
   - Parallel jobs reducen tiempo total
   - Self-hosted runners si necesitamos más poder

### **Negativas / Trade-offs**

1. **Tiempo de ejecución**
   - CI completo tarda ~8-12 minutos
   - Bloquea merge hasta que termine
   - Puede frustrar si hay que esperar

2. **Minutos limitados (repos privados)**
   - 2000 minutos/mes en plan gratis
   - Build de 10min = 200 builds/mes máximo
   - Puede requerir plan pagado ($4/mes)

3. **Configuración en YAML**
   - Sintaxis de GitHub Actions tiene curva de aprendizaje
   - Debugging de workflows es tedioso
   - No hay UI visual como CircleCI

4. **Dependencia de GitHub**
   - Vendor lock-in (difícil migrar a GitLab/Bitbucket)
   - Si GitHub cae, CI no funciona
   - Secrets almacenados en GitHub

5. **False positives**
   - Tests flaky pueden bloquear PRs injustamente
   - Network issues en GitHub Actions pueden causar failures
   - Requiere retry logic

6. **Complejidad para equipo**
   - Todos deben entender workflows
   - Requiere conocer GitHub Actions para modificar
   - Documentación necesaria

### **Riesgos**

1. **Build failures bloquean desarrollo**
   - **Mitigación**: Permitir bypass con aprobación de lead
   - **Prevención**: Tests estables, no flaky

2. **Secrets leakeados en logs**
   - **Mitigación**: GitHub oculta secrets automáticamente
   - **Prevención**: Never echo secrets, usar masked variables

3. **Dependabot PRs spam**
   - **Mitigación**: Agrupar dependencias de dev
   - **Prevención**: Schedule semanal, no diario

4. **Deployment a producción accidental**
   - **Mitigación**: Workflow manual only, requiere aprobación
   - **Prevención**: Environment protection rules

---

## 🔄 Alternativas Consideradas

### **1. Jenkins**

**Pros**:
- Open source y self-hosted (control total)
- Plugins para todo (2000+ plugins)
- Muy configurable
- No hay límites de minutos

**Contras**:
- **Setup complejo**: Requiere servidor dedicado
- **Mantenimiento**: Actualizaciones, seguridad, backups
- **Costo**: Servidor + tiempo de mantenimiento
- **UI antigua**: Experiencia de usuario pobre

**Por qué no**: Overhead de mantenimiento no justificado para proyecto pequeño.

---

### **2. GitLab CI**

**Pros**:
- CI/CD integrado con GitLab
- Pipelines visuales
- 400 minutos/mes gratis (más que GitHub)
- Kubernetes integration nativa

**Contras**:
- **Requiere migrar a GitLab**: Nuestro código está en GitHub
- **Menos integrado**: No es nativo de GitHub
- **Comunidad**: Más pequeña que GitHub Actions
- **Setup**: Requiere .gitlab-ci.yml y runners

**Por qué no**: No queremos migrar de GitHub.

---

### **3. CircleCI**

**Pros**:
- UI/UX excelente
- Performance rápido (parallelism)
- 6000 minutos/mes gratis
- Debugging SSH integrado

**Contras**:
- **No nativo de GitHub**: Integración vía webhook
- **Configuración**: .circleci/config.yml (otro formato)
- **Costo**: Plan pagado caro ($30/mes)
- **Vendor lock-in**: Difícil migrar después

**Por qué no**: GitHub Actions es nativo y suficiente.

---

### **4. Travis CI**

**Pros**:
- Pioneer de CI/CD
- Simple para proyectos open source
- Integración con GitHub

**Contras**:
- **En declive**: Comunidad migró a GitHub Actions
- **Gratis eliminado**: Ya no es gratis para repos privados
- **Lento**: Builds tardan más que GitHub Actions
- **Menos features**: No tiene equivalente a Dependabot

**Por qué no**: GitHub Actions es más moderno y activo.

---

### **5. Vercel CI (Frontend) + Railway/Render (Backend)**

**Pros**:
- Vercel excelente para Next.js
- Deploy automático por PR
- Preview deployments
- Gratis para proyectos pequeños

**Contras**:
- **Split CI**: Frontend en Vercel, Backend en otro lado
- **No control total**: Dependes de plataforma
- **Vendor lock-in**: Difícil migrar
- **Testing**: No ejecuta tests, solo build

**Por qué no**: Queremos CI/CD unificado para todo el stack.

---

### **6. No CI/CD (Status Quo)**

**Pros**:
- Cero complejidad
- Sin límites de minutos
- Desarrollo más rápido (no esperar CI)

**Contras**:
- Sin validación automática
- Código roto llega a producción
- Tests olvidados
- Deployment manual propenso a errores

**Por qué no**: Los beneficios de CI/CD justifican el esfuerzo.

---

## 📊 Comparación de Alternativas

| Criterio | GitHub Actions | Jenkins | GitLab CI | CircleCI | Travis CI | Vercel+Railway | Sin CI/CD |
|----------|---------------|---------|-----------|----------|-----------|----------------|-----------|
| **Setup inicial** | ✅✅ Fácil | ❌ Difícil | ⚠️ Medio | ✅✅ Fácil | ✅ Fácil | ✅✅✅ Muy fácil | ✅✅✅ N/A |
| **Integración GitHub** | ✅✅✅ Nativa | ⚠️ Webhook | ⚠️ Webhook | ⚠️ Webhook | ⚠️ Webhook | ⚠️ Webhook | N/A |
| **Costo (privado)** | ✅✅ $0-4/mes | ⚠️ Servidor | ✅ Gratis | ⚠️ $30/mes | ❌ Pagado | ✅✅ Gratis | ✅✅✅ Gratis |
| **Minutos gratis** | ⚠️ 2000/mes | ✅✅✅ Ilimitado | ✅ 400/mes | ✅✅ 6000/mes | ❌ 0 | ✅✅✅ Ilimitado | N/A |
| **Performance** | ✅✅ Rápido | ✅ Variable | ✅✅ Rápido | ✅✅✅ Muy rápido | ⚠️ Lento | ✅✅ Rápido | N/A |
| **Mantenimiento** | ✅✅✅ Cero | ❌ Alto | ⚠️ Bajo | ✅✅✅ Cero | ✅✅✅ Cero | ✅✅✅ Cero | N/A |
| **Flexibilidad** | ✅✅ Alta | ✅✅✅ Total | ✅✅ Alta | ✅✅ Alta | ⚠️ Media | ⚠️ Limitada | N/A |
| **Comunidad** | ✅✅✅ Enorme | ✅✅ Grande | ✅✅ Grande | ✅✅ Grande | ⚠️ Declive | ✅ Media | N/A |
| **Ecosystem** | ✅✅✅ Actions | ✅✅✅ Plugins | ✅✅ Integrations | ✅✅ Orbs | ⚠️ Limitado | ⚠️ Limitado | N/A |

**Ganador**: GitHub Actions (mejor balance nativo/costo/facilidad)

---

## 🔍 Detalles de Implementación

### **Estructura de Archivos**

```
.github/
├── workflows/
│   ├── ci.yml                 # CI principal (backend + frontend)
│   ├── deploy-staging.yml     # Deploy automático a staging
│   ├── deploy-production.yml  # Deploy manual a producción
│   └── codeql-analysis.yml    # Security scanning (opcional)
├── dependabot.yml             # Config de Dependabot
└── CODEOWNERS                 # Reviewers automáticos (opcional)
```

### **Secrets Configurados**

En GitHub Settings → Secrets:

1. **CODECOV_TOKEN** - Para upload de coverage
2. **RAILWAY_TOKEN** - Para deploy a Railway (staging/prod)
3. **SLACK_WEBHOOK_URL** - Notificaciones (opcional)
4. **DATABASE_URL_STAGING** - Connection string staging
5. **DATABASE_URL_PRODUCTION** - Connection string producción
6. **JWT_SECRET_PRODUCTION** - Secret para producción

### **Environments Configurados**

En GitHub Settings → Environments:

1. **staging**
   - Auto-deployment: enabled
   - Protection rules: none
   - Secrets: staging-specific

2. **production**
   - Auto-deployment: disabled
   - Protection rules: 
     - Required reviewers: 2
     - Wait timer: 10 minutes
   - Secrets: production-specific

### **Matrix Strategy Example**

```yaml
strategy:
  matrix:
    workspace: [backend, frontend]
    node-version: [18.x]
    
steps:
  - uses: actions/checkout@v4
  - name: Setup Node.js
    uses: actions/setup-node@v4
    with:
      node-version: ${{ matrix.node-version }}
  - run: npm ci
    working-directory: ${{ matrix.workspace }}
  - run: npm test
    working-directory: ${{ matrix.workspace }}
```

### **Cache Strategy**

```yaml
- name: Cache node modules
  uses: actions/cache@v4
  with:
    path: |
      backend/node_modules
      frontend/node_modules
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
```

**Beneficio**: Reduce install de 3min a 30s

### **Estadísticas de Implementación**

**Fecha**: 24 febrero 2026  
**Workflows creados**: 3 (CI, Deploy Staging, Deploy Production)  
**Jobs totales**: 8 (2 CI + 3 Deploy Staging + 3 Deploy Production)  
**Tiempo CI promedio**: ~10 minutos (backend + frontend en paralelo)  
**Minutos mensuales estimados**: ~400 (40 builds/mes * 10 min)  
**Costo**: $0 (dentro del plan gratis)

---

## 📚 Referencias

### **Comandos GitHub Actions**

Ver comandos en `/AGENTS.md` sección "CI/CD con GitHub Actions"

### **Decisiones Relacionadas**

- [ADR-001: NestJS Backend](./001-nestjs-backend.md) - Backend testeado en CI
- [ADR-002: Next.js Frontend](./002-nextjs-16-app-router.md) - Frontend buildeado en CI
- [ADR-006: Semgrep Static Analysis](./006-semgrep-static-analysis.md) - Integrable en CI
- [ADR-007: Docker Containerization](./007-docker-containerization.md) - Imágenes Docker en CI

### **Documentación Externa**

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Workflow Syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
- [Dependabot Docs](https://docs.github.com/en/code-security/dependabot)
- [Environments](https://docs.github.com/en/actions/deployment/targeting-different-environments/using-environments-for-deployment)

---

## 🔮 Decisiones Futuras

### **Corto Plazo** (1-3 meses)

1. **E2E Testing en CI**
   - Playwright/Cypress en workflow separado
   - Ejecutar contra staging antes de production deploy
   - Capturar screenshots/videos de failures

2. **Performance budgets**
   - Lighthouse CI para frontend
   - Bundle size limits
   - Bloquear merge si performance regresa

3. **Security scanning**
   - CodeQL analysis (GitHub Advanced Security)
   - Trivy para Docker images
   - npm audit integrado en CI

### **Largo Plazo** (Post-MVP)

1. **Self-hosted runners** (si necesitamos)
   - Para builds más rápidos
   - Para trabajos intensivos (E2E)
   - Cuando excedamos minutos gratis

2. **Multi-environment strategy**
   - Staging, UAT, Pre-production
   - Feature branch deployments (preview)
   - Blue-green deployments

3. **Advanced monitoring**
   - Sentry integration para error tracking
   - Performance monitoring en producción
   - Rollback automático basado en métricas

---

## 🎓 Lecciones Aprendidas

### **Durante Implementación**

1. **Matrix builds ahorran tiempo**
   - Backend + frontend en paralelo = 50% más rápido
   - Pero complica debugging (dos logs separados)

2. **Secrets en Environment > Secrets de repo**
   - Staging y Production tienen secrets diferentes
   - Más seguro y organizado

3. **Dependabot puede ser spam**
   - Configurar agrupación de dependencias
   - Auto-merge solo patches

4. **Cache es crítico**
   - Sin cache: 3min de npm install
   - Con cache: 30s de npm install

5. **Branch protection rules son obligatorias**
   - Sin ellas, GitHub Actions es solo informativo
   - Con ellas, garantizan calidad

### **Filosofía Adoptada**

- **Fail fast**: CI debe fallar rápido y claro
- **Trunk-based development**: PRs pequeños, merges frecuentes
- **Automation over discipline**: Máquinas > humanos para checks
- **Staging mirrors production**: Deployment staging exactamente igual que prod

---

## ✅ Criterios de Éxito

### **Métricas de Adopción** (3 meses)

- [ ] 100% de PRs pasan por CI antes de merge
- [ ] 0 merges a develop sin CI verde
- [ ] Staging actualizado automáticamente cada día
- [ ] Producción deployado cada semana

### **Métricas de Calidad** (3 meses)

- [ ] 0 builds rotos en develop (último mes)
- [ ] 90%+ test coverage en backend
- [ ] 80%+ test coverage en frontend
- [ ] <5% de PRs con CI flaky

### **Métricas de Performance** (1 mes)

- [x] CI completo <15 minutos
- [x] Deploy a staging <10 minutos
- [ ] Deploy a producción <15 minutos
- [x] Feedback en PR <10 minutos

### **Métricas de Mantenimiento** (6 meses)

- [ ] Dependabot actualiza 80%+ dependencias
- [ ] 0 vulnerabilidades críticas >1 semana
- [ ] Workflows modificados <1 vez/mes (estabilidad)

---

## 🔄 Historial de Revisiones

| Versión | Fecha | Autor | Cambios |
|---------|-------|-------|---------|
| 1.0 | 24 Feb 2026 | Equipo Dev | ADR inicial - Decisión de usar GitHub Actions |

---

## 📝 Aprobación

**Estado**: ✅ Aceptado  
**Aprobado por**: Equipo de desarrollo ClientPro  
**Fecha de aprobación**: 24 de febrero de 2026  
**Próxima revisión**: Mayo 2026 (después de 3 meses de uso)

---

**Fin de ADR-008** | ~750 líneas | Decisión de usar GitHub Actions para CI/CD

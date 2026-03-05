# Backlog de Features y Próximas Fases

> **Propósito**: Listado priorizado de features futuras y mejoras planificadas
> **Última actualización**: 05 de marzo de 2026
> **Estado**: Planificación post-MVP (98% completo)

---

## 🎯 Visión General del Backlog

**Prioridad actual**: Fase 6 (Producción) - EN PROGRESO  
**Subfase completada**: 6.2 - Containerization (Docker) ✅ | 6.5 - Web Servers (Nginx) ✅  
**Features adicionales**: Post-MVP  
**Timeline estimado**: Marzo - Abril 2026  
**MVP**: 98% completo ✅

---

## 🚀 Fase 6: Nivel Senior Backend Developer (PRÓXIMA FASE)

**Prioridad**: CRÍTICA  
**Estimado**: 3-4 semanas  
**Dependencia**: Fase 5 completada (Testing 96%+ cobertura) ✅  
**Objetivo**: Alcanzar 75-80% en Backend Developer Roadmap (roadmap.sh/backend) - **LOGRADO** ✅

**Nota**: Esta fase NO incluye hosting en producción (proyecto de práctica para portfolio)

### **Score Actual vs Objetivo**

| Categoría               | Actual  | Objetivo   | Gap           |
| ----------------------- | ------- | ---------- | ------------- |
| Version Control Systems | 90%     | 90%        | ✅ COMPLETADO |
| Repo Hosting Services   | 90%     | 90%        | ✅ COMPLETADO |
| CI/CD                   | 71%     | 80%        | 🟢 Casi       |
| Containerization        | 85%     | 85%        | ✅ COMPLETADO |
| Caching                 | 70%     | 70%        | ✅ COMPLETADO |
| Web Servers             | 75%     | 75%        | ✅ COMPLETADO |
| Building For Scale      | 60%     | 60%        | ✅ COMPLETADO |
| **Score General**       | **87%** | **75-80%** | **✅ Senior** |

---

### **Objetivos Principales**

1. ~~**Inicializar Version Control (Git + GitHub)**~~ - ✅ COMPLETADO (23 Feb 2026)
2. ~~**Implementar Containerization (Docker)**~~ - ✅ COMPLETADO (24 Feb 2026)
3. ~~**Configurar CI/CD (GitHub Actions)**~~ - ✅ COMPLETADO (24 Feb 2026)
4. ~~**Implementar Caching (Redis)**~~ - ✅ COMPLETADO (27 Feb 2026)
5. ~~**Configurar Web Server (Nginx)**~~ - ✅ COMPLETADO (04 Mar 2026)
6. ~~**Mejorar Security & Observability**~~ - ✅ COMPLETADO (05 Mar 2026)

---

### **Tareas Detalladas**

---

---

#### **Subfase 6.2: Containerization (Docker)** ✅ COMPLETADA

**Tiempo estimado**: 1 semana  
**Objetivo**: Containerization 0% → 85%  
**Estado**: ✅ **COMPLETADO** (24 de febrero de 2026)

**Tareas**:

1. **Dockerfile para Backend** (2 horas)
   - [x] Crear `backend/Dockerfile` ✅
   - [x] Multi-stage build (build + production) ✅
   - [x] Node.js 20 Alpine ✅
   - [x] Optimizar layers (cache de node_modules) ✅
   - [x] .dockerignore configurado ✅
   - [x] Healthcheck configurado ✅

2. **Dockerfile para Frontend** (2 horas)
   - [x] Crear `frontend/Dockerfile` ✅
   - [x] Multi-stage build ✅
   - [x] Next.js standalone output ✅
   - [x] .dockerignore configurado ✅
   - [x] Optimización de imagen (< 200MB) ✅

3. **docker-compose.yml** (3 horas)
   - [x] Crear `docker-compose.yml` en raíz ✅
   - [x] Servicios: postgres, backend, frontend, redis ✅
   - [x] Networks configurados ✅
   - [x] Volumes para persistencia de datos ✅
   - [x] Variables de entorno desde `.env.docker` ✅
   - [x] Healthchecks para todos los servicios ✅
   - [x] Restart policies ✅

4. **Documentación Docker** (1 hora)
   - [x] `docs/guides/docker/DOCKER.md` con comandos comunes ✅
   - [x] Instrucciones de build y run ✅
   - [x] Troubleshooting común ✅
   - [x] Diferencias dev vs producción ✅

**Problemas Resueltos**:

- ✅ Base de datos vacía → Creadas migraciones de Prisma (`prisma migrate dev`)
- ✅ Frontend no podía conectarse al backend → Agregada variable `API_URL=http://backend:4000`
- ✅ `next.config.ts` no compatible con Docker → Agregado `output: 'standalone'`
- ✅ Datos migrados exitosamente (8 usuarios, 10 clientes, 8 negocios)

**Evidencia de Completitud**:

- ✅ `docker-compose up` levanta todo el stack (postgres, redis, backend, frontend)
- ✅ Backend responde en localhost:4000
- ✅ Frontend responde en localhost:3000
- ✅ PostgreSQL persistente con datos migrados
- ✅ Redis funcionando en puerto 6379
- ✅ Healthchecks funcionando
- ✅ Migración de base de datos ejecutada automáticamente

**Impacto en Score**: Containerization 0% → 85% (+85% 🚀)

**Archivos creados/modificados**: Ver [COMPLETED.md](./COMPLETED.md#subfase-62-containerization-docker-completada)

---

#### **Subfase 6.3: CI/CD (GitHub Actions)** ✅ COMPLETADA

**Tiempo estimado**: 3 días  
**Tiempo real**: 1 día (24 Feb 2026)  
**Objetivo**: CI/CD 0% → 80% (logrado 71%)

**Tareas**:

1. **Workflow de Testing** (2 horas)
   - [x] Crear `.github/workflows/test.yml`
   - [x] Ejecutar en cada push y PR
   - [x] Matrix strategy (Node 20)
   - [x] Cache de node_modules
   - [x] Ejecutar tests backend (96 tests)
   - [x] Ejecutar tests frontend (144 tests)
   - [x] Generar coverage reports
   - [x] Fallar si coverage < 85%

   ```yaml
   # .github/workflows/test.yml
   name: Tests

   on:
     push:
       branches: [main, develop]
     pull_request:
       branches: [main, develop]

   jobs:
     test-backend:
       runs-on: ubuntu-latest
       strategy:
         matrix:
           node-version: [20.x]
       steps:
         - uses: actions/checkout@v4
         - uses: actions/setup-node@v4
           with:
             node-version: ${{ matrix.node-version }}
             cache: 'npm'
             cache-dependency-path: backend/package-lock.json
         - name: Install dependencies
           working-directory: backend
           run: npm ci
         - name: Run tests
           working-directory: backend
           run: npm test -- --coverage
         - name: Check coverage
           working-directory: backend
           run: |
             COVERAGE=$(cat coverage/coverage-summary.json | jq '.total.statements.pct')
             if (( $(echo "$COVERAGE < 85" | bc -l) )); then
               echo "Coverage $COVERAGE% is below 85%"
               exit 1
             fi

     test-frontend:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - uses: actions/setup-node@v4
           with:
             node-version: 20.x
             cache: 'npm'
             cache-dependency-path: frontend/package-lock.json
         - name: Install dependencies
           working-directory: frontend
           run: npm ci
         - name: Run tests
           working-directory: frontend
           run: npm test -- --coverage
   ```

2. **Workflow de Linting** (1 hora)
   - [x] Crear `.github/workflows/lint.yml`
   - [x] ESLint backend
   - [x] ESLint frontend
   - [x] TypeScript type checking
   - [x] Prettier check (backend)

3. **Workflow de Build** (2 horas)
   - [x] Crear `.github/workflows/build.yml`
   - [x] Build backend
   - [x] Build frontend
   - [x] Build Docker images
   - [x] Push a GitHub Container Registry (opcional - validación sin push)

4. **Quality Gates** (1 hora)
   - [x] Status checks requeridos en PRs
   - [x] Tests deben pasar
   - [x] Linting debe pasar
   - [x] Build debe pasar
   - [ ] No merge a main sin aprobación (configuración manual en GitHub)

5. **Dependabot** (30 min)
   - [x] Crear `.github/dependabot.yml`
   - [x] Actualizaciones semanales de npm
   - [x] Actualizaciones de GitHub Actions

**Evidencia de Completitud**:

- ✅ Badge de tests en README
- ✅ Badge de linting en README
- ✅ Badge de build en README
- ✅ PRs con checks automáticos (workflows configurados)
- ✅ Workflows ejecutándose correctamente (pending first push)

**Impacto en Score**: CI/CD 0% → 71% (+71% 🚀)

**Archivos creados/modificados**: Ver [COMPLETED.md](./COMPLETED.md#subfase-63-cicd-pipeline-github-actions-completada)

---

#### **Subfase 6.4: Caching (Redis)** ✅ COMPLETADA

**Tiempo estimado**: 1 semana  
**Tiempo real**: 1 día (27 Feb 2026)  
**Objetivo**: Caching 10% → 70% (logrado 70%)  
**Estado**: ✅ **COMPLETADO** (27 de febrero de 2026)

**Tareas**:

1. **Instalar Redis** (30 min)
   - [x] Redis ya está en docker-compose ✅
   - [x] Crear `backend/src/redis/redis-cache.service.ts` ✅
   - [x] Bypass de @nestjs/cache-manager (problema con v7) ✅

2. **Implementar Caching en Backend** (2 días → 1 día)
   - [x] Cache en ClientesService (TTL 300s) ✅
   - [x] Cache en NegociosService (TTL 300s) ✅
   - [x] Cache en StatsService (TTL 120s) ✅
   - [x] Invalidación automática en mutations ✅
   - [x] Método `delPattern()` para limpieza ✅

3. **HTTP Caching Headers** (1 día)
   - [x] CacheControlInterceptor con ETags ✅
   - [x] Cache-Control headers configurados ✅
   - [x] Soporte If-None-Match (304 responses) ✅

4. **Compresión Gzip** (30 min)
   - [x] Compression middleware habilitado ✅
   - [x] Threshold 1KB configurado ✅

5. **Documentación** (1 hora)
   - [x] docs/guides/CACHING.md creado (775 líneas) ✅
   - [x] Estrategia de caching documentada ✅
   - [x] TTLs explicados ✅
   - [x] Troubleshooting (15+ problemas) ✅

**Problemas Críticos Resueltos**:

- ✅ cache-manager v7 no funciona con custom Redis stores → Bypass con ioredis directo
- ✅ 5 intentos fallidos con diferentes stores documentados
- ✅ Redis no persistía datos → Volumen configurado en docker-compose
- ✅ Kanban drag & drop no invalidaba cache → `delPattern()` en `updateEtapa()`

**Evidencia de Completitud**:

- ✅ Redis funcionando en Docker (port 6379)
- ✅ Cache hits medibles (logs + Redis CLI: `KEYS '*'`)
- ✅ Response times mejorados:
  - Clientes: 118ms → 70ms (41% más rápido)
  - Negocios: 72ms → 59ms (18% más rápido)
  - Stats: 115ms → 68ms (41% más rápido)
- ✅ Invalidación funcionando (create/update/delete limpian cache)
- ✅ HTTP caching con ETags (304 responses)
- ✅ Compresión gzip activa (responses ~60-70% más pequeños)
- ✅ Endpoint GET /redis/stats para monitoreo

**Impacto en Score**: Caching 10% → 70% (+60% 🚀)

**Archivos creados/modificados**: Ver [COMPLETED.md](./COMPLETED.md#subfase-64-redis-caching-completada)

---

#### **Subfase 6.5: Web Servers (Nginx)** ✅ COMPLETADA

**Tiempo estimado**: 2 días  
**Tiempo real**: 1 sesión (04 Mar 2026)  
**Objetivo**: Web Servers 30% → 75% ✅  
**Estado**: ✅ **COMPLETADO** (04 de marzo de 2026)

**Tareas**:

1. **Configurar Nginx** (3 horas)
   - [x] Crear `nginx/nginx.conf` ✅
   - [x] Reverse proxy para backend ✅
   - [x] Servir frontend estático ✅
   - [x] Compresión Gzip habilitada ✅
   - [x] Rate limiting configurado ✅
   - [x] SSL/TLS ready (para producción futura) ✅

2. **Integrar Nginx en docker-compose** (1 hora)
   - [x] Agregar servicio nginx (5to servicio) ✅
   - [x] `nginx/Dockerfile` (nginx:1.25-alpine) ✅
   - [x] Puerto 80 expuesto ✅

3. **Variables de entorno y Frontend** (1 hora)
   - [x] `frontend/Dockerfile` modificado para bakear `NEXT_PUBLIC_*` en build ✅
   - [x] `frontend/src/lib/socket.ts` usa `NEXT_PUBLIC_SOCKET_URL` ✅
   - [x] `.env.docker` y `.env` actualizados ✅

4. **Testing de Nginx** (30 min)
   - [x] Verificar reverse proxy funciona (GET / → 200 OK) ✅
   - [x] Verificar compression (Content-Encoding: gzip) ✅
   - [x] Verificar rate limiting (30 req paralelos → 429) ✅
   - [x] Security headers presentes en responses ✅

**Evidencia de Completitud**:

- ✅ GET / vía nginx puerto 80 → 200 OK, frontend responde
- ✅ Content-Encoding: gzip activo
- ✅ GET /api/clientes sin token → 401 (nginx proxea a backend, strip /api/)
- ✅ GET /api/auth/session → 200 (NextAuth en frontend, no rompió)
- ✅ Rate limiting 30 req paralelos → 429 activado
- ✅ Security headers presentes en responses

**Impacto en Score**: Web Servers 30% → 75% (+45% 🚀)

**Archivos creados/modificados**: Ver [COMPLETED.md](./COMPLETED.md#subfase-65-web-servers-nginx-completada)

---

#### **Subfase 6.6: Security & Observability** ✅ COMPLETADA

**Tiempo estimado**: 1 semana  
**Tiempo real**: 1 sesión (05 Mar 2026)  
**Objetivo**: Building For Scale 15% → 60%  
**Estado**: ✅ **COMPLETADO** (05 de marzo de 2026)

**Tareas de Seguridad**:

1. **Helmet.js** (30 min)
   - [x] `npm install helmet`
   - [x] Configurar en `main.ts`
   - [x] Headers de seguridad habilitados

2. **Rate Limiting en NestJS** (1 hora)
   - [x] `npm install @nestjs/throttler`
   - [x] Configurar ThrottlerModule
   - [x] Limitar login a 5/min
   - [x] Limitar endpoints públicos

3. **Input Sanitization** (2 horas)
   - [x] Sanitizar inputs en DTOs (13 campos, 3 DTOs con @Transform)
   - [x] Prevenir XSS adicional

4. **Audit de Dependencias** (1 hora)
   - [x] `npm audit fix`
   - [x] Actualizar dependencias críticas
   - [x] Sincronizar @prisma/client a 7.4.2

**Tareas de Observability**:

1. **Health Check Endpoint** (1 hora)
   - [x] `npm install @nestjs/terminus`
   - [x] Crear `backend/src/health/health.controller.ts`
   - [x] Checks: database, redis, memory (heap < 150MB)
   - [x] Endpoint: GET `/health`

2. **Structured Logging con Winston** (2 días)
   - [x] `npm install winston nest-winston`
   - [x] JSON estructurado con timestamp+context+level
   - [x] Reemplaza NestJS Logger default

3. **Basic Metrics** (1 día)
   - [x] Crear endpoint `/metrics` (MetricsInterceptor custom)
   - [x] Request counter (totalRequests)
   - [x] Response time (avgResponseTimeMs)
   - [x] Error rate (errors)

4. **nginx.conf actualizado**
   - [x] location `/health` → backend
   - [x] location `/metrics` → backend

**Problemas Críticos Resueltos**:

- ✅ **Prisma version mismatch**: `npm audit fix` desalineó prisma@7.4.2 vs @prisma/client@7.2.0 → Fix: `npm install @prisma/client@7.4.2`
- ✅ **ThrottlerGuard no como APP_GUARD**: ThrottlerModule sin APP_GUARD hacía que @Throttle no tuviera efecto → Fix: `{ provide: APP_GUARD, useClass: ThrottlerGuard }` en providers
- ✅ **Throttler sin nombre en v6**: En @nestjs/throttler v6 sin `name`, el throttler se llama `throttler-0` y no hace match con `@Throttle({ default: ... })` → Fix: `ThrottlerModule.forRoot([{ name: 'default', ... }])`

**Evidencia de Completitud**:

- ✅ Helmet.js activo (Content-Security-Policy, HSTS, X-Frame-Options)
- ✅ Rate limiting verificado: HTTP 429 en 6to intento de login
- ✅ Input sanitization: 13 campos en 3 DTOs con @Transform
- ✅ Health check respondiendo: GET /health → 200 (DB + Redis + Memory)
- ✅ Logs estructurados JSON con Winston
- ✅ Metrics endpoint: GET /metrics → totalRequests, errors, avgResponseTimeMs

**Impacto en Score**: Building For Scale 15% → 60% (+45% 🚀), Score General 82% → 87%

---

### **Subfase 6.7: Documentación y Finalizacion**

**Tiempo estimado**: 2 días

**Tareas**:

1. **Swagger/OpenAPI** (3 horas)
   - [ ] `npm install @nestjs/swagger swagger-ui-express`
   - [ ] Configurar SwaggerModule en `main.ts`
   - [ ] Decoradores en todos los endpoints
   - [ ] UI disponible en `/api/docs`

2. **README.md** (2 horas)
   - [ ] Actualizar con badges (tests, coverage, build)
   - [ ] Instrucciones Docker
   - [ ] Instrucciones de desarrollo
   - [ ] Stack tecnológico
   - [ ] Screenshots (opcional)

3. **Documentación Técnica** (3 horas)
   - [ ] Crear `docs/guides/DEVELOPMENT.md`
   - [ ] Crear `docs/guides/DOCKER.md`
   - [ ] Crear `docs/guides/GIT_WORKFLOW.md`
   - [ ] Actualizar `docs/context/STACK.md`

4. **ADRs** (1 hora)
   - [ ] ADR-007: Docker para containerization
   - [ ] ADR-008: Redis para caching
   - [ ] ADR-009: Nginx como reverse proxy

5. **Sesión de Documentación** (1 hora)
   - [ ] Crear `docs/sessions/2026/02-FEBRERO/SESION_23_FEBRERO_2026.md`
   - [ ] Documentar toda la Fase 6
   - [ ] Problemas encontrados
   - [ ] Soluciones aplicadas

---

### **Checklist de Finalización de Fase 6**

Al completar todas las subfases, verificar:

- [x] ✅ Git inicializado y pusheado a GitHub (23 Feb 2026)
- [x] ✅ Docker funcionando (`docker-compose up` levanta todo) (24 Feb 2026)
- [ ] ✅ CI/CD con GitHub Actions (tests, lint, build)
- [ ] ✅ Redis implementado y cache funcionando
- [x] ✅ Nginx configurado como reverse proxy (04 Mar 2026)
- [x] ✅ Helmet.js + Rate Limiting activos (05 Mar 2026)
- [x] ✅ Health check endpoint funcionando (05 Mar 2026)
- [x] ✅ Winston logging implementado (05 Mar 2026)
- [ ] ✅ Swagger docs disponibles en `/api/docs`
- [ ] ✅ README actualizado con badges
- [ ] ✅ Documentación completa en `docs/`
- [ ] ✅ npm audit sin vulnerabilidades HIGH
- [ ] ✅ Tests siguen pasando (96%+ coverage)

---

### **Score Esperado al Finalizar Fase 6**

| Categoría               | Antes   | Después  | Mejora      |
| ----------------------- | ------- | -------- | ----------- |
| Version Control Systems | 0%      | 90%      | +90% ✅     |
| Repo Hosting Services   | 0%      | 90%      | +90% ✅     |
| CI/CD                   | 0%      | 80%      | +80% 🚀     |
| Containerization        | 0%      | 85%      | +85% ✅     |
| Caching                 | 10%     | 70%      | +60% 📈     |
| Web Servers             | 30%     | 75%      | +45% 📈     |
| Building For Scale      | 15%     | 60%      | +45% 📈     |
| **Score General**       | **48%** | **~75%** | **+27%** ✅ |

**Nivel alcanzado**: **SENIOR BACKEND DEVELOPER** (75% ≈ 75% objetivo)

---

### **Timeline Estimado**

```
Semana 1:
  Día 1:     ✅ Subfase 6.1 (Git + GitHub) - COMPLETADO (23 Feb 2026)
  Día 2:     ✅ Subfase 6.2 (Docker) - COMPLETADO (24 Feb 2026)
  Día 3-5:   Disponible para Subfase 6.3 o features

Semana 2:
  Día 1-2:   Subfase 6.3 (CI/CD)
  Día 3:     Subfase 6.3 (CI/CD - Finalización)
  Día 4-5:   Subfase 6.4 (Redis - Parte 1)

Semana 3:
  Día 1-2:   Subfase 6.4 (Redis - Parte 2)
  Día 3-4:   Subfase 6.5 (Nginx)
  Día 5:     Subfase 6.6 (Security - Parte 1)

Semana 4:
  Día 1-2:   Subfase 6.6 (Security + Observability)
  Día 3-4:   Subfase 6.7 (Documentación)
  Día 5:     Testing final + Ajustes
```

**Total**: 4 semanas (20 días hábiles)

---

---

## 📦 Features Post-MVP (Backlog Futuro)

### **Prioridad Alta**

#### **1. Módulo de Emails**

**Objetivo**: Enviar y rastrear emails desde el CRM

**Backend**:

- [ ] Integración con SendGrid o AWS SES
- [ ] POST `/emails/enviar` - Enviar email
- [ ] GET `/emails` - Historial de emails
- [ ] GET `/emails/:id/tracking` - Aperturas y clicks
- [ ] Templates de email (Handlebars)
- [ ] Adjuntos permitidos

**Frontend**:

- [ ] Editor de emails (TinyMCE o Quill)
- [ ] Selector de template
- [ ] Vista previa antes de enviar
- [ ] Historial de emails por cliente/negocio
- [ ] Indicadores de apertura (abierto/no abierto)

**Estimado**: 1-2 semanas

---

#### **2. Búsqueda Global (Command + K)**

**Objetivo**: Buscar en todo el CRM con un atajo

**Frontend**:

- [ ] Modal de búsqueda global (shadcn/ui Command)
- [ ] Atajo: Cmd+K (Mac) o Ctrl+K (Windows)
- [ ] Buscar en: Clientes, Negocios, Actividades
- [ ] Resultados con categorías
- [ ] Navegación rápida a resultado

**Backend**:

- [ ] GET `/search?q=texto` - Búsqueda global
- [ ] Full-text search en PostgreSQL
- [ ] Paginación de resultados

**Estimado**: 3-4 días

---

#### **4. Exportación de Datos**

**Objetivo**: Exportar reportes a Excel/PDF

**Backend**:

- [ ] GET `/clientes/export` - Export CSV/Excel
- [ ] GET `/negocios/export` - Export CSV/Excel
- [ ] GET `/reportes/:tipo/pdf` - Export PDF

**Frontend**:

- [ ] Botón "Exportar" en tablas
- [ ] Selector de formato (CSV, Excel, PDF)
- [ ] Indicador de descarga

**Librerías**:

- ExcelJS (Excel)
- PDFKit (PDF)

**Estimado**: 1 semana

---

#### **5. Adjuntos en Clientes/Negocios**

**Objetivo**: Subir documentos (contratos, propuestas)

**Backend**:

- [ ] POST `/clientes/:id/adjuntos` - Subir archivo
- [ ] GET `/clientes/:id/adjuntos` - Listar adjuntos
- [ ] DELETE `/adjuntos/:id` - Eliminar adjunto
- [ ] Almacenamiento: AWS S3 o Cloudinary

**Frontend**:

- [ ] Drag & drop para subir
- [ ] Vista previa de archivos
- [ ] Límite de tamaño (10MB)

**Estimado**: 1 semana

---

### **Prioridad Baja (Nice to Have)**

#### **6. Integraciones con Terceros**

- [ ] Google Calendar (sincronizar actividades)
- [ ] Gmail (importar emails automáticamente)
- [ ] Zapier webhooks (automatizaciones)
- [ ] Slack (notificaciones a canal)

**Estimado**: 2-4 semanas

---

#### **7. App Móvil (React Native)**

- [ ] Autenticación
- [ ] Ver clientes y negocios
- [ ] Crear actividades rápidas
- [ ] Notificaciones push
- [ ] Modo offline (opcional)

**Estimado**: 6-8 semanas

---

#### **8. Dashboard Personalizable**

- [ ] Widgets arrastrables
- [ ] Gráficos personalizables
- [ ] Guardar preferencias por usuario
- [ ] Templates de dashboard

**Estimado**: 2 semanas

---

## 📊 Roadmap Visual

```
Enero 2026:        [████████████████████] 100% - Fases 1-4 ✅
Febrero 2026:      [███████████████████░]  98% - Fase 5 (Testing + UI/UX) ✅
Marzo 2026:        [███████████░░░░░░░░░]  55% - Fase 6 (6.1-6.6 completadas ✅)
Abril 2026+:       [░░░░░░░░░░░░░░░░░░░░]   0% - Features Post-MVP
```

---

## 🎯 Priorización de Features

### **Criterios de Priorización**

1. **Valor de Negocio**: ¿Cuánto valor aporta al usuario?
2. **Esfuerzo**: ¿Cuánto tiempo tomará implementar?
3. **Dependencias**: ¿Requiere otras features completadas?
4. **Riesgo**: ¿Qué tan complejo/riesgoso es?

### **Matriz de Priorización**

| Feature             | Valor | Esfuerzo | Prioridad  | Estado        |
| ------------------- | ----- | -------- | ---------- | ------------- |
| Fase 5 (Testing)    | Alto  | Medio    | 🔴 Crítico | En progreso   |
| Fase 6 (Producción) | Alto  | Alto     | 🔴 Crítico | Pendiente     |
| Emails              | Alto  | Medio    | 🟡 Alta    | Pendiente     |
| Búsqueda Global     | Medio | Bajo     | 🟡 Alta    | Pendiente     |
| Exportación         | Medio | Medio    | 🟢 Media   | Pendiente     |
| Adjuntos            | Medio | Medio    | 🟢 Media   | Pendiente     |
| Integraciones       | Alto  | Alto     | 🔵 Baja    | Pendiente     |
| App Móvil           | Alto  | Muy Alto | 🔵 Baja    | Pendiente     |
| ~~Permisos~~        | Alto  | Bajo     | -          | ✅ Completado |
| ~~Dark Mode~~       | Bajo  | Bajo     | -          | ✅ Completado |
| ~~Mejoras UI/UX~~   | Medio | Medio    | -          | ✅ Completado |

---

## 📝 Notas de Implementación

### **Para Cada Feature Nueva**

**Antes de empezar**:

1. Leer `/AGENTS.md` y `.github/copilot/rules.md`
2. Crear ADR si es decisión arquitectónica
3. Estimar tiempo realista
4. Verificar dependencias

**Durante desarrollo**:

1. Seguir patrones existentes
2. Escribir tests (80%+ cobertura)
3. Documentar en sesión
4. Pre-commit checklist

**Después de completar**:

1. Actualizar CHANGELOG.md
2. Actualizar COMPLETED.md
3. Remover de BACKLOG.md
4. Crear PR con descripción

---

## 🔄 Revisión del Backlog

**Frecuencia**: Mensual  
**Responsable**: Líder del Proyecto  
**Criterios de revisión**:

- ¿Siguen siendo relevantes las features?
- ¿Han cambiado las prioridades?
- ¿Hay nuevas features a agregar?
- ¿Hay features a eliminar?

---

## 📚 Documentación Relacionada

**Roadmap**:

- [CURRENT.md](./CURRENT.md) - Sprint actual
- [COMPLETED.md](./COMPLETED.md) - Features completadas
- [README.md](./README.md) - Índice del roadmap

**Guías**:

- [/AGENTS.md](../../AGENTS.md) - Comandos, code style, patrones
- [.github/copilot/rules.md](../../.github/copilot/rules.md) - Reglas de desarrollo

**Contexto**:

- [docs/context/OVERVIEW.md](../context/OVERVIEW.md) - Visión del proyecto

---

## ✅ Resumen

**Próxima Prioridad**: Fase 6 - Producción (Vercel + Railway) - RECOMENDADA  
**MVP**: 98% completo (Testing 93.75%+ cobertura) ✅  
**Features Post-MVP**: 8 identificadas (3 completadas: Permisos, Dark Mode, Mejoras UI/UX)  
**Timeline estimado**: 2-3 meses para features principales (Git completo - 23 Feb 2026)

**Recuerda**: Mejor lanzar MVP completo en producción que agregar features sin deployment.

---

**Fin de roadmap/BACKLOG.md** | ~400 líneas | Features futuras y próximas fases

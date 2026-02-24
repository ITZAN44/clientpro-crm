# Backlog de Features y Próximas Fases

> **Propósito**: Listado priorizado de features futuras y mejoras planificadas
> **Última actualización**: 24 de febrero de 2026
> **Estado**: Planificación post-MVP (98% completo)

---

## 🎯 Visión General del Backlog

**Prioridad actual**: Fase 6 (Producción) - EN PROGRESO  
**Subfase completada**: 6.2 - Containerization (Docker) ✅  
**Features adicionales**: Post-MVP  
**Timeline estimado**: Marzo - Abril 2026  
**MVP**: 98% completo ✅

---

## 🚀 Fase 6: Nivel Senior Backend Developer (PRÓXIMA FASE)

**Prioridad**: CRÍTICA  
**Estimado**: 3-4 semanas  
**Dependencia**: Fase 5 completada (Testing 96%+ cobertura) ✅  
**Objetivo**: Alcanzar 75-80% en Backend Developer Roadmap (roadmap.sh/backend)

**Nota**: Esta fase NO incluye hosting en producción (proyecto de práctica para portfolio)

### **Score Actual vs Objetivo**

| Categoría               | Actual  | Objetivo   | Gap           |
| ----------------------- | ------- | ---------- | ------------- |
| Version Control Systems | 90%     | 90%        | ✅ COMPLETADO |
| Repo Hosting Services   | 90%     | 90%        | ✅ COMPLETADO |
| CI/CD                   | 0%      | 80%        | 🔴 CRÍTICO    |
| Containerization        | 85%     | 85%        | ✅ COMPLETADO |
| Caching                 | 10%     | 70%        | 🟡 Alta       |
| Web Servers             | 30%     | 75%        | 🟡 Alta       |
| Building For Scale      | 15%     | 60%        | 🟡 Media      |
| **Score General**       | **56%** | **75-80%** | **Senior**    |

---

### **Objetivos Principales**

1. ~~**Inicializar Version Control (Git + GitHub)**~~ - ✅ COMPLETADO (23 Feb 2026)
2. ~~**Implementar Containerization (Docker)**~~ - ✅ COMPLETADO (24 Feb 2026)
3. **Configurar CI/CD (GitHub Actions)** - CRÍTICO
4. **Implementar Caching (Redis)** - Alta Prioridad
5. **Configurar Web Server (Nginx)** - Alta Prioridad
6. **Mejorar Security & Observability** - Media Prioridad

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

#### **Subfase 6.4: Caching (Redis)** 🟡 Alta Prioridad

**Tiempo estimado**: 1 semana  
**Objetivo**: Caching 10% → 70%

**Tareas**:

1. **Instalar Redis** (30 min)
   - [ ] `npm install ioredis @nestjs/cache-manager cache-manager-redis-yet`
   - [ ] Configurar Redis en docker-compose (ya está)
   - [ ] Crear `backend/src/redis/redis.module.ts`

2. **Implementar Caching en Backend** (2 días)
   - [ ] Cache de queries frecuentes (clientes, negocios)
   - [ ] TTL configurables
   - [ ] Invalidación en mutations
   - [ ] Cache de estadísticas del dashboard
   - [ ] Interceptor de cache automático

   ```typescript
   // backend/src/clientes/clientes.service.ts
   @Injectable()
   export class ClientesService {
     constructor(
       private prisma: PrismaService,
       @Inject(CACHE_MANAGER) private cacheManager: Cache,
     ) {}

     async findAll(query: QueryClientesDto): Promise<ClienteResponseDto[]> {
       const cacheKey = `clientes:${JSON.stringify(query)}`;
       const cached = await this.cacheManager.get(cacheKey);

       if (cached) {
         return cached as ClienteResponseDto[];
       }

       const clientes = await this.prisma.cliente.findMany({ ... });
       await this.cacheManager.set(cacheKey, clientes, 300); // 5 min TTL
       return clientes;
     }

     async create(data: CreateClienteDto): Promise<ClienteResponseDto> {
       const cliente = await this.prisma.cliente.create({ data });
       await this.cacheManager.del('clientes:*'); // Invalidate cache
       return cliente;
     }
   }
   ```

3. **HTTP Caching Headers** (1 día)
   - [ ] Cache-Control headers en responses
   - [ ] ETags para recursos estáticos
   - [ ] Configurar en NestJS

4. **Documentación** (1 hora)
   - [ ] Estrategia de caching documentada
   - [ ] TTLs explicados
   - [ ] Invalidación de cache

**Evidencia de Completitud**:

- ✅ Redis funcionando en Docker
- ✅ Cache hits medibles (logs)
- ✅ Response times mejorados (< 100ms cached)
- ✅ Invalidación funcionando

**Impacto en Score**: Caching 10% → 70%

---

#### **Subfase 6.5: Web Servers (Nginx)** 🟡 Alta Prioridad

**Tiempo estimado**: 2 días  
**Objetivo**: Web Servers 30% → 75%

**Tareas**:

1. **Configurar Nginx** (3 horas)
   - [ ] Crear `nginx/nginx.conf`
   - [ ] Reverse proxy para backend
   - [ ] Servir frontend estático
   - [ ] Compresión Gzip habilitada
   - [ ] Rate limiting configurado
   - [ ] SSL/TLS ready (para producción futura)

   ```nginx
   # nginx/nginx.conf
   events {
     worker_connections 1024;
   }

   http {
     upstream backend {
       server backend:4000;
     }

     upstream frontend {
       server frontend:3000;
     }

     # Gzip compression
     gzip on;
     gzip_types text/plain text/css application/json application/javascript;

     # Rate limiting
     limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

     server {
       listen 80;
       server_name localhost;

       # Frontend
       location / {
         proxy_pass http://frontend;
         proxy_http_version 1.1;
         proxy_set_header Upgrade $http_upgrade;
         proxy_set_header Connection 'upgrade';
         proxy_set_header Host $host;
         proxy_cache_bypass $http_upgrade;
       }

       # Backend API
       location /api/ {
         limit_req zone=api burst=20 nodelay;
         proxy_pass http://backend/;
         proxy_http_version 1.1;
         proxy_set_header Host $host;
         proxy_set_header X-Real-IP $remote_addr;
         proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       }

       # WebSocket
       location /socket.io/ {
         proxy_pass http://backend;
         proxy_http_version 1.1;
         proxy_set_header Upgrade $http_upgrade;
         proxy_set_header Connection "upgrade";
       }
     }
   }
   ```

2. **Integrar Nginx en docker-compose** (1 hora)
   - [ ] Agregar servicio nginx
   - [ ] Configurar volúmenes
   - [ ] Puerto 80 expuesto

3. **Testing de Nginx** (30 min)
   - [ ] Verificar reverse proxy funciona
   - [ ] Verificar compression
   - [ ] Verificar rate limiting
   - [ ] Load testing básico (Apache Bench)

**Evidencia de Completitud**:

- ✅ Nginx funcionando en Docker
- ✅ Acceso vía localhost:80
- ✅ Gzip compression verificado
- ✅ Rate limiting verificado

**Impacto en Score**: Web Servers 30% → 75%

---

#### **Subfase 6.6: Security & Observability** 🟡 Media Prioridad

**Tiempo estimado**: 1 semana  
**Objetivo**: Building For Scale 15% → 60%

**Tareas de Seguridad**:

1. **Helmet.js** (30 min)
   - [ ] `npm install helmet`
   - [ ] Configurar en `main.ts`
   - [ ] Headers de seguridad habilitados

2. **Rate Limiting en NestJS** (1 hora)
   - [ ] `npm install @nestjs/throttler`
   - [ ] Configurar ThrottlerModule
   - [ ] Limitar login a 5/min
   - [ ] Limitar endpoints públicos

3. **Input Sanitization** (2 horas)
   - [ ] Instalar `class-sanitizer`
   - [ ] Sanitizar inputs en DTOs
   - [ ] Prevenir XSS adicional

4. **Audit de Dependencias** (1 hora)
   - [ ] `npm audit fix`
   - [ ] Actualizar dependencias críticas
   - [ ] Verificar sin vulnerabilidades HIGH

**Tareas de Observability**:

1. **Health Check Endpoint** (1 hora)
   - [ ] `npm install @nestjs/terminus`
   - [ ] Crear `backend/src/health/health.controller.ts`
   - [ ] Checks: database, redis, memory
   - [ ] Endpoint: GET `/health`

   ```typescript
   @Controller('health')
   export class HealthController {
     constructor(
       private health: HealthCheckService,
       private db: PrismaHealthIndicator
     ) {}

     @Get()
     @HealthCheck()
     check() {
       return this.health.check([
         () => this.db.pingCheck('database'),
         () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),
       ]);
     }
   }
   ```

2. **Structured Logging con Winston** (2 días)
   - [ ] `npm install winston nest-winston`
   - [ ] Reemplazar console.log
   - [ ] Niveles: error, warn, info, debug
   - [ ] Logs a archivo en desarrollo
   - [ ] JSON format para producción

3. **Basic Metrics** (1 día)
   - [ ] Crear endpoint `/metrics` (básico)
   - [ ] Request counter
   - [ ] Response time histogram
   - [ ] Error rate

4. **Error Tracking** (1 hora) - Opcional sin hosting
   - [ ] Preparar integración con Sentry (sin activar)
   - [ ] Configuración lista para futuro

**Evidencia de Completitud**:

- ✅ Helmet.js activo
- ✅ Rate limiting funcionando
- ✅ Health check respondiendo
- ✅ Logs estructurados con Winston
- ✅ npm audit sin HIGH vulnerabilities

**Impacto en Score**: Building For Scale 15% → 60%

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
- [ ] ✅ Nginx configurado como reverse proxy
- [ ] ✅ Helmet.js + Rate Limiting activos
- [ ] ✅ Health check endpoint funcionando
- [ ] ✅ Winston logging implementado
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
Marzo 2026:        [░░░░░░░░░░░░░░░░░░░░]   0% - Fase 6 (Producción)
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

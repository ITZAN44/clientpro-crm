# Sesión de Desarrollo - 5 de Marzo de 2026

**Fecha**: 5 de marzo de 2026  
**Subfase completada**: 6.6 (Security & Observability)  
**Versión**: v0.7.6  
**Estado**: ✅ Completada exitosamente

---

## 📋 Resumen Ejecutivo

Se completó exitosamente la **Subfase 6.6 - Security & Observability** con Helmet.js, rate limiting (`@nestjs/throttler` v6), input sanitization en DTOs, health check endpoint, Winston logging estructurado y módulo de métricas básicas. Score de "Security" y "Observability" en roadmap.sh/backend subió considerablemente.

**Logros principales**:

1. Helmet.js con CSP, HSTS, X-Frame-Options, X-Content-Type-Options activos en NestJS
2. Rate limiting con `@nestjs/throttler` v6: global (100r/60s) + estricto en login (5r/60s)
3. Input sanitization (`@Transform` + `trim()`/`toLowerCase()`) en 13 campos de 3 DTOs
4. Health check en `GET /health` — DB, Redis, Memory verificados en vivo
5. Winston logging estructurado en JSON con timestamp, context y level
6. Módulo de métricas en `GET /metrics` — totalRequests, errors, avgResponseTimeMs

---

## 🎯 Objetivo de la Sesión

**Objetivo Principal**:

- Completar Subfase 6.6: Security & Observability — implementar las 6 features del checklist del BACKLOG

**Instrucciones del usuario**:

- Comunicación en español
- Documentación concisa, directa, detallada — sin explayarse
- Solo documentar errores críticos (>2h resolver, repetidos, solución no obvia)
- El proyecto corre en Docker: backend NestJS + frontend Next.js + PostgreSQL + Redis + Nginx
- Para aplicar cambios al backend: `docker-compose build backend` + `docker-compose up -d backend`
- Para aplicar cambios al nginx: `docker-compose build nginx` + `docker-compose up -d nginx`

---

## ✅ Tareas Completadas

### **1. Helmet.js (HTTP Security Headers)**

**Archivo**: `backend/src/main.ts`

```typescript
import helmet from 'helmet';
app.use(helmet());
```

Headers activos: `Content-Security-Policy`, `Strict-Transport-Security`, `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, `X-DNS-Prefetch-Control`, `Referrer-Policy`.

---

### **2. Rate Limiting (`@nestjs/throttler` v6)**

**Archivos**: `backend/src/app.module.ts`, `backend/src/auth/auth.controller.ts`

**Configuración global** (`app.module.ts`):

```typescript
ThrottlerModule.forRoot([{ name: 'default', ttl: 60000, limit: 100 }]);
// + providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }]
```

**Rate limit estricto en login** (`auth.controller.ts`):

```typescript
@Throttle({ default: { limit: 5, ttl: 60000 } })
@Post('login')
async login(...) {}
```

Verificado: HTTP 429 en el 6to intento de login dentro de 60 segundos.

---

### **3. Input Sanitization**

**Archivos**: 3 DTOs create (clientes, negocios, actividades)

`@Transform(({ value }) => value?.trim())` aplicado a todos los campos `string`.  
`@Transform(({ value }) => value?.toLowerCase())` aplicado a campos `email`.  
Total: 13 campos sanitizados.

---

### **4. Health Check (`@nestjs/terminus`)**

**Archivos nuevos**: `backend/src/health/health.controller.ts`, `backend/src/health/health.module.ts`

```
GET /health → 200 OK
{
  "status": "ok",
  "info": { "database": {"status":"up"}, "redis": {"status":"up"}, "memory_heap": {"status":"up"} }
}
```

Nginx actualizado: `location /health { proxy_pass http://backend; }`.

---

### **5. Winston Logging Estructurado**

**Archivos**: `backend/src/main.ts`, `backend/src/app.module.ts`

Dependencias: `winston`, `nest-winston`.  
Formato: JSON con `timestamp`, `context`, `level`, `message`.  
Logger global reemplaza el logger por defecto de NestJS.

---

### **6. Módulo de Métricas Básicas**

**Archivos nuevos**: `backend/src/metrics/metrics.controller.ts`, `backend/src/metrics/metrics.module.ts`, `backend/src/common/interceptors/metrics.interceptor.ts`

```
GET /metrics → 200 OK
{
  "totalRequests": 42,
  "totalErrors": 1,
  "avgResponseTimeMs": 18.5,
  "uptime": 3600
}
```

`MetricsInterceptor` registrado como `APP_INTERCEPTOR` global en `app.module.ts`.  
Nginx actualizado: `location /metrics { proxy_pass http://backend; }`.

---

## 🐛 Discoveries (Errores Críticos)

### **Discovery 1: Prisma version mismatch rompe Docker build**

**Síntoma**: `npm audit fix` actualizó `prisma@7.4.2` pero dejó `@prisma/client@7.2.0`. `npx prisma generate` en Docker build fallaba con error de versión incompatible.

**Causa raíz**: `npm audit fix` actualiza `prisma` (CLI) pero no necesariamente `@prisma/client` (runtime) si están en rangos semver distintos. Las versiones deben ser idénticas.

**Intentos fallidos**:

1. ❌ Re-run `npm audit fix` — no resuelve, ya está en la versión "correcta" según audit
2. ❌ Modificar solo `prisma` sin `@prisma/client` — mismatch persiste

**Solución final**: `npm install @prisma/client@7.4.2` — forzar sincronización manual de versión.

---

### **Discovery 2: ThrottlerGuard no activo sin APP_GUARD**

**Síntoma**: `@Throttle()` en el controller no tenía ningún efecto — se podían hacer infinitas requests sin recibir 429.

**Causa raíz**: `ThrottlerModule.forRoot()` solo registra el módulo y configura límites. Sin agregar `{ provide: APP_GUARD, useClass: ThrottlerGuard }` en `providers` de `AppModule`, ningún guard está activo.

**Solución final**: Agregar el provider explícitamente en `app.module.ts`.

---

### **Discovery 3: Throttler sin `name` explícito no matchea `@Throttle({ default: ... })`**

**Síntoma**: Incluso con `APP_GUARD` activo, el decorador `@Throttle({ default: { limit: 5, ttl: 60000 } })` no aplicaba el límite estricto en login — usaba el global de 100 requests.

**Causa raíz**: En `@nestjs/throttler` v6, si `forRoot()` se llama sin `name` en la configuración (`[{ ttl: 60000, limit: 100 }]`), el throttler se registra internamente como `throttler-0`. El key `default` en `@Throttle({ default: ... })` no hace match con `throttler-0`.

**Solución final**: `ThrottlerModule.forRoot([{ name: 'default', ttl: 60000, limit: 100 }])` — el `name` debe coincidir exactamente con el key usado en `@Throttle()`.

---

## 📂 Archivos Principales Creados/Modificados

### **Archivos NUEVOS (5)**

```
backend/src/health/
├── health.controller.ts    # GET /health con PrismaHealthIndicator + Redis + Memory
└── health.module.ts        # TerminusModule + PrismaService

backend/src/metrics/
├── metrics.controller.ts   # GET /metrics — lectura del store in-memory
└── metrics.module.ts       # MetricsInterceptor provider

backend/src/common/interceptors/
└── metrics.interceptor.ts  # APP_INTERCEPTOR — conteo de requests, errores, tiempo promedio
```

### **Archivos MODIFICADOS (8)**

```
backend/src/main.ts
  - Agregado: helmet() middleware
  - Agregado: WinstonModule logger global (reemplaza NestJS default)

backend/src/app.module.ts
  - Agregado: ThrottlerModule.forRoot([{ name: 'default', ttl: 60000, limit: 100 }])
  - Agregado: { provide: APP_GUARD, useClass: ThrottlerGuard }
  - Agregado: WinstonModule.forRoot(...)
  - Agregado: HealthModule, MetricsModule
  - Agregado: { provide: APP_INTERCEPTOR, useClass: MetricsInterceptor }

backend/src/auth/auth.controller.ts
  - Agregado: @Throttle({ default: { limit: 5, ttl: 60000 } }) en método login()

backend/src/clientes/dto/create-cliente.dto.ts
  - Agregado: @Transform(trim) en nombre, apellido, empresa, telefono, direccion, ciudad, pais, notas (8 campos)
  - Agregado: @Transform(toLowerCase) en email (1 campo)

backend/src/negocios/dto/create-negocio.dto.ts
  - Agregado: @Transform(trim) en titulo, descripcion (2 campos)

backend/src/actividades/dto/create-actividad.dto.ts
  - Agregado: @Transform(trim) en titulo, descripcion (2 campos)

nginx/nginx.conf
  - Agregado: location /health { proxy_pass http://backend; }
  - Agregado: location /metrics { proxy_pass http://backend; }

backend/package.json + package-lock.json
  - Agregado: helmet, @nestjs/throttler, @nestjs/terminus, winston, nest-winston
  - Corregido: @prisma/client → 7.4.2 (sync con prisma@7.4.2)
```

---

## 🧪 Evidencia de Completitud

| Check                              | Resultado                                         |
| ---------------------------------- | ------------------------------------------------- |
| `GET /health` vía nginx            | ✅ 200 — database, redis, memory_heap up          |
| `GET /metrics` vía nginx           | ✅ 200 — totalRequests, errors, avgResponseTimeMs |
| Login: 6to intento en 60s          | ✅ 429 Too Many Requests                          |
| `X-Frame-Options` en response      | ✅ SAMEORIGIN (Helmet)                            |
| `Content-Security-Policy` presente | ✅ activo                                         |
| Logs en consola Docker             | ✅ JSON estructurado con timestamp+context+level  |
| Docker services                    | ✅ 5/5 healthy                                    |

---

## 📊 Impacto en Roadmap Backend Developer

| Categoría                                     | Antes | Después | Mejora   |
| --------------------------------------------- | ----- | ------- | -------- |
| Security (Helmet + Rate Limit + Sanitization) | ~20%  | ~70%    | **+50%** |
| Observability (Health + Logging + Metrics)    | ~10%  | ~55%    | **+45%** |
| Fase 6 general                                | ~80%  | ~87%    | **+7%**  |

---

## 🔜 Próximos Pasos

**Opciones recomendadas**:

1. **Subfase 6.7: Testing** — Alta Prioridad
   - Unit tests para servicios críticos (ClientesService, NegociosService, AuthService)
   - Integration tests para controllers
   - E2E tests para flujos principales
   - Tiempo estimado: 2 semanas

2. **Features Post-MVP**
   - Módulo de Emails (Nodemailer + templates)
   - Búsqueda global (Cmd+K) con full-text search
   - Exportación de datos (CSV/PDF)

3. **SSL/TLS con Let's Encrypt** — Opcional
   - nginx.conf ya preparado (bloque SSL comentado)
   - Requiere dominio real o mkcert para local

---

## 📚 Referencias

**Documentación Interna**:

- [SECURITY.md](../../../guides/security/SECURITY.md) — Guía técnica Subfase 6.6 (creada esta sesión)
- [ADR-011](../../../decisions/011-security-observability.md) — Decisiones técnicas Subfase 6.6
- [BACKLOG.md](../../../roadmap/BACKLOG.md) — Subfase 6.6 ✅ completada
- [DOCKER.md](../../../guides/docker/DOCKER.md) — Docker setup y troubleshooting

**Documentación Externa**:

- [@nestjs/throttler v6](https://docs.nestjs.com/security/rate-limiting)
- [@nestjs/terminus](https://docs.nestjs.com/recipes/terminus)
- [helmet.js](https://helmetjs.github.io/)
- [nest-winston](https://github.com/gremo/nest-winston)

---

**Fin de Sesión** | Subfase 6.6 ✅ COMPLETADA (5 Mar 2026)

---

---

# Sesión de Desarrollo - 5 de Marzo de 2026 (Segunda sesión)

**Fecha**: 5 de marzo de 2026  
**Objetivo**: Tests unitarios para módulos sin cobertura + fix de tests rotos pre-existentes  
**Versión**: v0.7.6 (sin cambio)  
**Estado**: ✅ Completada — 131/131 tests pasando (9 suites)

---

## 🎯 Objetivo

Implementar tests unitarios para los módulos que carecían de cobertura tras la Subfase 6.6: `RedisCacheService`, `StatsService` y `MetricsInterceptor`. Adicionalmente, corregir tests pre-existentes rotos en `clientes.service.spec.ts` y `negocios.service.spec.ts`.

---

## 🐛 Discoveries (Errores Críticos)

### **Discovery: Tests pre-existentes rotos por inyección de RedisCacheService**

**Síntoma**: `clientes.service.spec.ts` y `negocios.service.spec.ts` fallaban con `"Nest can't resolve dependencies of the ClientesService (PrismaService, ?)"`. La `?` es `RedisCacheService`.

**Causa raíz**: `ClientesService` y `NegociosService` recibieron inyección de `RedisCacheService` en la Subfase 6.4, pero sus tests unitarios no fueron actualizados para incluir ese provider.

**Solución**: Agregar import de `RedisCacheService` + provider mock `{ get, set, del, delPattern }` en el `beforeEach` de ambos spec files.

### **Discovery: Mock de ioredis para RedisCacheService**

`RedisCacheService` crea `new Redis({...})` en su constructor. Necesita mock del módulo `ioredis`. Patrón funcional: variable `mockRedisInstance` (nombre con prefijo "mock" para respetar hoisting de Jest) + `jest.mock('ioredis', () => jest.fn(() => mockRedisInstance))`.

### **Discovery: MetricsInterceptor usa estado a nivel de módulo**

`metricsStore` es una variable a nivel de módulo, compartida entre todos los tests del mismo archivo. Solución: **delta-based assertions** — comparar `conteoAntes` vs `conteoDepués` en lugar de valores absolutos. Evita necesidad de `jest.resetModules()`.

---

## ✅ Tareas Completadas

| Tarea                          | Archivo                                           | Tests |
| ------------------------------ | ------------------------------------------------- | ----- |
| Spec para `RedisCacheService`  | `redis/redis-cache.service.spec.ts`               | 20    |
| Spec para `StatsService`       | `stats/stats.service.spec.ts`                     | 8     |
| Spec para `MetricsInterceptor` | `common/interceptors/metrics.interceptor.spec.ts` | 9     |
| Fix `ClientesService` spec     | `clientes/clientes.service.spec.ts`               | —     |
| Fix `NegociosService` spec     | `negocios/negocios.service.spec.ts`               | —     |

**Resultado final**: 9 suites / 131 tests — todos PASS.

---

## 📂 Archivos Creados/Modificados

### **Nuevos (3)**

```
backend/src/redis/redis-cache.service.spec.ts
backend/src/stats/stats.service.spec.ts
backend/src/common/interceptors/metrics.interceptor.spec.ts
```

### **Modificados (2)**

```
backend/src/clientes/clientes.service.spec.ts   — Fix: provider mock RedisCacheService
backend/src/negocios/negocios.service.spec.ts   — Fix: provider mock RedisCacheService
```

---

**Fin de Sesión** | Tests backend: 96 → 131 ✅ (5 Mar 2026)

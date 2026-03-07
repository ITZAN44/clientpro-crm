# 🔐 Security & Observability — ClientPro CRM

> **Última actualización**: 5 de marzo de 2026
> **Subfase**: 6.6 - Security & Observability
> **Estado**: Producción Ready ✅

---

## ¿Para quién es esta guía?

Desarrolladores backend que necesitan entender las capas de seguridad y observabilidad implementadas en el servidor NestJS (puerto 4000).

---

## Tabla de Contenidos

1. [Helmet.js — HTTP Security Headers](#1-helmetjs--http-security-headers)
2. [Rate Limiting — @nestjs/throttler](#2-rate-limiting--nestjsthrottler)
3. [Input Sanitization — class-transformer](#3-input-sanitization--class-transformer)
4. [Health Check — @nestjs/terminus](#4-health-check--nestjsterminus)
5. [Winston Logging — nest-winston](#5-winston-logging--nest-winston)
6. [Metrics — MetricsInterceptor](#6-metrics--metricsinterceptor)
7. [Nginx — Routing /health y /metrics](#7-nginx--routing-health-y-metrics)
8. [Endpoints de Observabilidad](#endpoints-de-observabilidad)
9. [Troubleshooting](#troubleshooting)

---

## 1. Helmet.js — HTTP Security Headers

**Qué hace**: Añade headers HTTP de seguridad en todas las respuestas del backend.

**Archivo**: `backend/src/main.ts`

```typescript
import helmet from 'helmet';

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
    hsts: { maxAge: 31536000, includeSubDomains: true },
    frameguard: { action: 'deny' },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  })
);
```

**Headers resultantes**:

| Header                      | Valor                                 |
| --------------------------- | ------------------------------------- |
| `Content-Security-Policy`   | `default-src 'self'; ...`             |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` |
| `X-Frame-Options`           | `DENY`                                |
| `Referrer-Policy`           | `strict-origin-when-cross-origin`     |

**Verificar**:

```bash
curl -I http://localhost/api/clientes
# Buscar: content-security-policy, x-frame-options, referrer-policy
```

---

## 2. Rate Limiting — @nestjs/throttler

**Qué hace**: Limita el número de requests por IP en endpoints críticos. El endpoint de login está restringido a **5 intentos por minuto**.

**Archivos**: `backend/src/app.module.ts`, `backend/src/auth/auth.controller.ts`

```typescript
// app.module.ts — configuración global
ThrottlerModule.forRoot([
  {
    name: 'default',   // ← nombre OBLIGATORIO (ver Troubleshooting)
    ttl: 60000,        // ventana de 60 segundos
    limit: 100,        // límite general por IP
  },
]),
// ThrottlerGuard como APP_GUARD (aplica globalmente)
{ provide: APP_GUARD, useClass: ThrottlerGuard },
```

```typescript
// auth.controller.ts — restricción específica en login
@Throttle({ default: { limit: 5, ttl: 60000 } })
@Post('login')
async login(@Body() loginDto: LoginDto) { ... }
```

**Verificar**:

```bash
# Enviar 6+ requests al login con password válido (6+ chars) — el 6to debe devolver 429
for i in $(seq 1 6); do
  curl -s -o /dev/null -w "%{http_code}\n" \
    -X POST http://localhost/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"123456"}'
done
# Esperado: 5x 401, luego 1x 429
```

---

## 3. Input Sanitization — class-transformer

**Qué hace**: Limpia los strings de entrada antes de la validación: hace `trim()` y elimina HTML potencialmente peligroso.

**DTOs modificados** (13 campos en total):

| Archivo                                               | Campos sanitizados                                |
| ----------------------------------------------------- | ------------------------------------------------- |
| `backend/src/clientes/dto/create-cliente.dto.ts`      | `nombre`, `email`, `telefono`, `empresa`, `notas` |
| `backend/src/negocios/dto/create-negocio.dto.ts`      | `titulo`, `descripcion`, `empresa`                |
| `backend/src/actividades/dto/create-actividad.dto.ts` | `titulo`, `descripcion`, `notas`                  |

**Patrón aplicado**:

```typescript
import { Transform } from 'class-transformer';
import sanitizeHtml from 'sanitize-html';

@IsString()
@Transform(({ value }) => sanitizeHtml(value?.trim() ?? '', { allowedTags: [] }))
nombre: string;
```

**Verificar**:

```bash
# Enviar HTML en un campo — debe llegar limpio al backend
curl -X POST http://localhost/api/clientes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"nombre":"<script>alert(1)</script>Juan","email":"j@test.com"}'
# El campo "nombre" guardado debe ser "Juan" (sin tags HTML)
```

---

## 4. Health Check — @nestjs/terminus

**Qué hace**: Expone `GET /health` con el estado de los servicios críticos: base de datos, Redis y memoria.

**Archivos**: `backend/src/health/health.controller.ts`, `backend/src/health/health.module.ts`

```typescript
@Get()
@HealthCheck()
check() {
  return this.health.check([
    () => this.db.pingCheck('database'),          // PrismaService
    () => this.redis.pingCheck('redis'),           // RedisCacheService
    () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024), // 150 MB
  ]);
}
```

**Respuesta esperada** (ver [Endpoints de Observabilidad](#endpoints-de-observabilidad)).

---

## 5. Winston Logging — nest-winston

**Qué hace**: Reemplaza el logger por defecto de NestJS con Winston. Los logs se emiten en formato JSON con `timestamp`, `context`, `level` y `message`.

**Archivos**: `backend/src/main.ts`, `backend/src/app.module.ts`

```typescript
// app.module.ts
WinstonModule.forRoot({
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
    }),
  ],
}),
```

```typescript
// main.ts — usar winston como logger del bootstrap
app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
```

**Ejemplo de log emitido**:

```json
{
  "timestamp": "2026-03-05T12:34:56.789Z",
  "level": "log",
  "context": "ClientesService",
  "message": "GET /clientes - 200 - 45ms"
}
```

**Verificar**:

```bash
docker-compose logs backend | head -20
# Los logs deben ser JSON válido, una línea por request
```

---

## 6. Metrics — MetricsInterceptor

**Qué hace**: Interceptor singleton que acumula métricas de requests en memoria. Expone `GET /metrics`.

**Archivos**:

- `backend/src/common/interceptors/metrics.interceptor.ts` — lógica de captura
- `backend/src/metrics/metrics.controller.ts` — endpoint de consulta

```typescript
// metrics.interceptor.ts (singleton via APP_INTERCEPTOR o registro global)
export const metricsStore = {
  totalRequests: 0,
  errors: 0,
  totalResponseTimeMs: 0,
};
```

**Respuesta esperada** (ver [Endpoints de Observabilidad](#endpoints-de-observabilidad)).

**Verificar**:

```bash
curl http://localhost/api/metrics
```

---

## 7. Nginx — Routing /health y /metrics

A partir de la Subfase 6.6, los endpoints `/health` y `/metrics` tienen sus propias reglas en nginx para evitar que lleguen al frontend.

**Archivo**: `nginx/nginx.conf`

```nginx
location /health {
    proxy_pass http://backend:4000/health;
}

location /metrics {
    proxy_pass http://backend:4000/metrics;
}
```

> **Antes de esta subfase**, ambas rutas caían en la regla genérica `/*` y se enviaban al frontend (Next.js), lo que devolvía 404.

---

## Endpoints de Observabilidad

### `GET /health`

Acceso vía nginx: `http://localhost/health`  
Acceso directo al backend: `http://localhost:4000/health`

**Respuesta OK** (`200`):

```json
{
  "status": "ok",
  "info": {
    "database": { "status": "up" },
    "redis": { "status": "up" },
    "memory_heap": { "status": "up" }
  },
  "error": {},
  "details": {
    "database": { "status": "up" },
    "redis": { "status": "up" },
    "memory_heap": { "status": "up" }
  }
}
```

**Respuesta degradada** (`503`): algún servicio en `"status": "down"`.

---

### `GET /metrics`

Acceso vía nginx: `http://localhost/metrics`  
Acceso directo al backend: `http://localhost:4000/metrics`

**Respuesta**:

```json
{
  "totalRequests": 142,
  "errors": 3,
  "avgResponseTimeMs": 48.7
}
```

---

## Troubleshooting

### `@Throttle` no tiene efecto — requests no son bloqueados

**Causa**: `ThrottlerModule.forRoot` debe recibir un arreglo con objetos que tengan `name`.

```typescript
// ❌ Incorrecto — no funciona con @Throttle({ default: ... })
ThrottlerModule.forRoot({ ttl: 60000, limit: 100 });

// ✅ Correcto
ThrottlerModule.forRoot([{ name: 'default', ttl: 60000, limit: 100 }]);
```

---

### `ThrottlerGuard` registrado pero decoradores `@Throttle` ignorados

**Causa**: El guard debe registrarse como `APP_GUARD` en `providers`, no en `controllers`.

```typescript
// ❌ Incorrecto
@UseGuards(ThrottlerGuard)
@Controller('auth')
export class AuthController {}

// ✅ Correcto — en app.module.ts providers
{ provide: APP_GUARD, useClass: ThrottlerGuard }
```

---

### Rate limit retorna 400 en lugar de 429 al hacer pruebas

**Causa**: `ValidationPipe` ejecuta antes que `ThrottlerGuard`. Si el body es inválido (ej. password con menos de 6 caracteres), el pipe rechaza con `400` antes de que el throttler cuente el intento.

**Solución**: Usar credenciales sintácticamente válidas al testear:

```bash
# ❌ password muy corto → 400 (ValidationPipe rechaza, throttler no cuenta)
-d '{"email":"a@b.com","password":"123"}'

# ✅ password válido → 401 (llega al throttler, cuenta el intento)
-d '{"email":"a@b.com","password":"123456"}'
```

---

**Documentación creada**: 5 de marzo de 2026
**Subfase**: 6.6 - Security & Observability
**Responsable**: ITZAN44

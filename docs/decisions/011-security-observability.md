# ADR-011: Security & Observability Stack — Helmet, Throttler, Winston, Terminus

> **Registro de Decisión Arquitectónica**  
> **Estado**: Aceptado  
> **Fecha**: 05/03/2026  
> **Etiquetas**: backend, security, observability, monitoring  
> **Autor**: ClientPro CRM Team

---

## 📋 Metadatos

| Campo                 | Valor                                              |
| --------------------- | -------------------------------------------------- |
| **Estado**            | ✅ Aceptado                                        |
| **Fecha de decisión** | 05 de marzo de 2026                                |
| **Implementado**      | Sí (Backend — Subfase 6.6)                         |
| **Relacionado**       | ADR-001 (NestJS), ADR-009 (Redis), ADR-010 (Nginx) |
| **Reemplaza**         | N/A                                                |
| **Depreca**           | N/A                                                |

---

## 📖 Contexto

### **Situación**

En la **Subfase 6.6 del Backend Roadmap** (Security & Observability), el backend NestJS carecía de:

- **Security headers HTTP** — sin protección contra clickjacking, MIME sniffing, XSS via headers
- **Rate limiting** — sin protección contra abuse/DDoS a nivel de aplicación
- **Structured logging** — solo `console.log` nativo, sin niveles ni formato JSON para producción
- **Health checks** — sin endpoint estándar para infraestructura (load balancers, Docker healthcheck)
- **Métricas básicas** — sin visibilidad sobre latencia y throughput de endpoints

### **Requisitos**

- Security headers estándar de la industria sin configuración compleja
- Rate limiting granular por endpoint (límites diferentes para auth vs API general)
- Logs en formato JSON estructurado para correlación en producción
- Health check endpoint con estado de DB, Redis y memoria
- Métricas de rendimiento básicas sin overhead de infraestructura Prometheus

### **Restricciones**

- Proyecto portfolio: evitar overhead operacional de stacks de observability complejos
- Ecosistema NestJS: preferir integraciones nativas del framework
- Dependencias ya instaladas: `ioredis`, `class-transformer` disponibles

---

## ✅ Decisión

Implementar un stack de cuatro componentes con integraciones nativas de NestJS:

| Componente             | Paquete                        | Propósito                            |
| ---------------------- | ------------------------------ | ------------------------------------ |
| **HTTP Security**      | `helmet`                       | Security headers en una línea        |
| **Rate Limiting**      | `@nestjs/throttler` v6         | Limiting granular por endpoint       |
| **Structured Logging** | `nest-winston` + `winston`     | JSON logs con niveles y transports   |
| **Health Checks**      | `@nestjs/terminus`             | Endpoint `/health` estándar NestJS   |
| **Métricas custom**    | `MetricsInterceptor`           | Latencia/throughput sin Prometheus   |
| **Sanitización**       | `@Transform` class-transformer | Input sanitization sin lib deprecada |

### **Justificación por componente**

**Helmet.js**: Un `app.use(helmet())` en `main.ts` aplica ~12 headers de seguridad (CSP, HSTS, X-Frame-Options, X-Content-Type-Options, etc.). Alternativa manual requeriría configurar cada header individualmente — mayor superficie de error.

**@nestjs/throttler v6**: Permite decoradores granulares `@Throttle({ default: { ttl: 60000, limit: 5 } })` por endpoint, esencial para limitar intentos de login de forma diferente al API general. Nginx puede hacer rate limiting por IP pero no tiene acceso al contexto de rutas NestJS.

**nest-winston + winston**: Reemplaza `console.log` con logs JSON estructurados con niveles (`error`, `warn`, `info`, `debug`), timestamps ISO, y transports configurables (consola en desarrollo, archivo/servicio externo en producción). La integración `nest-winston` reemplaza el logger nativo de NestJS transparentemente.

**@nestjs/terminus**: Solución oficial NestJS para health checks. El endpoint `GET /health` retorna estado de PostgreSQL (via Prisma), Redis (via ioredis ping), y memoria del proceso. Estándar compatible con Docker healthcheck y load balancers.

**MetricsInterceptor custom**: Interceptor NestJS que registra latencia por endpoint usando `Date.now()` sin dependencia de Prometheus/Grafana. Suficiente visibilidad para un proyecto portfolio sin infraestructura de métricas adicional.

**@Transform para sanitización**: `class-transformer` ya estaba instalado para serialización de DTOs. El decorador `@Transform(({ value }) => sanitize(value))` en los DTOs añade sanitización de input sin dependencia adicional. `class-sanitizer` está deprecado y abandonado.

### **Implementación — puntos clave**

```typescript
// main.ts — Helmet y configuración global
async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger(winstonConfig), // ← Reemplaza logger nativo
  });
  app.use(helmet()); // ← 12 security headers en una línea
  // ...
}
```

```typescript
// app.module.ts — ThrottlerModule con nombre explícito
ThrottlerModule.forRoot([{
  name: 'default',   // ← CRÍTICO: debe ser 'default' para @Throttle({ default: ... })
  ttl: 60000,
  limit: 100,
}]),
// + APP_GUARD → ThrottlerGuard en providers  ← CRÍTICO: sin esto @Throttle no tiene efecto
```

```typescript
// auth.controller.ts — Rate limiting granular
@Post('login')
@Throttle({ default: { ttl: 60000, limit: 5 } })  // 5 intentos/minuto en login
async login() { ... }
```

---

## 🐛 Problemas Críticos Encontrados

Estos bugs son específicos de `@nestjs/throttler` v6 y deben documentarse para evitar repetición.

### **Bug 1: ThrottlerGuard no registrado como APP_GUARD**

**Síntoma**: `@Throttle()` decorado en endpoints pero sin efecto — todas las requests pasan sin límite.

**Causa**: `ThrottlerModule.forRoot()` configura el módulo pero **no aplica el guard automáticamente**. Sin registrar `ThrottlerGuard` como proveedor global, los decoradores `@Throttle` no hacen nada.

**Fix**:

```typescript
// app.module.ts
providers: [
  {
    provide: APP_GUARD,
    useClass: ThrottlerGuard,  // ← Sin esto, @Throttle no tiene efecto
  },
],
```

---

### **Bug 2: Throttler sin nombre explícito (`throttler-0` vs `default`)**

**Síntoma**: `@Throttle({ default: { ttl: 60000, limit: 5 } })` no hace match con el throttler configurado. Sin error — simplemente no aplica el límite específico.

**Causa**: En `@nestjs/throttler` v6, si `forRoot` no incluye `name`, el throttler interno se registra como `throttler-0`. El decorador `@Throttle({ default: ... })` busca un throttler llamado `default` — mismatch silencioso.

**Fix**:

```typescript
// ❌ Sin nombre — throttler interno se llama 'throttler-0'
ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]);

// ✅ Con nombre explícito — @Throttle({ default: ... }) hace match
ThrottlerModule.forRoot([{ name: 'default', ttl: 60000, limit: 100 }]);
```

---

### **Bug 3: Prisma version mismatch tras `npm audit fix`**

**Síntoma**: `npx prisma generate` falla con error de versión incompatible después de ejecutar `npm audit fix`.

**Causa**: `npm audit fix` actualizó `prisma@7.4.2` (CLI) pero dejó `@prisma/client@7.2.0` (runtime) en la versión anterior. La CLI y el client deben ser exactamente la misma versión.

**Fix**:

```bash
npm install @prisma/client@7.4.2  # Alinear con prisma CLI
npx prisma generate               # Regenerar cliente
```

**Lección**: Después de `npm audit fix`, verificar siempre que `prisma` y `@prisma/client` tengan la misma versión en `package.json`.

---

## 📊 Consecuencias

### **Positivas** ✅

- Security headers HTTP estándar activados sin configuración compleja
- Rate limiting granular: login (5/min) vs API general (100/min) — mismo código, distinto límite
- Logs JSON estructurados: correlacionables, filtrables, compatibles con ELK/Datadog en el futuro
- Health check `/health` compatible con Docker healthcheck y cualquier load balancer
- Visibilidad de latencia por endpoint sin infraestructura adicional
- Sanitización de inputs integrada en los DTOs existentes

### **Negativas** ❌

- `nest-winston` añade verbosidad en configuración vs `console.log` directo
- `MetricsInterceptor` custom requiere mantenimiento manual si se añaden nuevas métricas
- Sin dashboards de métricas — solo logs (suficiente para portfolio, no para producción real)

### **Neutrales** ⚖️

- Helmet aplica políticas CSP conservadoras — puede requerir ajuste si se añaden CDNs externos
- Rate limiting en aplicación (no en Nginx) — duplica responsabilidades pero da granularidad por ruta

---

## 🔍 Alternativas Descartadas

### **Prometheus + Grafana (métricas)**

**Por qué se rechazó**: Para un proyecto portfolio, Prometheus requiere un contenedor adicional, Grafana otro, configuración de scraping, y dashboards. El `MetricsInterceptor` custom proporciona visibilidad suficiente en logs sin overhead operacional.

---

### **class-sanitizer (sanitización de inputs)**

**Por qué se rechazó**: Paquete deprecado, sin mantenimiento activo desde 2021, y con vulnerabilidades conocidas. `class-transformer` (ya instalado) provee `@Transform` con la misma capacidad.

---

## 📚 Referencias

### **Documentación Externa**

- [helmet.js](https://helmetjs.github.io/)
- [@nestjs/throttler docs](https://docs.nestjs.com/security/rate-limiting)
- [nest-winston](https://github.com/gremo/nest-winston)
- [@nestjs/terminus docs](https://docs.nestjs.com/recipes/terminus)

### **Código Relacionado**

- `backend/src/main.ts` — Helmet + WinstonModule bootstrap
- `backend/src/app.module.ts` — ThrottlerModule + APP_GUARD
- `backend/src/common/interceptors/metrics.interceptor.ts` — MetricsInterceptor custom
- `backend/src/health/health.controller.ts` — Endpoint `/health`
- `backend/src/auth/auth.controller.ts` — Ejemplo `@Throttle` granular

### **ADRs Relacionados**

- ADR-001: NestJS como framework (contexto de módulos/guards)
- ADR-009: RedisCacheService (ioredis usado en health check Redis)
- ADR-010: Nginx (rate limiting complementario a nivel de infraestructura)

---

## 🔄 Historial de Revisiones

| Fecha      | Cambio           | Autor              |
| ---------- | ---------------- | ------------------ |
| 05/03/2026 | Creación inicial | ClientPro CRM Team |

---

**Fin de ADR-011** | Security & Observability Stack | 05/03/2026

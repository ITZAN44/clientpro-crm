# Sesión de Desarrollo - 4 de Marzo de 2026

**Fecha**: 4 de marzo de 2026  
**Subfase completada**: 6.5 (Web Servers - Nginx)  
**Versión**: v0.7.5  
**Estado**: ✅ Completada exitosamente

---

## 📋 Resumen Ejecutivo

Se completó exitosamente la **Subfase 6.5 - Web Servers (Nginx)** con configuración de reverse proxy, gzip, rate limiting y security headers. Score de "Web Servers" en roadmap.sh/backend subió de 30% → 75% (+45%).

**Logros principales**:

1. Nginx como entry point único en puerto 80 (reverse proxy → backend:4000 y frontend:3000)
2. Gzip compression, rate limiting (10r/s burst=20), security headers
3. Fix de `NEXT_PUBLIC_*` vars bakeadas en build time
4. Docker Compose actualizado: 4 → 5 servicios

---

## 🎯 Objetivo de la Sesión

**Objetivo Principal**:

- Completar Subfase 6.5: Web Servers (Nginx) — subir score de "Web Servers" de 30% → 75% en roadmap.sh/backend

**Instrucciones del usuario**:

- Comunicación en español
- Documentación concisa, directa, detallada — sin explayarse
- Solo documentar errores críticos (>2h resolver, repetidos, solución no obvia)
- El proyecto corre en Docker

---

## ✅ Tareas Completadas

### **1. Nginx como Reverse Proxy**

**Configuración** (`nginx/nginx.conf`):

- Upstream `backend` → `backend:4000`
- Upstream `frontend` → `frontend:3000`
- Routing por prefijo:
  - `/api/auth/*` → frontend (NextAuth callbacks — longest prefix, prioridad sobre `/api/`)
  - `/api/` → backend (NestJS REST)
  - `/socket.io/` → backend (WebSocket upgrade)
  - `/` → frontend (Next.js App)
- Gzip: `gzip on` con `gzip_types` para HTML, JSON, CSS, JS, SVG
- Rate limiting: `limit_req_zone` 10r/s, burst=20

---

### **2. Security Headers**

Headers configurados en nginx:

```nginx
add_header X-Frame-Options "SAMEORIGIN";
add_header X-Content-Type-Options "nosniff";
add_header X-XSS-Protection "1; mode=block";
add_header Referrer-Policy "strict-origin-when-cross-origin";
add_header Permissions-Policy "camera=(), microphone=(), geolocation=()";
```

SSL/TLS preparado (comentado, listo para activar con certificados).

---

### **3. Fix de NEXT*PUBLIC*\* en Build Time**

**Problema crítico**: `NEXT_PUBLIC_*` se bakea con webpack DefinePlugin en BUILD TIME, no en runtime. Ver sección de Discoveries.

**Solución aplicada en `frontend/Dockerfile`**:

```dockerfile
# Stage: builder
ARG NEXT_PUBLIC_API_URL=http://localhost/api
ARG NEXT_PUBLIC_SOCKET_URL=http://localhost
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_SOCKET_URL=$NEXT_PUBLIC_SOCKET_URL
```

**docker-compose.yml** — sección `build` del servicio frontend:

```yaml
build:
  context: ./frontend
  args:
    NEXT_PUBLIC_API_URL: ${NEXT_PUBLIC_API_URL}
    NEXT_PUBLIC_SOCKET_URL: ${NEXT_PUBLIC_SOCKET_URL}
```

---

### **4. Separación de Variables de Entorno**

Se creó `NEXT_PUBLIC_SOCKET_URL` como variable independiente:

- `NEXT_PUBLIC_API_URL=http://localhost/api` → REST calls (con prefijo `/api/` para routing nginx)
- `NEXT_PUBLIC_SOCKET_URL=http://localhost` → Socket.io (conecta al root, nginx maneja `/socket.io/`)

`frontend/src/lib/socket.ts` modificado para usar `NEXT_PUBLIC_SOCKET_URL` en lugar de `NEXT_PUBLIC_API_URL`.

---

## 🐛 Discoveries (Errores Críticos)

### **Discovery 1: NEXT*PUBLIC*\* vars bakeadas en build time**

**Síntoma**: `NEXT_PUBLIC_API_URL` era `undefined` en el bundle → código usaba fallback `'http://localhost:4000'` → todas las llamadas del browser bypaseaban nginx y apuntaban directo al backend en :4000.

**Causa raíz**:

- Next.js usa `webpack DefinePlugin` para reemplazar `process.env.NEXT_PUBLIC_*` en BUILD TIME
- El `frontend/Dockerfile` original no pasaba `ARG` en el stage `builder` → la variable no existía durante `next build`
- Con nginx en :80, las URLs del browser deben apuntar a `http://localhost/api`, no `http://localhost:4000`

**Intentos fallidos**:

1. ❌ Modificar solo `environment:` en docker-compose (sin `ARG` en Dockerfile) → variable disponible en runtime pero ya es tarde, el bundle está compilado
2. ❌ nginx `sub_filter` para rewrite de URLs en responses → no funciona para código JS ya evaluado
3. ❌ Usar `NEXT_PUBLIC_*` en `next.config.js` con `env:` → misma limitación, bakea en build time

**Solución final**:

- Agregar `ARG` + `ENV` en stage `builder` del Dockerfile
- Pasar `args:` en sección `build:` de docker-compose
- Asegurar que `.env.docker` tenga los valores correctos apuntando a `localhost` (no `:4000`)

---

### **Discovery 2: Conflicto potencial NextAuth vs NestJS routing en nginx**

**Síntoma/Riesgo**: Nginx tiene `/api/` → backend. Next.js tiene `/api/auth/*` (NextAuth). NestJS tiene `/auth/login`.

**Análisis**:

- NextAuth corre server-side en Next.js, expone callbacks en `/api/auth/*` (browser los llama)
- NestJS `/auth/login` es llamado **server-side por NextAuth** usando `API_URL=http://backend:4000` (red interna Docker, nunca pasa por nginx)
- El browser nunca llama directamente a NestJS `/auth/login`

**Solución**: nginx usa longest prefix match → `/api/auth/` (más específico) tiene prioridad sobre `/api/` → NextAuth funciona, REST API funciona, sin conflicto real.

**Lo que no era necesario hacer**:

- ❌ Separar puertos para frontend y backend en nginx
- ❌ Reglas regex complejas en nginx para excluir `/api/auth/`

---

### **Discovery 3: Separación NEXT_PUBLIC_API_URL vs NEXT_PUBLIC_SOCKET_URL**

**Síntoma**: `socket.ts` usaba `NEXT_PUBLIC_API_URL` para conectar Socket.io. Con `NEXT_PUBLIC_API_URL=http://localhost/api`, Socket.io intentaba conectar a `http://localhost/api` en lugar de `http://localhost`.

**Causa raíz**: Socket.io debe conectar al root del servidor (`http://localhost`), no al prefijo `/api/`. nginx maneja `/socket.io/` como path separado.

**Solución**: Nueva variable `NEXT_PUBLIC_SOCKET_URL=http://localhost`, `socket.ts` actualizado para usarla.

---

## 📂 Archivos Principales Creados/Modificados

### **Archivos NUEVOS (2)**

```
nginx/
├── nginx.conf          # ✅ Reverse proxy, gzip, rate limiting, security headers
└── Dockerfile          # ✅ nginx:1.25-alpine + curl para healthcheck
```

### **Archivos MODIFICADOS (4)**

```
docker-compose.yml
  - Agregado: servicio nginx (puerto 80, depends_on backend+frontend, healthcheck)
  - Agregado: build args en sección build del servicio frontend

frontend/Dockerfile
  - Agregado: ARG NEXT_PUBLIC_API_URL=http://localhost/api (stage builder)
  - Agregado: ARG NEXT_PUBLIC_SOCKET_URL=http://localhost (stage builder)
  - Agregado: ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL (stage builder)
  - Agregado: ENV NEXT_PUBLIC_SOCKET_URL=$NEXT_PUBLIC_SOCKET_URL (stage builder)

frontend/src/lib/socket.ts
  - Cambiado: NEXT_PUBLIC_API_URL → NEXT_PUBLIC_SOCKET_URL para URL de conexión

.env.docker
  - Cambiado: NEXT_PUBLIC_API_URL=http://localhost/api (antes apuntaba a :4000)
  - Agregado: NEXT_PUBLIC_SOCKET_URL=http://localhost
  - Cambiado: NEXTAUTH_URL=http://localhost (antes :3000)

.env
  - Mismos cambios que .env.docker
```

---

## 🧪 Evidencia de Completitud

| Check                          | Resultado                                        |
| ------------------------------ | ------------------------------------------------ |
| `GET /` vía nginx:80           | ✅ 200 — frontend OK                             |
| `Content-Encoding: gzip`       | ✅ gzip activo                                   |
| `GET /api/clientes` sin token  | ✅ 401 — proxea a backend                        |
| `GET /api/auth/session`        | ✅ 200 — NextAuth OK                             |
| Rate limiting (30 req rápidas) | ✅ 429 activado                                  |
| Security headers presentes     | ✅ X-Frame-Options, X-Content-Type-Options, etc. |
| Socket.io conecta por nginx    | ✅ /socket.io/ proxeado                          |
| Docker services running        | ✅ 5/5 healthy                                   |

---

## 📊 Impacto en Roadmap Backend Developer

| Categoría       | Antes | Después | Mejora      |
| --------------- | ----- | ------- | ----------- |
| Web Servers     | 30%   | 75%     | **+45%** 🚀 |
| Docker Services | 4     | 5       | **+1**      |

---

## 🔜 Próximos Pasos

**Opciones recomendadas**:

1. **Subfase 6.6: Security & Observability** — Media Prioridad
   - Helmet.js + rate limiting en NestJS
   - Health check endpoint (`/health`)
   - Winston logging estructurado
   - Tiempo estimado: 1 semana

2. **SSL/TLS con Let's Encrypt** — Opcional
   - nginx.conf ya preparado (bloque SSL comentado)
   - Requiere dominio real o mkcert para local

3. **Features Post-MVP**
   - Módulo de Emails
   - Búsqueda global (Cmd+K)
   - Exportación de datos

---

## 📚 Referencias

**Documentación Interna**:

- [DOCKER.md](../../../guides/docker/DOCKER.md) — Docker setup y troubleshooting
- [CACHING.md](../../../guides/CACHING.md) — Redis caching (Subfase 6.4)
- [BACKLOG.md](../../../roadmap/BACKLOG.md) — Subfase 6.5

**Documentación Externa**:

- [nginx Reverse Proxy](https://nginx.org/en/docs/http/ngx_http_proxy_module.html)
- [Next.js Environment Variables — Build Time](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables#bundling-environment-variables-for-the-browser)

---

**Fin de Sesión** | Subfase 6.5 ✅ COMPLETADA (4 Mar 2026)

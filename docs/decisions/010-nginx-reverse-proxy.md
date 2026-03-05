# ADR-010: Nginx como Reverse Proxy para el Stack Docker

## ADR-010: Nginx como Reverse Proxy — Single Entry Point

**Estado**: Aceptado  
**Fecha**: 2026-03-04  
**Decisores**: Equipo ClientPro CRM  
**Etiquetas**: infrastructure, devops, nginx, reverse-proxy, docker

---

## Contexto

### Antecedentes

Con la containerización completa del stack (ADR-007), el proyecto quedó con tres servicios expuestos directamente: frontend (puerto 3000), backend (puerto 4000) y base de datos (puerto 5432). Esto generaba varias fricciones:

- El cliente navegador debía conocer dos URLs distintas: `localhost:3000` para la UI y `localhost:4000` para la API.
- Las variables de entorno `NEXT_PUBLIC_API_URL` y `NEXT_PUBLIC_SOCKET_URL` debían hardcodear puertos específicos, fragilizando el setup.
- No existía punto centralizado para gzip, rate limiting, ni security headers.
- El WebSocket de Socket.io (puerto 4000) requería que el navegador abriera una conexión directa al backend, exponiendo la topología interna.

La subfase 6.5 del proyecto abordó la incorporación de un **single entry point** para el stack Docker.

### Requisitos

- Un único puerto externo (80) como entry point para browser → stack.
- Ruteo transparente: `/api/*` al backend NestJS, `/*` al frontend Next.js.
- WebSocket proxying sin interrumpir el handshake HTTP→WS de Socket.io.
- Capacidad de añadir SSL/TLS en el futuro sin cambios estructurales.
- Sin introducir complejidad operacional innecesaria para un proyecto de portfolio.

### Restricciones

- Proyecto de portfolio: la solución debe ser comprensible y mantenible por un desarrollador individual.
- Stack ya definido en Docker Compose (no se justifica orquestador externo).
- Frontend es Next.js con variables `NEXT_PUBLIC_*` — restricción crítica de build time (ver sección Decisión).

---

## Decisión

**Solución Elegida**: Nginx como reverse proxy, añadido como quinto servicio en Docker Compose.

### Justificación

Nginx es el reverse proxy más documentado del ecosistema, con soporte nativo para WebSocket upgrades, gzip, rate limiting, y SSL/TLS termination. Su configuración es declarativa y legible. Para las necesidades del proyecto (ruteo, WebSocket, compresión) no existe alternativa más madura con menor curva de aprendizaje.

### Routing implementado

```
Browser → nginx:80
  /api/auth/*  → frontend:3000   (NextAuth — longest prefix wins)
  /api/*       → backend:4000    (NestJS API, strip /api prefix)
  /socket.io/* → backend:4000    (WebSocket upgrade headers)
  /*           → frontend:3000   (Next.js páginas y assets)
```

**Nota de orden**: `/api/auth/` se define antes que `/api/` porque Nginx usa _longest prefix match_ en `location` blocks. NextAuth maneja sus propias rutas en el frontend y no debe redirigirse al backend.

El prefijo `/api` se elimina antes de enviar al backend:

```nginx
location /api/ {
    rewrite ^/api/(.*) /$1 break;
    proxy_pass http://backend:4000;
}
```

WebSocket proxying requiere headers explícitos:

```nginx
location /socket.io/ {
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_pass http://backend:4000;
}
```

### Problema crítico resuelto: NEXT*PUBLIC*\* vars en build time

Este fue el problema más no-obvio de toda la subfase y merece documentación explícita.

**El problema**: Las variables de entorno con prefijo `NEXT_PUBLIC_` en Next.js son procesadas por webpack's `DefinePlugin` **en tiempo de build**, no en runtime. Esto significa que el valor se "bake" (incrusta literalmente) en los bundles JavaScript durante `next build`. Un `docker-compose.yml` que define `NEXT_PUBLIC_API_URL=http://localhost/api` en la sección `environment` del servicio `frontend` **no tiene efecto** si el build ya ocurrió sin ese valor.

**El síntoma**: El frontend enviaba peticiones a `http://localhost:4000` (el fallback hardcodeado en el código) en lugar de `http://localhost/api`, porque el Dockerfile original no recibía el ARG en el stage `builder`.

**Dockerfile original (roto para este caso)**:

```dockerfile
FROM node:22-alpine AS builder
# ARGs para NEXT_PUBLIC_* NO estaban declarados aquí
RUN npm run build   # Build sin las variables → fallback al hardcode
```

**Solución aplicada**: declarar `ARG` y promoverlos a `ENV` en el stage `builder`:

```dockerfile
FROM node:22-alpine AS builder
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_SOCKET_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_SOCKET_URL=$NEXT_PUBLIC_SOCKET_URL
RUN npm run build   # Ahora webpack tiene los valores reales
```

Y en `docker-compose.yml`, pasarlos como `build args`:

```yaml
frontend:
  build:
    args:
      NEXT_PUBLIC_API_URL: http://localhost/api
      NEXT_PUBLIC_SOCKET_URL: http://localhost
```

**Variables separadas**: `NEXT_PUBLIC_API_URL` apunta a `/api` (con path), mientras `NEXT_PUBLIC_SOCKET_URL` apunta al origen sin path (Socket.io añade `/socket.io/` internamente).

### Detalles de implementación

- Nginx corre como servicio `nginx` en Docker Compose, en la misma red interna `crm-network`.
- El archivo de configuración se monta en `/etc/nginx/nginx.conf` vía bind mount.
- Solo el puerto `80:80` está expuesto al host; backend y frontend no exponen puertos directamente en producción Docker.
- La configuración incluye bloques comentados para SSL/TLS (Let's Encrypt) listos para descomentar.

---

## Consecuencias

### **Consecuencias Positivas** ✅

- Single entry point en puerto 80: el browser solo conoce `http://localhost`.
- Gzip centralizado para todas las respuestas (frontend assets + API JSON).
- Rate limiting centralizado configurable en un solo lugar.
- Security headers (`X-Frame-Options`, `X-Content-Type-Options`, etc.) aplicados globalmente.
- SSL/TLS ready: solo descomentar el bloque de configuración.
- WebSocket proxying transparente sin cambios en el cliente Socket.io.
- Topología interna oculta: el browser no sabe que hay puertos 3000 y 4000.
- Patrón estándar de la industria: cualquier desarrollador web reconoce el setup.

### **Consecuencias Negativas** ❌

- Un servicio adicional en Docker Compose (5 servicios en total: postgres, redis, backend, frontend, nginx).
- El build del frontend es más lento si se cambian las URLs (requiere rebuild completo, no hot-reload).
- Las variables `NEXT_PUBLIC_*` **deben** pasarse como `build args` en Docker Compose — no como `environment` en runtime. Esto es contraintuitivo y puede causar confusión.
- Debugging más complejo: un error 502 puede venir de Nginx no alcanzando el servicio upstream, no del servicio mismo.
- Logs separados: hay que revisar logs de nginx además de backend y frontend.

### **Consecuencias Neutrales** ⚖️

- En desarrollo local (sin Docker), los puertos 3000 y 4000 siguen usándose directamente — Nginx solo aplica al stack containerizado.
- Añade una capa de abstracción que simplifica URLs pero requiere conocimiento de Nginx para modificaciones de ruteo.

### **Riesgos**

- **Misconfiguration de rutas**: Un error en el orden de `location` blocks puede romper NextAuth o el WebSocket. Mitigación: tests de humo en el pipeline CI que verifiquen `/api/health`, `/api/auth/session`, y la conexión Socket.io.
- **Build args olvidados**: Si alguien añade una nueva variable `NEXT_PUBLIC_*` y no la declara en el Dockerfile ARG, el bug es silencioso (usa el fallback). Mitigación: documentado en `AGENTS.md` y en el Dockerfile con comentario explícito.
- **Cambio de dominio en producción**: Las URLs están hardcodeadas en `build args`. Para producción real se necesitará un mecanismo de parametrización (variables de CI/CD). Actualmente aceptable para portfolio.

---

## Alternativas Consideradas

### **Alternativa A: Traefik**

**Pros**:

- Configuración via labels en Docker Compose (sin archivo de config separado).
- Dashboard de monitoreo integrado.
- Auto-discovery de servicios Docker.
- SSL/TLS automático con Let's Encrypt out of the box.

**Contras**:

- Curva de aprendizaje significativa: providers, middlewares, routers, entrypoints son conceptos propios de Traefik.
- Documentación más fragmentada para casos de uso específicos (WebSocket + Next.js + strip prefix).
- Para un proyecto de portfolio aumenta complejidad sin beneficio tangible.

**Por qué se rechazó**: Overkill para el scope del proyecto. El tiempo de configuración y debugging de Traefik supera el beneficio vs. Nginx para un stack de 2 servicios web.

---

### **Alternativa B: Caddy**

**Pros**:

- Sintaxis de `Caddyfile` más simple que nginx.conf.
- SSL/TLS automático nativo (mejor que Nginx para este caso).
- Configuración más concisa.

**Contras**:

- Menor ecosistema de ejemplos y Stack Overflow answers para casos de borde.
- Menos familiaridad en el equipo.
- El comportamiento de strip de prefijo requiere directiva `uri strip_prefix` — menos intuitivo.

**Por qué se rechazó**: Aunque técnicamente válido, la menor cantidad de recursos de troubleshooting y la menor familiaridad del equipo inclinaron la balanza hacia Nginx, que es la opción "battle-tested" con más ejemplos disponibles.

---

### **Alternativa C: HAProxy**

**Pros**:

- Excelente para load balancing y alta disponibilidad.
- Muy performante para tráfico masivo.

**Contras**:

- Orientado a load balancing puro, no a reverse proxy web con features HTTP.
- Configuración de WebSocket upgrade es más verbosa.
- No incluye gzip nativo (requiere módulo externo).
- Orientado a escenarios multi-instancia, no a single-node portfolio.

**Por qué se rechazó**: Diseñado para un problema distinto. ClientPro CRM no necesita load balancing; necesita ruteo HTTP inteligente y WebSocket proxying, que Nginx maneja mejor.

---

### **Alternativa D: Exponer puertos directamente (no hacer nada)**

**Pros**:

- Sin servicio adicional en Docker Compose.
- Sin complejidad de configuración.
- Debugging más directo (sin capa intermedia).

**Contras**:

- Dos URLs distintas para browser: `localhost:3000` (UI) y `localhost:4000` (API).
- Variables `NEXT_PUBLIC_*` hardcodean puertos específicos.
- Sin gzip, rate limiting, ni security headers centralizados.
- Sin preparación para SSL/TLS en un único punto.
- Topología interna expuesta al cliente.

**Por qué se rechazó**: Resuelve el problema de "funciona", pero no el de "está bien arquitecturado". Un CRM de portfolio debe demostrar buenas prácticas de deployment, y un single entry point es estándar en cualquier aplicación web real.

---

## Referencias

- [Nginx documentation — proxy_pass](https://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_pass)
- [Nginx — WebSocket proxying](https://nginx.org/en/docs/http/websocket.html)
- [Next.js — Environment Variables (NEXT*PUBLIC*\*)](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [ADR-007: Docker para Containerización](./007-docker-containerization.md)
- [ADR-003: Socket.io para Tiempo Real](./003-socket-io-realtime.md) — WebSocket que Nginx debe proxiar
- [ADR-002: Next.js 16 App Router](./002-nextjs-16-app-router.md) — Framework con restricción NEXT*PUBLIC*\*
- `nginx/nginx.conf` — Configuración implementada
- `frontend/Dockerfile` — ARGs declarados en stage builder
- `docker-compose.yml` — build args para NEXT*PUBLIC*\* vars

---

## Notas

### Consideraciones Futuras

- **SSL/TLS**: La configuración tiene bloques comentados listos. Para activar: descomentar servidor port 443, añadir certificados (Let's Encrypt via certbot o Caddy si se migra), y redirigir 80 → 443.
- **Múltiples instancias**: Si el proyecto escala a varios backends, Nginx soporta `upstream` blocks con load balancing sin cambios en el cliente.
- **Revisión en 6 meses**: Evaluar si Traefik o Caddy ofrecen ventajas reales al escalar a producción con dominio real.

### Preguntas Abiertas

- **Deployment a producción**: ¿Las URLs de `build args` se parametrizarán via variables de CI/CD (GitHub Actions secrets)? Actualmente hardcodeadas para desarrollo local.
- **Cache de assets**: ¿Debería Nginx añadir headers `Cache-Control` para assets estáticos del frontend? Actualmente Next.js gestiona esto internamente.

---

## Historial de Revisiones

| Fecha      | Cambio                         | Autor                |
| ---------- | ------------------------------ | -------------------- |
| 2026-03-04 | Decisión inicial — Subfase 6.5 | Equipo ClientPro CRM |

---

**Fin de ADR-010** | Nginx Reverse Proxy | Subfase 6.5 | 2026-03-04

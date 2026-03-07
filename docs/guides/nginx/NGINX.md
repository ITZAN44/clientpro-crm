# Nginx - Reverse Proxy Guide

> **Última actualización**: 4 de marzo de 2026
> **Imagen**: nginx:1.25-alpine
> **Estado**: Producción Ready ✅

---

## ¿Qué hace Nginx aquí?

Nginx actúa como **reverse proxy y punto de entrada único** para toda la aplicación. A partir de la Subfase 6.5, **el puerto 80 es el único punto de acceso externo**; los puertos 3000 (frontend) y 4000 (backend) ya no están expuestos directamente al host.

```
Browser
   │
   ▼
nginx:80  ←─── único entry point
   │
   ├── /api/auth/*   ──▶  frontend:3000  (NextAuth)
   ├── /api/*        ──▶  backend:4000   (NestJS, strip /api prefix)
   ├── /socket.io/*  ──▶  backend:4000   (WebSocket upgrade)
   └── /*            ──▶  frontend:3000  (Next.js)
```

---

## Routing - Tabla de Rutas

| Patrón               | Destino         | Notas                                    |
| -------------------- | --------------- | ---------------------------------------- |
| `/api/auth/*`        | `frontend:3000` | NextAuth maneja su propia auth API       |
| `/api/*`             | `backend:4000`  | `/api/` prefix eliminado antes de llegar |
| `/socket.io/*`       | `backend:4000`  | WebSocket upgrade habilitado             |
| `/*` (todo lo demás) | `frontend:3000` | Next.js App Router                       |

> **¿Por qué `/api/auth/*` va al frontend?**
> NextAuth expone sus endpoints en `/api/auth/` dentro del servidor Next.js. Si esta regla se enviara al backend NestJS, el login rompería. La regla está **antes** de la regla genérica `/api/*`.

---

## Features Implementadas

### Gzip Compression

```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript
           text/xml application/xml text/javascript image/svg+xml;
```

Reduce el tamaño de las respuestas de texto. Activado para los tipos MIME más comunes de una SPA.

### Rate Limiting

```nginx
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
limit_req zone=api burst=20 nodelay;
```

- **10 req/s** por IP como límite sostenido
- **burst=20**: permite ráfagas cortas sin rechazar
- **zone=api:10m**: 10 MB de memoria para la tabla de IPs (~160K IPs)

### Security Headers

| Header                   | Valor                             |
| ------------------------ | --------------------------------- |
| `X-Frame-Options`        | `DENY`                            |
| `X-XSS-Protection`       | `1; mode=block`                   |
| `X-Content-Type-Options` | `nosniff`                         |
| `Referrer-Policy`        | `strict-origin-when-cross-origin` |

### Proxy Headers

```nginx
proxy_set_header X-Real-IP          $remote_addr;
proxy_set_header X-Forwarded-For    $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto  $scheme;
```

El backend y frontend reciben la IP real del cliente (no la IP interna de nginx).

### SSL/TLS (Preparado, no activo)

La configuración SSL está comentada en `nginx/nginx.conf`. Ver sección [Activar SSL/TLS](#activar-ssltls) más abajo.

---

## Archivos

```
clientpro-crm/
├── nginx/
│   ├── nginx.conf      # Configuración principal
│   └── Dockerfile      # FROM nginx:1.25-alpine + copia nginx.conf
└── docker-compose.yml  # Servicio nginx definido aquí
```

---

## Variables de Entorno

> **IMPORTANTE: Las variables `NEXT_PUBLIC_*` se bakean en el build de Next.js.**

Next.js incrusta las variables `NEXT_PUBLIC_*` en el bundle de JavaScript en **tiempo de build**, no en tiempo de ejecución. Esto significa que **cambiar `.env` y reiniciar el contenedor NO es suficiente** — hay que reconstruir la imagen.

| Variable                 | Valor Docker           | Antes (Subfase 6.4)     |
| ------------------------ | ---------------------- | ----------------------- |
| `NEXT_PUBLIC_API_URL`    | `http://localhost/api` | `http://localhost:4000` |
| `NEXT_PUBLIC_SOCKET_URL` | `http://localhost`     | _(no existía)_          |
| `NEXTAUTH_URL`           | `http://localhost`     | `http://localhost:3000` |
| `API_URL`                | `http://backend:4000`  | `http://backend:4000`   |

- `NEXT_PUBLIC_API_URL`: URL que usa el **navegador** para llamar al backend (pasa por nginx).
- `NEXT_PUBLIC_SOCKET_URL`: URL base del socket (nginx hace el upgrade a WebSocket).
- `NEXTAUTH_URL`: Base URL que NextAuth usa para construir sus callbacks. Ahora apunta a nginx.
- `API_URL`: URL interna que usa NextAuth (servidor) para llamar al backend. Nunca cambia.

---

## Comandos Comunes

```bash
# Rebuild solo nginx (cambios en nginx.conf o Dockerfile)
docker-compose build nginx
docker-compose up -d nginx

# Rebuild frontend (OBLIGATORIO si cambias NEXT_PUBLIC_* en .env)
docker-compose build --no-cache frontend
docker-compose up -d frontend

# Ver logs de nginx en tiempo real
docker-compose logs -f nginx

# Acceder al shell de nginx
docker-compose exec nginx sh

# Recargar configuración nginx sin downtime (dentro del contenedor)
docker-compose exec nginx nginx -s reload

# Validar sintaxis de nginx.conf antes de aplicar
docker-compose exec nginx nginx -t
```

---

## Verificar que Funciona

### Checks rápidos con curl

```bash
# 1. App principal (Next.js via nginx)
curl -I http://localhost/
# Esperado: HTTP/1.1 200 OK

# 2. API backend (NestJS via nginx, /api/ prefix stripeado)
curl http://localhost/api/health
# Esperado: {"status":"ok"}

# 3. Healthcheck del contenedor nginx
curl http://localhost/api/health
# El mismo endpoint se usa en el Dockerfile healthcheck cada 30s

# 4. Security headers presentes
curl -I http://localhost/ | grep -i "x-frame\|x-content\|x-xss"
# Esperado: X-Frame-Options: DENY, X-Content-Type-Options: nosniff, etc.

# 5. Gzip activo
curl -H "Accept-Encoding: gzip" -I http://localhost/
# Esperado: Content-Encoding: gzip

# 6. Estado del contenedor y healthcheck
docker-compose ps nginx
# Esperado: Up (healthy)
```

### Verificar routing de WebSocket

```bash
# Confirmar que el upgrade header llega al backend
# En logs del backend, busca conexiones socket.io entrantes:
docker-compose logs backend | grep socket
```

---

## Troubleshooting

### nginx arranca pero la app no carga

```bash
# 1. Verificar que frontend y backend estén healthy primero
docker-compose ps

# 2. Ver logs de nginx para errores de proxy
docker-compose logs nginx | grep -i "error\|502\|503"

# 3. Errores 502 Bad Gateway = nginx no alcanza el upstream
#    Verificar nombres de servicio en docker-compose.yml vs nginx.conf
#    nginx.conf debe usar: proxy_pass http://frontend:3000
#                                      ^^^^^^^^^
#                          nombre del servicio en docker-compose, no "localhost"
```

### Login falla (NextAuth)

```bash
# Verificar que NEXTAUTH_URL sea http://localhost (no http://localhost:3000)
docker-compose exec frontend sh -c 'echo $NEXTAUTH_URL'
# Debe mostrar: http://localhost

# Si muestra http://localhost:3000, editar .env y rebuild:
docker-compose build --no-cache frontend && docker-compose up -d frontend
```

### Las llamadas al API fallan desde el browser

```bash
# Verificar que NEXT_PUBLIC_API_URL apunte a nginx, no al backend directo
docker-compose exec frontend sh -c 'echo $NEXT_PUBLIC_API_URL'
# En runtime esto no refleja el valor bakeado; verificar en browser DevTools:
# Application > Storage o Network tab, ver la URL que usa el JS
# Debe ser: http://localhost/api (NO http://localhost:4000)

# Si apunta a :4000, hay que rebuild con el .env correcto:
docker-compose build --no-cache frontend && docker-compose up -d frontend
```

### Rate limit disparando 429 en desarrollo

```bash
# Ver si requests están siendo limitadas
docker-compose logs nginx | grep "limiting requests"

# Ajuste temporal en nginx/nginx.conf (solo desarrollo):
# Cambiar rate=10r/s a rate=100r/s, luego rebuild nginx:
docker-compose build nginx && docker-compose up -d nginx
```

### Puerto 80 ya en uso

```bash
# Windows: encontrar proceso que usa :80
netstat -ano | findstr :80
taskkill /PID <PID> /F

# O cambiar el puerto en docker-compose.yml:
# ports: - "8080:80"
# Y actualizar NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

---

## Activar SSL/TLS

La configuración SSL está preparada pero comentada en `nginx/nginx.conf`. Para activarla:

### 1. Obtener certificados

```bash
# Opción A: Let's Encrypt (producción con dominio real)
# Usar certbot con el plugin nginx o standalone

# Opción B: Certificado self-signed (staging/desarrollo)
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/ssl/private.key \
  -out nginx/ssl/certificate.crt \
  -subj "/CN=localhost"
```

### 2. Montar certificados en el contenedor

En `docker-compose.yml`, agregar volumen al servicio nginx:

```yaml
nginx:
  volumes:
    - ./nginx/ssl:/etc/nginx/ssl:ro
```

### 3. Descomentar bloque SSL en nginx.conf

Buscar el bloque `# server { listen 443 ssl ...` y descomentar, ajustando las rutas:

```nginx
ssl_certificate     /etc/nginx/ssl/certificate.crt;
ssl_certificate_key /etc/nginx/ssl/private.key;
ssl_protocols       TLSv1.2 TLSv1.3;
ssl_ciphers         ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
```

### 4. Rebuild nginx y actualizar variables

```bash
docker-compose build nginx && docker-compose up -d nginx

# Actualizar .env:
# NEXT_PUBLIC_API_URL=https://tudominio.com/api
# NEXT_PUBLIC_SOCKET_URL=https://tudominio.com
# NEXTAUTH_URL=https://tudominio.com

# Rebuild frontend (variables bakeadas):
docker-compose build --no-cache frontend && docker-compose up -d frontend
```

---

**Documentación creada**: 4 de marzo de 2026
**Subfase**: 6.5 - Nginx Reverse Proxy
**Responsable**: ITZAN44

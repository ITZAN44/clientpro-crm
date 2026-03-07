# Docker - Guía de Containerización

> **Última actualización**: 4 de marzo de 2026
> **Versión Docker**: v3.8
> **Estado**: Producción Ready ✅

---

## 📦 Servicios Dockerizados

ClientPro CRM está completamente containerizado con **5 servicios** (incluye nginx desde Subfase 6.5):

| Servicio   | Imagen             | Puerto externo | Estado  | Healthcheck |
| ---------- | ------------------ | -------------- | ------- | ----------- |
| **Nginx**  | nginx:1.25-alpine  | **80** (entry) | Running | ✅ Healthy  |
| Backend    | Node 20 Alpine     | _(interno)_    | Running | ✅ Healthy  |
| Frontend   | Node 20 Alpine     | _(interno)_    | Running | ✅ Healthy  |
| PostgreSQL | Postgres 16 Alpine | 5432           | Running | ✅ Healthy  |
| Redis      | Redis 7 Alpine     | 6379           | Running | ✅ Healthy  |

> **Entry point principal**: `http://localhost` (puerto 80 vía nginx).
> Los puertos 3000 y 4000 ya **no están expuestos** al host directamente.
> Ver [nginx/NGINX.md](../nginx/NGINX.md) para detalles de routing.

---

## 🚀 Inicio Rápido

### Prerrequisitos

- Docker Desktop instalado y corriendo
- Git (para clonar el repositorio)
- 4GB RAM mínimo disponible
- Puertos **80**, 5432, 6379 libres (puertos 3000 y 4000 son internos a Docker)

### Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/ITZAN44/clientpro-crm.git
cd clientpro-crm

# 2. Copiar variables de entorno
cp .env.docker .env

# 3. Editar .env y cambiar las contraseñas (IMPORTANTE)
# Cambia: POSTGRES_PASSWORD, JWT_SECRET, NEXTAUTH_SECRET

# 4. Construir las imágenes (primera vez o después de cambios)
docker-compose build

# 5. Levantar todos los servicios
docker-compose up -d

# 6. Ejecutar migraciones de Prisma (CRÍTICO - Primera vez)
docker-compose exec backend npx prisma migrate deploy

# 7. Verificar que todos estén corriendo
docker-compose ps

# 8. Ver logs en tiempo real
docker-compose logs -f
```

### Verificación

Una vez levantados los servicios, verifica:

- **App (via nginx)**: http://localhost (debe cargar la interfaz de login)
- **API (via nginx)**: http://localhost/api/health (debe mostrar `{"status":"ok"}`)
- **Backend directo** _(interno, no expuesto)_: accesible solo dentro de Docker como `http://backend:4000`
- **Frontend directo** _(interno, no expuesto)_: accesible solo dentro de Docker como `http://frontend:3000`
- **PostgreSQL**: `docker-compose exec postgres psql -U postgres -d clientpro_crm`
- **Redis**: `docker exec clientpro-redis redis-cli ping` (debe responder "PONG")
- **Redis Cache**: `docker exec clientpro-redis redis-cli KEYS "*"` (debe mostrar cache keys)

---

## 📋 Comandos Comunes

### Gestión de Servicios

```bash
# Levantar todos los servicios
docker-compose up -d

# Levantar con logs en consola
docker-compose up

# Detener todos los servicios
docker-compose down

# Detener y eliminar volúmenes (⚠️ BORRA LA BASE DE DATOS)
docker-compose down -v

# Reiniciar todos los servicios
docker-compose restart

# Reiniciar un servicio específico
docker-compose restart backend
```

### Logs y Debugging

```bash
# Ver logs de todos los servicios
docker-compose logs

# Ver logs en tiempo real
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs backend
docker-compose logs frontend
docker-compose logs postgres

# Ver últimas 50 líneas de logs
docker-compose logs --tail=50 backend

# Ver logs desde hace 10 minutos
docker-compose logs --since=10m
```

### Estado y Salud

```bash
# Ver estado de todos los contenedores
docker-compose ps

# Ver uso de recursos
docker stats

# Inspeccionar un contenedor
docker inspect clientpro-backend

# Ejecutar comando dentro de un contenedor
docker-compose exec backend sh
docker-compose exec postgres psql -U postgres
docker-compose exec redis redis-cli
```

### Build y Rebuild

```bash
# Rebuild de todas las imágenes
docker-compose build

# Rebuild sin usar cache (fuerza reconstrucción completa)
docker-compose build --no-cache

# Rebuild de un servicio específico
docker-compose build backend
docker-compose build frontend

# Rebuild y restart
docker-compose up -d --build
```

---

## 🗄️ Gestión de Base de Datos

### Migraciones con Prisma

```bash
# Generar Prisma Client
docker-compose exec backend npx prisma generate

# Ejecutar migraciones
docker-compose exec backend npx prisma migrate deploy

# Ver estado de migraciones
docker-compose exec backend npx prisma migrate status

# Seed de datos
docker-compose exec backend npx prisma db seed
```

### Verificación de Redis Cache

```bash
# Ver keys de cache
docker exec clientpro-redis redis-cli KEYS "*"

# Ver stats de Redis
docker exec clientpro-redis redis-cli INFO stats

# Ver memoria usada
docker exec clientpro-redis redis-cli INFO memory | grep "used_memory_human"

# Monitorear comandos en tiempo real
docker exec clientpro-redis redis-cli MONITOR

# Limpiar cache (útil para testing)
docker exec clientpro-redis redis-cli FLUSHALL
```

### Backups de PostgreSQL

```bash
# Crear backup
docker-compose exec -T postgres pg_dump -U postgres clientpro_crm > backup_$(date +%Y%m%d_%H%M%S).sql

# Restaurar backup
docker-compose exec -T postgres psql -U postgres clientpro_crm < backup_20260224_163000.sql

# Backup con volumen Docker
docker run --rm -v desarrollo-wep-copia_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_backup.tar.gz -C /data .
```

### Migración desde Base de Datos Local a Docker

Si tienes una base de datos PostgreSQL corriendo localmente y quieres migrar los datos a Docker:

```bash
# PASO 1: Hacer backup de la base de datos local
# (Asumiendo que la DB local está en puerto 5501)
docker exec -i clientpro-postgres pg_dump -h host.docker.internal -p 5501 -U postgres -d clientpro_crm --no-owner --no-acl --clean --if-exists > backup_local.sql

# Si no tienes acceso directo, usa pg_dump desde tu máquina:
# Windows (si tienes PostgreSQL instalado):
pg_dump -h localhost -p 5501 -U postgres -d clientpro_crm --no-owner --no-acl --clean --if-exists > backup_local.sql

# PASO 2: Importar a Docker
docker-compose exec -T postgres psql -U postgres -d clientpro_crm < backup_local.sql

# PASO 3: Verificar que los datos se importaron
docker-compose exec postgres psql -U postgres -d clientpro_crm -c "SELECT COUNT(*) FROM \"Cliente\";"
docker-compose exec postgres psql -U postgres -d clientpro_crm -c "SELECT COUNT(*) FROM \"Usuario\";"

# PASO 4: Reiniciar backend para aplicar cambios
docker-compose restart backend
```

**⚠️ Notas importantes:**

- `--no-owner --no-acl`: Evita errores de permisos al importar
- `--clean --if-exists`: Elimina tablas existentes antes de importar
- `host.docker.internal`: Permite acceder a localhost desde dentro del contenedor (Windows/Mac)
- Si tu DB local usa un puerto diferente, ajusta el parámetro `-p`

---

## 🔧 Troubleshooting

### Problema: Contenedor marcado como "unhealthy"

```bash
# Ver logs del contenedor
docker-compose logs <servicio>

# Revisar healthcheck
docker inspect clientpro-backend | grep -A 10 Health

# Reiniciar el contenedor
docker-compose restart <servicio>
```

### Problema: Puerto ya en uso

```bash
# Windows
netstat -ano | findstr :3000
netstat -ano | findstr :4000

# Matar proceso (reemplaza <PID> con el número obtenido)
taskkill /PID <PID> /F

# O cambiar puerto en .env
BACKEND_PORT=4001
FRONTEND_PORT=3001
```

### Problema: Base de datos no se conecta

```bash
# Verificar que PostgreSQL esté healthy
docker-compose ps postgres

# Ver logs de PostgreSQL
docker-compose logs postgres

# Probar conexión manual
docker-compose exec postgres psql -U postgres -d clientpro_crm -c "SELECT version();"

# Verificar DATABASE_URL en .env
```

### Problema: Frontend no carga

```bash
# Ver logs del frontend
docker-compose logs -f frontend

# Verificar que nginx y el backend estén healthy
docker-compose ps

# Verificar NEXT_PUBLIC_API_URL en .env
# Valor correcto (Subfase 6.5+): http://localhost/api  (NO http://localhost:4000)
echo $NEXT_PUBLIC_API_URL
```

### Problema: "Credenciales inválidas" en login (NextAuth)

**Causa**: NextAuth no puede conectarse al backend porque usa `API_URL` (servidor), o `NEXTAUTH_URL` apunta al puerto incorrecto.

```bash
# Verificar que API_URL apunte al contenedor, NO a localhost
docker-compose exec frontend sh -c 'echo $API_URL'
# Debe mostrar: http://backend:4000

# Verificar NEXTAUTH_URL apunta a nginx (no a :3000)
docker-compose exec frontend sh -c 'echo $NEXTAUTH_URL'
# Debe mostrar: http://localhost  (NO http://localhost:3000)

# Si alguno está mal, editar .env y rebuild:
docker-compose build --no-cache frontend && docker-compose up -d frontend
```

### Problema: Base de datos vacía (sin tablas)

**Causa**: No se ejecutaron las migraciones de Prisma después del primer inicio

```bash
# Verificar estado de migraciones
docker-compose exec backend npx prisma migrate status

# Ejecutar migraciones pendientes
docker-compose exec backend npx prisma migrate deploy

# Verificar que las tablas se crearon
docker-compose exec postgres psql -U postgres -d clientpro_crm -c "\dt"

# (Opcional) Cargar datos de prueba
docker-compose exec backend npx prisma db seed
```

### Problema: Cache no funciona (Redis con 0 keys)

**Síntomas**:

```bash
# Backend logs muestran [CACHE SET] pero Redis está vacío
docker exec clientpro-redis redis-cli KEYS "*"
# (empty array)
```

**Causa**: Backend NO está usando RedisCacheService correctamente

```bash
# Verificar que backend se conectó a Redis
docker logs clientpro-backend | grep REDIS
# Debe mostrar: [REDIS] Conectado exitosamente

# Verificar REDIS_HOST
docker-compose exec backend sh -c 'echo $REDIS_HOST'
# Debe mostrar: redis (NO localhost)

# Si muestra localhost, editar docker-compose.yml:
# environment:
#   REDIS_HOST: redis  # DEBE ser "redis", no "localhost"

# Reiniciar backend
docker-compose restart backend

# Hacer request y verificar keys
curl http://localhost/api/clientes
docker exec clientpro-redis redis-cli KEYS "*"
# Debe mostrar: clientes:all:*
```

### Problema: Build falla por falta de memoria

```bash
# Aumentar memoria en Docker Desktop (Settings > Resources)
# Mínimo 4GB recomendado

# Limpiar imágenes y cache
docker system prune -a
docker builder prune
```

---

## 📂 Estructura de Archivos Docker

```
clientpro-crm/
├── docker-compose.yml          # Orquestación de servicios
├── .env.docker                 # Template de variables (commiteado)
├── .env                        # Variables locales (gitignored)
│
├── nginx/
│   ├── nginx.conf              # Configuración del reverse proxy
│   └── Dockerfile              # FROM nginx:1.25-alpine
│
├── backend/
│   ├── Dockerfile              # Multi-stage build NestJS
│   └── .dockerignore           # Archivos excluidos del build
│
└── frontend/
    ├── Dockerfile              # Multi-stage build Next.js
    └── .dockerignore           # Archivos excluidos del build
```

---

## 🔐 Variables de Entorno

### Variables Críticas (⚠️ Cambiar en producción)

```bash
# Seguridad
JWT_SECRET=cambiar-en-produccion-min-32-chars
NEXTAUTH_SECRET=cambiar-en-produccion-min-32-chars
POSTGRES_PASSWORD=cambiar-en-produccion

# Base de Datos
POSTGRES_DB=clientpro_crm
POSTGRES_USER=postgres

# URLs del Frontend (IMPORTANTE: variables separadas por propósito)
NEXT_PUBLIC_API_URL=http://localhost/api   # Para el navegador (pasa por nginx)
NEXT_PUBLIC_SOCKET_URL=http://localhost   # Para Socket.io cliente (pasa por nginx)
API_URL=http://backend:4000               # Para NextAuth (servidor, interno Docker)
NEXTAUTH_URL=http://localhost             # Base URL de NextAuth (apunta a nginx)
```

**⚠️ IMPORTANTE - Variables de Frontend:**

- `NEXT_PUBLIC_API_URL`: URL del backend accesible desde el **navegador** (via nginx en `/api`)
- `NEXT_PUBLIC_SOCKET_URL`: URL base del socket (nginx hace el upgrade a WebSocket)
- `API_URL`: URL del backend accesible desde el **contenedor frontend** (NextAuth, SSR) — nunca cambia
- `NEXTAUTH_URL`: Ahora apunta a nginx (`http://localhost`), no al frontend directo

**⚠️ CRÍTICO - Variables `NEXT_PUBLIC_*` se bakean en build:**

Next.js incrusta las variables `NEXT_PUBLIC_*` en el bundle JS en **tiempo de build**. Cambiar `.env` y reiniciar el contenedor **no es suficiente**. Siempre rebuildar frontend después de cambiar estas variables:

```bash
docker-compose build --no-cache frontend && docker-compose up -d frontend
```

### Generar Secretos Seguros

```bash
# En Linux/Mac
openssl rand -base64 32

# En Windows PowerShell
[System.Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))

# Online
# https://www.random.org/strings/
```

---

## 📊 Monitoreo

### Ver Uso de Recursos

```bash
# Uso de CPU, RAM, Red
docker stats

# Uso de disco de volúmenes
docker system df -v
```

### Logs Centralizados

```bash
# Todos los servicios con timestamps
docker-compose logs -f -t

# Solo errores
docker-compose logs | grep ERROR
docker-compose logs | grep -i error
```

---

## 🧹 Limpieza

### Limpieza Básica

```bash
# Detener servicios
docker-compose down

# Eliminar contenedores detenidos
docker container prune

# Eliminar imágenes sin usar
docker image prune

# Eliminar volúmenes sin usar
docker volume prune
```

### Limpieza Completa (⚠️ DESTRUCTIVO)

```bash
# Eliminar TODO (imágenes, contenedores, volúmenes, networks)
docker system prune -a --volumes

# Eliminar solo volúmenes de este proyecto
docker-compose down -v
```

---

## 🚀 Desarrollo vs Producción

### Modo Desarrollo (Actual)

```yaml
# docker-compose.yml
services:
  backend:
    build:
      context: ./backend
      target: production # Usa imagen optimizada
    restart: unless-stopped
```

### Modo Producción (Futuro)

Para producción, considera:

- **Nginx ya incluido**: Reverse proxy operativo desde Subfase 6.5 (ver [nginx/NGINX.md](../nginx/NGINX.md))
- **HTTPS**: Activar SSL/TLS en nginx (configuración preparada, ver guía nginx)
- **Secrets**: Docker Secrets o AWS Secrets Manager
- **Replicas**: Múltiples instancias del backend
- **Monitoring**: Prometheus + Grafana
- **Logging**: ELK Stack o Loki

---

## ❓ FAQs

**¿Puedo usar docker-compose en producción?**  
Sí, pero para escalar se recomienda Kubernetes o Docker Swarm.

**¿Los datos persisten si elimino los contenedores?**  
Sí, mientras no uses `docker-compose down -v`. Los volúmenes (`postgres_data`, `redis_data`) persisten los datos.

**¿Cómo actualizo las imágenes?**  
Ejecuta `docker-compose build && docker-compose up -d`.

**¿Puedo correr solo el backend?**  
Sí: `docker-compose up -d postgres redis backend`

**¿Cómo accedo al shell de un contenedor?**  
`docker-compose exec backend sh` (Alpine usa sh, no bash)

---

## 📚 Recursos Adicionales

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Dockerfile Best Practices](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)
- [Next.js Docker Deployment](https://nextjs.org/docs/deployment#docker-image)
- [NestJS Docker](https://docs.nestjs.com/recipes/prisma#issues-with-enableshutdownhooks)

---

**Documentación creada**: 24 de febrero de 2026  
**Última prueba exitosa**: 24 de febrero de 2026  
**Responsable**: ITZAN44

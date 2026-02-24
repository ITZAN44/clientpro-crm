# Docker - Guía de Containerización

> **Última actualización**: 24 de febrero de 2026  
> **Versión Docker**: v3.8  
> **Estado**: Producción Ready ✅

---

## 📦 Servicios Dockerizados

ClientPro CRM está completamente containerizado con 4 servicios principales:

| Servicio   | Imagen              | Puerto | Estado  | Healthcheck |
| ---------- | ------------------- | ------ | ------- | ----------- |
| Backend    | Node 20 Alpine      | 4000   | Running | ✅ Healthy  |
| Frontend   | Node 20 Alpine      | 3000   | Running | N/A         |
| PostgreSQL | Postgres 16 Alpine  | 5432   | Running | ✅ Healthy  |
| Redis      | Redis 7 Alpine      | 6379   | Running | ✅ Healthy  |

---

## 🚀 Inicio Rápido

### Prerrequisitos

- Docker Desktop instalado y corriendo
- Git (para clonar el repositorio)
- 4GB RAM mínimo disponible
- Puertos 3000, 4000, 5432, 6379 libres

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

- **Backend**: http://localhost:4000 (debe mostrar "Hello World!")
- **Frontend**: http://localhost:3000 (debe cargar la interfaz de login)
- **PostgreSQL**: `docker-compose exec postgres psql -U postgres -d clientpro_crm`
- **Redis**: `docker-compose exec redis redis-cli ping` (debe responder "PONG")

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

# Verificar que el backend esté healthy
docker-compose ps backend

# Verificar NEXT_PUBLIC_API_URL en .env
echo $NEXT_PUBLIC_API_URL  # Debe ser http://localhost:4000
```

### Problema: "Credenciales inválidas" en login (NextAuth)

**Causa**: NextAuth no puede conectarse al backend porque usa `API_URL` (servidor)

```bash
# Verificar que API_URL apunte al contenedor, NO a localhost
docker-compose exec frontend sh -c 'echo $API_URL'
# Debe mostrar: http://backend:4000

# Si muestra localhost o está vacío, editar docker-compose.yml:
# environment:
#   API_URL: http://backend:4000  # DEBE ser "backend", no "localhost"

# Reiniciar frontend
docker-compose restart frontend
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

# URLs del Frontend (IMPORTANTE: 2 variables diferentes)
NEXT_PUBLIC_API_URL=http://localhost:4000  # Para el navegador
API_URL=http://backend:4000                # Para NextAuth (servidor)
NEXTAUTH_URL=http://localhost:3000
```

**⚠️ IMPORTANTE - Variables de Frontend:**

- `NEXT_PUBLIC_API_URL`: URL del backend accesible desde el **navegador** del usuario
- `API_URL`: URL del backend accesible desde el **contenedor frontend** (NextAuth, SSR)
- Si NextAuth no funciona, verificar que `API_URL=http://backend:4000` (NO localhost)

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
      target: production  # Usa imagen optimizada
    restart: unless-stopped
```

### Modo Producción (Futuro)

Para producción, considera:

- **Reverse Proxy**: Nginx delante de Backend y Frontend
- **HTTPS**: Certificados SSL/TLS
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

# Docker - Guías de Containerización

Esta carpeta contiene guías relacionadas con Docker y containerización para ClientPro CRM.

---

## 📚 Guías Disponibles

### [DOCKER.md](./DOCKER.md)
**Guía completa de containerización con Docker Compose**

**Contenido**:
- Servicios dockerizados (Backend, Frontend, PostgreSQL, Redis)
- Instalación y configuración inicial
- Comandos esenciales de Docker Compose
- Healthchecks y monitoreo
- Troubleshooting común
- Configuración de producción
- Migración de datos con Prisma

**Cuándo leer**:
- Si quieres ejecutar ClientPro en contenedores
- Para entender la arquitectura de servicios
- Cuando necesites debuggear problemas de Docker
- Antes de hacer deployment a producción

---

## 🚀 Inicio Rápido

### Levantar Servicios

```bash
# 1. Clonar repositorio
git clone https://github.com/ITZAN44/clientpro-crm.git
cd clientpro-crm

# 2. Copiar variables de entorno
cp .env.docker .env

# 3. Editar .env (cambiar contraseñas)
# POSTGRES_PASSWORD, JWT_SECRET, NEXTAUTH_SECRET

# 4. Levantar servicios
docker-compose up -d

# 5. Ejecutar migraciones (PRIMERA VEZ)
docker-compose exec backend npx prisma migrate deploy

# 6. Verificar estado
docker-compose ps
```

### Acceder a la Aplicación

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

---

## 📦 Servicios Dockerizados

| Servicio   | Imagen              | Puerto | Healthcheck |
| ---------- | ------------------- | ------ | ----------- |
| Backend    | Node 20 Alpine      | 4000   | ✅ Healthy  |
| Frontend   | Node 20 Alpine      | 3000   | N/A         |
| PostgreSQL | Postgres 16 Alpine  | 5432   | ✅ Healthy  |
| Redis      | Redis 7 Alpine      | 6379   | ✅ Healthy  |

---

## 🛠️ Comandos Esenciales

```bash
# Levantar servicios
docker-compose up -d

# Ver logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Detener servicios
docker-compose down

# Reiniciar servicio específico
docker-compose restart backend

# Ver estado
docker-compose ps

# Ejecutar comandos en contenedor
docker-compose exec backend npx prisma migrate deploy
docker-compose exec backend npm run seed

# Acceder a shell
docker-compose exec backend sh
docker-compose exec postgres psql -U clientpro clientpro_crm
```

---

## 🔧 Desarrollo Local vs Docker

### Cuándo Usar Docker

✅ **Usa Docker si**:
- Quieres replicar el entorno de producción
- Necesitas aislar dependencias del sistema
- Trabajas en equipo y necesitas consistencia
- Vas a hacer deployment con Docker

❌ **Usa desarrollo local si**:
- Estás desarrollando activamente (Hot Reload más rápido)
- Necesitas debuggear con breakpoints
- Quieres menos overhead de recursos

### Migrar de Local a Docker

```bash
# 1. Detén servicios locales
npm run dev   # Ctrl+C para detener

# 2. Exporta datos (opcional)
cd backend
npx prisma db push --skip-generate
pg_dump -U postgres clientpro_crm > backup.sql

# 3. Levanta Docker
docker-compose up -d

# 4. Importa datos (opcional)
cat backup.sql | docker-compose exec -T postgres psql -U clientpro clientpro_crm
```

---

## 🐛 Troubleshooting Rápido

### Backend no inicia

```bash
# Ver logs completos
docker-compose logs backend

# Verificar Prisma generado
docker-compose exec backend npx prisma generate

# Reiniciar backend
docker-compose restart backend
```

### Base de datos no conecta

```bash
# Verificar estado de Postgres
docker-compose ps postgres

# Ver logs de Postgres
docker-compose logs postgres

# Reiniciar Postgres
docker-compose restart postgres
```

### Puerto ocupado

```bash
# Ver qué usa el puerto 3000
netstat -ano | findstr :3000

# Matar proceso (Windows)
taskkill /PID <PID> /F

# Matar proceso (Linux/Mac)
kill -9 <PID>
```

---

## 🔗 Guías Relacionadas

- **[ci-cd/GITHUB_ACTIONS.md](../ci-cd/GITHUB_ACTIONS.md)** - Workflows de CI/CD (incluye Docker Build)
- **[git/GIT_WORKFLOW.md](../git/GIT_WORKFLOW.md)** - Flujo de trabajo Git

---

## 📚 Recursos Externos

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Dockerfile Best Practices](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)
- [Next.js Docker Deployment](https://nextjs.org/docs/deployment#docker-image)
- [NestJS Docker](https://docs.nestjs.com/recipes/prisma)

---

**Última actualización**: Febrero 24, 2026  
**Versión**: 1.0.0

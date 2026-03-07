# 📁 Arquitectura del Proyecto - ClientPro CRM

> **Estructura de archivos y organización del código**

**Última actualización**: 24 Febrero 2026

---

## 🏗️ Estructura General

```
Desarrollo-Wep/
├── frontend/               # Next.js 16 (App Router)
├── backend/                # NestJS 11
├── database/               # Scripts SQL
├── docs/                   # Documentación
├── .opencode/              # Skills y configuración OpenCode
├── .github/                # GitHub Copilot config + PR templates
├── .husky/                 # Git Hooks (pre-commit, commit-msg)
├── package.json            # Scripts raíz (Concurrently)
├── .mcp.json               # MCPs configurados
├── opencode.jsonc          # Configuración OpenCode
├── AGENTS.md               # Guía para agentes de IA
├── CHANGELOG.md            # Historial de versiones
└── README.md               # Introducción del proyecto
```

---

## 🎨 Frontend (Next.js 16)

### **Estructura de Carpetas**

```
frontend/
├── src/
│   ├── app/                      # App Router (Next.js 16)
│   │   ├── api/                  # API Routes
│   │   │   └── auth/             # NextAuth endpoints
│   │   ├── login/                # Página de login
│   │   │   └── page.tsx
│   │   ├── dashboard/            # Dashboard principal
│   │   │   └── page.tsx
│   │   ├── clientes/             # Gestión de clientes
│   │   │   └── page.tsx
│   │   ├── negocios/             # Kanban de negocios
│   │   │   └── page.tsx
│   │   ├── actividades/          # Gestión de actividades
│   │   │   └── page.tsx
│   │   ├── reportes/             # Reportes y análisis
│   │   │   └── page.tsx
│   │   ├── admin/                # Administración ✨ NUEVO
│   │   │   └── usuarios/         # Gestión de usuarios (solo ADMIN)
│   │   │       └── page.tsx
│   │   ├── layout.tsx            # Layout raíz
│   │   └── page.tsx              # Redirect a /dashboard
│   │
│   ├── components/               # Componentes React
│   │   ├── ui/                   # shadcn/ui (16 componentes)
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   ├── table.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── select.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── label.tsx
│   │   │   ├── avatar.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── toast.tsx
│   │   │   ├── tooltip.tsx
│   │   │   ├── alert.tsx
│   │   │   └── checkbox.tsx
│   │   ├── auth/                 # Autenticación y roles ✨ NUEVO
│   │   │   ├── role-guard.tsx    # Renderizado condicional
│   │   │   └── protected-route.tsx # HOC para páginas
│   │   ├── admin/                # Componentes admin ✨ NUEVO
│   │   │   └── editar-rol-dialog.tsx
│   │   ├── notifications/        # Sistema de notificaciones
│   │   │   ├── notification-badge.tsx
│   │   │   ├── notification-dropdown.tsx
│   │   │   └── notification-item.tsx
│   │   └── providers/            # Context providers
│   │       ├── notification-provider.tsx
│   │       └── query-provider.tsx
│   │
│   ├── hooks/                    # Custom hooks ✨ NUEVO
│   │   └── use-auth.ts           # Hook de autenticación y roles
│   │
│   ├── lib/                      # Utilidades y helpers
│   │   ├── api/                  # Clientes API
│   │   │   ├── clientes.ts       # API de clientes
│   │   │   ├── negocios.ts       # API de negocios
│   │   │   ├── actividades.ts    # API de actividades
│   │   │   ├── reportes.ts       # API de reportes
│   │   │   ├── notificaciones.ts # API de notificaciones
│   │   │   └── usuarios.ts       # API de usuarios ✨ NUEVO
│   │   ├── socket.ts             # Socket.io client
│   │   ├── auth.ts               # NextAuth config
│   │   └── utils.ts              # Funciones helper (cn, etc.)
│   │
│   ├── types/                    # Interfaces TypeScript
│   │   ├── cliente.ts
│   │   ├── negocio.ts
│   │   ├── actividad.ts
│   │   ├── reporte.ts
│   │   ├── notificacion.ts
│   │   ├── rol.ts                # Enum de roles ✨ NUEVO
│   │   └── usuario.ts            # Interface de usuario ✨ NUEVO
│   │
│   └── styles/                   # Estilos globales
│       └── globals.css
│
├── public/                       # Archivos estáticos
├── jest.config.js                # Configuración Jest
├── jest.setup.js                 # Setup de tests
├── next.config.js                # Configuración Next.js
├── tailwind.config.ts            # Configuración Tailwind
├── tsconfig.json                 # Configuración TypeScript
├── package.json                  # Dependencias frontend
└── .env.local                    # Variables de entorno
```

### **Páginas Implementadas (7)**

1. **`/login`** - Login con NextAuth.js
2. **`/dashboard`** - Dashboard con métricas y actividades recientes
3. **`/clientes`** - DataTable con CRUD de clientes
4. **`/negocios`** - Kanban board con drag & drop
5. **`/actividades`** - Cards de actividades con filtros
6. **`/reportes`** - Gráficas interactivas + exportación PDF
7. **`/admin/usuarios`** - Gestión de usuarios y roles (solo ADMIN) ✨ NUEVO

### **Componentes UI (16 de shadcn/ui)**

- Button, Input, Card, Table, Dialog, Badge
- Select, Textarea, Label, Avatar, Tabs
- Dropdown Menu, Toast, Tooltip, Alert, Checkbox

---

## ⚙️ Backend (NestJS 11)

### **Estructura de Carpetas**

```
backend/
├── src/
│   ├── auth/                     # Módulo de autenticación
│   │   ├── dto/
│   │   │   ├── login.dto.ts
│   │   │   └── register.dto.ts
│   │   ├── guards/               # Guards ✨ ACTUALIZADO
│   │   │   ├── jwt-auth.guard.ts
│   │   │   ├── roles.guard.ts    # Guard de roles ✨ NUEVO
│   │   │   ├── roles.guard.spec.ts # Tests (7/7) ✨ NUEVO
│   │   │   └── index.ts
│   │   ├── decorators/           # Decoradores ✨ NUEVO
│   │   │   ├── roles.decorator.ts
│   │   │   ├── current-user.decorator.ts
│   │   │   └── index.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.module.ts
│   │   └── jwt.strategy.ts       # Estrategia JWT
│   │
│   ├── clientes/                 # Módulo de clientes
│   │   ├── dto/
│   │   │   ├── create-cliente.dto.ts
│   │   │   ├── update-cliente.dto.ts
│   │   │   ├── query-cliente.dto.ts
│   │   │   └── cliente-response.dto.ts
│   │   ├── clientes.controller.ts
│   │   ├── clientes.service.ts
│   │   └── clientes.module.ts
│   │
│   ├── negocios/                 # Módulo de negocios
│   │   ├── dto/
│   │   │   ├── create-negocio.dto.ts
│   │   │   ├── update-negocio.dto.ts
│   │   │   ├── query-negocio.dto.ts
│   │   │   ├── cambiar-etapa.dto.ts
│   │   │   └── negocio-response.dto.ts
│   │   ├── negocios.controller.ts
│   │   ├── negocios.service.ts
│   │   └── negocios.module.ts
│   │
│   ├── actividades/              # Módulo de actividades
│   │   ├── dto/
│   │   │   ├── create-actividad.dto.ts
│   │   │   ├── update-actividad.dto.ts
│   │   │   ├── query-actividad.dto.ts
│   │   │   └── actividad-response.dto.ts
│   │   ├── actividades.controller.ts
│   │   ├── actividades.service.ts
│   │   └── actividades.module.ts
│   │
│   ├── stats/                    # Módulo de estadísticas
│   │   ├── dto/
│   │   │   └── stats-response.dto.ts
│   │   ├── stats.controller.ts
│   │   ├── stats.service.ts
│   │   └── stats.module.ts
│   │
│   ├── reportes/                 # Módulo de reportes
│   │   ├── dto/
│   │   │   ├── query-reporte.dto.ts
│   │   │   └── reporte-response.dto.ts
│   │   ├── reportes.controller.ts
│   │   ├── reportes.service.ts
│   │   └── reportes.module.ts
│   │
│   ├── notificaciones/           # Módulo de notificaciones
│   │   ├── dto/
│   │   │   ├── create-notificacion.dto.ts
│   │   │   ├── query-notificacion.dto.ts
│   │   │   └── notificacion-response.dto.ts
│   │   ├── notificaciones.controller.ts
│   │   ├── notificaciones.service.ts
│   │   ├── notificaciones.gateway.ts  # WebSocket Gateway
│   │   └── notificaciones.module.ts
│   │
│   ├── usuarios/                 # Módulo de usuarios ✨ NUEVO
│   │   ├── dto/
│   │   │   ├── usuario-response.dto.ts
│   │   │   └── update-rol.dto.ts
│   │   ├── usuarios.controller.ts
│   │   ├── usuarios.service.ts
│   │   └── usuarios.module.ts
│   │
│   ├── common/                   # Utilidades comunes ✨ NUEVO
│   │   └── interceptors/
│   │       └── audit.interceptor.ts  # Logs de auditoría
│   │
│   ├── prisma/                   # Módulo de Prisma
│   │   ├── prisma.service.ts
│   │   └── prisma.module.ts
│   │
│   ├── app.module.ts             # Módulo raíz (8 módulos)
│   └── main.ts                   # Entry point
│
├── prisma/
│   ├── schema.prisma             # Schema de base de datos
│   └── migrations/               # Migraciones de Prisma
│
├── test/                         # Tests E2E
│   └── app.e2e-spec.ts
│
├── nest-cli.json                 # Configuración NestJS
├── tsconfig.json                 # Configuración TypeScript
├── package.json                  # Dependencias backend
└── .env                          # Variables de entorno
```

### **Módulos Implementados (8)**

1. **AuthModule** - JWT authentication + guards + decoradores
2. **ClientesModule** - CRUD de clientes
3. **NegociosModule** - CRUD de negocios + cambio de etapa
4. **ActividadesModule** - CRUD de actividades + completar
5. **StatsModule** - Estadísticas del dashboard
6. **ReportesModule** - 3 tipos de reportes
7. **NotificacionesModule** - CRUD + WebSocket Gateway
8. **UsuariosModule** - Gestión de usuarios y roles ✨ NUEVO

### **Endpoints REST (36 totales)**

- **Auth**: 2 endpoints
- **Clientes**: 5 endpoints
- **Negocios**: 6 endpoints
- **Actividades**: 6 endpoints
- **Stats**: 2 endpoints
- **Reportes**: 3 endpoints
- **Notificaciones**: 6 endpoints (+1)
- **Usuarios**: 2 endpoints ✨ NUEVO
- **Stats**: 2 endpoints
- **Reportes**: 3 endpoints
- **Notificaciones**: 5 endpoints

### **WebSocket Events (5)**

- NUEVA_NOTIFICACION
- NEGOCIO_ACTUALIZADO
- ACTIVIDAD_VENCIDA
- NOTIFICACION_LEIDA
- CONTADOR_NO_LEIDAS

---

## 🐳 Infraestructura y Containerización

### **Arquitectura Containerizada**

El proyecto utiliza **Docker Compose** para orquestar 4 servicios containerizados que se comunican a través de una red interna privada (`clientpro-network`). Esta arquitectura permite:

- **Aislamiento**: Cada servicio corre en su propio contenedor
- **Reproducibilidad**: Entorno consistente en desarrollo y producción
- **Escalabilidad**: Fácil escalado horizontal de servicios
- **Portabilidad**: Deploy independiente de la plataforma host

### **Diagrama de Servicios**

```
┌─────────────────────────────────────────────────────────────┐
│                    clientpro-network (bridge)                │
│                                                               │
│  ┌──────────────┐      ┌──────────────┐      ┌────────────┐ │
│  │   Frontend   │─────▶│   Backend    │─────▶│ PostgreSQL │ │
│  │  (Next.js)   │      │  (NestJS)    │      │     16     │ │
│  │  Port: 3000  │      │  Port: 4000  │      │ Port: 5432 │ │
│  └──────────────┘      └──────┬───────┘      └────────────┘ │
│                               │                               │
│                               │                               │
│                               ▼                               │
│                        ┌──────────────┐                       │
│                        │    Redis     │                       │
│                        │      7       │                       │
│                        │  Port: 6379  │                       │
│                        └──────────────┘                       │
└─────────────────────────────────────────────────────────────┘
```

### **Comunicación entre Contenedores**

**Frontend → Backend**:
- Navegador (externo): `http://localhost:4000` (NEXT_PUBLIC_API_URL)
- Server-side (interno): `http://backend:4000` (API_URL)

**Backend → PostgreSQL**:
- URL de conexión: `postgresql://postgres:postgres@postgres:5432/clientpro_crm`
- Healthcheck requerido antes de iniciar backend

**Backend → Redis**:
- Host: `redis` (nombre de servicio Docker)
- Puerto: `6379` (puerto interno del contenedor)

### **Dependencias de Servicios**

```yaml
postgres (sin dependencias)
  ↓
redis (sin dependencias)
  ↓
backend (depends_on: postgres[healthy], redis[healthy])
  ↓
frontend (depends_on: backend[healthy])
```

### **Healthchecks**

Cada servicio implementa healthchecks para garantizar disponibilidad:

- **postgres**: `pg_isready -U postgres` (cada 10s, 5 retries)
- **redis**: `redis-cli ping` (cada 10s, 3 retries)
- **backend**: `curl -f http://localhost:4000` (cada 30s, 3 retries)
- **frontend**: Sin healthcheck (depende de backend healthy)

### **Volúmenes y Persistencia**

Los datos persisten fuera de los contenedores usando volúmenes Docker:

- **postgres_data**: Base de datos PostgreSQL (`/var/lib/postgresql/data`)
- **redis_data**: Cache Redis (`/data`)

**Ventaja**: Los datos sobreviven a reinicios de contenedores y reconstrucciones de imágenes.

### **Variables de Entorno**

Configuradas en `.env` (raíz del proyecto):

```bash
# PostgreSQL
POSTGRES_DB=clientpro_crm
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_PORT=5432

# Redis
REDIS_PORT=6379

# Backend
BACKEND_PORT=4000
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# Frontend
FRONTEND_PORT=3000
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-nextauth-key-change-in-production
```

### **Comandos de Gestión**

```bash
# Iniciar todos los servicios
docker-compose up -d

# Ver logs en tiempo real
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f backend

# Detener servicios (mantiene volúmenes)
docker-compose down

# Detener y eliminar volúmenes (⚠️ pierde datos)
docker-compose down -v

# Reconstruir imágenes
docker-compose build --no-cache

# Ver estado de servicios
docker-compose ps

# Ejecutar comando en contenedor
docker-compose exec backend npx prisma migrate deploy
docker-compose exec backend npx prisma studio

# Reiniciar un servicio
docker-compose restart backend
```

### **Dockerfile - Backend**

```dockerfile
# backend/Dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npx prisma generate
EXPOSE 4000
CMD ["npm", "run", "start:prod"]
```

### **Dockerfile - Frontend**

```dockerfile
# frontend/Dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## 🗄️ Base de Datos

### **Archivos**

```
database/
├── schema.sql               # Estructura completa (8 tablas)
├── seed.sql                 # Datos de ejemplo
├── crear_bd.sql             # Script de creación
└── README.md
```

### **Prisma**

```
backend/prisma/
├── schema.prisma            # 8 modelos, 5 enums
└── migrations/              # Historial de migraciones
    └── [timestamp]_[nombre]/
        └── migration.sql
```

---

## 📚 Documentación

### **Estructura**

```
docs/
├── context/                      # Contexto del proyecto
│   ├── README.md                 # Índice de contexto
│   ├── OVERVIEW.md               # Resumen ejecutivo
│   ├── STACK.md                  # Stack tecnológico
│   ├── DATABASE.md               # Esquema de base de datos
│   └── ARCHITECTURE.md           # Este archivo
│
├── decisions/                    # Architecture Decision Records
│   ├── README.md
│   ├── 001-nestjs-backend.md
│   ├── 002-nextjs-16-app-router.md
│   ├── 003-socket-io-realtime.md
│   ├── 004-prisma-orm.md
│   ├── 005-shadcn-ui.md
│   └── template.md
│
├── sessions/                     # Informes de sesiones
│   ├── README.md                 # Índice de sesiones
│   ├── 2026/
│   │   └── 01-ENERO/
│   │       ├── README.md
│   │       ├── SESION_06.md
│   │       ├── SESION_09.md
│   │       ├── SESION_13.md
│   │       ├── SESION_18.md
│   │       ├── SESION_19.md
│   │       └── SESION_23.md
│   └── template.md
│
├── roadmap/                      # Planificación
│   ├── README.md
│   ├── CURRENT.md                # Sprint actual
│   ├── BACKLOG.md                # Backlog priorizado
│   └── COMPLETED.md              # Features completadas
│
├── design/                       # Diseño UI/UX
│   ├── README.md
│   ├── wireframes.md
│   └── assets/
│       └── image.png
│
└── guides/                       # Guías específicas
    ├── README.md
    ├── GETTING_STARTED.md
    └── TROUBLESHOOTING.md
```

---

## 🛠️ Configuración OpenCode

### **Skills**

```
.opencode/
├── skills/
│   ├── error-debugging/
│   │   └── SKILL.md              # Workflow de debugging (2-3 intentos → pivote)
│   ├── session-report/
│   │   └── SKILL.md              # Automatizar informes de sesión
│   ├── backend-module/
│   │   └── SKILL.md              # Generar módulo NestJS completo
│   ├── frontend-component/
│   ├── api-endpoint/
│   ├── prisma-sync/
│   └── database-migration/
│
├── commands/                     # Comandos personalizados (futuro)
└── agents/                       # Agentes personalizados (futuro)
```

---

## 🔧 GitHub Copilot

### **Configuración**

```
.github/
└── copilot/
    ├── README.md                 # Explicación general
    ├── instructions.md           # Checklist de inicio de sesión
    └── rules.md                  # Reglas fijas de desarrollo
```

### **PR Templates y Git Workflow**

```
.github/
├── pull_request_template.md     # Template para PRs
└── workflows/                    # GitHub Actions ✨ NUEVO
    ├── test.yml                  # Testing automático (Node 18, 20, 22)
    ├── lint.yml                  # Linting y type checking
    ├── build.yml                 # Build de producción
    └── dependabot.yml            # Actualizaciones automáticas
```

**Git Flow**:

- `master` - Producción (protegida, requiere PR)
- `staging` - Pre-producción (protegida, requiere PR)
- `develop` - Desarrollo activo (protegida, requiere PR)

**Git Hooks** (Husky):

- `pre-commit` - Prettier + lint-staged
- `commit-msg` - Validación de Conventional Commits

---

## 📦 Scripts de Desarrollo

### **Raíz (package.json)**

```json
{
  "scripts": {
    "dev": "concurrently ...", // Backend + Frontend
    "dev:auto": "concurrently ...", // Con auto-restart agresivo
    "backend:dev": "npm run start:dev", // Solo backend
    "frontend:dev": "npm run dev", // Solo frontend
    "build": "npm run backend:build && npm run frontend:build",
    "lint:backend": "...",
    "lint:frontend": "..."
  }
}
```

---

## 🎨 Convenciones de Código

### **Nombres de Archivos**

**Backend (NestJS)**:

- Módulos: `clientes.module.ts`
- Controllers: `clientes.controller.ts`
- Services: `clientes.service.ts`
- DTOs: `create-cliente.dto.ts`
- Tests: `clientes.service.spec.ts`

**Frontend (Next.js)**:

- Páginas: `page.tsx` (dentro de carpeta)
- Componentes: `cliente-form.tsx` (kebab-case)
- Types: `cliente.ts`
- API clients: `clientes.ts`
- Tests: `cliente-form.test.tsx`

### **Estructura de Imports**

```typescript
// 1. React/Next.js core
import { useState } from 'react';

// 2. External libraries
import { useQuery } from '@tanstack/react-query';

// 3. UI Components
import { Button } from '@/components/ui/button';

// 4. Custom components
import ClienteForm from '@/components/cliente-form';

// 5. Types/Interfaces
import { Cliente } from '@/types/cliente';

// 6. API/Utils
import { getClientes } from '@/lib/api/clientes';
```

---

## 🔗 Referencias

- **Guía de desarrollo**: `../../AGENTS.md`
- **Stack tecnológico**: `STACK.md`
- **Base de datos**: `DATABASE.md`
- **Resumen ejecutivo**: `OVERVIEW.md`

---

**Última revisión**: 24 Febrero 2026  
**Versión**: 0.7.3

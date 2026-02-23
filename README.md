# 🚀 ClientPro CRM

Sistema de gestión de clientes (CRM) construido con tecnologías modernas.

## 📦 Stack Tecnológico

### Frontend
- **Next.js 16.1.1** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui** (Componentes)
- **NextAuth.js** (Autenticación)
- **Zod** (Validación)

### Backend
- **NestJS**
- **Prisma ORM**
- **PostgreSQL**
- **Socket.io** (Real-time)

### DevOps & MCPs
- **Docker** (Containerización)
- **Next.js MCP** (next-devtools-mcp) ✅ Configurado
- **PostgreSQL MCP** (Contexto para Copilot)
- **GitHub MCP** (Gestión de repos)
- **Semgrep MCP** (Análisis estático de código) ✅ Configurado
- **Testing MCP** (Playwright) ✅ Configurado

## 🏗️ Estructura del Proyecto

```
Desarrollo-Wep/
├── frontend/          # Aplicación Next.js
├── backend/           # API NestJS
├── database/          # Schemas SQL y seeds
├── docs/              # Documentación
└── docker/            # Configuración Docker
```

## 🚀 Quick Start

### 1. Instalar dependencias

```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install
```

### 2. Configurar base de datos

```bash
# Crear la base de datos
psql -U postgres
CREATE DATABASE clientpro_crm;
\q

# Ejecutar migrations
cd database
psql -U postgres -d clientpro_crm -f schema.sql
psql -U postgres -d clientpro_crm -f seed.sql
```

### 3. Variables de entorno

```bash
# Frontend
cp frontend/.env.example frontend/.env.local

# Backend
cp backend/.env.example backend/.env
```

### 4. Ejecutar en desarrollo

```bash
# Terminal 1 - Frontend
cd frontend
npm run dev

# Terminal 2 - Backend
cd backend
npm run start:dev
```

La app estará en:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:4000

## 📝 Scripts Disponibles

### Frontend
- `npm run dev` - Modo desarrollo
- `npm run build` - Build producción
- `npm run start` - Servidor producción
- `npm run lint` - Linter

### Backend
- `npm run start:dev` - Modo desarrollo
- `npm run build` - Build producción
- `npm run start:prod` - Servidor producción
- `npm run test` - Tests
- `npm run scan` - Análisis estático con Semgrep
- `npm run scan:detailed` - Análisis detallado con verbose
- `npm run scan:json` - Exportar resultados a JSON

## � MCPs Configurados

### ✅ Next.js MCP (Activo)
**Archivo**: `.mcp.json` en la raíz del proyecto

**Capacidades**:
- Detección de errores en tiempo real
- Estado del dev server
- Inspección de rutas y Server Actions
- Logs de desarrollo

**Uso**:
```bash
cd frontend
npm run dev
```
Luego pregunta en Copilot: "¿Qué errores tiene mi app?"

### ✅ Semgrep MCP (Activo)
**Archivo**: `.mcp.json` + `.semgrep/backend-rules.yaml`

**Capacidades**:
- Análisis estático de código backend
- 9 reglas personalizadas (calidad, consistencia, seguridad)
- Detección de console.log, magic numbers, secrets hardcodeados
- Validación de patrones NestJS (decoradores @ApiTags, return types)

**Uso**:
```bash
npm run scan              # Análisis rápido
npm run scan:detailed     # Con información verbose
npm run scan:json         # Exportar resultados
```

Ver [docs/workflows/STATIC_ANALYSIS.md](docs/workflows/STATIC_ANALYSIS.md) para guía completa.

### ⏳ PostgreSQL MCP (Pendiente)
Ver [GUIA_MCPS.md](docs/GUIA_MCPS.md) para instrucciones de instalación.

---

## �🗄️ Base de Datos

### Conectar con MCP de PostgreSQL

1. Instala la extensión de PostgreSQL MCP en VS Code
2. Configura la conexión:
   - Host: `localhost`
   - Port: `5432`
   - Database: `clientpro_crm`
   - User: `postgres`

### Tablas principales
- `teams` - Equipos de trabajo
- `users` - Usuarios del sistema
- `clients` - Clientes/Contactos
- `deals` - Oportunidades de venta
- `activities` - Tareas y actividades
- `emails` - Historial de emails
- `notes` - Notas internas
- `notifications` - Notificaciones

Ver más en [database/README.md](./database/README.md)

## 📚 Documentación

**📖 Documentos principales** (empezar por aquí):
- **[🎯 Contexto del Proyecto](./docs/CONTEXTO_PROYECTO.md)** - ⭐ **Lee esto primero en cada chat**
- **[🔌 Guía de MCPs](./docs/GUIA_MCPS.md)** - Cómo conectar PostgreSQL, GitHub MCPs
- **[📋 Setup Completado](./docs/SETUP_COMPLETADO.md)** - Resumen de lo instalado
- **[🚀 Próximos Pasos](./docs/PROXIMOS_PASOS.md)** - Plan de desarrollo
- **[🎨 Wireframes](./docs/wireframe.md)** - Todas las pantallas diseñadas

**📁 Documentación técnica**:
- [Base de Datos](./database/README.md)
- [API Backend](./backend/BACKEND_README.md)
- [Frontend](./frontend/README.md)

## 🎨 Paleta de Colores

```css
--primary: #4F7396     /* Azul suave profesional */
--success: #5A9F7E     /* Verde jade */
--warning: #D4A373     /* Amarillo mostaza suave */
--danger: #C77272      /* Rojo coral suave */
```

## 🔐 Credenciales de Desarrollo

Usuario de prueba (seed data):
- Email: `admin@clientpro.com`
- Password: `password123`

## 🛠️ Troubleshooting

### Puerto en uso
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Problemas con Prisma
```bash
cd backend
npx prisma generate
npx prisma db push
```

### Reset de base de datos
```bash
psql -U postgres -d clientpro_crm -f database/seed.sql
```

## � Documentación

Ver la carpeta `docs/` para documentación completa:

- **[CONTEXTO_PROYECTO.md](docs/CONTEXTO_PROYECTO.md)** - 🎯 **Lee esto primero** - Stack, tablas, MCPs, pendientes
- **[PROXIMOS_PASOS.md](docs/PROXIMOS_PASOS.md)** - 🚀 Roadmap y checklist de desarrollo
- **[wireframe.md](docs/wireframe.md)** - 🎨 Diseños UI de todas las pantallas

## �📄 Licencia

MIT

## 👥 Autor

Desarrollado con ❤️ usando GitHub Copilot y MCPs

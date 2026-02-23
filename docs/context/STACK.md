# 🏗️ Stack Tecnológico - ClientPro CRM

> **Tecnologías, frameworks y bibliotecas utilizadas en el proyecto**

**Última actualización**: 4 Febrero 2026

---

## 📱 Frontend

### **Framework Base**
- **Next.js 16.1.1** - Framework React con App Router
- **TypeScript 5.7.3** - Tipado estático
- **React 19.0.0** - Biblioteca UI

### **Estilos y UI**
- **Tailwind CSS v4** - Utility-first CSS framework
- **shadcn/ui** - Componentes UI accesibles (16 componentes instalados)
  - Button, Input, Card, Table, Dialog, Badge
  - Select, Textarea, Label, Avatar, Tabs
  - Dropdown Menu, Toast, Tooltip, Alert, Checkbox
- **Lucide React** - Iconos SVG

### **Gestión de Estado**
- **TanStack Query v5** (React Query) - Cache y sincronización de datos del servidor
- **React Context API** - Estado global de notificaciones
- **React Hook Form** - Gestión de formularios
- **Zod** - Validación de esquemas

### **Autenticación**
- **NextAuth.js v5** (beta) - Autenticación con JWT
  - CredentialsProvider
  - JWT + Session callbacks
  - Protección de rutas

### **Drag & Drop**
- **@dnd-kit** - Biblioteca para Kanban board
  - Drag sensors
  - Sortable context
  - Overlay visual

### **Visualización de Datos**
- **Recharts** - Gráficas interactivas
  - BarChart, LineChart, PieChart
  - AreaChart, ComposedChart
  - Tooltips, Legends

### **Exportación**
- **jsPDF** - Generación de PDFs
- **html2canvas** - Captura de elementos HTML a imagen

### **Fechas**
- **date-fns** - Manipulación de fechas
- **react-day-picker** - Date picker con rangos

### **HTTP Client**
- **Axios** - Cliente HTTP con interceptores

### **WebSocket**
- **socket.io-client 4.8.1** - Cliente WebSocket
  - Auth con JWT en handshake
  - Reconexión automática
  - Event listeners

### **Notificaciones**
- **sonner** - Toast notifications

### **Testing**
- **Jest 30** - Framework de testing
- **React Testing Library** - Testing de componentes
- **@testing-library/jest-dom** - Matchers personalizados

---

## 🖥️ Backend

### **Framework Base**
- **NestJS 11.0.6** - Framework Node.js progresivo
- **TypeScript 5.7.3** - Tipado estático

### **Base de Datos**
- **PostgreSQL** - Base de datos relacional
- **Prisma 7.2.0** - ORM con type-safety
  - Prisma Client
  - Prisma Migrate
  - Prisma Studio
  - @prisma/adapter-pg

### **Autenticación y Seguridad**
- **Passport.js** - Middleware de autenticación
- **passport-jwt** - Estrategia JWT
- **@nestjs/jwt** - Módulo JWT de NestJS
- **bcrypt** - Hash de contraseñas (10 rounds)

### **Validación**
- **class-validator** - Validación de DTOs
- **class-transformer** - Transformación de datos
- Mensajes de error en español

### **Real-Time**
- **Socket.io 4.8.0** - WebSocket bidireccional
- **@nestjs/websockets** - Módulo WebSocket de NestJS
- **@nestjs/platform-socket.io** - Adaptador Socket.io
  - JWT authentication en handshake
  - Rooms por usuario
  - Event emitters

### **Utilidades**
- **Axios** - HTTP client
- **CORS** - Configurado para desarrollo

---

## 🗄️ Base de Datos

### **PostgreSQL**
- **Versión**: Latest (containerizado)
- **Base de datos**: `clientpro_crm`
- **Puerto**: 5432
- **Usuario**: postgres

### **Prisma**
- **8 Modelos**:
  - Equipo
  - Usuario
  - Cliente
  - Negocio
  - Actividad
  - Email
  - Nota
  - Notificacion

- **5 Enums**:
  - RolUsuario (ADMIN, VENDEDOR, MANAGER)
  - EtapaNegocio (6 etapas del pipeline)
  - TipoActividad (LLAMADA, REUNION, EMAIL, TAREA, NOTA)
  - TipoNotificacion (8 tipos)
  - TipoMoneda (USD, EUR, COP, MXN)

---

## 🔧 DevOps y Herramientas

### **Gestión de Mono-repo**
- **Concurrently 9.2.1** - Ejecutar backend + frontend simultáneamente
  - Scripts unificados en package.json raíz
  - Auto-restart (5 intentos)
  - Prefijos de color: [BACKEND] cyan, [FRONTEND] magenta

### **Linting y Formato**
- **ESLint** - Linter para JavaScript/TypeScript
- **Prettier** - Formateador de código
  - Backend: single quotes, trailing commas
  - Frontend: Next.js defaults

### **Análisis Estático**
- **Semgrep 1.150.0** - Análisis estático de código
  - 9 reglas personalizadas para backend
  - Detección de code smells, secrets, SQL injection
  - Integración MCP con VS Code
  - Scripts: `npm run scan`, `scan:detailed`, `scan:json`
  - Ver detalles en `decisions/006-semgrep-static-analysis.md`

### **Testing**
- **Jest** - Framework de testing (backend + frontend)
- **Supertest** - Testing de APIs HTTP (backend)
- **React Testing Library** - Testing de componentes (frontend)

### **MCPs (Model Context Protocol)**
- **pgsql** - PostgreSQL MCP
  - Queries, migraciones, inspección de DB
- **chrome-devtools** - Browser testing
  - Screenshots, inspección, performance
- **next-devtools** - Next.js monitoring
  - Routes, performance, optimización
- **context7** - Documentación
  - Búsqueda en docs oficiales
- **semgrep** - Análisis estático
  - Escaneo de código, validación de reglas
- **testing** - Browser automation
  - Playwright para testing E2E

---

## 📦 Versiones de Dependencias Clave

### **Frontend** (`frontend/package.json`)
```json
{
  "next": "16.1.1",
  "react": "19.0.0",
  "typescript": "5.7.3",
  "@tanstack/react-query": "^5.x",
  "next-auth": "^5.0.0-beta",
  "@dnd-kit/core": "^6.x",
  "recharts": "^2.x",
  "socket.io-client": "^4.8.1",
  "axios": "^1.x",
  "tailwindcss": "^4.x",
  "jest": "^30.x"
}
```

### **Backend** (`backend/package.json`)
```json
{
  "@nestjs/core": "^11.0.6",
  "@nestjs/common": "^11.0.6",
  "@nestjs/websockets": "^11.0.6",
  "@nestjs/platform-socket.io": "^11.0.6",
  "typescript": "5.7.3",
  "prisma": "^7.2.0",
  "@prisma/client": "^7.2.0",
  "socket.io": "^4.8.0",
  "passport-jwt": "^4.x",
  "bcrypt": "^5.x",
  "class-validator": "^0.14.x"
}
```

---

## 📡 APIs y Endpoints

### **REST API** (36 endpoints)
- **Auth**: 2 endpoints (login, register)
- **Clientes**: 5 endpoints (CRUD + list)
- **Negocios**: 6 endpoints (CRUD + list + cambiar etapa)
- **Actividades**: 6 endpoints (CRUD + list + completar)
- **Stats**: 2 endpoints (general, distribución)
- **Reportes**: 3 endpoints (conversión, comparativas, rendimiento)
- **Notificaciones**: 6 endpoints (CRUD + marcar leída + marcar todas)
- **Usuarios**: 2 endpoints (list, cambiar rol) ✨ NUEVO

### **WebSocket** (5 eventos)
- NUEVA_NOTIFICACION (emit)
- NEGOCIO_ACTUALIZADO (emit)
- ACTIVIDAD_VENCIDA (emit)
- NOTIFICACION_LEIDA (listener)
- CONTADOR_NO_LEIDAS (emit)

---

## 🎨 Diseño y UX

### **Sistema de Diseño**
- **Paleta de colores**:
  - Dominante: #292524 (stone-900)
  - Primario: #EA580C (orange-600)
  - Acento: #84CC16 (lime-500)
  - Fondo: #FAFAF9 (stone-50)
- **Tipografía**: Inter (variable font)
- **Espaciado**: Tailwind CSS spacing scale
- **Sombras**: Tailwind CSS shadow utilities

### **Componentes UI**
- DataTables con paginación
- Kanban boards con drag & drop
- Gráficas interactivas
- Modales y diálogos
- Toast notifications
- Badges y avatares
- Cards con gradientes

---

## 🔐 Seguridad

### **Autenticación**
- JWT tokens (firma HMAC SHA-256)
- Refresh tokens (pendiente)
- Session management con NextAuth

### **Autorización**
- **RolesGuard** para endpoints ✨ NUEVO
- **Decoradores**: @Roles, @CurrentUser ✨ NUEVO
- Roles: ADMIN, MANAGER, VENDEDOR
- **Permisos granulares por módulo** ✨ NUEVO
- **AuditInterceptor** para logs ✨ NUEVO
- Validación de ownership (usuario solo ve sus datos)

### **Validación**
- class-validator en todos los DTOs
- Zod schemas en frontend
- Sanitización de inputs
- CORS configurado

### **Base de Datos**
- Prisma ORM (SQL injection protection)
- Passwords hasheados con bcrypt
- Timestamps automáticos (createdAt, updatedAt)

---

## 📊 Métricas del Proyecto

- **Líneas de código**: ~15,000 (estimado)
- **Archivos TypeScript**: ~80
- **Componentes React**: ~30
- **Módulos NestJS**: 7
- **Endpoints REST**: 34
- **WebSocket events**: 5
- **Modelos Prisma**: 8
- **Enums**: 5
- **shadcn/ui componentes**: 16

---

## 🚀 Comandos de Desarrollo

### **Desarrollo**
```bash
npm run dev                  # Backend + Frontend (concurrently)
npm run backend:dev          # Solo backend (puerto 4000)
npm run frontend:dev         # Solo frontend (puerto 3000)
```

### **Testing**
```bash
cd frontend && npm test      # Frontend tests
cd backend && npm test       # Backend tests
```

### **Linting**
```bash
npm run lint:backend         # ESLint backend
npm run lint:frontend        # ESLint frontend
cd backend && npm run format # Prettier backend
```

### **Prisma**
```bash
cd backend
npx prisma generate          # Generar Prisma Client
npx prisma migrate dev       # Crear migración
npx prisma studio            # Abrir Prisma Studio
```

---

## 🔗 Referencias

- **Next.js**: https://nextjs.org/docs
- **NestJS**: https://docs.nestjs.com
- **Prisma**: https://www.prisma.io/docs
- **TanStack Query**: https://tanstack.com/query
- **Socket.io**: https://socket.io/docs
- **shadcn/ui**: https://ui.shadcn.com

---

**Última revisión**: 30 Enero 2026  
**Versión del proyecto**: 0.4.0

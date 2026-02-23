# 📚 Documentación - ClientPro CRM

> **Sistema CRM Completo** estilo HubSpot/Salesforce  
> **Stack**: NestJS 11 + Next.js 16 + Prisma 7 + PostgreSQL + Socket.io  
> **Estado**: MVP v0.5.0 (95% completo) - 4.5 fases completadas  
> **Última actualización**: 4 Febrero 2026

---

## 🚀 Inicio Rápido

### Para Desarrolladores Nuevos
**Lee en este orden**:
1. **`context/OVERVIEW.md`** (5 min) - Visión general del proyecto
2. **`context/STACK.md`** (10 min) - Stack tecnológico y endpoints
3. **`AGENTS.md`** (raíz, 15 min) - Comandos, patrones y guía completa

### Para Agentic Coding (IA)
**Obligatorio leer**:
- **`/AGENTS.md`** (raíz del proyecto) - Guía especializada para agentes IA
- **`.github/copilot/instructions.md`** - Checklist de sesión
- **`.github/copilot/rules.md`** - Reglas fijas de desarrollo

### Para Deployment/DevOps
**Enfócate en**:
- **`roadmap/BACKLOG.md`** - Fase 6 (Despliegue) planificada
- **`context/ARCHITECTURE.md`** - Arquitectura y estructura
- **`roadmap/CURRENT.md`** - Tareas urgentes

---

## 📂 Estructura de Documentación

```
docs/
├── README.md              # ← ESTÁS AQUÍ (índice maestro)
│
├── context/               # 📖 CONTEXTO DEL PROYECTO
│   ├── README.md          # Índice de contexto
│   ├── OVERVIEW.md        # Visión general (~150 líneas)
│   ├── STACK.md           # Stack tecnológico completo (~300 líneas)
│   ├── DATABASE.md        # Schema Prisma y datos de prueba (~250 líneas)
│   └── ARCHITECTURE.md    # Estructura y convenciones (~400 líneas)
│
├── decisions/             # 💡 DECISIONES ARQUITECTÓNICAS (ADRs)
│   ├── README.md          # Índice de decisiones
│   ├── template.md        # Plantilla para nuevos ADRs
│   ├── 001-nestjs-backend.md       # Por qué NestJS
│   ├── 002-nextjs-16-app-router.md # Por qué Next.js 16
│   ├── 003-socket-io-realtime.md   # Por qué Socket.io
│   ├── 004-prisma-orm.md           # Por qué Prisma
│   ├── 005-shadcn-ui.md            # Por qué shadcn/ui
│   └── 006-semgrep-static-analysis.md # Por qué Semgrep
│
├── sessions/              # 📝 LOGS DE SESIONES
│   ├── README.md          # Índice principal de sesiones
│   ├── template.md        # Plantilla para nuevas sesiones
│   └── 2026/
│       ├── README.md      # Índice del año
│       ├── 01-ENERO/
│       │   ├── README.md  # Índice del mes (6 sesiones)
│       │   ├── SESION_6_ENERO_2026.md
│       │   ├── SESION_9_ENERO_2026.md
│       │   ├── SESION_13_ENERO_2026.md
│       │   ├── SESION_18_ENERO_2026.md
│       │   ├── SESION_19_ENERO_2026.md
│       │   └── SESION_23_ENERO_2026.md
│       └── 02-FEBRERO/
│           ├── README.md  # Índice del mes (1 sesión)
│           └── SESION_4_FEBRERO_2026.md
│
├── roadmap/               # 🗺️ ROADMAP Y PLANIFICACIÓN
│   ├── README.md          # Índice del roadmap + roadmap visual
│   ├── COMPLETED.md       # Fases 1-4.5 completadas (~600 líneas)
│   ├── CURRENT.md         # Fase 5 (Testing) + tareas urgentes (~250 líneas)
│   └── BACKLOG.md         # Fase 6 (Producción) + post-MVP (~400 líneas)
│
├── design/                # 🎨 DISEÑO Y UI/UX
│   ├── README.md          # Índice de diseño
│   ├── wireframes.md      # Wireframes de todas las páginas
│   └── assets/            # Imágenes, logos, screenshots
│       └── image.png
│
└── guides/                # 📚 GUÍAS RÁPIDAS (vacío por ahora)
    └── README.md
```

---

## 🎯 Navegación por Rol

### 👨‍💻 Desarrollador Backend
**Lee primero**:
1. `context/STACK.md` → Sección "Backend (NestJS)"
2. `context/DATABASE.md` → Schema Prisma completo
3. `context/ARCHITECTURE.md` → Sección "Backend"
4. `decisions/001-nestjs-backend.md` → Contexto de elección
5. `AGENTS.md` (raíz) → Comandos y patrones

**Comandos clave**:
```bash
cd backend
npm run dev              # Desarrollo (port 4000)
npm test                 # Tests unitarios
npm run test:e2e         # Tests E2E
npm run format           # Prettier
npm run scan             # Análisis estático (Semgrep)
```

**Módulos completados** (8):
- `auth/` - JWT + Login
- `clientes/` - CRUD completo
- `negocios/` - CRUD + Kanban drag & drop
- `actividades/` - CRUD completo
- `reportes/` - Generación de reportes
- `stats/` - Estadísticas dashboard
- `notificaciones/` - CRUD + WebSocket Gateway
- `prisma/` - Servicio centralizado

---

### 🎨 Desarrollador Frontend
**Lee primero**:
1. `context/STACK.md` → Sección "Frontend (Next.js)"
2. `design/README.md` → Paleta, tipografía, componentes
3. `design/wireframes.md` → Diseños de páginas
4. `context/ARCHITECTURE.md` → Sección "Frontend"
5. `decisions/002-nextjs-16-app-router.md` → Contexto de elección

**Comandos clave**:
```bash
cd frontend
npm run dev              # Desarrollo (port 3000)
npm test                 # Tests (Jest + RTL)
npm test -- --watch      # Watch mode
npm run build            # Build producción
```

**Páginas completadas** (6):
- `/login` - Autenticación NextAuth
- `/dashboard` - 4 widgets + gráficos
- `/clientes` - Tabla + CRUD
- `/negocios` - Kanban drag & drop
- `/actividades` - Calendario + lista
- `/reportes` - Filtros + visualización

**Componentes UI** (shadcn/ui, 16 instalados):
- Button, Input, Label, Card, Dialog, Form, Select, Textarea
- Table, Toast, Badge, Dropdown, Separator, Avatar, Tabs, Popover

---

### 🤖 Agente IA (Agentic Coding)
**OBLIGATORIO leer al inicio de CADA sesión**:
1. **`/AGENTS.md`** (raíz) - Guía completa para agentes IA
2. **`.github/copilot/instructions.md`** - Checklist de inicio
3. **`.github/copilot/rules.md`** - Reglas fijas (677 líneas)

**Workflow crítico**:
1. **NUNCA ejecutar código sin verificar** → Usar `get_errors` tool PRIMERO
2. **Si error persiste tras 2-3 intentos** → PIVOTAR estrategia (no repetir)
3. **Documentar al final de sesión** → Actualizar `docs/sessions/2026/`

**Skills disponibles** (`.opencode/skills/`):
- `error-debugging/` - Debugging sistemático
- `session-report/` - Generación de reportes
- `backend-module/` - Generador de módulos NestJS

**MCPs disponibles** (`.mcp.json`):
- `pgsql` - Consultas PostgreSQL (REQUERIDO para DB)
- `chrome-devtools` - Testing browser (REQUERIDO para frontend)
- `next-devtools` - Monitoreo Next.js
- `context7` - Documentación externa
- `semgrep` - Análisis estático de código backend
- `testing` - Browser automation (Playwright)

**Ver AGENTS.md para**: Build commands, code style, import order, error handling, pre-commit checklist

---

### 🧪 QA / Testing
**Lee primero**:
1. `context/STACK.md` → Sección "Testing"
2. `roadmap/CURRENT.md` → Fase 5 (Testing - próxima)
3. `AGENTS.md` (raíz) → Comandos de testing

**Estado actual**:
- ✅ Jest 30 + React Testing Library configurados
- ✅ Estructura de tests definida
- ⚠️ Tests pendientes de implementación (Fase 5)

**Comandos**:
```bash
# Backend
cd backend && npm test           # Run tests
cd backend && npm run test:cov   # Coverage
cd backend && npm run test:e2e   # E2E

# Frontend
cd frontend && npm test          # Run tests
cd frontend && npm test -- --coverage
```

---

### 🚀 DevOps / SRE
**Lee primero**:
1. `roadmap/BACKLOG.md` → Fase 6 (Deployment) planificada
2. `context/ARCHITECTURE.md` → Infraestructura
3. `roadmap/CURRENT.md` → Prioridades actuales

**Tareas pendientes** (Fase 6):
- [ ] Configurar Docker Compose (backend + frontend + postgres)
- [ ] Setup CI/CD (GitHub Actions)
- [ ] Deploy a Vercel (frontend) + Railway (backend + DB)
- [ ] Monitoreo y logging (Sentry, LogRocket)
- [ ] Backups automatizados de DB

**Puertos**:
- Backend: `4000`
- Frontend: `3000`
- PostgreSQL: `5432`
- WebSocket: `4000` (mismo puerto que backend)

---

## 🔍 Búsqueda Rápida

### Por Tema

#### Autenticación
- Backend: `context/ARCHITECTURE.md` → "auth/"
- Frontend: `context/ARCHITECTURE.md` → "app/api/auth/"
- Decisión: `decisions/001-nestjs-backend.md` → "JWT"

#### Base de Datos
- Schema completo: `context/DATABASE.md`
- Modelos (8): Equipo, Usuario, Cliente, Negocio, Actividad, Email, Nota, Notificacion
- Enums (5): RolUsuario, EtapaNegocio, TipoActividad, TipoNotificacion, TipoMoneda
- Decisión ORM: `decisions/004-prisma-orm.md`

#### WebSocket / Tiempo Real
- Arquitectura: `context/STACK.md` → "WebSocket (Socket.io)"
- 5 eventos: `connect`, `disconnect`, `nuevaNotificacion`, `negocioActualizado`, `actividadCreada`
- Decisión: `decisions/003-socket-io-realtime.md`

#### UI Components
- Guía de diseño: `design/README.md`
- Wireframes: `design/wireframes.md`
- Decisión: `decisions/005-shadcn-ui.md`

#### Testing
- Configuración Jest: `backend/jest.config.js`, `frontend/jest.config.js`
- Backend: 96 tests, 96.25% coverage (ver `AGENTS.md`)
- Frontend: 144 tests, 93.75% coverage (ver `AGENTS.md`)
- Estado: Fase 5 (próxima)

#### Deployment
- Planificación: `roadmap/BACKLOG.md` → Fase 6
- Estado: Pendiente

---

## 📊 Estado del Proyecto

### Versión Actual: **v0.4.0** (MVP 90% completo)

### Fases Completadas ✅
1. **Fase 1** - Setup Inicial (6 enero 2026)
2. **Fase 2** - CRUD Backend/Frontend (9-13 enero 2026)
3. **Fase 3** - Dashboard + Kanban (18-19 enero 2026)
4. **Fase 4** - Notificaciones Tiempo Real (23 enero 2026)

### Fase Actual 🚧
- **Fase 5** - Testing Completo (próxima)
  - Tests unitarios backend (servicios + controllers)
  - Tests E2E backend
  - Tests unitarios frontend (componentes + pages)
  - Tests E2E frontend (Playwright/Cypress)
  - Coverage mínimo: 70%

### Próximas Fases 📅
- **Fase 6** - Deployment a Producción
- **Post-MVP** - Features adicionales (ver `roadmap/BACKLOG.md`)

**Detalle completo**: Ver `roadmap/README.md`

---

## 🛠️ Comandos Más Usados

### Desarrollo
```bash
# Root (recomendado)
npm run dev              # Backend + Frontend concurrente
npm run dev:auto         # Modo agresivo (10 reintentos)

# Individual
npm run backend:dev      # Solo backend (port 4000)
npm run frontend:dev     # Solo frontend (port 3000)
```

### Build
```bash
npm run build            # Build ambos
npm run backend:build    # Solo backend
npm run frontend:build   # Solo frontend
```

### Linting
```bash
npm run lint:backend     # ESLint backend
npm run lint:frontend    # ESLint frontend
cd backend && npm run format  # Prettier backend
```

### Static Analysis
```bash
npm run scan             # Semgrep - análisis rápido
npm run scan:detailed    # Semgrep - verbose
npm run scan:json        # Exportar resultados JSON
```

### Testing
```bash
# Backend
cd backend && npm test
cd backend && npm run test:watch
cd backend && npm run test:cov

# Frontend
cd frontend && npm test
cd frontend && npm test -- --watch
cd frontend && npm test -- --coverage
```

### Database (Prisma)
```bash
cd backend
npx prisma migrate dev   # Crear migración
npx prisma studio        # GUI web (port 5555)
npx prisma db seed       # Seed data (7 usuarios de prueba)
```

---

## 📚 Recursos Externos

### Documentación Oficial
- [NestJS Docs](https://docs.nestjs.com/)
- [Next.js 16 Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Socket.io Docs](https://socket.io/docs/v4/)
- [shadcn/ui Docs](https://ui.shadcn.com/)
- [TanStack Query v5 Docs](https://tanstack.com/query/latest)

### Herramientas
- [Tailwind CSS v4 Docs](https://tailwindcss.com/docs)
- [React Hook Form](https://react-hook-form.com/)
- [Zod Validation](https://zod.dev/)
- [Jest Docs](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)

---

## 🤝 Contribuir

### Antes de Empezar
1. Lee **`AGENTS.md`** (raíz) - Comandos, code style, patrones
2. Lee **`.github/copilot/rules.md`** - Reglas fijas de desarrollo
3. Crea rama desde `main`: `feature/<nombre>` o `fix/<nombre>`

### Checklist Pre-Commit
Ver lista completa en **`AGENTS.md`** sección "Pre-Commit Checklist"

Puntos críticos:
- [ ] `get_errors` muestra 0 errores (TypeScript)
- [ ] `npm run dev` corre sin errores críticos
- [ ] Imports ordenados correctamente (ver orden en `AGENTS.md`)
- [ ] Sin datos sensibles en código

### Agregar Nueva Decisión Arquitectónica
1. Copia `docs/decisions/template.md`
2. Renombra: `00X-titulo-descriptivo.md`
3. Llena todas las secciones
4. Actualiza `docs/decisions/README.md`

### Documentar Sesión
1. Copia `docs/sessions/template.md`
2. Renombra: `SESION_DD_MES_YYYY.md`
3. Mueve a: `docs/sessions/YYYY/MM-MES/`
4. Actualiza README del mes

---

## 🔗 Enlaces Rápidos

| Documento | Descripción | Líneas |
|-----------|-------------|--------|
| **`AGENTS.md`** (raíz) | Guía para agentes IA | ~450 |
| **`CHANGELOG.md`** (raíz) | Historial de versiones | ~300 |
| **`context/OVERVIEW.md`** | Resumen ejecutivo | ~150 |
| **`context/STACK.md`** | Stack + 34 endpoints | ~300 |
| **`context/DATABASE.md`** | Schema + seed data | ~250 |
| **`context/ARCHITECTURE.md`** | Estructura completa | ~400 |
| **`decisions/README.md`** | Índice de ADRs | ~200 |
| **`roadmap/README.md`** | Roadmap visual | ~300 |
| **`design/README.md`** | Guía de diseño | ~250 |

---

## 📞 Soporte

### Problemas Comunes

#### "Port 3000/4000 already in use"
```bash
# Windows
netstat -ano | Select-String ":3000|:4000"
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :3000
kill -9 <PID>
```

#### "Prisma Client not generated"
```bash
cd backend
npx prisma generate
```

#### "WebSocket connection failed"
- Verificar backend corriendo en port 4000
- Revisar `frontend/src/lib/socket.ts` (token JWT requerido)
- Ver logs en consola del navegador

#### "Type errors en frontend"
- Sincronizar enums: `backend/prisma/schema.prisma` → `frontend/src/types/`
- Verificar imports de DTOs

### Para Agentes IA
- Consultar **`AGENTS.md`** (raíz) - Tiene toda la info de debugging
- Consultar **`.github/copilot/rules.md`** - Reglas de error handling
- Seguir regla: **2-3 intentos → pivotar**

---

## 📝 Changelog Rápido

| Versión | Fecha | Descripción |
|---------|-------|-------------|
| **v0.4.1** | 3 Feb 2026 | Semgrep MCP - Análisis Estático de Código |
| **v0.4.0** | 23 Ene 2026 | Fase 4: Notificaciones Tiempo Real (WebSocket) |
| **v0.3.0** | 19 Ene 2026 | Fase 3: Dashboard + Kanban Drag & Drop |
| **v0.2.0** | 13 Ene 2026 | Fase 2: CRUD Backend + Frontend (3 módulos) |
| **v0.1.0** | 6 Ene 2026 | Fase 1: Setup Inicial (NestJS + Next.js + Prisma) |

**Detalle completo**: Ver `CHANGELOG.md` en raíz

---

## 🎯 Próximos Pasos Inmediatos

### Tareas Urgentes (Fase 5)
1. **Testing Backend**
   - Tests unitarios de servicios
   - Tests unitarios de controllers
   - Tests E2E de endpoints

2. **Testing Frontend**
   - Tests unitarios de componentes UI
   - Tests unitarios de páginas
   - Tests E2E con Playwright

**Detalle completo**: Ver `roadmap/CURRENT.md`

---

## 📄 Licencia

Proyecto interno - No especificada aún

---

**Última actualización**: 5 Febrero 2026  
**Mantenedores**: Equipo de desarrollo ClientPro  
**Versión de documentación**: 2.1.0 (eliminación de workflows/)

---

## 🗺️ Mapa Mental de Documentación

```
ClientPro CRM Docs
│
├─ INICIO RÁPIDO
│  ├─ context/OVERVIEW.md (5 min)
│  ├─ context/STACK.md (10 min)
│  └─ AGENTS.md (raíz, 15 min)
│
├─ DESARROLLO
│  ├─ AGENTS.md (raíz, para IA y humanos)
│  ├─ .github/copilot/rules.md (reglas fijas)
│  └─ design/wireframes.md (UI)
│
├─ ARQUITECTURA
│  ├─ context/ARCHITECTURE.md (estructura)
│  ├─ context/DATABASE.md (Prisma schema)
│  └─ decisions/*.md (7 ADRs)
│
├─ PLANIFICACIÓN
│  ├─ roadmap/COMPLETED.md (Fases 1-4)
│  ├─ roadmap/CURRENT.md (Fase 5)
│  └─ roadmap/BACKLOG.md (Fase 6+)
│
└─ HISTORIAL
   ├─ CHANGELOG.md (raíz, versiones)
   └─ sessions/2026/01-ENERO/*.md (6 sesiones)
```

---

**¡Bienvenido a ClientPro CRM!** 🚀

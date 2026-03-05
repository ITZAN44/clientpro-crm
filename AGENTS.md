# AGENTS.md - ClientPro CRM Development Guide

> **Purpose**: This guide is for agentic coding assistants operating in this repository.
> **Last Updated**: February 27, 2026

---

## 📦 Project Overview

**ClientPro CRM** - Full-stack Customer Relationship Management System

- **Backend**: NestJS 11 + Prisma 7 + PostgreSQL + Redis Cache
- **Frontend**: Next.js 16 (App Router) + TypeScript + Tailwind v4
- **Real-time**: Socket.io 4.8 with JWT authentication
- **Caching**: Redis 7.4 (via ioredis) with custom RedisCacheService
- **State Management**: TanStack Query v5
- **Testing**: Jest 30 + React Testing Library
- **DevOps**: Docker Compose (PostgreSQL + Redis containers)
- **Version Control**: Git Flow with Husky hooks

---

## 🚀 Build, Lint, and Test Commands

### Development

```bash
# Start infrastructure (PostgreSQL + Redis)
docker-compose up -d        # Start containers in background
docker-compose down         # Stop and remove containers

# Start both backend + frontend (RECOMMENDED)
npm run dev                 # Root: concurrent dev with auto-restart
npm run dev:auto            # Aggressive mode (10 restart attempts)

# Individual services
npm run backend:dev         # Backend only (port 4000)
npm run frontend:dev        # Frontend only (port 3000)
```

**Note**: Docker containers must be running before starting backend.

### Production Build

```bash
npm run build               # Build both
npm run backend:build       # Backend only
npm run frontend:build      # Frontend only
```

### Linting

```bash
npm run lint:backend        # ESLint backend
npm run lint:frontend       # ESLint frontend
cd backend && npm run format # Prettier (backend)
```

### Testing

#### Backend Tests

```bash
cd backend
npm test                    # Run all tests
npm run test:watch          # Watch mode
npm run test:cov            # With coverage
npm run test:e2e            # E2E tests
npm run test:debug          # Debug mode
```

#### Frontend Tests

```bash
cd frontend
npm test                    # Run all tests
npm test -- --watch         # Watch mode
npm test -- --coverage      # With coverage
npm test badge.test.tsx     # Run single test file
```

**Note**: Test suite is configured but most tests are pending implementation (Phase 5).

---

## 🎨 Code Style Guidelines

### TypeScript Configuration

- **Strict mode**: Enabled on both backend and frontend
- **Target**: ES2023 (backend), ES2017 (frontend)
- **Module**: nodenext (backend), esnext (frontend)
- **Decorators**: Enabled in backend (NestJS requirement)
- **Path Aliases**: `@/*` maps to `src/*` (frontend only)

### Naming Conventions

#### Backend (NestJS)

```typescript
// Modules, Controllers, Services: PascalCase
export class ClientesController {}
export class ClientesService {}
export class ClientesModule {}

// DTOs: PascalCase with suffix
export class CreateClienteDto {}
export class UpdateClienteDto extends PartialType(CreateClienteDto) {}
export class ClienteResponseDto {}
export class QueryClientesDto {}

// Methods: camelCase
async findAll(query: QueryClientesDto) {}
async findOne(id: number) {}

// Endpoints: plural resource names
@Controller('clientes')        // Plural
@Get()                         // GET /clientes
@Get(':id')                    // GET /clientes/:id
@Post()                        // POST /clientes
@Patch(':id')                  // PATCH /clientes/:id
@Delete(':id')                 // DELETE /clientes/:id
```

#### Frontend (Next.js)

```typescript
// Components: PascalCase
export default function ClientesPage() {}
export function ClienteForm() {}

// Files: kebab-case
cliente - form.tsx;
negocio - card.tsx;
notification - badge.tsx;

// Pages: page.tsx in folder
app / clientes / page.tsx;
app / negocios / page.tsx;

// API functions: camelCase
export async function getClientes() {}
export async function createCliente(data: CreateClienteDto) {}
```

### Import Order

**Always follow this order** (both backend and frontend):

```typescript
// 1. React/Next.js core
import { useState } from 'react';
import { useRouter } from 'next/navigation';

// 2. External libraries
import { useQuery, useMutation } from '@tanstack/react-query';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// 3. UI Components (shadcn/ui)
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

// 4. Custom components
import ClienteForm from '@/components/cliente-form';
import NotificationBadge from '@/components/notifications/notification-badge';

// 5. Types/Interfaces
import { Cliente, CreateClienteDto } from '@/types/cliente';

// 6. API/Utils
import { getClientes, createCliente } from '@/lib/api/clientes';
import { cn } from '@/lib/utils';
```

### Formatting (Prettier)

**Backend** (`.prettierrc`):

```json
{
  "singleQuote": true,
  "trailingComma": "all"
}
```

**Frontend**: Default Next.js formatting

### TypeScript Types

#### Prefer Interfaces for DTOs

```typescript
// ✅ Good
export interface Cliente {
  id: number;
  nombre: string;
  email: string;
  telefono?: string;
}

// ❌ Avoid - use classes for DTOs (backend validation)
export class CreateClienteDto {
  @IsString()
  nombre: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  telefono?: string;
}
```

#### Always Define Return Types

```typescript
// ✅ Good
async findAll(): Promise<ClienteResponseDto[]> {
  return this.prisma.cliente.findMany();
}

// ❌ Avoid
async findAll() {  // No return type
  return this.prisma.cliente.findMany();
}
```

### Error Handling

#### Backend (NestJS)

```typescript
// Use built-in HTTP exceptions
import { NotFoundException, BadRequestException } from '@nestjs/common';

// ✅ Good
async findOne(id: number): Promise<ClienteResponseDto> {
  const cliente = await this.prisma.cliente.findUnique({ where: { id } });
  if (!cliente) {
    throw new NotFoundException(`Cliente con id ${id} no encontrado`);
  }
  return cliente;
}

// Validate with class-validator in DTOs
export class CreateClienteDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;  // Validation happens automatically
}
```

#### Frontend

```typescript
// Use TanStack Query for API error handling
const { data, error, isLoading } = useQuery({
  queryKey: ['clientes'],
  queryFn: getClientes,
});

if (error) {
  toast.error('Error al cargar clientes');
  return <ErrorState />;
}

// Validate forms with react-hook-form + Zod
const formSchema = z.object({
  nombre: z.string().min(1, 'Nombre requerido'),
  email: z.string().email('Email inválido'),
});
```

---

## 📁 Project Structure

```
Desarrollo-Wep/
├── backend/                    # NestJS API
│   ├── src/
│   │   ├── auth/              # JWT authentication
│   │   ├── clientes/          # Clients CRUD (cached)
│   │   ├── negocios/          # Deals CRUD + Kanban (cached)
│   │   ├── actividades/       # Activities CRUD
│   │   ├── reportes/          # Reports module
│   │   ├── stats/             # Dashboard statistics (cached)
│   │   ├── notificaciones/    # Notifications + WebSocket Gateway
│   │   ├── redis/             # Redis cache service (@Global module)
│   │   ├── common/            # Interceptors (cache-control, compression)
│   │   ├── prisma/            # Prisma service
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── prisma/schema.prisma   # Database schema (8 models, 5 enums)
│   └── test/                  # E2E tests
├── frontend/                   # Next.js App
│   ├── src/
│   │   ├── app/               # App Router pages
│   │   │   ├── api/auth/      # NextAuth
│   │   │   ├── login/
│   │   │   ├── dashboard/
│   │   │   ├── clientes/
│   │   │   ├── negocios/
│   │   │   ├── actividades/
│   │   │   └── reportes/
│   │   ├── components/
│   │   │   ├── ui/            # shadcn/ui (16 components)
│   │   │   ├── notifications/
│   │   │   └── providers/
│   │   ├── lib/
│   │   │   ├── api/           # API client functions
│   │   │   ├── socket.ts      # Socket.io client
│   │   │   └── utils.ts
│   │   └── types/             # TypeScript interfaces
│   └── jest.config.js
├── docs/                       # Documentation
│   ├── CONTEXTO_PROYECTO.md   # Main context (692 lines)
│   ├── PROXIMOS_PASOS.md      # Roadmap (693 lines)
│   └── SESION_*.md            # Session logs
├── .github/copilot/           # Copilot configuration
│   ├── instructions.md        # Session startup checklist
│   └── rules.md               # Development rules (677 lines)
├── database/                  # SQL scripts
└── docker-compose.yml         # PostgreSQL + Redis containers
```

---

## 🗄️ Database Schema

**Database**: `clientpro_crm` (PostgreSQL)

**8 Models**: Equipo, Usuario, Cliente, Negocio, Actividad, Email, Nota, Notificacion

**5 Enums**:

- `RolUsuario`: ADMIN, VENDEDOR, MANAGER
- `EtapaNegocio`: PROSPECTO, CALIFICACION, PROPUESTA, NEGOCIACION, CERRADO_GANADO, CERRADO_PERDIDO
- `TipoActividad`: LLAMADA, REUNION, EMAIL, TAREA, NOTA
- `TipoNotificacion`: NEGOCIO_ACTUALIZADO, ACTIVIDAD_VENCIDA, NUEVO_CLIENTE, etc.
- `TipoMoneda`: USD, EUR, COP, MXN

---

## 🔍 Important Rules from .github/copilot/rules.md

### 1. Error Verification Workflow

- **CRITICAL**: Use `get_errors` tool before running code (TypeScript validation)
- If error persists after 2-3 attempts → **Change strategy** (don't repeat same approach)
- Always read related files before proposing solution

### 2. Documentation

- Document **ONLY at end of session** (not during)
- Update `docs/SESION_<DATE>.md` with all changes
- Include what solutions **DIDN'T work** (avoid future repetition)

### 3. Testing Standard

- **Jest + React Testing Library** (official project standard)
- Frontend tests: `.test.tsx` next to component
- Backend tests: `.spec.ts` next to service/controller
- Configuration complete, tests pending (Phase 5)

### 4. Module Structure Pattern (Backend)

```
backend/src/<module>/
├── dto/
│   ├── create-<resource>.dto.ts
│   ├── update-<resource>.dto.ts
│   ├── query-<resource>.dto.ts
│   └── <resource>-response.dto.ts
├── <module>.controller.ts
├── <module>.service.ts
└── <module>.module.ts
```

### 5. Prisma Integration

- Always sync enums: Prisma schema → Backend DTOs → Frontend types
- Use `include` for relations in response DTOs
- Singular model names: `prisma.cliente`, `prisma.negocio`

---

## 🔌 MCP Configuration (.mcp.json)

**6 MCPs Available**:

1. **pgsql** - PostgreSQL (REQUIRED for DB work)
2. **chrome-devtools** - Browser testing (REQUIRED for frontend)
3. **next-devtools** - Next.js monitoring
4. **context7** - Documentation lookup
5. **testing** - Testing framework
6. **semgrep** - Static code analysis (RECOMMENDED for backend quality checks)

---

## 🔀 Git Workflow & Conventions

### Branch Strategy (Git Flow)

**Main Branches**:

- `master` → Production (protected, requires PR with approval)
- `staging` → Pre-production (requires PR from develop)
- `develop` → Active development (default branch, requires PR with tests passing)

**Working Branches**:

```bash
feature/<name>  # New functionality (from develop)
bugfix/<name>   # Bug fixes (from develop)
hotfix/<name>   # Critical production fixes (from master)
release/<version> # Release preparation (from develop)
```

### Creating Branches

```bash
# Feature branch (most common)
git checkout develop
git pull origin develop
git checkout -b feature/client-advanced-filters

# Bugfix
git checkout -b bugfix/notification-badge-count

# Hotfix (urgent production fix)
git checkout master
git pull origin master
git checkout -b hotfix/auth-token-expiration
```

### Commit Conventions (Conventional Commits)

**Format**: `type(scope): subject`

**Types**:

- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation only
- `refactor` - Code change without adding feature/fixing bug
- `test` - Adding or updating tests
- `chore` - Tooling, dependencies, configs
- `perf` - Performance improvement
- `style` - Code style/formatting (not CSS)

**Examples**:

```bash
feat(clientes): add advanced filter functionality
fix(auth): resolve token expiration issue
docs(readme): update installation instructions
refactor(negocios): extract Kanban logic to custom hook
test(clientes): add unit tests for ClientesService
chore(deps): update NestJS to v11.2
```

### Git Hooks (Husky)

**CRITICAL**: These hooks run automatically and will block commits/pushes if they fail.

**Pre-commit** (runs before `git commit`):

- ✅ ESLint auto-fix on staged files (backend + frontend)
- ✅ Prettier format on staged files
- ✅ Only staged files are checked (via lint-staged)
- **Impact**: May modify your files to fix formatting

**Commit-msg** (validates commit message):

- ✅ Validates Conventional Commits format
- ✅ Blocks commit if format is invalid
- **Impact**: You MUST use correct format or commit will fail

**Pre-push** (runs before `git push`):

- ✅ Blocks direct push to `master` (must use PR)
- ✅ Runs TypeScript check on backend (`tsc --noEmit`)
- ✅ Runs TypeScript check on frontend (`tsc --noEmit`)
- ✅ Runs full build (`npm run build`)
- **Impact**: Takes ~30-60 seconds, will block push if build fails

### Common Git Workflows

**Creating a Feature**:

```bash
git checkout develop
git pull origin develop
git checkout -b feature/my-feature
# Work on feature, commit frequently
git add .
git commit -m "feat(scope): description"  # Pre-commit hook runs
git push -u origin feature/my-feature     # Pre-push hook runs
# Create PR on GitHub to merge into develop
```

**Merging to Develop** (via PR):

```bash
# After PR approval
git checkout develop
git pull origin develop
# Delete feature branch (optional)
git branch -d feature/my-feature
```

**Bypassing Hooks** (emergency only):

```bash
git commit --no-verify -m "emergency fix"
git push --no-verify
```

⚠️ **WARNING**: Only use `--no-verify` in emergencies. Hooks exist for quality control.

### Full Documentation

See `docs/guides/git/GIT_WORKFLOW.md` for complete Git Flow guide and `docs/guides/git/GIT_HOOKS.md` for detailed hook documentation.

---

## ✅ Pre-Commit Checklist

Before committing, ensure:

- [ ] `get_errors` shows 0 errors (TypeScript)
- [ ] `npm run dev` runs without critical errors
- [ ] All modified pages/endpoints tested manually
- [ ] Imports follow the defined order
- [ ] No `console.log` statements left (unless intentional)
- [ ] Prisma enums synced across backend/frontend
- [ ] Commit message follows Conventional Commits format
- [ ] Working on correct branch (not `master` or `staging`)

**Optional (Testing Phase - Semgrep)**:

- [ ] `npm run scan` - Verify backend code quality (0 critical errors)

**Git Hooks Will Automatically Check**:

- ✅ ESLint + Prettier formatting
- ✅ Commit message format
- ✅ TypeScript compilation (on push)
- ✅ Build success (on push)
- ✅ No direct push to `master`

---

## 🎯 Common Patterns

### API Client Pattern (Frontend)

```typescript
// lib/api/clientes.ts
export async function getClientes(): Promise<Cliente[]> {
  const response = await axios.get('/api/clientes');
  return response.data;
}
```

### TanStack Query Hook Pattern

```typescript
const { data: clientes, isLoading } = useQuery({
  queryKey: ['clientes'],
  queryFn: getClientes,
});
```

### NestJS Service Pattern

```typescript
@Injectable()
export class ClientesService {
  constructor(
    private prisma: PrismaService,
    private cache: RedisCacheService // Global cache service
  ) {}

  async findAll(): Promise<ClienteResponseDto[]> {
    const cacheKey = 'clientes:all';
    const cached = await this.cache.get<ClienteResponseDto[]>(cacheKey);
    if (cached) return cached;

    const clientes = await this.prisma.cliente.findMany();
    await this.cache.set(cacheKey, clientes, 300); // 5 min TTL
    return clientes;
  }
}
```

### Redis Cache Pattern

```typescript
// Import (available globally via @Global() RedisModule)
constructor(private cache: RedisCacheService) {}

// Get with type safety
const data = await this.cache.get<Cliente[]>('clientes:all');

// Set with TTL (seconds)
await this.cache.set('clientes:all', clientes, 300); // 5 minutes

// Delete single key
await this.cache.del('clientes:1');

// Delete pattern (invalidate all client caches)
await this.cache.delPattern('clientes:*');

// Clear all caches
await this.cache.reset();

// Get statistics
const stats = await this.cache.getStats();
```

### shadcn/ui Component Usage

```typescript
import { Button } from '@/components/ui/button';

<Button variant="default" size="sm" onClick={handleClick}>
  Click me
</Button>
```

---

## 🚨 Critical Notes

1. **Warnings to ignore**: Tailwindcss resolution warnings (it's in `frontend/node_modules`, not root)
2. **Port conflicts**: Check `netstat -ano | Select-String ":3000|:4000|:5432|:6379"` before starting
3. **Docker requirement**: Backend requires PostgreSQL (5432) and Redis (6379) running via Docker Compose
4. **Redis connection**: Check `REDIS_HOST` and `REDIS_PORT` in `.env` (default: localhost:6379)
5. **WebSocket auth**: JWT token required in Socket.io handshake (see `socket.ts`)
6. **Concurrently prefixes**: `[BACKEND]` and `[FRONTEND]` in console output
7. **First load slow**: Next.js compiles on-demand (~10-15s), then fast
8. **Cache-manager v7 issue**: `@nestjs/cache-manager` with `cache-manager@7.x` does NOT work with custom Redis stores. This project uses custom `RedisCacheService` with `ioredis` directly (bypasses cache-manager entirely). DO NOT attempt to use cache-manager Redis stores.

---

## 📚 Key Documentation Files

**MUST READ before starting**:

1. `docs/context/OVERVIEW.md` - Complete project state (updated structure)
2. `.github/copilot/rules.md` - Fixed development rules
3. `docs/roadmap/BACKLOG.md` - Current roadmap and tasks

**Reference when needed**:

- `backend/prisma/schema.prisma` - Database schema
- `docs/guides/CACHING.md` - Redis caching implementation guide (775 lines)
- `docs/guides/docker/DOCKER.md` - Docker setup and troubleshooting (495 lines)
- `docs/wireframe.md` - UI designs
- Latest session doc in `docs/sessions/2026/02-FEBRERO/`

---

**End of AGENTS.md** | Lines: 150+ | For agentic coding agents only

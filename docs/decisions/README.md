# Índice de Registros de Decisión Arquitectónica (ADRs)

> **Propósito**: Documentar decisiones arquitectónicas clave y sus justificaciones
> **Última actualización**: 30 de enero de 2026

---

## 📚 ¿Qué es un ADR?

Un **Architecture Decision Record (ADR)** documenta una decisión arquitectónica importante tomada en el proyecto.

**Propósito**:
- Explicar **por qué** se tomó una decisión, no solo **qué** se decidió
- Preservar contexto para futuros desarrolladores
- Evitar revisitar decisiones ya tomadas sin razón
- Documentar alternativas consideradas
- Facilitar onboarding de nuevos miembros del equipo

**Cuándo crear un ADR**:
- Elección de framework o tecnología principal
- Cambios arquitectónicos significativos
- Decisiones que afectan múltiples módulos
- Trade-offs importantes entre opciones

**Cuándo NO crear un ADR**:
- Decisiones tácticas pequeñas
- Configuraciones menores
- Decisiones fácilmente reversibles

---

## 📋 ADRs Existentes

### **ADR-001: Elegir NestJS como Framework Backend**
**Fecha**: 06/01/2026 | **Estado**: Aceptado | **Etiquetas**: backend, framework

**Resumen**: NestJS elegido sobre Express.js, Fastify, Adonis.js, y tRPC por su arquitectura modular, excelente soporte TypeScript, e integración con Prisma y Socket.io.

**Decisión clave**: Framework opinionado con inyección de dependencias para consistencia del equipo.

**Leer cuando**: Necesites entender estructura del backend o consideres framework alternativo.

[Ver ADR completo →](./001-nestjs-backend.md)

---

### **ADR-002: Elegir Next.js 16 con App Router para Frontend**
**Fecha**: 06/01/2026 | **Estado**: Aceptado | **Etiquetas**: frontend, framework

**Resumen**: Next.js 16 App Router elegido sobre Pages Router, Vite+React Router, Remix, y CRA por Server Components, SSR, y optimizaciones automáticas.

**Decisión clave**: App Router es el futuro de Next.js, mejor empezar moderno desde el inicio.

**Leer cuando**: Necesites entender por qué usamos App Router o consideres migrar a otro framework.

[Ver ADR completo →](./002-nextjs-16-app-router.md)

---

### **ADR-003: Elegir Socket.io para Funcionalidades en Tiempo Real**
**Fecha**: 18/01/2026 | **Estado**: Aceptado | **Etiquetas**: backend, frontend, real-time, websockets

**Resumen**: Socket.io elegido sobre WebSocket nativo, SSE, polling, y Firebase por fallback automático, rooms, y excelente integración con NestJS.

**Decisión clave**: Notificaciones en tiempo real < 1 segundo requieren WebSocket bidireccional.

**Leer cuando**: Necesites entender sistema de notificaciones en tiempo real o consideres alternativa.

[Ver ADR completo →](./003-socket-io-realtime.md)

---

### **ADR-004: Elegir Prisma como ORM para Base de Datos**
**Fecha**: 06/01/2026 | **Estado**: Aceptado | **Etiquetas**: backend, database, orm

**Resumen**: Prisma elegido sobre TypeORM, Sequelize, Kysely, y Drizzle por type-safety completo, schema declarativo, y migraciones automáticas.

**Decisión clave**: Type-safety end-to-end entre PostgreSQL y TypeScript es crítico.

**Leer cuando**: Necesites entender interacción con base de datos o consideres ORM alternativo.

[Ver ADR completo →](./004-prisma-orm.md)

---

### **ADR-005: Elegir shadcn/ui para Componentes de Interfaz**
**Fecha**: 09/01/2026 | **Estado**: Aceptado | **Etiquetas**: frontend, ui, components

**Resumen**: shadcn/ui elegido sobre MUI, Ant Design, Headless UI, y construcción desde cero por control total, accesibilidad, y cero vendor lock-in.

**Decisión clave**: Componentes viven en tu código (copy-paste), no en node_modules.

**Leer cuando**: Necesites entender sistema de componentes UI o consideres biblioteca alternativa.

[Ver ADR completo →](./005-shadcn-ui.md)

---

### **ADR-006: Elegir Semgrep para Análisis Estático de Código**
**Fecha**: 03/02/2026 | **Estado**: Aceptado | **Etiquetas**: backend, devops, code-quality, static-analysis

**Resumen**: Semgrep elegido sobre ESLint custom rules, SonarQube, CodeQL, y Checkmarx por reglas personalizadas simples, integración MCP, y soporte para patrones específicos de NestJS.

**Decisión clave**: Análisis estático enfocado en calidad, consistencia y seguridad del backend solamente.

**Leer cuando**: Necesites entender proceso de análisis estático, configurar nuevas reglas, o integrar Semgrep en CI/CD.

[Ver ADR completo →](./006-semgrep-static-analysis.md)

---

## 🔄 Estados de ADR

| Estado | Significado |
|--------|-------------|
| **Propuesto** | Decisión propuesta, aún no implementada |
| **Aceptado** | Decisión aprobada e implementada |
| **Deprecado** | Ya no se usa, pero aún en el código |
| **Reemplazado** | Reemplazado por otro ADR (link al nuevo) |

---

## 📝 Cómo Crear un Nuevo ADR

### **Paso 1: Copiar Template**
```bash
cp docs/decisions/template.md docs/decisions/006-titulo-decision.md
```

### **Paso 2: Completar Secciones**
- **Contexto**: ¿Qué problema estamos resolviendo? ¿Por qué ahora?
- **Decisión**: ¿Qué elegimos? ¿Por qué esta opción?
- **Consecuencias**: ¿Qué se vuelve más fácil/difícil?
- **Alternativas**: ¿Qué más consideramos? ¿Por qué rechazamos?

### **Paso 3: Revisar con Equipo** (si aplica)
- Discutir pros/contras
- Validar que alternativas sean justas
- Asegurar consenso

### **Paso 4: Actualizar Este README**
- Agregar entrada en sección "ADRs Existentes"
- Incluir resumen breve
- Link al ADR completo

### **Paso 5: Referenciar en Código**
```typescript
// En código donde se usa la decisión:
// Ver ADR-006 para justificación de este patrón
```

---

## 🎯 Mejores Prácticas

### **Al Escribir ADRs**

**SÍ hacer**:
- ✅ Explicar el **contexto** completo
- ✅ Listar **pros y contras** de forma justa
- ✅ Documentar **alternativas realmente consideradas**
- ✅ Ser honesto sobre **trade-offs**
- ✅ Incluir **referencias** a docs/discusiones

**NO hacer**:
- ❌ Justificar decisión después del hecho
- ❌ Solo listar pros de la opción elegida
- ❌ Inventar alternativas solo para descartarlas
- ❌ Omitir consecuencias negativas
- ❌ Escribir ADR para decisión trivial

### **Al Actualizar ADRs**

**Cuándo actualizar**:
- Nueva información invalida decisión original
- Implementación revela problemas no anticipados
- Decisión necesita ser revertida o modificada

**Cómo actualizar**:
- NO borrar contenido original
- Agregar sección "Actualización" con fecha
- Si se reemplaza, cambiar estado a "Reemplazado" y linkar nuevo ADR
- Actualizar "Historial de Revisiones"

---

## 🔗 Referencias Cruzadas

### **ADRs → Documentación Técnica**
- ADR-001 (NestJS) → `docs/context/STACK.md` (Backend)
- ADR-002 (Next.js) → `docs/context/STACK.md` (Frontend)
- ADR-003 (Socket.io) → `docs/context/STACK.md` (WebSocket)
- ADR-004 (Prisma) → `docs/context/DATABASE.md`
- ADR-005 (shadcn/ui) → `docs/context/ARCHITECTURE.md` (Componentes)
- ADR-006 (Semgrep) → `/AGENTS.md` (Comandos scan)

### **ADRs → Implementación**
- ADRs explican **por qué** se tomó la decisión
- `/AGENTS.md` y `docs/context/` explican **cómo** usarlas

---

## 📊 Decisiones Pendientes

**Próximos ADRs a crear** (Fase 5-6):

### **ADR-007: Testing Strategy (Pendiente)**
- Jest vs Vitest
- React Testing Library vs Enzyme
- E2E: Playwright vs Cypress
- **Fecha estimada**: Fase 5

### **ADR-008: Deployment Platform (Pendiente)**
- Vercel + Railway vs Docker + VPS vs Kubernetes
- **Fecha estimada**: Fase 6

### **ADR-009: Monitoring & Logging (Pendiente)**
- Sentry vs LogRocket vs Datadog
- **Fecha estimada**: Fase 6

### **ADR-010: CI/CD Pipeline (Pendiente)**
- GitHub Actions vs GitLab CI vs CircleCI
- **Fecha estimada**: Fase 6

---

## 📚 Documentación Relacionada

**Contexto Padre**:
- `docs/README.md` - Índice maestro de documentación
- `docs/context/README.md` - Contexto del proyecto

**Relacionado**:
- `/AGENTS.md` - Cómo aplicar las decisiones (comandos, patrones)
- `docs/sessions/` - Registro de decisiones tácticas en sesiones
- `CHANGELOG.md` - Historial de cambios técnicos

---

## ✅ Resumen

**6 ADRs Documentados**:
1. NestJS como framework backend
2. Next.js 16 App Router como framework frontend
3. Socket.io para funcionalidades en tiempo real
4. Prisma como ORM
5. shadcn/ui para componentes UI
6. Semgrep para análisis estático de código

**4 ADRs Pendientes** (Fase 5-6):
- Testing Strategy
- Deployment Platform
- Monitoring & Logging
- CI/CD Pipeline

**Plantilla disponible**: `template.md` para nuevos ADRs

---

**Fin de decisions/README.md** | ~200 líneas | Índice de decisiones arquitectónicas

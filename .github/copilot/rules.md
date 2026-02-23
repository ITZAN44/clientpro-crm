# 📏 Reglas Fijas para Cada Sesión - ClientPro CRM

> **Estas reglas SIEMPRE se aplican** en cada sesión de desarrollo con GitHub Copilot.

---

## 🔍 1. Verificación de Errores

### Regla: Análisis Inteligente y Flexible de Errores

> **IMPORTANTE**: Ser metódico la primera vez, pero **NO encasillarse**. Si el error persiste después de 2-3 intentos, cambiar de estrategia.

**Cuando aparezca un error:**

#### a) **Primera vez: Identificar el origen exacto**
```
❌ MAL: "Hay un error en el frontend"
✅ BIEN: "Error en frontend/app/clientes/page.tsx línea 45: Cannot read property 'nombre' of undefined"
```

**Checklist de verificación (PRIMER INTENTO):**
- [ ] ¿Cuál es el archivo exacto?
- [ ] ¿Cuál es la línea exacta?
- [ ] ¿Cuál es el mensaje completo de error?
- [ ] ¿Es un error de compilación, runtime o linting?
- [ ] ¿Hay stack trace disponible?

---

#### b) **Verificar archivos relacionados**

**Antes de proponer solución:**
1. Leer el archivo con el error
2. Leer archivos importados/relacionados
3. Verificar tipos/interfaces
4. Revisar dependencias

**Ejemplo:**
```typescript
// Error en: app/clientes/page.tsx
// ✅ Verificar también:
// - types/cliente.ts (interfaces)
// - lib/api/clientes.ts (funciones API)
// - components/cliente-*.tsx (componentes)
```

---

#### c) **Buscar errores similares previos**

**Pasos:**
1. Buscar en archivos de sesiones anteriores (docs/SESION_*.md)
2. Revisar si el error ya fue resuelto
3. Aplicar la misma solución si es aplicable
4. Documentar si es un error nuevo

---

#### d) **Validar la solución**

**Después de aplicar fix:**
- [ ] Compilar sin errores
- [ ] Ejecutar y probar
- [ ] Verificar que no rompió otras funcionalidades

---

#### e) **Si el error PERSISTE después de 2-3 intentos:**

**⚠️ CAMBIAR DE ESTRATEGIA:**

1. **Reconocer el patrón:**
   ```
   ❌ "Ya intenté 3 veces con el mismo approach"
   ✅ "Necesito probar una solución diferente"
   ```

2. **Alternativas a explorar:**
   - Buscar en documentación oficial (usar MCP `context7`)
   - Revisar issues de GitHub del paquete/framework
   - Probar un approach completamente diferente
   - Simplificar el código para aislar el problema
   - Consultar logs más detallados
   - Verificar versiones de dependencias

3. **Registrar intentos fallidos (para documentar al final):**
   ```markdown
   Intentos que NO funcionaron:
   - Intento 1: Cambiar tipo de X a Y → Mismo error
   - Intento 2: Agregar validación Z → Error persiste  
   - Intento 3: Refactorizar función → No resuelve
   
   Solución alternativa que funcionó:
   - Cambiar el approach completo usando [nueva estrategia]
   ```

4. **No insistir en lo mismo:**
   - Si 2-3 intentos similares fallan → Es hora de cambiar
   - No seguir el mismo patrón esperando resultados diferentes
   - Ser flexible y creativo con las soluciones
   - La primera vez seguir el proceso, pero adaptar si no funciona

---

## ⚙️ 1.1. Validación con get_errors Tool (CRÍTICO)

### Regla: SIEMPRE Validar con get_errors Antes de Ejecutar

> **AGREGADO**: 23 Enero 2026 - Metodología probada exitosa en Fase 4

**Cuándo usar get_errors:**
- ✅ **Después de cada modificación de código** (especialmente TypeScript)
- ✅ **Antes de ejecutar testing manual** (frontend o backend)
- ✅ **Para validar que una solución funcionó** sin crear nuevos errores
- ✅ **Al trabajar con Prisma** (verificar que tipos generados son correctos)
- ✅ **Después de instalar paquetes** (validar imports y dependencias)

**Workflow recomendado:**
```
1. Modificar código (agregar funcionalidad, fix bug, etc.)
2. Ejecutar get_errors(['ruta/al/archivo/modificado'])
3. Si hay errores → Corregir inmediatamente
4. Si no hay errores → Proceder a testing manual
5. Repetir ciclo
```

**Ejemplo de uso correcto:**
```bash
# Escenario: Modificaste negocios.service.ts
# 1. Modificaste el código
# 2. Ejecutas get_errors
get_errors(['backend/src/negocios'])

# 3a. Si hay errores:
# - Leer mensajes de error completos
# - Identificar líneas exactas
# - Corregir (imports, tipos, etc.)
# - Re-ejecutar get_errors

# 3b. Si no hay errores:
# - Proceder a testing (manual o automatizado)
# - Documentar que compilación exitosa
```

**Por qué es efectivo:**
- ⚡ Detecta errores de compilación antes de ejecutar código
- 🎯 Identifica problemas de tipos (TypeScript)
- 🔍 Valida que imports son correctos
- ✅ Confirma que DTOs coinciden con Prisma schema
- 📊 Asegura que enums están sincronizados

**Errores comunes que detecta:**
- Tipos incorrectos en DTOs
- Enums no sincronizados con Prisma
- Imports faltantes o incorrectos
- Propiedades inexistentes en interfaces
- Argumentos faltantes en funciones

**Nota importante:**
- Si `get_errors` reporta 0 errores → Tu código compila correctamente
- Si reporta errores → NO ejecutes código hasta corregir
- Usa este método para **prevenir debugging innecesario**

---

## 🔌 2. Uso de MCPs Según Contexto

### Regla: Activar MCPs Apropiados

#### **Contexto: Trabajo de Base de Datos**
**MCPs requeridos:**
- ✅ `pgsql` (PostgreSQL) - **OBLIGATORIO**
- ⚠️ `context7` (Documentación) - Si necesitas refs de Prisma

**Acciones típicas:**
- Crear/modificar modelos Prisma
- Ejecutar migraciones
- Hacer queries
- Inspeccionar datos

---

#### **Contexto: Trabajo de Frontend**
**MCPs requeridos:**
- ✅ `next-devtools` (Next.js) - **OBLIGATORIO**
- ✅ `chrome-devtools` (Browser) - **OBLIGATORIO** para testing
- ⚠️ `context7` (Documentación) - Si necesitas refs de React/Next.js

**Acciones típicas:**
- Crear/modificar páginas
- Crear/modificar componentes
- Styling con Tailwind
- Testing visual

---

#### **Contexto: Trabajo de Backend**
**MCPs requeridos:**
- ✅ `pgsql` (PostgreSQL) - **OBLIGATORIO**
- ⚠️ `context7` (Documentación) - Si necesitas refs de NestJS

**Acciones típicas:**
- Crear/modificar controllers
- Crear/modificar services
- Validación con DTOs
- Testing de endpoints

---

#### **Contexto: Testing/Debugging**
**MCPs requeridos:**
- ✅ `chrome-devtools` (Browser) - **OBLIGATORIO**
- ✅ `next-devtools` (Next.js) - Para frontend
- ✅ `pgsql` (PostgreSQL) - Para verificar datos

**Acciones típicas:**
- Verificar UI en navegador
- Tomar screenshots
- Inspeccionar console errors
- Validar datos en DB

---

#### **Contexto: Documentación/Investigación**
**MCPs requeridos:**
- ✅ `context7` (Documentación) - **OBLIGATORIO**

**Acciones típicas:**
- Buscar best practices
- Consultar APIs
- Verificar sintaxis

---

## 📝 3. Documentación Obligatoria

### Regla: Documentar AL FINALIZAR LA SESIÓN

> **IMPORTANTE**: La documentación se hace SOLO al terminar la sesión de trabajo, NO durante.

#### **¿Qué documentar al finalizar?**

**a) Cambios de código significativos:**
- Nuevos módulos/funcionalidades implementadas
- Fixes de bugs críticos realizados
- Cambios de arquitectura aplicados
- Decisiones de diseño tomadas

**b) Problemas encontrados y soluciones:**
- Errores importantes que se resolvieron
- Conflictos de dependencias solucionados
- Problemas de configuración arreglados
- **Incluir qué soluciones NO funcionaron** (para evitar repetir intentos)

**c) Configuraciones nuevas:**
- Nuevos MCPs agregados
- Nuevas dependencias instaladas
- Cambios en scripts de NPM

---

#### **¿Dónde documentar?**

**Estructura de documentos:**
```
docs/
├── CONTEXTO_PROYECTO.md      ← Estado general del proyecto
├── PROXIMOS_PASOS.md          ← TODOs y objetivos
└── SESION_<FECHA>.md          ← Detalles de cada sesión
```

**Actualizar AL FINALIZAR la sesión:**
1. Crear/actualizar `SESION_<FECHA>.md` con todo lo realizado
2. Actualizar `CONTEXTO_PROYECTO.md` si cambió el estado del proyecto
3. Actualizar `PROXIMOS_PASOS.md` con tareas completadas y pendientes
4. Incluir qué soluciones NO funcionaron (para referencia futura)

**Durante la sesión:**
- ✅ Trabajar y resolver problemas
- ❌ NO detenerse a documentar (solo al final)

---

## 🛡️ 4. Validación de Integridad

### Regla: No Romper lo que Funciona

#### **Antes de hacer cambios:**
- [ ] Leer código existente
- [ ] Entender el flujo actual
- [ ] Verificar dependencias
- [ ] Identificar impactos

#### **Durante los cambios:**
- [ ] Mantener consistencia de estilo
- [ ] Seguir patrones establecidos
- [ ] No duplicar código
- [ ] Usar nombres descriptivos

#### **Después de los cambios:**
- [ ] Compilar sin errores (`npm run dev`)
- [ ] Probar funcionalidad afectada
- [ ] Probar funcionalidades relacionadas
- [ ] Verificar en navegador (si es frontend)

---

## 🎯 5. Patrones y Convenciones del Proyecto

### Regla: Seguir Estándares Establecidos

#### **Naming Conventions:**

**Backend (NestJS):**
```typescript
// Controllers
@Controller('clientes')
export class ClientesController { }

// Services
@Injectable()
export class ClientesService { }

// DTOs
export class CreateClienteDto { }
export class UpdateClienteDto extends PartialType(CreateClienteDto) { }

// Endpoints
@Get()           // GET /clientes
@Get(':id')      // GET /clientes/:id
@Post()          // POST /clientes
@Patch(':id')    // PATCH /clientes/:id
@Delete(':id')   // DELETE /clientes/:id
```

**Frontend (Next.js):**
```typescript
// Páginas
app/clientes/page.tsx
app/negocios/page.tsx

// Componentes
components/cliente-form.tsx
components/negocio-card.tsx

// Types
types/cliente.ts
types/negocio.ts

// API
lib/api/clientes.ts
lib/api/negocios.ts
```

---

#### **Estructura de Archivos:**

**Backend:**
```
backend/src/
├── auth/
├── clientes/
│   ├── dto/
│   │   ├── create-cliente.dto.ts
│   │   ├── update-cliente.dto.ts
│   │   └── cliente-response.dto.ts
│   ├── clientes.controller.ts
│   ├── clientes.service.ts
│   └── clientes.module.ts
├── negocios/
├── metricas/
└── actividades/
```

**Frontend:**
```
frontend/app/
├── clientes/
│   └── page.tsx
├── negocios/
│   └── page.tsx
├── metricas/
│   └── page.tsx
└── actividades/
    └── page.tsx
```

---

#### **Imports Order:**

```typescript
// 1. React/Next.js
import { useState } from 'react'
import { useRouter } from 'next/navigation'

// 2. External libraries
import { useQuery, useMutation } from '@tanstack/react-query'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

// 3. UI Components
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

// 4. Custom components
import ClienteForm from '@/components/cliente-form'

// 5. Types
import { Cliente, CreateClienteDto } from '@/types/cliente'

// 6. API/Utils
import { getClientes, createCliente } from '@/lib/api/clientes'
import { cn } from '@/lib/utils'
```

---

## ⚠️ 6. Warnings y Errores a Ignorar

### Regla: Distinguir entre Warnings y Errores Críticos

#### **Ignorar (son normales):**
```
✅ Error: Can't resolve 'tailwindcss' in root
   → Tailwindcss está en frontend/node_modules (correcto)

✅ [FRONTEND] Warning: ...
   → Warnings de Next.js en desarrollo (no bloquean)

✅ Compiled with warnings
   → Si la aplicación funciona, no es crítico
```

#### **NO ignorar (requieren acción):**
```
❌ Module not found: Can't resolve '@/components/...'
   → Falta un archivo o import incorrecto

❌ Property 'X' does not exist on type 'Y'
   → Error de TypeScript, revisar tipos

❌ Cannot read property of undefined
   → Runtime error, validar datos
```

---

## 🔄 7. Workflow de Testing

### Regla: Validar Antes de Considerar Completo

#### **Para cada cambio:**

**Backend:**
1. **EJECUTAR get_errors** para validar compilación TypeScript
2. Compilar sin errores (`npm run start:dev`)
3. Probar endpoint con REST client (PowerShell Invoke-RestMethod o .http files)
4. Verificar respuesta esperada (status code, estructura de datos)
5. Validar datos en base de datos (con PostgreSQL MCP)

**Frontend:**
1. **EJECUTAR get_errors** para validar compilación TypeScript
2. Compilar sin errores (`npm run dev`)
3. Abrir en navegador (http://localhost:3000)
4. Probar flujo completo (crear, editar, eliminar)
5. Usar Chrome DevTools MCP para screenshots y validación
6. Verificar consola de navegador (0 errores)

**Integración:**
1. Backend respondiendo correctamente
2. Frontend mostrando datos correctos
3. Sin errores en consola de navegador
4. Flujo end-to-end funcionando

---

## 🧪 7.1. Testing Automatizado (ESTÁNDAR DEL PROYECTO)

### Regla: Jest + React Testing Library Como Estándar

> **ESTABLECIDO**: 23 Enero 2026 - Metodología oficial del proyecto

**Stack de Testing:**
- ✅ **Jest**: Framework de testing para JavaScript/TypeScript
- ✅ **React Testing Library**: Testing de componentes React
- ⏳ **Configuración pendiente**: Diferido a Fase 5

**Por qué Jest + React Testing Library:**
- ✅ Estándar de la industria para React/Next.js
- ✅ Excelente integración con TypeScript
- ✅ Fácil mocking de dependencias
- ✅ Testing de componentes centrado en el usuario
- ✅ Soporte oficial de Next.js

**Tipos de tests a implementar:**

1. **Unit Tests:**
   - Componentes individuales
   - Funciones de utilidad
   - Servicios/lógica de negocio

2. **Integration Tests:**
   - Flujos completos de componentes
   - API calls + respuestas
   - WebSocket events + UI updates

3. **E2E Tests (futuro):**
   - Flujos completos de usuario
   - Navegación entre páginas
   - CRUD operations completas

**Estructura de archivos de test:**
```
backend/
├── src/
│   ├── notificaciones/
│   │   ├── notificaciones.service.ts
│   │   ├── notificaciones.service.spec.ts    ← Unit test
│   │   ├── notificaciones.gateway.ts
│   │   └── notificaciones.gateway.spec.ts    ← Unit test

frontend/
├── src/
│   ├── components/
│   │   ├── notifications/
│   │   │   ├── notification-badge.tsx
│   │   │   ├── notification-badge.test.tsx    ← Unit test
│   │   │   ├── notification-dropdown.tsx
│   │   │   └── notification-dropdown.test.tsx ← Unit test
│   │   ├── providers/
│   │   │   ├── notification-provider.tsx
│   │   │   └── notification-provider.test.tsx ← Integration test
```

**Ejemplo de test con Jest + React Testing Library:**
```typescript
// notification-badge.test.tsx
import { render, screen } from '@testing-library/react'
import { NotificationBadge } from './notification-badge'

describe('NotificationBadge', () => {
  it('muestra contador cuando hay notificaciones no leídas', () => {
    render(<NotificationBadge unreadCount={5} isConnected={true} />)
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('muestra "9+" cuando hay más de 9 notificaciones', () => {
    render(<NotificationBadge unreadCount={15} isConnected={true} />)
    expect(screen.getByText('9+')).toBeInTheDocument()
  })

  it('muestra indicador verde cuando está conectado', () => {
    const { container } = render(<NotificationBadge unreadCount={0} isConnected={true} />)
    expect(container.querySelector('.bg-green-500')).toBeInTheDocument()
  })
})
```

**Cuándo implementar tests:**
- ✅ **CONFIGURADO**: Jest + React Testing Library (23 Enero 2026)
- ⏳ **Pendiente**: Tests para NotificationProvider, componentes UI
- ⏳ **Pendiente**: Tests para NotificacionesGateway, NotificacionesService
- ⏳ **Futuro**: E2E tests con Playwright/Cypress

**Cómo ejecutar tests:**
```bash
cd frontend
npm test                    # Ejecutar todos los tests
npm test -- --watch         # Modo watch (re-ejecuta al cambiar)
npm test -- --coverage      # Con reporte de coverage
npm test badge.test.tsx     # Ejecutar test específico
```

**Archivos de configuración:**
- `frontend/jest.config.js` - Configuración principal
- `frontend/jest.setup.js` - Mocks globales (next/navigation, next-auth, socket.io)
- Test de ejemplo: `frontend/src/components/notifications/notification-badge.test.tsx`

---

## 📊 8. Reporte de Progreso

### Regla: Comunicar Estado Claramente

#### **Al finalizar tarea:**

**Formato de reporte:**
```markdown
✅ Completado: <Descripción de tarea>

Archivos modificados:
- path/to/file1.ts (creado/modificado)
- path/to/file2.tsx (creado/modificado)

Funcionalidades implementadas:
- Funcionalidad 1
- Funcionalidad 2

Testing:
- ✅ Backend: Endpoint X responde correctamente
- ✅ Frontend: Página Y muestra datos
- ✅ Integración: Flujo Z funciona end-to-end

Próximos pasos:
- Tarea pendiente 1
- Tarea pendiente 2
```

---

## 🚨 9. Manejo de Problemas Críticos

### Regla: Escalar Problemas No Resueltos

#### **Si un problema toma >30 minutos:**

1. **Documentar el problema:**
   - Error exacto
   - Archivos afectados
   - Intentos de solución
   - Stack trace completo

2. **Buscar en documentación:**
   - Usar `context7` MCP
   - Revisar docs oficiales
   - Buscar en issues de GitHub

3. **Pedir ayuda:**
   - Explicar el contexto completo
   - Mostrar código relevante
   - Compartir error completo

---

## 🎓 10. Aprendizaje Continuo

### Regla: Mejorar con Cada Sesión

#### **Al final de cada sesión:**

**Reflexionar:**
- ¿Qué funcionó bien?
- ¿Qué tomó más tiempo de lo esperado?
- ¿Qué se puede mejorar?

**Documentar lecciones:**
- Patrones que funcionan
- Errores comunes y soluciones
- Optimizaciones descubiertas

**Actualizar reglas:**
- Si un patrón se repite, agregarlo a las reglas
- Si un error es recurrente, documentar la solución
- Si un workflow mejora, actualizarlo

---

## 📌 Resumen de Reglas Esenciales

1. ✅ Verificar errores con contexto completo y archivos relacionados
2. ✅ Activar MCPs apropiados según el contexto de trabajo
3. ✅ Documentar cambios significativos en archivos apropiados
4. ✅ No romper funcionalidades existentes
5. ✅ Seguir patrones y convenciones establecidos
6. ✅ Distinguir warnings (ignorables) de errores críticos
7. ✅ Validar todo antes de considerar completo
8. ✅ Reportar progreso claramente
9. ✅ Escalar problemas complejos
10. ✅ Aprender y mejorar continuamente

---

**Fecha de última actualización**: 18 de Enero de 2026
**Versión**: 1.0.0

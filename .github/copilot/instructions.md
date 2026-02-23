# 🚀 Instrucciones de Inicio de Sesión - ClientPro CRM

> **IMPORTANTE**: Estas instrucciones deben ejecutarse al inicio de cada nueva sesión de chat con GitHub Copilot.

## 📋 Checklist de Inicio

### 1. **Conectar a Base de Datos PostgreSQL**
```bash
# Verificar conexión con el MCP de PostgreSQL
- Base de datos: clientpro_crm
- Host: localhost
- Puerto: 5432
- Usuario: postgres
```

**Acción requerida:**
- Activar MCP `pgsql` si está disponible
- Verificar estado de la base de datos
- Confirmar que hay 6 actividades, 2 clientes, 2 negocios, 1 usuario

---

### 2. **Iniciar Aplicación**
```bash
# Comando principal para desarrollo
npm run dev
```

**Qué hace este comando:**
- Inicia **Backend** (NestJS) en puerto 4000
- Inicia **Frontend** (Next.js) en puerto 3000
- Usa Concurrently para ejecutar ambos simultáneamente
- Muestra prefijos [BACKEND] y [FRONTEND]
- Auto-restart configurado (5 intentos)

**Validación:**
- ✅ Backend responde en http://localhost:4000
- ✅ Frontend responde en http://localhost:3000
- ✅ Sin errores críticos en consola
- ⚠️ Warnings de tailwindcss son normales (ignorar)

---

### 3. **Activar MCPs Necesarios**

#### **MCPs Obligatorios en Cada Sesión:**

**a) PostgreSQL MCP** (`pgsql`)
- Para: Queries, migraciones, inspección de base de datos
- Activar: Siempre al inicio
- Uso: Cualquier operación de base de datos

**b) Chrome DevTools MCP** (`chrome-devtools`)
- Para: Testing de frontend, screenshots, inspección
- Activar: Al trabajar en frontend o testing
- Uso: Validación visual, debugging

**c) Next.js DevTools MCP** (`next-devtools`)
- Para: Monitoring de Next.js, performance
- Activar: Al trabajar en frontend
- Uso: Optimización, debugging de rutas

**d) Context7 MCP** (`context7`)
- Para: Búsqueda en documentación
- Activar: Al necesitar referencias
- Uso: Consultas sobre tecnologías

---

### 4. **Verificar Estado del Proyecto**

**Checklist de archivos críticos:**
- [ ] `.mcp.json` - 4 MCPs configurados
- [ ] `package.json` (raíz) - Scripts de Concurrently
- [ ] `backend/prisma/schema.prisma` - 8 modelos
- [ ] `frontend/app/*` - 6 páginas implementadas
- [ ] `docs/CONTEXTO_PROYECTO.md` - Actualizado
- [ ] `docs/PROXIMOS_PASOS.md` - Sincronizado

**Estado esperado:**
- Fase 4: 100% completada ✅
- Fase 5: Testing configurado ✅
- MVP: ~90% completado
- Módulos: Auth, Clientes, Negocios, Stats, Actividades, Reportes, Notificaciones
- Endpoints: 34 totales (29 REST + 5 WebSocket events)
- WebSocket: Socket.io integrado con autenticación JWT
- Testing: Jest + React Testing Library configurado (ejecutar con npm test)
- Fase 3: 100% completada ✅
- MVP: ~85% completado
- Módulos: Auth, Clientes, Negocios, Stats, Actividades, Reportes
- Endpoints: 29 totales (Auth: 2, Clientes: 5, Negocios: 6, Actividades: 6, Stats: 2, Reportes: 3)

---

### 5. **Leer Contexto del Proyecto**

**Archivos a revisar ANTES de empezar:**

1. **`docs/CONTEXTO_PROYECTO.md`**
   - Estado actual del proyecto
   - Tecnologías utilizadas
   - Estructura de archivos
   - Progreso de fases

2. **`docs/PROXIMOS_PASOS.md`**
   - Últimas actualizaciones
   - Trabajo completado
   - Objetivos inmediatos
   - Próximas fases sugeridas

3. **`docs/SESION_23_ENERO_2026.md`**
   - Última sesión de trabajo (Notificaciones Real-Time)
   - Sistema de notificaciones duales implementado
   - Problemas resueltos (404, TypeScript enum, auto-actualización)
   - Metodología get_errors destacada

---

## ⚡ Comandos Rápidos de Inicio

```bash
# 1. Verificar que no haya procesos corriendo
netstat -ano | Select-String ":3000|:4000"

# 2. Iniciar aplicación (si no está corriendo)
npm run dev

# 3. Verificar logs (buscar errores)
# Los logs aparecen con prefijos [BACKEND] y [FRONTEND]

# 4. Abrir en navegador
# Frontend: http://localhost:3000
# Backend API: http://localhost:4000/api
```

---

## 🎯 Confirmación de Inicio Exitoso

**La sesión está lista cuando:**
- ✅ Base de datos conectada y verificada
- ✅ Backend corriendo (puerto 4000)
- ✅ Frontend corriendo (puerto 3000)
- ✅ MCPs necesarios activados
- ✅ Contexto del proyecto leído
- ✅ Sin errores críticos

**Mensaje de confirmación sugerido:**
```
🚀 Sesión iniciada correctamente
📊 Base de datos: clientpro_crm conectada
🔧 Backend: Puerto 4000 activo
🎨 Frontend: Puerto 3000 activo
📚 Contexto: Fase 4 completada (90% MVP)
🔔 WebSocket: Socket.io activo con notificaciones real-time
✅ Listo para trabajar
```

---

## 📝 Notas Importantes

- **Warnings de tailwindcss**: Son normales, ignorar (busca en raíz, está en frontend/)
- **Primera carga lenta**: Next.js compila on-demand (10-15s), después es rápido
- **Auto-restart**: Si backend crashea, Concurrently lo reinicia automáticamente
- **Ctrl+C**: Mata ambos procesos (backend y frontend) limpiamente

---

## 🔄 Flujo de Trabajo Recomendado

1. **Leer instrucciones** (este archivo)
2. **Conectar base de datos** (PostgreSQL MCP)
3. **Iniciar aplicación** (`npm run dev`)
4. **Activar MCPs** según necesidad
5. **Leer contexto** (CONTEXTO_PROYECTO.md)
6. **Revisar próximos pasos** (PROXIMOS_PASOS.md)
7. **Comenzar a trabajar** siguiendo las reglas

---

**Fecha de última actualización**: 19 de Enero de 2026
**Versión**: 1.1.0

# 📘 Contexto del Proyecto

> **Índice de documentación sobre el contexto de ClientPro CRM**

Esta carpeta contiene toda la información contextual del proyecto dividida en documentos modulares y fáciles de navegar.

---

## 📑 Archivos Disponibles

### **1. [OVERVIEW.md](./OVERVIEW.md)** - Resumen Ejecutivo
**¿Qué contiene?**
- ¿Qué es ClientPro CRM?
- Funcionalidades principales
- Estado del proyecto (fases completadas)
- Objetivo del proyecto
- Progreso general

**Cuándo leerlo:**
- Al iniciar en el proyecto
- Para entender qué hace la aplicación
- Para conocer el estado actual

---

### **2. [STACK.md](./STACK.md)** - Stack Tecnológico
**¿Qué contiene?**
- Frontend: Next.js, TypeScript, Tailwind, shadcn/ui, TanStack Query
- Backend: NestJS, Prisma, PostgreSQL, Socket.io
- Testing: Jest, React Testing Library
- DevOps: Concurrently, MCPs
- Versiones exactas de dependencias
- APIs y endpoints disponibles

**Cuándo leerlo:**
- Para conocer las tecnologías usadas
- Al trabajar con una dependencia específica
- Para verificar versiones de paquetes
- Al configurar el entorno de desarrollo

---

### **3. [DATABASE.md](./DATABASE.md)** - Base de Datos
**¿Qué contiene?**
- 8 modelos de datos (Equipo, Usuario, Cliente, Negocio, etc.)
- 5 enums (RolUsuario, EtapaNegocio, TipoActividad, etc.)
- Relaciones entre modelos
- Usuarios de prueba (credenciales)
- Datos de ejemplo
- Comandos de Prisma

**Cuándo leerlo:**
- Al trabajar con la base de datos
- Para entender el esquema de datos
- Para conocer los usuarios de prueba
- Al crear migraciones de Prisma

---

### **4. [ARCHITECTURE.md](./ARCHITECTURE.md)** - Arquitectura
**¿Qué contiene?**
- Estructura de carpetas completa
- Frontend: páginas, componentes, lib, types
- Backend: módulos, controllers, services, DTOs
- Documentación: estructura de docs/
- Skills de OpenCode
- Convenciones de código
- Estructura de imports

**Cuándo leerlo:**
- Para encontrar dónde está un archivo
- Al crear nuevos módulos/componentes
- Para entender la organización del código
- Para seguir convenciones de nombres

---

## 🎯 Flujo de Lectura Recomendado

### **Para nuevos desarrolladores**:
1. **OVERVIEW.md** - Entender qué es el proyecto
2. **STACK.md** - Conocer las tecnologías
3. **DATABASE.md** - Entender los datos
4. **ARCHITECTURE.md** - Navegar el código

### **Para agentes de IA**:
1. **OVERVIEW.md** - Contexto general
2. **ARCHITECTURE.md** - Estructura de archivos
3. **STACK.md** - Tecnologías y versiones (cuando sea necesario)
4. **DATABASE.md** - Esquema de datos (cuando trabajes con DB)

### **Para trabajo específico**:
- **Trabajando en frontend**: ARCHITECTURE.md → STACK.md (sección Frontend)
- **Trabajando en backend**: ARCHITECTURE.md → DATABASE.md → STACK.md (sección Backend)
- **Creando nuevo módulo**: ARCHITECTURE.md (convenciones) + Skill `backend-module`
- **Debugging**: ARCHITECTURE.md (encontrar archivo) + Skill `error-debugging`

---

## 🔗 Referencias Cruzadas

### **Desde este contexto**:
- **Decisions**: `../decisions/` - ADRs de decisiones técnicas
- **Roadmap**: `../roadmap/` - Planificación y próximos pasos
- **Sesiones**: `../sessions/` - Informes de trabajo
- **Guía principal**: `../../AGENTS.md` - Comandos y guía de desarrollo
- **Reglas**: `../../.github/copilot/rules.md` - Reglas fijas

### **Hacia otros documentos**:
- **OVERVIEW.md** → referencia a STACK.md, DATABASE.md, ARCHITECTURE.md
- **STACK.md** → referencia a documentación oficial de frameworks
- **DATABASE.md** → referencia a ARCHITECTURE.md, `../../AGENTS.md`
- **ARCHITECTURE.md** → referencia a todos los demás archivos

---

## 📊 Estadísticas de Documentación

| Archivo | Líneas | Contenido Principal |
|---------|--------|---------------------|
| OVERVIEW.md | ~150 | Resumen ejecutivo, funcionalidades, estado |
| STACK.md | ~300 | Tecnologías, versiones, dependencias |
| DATABASE.md | ~250 | Modelos, enums, relaciones, usuarios |
| ARCHITECTURE.md | ~400 | Estructura de archivos, convenciones |

**Total**: ~1,100 líneas de documentación contextual

---

## ✅ Mantenimiento

**Actualizar cuando**:
- Se complete una nueva fase del proyecto → OVERVIEW.md
- Se agregue/actualice una dependencia → STACK.md
- Se modifique el schema de Prisma → DATABASE.md
- Se cree nueva carpeta/módulo → ARCHITECTURE.md

**Frecuencia de actualización**: Al finalizar cada sesión de desarrollo

**Responsable**: El desarrollador/IA que realiza los cambios

---

## 🎓 Tips de Uso

1. **Búsqueda rápida**: Usa Ctrl+F en el archivo correspondiente
2. **Navegación**: Los archivos tienen enlaces internos y externos
3. **Actualización**: Mantén los archivos sincronizados con el código
4. **Consulta frecuente**: Mantén ARCHITECTURE.md a mano para encontrar archivos

---

**Última actualización**: 30 Enero 2026  
**Versión**: 0.4.0

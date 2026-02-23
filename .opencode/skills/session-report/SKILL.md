# 📝 Session Report Skill

> **Propósito**: Automatizar la generación de informes de sesión siguiendo el formato establecido en `docs/sessions/`.
> **Basado en**: `.github/copilot/rules.md` sección 3 + análisis de informes existentes

---

## 📋 ¿Cuándo usar este Skill?

Invoca este skill cuando:
- **Al FINALIZAR una sesión de desarrollo** (NO durante)
- Necesites documentar cambios significativos
- Hayas completado una fase/feature importante
- Quieras crear el informe mensual

**Comando de invocación**: `/session-report` o "generar informe de sesión"

---

## 🎯 Workflow del Skill

### **PASO 1: Recopilar Información de la Sesión**

**Información a recolectar:**

#### a) **Cambios de Código Significativos**
```markdown
- [ ] Nuevos módulos/funcionalidades implementadas
- [ ] Fixes de bugs críticos realizados
- [ ] Cambios de arquitectura aplicados
- [ ] Decisiones de diseño tomadas
```

#### b) **Problemas Encontrados y Soluciones**
```markdown
- [ ] Errores importantes que se resolvieron
- [ ] Conflictos de dependencias solucionados
- [ ] Problemas de configuración arreglados
- [ ] **⚠️ CRÍTICO: Qué soluciones NO funcionaron** (evitar repetir)
```

#### c) **Configuraciones Nuevas**
```markdown
- [ ] Nuevos MCPs agregados
- [ ] Nuevas dependencias instaladas
- [ ] Cambios en scripts de NPM
- [ ] Actualizaciones de versiones
```

---

### **PASO 2: Determinar Nombre y Ubicación del Archivo**

**Formato de nombre**: `SESION_DD_MES_YYYY.md` (o `DD.md` si está en carpeta de mes)

**Ubicación**:
```bash
# Opción A: Formato actual (raíz de docs/)
docs/SESION_30_ENERO_2026.md

# Opción B: Organizado por mes (recomendado para futuro)
docs/sessions/2026/01-ENERO/SESION_30.md
# o simplemente:
docs/sessions/2026/01-ENERO/30.md
```

**Determinar ubicación:**
1. Si `docs/sessions/` existe → Usar estructura organizada
2. Si no existe → Usar formato actual en `docs/`

---

### **PASO 3: Generar Contenido del Informe**

**Estructura del informe** (basada en informes existentes):

```markdown
# Informe de Sesión - [Fecha Completa]

## 📅 Información de Sesión
- **Fecha**: [DD de Mes de YYYY]
- **Duración**: [X horas]
- **Objetivo Principal**: [Descripción breve]
- **Estado del Proyecto Antes**: [Fase X - Y% completado]
- **Estado del Proyecto Después**: [Fase X - Z% completado]

---

## 🎯 Objetivos de la Sesión

### Objetivos Planificados:
1. [Objetivo 1]
2. [Objetivo 2]
3. [Objetivo 3]

### Objetivos Completados:
- ✅ [Objetivo completado 1]
- ✅ [Objetivo completado 2]
- ⏳ [Objetivo parcial]
- ❌ [Objetivo no completado - razón]

---

## 🛠️ Trabajo Realizado

### 1. [Categoría 1: ej. Backend / Frontend / Database]

**Archivos creados:**
- `path/to/new/file1.ts` - [Descripción]
- `path/to/new/file2.tsx` - [Descripción]

**Archivos modificados:**
- `path/to/modified/file1.ts` - [Qué se cambió]
- `path/to/modified/file2.tsx` - [Qué se cambió]

**Funcionalidades implementadas:**
- [Funcionalidad 1]: [Descripción detallada]
- [Funcionalidad 2]: [Descripción detallada]

### 2. [Categoría 2]
[... mismo formato ...]

---

## 🐛 Problemas Encontrados y Soluciones

### Problema 1: [Título del problema]

**Descripción**:
[Explicación del problema]

**Archivo afectado**: `path/to/file.ts:line`

**Error**:
```
[Stack trace o mensaje de error]
```

**❌ Intentos que NO funcionaron**:
1. [Intento 1] → [Por qué falló]
2. [Intento 2] → [Por qué falló]

**✅ Solución que funcionó**:
[Descripción de la solución exitosa]

**Lección aprendida**:
[Qué se aprendió para evitar en futuro]

---

### Problema 2: [Título]
[... mismo formato ...]

---

## 📦 Dependencias y Configuraciones

### Nuevas Dependencias Instaladas:
```json
{
  "package-name": "version",
  "otro-package": "version"
}
```

### Cambios en Configuración:
- **Archivo**: `path/to/config.file`
- **Cambio**: [Descripción]
- **Razón**: [Por qué se hizo]

### MCPs Utilizados:
- ✅ `pgsql` - [Para qué se usó]
- ✅ `chrome-devtools` - [Para qué se usó]
- ✅ `next-devtools` - [Para qué se usó]
- ✅ `context7` - [Para qué se usó]

---

## ✅ Validación y Testing

### Backend:
- [ ] Compilación sin errores (`npm run dev`)
- [ ] Endpoints probados (listar cuáles)
- [ ] get_errors: 0 errores
- [ ] Base de datos verificada

### Frontend:
- [ ] Compilación sin errores (`npm run dev`)
- [ ] Páginas probadas en navegador
- [ ] get_errors: 0 errores
- [ ] Sin errores en consola

### Integración:
- [ ] Flujo end-to-end funcionando
- [ ] WebSocket (si aplica)
- [ ] Autenticación (si aplica)

---

## 📊 Estado del Proyecto

### Progreso General:
- **MVP**: [X%] completado
- **Fase actual**: [Número y nombre]
- **Módulos completados**: [Lista]
- **Módulos en progreso**: [Lista]
- **Módulos pendientes**: [Lista]

### Endpoints Totales:
- **REST**: [Número] endpoints
- **WebSocket**: [Número] eventos
- **Total**: [Número]

### Métricas:
- **Archivos creados esta sesión**: [Número]
- **Archivos modificados esta sesión**: [Número]
- **Líneas de código agregadas**: ~[Número] (estimado)
- **Bugs corregidos**: [Número]

---

## 📝 Próximos Pasos

### Inmediatos (Próxima Sesión):
1. [Tarea 1]
2. [Tarea 2]
3. [Tarea 3]

### Corto Plazo (Esta Semana):
1. [Tarea 1]
2. [Tarea 2]

### Mediano Plazo (Este Mes):
1. [Tarea 1]
2. [Tarea 2]

---

## 🎓 Lecciones Aprendidas

### ✅ Qué Funcionó Bien:
1. [Práctica/herramienta que funcionó]
2. [Workflow efectivo]

### ⚠️ Qué Mejorar:
1. [Área de mejora]
2. [Proceso a optimizar]

### 💡 Descubrimientos:
1. [Nuevo patrón/técnica descubierta]
2. [Best practice identificada]

---

## 📚 Referencias y Recursos

- [Link a documentación consultada]
- [Issue de GitHub relevante]
- [Stack Overflow thread útil]

---

## 🔖 Tags

`#fase-X` `#backend` `#frontend` `#database` `#bug-fix` `#feature` `#refactor`

---

**Fecha de creación**: [DD de Mes de YYYY]  
**Última actualización**: [DD de Mes de YYYY]  
**Versión del proyecto**: [X.Y.Z]
```

---

### **PASO 4: Actualizar Archivos Relacionados**

**Después de crear el informe, actualizar:**

#### a) **docs/sessions/INDEX.md** (si existe)
```markdown
## Índice de Sesiones 2026

### Enero
- **2026-01-30**: [Título breve de la sesión] - [Estado: Completada]
- **2026-01-23**: Notificaciones Real-Time - Completada
- **2026-01-19**: Integración TanStack Query - Completada
```

#### b) **CONTEXTO_PROYECTO.md** (si hubo cambios significativos)
- Actualizar estado de fases
- Actualizar progreso de MVP
- Actualizar lista de módulos completados

#### c) **PROXIMOS_PASOS.md** (siempre)
- Marcar tareas completadas
- Agregar nuevas tareas identificadas
- Actualizar prioridades

---

## 🛠️ Herramientas de Apoyo

### **Comandos útiles para recopilar info:**

```bash
# Ver archivos modificados en la sesión (si hay git)
git diff --name-only HEAD~1

# Contar archivos en directorios
ls -R backend/src/ | wc -l

# Ver últimas commits (si hay git)
git log --oneline -10

# Ver cambios en package.json
git diff HEAD~1 package.json
```

### **MCPs útiles:**
- `pgsql` - Verificar estado de la base de datos
- `chrome-devtools` - Screenshots de UI implementada
- `next-devtools` - Métricas de performance

---

## 📊 Output Esperado

**Al completar este skill, debes tener:**

1. ✅ **Archivo de sesión creado** en ubicación correcta
2. ✅ **Contenido completo** siguiendo la estructura
3. ✅ **Índice actualizado** (si existe `docs/sessions/INDEX.md`)
4. ✅ **CONTEXTO_PROYECTO.md actualizado** (si hubo cambios significativos)
5. ✅ **PROXIMOS_PASOS.md actualizado** con tareas completadas/nuevas

---

## 🎯 Checklist Final

Antes de finalizar el informe, verificar:

- [ ] Título y fecha correctos
- [ ] Todos los objetivos documentados
- [ ] Archivos creados/modificados listados
- [ ] Problemas y soluciones documentados (incluir qué NO funcionó)
- [ ] Testing validado
- [ ] Próximos pasos claros
- [ ] Lecciones aprendidas incluidas
- [ ] Referencias agregadas
- [ ] Archivos relacionados actualizados

---

## 🔗 Referencias

- **Reglas originales**: `.github/copilot/rules.md` (sección 3)
- **Ejemplos de informes**: `docs/SESION_*.md`
- **Formato de índice**: `docs/sessions/INDEX.md` (si existe)

---

## 🎓 Tips y Best Practices

1. **Documentar AL FINALIZAR**: No durante la sesión (distrae)
2. **Incluir qué NO funcionó**: Evita repetir errores en futuro
3. **Ser específico con archivos**: Incluir paths completos
4. **Lecciones aprendidas**: Documenta patrones/técnicas nuevas
5. **Actualizar documentos relacionados**: Mantener consistencia

---

**Última actualización**: 30 Enero 2026  
**Versión**: 1.0.0  
**Autor**: ClientPro CRM Team

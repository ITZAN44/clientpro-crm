# 📚 Documentation Verification Skill

> **Propósito**: Verificar y actualizar la carpeta `docs/` de manera sistemática delegando agentes especializados por subcarpeta.
> **Uso**: Al finalizar sesiones de desarrollo para mantener documentación sincronizada.

---

## 📋 ¿Cuándo usar este Skill?

Invoca este skill cuando:

- **Al FINALIZAR una sesión de desarrollo** (después de completar trabajo)
- Hayas realizado cambios significativos en el código
- Completes una fase/subfase importante del roadmap
- Necesites asegurar que toda la documentación esté actualizada

**Comando de invocación**: `/verify-docs` o "verificar documentación" o "actualizar docs"

---

## 🎯 Workflow Principal

### **IMPORTANTE: Principios de Actualización**

**Estilo de documentación:**

- ✅ **Conciso**: Directo al grano, sin rodeos
- ✅ **Detallado**: Información técnica completa pero estructurada
- ✅ **Entendible**: Claro y fácil de comprender
- ❌ **Sin explayarse**: No agregar relleno innecesario

**Criterios para actualizar:**

1. **Solo actualizar si es necesario**: No modificar por modificar
2. **Errores importantes**: Solo documentar errores críticos/persistentes
   - ✅ Error que tomó >2 horas resolver
   - ✅ Error que se repitió múltiples veces
   - ✅ Error con solución no obvia
   - ❌ Errores comunes/triviales (typos, imports olvidados)
3. **Eliminar información obsoleta**: Si algo ya no aplica, remover
4. **Agregar descubrimientos clave**: Patrones, decisiones arquitectónicas

---

## 🔄 Arquitectura del Skill

Este skill funciona como **Orquestador Central** que delega a agentes especializados:

```
┌─────────────────────────────────────────┐
│   AGENTE PRINCIPAL (Orquestador)        │
│   - Lee contexto de la sesión           │
│   - Detecta qué carpetas actualizar     │
│   - Delega a agentes especializados     │
│   - Consolida resultados                │
└──────────────┬──────────────────────────┘
               │
    ┌──────────┴────────┬────────┬────────┬────────┐
    │                   │        │        │        │
    ▼                   ▼        ▼        ▼        ▼
┌────────┐        ┌─────────┐ ┌────────┐ ┌───────────┐ ┌──────────┐
│Context │        │Decisions│ │ Guides │ │  Roadmap  │ │ Sessions │
│ Agent  │        │  Agent  │ │ Agent  │ │   Agent   │ │  Agent   │
└────────┘        └─────────┘ └────────┘ └───────────┘ └──────────┘
    │                   │        │        │              │
    ▼                   ▼        ▼        ▼              ▼
docs/context/     docs/decisions/ docs/guides/ docs/roadmap/ docs/sessions/
```

---

## 📁 Agentes Especializados

### **1. Context Agent** (`docs/context/`)

**Responsabilidad**: Mantener el estado actual del proyecto sincronizado.

**Archivos a verificar:**

- `OVERVIEW.md` - Estado general del proyecto
- `STACK.md` - Stack tecnológico
- Cualquier archivo nuevo que represente contexto del proyecto

**Criterios de actualización:**

- ✅ Cambio de versión del proyecto (0.7.3 → 0.7.4)
- ✅ Cambio en porcentaje de Backend/Frontend Roadmap
- ✅ Nuevas tecnologías agregadas al stack
- ✅ Cambios en estructura de carpetas importante
- ✅ Nuevos módulos implementados
- ❌ Cambios menores en archivos existentes

**Prompt interno:**

```
Revisa el contexto de trabajo de esta sesión.
Analiza si hubo cambios significativos en:
- Versión del proyecto
- Porcentaje de completitud (Backend/Frontend Roadmap)
- Stack tecnológico (nuevas dependencias importantes)
- Módulos implementados

Si hubo cambios significativos:
1. Actualiza OVERVIEW.md con información concisa
2. Actualiza STACK.md si se agregaron tecnologías nuevas
3. Usa formato directo y entendible

Si NO hubo cambios significativos:
- Reporta "No requiere actualización"
```

---

### **2. Decisions Agent** (`docs/decisions/`)

**Responsabilidad**: Documentar decisiones arquitectónicas (ADRs).

**Archivos a verificar:**

- `README.md` - Índice de ADRs
- ADRs individuales (`001-*.md`, `002-*.md`, etc.)

**Criterios para CREAR nuevo ADR:**

- ✅ Decisión arquitectónica significativa tomada
- ✅ Cambio de tecnología principal (ej: migrar de X a Y)
- ✅ Problema crítico resuelto con solución no obvia
- ✅ Patrón de diseño adoptado que afecta múltiples módulos
- ❌ Implementación estándar de feature
- ❌ Bugfix menor

**Prompt interno:**

```
Analiza el trabajo realizado en esta sesión.
Pregunta crítica: ¿Se tomó alguna decisión arquitectónica importante?

Ejemplos de decisiones importantes:
- Cambiar de cache-manager a ioredis directo
- Adoptar nuevo patrón de diseño en todo el proyecto
- Migrar de tecnología X a tecnología Y
- Resolver problema crítico que afectó múltiples intentos

Si se tomó una decisión importante:
1. Crea nuevo ADR con número secuencial
2. Usa formato ADR estándar (Context, Decision, Consequences)
3. Actualiza README.md con entrada en el índice
4. Incluye SOLO errores críticos en "Alternativas descartadas"

Si NO hubo decisión arquitectónica:
- Reporta "No requiere nuevo ADR"
```

---

### **3. Guides Agent** (`docs/guides/`)

**Responsabilidad**: Mantener guías técnicas actualizadas.

**Archivos a verificar:**

- `README.md` - Índice de guías
- `CACHING.md` - Guía de caching (si aplica)
- `docker/DOCKER.md` - Guía de Docker (si aplica)
- `git/GIT_WORKFLOW.md` - Flujo Git (si aplica)
- `git/GIT_HOOKS.md` - Hooks Git (si aplica)
- `ci-cd/GITHUB_ACTIONS.md` - CI/CD (si aplica)
- Cualquier guía nueva necesaria

**Criterios de actualización:**

- ✅ Nueva funcionalidad que requiere guía de uso
- ✅ Cambio en configuración de Docker/Git/CI-CD
- ✅ Nueva herramienta agregada al stack
- ✅ Corrección de información incorrecta en guía existente
- ❌ Cambios cosméticos en código

**Prompt interno:**

```
Revisa el trabajo realizado en esta sesión.
Analiza si alguna guía existente necesita actualización:

Chequear:
1. ¿Se modificó Docker Compose? → Verificar docker/DOCKER.md
2. ¿Se implementó sistema de cache? → Verificar CACHING.md
3. ¿Se cambió flujo Git o hooks? → Verificar git/
4. ¿Se agregó CI/CD workflow? → Verificar ci-cd/
5. ¿Se agregó nueva tecnología que requiere guía?

Si una guía necesita actualización:
- Actualiza SOLO la sección relevante
- Usa lenguaje técnico pero claro
- Incluye ejemplos de código si es necesario

Si NO hay guías que actualizar:
- Reporta "Guías actualizadas, no requieren cambios"
```

---

### **4. Roadmap Agent** (`docs/roadmap/`)

**Responsabilidad**: Mantener roadmap sincronizado con progreso real.

**Archivos a verificar:**

- `BACKLOG.md` - Estado actual de tareas pendientes
- `COMPLETED.md` - Historial de completados
- Archivos específicos del roadmap (backend, frontend, etc.)

**Criterios de actualización:**

- ✅ Subfase completada (ej: 6.4 - Redis Caching)
- ✅ Nueva funcionalidad agregada al backlog
- ✅ Cambio de prioridad en tareas
- ✅ Fase completada
- ❌ Trabajo en progreso sin completar subfase

**Prompt interno:**

```
Analiza el trabajo realizado en esta sesión.
Pregunta clave: ¿Se completó alguna subfase o fase del roadmap?

Si se completó subfase:
1. Marca subfase como completada en BACKLOG.md
2. Agrega entrada detallada en COMPLETED.md con:
   - Fecha de completitud
   - Archivos modificados/creados
   - Funcionalidades implementadas
   - Errores críticos resueltos (si aplica)
3. Actualiza porcentaje de completitud

Si NO se completó subfase:
- Reporta "Roadmap sin cambios, trabajo en progreso"

IMPORTANTE: Solo actualizar si subfase/fase está 100% completa y funcional.
```

---

### **5. Sessions Agent** (`docs/sessions/`)

**Responsabilidad**: Crear informe de la sesión finalizada.

**Archivos a crear:**

- Nueva sesión en estructura `sessions/2026/02-FEBRERO/27.md`
- O formato alternativo según estructura existente

**Criterios para crear sesión:**

- ✅ SIEMPRE crear al finalizar sesión de desarrollo
- ✅ Documentar trabajo significativo realizado
- ✅ Incluir problemas críticos resueltos
- ❌ No crear si solo se hicieron consultas sin código

**Prompt interno:**

```
Crea informe de sesión con el trabajo realizado.

Estructura del informe:
1. Goal - ¿Qué se intentó lograr?
2. Instructions - Preferencias del usuario (idioma, estilo)
3. Discoveries - Problemas críticos encontrados
   - SOLO errores que tomaron >1 hora resolver
   - Soluciones que NO funcionaron (importante)
4. Accomplished - Qué se completó
   - Archivos creados/modificados/eliminados
   - Funcionalidades implementadas
   - Tests ejecutados
5. Relevant files - Archivos clave modificados

IMPORTANTE:
- Usar lenguaje conciso, directo, técnico
- NO explayarse en detalles triviales
- Enfocarse en qué se logró y problemas importantes
- Incluir métricas reales (tiempos, porcentajes)
```

---

## 🔧 Implementación del Orquestador

### **PASO 1: Analizar Contexto de la Sesión**

```typescript
// Pseudo-código del orquestador

function verificarDocumentacion(contextoSesion) {
  // 1. Leer qué se hizo en la sesión
  const trabajoRealizado = analizarContexto(contextoSesion);

  // 2. Determinar qué agentes llamar
  const agentesAEjecutar = determinarAgentes(trabajoRealizado);

  // 3. Ejecutar agentes en paralelo
  const resultados = await Promise.all(
    agentesAEjecutar.map((agente) => agente.ejecutar(trabajoRealizado))
  );

  // 4. Consolidar y reportar
  return consolidarResultados(resultados);
}

function determinarAgentes(trabajo) {
  const agentes = [];

  // Context Agent: Si cambió versión, stack, o módulos
  if (trabajo.versionCambio || trabajo.nuevoModulo || trabajo.stackCambio) {
    agentes.push(ContextAgent);
  }

  // Decisions Agent: Si hubo decisión arquitectónica
  if (trabajo.decisionArquitectonica || trabajo.problemaCritico) {
    agentes.push(DecisionsAgent);
  }

  // Guides Agent: Si se modificó Docker, cache, git, ci-cd
  if (trabajo.cambiosInfraestructura || trabajo.nuevaHerramienta) {
    agentes.push(GuidesAgent);
  }

  // Roadmap Agent: Si se completó subfase/fase
  if (trabajo.subfaseCompletada || trabajo.faseCompletada) {
    agentes.push(RoadmapAgent);
  }

  // Sessions Agent: SIEMPRE ejecutar al final de sesión
  agentes.push(SessionsAgent);

  return agentes;
}
```

---

## 📊 Output Esperado

Al completar este skill, el agente debe reportar:

```markdown
## 📚 Verificación de Documentación Completada

### Agentes Ejecutados:

- ✅ Context Agent: OVERVIEW.md actualizado (versión 0.7.3 → 0.7.4)
- ✅ Decisions Agent: Nuevo ADR-009 creado (redis-caching-ioredis.md)
- ✅ Guides Agent: CACHING.md actualizado, DOCKER.md actualizado
- ✅ Roadmap Agent: Subfase 6.4 marcada como completada
- ✅ Sessions Agent: Sesión 2026-02-27 creada

### Archivos Actualizados:

- docs/context/OVERVIEW.md (versión + score)
- docs/context/STACK.md (Redis Cache agregado)
- docs/decisions/009-redis-caching-ioredis.md (NUEVO)
- docs/decisions/README.md (índice actualizado)
- docs/guides/CACHING.md (correcciones)
- docs/guides/docker/DOCKER.md (troubleshooting Redis)
- docs/roadmap/BACKLOG.md (subfase 6.4 completada)
- docs/roadmap/COMPLETED.md (entrada 6.4 agregada)
- docs/sessions/2026/02-FEBRERO/27.md (NUEVO)

### Archivos Sin Cambios:

- docs/guides/git/ (no hubo cambios en Git)
- docs/guides/ci-cd/ (no hubo cambios en CI/CD)

### Resumen:

✅ 9 archivos actualizados/creados
✅ Documentación sincronizada al 100%
✅ Sin información obsoleta detectada
```

---

## 🎯 Checklist de Ejecución

Antes de finalizar, verificar:

- [ ] **Context Agent** ejecutado (si aplica)
  - [ ] OVERVIEW.md con versión correcta
  - [ ] STACK.md con tecnologías actualizadas
- [ ] **Decisions Agent** ejecutado (si aplica)
  - [ ] Nuevo ADR creado con número secuencial
  - [ ] README.md actualizado con entrada en índice
- [ ] **Guides Agent** ejecutado (si aplica)
  - [ ] Guías relevantes actualizadas
  - [ ] Información técnica correcta
- [ ] **Roadmap Agent** ejecutado (si aplica)
  - [ ] BACKLOG.md con subfase marcada
  - [ ] COMPLETED.md con entrada detallada
  - [ ] Porcentajes actualizados
- [ ] **Sessions Agent** ejecutado (SIEMPRE)
  - [ ] Informe de sesión creado
  - [ ] Goal, Discoveries, Accomplished documentados
  - [ ] Relevant files listados

- [ ] **Reporte Final**
  - [ ] Lista de archivos actualizados
  - [ ] Lista de archivos sin cambios
  - [ ] Resumen consolidado

---

## 💡 Tips y Best Practices

### **Para el Orquestador:**

1. **No ejecutar todos los agentes siempre**: Solo los necesarios
2. **Ejecutar en paralelo cuando sea posible**: Optimizar tiempo
3. **Sessions Agent siempre último**: Depende de otros agentes
4. **Reportar qué NO cambió**: Transparencia con el usuario

### **Para Agentes Especializados:**

1. **Leer antes de escribir**: Entender contexto actual
2. **Solo actualizar si es necesario**: Evitar ruido en git
3. **Mantener consistencia**: Seguir formato de documentos existentes
4. **Ser específico**: Paths completos, números de línea cuando aplique

### **Para Documentación:**

1. **Errores críticos solo**: No documentar errores triviales
2. **Eliminar información obsoleta**: Mantener docs limpios
3. **Lenguaje técnico pero claro**: Balance entre precisión y comprensión
4. **Estructura jerárquica**: Títulos, subtítulos, bullets

---

## 🔗 Referencias

- **Session Report Skill**: `.opencode/skills/session-report/SKILL.md`
- **Reglas de documentación**: `.github/copilot/rules.md` (sección 3)
- **Estructura de docs**: `docs/README.md`
- **ADR Template**: `docs/decisions/README.md`

---

## 🚀 Ejemplo de Uso

```bash
# Usuario invoca el skill
Usuario: "Verificar documentación"

# Agente orquestador analiza contexto
Agente: [Analizando trabajo realizado en esta sesión...]
        - Versión cambió de 0.7.3 a 0.7.4 ✓
        - Redis Cache implementado ✓
        - Decisión crítica: ioredis vs cache-manager ✓
        - Docker Compose actualizado ✓
        - Subfase 6.4 completada ✓

# Agente determina qué ejecutar
Agente: [Ejecutando agentes necesarios...]
        → Context Agent (cambio de versión)
        → Decisions Agent (decisión arquitectónica)
        → Guides Agent (Docker y Cache)
        → Roadmap Agent (subfase completada)
        → Sessions Agent (fin de sesión)

# Agente ejecuta en paralelo (donde aplique)
[Context Agent ejecutándose...]
[Decisions Agent ejecutándose...]
[Guides Agent ejecutándose...]
[Roadmap Agent ejecutándose...]

# Agente reporta resultados
Agente: ✅ Verificación completada
        9 archivos actualizados
        Documentación sincronizada al 100%
```

---

**Última actualización**: 27 Febrero 2026  
**Versión**: 1.0.0  
**Autor**: ClientPro CRM Team

# 📚 Documentation Verification Skill

Skill para verificar y actualizar sistemáticamente la carpeta `docs/` mediante agentes especializados.

## 🎯 Propósito

Mantener la documentación del proyecto sincronizada con el código mediante un sistema de agentes que:

- **Detectan** qué carpetas necesitan actualización
- **Delegan** trabajo a agentes especializados
- **Actualizan** solo lo necesario con información concisa y técnica
- **Eliminan** información obsoleta
- **Documentan** solo errores críticos/persistentes

## 🚀 Uso Rápido

```bash
# Invocar el skill
/verify-docs

# O simplemente preguntar
"Verificar documentación"
"Actualizar docs"
```

## 📁 Estructura de Agentes

```
Orquestador Principal
    ├── Context Agent      → docs/context/
    ├── Decisions Agent    → docs/decisions/
    ├── Guides Agent       → docs/guides/
    ├── Roadmap Agent      → docs/roadmap/
    └── Sessions Agent     → docs/sessions/
```

## 📚 Documentación Completa

Ver `SKILL.md` para documentación completa con:

- Workflow detallado de cada agente
- Criterios de actualización
- Prompts internos de cada agente
- Ejemplos de uso
- Best practices

## ✅ Lo que hace BIEN

- ✅ Solo actualiza lo necesario
- ✅ Información concisa, directa, técnica
- ✅ Elimina información obsoleta
- ✅ Solo documenta errores críticos (no triviales)
- ✅ Ejecuta agentes en paralelo cuando aplica
- ✅ Reporta qué cambió y qué no

## ❌ Lo que NO hace

- ❌ No actualiza si no es necesario
- ❌ No documenta errores triviales
- ❌ No se explaya con información innecesaria
- ❌ No ejecuta agentes innecesarios
- ❌ No modifica documentación por modificar

## 📊 Output Típico

```
✅ Context Agent: OVERVIEW.md actualizado
✅ Decisions Agent: Nuevo ADR-009 creado
✅ Guides Agent: CACHING.md actualizado
✅ Roadmap Agent: Subfase 6.4 completada
✅ Sessions Agent: Sesión 2026-02-27 creada

9 archivos actualizados
Documentación sincronizada al 100%
```

---

**Ver**: `SKILL.md` para documentación completa

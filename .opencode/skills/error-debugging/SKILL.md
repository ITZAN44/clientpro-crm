# 🐛 Error Debugging Skill

> **Propósito**: Workflow sistemático para debugging con estrategia de pivote después de 2-3 intentos fallidos.
> **Basado en**: `.github/copilot/rules.md` sección 1 y 1.1

---

## 📋 ¿Cuándo usar este Skill?

Invoca este skill cuando:
- Encuentres un error de compilación/runtime/linting
- Un bug persista después de 1-2 intentos
- Necesites un approach sistemático para resolver un problema

**Comando de invocación**: `/debug-error` o menciona "aplicar skill de debugging"

---

## 🎯 Workflow del Skill

### **PASO 1: Identificar Origen Exacto (Primer Intento)**

**Información requerida:**
```
❌ MAL: "Hay un error en el frontend"
✅ BIEN: "Error en frontend/app/clientes/page.tsx línea 45: Cannot read property 'nombre' of undefined"
```

**Checklist obligatorio:**
- [ ] ¿Cuál es el archivo exacto?
- [ ] ¿Cuál es la línea exacta?
- [ ] ¿Cuál es el mensaje completo de error?
- [ ] ¿Es un error de compilación, runtime o linting?
- [ ] ¿Hay stack trace disponible?

**Acción:**
```bash
# Usar get_errors tool (CRÍTICO para TypeScript)
get_errors(['ruta/al/archivo/modificado'])
```

---

### **PASO 2: Verificar Archivos Relacionados**

**Antes de proponer solución, leer:**
1. ✅ Archivo con el error
2. ✅ Archivos importados/relacionados
3. ✅ Tipos/interfaces usadas
4. ✅ Dependencias del módulo

**Ejemplo:**
```typescript
// Error en: app/clientes/page.tsx
// ✅ Verificar también:
// - types/cliente.ts (interfaces)
// - lib/api/clientes.ts (funciones API)
// - components/cliente-*.tsx (componentes)
```

---

### **PASO 3: Buscar Errores Similares Previos**

**Pasos:**
1. Buscar en `docs/sessions/` (archivos SESION_*.md)
2. Revisar si el error ya fue resuelto
3. Aplicar la misma solución si es aplicable
4. Si es nuevo → Documentar para futuras referencias

**Comando sugerido:**
```bash
# Buscar en sesiones anteriores
grep -r "error_message" docs/sessions/
```

---

### **PASO 4: Aplicar Solución y Validar**

**Después de aplicar fix:**
- [ ] **Ejecutar `get_errors` nuevamente** (validar compilación TypeScript)
- [ ] Compilar sin errores (`npm run dev`)
- [ ] Ejecutar y probar funcionalidad
- [ ] Verificar que no rompió otras funcionalidades
- [ ] Revisar en navegador (si es frontend)

---

### **PASO 5: ⚠️ PIVOTE - Si Error Persiste (Después 2-3 Intentos)**

**🚨 REGLA CRÍTICA: NO INSISTIR EN LO MISMO**

Si después de 2-3 intentos similares el error persiste:

#### **1. Reconocer el Patrón:**
```
❌ "Ya intenté 3 veces con el mismo approach"
✅ "Necesito probar una solución COMPLETAMENTE diferente"
```

#### **2. Alternativas a Explorar:**
- [ ] **Documentación oficial** (usar MCP `context7`)
- [ ] **Issues de GitHub** del paquete/framework
- [ ] **Approach completamente diferente** (ej: cambiar arquitectura)
- [ ] **Simplificar código** para aislar el problema
- [ ] **Logs más detallados** (console.log, debugger)
- [ ] **Verificar versiones de dependencias** (package.json)
- [ ] **Rollback temporal** a versión que funcionaba

#### **3. Registrar Intentos Fallidos:**
```markdown
## Intentos que NO funcionaron:
- **Intento 1**: Cambiar tipo de X a Y → Mismo error
- **Intento 2**: Agregar validación Z → Error persiste  
- **Intento 3**: Refactorizar función → No resuelve

## Solución alternativa que funcionó:
- Cambiar el approach completo usando [nueva estrategia]
- Razón: [explicar por qué los intentos anteriores fallaron]
```

#### **4. Criterios de Pivote:**
- ✅ **Cambiar enfoque** si 2 intentos con mismo pattern fallan
- ✅ **Ser flexible y creativo** con soluciones
- ✅ **No esperar resultados diferentes** haciendo lo mismo
- ✅ **Investigar causas raíz** en lugar de síntomas

---

## 🛠️ Herramientas Obligatorias

### **get_errors Tool (CRÍTICO)**

**Cuándo usar:**
- ✅ Después de cada modificación de código (TypeScript)
- ✅ Antes de ejecutar testing manual
- ✅ Para validar que una solución funcionó
- ✅ Al trabajar con Prisma (tipos generados)
- ✅ Después de instalar paquetes

**Workflow:**
```bash
1. Modificar código
2. Ejecutar get_errors(['ruta/al/archivo'])
3. Si hay errores → Corregir inmediatamente
4. Si 0 errores → Proceder a testing manual
5. Repetir ciclo
```

**Errores comunes que detecta:**
- Tipos incorrectos en DTOs
- Enums no sincronizados con Prisma
- Imports faltantes o incorrectos
- Propiedades inexistentes en interfaces
- Argumentos faltantes en funciones

---

## 📊 Output Esperado

**Al completar este skill, debes tener:**

1. ✅ **Error resuelto** o **alternativa documentada**
2. ✅ **Compilación exitosa** (0 errores en `get_errors`)
3. ✅ **Testing manual exitoso** (funcionalidad confirmada)
4. ✅ **Documentación de intentos** (qué funcionó, qué NO funcionó)

**Formato de documentación:**
```markdown
## Error Resuelto: [Descripción breve]

**Archivo afectado**: `path/to/file.ts:line`

**Error original**:
```
[Stack trace completo]
```

**Intentos realizados**:
1. [Intento 1] → [Resultado]
2. [Intento 2] → [Resultado]
3. [Intento 3 - PIVOTE] → ✅ **Funcionó**

**Solución aplicada**:
[Explicación detallada]

**Validación**:
- ✅ get_errors: 0 errores
- ✅ Compilación: Sin errores
- ✅ Testing: Funcionalidad confirmada
```

---

## 🔗 Referencias

- **Reglas originales**: `.github/copilot/rules.md` (sección 1, 1.1)
- **MCPs útiles**: `context7` (documentación), `pgsql` (DB), `chrome-devtools` (frontend)
- **Archivos relacionados**: `docs/sessions/` (errores previos)

---

## 🎓 Tips y Best Practices

1. **Primera vez**: Ser metódico con el checklist completo
2. **Segunda vez**: Si mismo error, revisar assumptions
3. **Tercera vez**: CAMBIAR ESTRATEGIA (no insistir)
4. **Siempre**: Usar `get_errors` antes de testing manual
5. **Documentar**: Qué NO funcionó (evitar repetir en futuro)

---

**Última actualización**: 30 Enero 2026  
**Versión**: 1.0.0  
**Autor**: ClientPro CRM Team

# ADR-006: Elegir Semgrep para Análisis Estático de Código

**Estado**: Aceptado  
**Fecha**: 3 de febrero de 2026  
**Autores**: Equipo de desarrollo ClientPro  
**Etiquetas**: backend, devops, code-quality, static-analysis, security

---

## 📋 Contexto

### **Problema**

Después de 4 fases de desarrollo (setup, CRUD, dashboard, notificaciones), el backend de ClientPro CRM tiene:
- **8 módulos** NestJS con ~48 archivos TypeScript
- Código escrito por múltiples sesiones de Agentic Coding (IA)
- Patrones inconsistentes (console.log, async sin Promise<T>, magic numbers)
- Riesgo de seguridad (secrets hardcodeados, SQL injection potencial)
- Sin validación automática de calidad de código más allá de ESLint

### **Necesidad**

Queremos:
1. **Calidad**: Detectar code smells (console.log, magic numbers)
2. **Consistencia**: Validar patrones NestJS (@ApiTags, return types)
3. **Seguridad**: Prevenir secrets hardcodeados, SQL injection
4. **Educación**: Enseñar mejores prácticas al equipo/IA
5. **No bloquear**: Herramienta opcional, no obligatoria

### **Restricciones**

- Solo backend (NestJS + Prisma + TypeScript)
- No queremos herramienta pesada/costosa
- Debe integrarse con VS Code/Copilot (MCP)
- Reglas personalizables para nuestro stack
- Ejecución rápida (<10 segundos)

---

## 🎯 Decisión

**Elegimos Semgrep** como herramienta de análisis estático de código para el backend.

### **Alcance**

- **Target**: Solo `backend/` (NestJS + TypeScript)
- **Reglas**: 9 reglas personalizadas en `.semgrep/backend-rules.yaml`
- **Uso**: Opcional pre-commit, recomendado antes de PRs
- **Integración**: MCP (`mcp-server-semgrep`) + scripts npm

### **Implementación**

1. **Instalación**: Semgrep CLI v1.150.0 vía `pip install semgrep`
2. **MCP**: Configurado en `.mcp.json` y `opencode.jsonc`
3. **Reglas**: 9 custom rules en `.semgrep/backend-rules.yaml`
4. **Scripts**: `npm run scan`, `scan:detailed`, `scan:json`
5. **Documentación**: Ver comandos y uso en `/AGENTS.md`

### **9 Reglas Personalizadas**

| Categoría | Regla | Severidad |
|-----------|-------|-----------|
| **Calidad** | no-console-log-backend | WARNING |
| **Calidad** | no-console-error-backend | WARNING |
| **Calidad** | magic-numbers-config | INFO |
| **Consistencia** | controller-missing-api-tags | INFO |
| **Seguridad** | hardcoded-secrets | ERROR |
| **Seguridad** | sql-injection-risk | ERROR |
| **Seguridad** | jwt-missing-expiration | WARNING |
| **Best Practices** | prisma-findunique-no-null-check | WARNING |
| **Estructura** | async-method-missing-promise-return | INFO |

---

## ✅ Consecuencias

### **Positivas**

1. **Detección temprana de problemas**
   - Secrets hardcodeados detectados antes de commit
   - Console.log descubiertos automáticamente
   - Patrones inseguros identificados

2. **Mejora de calidad de código**
   - Consistencia en decoradores NestJS (@ApiTags)
   - Tipos explícitos en métodos async (Promise<T>)
   - Eliminación gradual de magic numbers

3. **Educación del equipo/IA**
   - Mensajes claros de por qué algo es problema
   - Ejemplos de cómo corregir
   - Aprendizaje incremental

4. **Rápido y ligero**
   - ~5-10 segundos para escanear todo el backend
   - No requiere compilación
   - No afecta velocidad de desarrollo

5. **Personalizable**
   - Reglas en YAML fácil de editar
   - Agregar/modificar reglas sin reinstalar nada
   - Severidades ajustables (ERROR, WARNING, INFO)

6. **Integración con workflow**
   - Scripts npm (`npm run scan`)
   - MCP para VS Code/Copilot
   - Exportable a JSON para CI/CD

### **Negativas / Trade-offs**

1. **No reemplaza ESLint**
   - Semgrep es complementario, no sustituto
   - ESLint sigue siendo necesario para linting general
   - Dos herramientas = más complejidad

2. **Curva de aprendizaje**
   - Sintaxis de reglas YAML no es trivial
   - Patterns de Semgrep tienen su propia lógica
   - Requiere documentación (creamos STATIC_ANALYSIS.md)

3. **False positives**
   - Algunos findings son válidos (ej. console.log en tests)
   - Requiere juicio humano para ignorar
   - Puede generar "fatiga de warnings"

4. **Solo backend**
   - Frontend (Next.js) no está cubierto
   - Decisión consciente por ahora, puede cambiar

5. **Opcional = puede ser ignorado**
   - No es obligatorio pre-commit
   - Depende de disciplina del equipo
   - Futuro: considerar hacer obligatorio en CI/CD

---

## 🔄 Alternativas Consideradas

### **1. ESLint con Reglas Custom**

**Pros**:
- Ya está instalado y configurado
- Muy conocido por el equipo
- Integración perfecta con VS Code
- Plugins para NestJS, TypeScript

**Contras**:
- Plugins de ESLint son complejos de escribir (requiere AST knowledge)
- Menos expresivo para patrones complejos (ej. SQL injection)
- No tan bueno para análisis de seguridad
- Difícil detectar hardcoded secrets con ESLint

**Por qué no**: Escribir reglas custom de ESLint es mucho más difícil que YAML de Semgrep.

---

### **2. SonarQube**

**Pros**:
- Suite completa de análisis de código
- Dashboard web profesional
- Muchas reglas out-of-the-box
- Soporte comercial

**Contras**:
- **Pesado**: Requiere servidor (Docker o cloud)
- **Costo**: Free tier limitado, enterprise es caro
- **Complejidad**: Overkill para proyecto pequeño
- **Latencia**: Análisis en servidor, no local

**Por qué no**: Demasiado complejo y pesado para nuestras necesidades. Proyecto aún es pequeño.

---

### **3. CodeQL (GitHub)**

**Pros**:
- Poderoso motor de queries
- Excelente para seguridad (usado por GitHub Security)
- Integración nativa con GitHub Actions
- Gratis para repos públicos

**Contras**:
- **Complejo**: Lenguaje de queries QL es difícil
- **Lento**: Build de base de datos tarda minutos
- **Overhead**: Requiere compilar código
- **No MCP**: Sin integración directa con VS Code

**Por qué no**: Complejidad muy alta, queremos algo simple y rápido.

---

### **4. Checkmarx / Veracode (Comercial)**

**Pros**:
- Soluciones enterprise-grade
- Compliance (OWASP, PCI-DSS)
- Soporte 24/7
- Análisis profundo de seguridad

**Contras**:
- **Costo**: $$$$ muy caro
- **Overkill**: Para proyecto interno pequeño
- **Vendor lock-in**: Difícil migrar
- **Cloud only**: No análisis local

**Por qué no**: Costo prohibitivo, no justificado para proyecto actual.

---

### **5. No Hacer Nada (Status Quo)**

**Pros**:
- Cero esfuerzo
- Sin nueva herramienta que aprender
- Menos complejidad

**Contras**:
- Problemas de calidad persisten
- Secrets hardcodeados pasan desapercibidos
- Inconsistencias aumentan con el tiempo
- Sin educación automática del equipo

**Por qué no**: Los beneficios de análisis estático justifican el esfuerzo mínimo de setup.

---

## 📊 Comparación de Alternativas

| Criterio | Semgrep | ESLint Custom | SonarQube | CodeQL | Comercial |
|----------|---------|---------------|-----------|--------|-----------|
| **Facilidad de reglas** | ✅✅✅ YAML simple | ❌ AST complejo | ⚠️ UI config | ❌ QL language | ⚠️ UI config |
| **Velocidad** | ✅✅ <10s | ✅✅ <5s | ❌ minutos | ❌ minutos | ⚠️ variable |
| **Seguridad** | ✅✅ Excelente | ⚠️ Limitado | ✅✅ Excelente | ✅✅✅ Mejor | ✅✅✅ Mejor |
| **Costo** | ✅✅✅ Gratis | ✅✅✅ Gratis | ⚠️ Free tier | ✅ Gratis* | ❌ $$$ |
| **Complejidad setup** | ✅✅ Bajo | ✅ Bajo | ❌ Alto | ❌ Alto | ❌ Alto |
| **MCP integración** | ✅✅ Sí | ✅ Sí (nativo) | ❌ No | ❌ No | ❌ No |
| **Local execution** | ✅✅ Sí | ✅✅ Sí | ⚠️ Requiere server | ⚠️ Sí pero lento | ❌ Cloud only |
| **Personalización** | ✅✅ Alta | ✅✅ Alta | ⚠️ Media | ✅✅ Alta | ⚠️ Media |

**Ganador**: Semgrep (mejor balance facilidad/poder/costo)

---

## 🔍 Detalles de Implementación

### **Archivos Creados/Modificados**

**Creados**:
1. `.semgrep/backend-rules.yaml` - 9 reglas custom
2. `.semgrep/semgrep.yaml` - Config principal (placeholder)
3. `docs/decisions/006-semgrep-static-analysis.md` - Este ADR

**Modificados**:
1. `.mcp.json` - Agregado servidor semgrep
2. `opencode.jsonc` - Habilitado Semgrep MCP
3. `package.json` - Agregados 3 scripts (scan, scan:detailed, scan:json)
4. `AGENTS.md` - Actualizado checklist pre-commit con Semgrep
5. `README.md` - Agregada sección Semgrep MCP
6. `CHANGELOG.md` - Entrada v0.4.1
7. `docs/decisions/README.md` - ADR-006 indexado

### **Estadísticas del Primer Escaneo**

**Fecha**: 3 febrero 2026  
**Archivos escaneados**: 48  
**Findings totales**: 86

**Por severidad**:
- 🔴 ERROR: 0 (¡bien!)
- ⚠️ WARNING: ~20
- ℹ️ INFO: ~66

**Regla más común**: `async-method-missing-promise-return` (~60 findings)

**Interpretación**: No hay problemas críticos (ERROR), pero hay espacio para mejora en consistencia (INFO).

---

## 📚 Referencias

### **Comandos Semgrep**
Ver todos los comandos disponibles en `/AGENTS.md` sección "Comandos Más Usados > Static Analysis"

### **Decisiones Relacionadas**
- [ADR-001: NestJS Backend](./001-nestjs-backend.md) - Framework analizado
- [ADR-004: Prisma ORM](./004-prisma-orm.md) - Reglas para Prisma

### **Documentación Externa**
- [Semgrep Docs](https://semgrep.dev/docs/)
- [Semgrep Rule Writing](https://semgrep.dev/docs/writing-rules/rule-syntax/)
- [Semgrep Registry](https://semgrep.dev/r) - 2000+ reglas públicas

---

## 🔮 Decisiones Futuras

### **Corto Plazo** (Fase 5-6)

1. **CI/CD Integration** (Fase 6)
   - Ejecutar `npm run scan` en GitHub Actions
   - Bloquear merge si hay findings ERROR
   - Generar reporte de calidad en PRs

2. **Coverage del Frontend** (Futuro)
   - Evaluar si Semgrep es útil para Next.js/React
   - Considerar reglas para hooks, Server Components
   - ADR separado si decidimos implementar

3. **Reglas Adicionales** (Incremental)
   - Detectar try/catch vacíos
   - Validar uso de DTOs en controllers
   - Verificar decoradores @Public() / @Roles()

### **Largo Plazo** (Post-MVP)

1. **Obligatorio en CI/CD**
   - Hacer scan obligatorio (no solo recomendado)
   - Definir umbral de calidad (ej. 0 ERRORs, max 10 WARNINGs)

2. **Métricas de Calidad**
   - Dashboard de tendencias (findings over time)
   - Integración con SonarQube Cloud (si crece el equipo)

3. **Educación Continua**
   - Revisar reglas cada 3 meses
   - Agregar nuevas reglas basadas en code reviews
   - Documentar patrones comunes encontrados

---

## 🎓 Lecciones Aprendidas

### **Durante Implementación**

1. **Paths relativos** (no absolutos)
   - Pattern `backend/src/**/*.ts` NO funciona
   - Usar `*.ts` y ejecutar desde raíz

2. **No emojis en YAML en Windows**
   - Causa `UnicodeEncodeError`
   - Usar solo ASCII en mensajes

3. **Severidades bien pensadas**
   - ERROR solo para críticos (bloquea trabajo)
   - WARNING para importantes (revisar)
   - INFO para educación (no molesta)

4. **Documentación es clave**
   - Sin STATIC_ANALYSIS.md, nadie usaría la herramienta
   - Ejemplos buenos/malos ayudan mucho
   - Troubleshooting ahorra tiempo

### **Filosofía Adoptada**

- **Educar, no bloquear**: INFO/WARNING para enseñar, ERROR solo críticos
- **Opcional pero visible**: No obligatorio pero fácil de ejecutar
- **Evolución gradual**: Empezar con 9 reglas, crecer según necesidad
- **Pragmatismo**: Ignorar false positives con `// nosemgrep`

---

## ✅ Criterios de Éxito

### **Métricas de Adopción** (6 meses)

- [ ] 80%+ de PRs ejecutan `npm run scan` antes de merge
- [ ] 0 findings de severidad ERROR en código nuevo
- [ ] <50% WARNING ignorados sin justificación
- [ ] 3+ reglas nuevas agregadas basadas en necesidades reales

### **Métricas de Calidad** (6 meses)

- [ ] Reducción 50%+ en console.log encontrados en code review
- [ ] 0 secrets hardcodeados lleguen a main
- [ ] 90%+ controllers tienen @ApiTags
- [ ] 80%+ métodos async tienen Promise<T> explícito

### **Métricas de Educación** (3 meses)

- [ ] Equipo conoce las 9 reglas de memoria
- [ ] False positive rate <10%
- [ ] 0 preguntas repetidas sobre "¿por qué Semgrep dice X?"

---

## 🔄 Historial de Revisiones

| Versión | Fecha | Autor | Cambios |
|---------|-------|-------|---------|
| 1.0 | 3 Feb 2026 | Equipo Dev | ADR inicial - Decisión de usar Semgrep |

---

## 📝 Aprobación

**Estado**: ✅ Aceptado  
**Aprobado por**: Equipo de desarrollo ClientPro  
**Fecha de aprobación**: 3 de febrero de 2026  
**Próxima revisión**: Junio 2026 (después de Fase 6)

---

**Fin de ADR-006** | ~280 líneas | Decisión de usar Semgrep para análisis estático

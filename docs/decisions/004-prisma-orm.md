# ADR-004: Elegir Prisma como ORM para Base de Datos

**Estado**: Aceptado  
**Fecha**: 06 de enero de 2026  
**Decisores**: Líder del Proyecto  
**Etiquetas**: backend, database, orm

---

## Contexto

**Antecedentes**:
- Proyecto necesita ORM para interactuar con PostgreSQL
- Requiere migraciones de base de datos versionadas
- Necesidad de type-safety entre base de datos y código TypeScript
- Equipo sin experiencia extensa con SQL crudo

**Requisitos**:
- **Type-safety**: Queries tipadas, sin errores en runtime por typos
- **Migraciones**: Sistema de migraciones versionadas y reversibles
- **Developer Experience**: Autocompletado, IntelliSense, error catching
- **Performance**: Queries optimizadas, N+1 query prevention
- **PostgreSQL específico**: Aprovechar features avanzadas de PostgreSQL
- **Schema-first**: Schema declarativo fácil de entender y versionar

**Restricciones**:
- Debe integrarse fácilmente con NestJS
- Debe soportar relaciones complejas (Cliente → Negocios → Actividades)
- Debe generar SQL eficiente (no lento por abstracción)
- Equipo necesita curva de aprendizaje razonable

---

## Decisión

**Solución Elegida**: Prisma 7.1.1

**Justificación**:
- **Type-safety completo**: Cliente generado con tipos exactos del schema
- **Schema declarativo**: `schema.prisma` fácil de leer y mantener
- **Migraciones robustas**: `prisma migrate` con historial versionado
- **Prisma Studio**: GUI para explorar y editar datos en desarrollo
- **IntelliSense perfecto**: Autocompletado en cada query
- **Relaciones intuitivas**: `include` y `select` fáciles de usar
- **Comunidad activa**: 40k+ estrellas GitHub, adopción creciente

**Detalles de Implementación**:
- Prisma 7.1.1 (última versión estable)
- Schema en `backend/prisma/schema.prisma`
- 8 modelos: Equipo, Usuario, Cliente, Negocio, Actividad, Email, Nota, Notificacion
- 5 enums: RolUsuario, EtapaNegocio, TipoActividad, TipoNotificacion, TipoMoneda
- Migraciones en `backend/prisma/migrations/`
- PrismaService inyectable en módulos NestJS

---

## Consecuencias

### **Consecuencias Positivas** ✅

- **Errores en tiempo de compilación**: Typos en nombres de campos detectados antes de ejecutar
- **Autocompletado perfecto**: IntelliSense muestra campos, relaciones, métodos disponibles
- **Migrations automatizadas**: `prisma migrate dev` genera SQL automáticamente
- **Schema único de verdad**: `schema.prisma` es fuente única, genera tipos + SQL
- **Queries legibles**: Sintaxis JavaScript nativa, fácil de entender
- **N+1 prevention**: Prisma optimiza queries con `include`
- **Prisma Studio**: Explorar datos sin necesidad de cliente SQL

### **Consecuencias Negativas** ❌

- **Vendor lock-in**: Difícil migrar a otro ORM sin reescribir queries
- **SQL crudo limitado**: Queries complejas requieren `$queryRaw`
- **Schema migrations**: Cambios requieren generar migración (no solo editar SQL)
- **Tamaño de cliente generado**: Cliente Prisma agrega ~5MB a `node_modules`

### **Consecuencias Neutrales** ⚖️

- **Abstracción sobre SQL**: Trade-off entre control y productividad
- **Menos flexible que SQL crudo**: Pero 95% de casos cubiertos

### **Riesgos**

- **Performance en queries complejas**: Mitigado usando `$queryRaw` cuando sea necesario
- **Breaking changes en major versions**: Mitigado fijando versión, leyendo changelog antes de actualizar
- **Lock-in a Prisma**: Aceptable - beneficios superan el riesgo

---

## Alternativas Consideradas

### **Alternativa A: TypeORM**

**Pros**:
- ORM más maduro en Node.js
- Soporta múltiples bases de datos
- Decorators estilo ActiveRecord
- Migrado desde Java/C# más fácil (similar a Hibernate/EF)

**Contras**:
- Type-safety inferior a Prisma
- Migraciones menos robustas
- Más boilerplate (entidades, repositorios)
- Desarrollo más lento (menos updates)
- N+1 queries más común

**Por qué se rechazó**: Prisma tiene mejor type-safety y DX. TypeORM requiere más código boilerplate.

---

### **Alternativa B: Sequelize**

**Pros**:
- ORM más antiguo y estable
- Gran comunidad
- Soporta múltiples bases de datos
- Muchos ejemplos disponibles

**Contras**:
- TypeScript support agregado después (no nativo)
- Type-safety pobre
- Sintaxis verbosa
- Migraciones manuales (no auto-generadas)
- Desarrollo lento (mantenimiento mode)

**Por qué se rechazó**: Type-safety es crítico para este proyecto. Sequelize no fue diseñado para TypeScript.

---

### **Alternativa C: Kysely (Query Builder)**

**Pros**:
- Type-safety excelente
- Muy ligero
- Queries muy similares a SQL
- Sin magic, control total
- SQL-first approach

**Contras**:
- No es ORM completo (solo query builder)
- Sin migraciones integradas
- Sin schema declarativo
- Más código manual para relaciones
- Curva de aprendizaje mayor (requiere saber SQL)

**Por qué se rechazó**: Equipo sin experiencia SQL extensa. Queremos ORM completo con migraciones integradas.

---

### **Alternativa D: Drizzle ORM**

**Pros**:
- Type-safety excelente (similar a Prisma)
- Más ligero que Prisma
- SQL-like syntax pero tipado
- Migraciones automáticas
- Nuevo pero creciendo rápido

**Contras**:
- Muy nuevo (menos maduro)
- Comunidad más pequeña
- Menos ejemplos con NestJS
- Sin GUI (no Prisma Studio)
- Ecosistema menos establecido

**Por qué se rechazó**: Prisma más maduro con comunidad más grande. Drizzle prometedor pero preferimos estabilidad para MVP.

---

## Referencias

- [Documentación Oficial Prisma](https://www.prisma.io/docs)
- [Prisma con NestJS](https://docs.nestjs.com/recipes/prisma)
- [Prisma GitHub](https://github.com/prisma/prisma) - 40k+ estrellas
- [Prisma Studio](https://www.prisma.io/studio)

---

## Notas

**Consideraciones Futuras**:
- Monitorear Prisma 8+ cuando salga (breaking changes potenciales)
- Considerar Prisma Accelerate para caching si performance se vuelve issue
- Evaluar Drizzle ORM en 1-2 años cuando madure más

**Preguntas Abiertas**:
- Ninguna - Prisma funcionando perfectamente en Fase 1-4

---

## Historial de Revisiones

| Fecha       | Cambio                          | Autor       |
|------------|---------------------------------|--------------|
| 06/01/2026 | Decisión inicial                | Líder Proyecto |
| 30/01/2026 | Documentado después de completar MVP | Agente IA     |

---

**Fin de ADR-004** | Prisma elegido como ORM para base de datos

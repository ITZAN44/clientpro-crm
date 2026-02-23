# ADR-001: Elegir NestJS como Framework Backend

**Estado**: Aceptado  
**Fecha**: 06 de enero de 2026  
**Decisores**: Líder del Proyecto  
**Etiquetas**: backend, framework

---

## Contexto

**Antecedentes**:
- Construyendo aplicación CRM que requiere REST API, funcionalidades en tiempo real e integración con base de datos
- Necesidad de framework backend escalable y mantenible
- Equipo cómodo con TypeScript y Node.js
- Proyecto requiere arquitectura limpia con inyección de dependencias

**Requisitos**:
- **TypeScript-first**: Tipado fuerte para mantenibilidad
- **Arquitectura modular**: Separación clara de responsabilidades
- **Escalabilidad**: Puede crecer de MVP a enterprise
- **Experiencia de desarrollador**: Buenas herramientas y documentación
- **Ecosistema**: Soporte rico de librerías para tareas comunes

**Restricciones**:
- Debe funcionar con PostgreSQL (vía ORM)
- Debe soportar WebSocket (Socket.io)
- Debe integrarse con autenticación JWT
- Equipo tiene 0-6 meses de experiencia con Node.js

---

## Decisión

**Solución Elegida**: NestJS 11

**Justificación**:
- **Mejor soporte TypeScript de su clase**: Construido con TypeScript desde cero
- **Arquitectura inspirada en Angular**: Patrón familiar de inyección de dependencias
- **Opinionado pero flexible**: Convenciones claras sin vendor lock-in
- **Listo para enterprise**: Usado por grandes compañías (Adidas, Roche, Trilon)
- **Excelente documentación**: Guías y ejemplos comprehensivos

**Detalles de Implementación**:
- NestJS 11 (última versión estable)
- Organizado en módulos por funcionalidad (clientes, negocios, actividades, etc.)
- Integración Prisma ORM vía PrismaService personalizado
- Integración Socket.io vía WebSocket Gateway
- Autenticación JWT vía Passport.js

---

## Consecuencias

### **Consecuencias Positivas** ✅

- **Seguridad de tipos**: Atrapar errores en tiempo de compilación, no en runtime
- **Estructura clara**: Organización basada en módulos escala bien
- **Desarrollo rápido**: Generadores CLI para módulos, controllers, services
- **Testing fácil**: Utilidades de testing integradas con Jest
- **Ecosistema rico**: Paquetes @nestjs/* para necesidades comunes (throttling, config, etc.)
- **Basado en decoradores**: Código limpio y legible con mínimo boilerplate

### **Consecuencias Negativas** ❌

- **Curva de aprendizaje**: Inyección de dependencias no familiar para algunos desarrolladores
- **Magia de decoradores**: Puede ser difícil debuggear para principiantes
- **Opinionado**: Requiere seguir convenciones de NestJS
- **Tamaño de bundle**: Más grande que frameworks minimalistas (Express, Fastify)

### **Consecuencias Neutrales** ⚖️

- **Requiere TypeScript**: No es opción para proyectos JavaScript puro
- **Más abstracción**: Más capas que Express crudo (trade-off por estructura)

### **Riesgos**

- **Curva de aprendizaje del equipo**: Mitigado por excelente documentación y ejemplos
- **Sobre-ingeniería de features pequeñas**: Mitigado empezando simple, agregando complejidad cuando se necesita
- **Lock-in a patrones NestJS**: Trade-off aceptable por consistencia

---

## Alternativas Consideradas

### **Alternativa A: Express.js (framework minimalista)**

**Pros**:
- Minimalista, sin opiniones
- Ecosistema enorme
- Muy rápido
- Equipo ya familiarizado

**Contras**:
- Sin estructura integrada (cada proyecto diferente)
- Setup manual de TypeScript
- Sin inyección de dependencias
- Más boilerplate para tareas comunes

**Por qué se rechazó**: La falta de estructura ralentizaría el desarrollo conforme el proyecto crece. Necesitamos framework opinionado para consistencia del equipo.

---

### **Alternativa B: Fastify (alto rendimiento)**

**Pros**:
- 2x más rápido que Express
- Validación basada en schemas
- Soporte TypeScript
- Arquitectura de plugins

**Contras**:
- Ecosistema más pequeño que Express/NestJS
- Menos opinionado (aún necesitas construir estructura)
- Menos ejemplos y tutoriales
- Sin inyección de dependencias integrada

**Por qué se rechazó**: Performance no es crítico para MVP (100-1000 usuarios). Preferimos estructura sobre velocidad pura.

---

### **Alternativa C: Adonis.js (estilo Laravel)**

**Pros**:
- Completo (ORM, auth, validación, etc.)
- Opinionado como NestJS
- Soporte TypeScript
- Patrón MVC

**Contras**:
- Comunidad más pequeña que NestJS
- Menos flexible (componentes fuertemente acoplados)
- ORM propio (Lucid) en vez de Prisma
- Menos adopción enterprise

**Por qué se rechazó**: Queríamos usar Prisma ORM específicamente. NestJS es más popular y flexible.

---

### **Alternativa D: tRPC + Next.js API Routes**

**Pros**:
- Seguridad de tipos end-to-end
- Sin overhead de REST
- Setup mínimo
- Excelente para monorepos

**Contras**:
- Acopla fuertemente frontend y backend
- Sin REST API para móvil/terceros
- Menos estructura que NestJS
- Ecosistema más pequeño

**Por qué se rechazó**: Necesitamos API backend independiente. Planeamos agregar app móvil después. Queremos capacidades REST + WebSocket.

---

## Referencias

- [Documentación Oficial NestJS](https://docs.nestjs.com)
- [NestJS GitHub](https://github.com/nestjs/nest) - 65k+ estrellas
- [Guía Prisma + NestJS](https://docs.nestjs.com/recipes/prisma)
- [Guía Socket.io + NestJS](https://docs.nestjs.com/websockets/gateways)

---

## Notas

**Consideraciones Futuras**:
- Monitorear tamaño de bundle conforme el proyecto crece
- Considerar arquitectura de microservicios si escalamos más allá de 10k usuarios
- Evaluar NestJS v12+ cuando se lance

**Preguntas Abiertas**:
- Ninguna - Decisión validada después de implementación Fase 1-4

---

## Historial de Revisiones

| Fecha       | Cambio                          | Autor       |
|------------|---------------------------------|--------------|
| 06/01/2026 | Decisión inicial                | Líder Proyecto |
| 30/01/2026 | Documentado después de completar MVP | Agente IA     |

---

**Fin de ADR-001** | NestJS elegido como framework backend

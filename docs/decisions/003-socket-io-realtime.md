# ADR-003: Elegir Socket.io para Funcionalidades en Tiempo Real

**Estado**: Aceptado  
**Fecha**: 18 de enero de 2026  
**Decisores**: Líder del Proyecto  
**Etiquetas**: backend, frontend, real-time, websockets

---

## Contexto

**Antecedentes**:
- CRM requiere notificaciones en tiempo real (nuevos clientes, negocios actualizados, actividades vencidas)
- Necesidad de comunicación bidireccional entre servidor y cliente
- Usuarios deben ver cambios sin refrescar página manualmente
- Múltiples usuarios trabajando simultáneamente deben ver actualizaciones de otros

**Requisitos**:
- **Bidireccional**: Cliente y servidor pueden iniciar comunicación
- **Tiempo real**: Latencia < 1 segundo para notificaciones
- **Escalable**: Soportar múltiples conexiones simultáneas
- **Autenticación**: Solo usuarios autenticados pueden conectarse
- **Fallback**: Debe funcionar si WebSocket nativo no está disponible
- **Developer Experience**: Fácil de integrar con NestJS y Next.js

**Restricciones**:
- Debe integrarse con autenticación JWT existente
- Debe funcionar con NestJS backend y Next.js frontend
- Performance no debe degradar REST API existente
- Debe funcionar en producción (Vercel, Railway, etc.)

---

## Decisión

**Solución Elegida**: Socket.io 4.8.1

**Justificación**:
- **Integración NestJS nativa**: `@nestjs/platform-socket.io` oficial
- **Fallback automático**: WebSocket → long-polling si WebSocket no disponible
- **Rooms y namespaces**: Facilita notificaciones por usuario/equipo
- **Reconnection automática**: Cliente reconecta automáticamente si pierde conexión
- **Middleware de autenticación**: Fácil integrar JWT en handshake
- **Battle-tested**: Usado por Microsoft, Trello, Zendesk

**Detalles de Implementación**:
- Socket.io 4.8.1 en backend (NestJS Gateway)
- socket.io-client 4.8.1 en frontend (singleton compartido)
- Autenticación JWT en handshake (`auth.token`)
- Room por usuario: `user:${userId}` para notificaciones personales
- Eventos tipados compartidos entre backend/frontend
- Conexión solo cuando usuario está autenticado

---

## Consecuencias

### **Consecuencias Positivas** ✅

- **UX superior**: Usuario ve cambios instantáneos sin refrescar
- **Menos polling**: Sin necesidad de llamadas API repetitivas
- **Notificaciones push**: Servidor puede enviar actualizaciones proactivamente
- **Fácil debugging**: Socket.io DevTools y logging integrado
- **Escalabilidad**: Socket.io soporta Redis adapter para múltiples instancias
- **Fallback robusto**: Funciona incluso si WebSocket está bloqueado por proxy/firewall

### **Consecuencias Negativas** ❌

- **Complejidad adicional**: Un servicio más que mantener y monitorear
- **Overhead de memoria**: Conexiones persistentes consumen más RAM que HTTP
- **Debugging más difícil**: Estado de conexión agrega capa de complejidad
- **Costo potencial**: Conexiones persistentes en hosting serverless (Vercel) tienen limitaciones

### **Consecuencias Neutrales** ⚖️

- **Mayor tamaño de bundle**: socket.io-client agrega ~20KB gzipped
- **Estado adicional**: Cliente debe manejar estado de conexión (conectado/desconectado)

### **Riesgos**

- **Escalabilidad horizontal**: Mitigado usando Redis Adapter cuando se necesite
- **Conexiones perdidas**: Mitigado con reconnection automática de Socket.io
- **Uso de memoria**: Mitigado monitoreando conexiones, desconectando usuarios inactivos

---

## Alternativas Consideradas

### **Alternativa A: WebSocket nativo (ws en Node.js)**

**Pros**:
- Más ligero que Socket.io
- Menos overhead
- Estándar web
- Más control sobre protocolo

**Contras**:
- Sin fallback automático a long-polling
- Sin reconnection automática
- Sin rooms/namespaces integrados
- Más código boilerplate
- Menos integración con NestJS

**Por qué se rechazó**: Socket.io provee features críticas (fallback, reconnection, rooms) sin implementación manual.

---

### **Alternativa B: Server-Sent Events (SSE)**

**Pros**:
- Más simple que WebSocket
- HTTP estándar
- Funciona con CDNs
- Menos overhead servidor

**Contras**:
- Solo unidireccional (servidor → cliente)
- Sin bidireccionalidad real
- Límite de conexiones HTTP (6 por dominio en navegadores)
- No hay estándar para autenticación

**Por qué se rechazó**: Necesitamos bidireccionalidad (cliente puede emitir eventos al servidor, no solo recibir).

---

### **Alternativa C: Polling (llamadas REST repetitivas)**

**Pros**:
- Más simple de implementar
- Sin servicios adicionales
- Funciona en todos lados
- Fácil debugging

**Contras**:
- Latencia alta (depende de intervalo de polling)
- Desperdicio de recursos (muchas llamadas innecesarias)
- Escala mal (muchos clientes = muchas requests)
- Mala UX (delays perceptibles)

**Por qué se rechazó**: CRM requiere notificaciones < 1 segundo. Polling tendría latencia 5-10 segundos.

---

### **Alternativa D: Firebase Realtime Database / Firestore**

**Pros**:
- Tiempo real integrado
- Sin servidor que mantener
- Escalabilidad automática
- Fácil setup

**Contras**:
- Vendor lock-in total
- Requiere migrar base de datos a Firebase
- Costos impredecibles en escala
- Menos control sobre datos
- No se integra con PostgreSQL existente

**Por qué se rechazó**: Ya tenemos PostgreSQL + Prisma. No queremos migrar base de datos completa.

---

## Referencias

- [Documentación Socket.io](https://socket.io/docs/v4/)
- [NestJS WebSockets](https://docs.nestjs.com/websockets/gateways)
- [Socket.io con JWT](https://socket.io/how-to/use-with-jwt)
- [Socket.io GitHub](https://github.com/socketio/socket.io) - 60k+ estrellas

---

## Notas

**Consideraciones Futuras**:
- Implementar Redis Adapter si escalamos a múltiples instancias de backend
- Considerar rate limiting para eventos Socket.io
- Monitorear uso de memoria de conexiones persistentes
- Evaluar migración a WebSocket nativo si Socket.io se vuelve overhead

**Preguntas Abiertas**:
- ¿Cómo funcionará Socket.io en Vercel (serverless)? → Investigar en Fase 6 (deployment)

---

## Historial de Revisiones

| Fecha       | Cambio                          | Autor       |
|------------|---------------------------------|--------------|
| 18/01/2026 | Decisión inicial                | Líder Proyecto |
| 30/01/2026 | Documentado después de Fase 4   | Agente IA     |

---

**Fin de ADR-003** | Socket.io elegido para funcionalidades en tiempo real

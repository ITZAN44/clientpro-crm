# 🗄️ Base de Datos - ClientPro CRM

> **Esquema de base de datos PostgreSQL con Prisma ORM**

**Última actualización**: 30 Enero 2026  
**Base de datos**: `clientpro_crm`  
**ORM**: Prisma 7.2.0

---

## 📊 Modelos de Datos (8 tablas)

### **1. Equipo**
- `id`: Int (PK, autoincrement)
- `nombre`: String
- `descripcion`: String?
- `createdAt`: DateTime
- `updatedAt`: DateTime
- **Relaciones**: 1:N con Usuario

### **2. Usuario**
- `id`: Int (PK, autoincrement)
- `nombre`: String
- `email`: String (unique)
- `password`: String (bcrypt, 10 rounds)
- `rol`: RolUsuario (enum)
- `activo`: Boolean
- `ultimoLogin`: DateTime?
- `equipoId`: Int?
- `createdAt`: DateTime
- `updatedAt`: DateTime
- **Relaciones**: 
  - N:1 con Equipo
  - 1:N con Cliente (propietario)
  - 1:N con Negocio (propietario)
  - 1:N con Actividad
  - 1:N con Email
  - 1:N con Nota
  - 1:N con Notificacion

### **3. Cliente**
- `id`: Int (PK, autoincrement)
- `nombre`: String
- `email`: String? (unique)
- `telefono`: String?
- `empresa`: String?
- `cargo`: String?
- `sitioWeb`: String?
- `direccion`: String?
- `ciudad`: String?
- `pais`: String?
- `notas`: String?
- `propietarioId`: Int
- `createdAt`: DateTime
- `updatedAt`: DateTime
- **Relaciones**:
  - N:1 con Usuario (propietario)
  - 1:N con Negocio
  - 1:N con Actividad
  - 1:N con Email
  - 1:N con Nota

### **4. Negocio**
- `id`: Int (PK, autoincrement)
- `titulo`: String
- `valor`: Decimal
- `moneda`: TipoMoneda (enum)
- `etapa`: EtapaNegocio (enum)
- `probabilidad`: Int (0-100)
- `fechaCierre`: DateTime?
- `descripcion`: String?
- `clienteId`: Int
- `propietarioId`: Int
- `createdAt`: DateTime
- `updatedAt`: DateTime
- **Relaciones**:
  - N:1 con Cliente
  - N:1 con Usuario (propietario)
  - 1:N con Actividad
  - 1:N con Nota

### **5. Actividad**
- `id`: Int (PK, autoincrement)
- `tipo`: TipoActividad (enum)
- `titulo`: String
- `descripcion`: String?
- `fechaHora`: DateTime
- `duracion`: Int? (minutos)
- `completada`: Boolean
- `resultado`: String?
- `clienteId`: Int?
- `negocioId`: Int?
- `usuarioId`: Int
- `createdAt`: DateTime
- `updatedAt`: DateTime
- **Relaciones**:
  - N:1 con Cliente
  - N:1 con Negocio
  - N:1 con Usuario

### **6. Email**
- `id`: Int (PK, autoincrement)
- `asunto`: String
- `cuerpo`: String
- `destinatario`: String
- `cc`: String?
- `bcc`: String?
- `adjuntos`: String?
- `enviado`: Boolean
- `fechaEnvio`: DateTime?
- `clienteId`: Int?
- `usuarioId`: Int
- `createdAt`: DateTime
- `updatedAt`: DateTime
- **Relaciones**:
  - N:1 con Cliente
  - N:1 con Usuario

### **7. Nota**
- `id`: Int (PK, autoincrement)
- `contenido`: String
- `clienteId`: Int?
- `negocioId`: Int?
- `usuarioId`: Int
- `createdAt`: DateTime
- `updatedAt`: DateTime
- **Relaciones**:
  - N:1 con Cliente
  - N:1 con Negocio
  - N:1 con Usuario

### **8. Notificacion**
- `id`: Int (PK, autoincrement)
- `tipo`: TipoNotificacion (enum)
- `titulo`: String
- `mensaje`: String
- `leida`: Boolean
- `urlAccion`: String?
- `usuarioId`: Int
- `createdAt`: DateTime
- `updatedAt`: DateTime
- **Relaciones**:
  - N:1 con Usuario

---

## 🏷️ Enums (5 tipos)

### **1. RolUsuario**
```typescript
enum RolUsuario {
  ADMIN       // Acceso completo
  MANAGER     // Gestión de equipo
  VENDEDOR    // Gestión de clientes/negocios propios
}
```

### **2. EtapaNegocio** (6 etapas del pipeline)
```typescript
enum EtapaNegocio {
  PROSPECTO           // Nuevo lead
  CALIFICACION        // Validando interés
  PROPUESTA           // Propuesta enviada
  NEGOCIACION         // En negociación
  CERRADO_GANADO      // ✅ Ganado
  CERRADO_PERDIDO     // ❌ Perdido
}
```

### **3. TipoActividad** (5 tipos)
```typescript
enum TipoActividad {
  LLAMADA    // 📞 Llamada telefónica
  REUNION    // 🤝 Reunión presencial/virtual
  EMAIL      // 📧 Email enviado
  TAREA      // ✅ Tarea interna
  NOTA       // 📝 Nota/comentario
}
```

### **4. TipoNotificacion** (8 tipos)
```typescript
enum TipoNotificacion {
  NEGOCIO_ACTUALIZADO      // Cambio en negocio
  ACTIVIDAD_VENCIDA        // Actividad pasó de fecha
  NUEVO_CLIENTE            // Cliente agregado
  NEGOCIO_GANADO           // Negocio cerrado ganado
  NEGOCIO_PERDIDO          // Negocio cerrado perdido
  TAREA_ASIGNADA           // Nueva tarea asignada
  COMENTARIO_AGREGADO      // Nuevo comentario
  SISTEMA                  // Notificación del sistema
}
```

### **5. TipoMoneda** (4 monedas)
```typescript
enum TipoMoneda {
  USD    // Dólar estadounidense
  EUR    // Euro
  COP    // Peso colombiano
  MXN    // Peso mexicano
}
```

---

## 👥 Usuarios de Prueba

**7 usuarios con contraseñas hasheadas (bcrypt, 10 rounds)**

| ID | Email | Contraseña | Rol | Equipo |
|----|-------|------------|-----|--------|
| 1 | admin@clientpro.com | Password123! | ADMIN | Ventas |
| 2 | manager@clientpro.com | Password123! | MANAGER | Ventas |
| 3 | vendedor1@clientpro.com | Password123! | VENDEDOR | Ventas |
| 4 | vendedor2@clientpro.com | Password123! | VENDEDOR | Ventas |
| 5 | vendedor3@clientpro.com | Password123! | VENDEDOR | Marketing |
| 6 | manager2@clientpro.com | Password123! | MANAGER | Marketing |
| 7 | vendedor4@clientpro.com | Password123! | VENDEDOR | Soporte |

**Todos los usuarios funcionan para login** ✅

---

## 📊 Datos de Ejemplo

### **Clientes**: 9 registros
- Empresas tech, retail, servicios
- Con datos completos (email, teléfono, empresa, sitio web)

### **Negocios**: 6+ registros
- Distribuidos en las 6 etapas del pipeline
- Valores entre $5,000 y $50,000 USD
- Asignados a diferentes vendedores

### **Actividades**: 6 registros
- 4 completadas con timestamps
- 2 pendientes
- Distribuidas en 5 tipos: LLAMADA, EMAIL, REUNION, TAREA, NOTA

### **Notificaciones**: Generadas dinámicamente
- Al cambiar etapa de negocio
- Al completar actividades
- Sistema dual: Persistentes (DB) + Efímeras (WebSocket)

---

## 📁 Archivos de Base de Datos

```
database/
├── schema.sql           # Estructura completa con relaciones
├── seed.sql             # Datos de ejemplo
└── crear_bd.sql         # Script de creación
```

**Prisma Schema**: `backend/prisma/schema.prisma` (versión definitiva)

---

## 🔧 Comandos Útiles

### **Generar Prisma Client**
```bash
cd backend
npx prisma generate
```

### **Crear Migración**
```bash
npx prisma migrate dev --name nombre_migracion
```

### **Abrir Prisma Studio**
```bash
npx prisma studio   # http://localhost:5555
```

### **Resetear Base de Datos**
```bash
npx prisma migrate reset   # ⚠️ Elimina todos los datos
```

### **Verificar Estado**
```bash
npx prisma migrate status
```

---

## 🔗 Relaciones

### **Diagrama de Relaciones Principales**
```
Equipo (1) → (N) Usuario
Usuario (1) → (N) Cliente (propietario)
Usuario (1) → (N) Negocio (propietario)
Usuario (1) → (N) Actividad
Usuario (1) → (N) Notificacion

Cliente (1) → (N) Negocio
Cliente (1) → (N) Actividad
Cliente (1) → (N) Email
Cliente (1) → (N) Nota

Negocio (1) → (N) Actividad
Negocio (1) → (N) Nota
```

---

## 🔐 Seguridad

- **Passwords**: Hasheadas con bcrypt (10 rounds)
- **Timestamps**: Automáticos en todos los modelos (createdAt, updatedAt)
- **Validación**: Prisma schema + class-validator en DTOs
- **Acceso**: Guards en endpoints (solo acceso a datos propios)

---

## 📈 Estadísticas

- **Total de modelos**: 8
- **Total de enums**: 5
- **Total de relaciones**: 15+
- **Campos únicos**: 1 (Usuario.email)
- **Índices**: Auto-generados por Prisma

---

**Ver también**:
- **Estructura del proyecto**: `ARCHITECTURE.md`
- **Stack tecnológico**: `STACK.md`
- **Guía de desarrollo**: `../../AGENTS.md`

---

**Última revisión**: 30 Enero 2026  
**Versión**: 0.4.0

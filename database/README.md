# 📊 Base de Datos - ClientPro CRM

Esta carpeta contiene el schema completo de PostgreSQL para el sistema CRM **en español**.

## 📁 Archivos

- **`schema.sql`** - Estructura completa de la base de datos (8 tablas + índices + triggers) ✅ EN ESPAÑOL
- **`seed.sql`** - Datos de ejemplo para desarrollo y testing ✅ EN ESPAÑOL
- **`crear_bd.sql`** - Script helper para crear la base de datos

## 🚀 Instalación Rápida

### Opción 1: Usar el script helper

```bash
psql -U postgres -f crear_bd.sql
```

### Opción 2: Manual

```bash
# 1. Conectarse a PostgreSQL
psql -U postgres

# 2. Crear la base de datos
CREATE DATABASE clientpro_crm 
  WITH ENCODING='UTF8' 
  LC_COLLATE='Spanish_Mexico.1252' 
  LC_CTYPE='Spanish_Mexico.1252';

# 3. Salir
\q

# 4. Ejecutar el schema
psql -U postgres -d clientpro_crm -f schema.sql

# 5. Cargar datos de ejemplo
psql -U postgres -d clientpro_crm -f seed.sql
```

## 🗂️ Estructura de Tablas (Español)

### 1. **equipos** - Equipos de trabajo
- Equipos dentro de la organización (Ventas CDMX, Ventas MTY, etc.)

### 2. **usuarios** - Usuarios del sistema
- Roles: `ADMIN`, `MANAGER`, `VENDEDOR`
- Cada usuario pertenece a un equipo
- Campos: `nombre`, `email`, `rol`, `equipo_id`, `esta_activo`

### 3. **clientes** - Clientes/Contactos
- Información completa del cliente
- Asignados a un vendedor (`propietario_id`)
- Campos: `nombre`, `email`, `telefono`, `empresa`, `puesto`, `ciudad`, `pais`

### 4. **negocios** - Oportunidades de venta
- Pipeline: `PROSPECTO` → `CONTACTO_REALIZADO` → `PROPUESTA` → `NEGOCIACION` → `GANADO`/`PERDIDO`
- Relacionados con un cliente y un vendedor
- Campos: `titulo`, `valor`, `moneda`, `etapa`, `probabilidad`, `fecha_cierre_esperada`

### 5. **actividades** - Actividades/Tareas
- Tipos: `LLAMADA`, `EMAIL`, `REUNION`, `TAREA`
- Pueden estar ligadas a un negocio o cliente
- Campos: `tipo`, `titulo`, `descripcion`, `fecha_vencimiento`, `completada`

### 6. **emails** - Historial de emails
- Todos los emails enviados desde el CRM
- Relacionados con clientes y negocios
- Campos: `asunto`, `cuerpo`, `email_origen`, `email_destino`

### 7. **notas** - Notas internas
- Notas sobre clientes o negocios
- Pueden marcarse como "fijada" (importantes)
- Campos: `contenido`, `fijada`, `cliente_id`, `negocio_id`

### 8. **notificaciones** - Notificaciones en tiempo real
- Notificaciones para usuarios (asignaciones, tareas, etc.)
- Tipos: `NEGOCIO_ASIGNADO`, `TAREA_VENCIMIENTO`, `NEGOCIO_GANADO`
- Campos: `tipo`, `titulo`, `mensaje`, `leida`, `url_accion`

## 🔗 Relaciones Principales

```
equipos (1) ──→ (N) usuarios
usuarios (1) ──→ (N) clientes
clientes (1) ──→ (N) negocios
negocios (1) ──→ (N) actividades
negocios (1) ──→ (N) notas
usuarios (1) ──→ (N) notificaciones
```

## 🔍 Vistas Creadas (en seed.sql)

### `v_resumen_negocios`
Vista completa de negocios con información de cliente, vendedor y equipo.

```sql
SELECT * FROM v_resumen_negocios;
```

### `v_actividades_pendientes`
Todas las actividades pendientes ordenadas por fecha.

```sql
SELECT * FROM v_actividades_pendientes;
```

### `v_pipeline_ventas`
Resumen del pipeline de ventas por equipo.

```sql
SELECT * FROM v_pipeline_ventas;
```

## 📊 Datos de Ejemplo (seed.sql)

El archivo de seed incluye:
- ✅ 3 equipos (Ventas CDMX, Ventas Monterrey, Ventas Guadalajara)
- ✅ 7 usuarios (1 admin, 2 managers, 4 vendedores)
- ✅ 6 clientes con empresas mexicanas
- ✅ 6 negocios en diferentes etapas (PROSPECTO, PROPUESTA, GANADO, etc.)
- ✅ 5 actividades (pendientes y completadas)
- ✅ 2 emails de ejemplo
- ✅ 3 notas
- ✅ 3 notificaciones

**Credenciales de ejemplo:**
- Email: `admin@clientpro.com`
- Password: `password123` (hash bcrypt en la BD)

**Estado**: ✅ **EJECUTADO** - Base de datos poblada con datos en español

## 🎯 Uso con MCP de PostgreSQL

Una vez creada la base de datos, puedes conectar el MCP de PostgreSQL en VS Code:

1. Configurar la conexión al servidor PostgreSQL
2. El MCP leerá automáticamente estas tablas
3. GitHub Copilot podrá generar queries usando el schema real

## 🔧 Comandos Útiles de PostgreSQL

```bash
# Conectarse a la base de datos
psql -U postgres -d clientpro_crm

# Ver todas las tablas
\dt

# Describir una tabla
\d usuarios
\d negocios
\d clientes

# Ver todas las vistas
\dv

# Ver índices de una tabla
\di usuarios

# Ejecutar queries de ejemplo
SELECT * FROM v_pipeline_ventas;
SELECT * FROM v_actividades_pendientes;
SELECT * FROM v_resumen_negocios;

# Ver usuarios por equipo
SELECT t.nombre AS equipo, u.nombre AS usuario, u.rol 
FROM usuarios u 
JOIN equipos t ON u.equipo_id = t.id 
ORDER BY t.nombre, u.rol;

# Salir
\q
```

## 🛠️ Personalización

### Agregar una nueva tabla

1. Edita `schema.sql`
2. Agrega la tabla con sus relaciones
3. Crea índices necesarios
4. Actualiza `seed.sql` si necesitas datos de ejemplo

### Modificar una tabla existente

```sql
-- Ejemplo: Agregar columna a clients
ALTER TABLE clients ADD COLUMN linkedin_url VARCHAR(255);

-- Crear índice si es necesario
CREATE INDEX idx_clients_linkedin ON clients(linkedin_url);
```

## 📝 Notas Importantes

- **UUIDs**: Todas las tablas usan UUIDs como primary keys para mejor escalabilidad
- **Timestamps**: Todas las fechas usan `TIMESTAMP WITH TIME ZONE`
- **Triggers**: Los campos `updated_at` se actualizan automáticamente
- **Constraints**: Las foreign keys tienen `ON DELETE CASCADE` o `RESTRICT` según corresponda
- **Full-text search**: La tabla `clients` tiene un índice GIN para búsqueda de texto completo

## 🚀 Siguiente Paso

Una vez ejecutados estos archivos, puedes:
1. Conectar el MCP de PostgreSQL
2. Crear el backend con NestJS + Prisma
3. Generar el Prisma Schema con: `npx prisma db pull`

---

**¿Dudas?** Revisa la documentación de PostgreSQL: https://www.postgresql.org/docs/

-- ============================================
-- CRM "ClientPro" - PostgreSQL Schema
-- ============================================
-- Creado: 30 de Diciembre 2025
-- Traducido a español: 31 de Diciembre 2025
-- Base de datos para sistema de gestión de clientes
-- ============================================

-- IMPORTANTE: Ejecutar primero estos comandos en psql:
-- CREATE DATABASE clientpro_crm;
-- \c clientpro_crm

-- Habilitar extensión para UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUMS (Tipos personalizados)
-- ============================================

-- Roles de usuario
CREATE TYPE rol_usuario AS ENUM ('ADMIN', 'MANAGER', 'VENDEDOR');

-- Etapas de negocios (pipeline de ventas)
CREATE TYPE etapa_negocio AS ENUM (
    'PROSPECTO',          -- Prospecto inicial
    'CONTACTO_REALIZADO', -- Primer contacto realizado
    'PROPUESTA',          -- Propuesta enviada
    'NEGOCIACION',        -- En negociación
    'GANADO',             -- Ganado
    'PERDIDO'             -- Perdido
);

-- Tipos de actividades
CREATE TYPE tipo_actividad AS ENUM (
    'LLAMADA',    -- Llamada telefónica
    'EMAIL',      -- Email
    'REUNION',    -- Reunión
    'TAREA',      -- Tarea general
    'NOTA'        -- Nota rápida
);

-- Tipos de notificaciones
CREATE TYPE tipo_notificacion AS ENUM (
    'NEGOCIO_ASIGNADO',     -- Te asignaron un negocio
    'TAREA_VENCIMIENTO',    -- Tarea próxima a vencer
    'NEGOCIO_GANADO',       -- Negocio ganado
    'NEGOCIO_PERDIDO',      -- Negocio perdido
    'CLIENTE_ASIGNADO',     -- Te asignaron un cliente
    'MENCION',              -- Te mencionaron en un comentario
    'ACTIVIDAD_ASIGNADA'    -- Te asignaron una actividad
);

-- Monedas
CREATE TYPE tipo_moneda AS ENUM ('MXN', 'USD', 'EUR');

-- ============================================
-- TABLA 1: equipos
-- ============================================
CREATE TABLE equipos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índice para búsquedas por nombre
CREATE INDEX idx_equipos_nombre ON equipos(nombre);

-- ============================================
-- TABLA 2: usuarios
-- ============================================
CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    rol rol_usuario DEFAULT 'VENDEDOR',
    equipo_id UUID REFERENCES equipos(id) ON DELETE SET NULL,
    esta_activo BOOLEAN DEFAULT true,
    ultimo_login TIMESTAMP WITH TIME ZONE,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para optimización
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_equipo_id ON usuarios(equipo_id);
CREATE INDEX idx_usuarios_rol ON usuarios(rol);

-- ============================================
-- TABLA 3: clientes
-- ============================================
CREATE TABLE clientes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    telefono VARCHAR(50),
    empresa VARCHAR(255),
    puesto VARCHAR(255),  -- Cargo en la empresa
    direccion TEXT,
    ciudad VARCHAR(100),
    pais VARCHAR(100),
    sitio_web VARCHAR(255),
    notas TEXT,
    propietario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para búsquedas frecuentes
CREATE INDEX idx_clientes_propietario_id ON clientes(propietario_id);
CREATE INDEX idx_clientes_email ON clientes(email);
CREATE INDEX idx_clientes_empresa ON clientes(empresa);
CREATE INDEX idx_clientes_nombre ON clientes(nombre);

-- Índice de texto completo para búsqueda
CREATE INDEX idx_clientes_busqueda ON clientes USING gin(to_tsvector('spanish', nombre || ' ' || COALESCE(empresa, '') || ' ' || COALESCE(email, '')));

-- ============================================
-- TABLA 4: negocios
-- ============================================
CREATE TABLE negocios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    valor DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    moneda tipo_moneda DEFAULT 'MXN',
    etapa etapa_negocio DEFAULT 'PROSPECTO',
    probabilidad INTEGER DEFAULT 0 CHECK (probabilidad >= 0 AND probabilidad <= 100),
    fecha_cierre_esperada DATE,
    fecha_cierre_real DATE,
    cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    propietario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    cerrado_en TIMESTAMP WITH TIME ZONE
);

-- Índices para reportes y filtros
CREATE INDEX idx_negocios_cliente_id ON negocios(cliente_id);
CREATE INDEX idx_negocios_propietario_id ON negocios(propietario_id);
CREATE INDEX idx_negocios_etapa ON negocios(etapa);
CREATE INDEX idx_negocios_fecha_cierre_esperada ON negocios(fecha_cierre_esperada);
CREATE INDEX idx_negocios_creado_en ON negocios(creado_en);

-- ============================================
-- TABLA 5: actividades
-- ============================================
CREATE TABLE actividades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tipo tipo_actividad NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    fecha_vencimiento TIMESTAMP WITH TIME ZONE,
    completada BOOLEAN DEFAULT false,
    completada_en TIMESTAMP WITH TIME ZONE,
    negocio_id UUID REFERENCES negocios(id) ON DELETE CASCADE,
    cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE,
    asignado_a UUID NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
    creado_por UUID NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraint: debe estar ligada a un negocio O a un cliente
    CONSTRAINT actividad_relacion CHECK (negocio_id IS NOT NULL OR cliente_id IS NOT NULL)
);

-- Índices para calendarios y tareas pendientes
CREATE INDEX idx_actividades_asignado_a ON actividades(asignado_a);
CREATE INDEX idx_actividades_fecha_vencimiento ON actividades(fecha_vencimiento);
CREATE INDEX idx_actividades_completada ON actividades(completada);
CREATE INDEX idx_actividades_negocio_id ON actividades(negocio_id);
CREATE INDEX idx_actividades_cliente_id ON actividades(cliente_id);
CREATE INDEX idx_actividades_tipo ON actividades(tipo);

-- ============================================
-- TABLA 6: emails
-- ============================================
CREATE TABLE emails (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asunto VARCHAR(500) NOT NULL,
    cuerpo TEXT NOT NULL,
    email_origen VARCHAR(255) NOT NULL,
    email_destino VARCHAR(255) NOT NULL,
    emails_copia TEXT[],  -- Array de emails en copia
    enviado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    negocio_id UUID REFERENCES negocios(id) ON DELETE SET NULL,
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para historial
CREATE INDEX idx_emails_cliente_id ON emails(cliente_id);
CREATE INDEX idx_emails_negocio_id ON emails(negocio_id);
CREATE INDEX idx_emails_usuario_id ON emails(usuario_id);
CREATE INDEX idx_emails_enviado_en ON emails(enviado_en);

-- ============================================
-- TABLA 7: notas
-- ============================================
CREATE TABLE notas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contenido TEXT NOT NULL,
    fijada BOOLEAN DEFAULT false,  -- Para notas importantes
    cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE,
    negocio_id UUID REFERENCES negocios(id) ON DELETE CASCADE,
    autor_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraint: debe estar ligada a un negocio O a un cliente
    CONSTRAINT nota_relacion CHECK (negocio_id IS NOT NULL OR cliente_id IS NOT NULL)
);

-- Índices
CREATE INDEX idx_notas_cliente_id ON notas(cliente_id);
CREATE INDEX idx_notas_negocio_id ON notas(negocio_id);
CREATE INDEX idx_notas_autor_id ON notas(autor_id);
CREATE INDEX idx_notas_creado_en ON notas(creado_en DESC);

-- ============================================
-- TABLA 8: notificaciones
-- ============================================
CREATE TABLE notificaciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tipo tipo_notificacion NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    mensaje TEXT,
    leida BOOLEAN DEFAULT false,
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    negocio_relacionado_id UUID REFERENCES negocios(id) ON DELETE CASCADE,
    cliente_relacionado_id UUID REFERENCES clientes(id) ON DELETE CASCADE,
    actividad_relacionada_id UUID REFERENCES actividades(id) ON DELETE CASCADE,
    url_accion VARCHAR(500),  -- URL para hacer click en la notificación
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para panel de notificaciones
CREATE INDEX idx_notificaciones_usuario_id ON notificaciones(usuario_id);
CREATE INDEX idx_notificaciones_leida ON notificaciones(leida);
CREATE INDEX idx_notificaciones_creado_en ON notificaciones(creado_en DESC);

-- ============================================
-- TRIGGERS para actualizado_en automático
-- ============================================

-- Función genérica para actualizar actualizado_en
CREATE OR REPLACE FUNCTION actualizar_columna_actualizado_en()
RETURNS TRIGGER AS $$
BEGIN
    NEW.actualizado_en = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a tablas con actualizado_en
CREATE TRIGGER actualizar_equipos_actualizado_en BEFORE UPDATE ON equipos
    FOR EACH ROW EXECUTE FUNCTION actualizar_columna_actualizado_en();

CREATE TRIGGER actualizar_usuarios_actualizado_en BEFORE UPDATE ON usuarios
    FOR EACH ROW EXECUTE FUNCTION actualizar_columna_actualizado_en();

CREATE TRIGGER actualizar_clientes_actualizado_en BEFORE UPDATE ON clientes
    FOR EACH ROW EXECUTE FUNCTION actualizar_columna_actualizado_en();

CREATE TRIGGER actualizar_negocios_actualizado_en BEFORE UPDATE ON negocios
    FOR EACH ROW EXECUTE FUNCTION actualizar_columna_actualizado_en();

CREATE TRIGGER actualizar_actividades_actualizado_en BEFORE UPDATE ON actividades
    FOR EACH ROW EXECUTE FUNCTION actualizar_columna_actualizado_en();

CREATE TRIGGER actualizar_notas_actualizado_en BEFORE UPDATE ON notas
    FOR EACH ROW EXECUTE FUNCTION actualizar_columna_actualizado_en();

-- ============================================
-- COMENTARIOS EN TABLAS (Documentación)
-- ============================================

COMMENT ON TABLE equipos IS 'Equipos de trabajo dentro de la organización';
COMMENT ON TABLE usuarios IS 'Usuarios del sistema CRM (vendedores, managers, admins)';
COMMENT ON TABLE clientes IS 'Clientes/Contactos del CRM';
COMMENT ON TABLE negocios IS 'Oportunidades de venta (pipeline)';
COMMENT ON TABLE actividades IS 'Actividades relacionadas a clientes o negocios (llamadas, tareas, reuniones)';
COMMENT ON TABLE emails IS 'Historial de emails enviados desde el CRM';
COMMENT ON TABLE notas IS 'Notas internas sobre clientes o negocios';
COMMENT ON TABLE notificaciones IS 'Notificaciones en tiempo real para usuarios';

-- ============================================
-- FIN DEL SCHEMA
-- ============================================

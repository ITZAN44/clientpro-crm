-- ============================================
-- DATOS DE EJEMPLO (SEED DATA)
-- CRM "ClientPro"
-- ============================================
-- Ejecutar DESPUÉS de schema.sql
-- ============================================

-- Limpiar datos existentes (solo para desarrollo)
TRUNCATE TABLE notificaciones, notas, emails, actividades, negocios, clientes, usuarios, equipos CASCADE;

-- ============================================
-- 1. EQUIPOS
-- ============================================
INSERT INTO equipos (id, nombre, descripcion) VALUES
    ('11111111-1111-1111-1111-111111111111', 'Ventas CDMX', 'Equipo de ventas de Ciudad de México'),
    ('22222222-2222-2222-2222-222222222222', 'Ventas Monterrey', 'Equipo de ventas de Monterrey'),
    ('33333333-3333-3333-3333-333333333333', 'Ventas Guadalajara', 'Equipo de ventas de Guadalajara');

-- ============================================
-- 2. USUARIOS
-- ============================================
-- Contraseña para todos: "password123" (hasheada con bcrypt)
-- Hash real: $2a$10$XqKGvJOhZHqxVSKKh4vD7e5IHmZGS5Ht7p.Z6Eo2Z6m.nK4Hs8.6m
INSERT INTO usuarios (id, email, password_hash, nombre, rol, equipo_id) VALUES
    -- Admins
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'admin@clientpro.com', '$2a$10$XqKGvJOhZHqxVSKKh4vD7e', 'Ana García', 'ADMIN', '11111111-1111-1111-1111-111111111111'),
    
    -- Managers
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'manager.cdmx@clientpro.com', '$2a$10$XqKGvJOhZHqxVSKKh4vD7e', 'Carlos López', 'MANAGER', '11111111-1111-1111-1111-111111111111'),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'manager.mty@clientpro.com', '$2a$10$XqKGvJOhZHqxVSKKh4vD7e', 'Laura Martínez', 'MANAGER', '22222222-2222-2222-2222-222222222222'),
    
    -- Vendedores
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'juan.perez@clientpro.com', '$2a$10$XqKGvJOhZHqxVSKKh4vD7e', 'Juan Pérez', 'VENDEDOR', '11111111-1111-1111-1111-111111111111'),
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'maria.rodriguez@clientpro.com', '$2a$10$XqKGvJOhZHqxVSKKh4vD7e', 'María Rodríguez', 'VENDEDOR', '11111111-1111-1111-1111-111111111111'),
    ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'pedro.sanchez@clientpro.com', '$2a$10$XqKGvJOhZHqxVSKKh4vD7e', 'Pedro Sánchez', 'VENDEDOR', '22222222-2222-2222-2222-222222222222'),
    ('99999999-9999-9999-9999-999999999999', 'sofia.torres@clientpro.com', '$2a$10$XqKGvJOhZHqxVSKKh4vD7e', 'Sofía Torres', 'VENDEDOR', '33333333-3333-3333-3333-333333333333');

-- ============================================
-- 3. CLIENTES
-- ============================================
INSERT INTO clientes (id, nombre, email, telefono, empresa, puesto, ciudad, pais, notas, propietario_id) VALUES
    -- Clientes de Juan Pérez
    ('c1111111-1111-1111-1111-111111111111', 'Roberto Gómez', 'roberto.gomez@techsolutions.mx', '+52 55 1234 5678', 'TechSolutions México', 'Director de TI', 'Ciudad de México', 'México', 'Interesado en soluciones de CRM', 'dddddddd-dddd-dddd-dddd-dddddddddddd'),
    ('c2222222-2222-2222-2222-222222222222', 'Diana Flores', 'diana.flores@innovatech.com', '+52 55 8765 4321', 'InnovaTech', 'CEO', 'Ciudad de México', 'México', 'Busca automatización de procesos', 'dddddddd-dddd-dddd-dddd-dddddddddddd'),
    
    -- Clientes de María Rodríguez
    ('c3333333-3333-3333-3333-333333333333', 'Jorge Ramírez', 'jorge.ramirez@corporativo.mx', '+52 55 9999 8888', 'Corporativo Nacional', 'Gerente de Compras', 'Ciudad de México', 'México', 'Cliente recurrente, alta prioridad', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'),
    ('c4444444-4444-4444-4444-444444444444', 'Patricia Vega', 'pvega@startupmx.io', '+52 55 7777 6666', 'StartupMX', 'Fundadora', 'Ciudad de México', 'México', 'Startup en crecimiento', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'),
    
    -- Clientes de Pedro Sánchez
    ('c5555555-5555-5555-5555-555555555555', 'Luis Hernández', 'luis.h@grupoindustrial.mx', '+52 81 1234 5678', 'Grupo Industrial del Norte', 'VP de Operaciones', 'Monterrey', 'México', 'Interesado en ERP', 'ffffffff-ffff-ffff-ffff-ffffffffffff'),
    ('c6666666-6666-6666-6666-666666666666', 'Carmen Ortiz', 'cortiz@retailmx.com', '+52 81 9876 5432', 'Retail México', 'Directora Comercial', 'Monterrey', 'México', 'Necesita sistema de inventarios', 'ffffffff-ffff-ffff-ffff-ffffffffffff');

-- ============================================
-- 4. NEGOCIOS (Oportunidades)
-- ============================================
INSERT INTO negocios (id, titulo, descripcion, valor, moneda, etapa, probabilidad, fecha_cierre_esperada, cliente_id, propietario_id) VALUES
    -- Negocios de Juan Pérez
    ('d1111111-1111-1111-1111-111111111111', 'Implementación CRM Enterprise', 'Sistema CRM completo con 50 licencias', 125000.00, 'MXN', 'PROPUESTA', 75, '2025-02-15', 'c1111111-1111-1111-1111-111111111111', 'dddddddd-dddd-dddd-dddd-dddddddddddd'),
    ('d2222222-2222-2222-2222-222222222222', 'Automatización de Marketing', 'Suite de automatización de marketing digital', 85000.00, 'MXN', 'NEGOCIACION', 60, '2025-02-28', 'c2222222-2222-2222-2222-222222222222', 'dddddddd-dddd-dddd-dddd-dddddddddddd'),
    
    -- Negocios de María Rodríguez
    ('d3333333-3333-3333-3333-333333333333', 'Renovación de Licencias', 'Renovación anual de 100 licencias', 200000.00, 'MXN', 'GANADO', 100, '2025-01-15', 'c3333333-3333-3333-3333-333333333333', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'),
    ('d4444444-4444-4444-4444-444444444444', 'Consultoría Inicial', 'Análisis y consultoría para startup', 25000.00, 'MXN', 'CONTACTO_REALIZADO', 30, '2025-03-01', 'c4444444-4444-4444-4444-444444444444', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'),
    
    -- Negocios de Pedro Sánchez
    ('d5555555-5555-5555-5555-555555555555', 'ERP Completo', 'Sistema ERP para manufactura', 500000.00, 'MXN', 'PROPUESTA', 80, '2025-02-20', 'c5555555-5555-5555-5555-555555555555', 'ffffffff-ffff-ffff-ffff-ffffffffffff'),
    ('d6666666-6666-6666-6666-666666666666', 'Sistema de Inventarios', 'Software de gestión de inventarios y POS', 150000.00, 'MXN', 'PROSPECTO', 25, '2025-03-15', 'c6666666-6666-6666-6666-666666666666', 'ffffffff-ffff-ffff-ffff-ffffffffffff');

-- ============================================
-- 5. ACTIVIDADES
-- ============================================
INSERT INTO actividades (id, tipo, titulo, descripcion, fecha_vencimiento, completada, negocio_id, cliente_id, asignado_a, creado_por) VALUES
    -- Actividades de hoy
    ('a1111111-1111-1111-1111-111111111111', 'LLAMADA', 'Llamada de seguimiento', 'Seguimiento sobre propuesta enviada', CURRENT_TIMESTAMP + INTERVAL '2 hours', false, 'd1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'dddddddd-dddd-dddd-dddd-dddddddddddd'),
    ('a2222222-2222-2222-2222-222222222222', 'REUNION', 'Reunión con Director de TI', 'Presentación de demo del sistema', CURRENT_TIMESTAMP + INTERVAL '1 day', false, 'd2222222-2222-2222-2222-222222222222', 'c2222222-2222-2222-2222-222222222222', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
    
    -- Actividades completadas
    ('a3333333-3333-3333-3333-333333333333', 'EMAIL', 'Envío de contrato', 'Enviar contrato de renovación firmado', CURRENT_TIMESTAMP - INTERVAL '1 day', true, 'd3333333-3333-3333-3333-333333333333', 'c3333333-3333-3333-3333-333333333333', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'),
    
    -- Actividades futuras
    ('a4444444-4444-4444-4444-444444444444', 'TAREA', 'Preparar propuesta comercial', 'Elaborar propuesta para ERP', CURRENT_TIMESTAMP + INTERVAL '3 days', false, 'd5555555-5555-5555-5555-555555555555', 'c5555555-5555-5555-5555-555555555555', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'cccccccc-cccc-cccc-cccc-cccccccccccc'),
    ('a5555555-5555-5555-5555-555555555555', 'LLAMADA', 'Primera llamada a prospecto', 'Contactar para agendar demo', CURRENT_TIMESTAMP + INTERVAL '5 days', false, 'd6666666-6666-6666-6666-666666666666', 'c6666666-6666-6666-6666-666666666666', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'ffffffff-ffff-ffff-ffff-ffffffffffff');

-- ============================================
-- 6. EMAILS (Historial)
-- ============================================
INSERT INTO emails (id, asunto, cuerpo, email_origen, email_destino, cliente_id, negocio_id, usuario_id) VALUES
    ('e1111111-1111-1111-1111-111111111111', 'Propuesta Comercial - CRM Enterprise', '<p>Estimado Roberto,</p><p>Adjunto encontrarás nuestra propuesta para la implementación del CRM.</p>', 'juan.perez@clientpro.com', 'roberto.gomez@techsolutions.mx', 'c1111111-1111-1111-1111-111111111111', 'd1111111-1111-1111-1111-111111111111', 'dddddddd-dddd-dddd-dddd-dddddddddddd'),
    ('e2222222-2222-2222-2222-222222222222', 'Confirmación de Renovación', '<p>Estimado Jorge,</p><p>Confirmamos la renovación de tus licencias.</p>', 'maria.rodriguez@clientpro.com', 'jorge.ramirez@corporativo.mx', 'c3333333-3333-3333-3333-333333333333', 'd3333333-3333-3333-3333-333333333333', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee');

-- ============================================
-- 7. NOTAS
-- ============================================
INSERT INTO notas (id, contenido, fijada, cliente_id, negocio_id, autor_id) VALUES
    ('1a111111-1111-1111-1111-111111111111', 'Cliente muy interesado en features de reportería avanzada. Enviar casos de éxito.', true, 'c1111111-1111-1111-1111-111111111111', 'd1111111-1111-1111-1111-111111111111', 'dddddddd-dddd-dddd-dddd-dddddddddddd'),
    ('2a222222-2222-2222-2222-222222222222', 'Contacto respondió positivamente. Agendar demo para próxima semana.', false, 'c2222222-2222-2222-2222-222222222222', 'd2222222-2222-2222-2222-222222222222', 'dddddddd-dddd-dddd-dddd-dddddddddddd'),
    ('3a333333-3333-3333-3333-333333333333', 'Cliente VIP. Siempre ofrecer descuentos especiales y soporte prioritario.', true, 'c3333333-3333-3333-3333-333333333333', NULL, 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee');

-- ============================================
-- 8. NOTIFICACIONES
-- ============================================
INSERT INTO notificaciones (id, tipo, titulo, mensaje, leida, usuario_id, negocio_relacionado_id, url_accion) VALUES
    -- No leídas
    ('4a111111-1111-1111-1111-111111111111', 'NEGOCIO_ASIGNADO', 'Nuevo negocio asignado', 'Te han asignado el negocio: Implementación CRM Enterprise', false, 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'd1111111-1111-1111-1111-111111111111', '/negocios/d1111111-1111-1111-1111-111111111111'),
    ('5a222222-2222-2222-2222-222222222222', 'TAREA_VENCIMIENTO', 'Tarea próxima a vencer', 'La tarea "Llamada de seguimiento" vence en 2 horas', false, 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'd1111111-1111-1111-1111-111111111111', '/actividades/a1111111-1111-1111-1111-111111111111'),
    
    -- Leídas
    ('6a333333-3333-3333-3333-333333333333', 'NEGOCIO_GANADO', '¡Negocio ganado!', 'El negocio "Renovación de Licencias" ha sido marcado como ganado', true, 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'd3333333-3333-3333-3333-333333333333', '/negocios/d3333333-3333-3333-3333-333333333333');

-- ============================================
-- VISTAS ÚTILES (Opcional)
-- ============================================

-- Vista: Negocios con información del cliente y vendedor
CREATE OR REPLACE VIEW v_resumen_negocios AS
SELECT 
    n.id AS negocio_id,
    n.titulo AS negocio_titulo,
    n.valor,
    n.moneda,
    n.etapa,
    n.probabilidad,
    n.fecha_cierre_esperada,
    c.nombre AS cliente_nombre,
    c.empresa AS cliente_empresa,
    u.nombre AS propietario_nombre,
    u.email AS propietario_email,
    t.nombre AS equipo_nombre
FROM negocios n
JOIN clientes c ON n.cliente_id = c.id
JOIN usuarios u ON n.propietario_id = u.id
JOIN equipos t ON u.equipo_id = t.id;

-- Vista: Actividades pendientes por usuario
CREATE OR REPLACE VIEW v_actividades_pendientes AS
SELECT 
    a.id AS actividad_id,
    a.tipo,
    a.titulo,
    a.fecha_vencimiento,
    u.nombre AS asignado_a,
    c.nombre AS cliente_nombre,
    n.titulo AS negocio_titulo
FROM actividades a
JOIN usuarios u ON a.asignado_a = u.id
LEFT JOIN clientes c ON a.cliente_id = c.id
LEFT JOIN negocios n ON a.negocio_id = n.id
WHERE a.completada = false
ORDER BY a.fecha_vencimiento ASC;

-- Vista: Pipeline de ventas por equipo
CREATE OR REPLACE VIEW v_pipeline_ventas AS
SELECT 
    t.nombre AS equipo_nombre,
    n.etapa,
    COUNT(n.id) AS cantidad_negocios,
    SUM(n.valor) AS valor_total,
    AVG(n.probabilidad) AS probabilidad_promedio
FROM negocios n
JOIN usuarios u ON n.propietario_id = u.id
JOIN equipos t ON u.equipo_id = t.id
GROUP BY t.nombre, n.etapa
ORDER BY t.nombre, n.etapa;

-- ============================================
-- CONSULTAS DE VERIFICACIÓN
-- ============================================

-- Ver todos los equipos y usuarios
SELECT t.nombre AS equipo, u.nombre AS usuario, u.rol 
FROM usuarios u 
JOIN equipos t ON u.equipo_id = t.id 
ORDER BY t.nombre, u.rol;

-- Ver pipeline de ventas
SELECT * FROM v_pipeline_ventas;

-- Ver actividades pendientes
SELECT * FROM v_actividades_pendientes;

-- ============================================
-- FIN DEL SEED
-- ============================================

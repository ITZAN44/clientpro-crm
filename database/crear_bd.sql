-- ============================================
-- SCRIPT DE CREACIÓN DE BASE DE DATOS
-- CRM "ClientPro"
-- ============================================
-- 
-- PASOS PARA EJECUTAR:
-- 
-- 1. Abrir psql (PowerShell):
--    psql -U postgres
-- 
-- 2. Dentro de psql, copiar y pegar estos comandos:
-- ============================================

-- Crear la base de datos
CREATE DATABASE clientpro_crm
    WITH 
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'Spanish_Mexico.1252'
    LC_CTYPE = 'Spanish_Mexico.1252'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;

-- Conectarse a la base de datos
\c clientpro_crm

-- Mensaje de confirmación
SELECT 'Base de datos clientpro_crm creada exitosamente!' AS status;

-- ============================================
-- SIGUIENTE PASO:
-- 
-- Ejecutar schema.sql y seed.sql desde PowerShell:
-- 
-- cd database
-- psql -U postgres -d clientpro_crm -f schema.sql
-- psql -U postgres -d clientpro_crm -f seed.sql
-- ============================================

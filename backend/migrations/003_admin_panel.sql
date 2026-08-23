-- =========================================================
-- PANEL DE ADMINISTRADOR - ASSURA
-- Migración de Base de Datos PostgreSQL
-- Fecha: 2026-08-23
-- =========================================================
-- Agrega columnas necesarias para el panel de administrador:
-- - bloqueado: para bloquear/desbloquear usuarios
-- - es_admin: para identificar al usuario administrador
-- =========================================================

BEGIN;

-- Agregar columna bloqueado a la tabla asesor
ALTER TABLE public.asesor ADD COLUMN IF NOT EXISTS bloqueado BOOLEAN DEFAULT FALSE;

-- Agregar columna bloqueado a la tabla estudiante
ALTER TABLE public.estudiante ADD COLUMN IF NOT EXISTS bloqueado BOOLEAN DEFAULT FALSE;

-- Agregar columna es_admin a la tabla asesor
ALTER TABLE public.asesor ADD COLUMN IF NOT EXISTS es_admin BOOLEAN DEFAULT FALSE;

COMMIT;

-- =========================================================
-- INSTRUCCIONES POST-MIGRACIÓN:
-- Ejecutar este comando para marcar tu cuenta como admin:
-- UPDATE public.asesor SET es_admin = TRUE WHERE email = 'tu-email@correo.com';
-- =========================================================

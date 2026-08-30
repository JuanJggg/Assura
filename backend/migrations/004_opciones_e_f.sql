-- =========================================================
-- OPCIONES E y F PARA PREGUNTAS DE PRUEBA
-- Migración de Base de Datos PostgreSQL
-- Fecha: 2026-08-29
-- =========================================================
-- Agrega columnas opcion_e y opcion_f (opcionales) y
-- actualiza los CHECK constraints para permitir E y F
-- como respuesta correcta.
-- =========================================================

BEGIN;

-- Agregar columnas opcionales E y F
ALTER TABLE public.prueba_pregunta 
  ADD COLUMN IF NOT EXISTS opcion_e VARCHAR(500),
  ADD COLUMN IF NOT EXISTS opcion_f VARCHAR(500);

-- Actualizar constraint de respuesta_correcta en prueba_pregunta
ALTER TABLE public.prueba_pregunta 
  DROP CONSTRAINT IF EXISTS prueba_pregunta_respuesta_correcta_check;

ALTER TABLE public.prueba_pregunta 
  ADD CONSTRAINT prueba_pregunta_respuesta_correcta_check 
  CHECK (respuesta_correcta IN ('A','B','C','D','E','F'));

-- Actualizar constraint de respuesta_estudiante en prueba_respuesta
ALTER TABLE public.prueba_respuesta
  DROP CONSTRAINT IF EXISTS prueba_respuesta_respuesta_estudiante_check;

ALTER TABLE public.prueba_respuesta
  ADD CONSTRAINT prueba_respuesta_respuesta_estudiante_check 
  CHECK (respuesta_estudiante IN ('A','B','C','D','E','F'));

COMMIT;

-- Verificación
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'prueba_pregunta' 
  AND column_name IN ('opcion_e', 'opcion_f');

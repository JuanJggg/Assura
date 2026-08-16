-- =========================================================
-- SISTEMA DE EVALUACIONES POST-PRUEBA - ASSURA
-- Migración de Base de Datos PostgreSQL
-- Fecha: 2026-08-16
-- =========================================================
-- Este script crea las tablas para evaluaciones bidireccionales
-- entre estudiantes y asesores después de completar la prueba POST.
-- =========================================================

BEGIN;

-- =========================================================
-- 1. TABLA: evaluacion_asesor
-- Evaluación del estudiante hacia el asesor (post prueba final)
-- =========================================================
CREATE TABLE IF NOT EXISTS public.evaluacion_asesor (
    id                  SERIAL PRIMARY KEY,
    asignacion_id       INTEGER NOT NULL REFERENCES public.prueba_asignacion(id) ON DELETE CASCADE,
    estudiante_id       INTEGER NOT NULL REFERENCES public.estudiante(id) ON DELETE CASCADE,
    asesor_id           INTEGER NOT NULL REFERENCES public.asesor(id) ON DELETE CASCADE,
    estrellas           INTEGER NOT NULL CHECK (estrellas BETWEEN 1 AND 5),
    comentario          TEXT,
    fecha_evaluacion    TIMESTAMP DEFAULT NOW(),
    UNIQUE (asignacion_id)  -- Una sola evaluación por asignación POST
);

COMMENT ON TABLE public.evaluacion_asesor IS 'Evaluación que hace el estudiante al asesor después de completar la prueba POST';
COMMENT ON COLUMN public.evaluacion_asesor.estrellas IS 'Puntuación de 1 a 5 estrellas';
COMMENT ON COLUMN public.evaluacion_asesor.comentario IS 'Comentario opcional del estudiante sobre el asesor';

-- =========================================================
-- 2. TABLA: evaluacion_estudiante
-- Evaluación del asesor hacia el estudiante (diligencia)
-- =========================================================
CREATE TABLE IF NOT EXISTS public.evaluacion_estudiante (
    id                  SERIAL PRIMARY KEY,
    asignacion_id       INTEGER NOT NULL REFERENCES public.prueba_asignacion(id) ON DELETE CASCADE,
    asesor_id           INTEGER NOT NULL REFERENCES public.asesor(id) ON DELETE CASCADE,
    estudiante_id       INTEGER NOT NULL REFERENCES public.estudiante(id) ON DELETE CASCADE,
    estrellas           INTEGER NOT NULL CHECK (estrellas BETWEEN 1 AND 5),
    comentario          TEXT,
    fecha_evaluacion    TIMESTAMP DEFAULT NOW(),
    UNIQUE (asignacion_id)  -- Una sola evaluación por asignación POST
);

COMMENT ON TABLE public.evaluacion_estudiante IS 'Evaluación que hace el asesor al estudiante sobre su diligencia después de la prueba POST';
COMMENT ON COLUMN public.evaluacion_estudiante.estrellas IS 'Puntuación de 1 a 5 estrellas';
COMMENT ON COLUMN public.evaluacion_estudiante.comentario IS 'Comentario del asesor sobre la diligencia del estudiante';

-- =========================================================
-- ÍNDICES PARA OPTIMIZAR CONSULTAS
-- =========================================================
CREATE INDEX IF NOT EXISTS idx_eval_asesor_asesor          ON public.evaluacion_asesor(asesor_id);
CREATE INDEX IF NOT EXISTS idx_eval_asesor_estudiante      ON public.evaluacion_asesor(estudiante_id);
CREATE INDEX IF NOT EXISTS idx_eval_asesor_asignacion      ON public.evaluacion_asesor(asignacion_id);
CREATE INDEX IF NOT EXISTS idx_eval_estudiante_asesor      ON public.evaluacion_estudiante(asesor_id);
CREATE INDEX IF NOT EXISTS idx_eval_estudiante_estudiante  ON public.evaluacion_estudiante(estudiante_id);
CREATE INDEX IF NOT EXISTS idx_eval_estudiante_asignacion  ON public.evaluacion_estudiante(asignacion_id);

COMMIT;

-- =========================================================
-- VERIFICACIÓN
-- =========================================================
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('evaluacion_asesor', 'evaluacion_estudiante')
ORDER BY table_name;

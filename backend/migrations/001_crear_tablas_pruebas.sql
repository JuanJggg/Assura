-- =========================================================
-- SISTEMA DE PRUEBAS DIAGNÓSTICAS - ASSURA
-- Migración de Base de Datos PostgreSQL
-- Fecha: 2026-07-25
-- =========================================================
-- Este script crea las tablas necesarias para el sistema de
-- pruebas de opción múltiple (A,B,C,D) que los asesores
-- asignan a estudiantes al inicio (PRE) y final (POST)
-- de las asesorías.
-- =========================================================

BEGIN;

-- =========================================================
-- 1. TABLA: prueba
-- Prueba/examen creada por un asesor para una materia
-- =========================================================
CREATE TABLE IF NOT EXISTS public.prueba (
    id              SERIAL PRIMARY KEY,
    asesor_id       INTEGER NOT NULL REFERENCES public.asesor(id) ON DELETE CASCADE,
    materia_id      INTEGER NOT NULL REFERENCES public.materia(id) ON DELETE CASCADE,
    titulo          VARCHAR(255) NOT NULL,
    descripcion     TEXT,
    fecha_creacion  TIMESTAMP DEFAULT NOW(),
    activa          CHAR(1) DEFAULT 'S'  -- 'S' = activa, 'N' = inactiva
);

COMMENT ON TABLE public.prueba IS 'Prueba/examen de opción múltiple creada por un asesor para una materia específica';
COMMENT ON COLUMN public.prueba.activa IS 'S = activa, N = inactiva';

-- =========================================================
-- 2. TABLA: prueba_pregunta
-- Preguntas de opción múltiple dentro de una prueba
-- =========================================================
CREATE TABLE IF NOT EXISTS public.prueba_pregunta (
    id                  SERIAL PRIMARY KEY,
    prueba_id           INTEGER NOT NULL REFERENCES public.prueba(id) ON DELETE CASCADE,
    texto_pregunta      TEXT NOT NULL,
    opcion_a            VARCHAR(500) NOT NULL,
    opcion_b            VARCHAR(500) NOT NULL,
    opcion_c            VARCHAR(500) NOT NULL,
    opcion_d            VARCHAR(500) NOT NULL,
    respuesta_correcta  CHAR(1) NOT NULL CHECK (respuesta_correcta IN ('A','B','C','D')),
    orden               INTEGER DEFAULT 0  -- Orden de aparición en la prueba
);

COMMENT ON TABLE public.prueba_pregunta IS 'Preguntas de opción múltiple (A,B,C,D) asociadas a una prueba';
COMMENT ON COLUMN public.prueba_pregunta.respuesta_correcta IS 'Letra de la opción correcta: A, B, C o D';
COMMENT ON COLUMN public.prueba_pregunta.orden IS 'Orden de aparición de la pregunta dentro de la prueba';

-- =========================================================
-- 3. TABLA: prueba_asignacion
-- Asignación de una prueba a un estudiante (PRE o POST)
-- =========================================================
CREATE TABLE IF NOT EXISTS public.prueba_asignacion (
    id                      SERIAL PRIMARY KEY,
    prueba_id               INTEGER NOT NULL REFERENCES public.prueba(id) ON DELETE CASCADE,
    estudiante_id           INTEGER NOT NULL REFERENCES public.estudiante(id) ON DELETE CASCADE,
    asesor_id               INTEGER NOT NULL REFERENCES public.asesor(id) ON DELETE CASCADE,
    tipo                    VARCHAR(4) NOT NULL CHECK (tipo IN ('PRE', 'POST')),  -- PRE = inicio, POST = final
    fecha_asignacion        TIMESTAMP DEFAULT NOW(),
    fecha_completada        TIMESTAMP,             -- NULL si no la ha completado
    puntaje                 NUMERIC(5,2),           -- Puntaje obtenido (ej: 75.00 para 75%)
    total_preguntas         INTEGER,                -- Total de preguntas en la prueba
    respuestas_correctas    INTEGER,                -- Cantidad de respuestas correctas
    estado                  VARCHAR(20) DEFAULT 'PENDIENTE' CHECK (estado IN ('PENDIENTE', 'EN_PROGRESO', 'COMPLETADA'))
);

COMMENT ON TABLE public.prueba_asignacion IS 'Asignación de una prueba a un estudiante, con tipo PRE (inicio) o POST (final) de asesoría';
COMMENT ON COLUMN public.prueba_asignacion.tipo IS 'PRE = prueba de inicio / diagnóstico, POST = prueba de cierre / evaluación final';
COMMENT ON COLUMN public.prueba_asignacion.puntaje IS 'Porcentaje de aciertos (0.00 a 100.00)';
COMMENT ON COLUMN public.prueba_asignacion.estado IS 'PENDIENTE = no iniciada, EN_PROGRESO = en curso, COMPLETADA = finalizada';

-- =========================================================
-- 4. TABLA: prueba_respuesta
-- Respuestas individuales del estudiante a cada pregunta
-- =========================================================
CREATE TABLE IF NOT EXISTS public.prueba_respuesta (
    id                      SERIAL PRIMARY KEY,
    asignacion_id           INTEGER NOT NULL REFERENCES public.prueba_asignacion(id) ON DELETE CASCADE,
    pregunta_id             INTEGER NOT NULL REFERENCES public.prueba_pregunta(id) ON DELETE CASCADE,
    respuesta_estudiante    CHAR(1) CHECK (respuesta_estudiante IN ('A','B','C','D')),
    es_correcta             BOOLEAN,               -- TRUE si coincide con la respuesta correcta
    fecha_respuesta         TIMESTAMP DEFAULT NOW(),
    UNIQUE (asignacion_id, pregunta_id)             -- Un estudiante solo responde una vez por pregunta/asignación
);

COMMENT ON TABLE public.prueba_respuesta IS 'Respuestas individuales del estudiante a cada pregunta de una prueba asignada';
COMMENT ON COLUMN public.prueba_respuesta.es_correcta IS 'TRUE si la respuesta del estudiante coincide con la respuesta correcta de la pregunta';

-- =========================================================
-- ÍNDICES PARA OPTIMIZAR CONSULTAS
-- =========================================================
CREATE INDEX IF NOT EXISTS idx_prueba_asesor            ON public.prueba(asesor_id);
CREATE INDEX IF NOT EXISTS idx_prueba_materia           ON public.prueba(materia_id);
CREATE INDEX IF NOT EXISTS idx_pregunta_prueba          ON public.prueba_pregunta(prueba_id);
CREATE INDEX IF NOT EXISTS idx_asignacion_prueba        ON public.prueba_asignacion(prueba_id);
CREATE INDEX IF NOT EXISTS idx_asignacion_estudiante    ON public.prueba_asignacion(estudiante_id);
CREATE INDEX IF NOT EXISTS idx_asignacion_asesor        ON public.prueba_asignacion(asesor_id);
CREATE INDEX IF NOT EXISTS idx_asignacion_tipo          ON public.prueba_asignacion(tipo);
CREATE INDEX IF NOT EXISTS idx_asignacion_estado        ON public.prueba_asignacion(estado);
CREATE INDEX IF NOT EXISTS idx_respuesta_asignacion     ON public.prueba_respuesta(asignacion_id);
CREATE INDEX IF NOT EXISTS idx_respuesta_pregunta       ON public.prueba_respuesta(pregunta_id);

COMMIT;

-- =========================================================
-- VERIFICACIÓN: Listar las tablas creadas
-- =========================================================
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('prueba', 'prueba_pregunta', 'prueba_asignacion', 'prueba_respuesta')
ORDER BY table_name;

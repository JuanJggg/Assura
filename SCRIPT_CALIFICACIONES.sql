-- =====================================================
-- SCRIPT SQL PARA SISTEMA DE CALIFICACIONES DE ASESORES
-- =====================================================
-- Ejecuta este script en tu base de datos PostgreSQL

-- Tabla para almacenar las calificaciones de los asesores
CREATE TABLE IF NOT EXISTS calificacion_asesor (
    id SERIAL PRIMARY KEY,
    id_estudiante INTEGER NOT NULL,
    id_asesor INTEGER NOT NULL,
    id_conversacion INTEGER,

    -- Criterios de evaluación (1-5)
    puntualidad INTEGER NOT NULL CHECK (puntualidad >= 1 AND puntualidad <= 5),
    claridad_explicacion INTEGER NOT NULL CHECK (claridad_explicacion >= 1 AND claridad_explicacion <= 5),
    dominio_tema INTEGER NOT NULL CHECK (dominio_tema >= 1 AND dominio_tema <= 5),
    amabilidad INTEGER NOT NULL CHECK (amabilidad >= 1 AND amabilidad <= 5),
    resolucion_dudas INTEGER NOT NULL CHECK (resolucion_dudas >= 1 AND resolucion_dudas <= 5),

    -- Promedio general calculado
    calificacion_general DECIMAL(3,2) NOT NULL,

    -- Comentarios adicionales (opcional)
    comentario TEXT,

    -- Metadatos
    fecha_calificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Restricciones
    CONSTRAINT fk_estudiante FOREIGN KEY (id_estudiante) REFERENCES estudiante(id) ON DELETE CASCADE,
    CONSTRAINT fk_asesor FOREIGN KEY (id_asesor) REFERENCES asesor(id) ON DELETE CASCADE,
    CONSTRAINT fk_conversacion FOREIGN KEY (id_conversacion) REFERENCES chats_conversacion(id) ON DELETE SET NULL,

    -- Un estudiante solo puede calificar una vez a un asesor por conversación
    CONSTRAINT unique_calificacion UNIQUE (id_estudiante, id_asesor, id_conversacion)
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_calificacion_asesor ON calificacion_asesor(id_asesor);
CREATE INDEX IF NOT EXISTS idx_calificacion_estudiante ON calificacion_asesor(id_estudiante);
CREATE INDEX IF NOT EXISTS idx_calificacion_general ON calificacion_asesor(calificacion_general DESC);

-- Comentarios en las tablas
COMMENT ON TABLE calificacion_asesor IS 'Almacena las calificaciones que los estudiantes dan a los asesores';
COMMENT ON COLUMN calificacion_asesor.puntualidad IS 'Calificación de 1-5 sobre la puntualidad del asesor';
COMMENT ON COLUMN calificacion_asesor.claridad_explicacion IS 'Calificación de 1-5 sobre qué tan claro explica el asesor';
COMMENT ON COLUMN calificacion_asesor.dominio_tema IS 'Calificación de 1-5 sobre el conocimiento del asesor';
COMMENT ON COLUMN calificacion_asesor.amabilidad IS 'Calificación de 1-5 sobre el trato del asesor';
COMMENT ON COLUMN calificacion_asesor.resolucion_dudas IS 'Calificación de 1-5 sobre la capacidad de resolver dudas';
COMMENT ON COLUMN calificacion_asesor.calificacion_general IS 'Promedio de todas las calificaciones';

-- Vista para obtener el ranking de mejores asesores
CREATE OR REPLACE VIEW ranking_asesores AS
SELECT
    a.id,
    a.nombres,
    a.apellidos,
    a.email,
    a.telefono,
    a.carrera,
    COUNT(DISTINCT ca.id) as total_calificaciones,
    ROUND(AVG(ca.calificacion_general), 2) as promedio_general,
    ROUND(AVG(ca.puntualidad), 2) as promedio_puntualidad,
    ROUND(AVG(ca.claridad_explicacion), 2) as promedio_claridad,
    ROUND(AVG(ca.dominio_tema), 2) as promedio_dominio,
    ROUND(AVG(ca.amabilidad), 2) as promedio_amabilidad,
    ROUND(AVG(ca.resolucion_dudas), 2) as promedio_resolucion,
    -- Categorización del asesor
    CASE
        WHEN AVG(ca.calificacion_general) >= 4.5 THEN 'Excelente'
        WHEN AVG(ca.calificacion_general) >= 4.0 THEN 'Muy Bueno'
        WHEN AVG(ca.calificacion_general) >= 3.5 THEN 'Bueno'
        WHEN AVG(ca.calificacion_general) >= 3.0 THEN 'Regular'
        ELSE 'Necesita Mejorar'
    END as categoria
FROM public.asesor a
LEFT JOIN calificacion_asesor ca ON a.id = ca.id_asesor
GROUP BY a.id, a.nombres, a.apellidos, a.email, a.telefono, a.carrera
HAVING COUNT(ca.id) > 0
ORDER BY promedio_general DESC NULLS LAST, total_calificaciones DESC;

COMMENT ON VIEW ranking_asesores IS 'Vista que muestra el ranking de asesores según sus calificaciones';

-- Función para calcular la categoría de un asesor específico
CREATE OR REPLACE FUNCTION obtener_categoria_asesor(asesor_id INTEGER)
RETURNS TABLE (
    categoria TEXT,
    promedio DECIMAL(3,2),
    total_calificaciones BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        CASE
            WHEN AVG(ca.calificacion_general) >= 4.5 THEN 'Excelente'
            WHEN AVG(ca.calificacion_general) >= 4.0 THEN 'Muy Bueno'
            WHEN AVG(ca.calificacion_general) >= 3.5 THEN 'Bueno'
            WHEN AVG(ca.calificacion_general) >= 3.0 THEN 'Regular'
            ELSE 'Necesita Mejorar'
        END as categoria,
        ROUND(AVG(ca.calificacion_general), 2) as promedio,
        COUNT(ca.id) as total_calificaciones
    FROM calificacion_asesor ca
    WHERE ca.id_asesor = asesor_id
    GROUP BY ca.id_asesor;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION obtener_categoria_asesor IS 'Función para obtener la categoría y estadísticas de un asesor específico';

-- =====================================================
-- DATOS DE PRUEBA (OPCIONAL - Puedes comentar esto)
-- =====================================================

-- Inserta algunas calificaciones de ejemplo si lo deseas
-- INSERT INTO calificacion_asesor (id_estudiante, id_asesor, id_conversacion, puntualidad, claridad_explicacion, dominio_tema, amabilidad, resolucion_dudas, calificacion_general, comentario)
-- VALUES
-- (27, 9, 16, 5, 5, 5, 5, 5, 5.00, 'Excelente asesor, muy claro en sus explicaciones'),
-- (27, 9, 16, 4, 4, 5, 5, 4, 4.40, 'Muy buen dominio del tema');

-- =====================================================
-- FIN DEL SCRIPT
-- =====================================================

const pool = require("../config/db.cjs");

// =============================================
// CRUD DE PRUEBAS
// =============================================

// Crear una prueba con sus preguntas
exports.crearPrueba = async (req, res) => {
    const { asesor_id, materia_id, titulo, descripcion, preguntas } = req.body;

    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        // Insertar la prueba
        const resultPrueba = await client.query(
            `INSERT INTO public.prueba (asesor_id, materia_id, titulo, descripcion)
             VALUES ($1, $2, $3, $4) RETURNING id`,
            [asesor_id, materia_id, titulo, descripcion]
        );

        const pruebaId = resultPrueba.rows[0].id;

        // Insertar las preguntas
        for (let i = 0; i < preguntas.length; i++) {
            const p = preguntas[i];
            await client.query(
                `INSERT INTO public.prueba_pregunta 
                 (prueba_id, texto_pregunta, opcion_a, opcion_b, opcion_c, opcion_d, opcion_e, opcion_f, respuesta_correcta, orden)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
                [pruebaId, p.texto_pregunta, p.opcion_a, p.opcion_b, p.opcion_c, p.opcion_d, p.opcion_e || null, p.opcion_f || null, p.respuesta_correcta, i + 1]
            );
        }

        await client.query("COMMIT");

        res.status(201).json({
            success: true,
            mensaje: "Prueba creada correctamente.",
            prueba_id: pruebaId
        });
    } catch (error) {
        await client.query("ROLLBACK");
        console.error("Error al crear prueba:", error);
        res.status(500).json({
            success: false,
            mensaje: "Error al crear la prueba"
        });
    } finally {
        client.release();
    }
};

// Obtener pruebas de un asesor
exports.getPruebasPorAsesor = async (req, res) => {
    const { asesor_id } = req.body;
    try {
        const result = await pool.query(
            `SELECT p.id, p.titulo, p.descripcion, p.fecha_creacion, p.activa,
                    m.nombre AS materia, p.materia_id,
                    COUNT(pp.id) AS total_preguntas
             FROM public.prueba p
             INNER JOIN public.materia m ON p.materia_id = m.id
             LEFT JOIN public.prueba_pregunta pp ON pp.prueba_id = p.id
             WHERE p.asesor_id = $1
             GROUP BY p.id, m.nombre
             ORDER BY p.fecha_creacion DESC`,
            [asesor_id]
        );
        res.json({ ok: true, pruebas: result.rows });
    } catch (error) {
        console.error("Error al obtener pruebas:", error);
        res.status(500).json({ ok: false, mensaje: "Error al obtener pruebas" });
    }
};

// Obtener preguntas de una prueba
exports.getPreguntasPrueba = async (req, res) => {
    const { prueba_id } = req.body;
    try {
        const result = await pool.query(
            `SELECT id, texto_pregunta, opcion_a, opcion_b, opcion_c, opcion_d, opcion_e, opcion_f, respuesta_correcta, orden
             FROM public.prueba_pregunta
             WHERE prueba_id = $1
             ORDER BY orden ASC`,
            [prueba_id]
        );
        res.json({ ok: true, preguntas: result.rows });
    } catch (error) {
        console.error("Error al obtener preguntas:", error);
        res.status(500).json({ ok: false, mensaje: "Error al obtener preguntas" });
    }
};

// Eliminar una prueba
exports.eliminarPrueba = async (req, res) => {
    const { prueba_id } = req.body;
    try {
        await pool.query("DELETE FROM public.prueba WHERE id = $1", [prueba_id]);
        res.json({ success: true, mensaje: "Prueba eliminada correctamente." });
    } catch (error) {
        console.error("Error al eliminar prueba:", error);
        res.status(500).json({ success: false, mensaje: "Error al eliminar la prueba" });
    }
};

// Activar/desactivar prueba
exports.toggleActivaPrueba = async (req, res) => {
    const { prueba_id, activa } = req.body;
    try {
        await pool.query(
            "UPDATE public.prueba SET activa = $1 WHERE id = $2",
            [activa, prueba_id]
        );
        res.json({ success: true, mensaje: "Estado actualizado." });
    } catch (error) {
        console.error("Error al cambiar estado:", error);
        res.status(500).json({ success: false, mensaje: "Error al actualizar estado" });
    }
};

// =============================================
// ASIGNACIÓN DE PRUEBAS
// =============================================

// Asignar prueba a un estudiante (PRE o POST)
exports.asignarPrueba = async (req, res) => {
    const { prueba_id, estudiante_id, asesor_id, tipo } = req.body;
    try {
        // Verificar que no exista ya una asignación del mismo tipo para este estudiante/asesor
        const existe = await pool.query(
            `SELECT id FROM public.prueba_asignacion 
             WHERE prueba_id = $1 AND estudiante_id = $2 AND asesor_id = $3 AND tipo = $4`,
            [prueba_id, estudiante_id, asesor_id, tipo]
        );

        if (existe.rowCount > 0) {
            return res.status(200).json({
                success: false,
                mensaje: `Ya existe una prueba ${tipo} asignada a este estudiante.`
            });
        }

        // Contar preguntas de la prueba
        const countResult = await pool.query(
            "SELECT COUNT(*) as total FROM public.prueba_pregunta WHERE prueba_id = $1",
            [prueba_id]
        );

        const result = await pool.query(
            `INSERT INTO public.prueba_asignacion 
             (prueba_id, estudiante_id, asesor_id, tipo, total_preguntas)
             VALUES ($1, $2, $3, $4, $5) RETURNING id`,
            [prueba_id, estudiante_id, asesor_id, tipo, parseInt(countResult.rows[0].total)]
        );

        res.status(201).json({
            success: true,
            mensaje: `Prueba ${tipo} asignada correctamente.`,
            asignacion_id: result.rows[0].id
        });
    } catch (error) {
        console.error("Error al asignar prueba:", error);
        res.status(500).json({ success: false, mensaje: "Error al asignar la prueba" });
    }
};

// Obtener pruebas asignadas a un estudiante
exports.getPruebasEstudiante = async (req, res) => {
    const { estudiante_id } = req.body;
    try {
        const result = await pool.query(
            `SELECT pa.id, pa.tipo, pa.estado, pa.puntaje, pa.total_preguntas,
                    pa.respuestas_correctas, pa.fecha_asignacion, pa.fecha_completada,
                    pa.asesor_id,
                    p.titulo, p.descripcion,
                    m.nombre AS materia,
                    a.nombres || ' ' || a.apellidos AS asesor
             FROM public.prueba_asignacion pa
             INNER JOIN public.prueba p ON pa.prueba_id = p.id
             INNER JOIN public.materia m ON p.materia_id = m.id
             INNER JOIN public.asesor a ON pa.asesor_id = a.id
             WHERE pa.estudiante_id = $1
             ORDER BY pa.fecha_asignacion DESC`,
            [estudiante_id]
        );
        res.json({ ok: true, asignaciones: result.rows });
    } catch (error) {
        console.error("Error al obtener pruebas del estudiante:", error);
        res.status(500).json({ ok: false, mensaje: "Error al obtener pruebas" });
    }
};

// Obtener preguntas de una asignación (para que el estudiante responda)
exports.getPreguntasAsignacion = async (req, res) => {
    const { asignacion_id } = req.body;
    try {
        // Obtener datos de la asignación
        const asignacion = await pool.query(
            `SELECT pa.*, p.titulo, p.descripcion, m.nombre AS materia
             FROM public.prueba_asignacion pa
             INNER JOIN public.prueba p ON pa.prueba_id = p.id
             INNER JOIN public.materia m ON p.materia_id = m.id
             WHERE pa.id = $1`,
            [asignacion_id]
        );

        if (asignacion.rowCount === 0) {
            return res.status(404).json({ ok: false, mensaje: "Asignación no encontrada" });
        }

        // Obtener preguntas SIN la respuesta correcta (para el estudiante)
        const preguntas = await pool.query(
            `SELECT id, texto_pregunta, opcion_a, opcion_b, opcion_c, opcion_d, opcion_e, opcion_f, orden
             FROM public.prueba_pregunta
             WHERE prueba_id = $1
             ORDER BY orden ASC`,
            [asignacion.rows[0].prueba_id]
        );

        // Obtener respuestas ya guardadas (si las hay)
        const respuestas = await pool.query(
            `SELECT pregunta_id, respuesta_estudiante
             FROM public.prueba_respuesta
             WHERE asignacion_id = $1`,
            [asignacion_id]
        );

        res.json({
            ok: true,
            asignacion: asignacion.rows[0],
            preguntas: preguntas.rows,
            respuestas_previas: respuestas.rows
        });
    } catch (error) {
        console.error("Error al obtener preguntas de asignación:", error);
        res.status(500).json({ ok: false, mensaje: "Error al obtener preguntas" });
    }
};

// =============================================
// RESPONDER PRUEBA
// =============================================

// Enviar respuestas de una prueba
exports.enviarRespuestas = async (req, res) => {
    const { asignacion_id, respuestas } = req.body;
    // respuestas = [{ pregunta_id, respuesta_estudiante }]

    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        // Actualizar estado a EN_PROGRESO
        await client.query(
            "UPDATE public.prueba_asignacion SET estado = 'EN_PROGRESO' WHERE id = $1",
            [asignacion_id]
        );

        let correctas = 0;

        for (const resp of respuestas) {
            // Obtener respuesta correcta
            const pregunta = await client.query(
                "SELECT respuesta_correcta FROM public.prueba_pregunta WHERE id = $1",
                [resp.pregunta_id]
            );

            const esCorrecta = pregunta.rows[0]?.respuesta_correcta?.trim() === resp.respuesta_estudiante?.trim();
            if (esCorrecta) correctas++;

            // Insertar o actualizar respuesta
            await client.query(
                `INSERT INTO public.prueba_respuesta (asignacion_id, pregunta_id, respuesta_estudiante, es_correcta)
                 VALUES ($1, $2, $3, $4)
                 ON CONFLICT (asignacion_id, pregunta_id) 
                 DO UPDATE SET respuesta_estudiante = $3, es_correcta = $4, fecha_respuesta = NOW()`,
                [asignacion_id, resp.pregunta_id, resp.respuesta_estudiante, esCorrecta]
            );
        }

        // Calcular puntaje
        const totalPreguntas = respuestas.length;
        const puntaje = totalPreguntas > 0 ? ((correctas / totalPreguntas) * 100).toFixed(2) : 0;

        // Actualizar asignación con resultados
        await client.query(
            `UPDATE public.prueba_asignacion 
             SET estado = 'COMPLETADA', 
                 fecha_completada = NOW(), 
                 puntaje = $1, 
                 respuestas_correctas = $2,
                 total_preguntas = $3
             WHERE id = $4`,
            [puntaje, correctas, totalPreguntas, asignacion_id]
        );

        await client.query("COMMIT");

        res.json({
            success: true,
            mensaje: "Prueba completada exitosamente.",
            resultado: {
                puntaje: parseFloat(puntaje),
                correctas,
                total: totalPreguntas
            }
        });
    } catch (error) {
        await client.query("ROLLBACK");
        console.error("Error al enviar respuestas:", error);
        res.status(500).json({ success: false, mensaje: "Error al enviar respuestas" });
    } finally {
        client.release();
    }
};

// =============================================
// ESTADÍSTICAS
// =============================================

// Estadísticas PRE vs POST de todos los estudiantes de un asesor
exports.getEstadisticasAsesor = async (req, res) => {
    const { asesor_id } = req.body;
    try {
        const result = await pool.query(
            `SELECT 
                e.id AS estudiante_id,
                e.nombres || ' ' || e.apellidos AS estudiante,
                m.nombre AS materia,
                MAX(CASE WHEN pa.tipo = 'PRE' THEN pa.puntaje END) AS puntaje_pre,
                MAX(CASE WHEN pa.tipo = 'POST' THEN pa.puntaje END) AS puntaje_post,
                MAX(CASE WHEN pa.tipo = 'PRE' THEN pa.estado END) AS estado_pre,
                MAX(CASE WHEN pa.tipo = 'POST' THEN pa.estado END) AS estado_post,
                MAX(CASE WHEN pa.tipo = 'POST' THEN pa.puntaje END) - 
                MAX(CASE WHEN pa.tipo = 'PRE' THEN pa.puntaje END) AS mejora,
                MAX(CASE WHEN pa.tipo = 'POST' AND pa.estado = 'COMPLETADA' THEN pa.id END) AS post_asignacion_id
             FROM public.prueba_asignacion pa
             INNER JOIN public.prueba p ON pa.prueba_id = p.id
             INNER JOIN public.estudiante e ON pa.estudiante_id = e.id
             INNER JOIN public.materia m ON p.materia_id = m.id
             WHERE pa.asesor_id = $1
             GROUP BY e.id, e.nombres, e.apellidos, m.nombre
             ORDER BY mejora DESC NULLS LAST`,
            [asesor_id]
        );
        res.json({ ok: true, estadisticas: result.rows });
    } catch (error) {
        console.error("Error al obtener estadísticas:", error);
        res.status(500).json({ ok: false, mensaje: "Error al obtener estadísticas" });
    }
};

// Obtener estudiantes que tienen conversación con un asesor (para asignar pruebas)
exports.getEstudiantesAsesor = async (req, res) => {
    const { asesor_id } = req.body;
    try {
        const result = await pool.query(
            `SELECT DISTINCT e.id, e.nombres, e.apellidos, e.email
             FROM public.chats_conversacion c
             INNER JOIN public.estudiante e ON c.id_estudiante = e.id
             WHERE c.id_asesor = $1
             ORDER BY e.nombres, e.apellidos`,
            [asesor_id]
        );
        res.json({ ok: true, estudiantes: result.rows });
    } catch (error) {
        console.error("Error al obtener estudiantes:", error);
        res.status(500).json({ ok: false, mensaje: "Error al obtener estudiantes" });
    }
};

// Detalle de respuestas de una asignación específica
exports.getDetalleRespuestas = async (req, res) => {
    const { asignacion_id } = req.body;
    try {
        const result = await pool.query(
            `SELECT pp.texto_pregunta, pp.opcion_a, pp.opcion_b, pp.opcion_c, pp.opcion_d,
                    pp.opcion_e, pp.opcion_f,
                    pp.respuesta_correcta, pr.respuesta_estudiante, pr.es_correcta
             FROM public.prueba_respuesta pr
             INNER JOIN public.prueba_pregunta pp ON pr.pregunta_id = pp.id
             WHERE pr.asignacion_id = $1
             ORDER BY pp.orden ASC`,
            [asignacion_id]
        );
        res.json({ ok: true, detalle: result.rows });
    } catch (error) {
        console.error("Error al obtener detalle:", error);
        res.status(500).json({ ok: false, mensaje: "Error al obtener detalle" });
    }
};

// =============================================
// EVALUACIONES POST-PRUEBA Y RANKING
// =============================================

// Estudiante evalúa al asesor (después de prueba POST)
exports.evaluarAsesor = async (req, res) => {
    const { asignacion_id, estudiante_id, asesor_id, estrellas, comentario } = req.body;
    try {
        // Verificar que la asignación sea POST y esté completada
        const asig = await pool.query(
            `SELECT id, tipo, estado FROM public.prueba_asignacion WHERE id = $1`,
            [asignacion_id]
        );
        if (asig.rowCount === 0) {
            return res.json({ success: false, mensaje: "Asignación no encontrada" });
        }
        if (asig.rows[0].tipo !== 'POST') {
            return res.json({ success: false, mensaje: "Solo se puede evaluar después de la prueba final (POST)" });
        }
        if (asig.rows[0].estado !== 'COMPLETADA') {
            return res.json({ success: false, mensaje: "La prueba debe estar completada para evaluar" });
        }

        // Verificar que no exista ya una evaluación
        const existe = await pool.query(
            `SELECT id FROM public.evaluacion_asesor WHERE asignacion_id = $1`,
            [asignacion_id]
        );
        if (existe.rowCount > 0) {
            return res.json({ success: false, mensaje: "Ya evaluaste a este asesor para esta prueba" });
        }

        await pool.query(
            `INSERT INTO public.evaluacion_asesor (asignacion_id, estudiante_id, asesor_id, estrellas, comentario)
             VALUES ($1, $2, $3, $4, $5)`,
            [asignacion_id, estudiante_id, asesor_id, estrellas, comentario || null]
        );

        res.json({ success: true, mensaje: "¡Evaluación enviada exitosamente!" });
    } catch (error) {
        console.error("Error al evaluar asesor:", error);
        res.status(500).json({ success: false, mensaje: "Error al enviar la evaluación" });
    }
};

// Asesor evalúa al estudiante (diligencia)
exports.evaluarEstudiante = async (req, res) => {
    const { asignacion_id, asesor_id, estudiante_id, estrellas, comentario } = req.body;
    try {
        // Verificar que la asignación sea POST y esté completada
        const asig = await pool.query(
            `SELECT id, tipo, estado FROM public.prueba_asignacion WHERE id = $1`,
            [asignacion_id]
        );
        if (asig.rowCount === 0) {
            return res.json({ success: false, mensaje: "Asignación no encontrada" });
        }
        if (asig.rows[0].tipo !== 'POST') {
            return res.json({ success: false, mensaje: "Solo se puede evaluar después de la prueba final (POST)" });
        }
        if (asig.rows[0].estado !== 'COMPLETADA') {
            return res.json({ success: false, mensaje: "La prueba debe estar completada para evaluar" });
        }

        // Verificar que no exista ya una evaluación
        const existe = await pool.query(
            `SELECT id FROM public.evaluacion_estudiante WHERE asignacion_id = $1`,
            [asignacion_id]
        );
        if (existe.rowCount > 0) {
            return res.json({ success: false, mensaje: "Ya evaluaste a este estudiante para esta prueba" });
        }

        await pool.query(
            `INSERT INTO public.evaluacion_estudiante (asignacion_id, asesor_id, estudiante_id, estrellas, comentario)
             VALUES ($1, $2, $3, $4, $5)`,
            [asignacion_id, asesor_id, estudiante_id, estrellas, comentario || null]
        );

        res.json({ success: true, mensaje: "¡Evaluación del estudiante enviada exitosamente!" });
    } catch (error) {
        console.error("Error al evaluar estudiante:", error);
        res.status(500).json({ success: false, mensaje: "Error al enviar la evaluación" });
    }
};

// Ranking de asesores (público)
exports.getRankingAsesores = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT 
                a.id AS asesor_id,
                a.nombres || ' ' || a.apellidos AS nombre,
                a.email,
                a.telefono,
                STRING_AGG(DISTINCT m.nombre, ', ') AS materias,
                COALESCE(ROUND(AVG(ea.estrellas)::numeric, 2), 0) AS promedio_estrellas,
                COUNT(ea.id) AS total_evaluaciones,
                MAX(ea.fecha_evaluacion) AS ultima_evaluacion
             FROM public.asesor a
             LEFT JOIN public.asesor_materia am ON a.id = am.asesor_id
             LEFT JOIN public.materia m ON am.materia_id = m.id
             LEFT JOIN public.evaluacion_asesor ea ON a.id = ea.asesor_id
             GROUP BY a.id, a.nombres, a.apellidos, a.email, a.telefono
             HAVING COUNT(ea.id) > 0
             ORDER BY promedio_estrellas DESC, total_evaluaciones DESC`
        );
        res.json({ ok: true, ranking: result.rows });
    } catch (error) {
        console.error("Error al obtener ranking:", error);
        res.status(500).json({ ok: false, mensaje: "Error al obtener el ranking" });
    }
};

// Evaluaciones/comentarios de un asesor específico
exports.getEvaluacionesAsesor = async (req, res) => {
    const { asesor_id } = req.body;
    try {
        const result = await pool.query(
            `SELECT 
                ea.id,
                ea.estrellas,
                ea.comentario,
                ea.fecha_evaluacion,
                e.nombres || ' ' || e.apellidos AS estudiante,
                p.titulo AS prueba_titulo,
                m.nombre AS materia
             FROM public.evaluacion_asesor ea
             INNER JOIN public.estudiante e ON ea.estudiante_id = e.id
             INNER JOIN public.prueba_asignacion pa ON ea.asignacion_id = pa.id
             INNER JOIN public.prueba p ON pa.prueba_id = p.id
             INNER JOIN public.materia m ON p.materia_id = m.id
             WHERE ea.asesor_id = $1
             ORDER BY ea.fecha_evaluacion DESC`,
            [asesor_id]
        );
        res.json({ ok: true, evaluaciones: result.rows });
    } catch (error) {
        console.error("Error al obtener evaluaciones:", error);
        res.status(500).json({ ok: false, mensaje: "Error al obtener evaluaciones" });
    }
};

// Verificar si hay evaluación pendiente para una asignación POST
exports.verificarEvaluacionPendiente = async (req, res) => {
    const { asignacion_id, tipo } = req.body;
    // tipo = 'asesor' (el estudiante evalúa al asesor) o 'estudiante' (el asesor evalúa al estudiante)
    try {
        const tabla = tipo === 'estudiante' ? 'evaluacion_estudiante' : 'evaluacion_asesor';
        const result = await pool.query(
            `SELECT id FROM public.${tabla} WHERE asignacion_id = $1`,
            [asignacion_id]
        );
        res.json({ 
            ok: true, 
            yaEvaluado: result.rowCount > 0 
        });
    } catch (error) {
        console.error("Error al verificar evaluación:", error);
        res.status(500).json({ ok: false, mensaje: "Error al verificar evaluación" });
    }
};

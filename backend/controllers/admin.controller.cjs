const pool = require("../config/db.cjs");

// =============================================
// ESTADÍSTICAS GLOBALES
// =============================================
exports.getEstadisticas = async (req, res) => {
    try {
        // Total estudiantes
        const totalEstudiantes = await pool.query(
            "SELECT COUNT(*) as total FROM public.estudiante"
        );
        // Total asesores
        const totalAsesores = await pool.query(
            "SELECT COUNT(*) as total FROM public.asesor WHERE es_admin = FALSE OR es_admin IS NULL"
        );
        // Usuarios bloqueados
        const bloqueados = await pool.query(
            `SELECT 
                (SELECT COUNT(*) FROM public.estudiante WHERE bloqueado = TRUE) +
                (SELECT COUNT(*) FROM public.asesor WHERE bloqueado = TRUE) as total`
        );
        // Total foros
        const totalForos = await pool.query(
            "SELECT COUNT(*) as total FROM public.foro"
        );
        // Total comentarios
        const totalComentarios = await pool.query(
            "SELECT COUNT(*) as total FROM public.comentario"
        );
        // Total pruebas
        const totalPruebas = await pool.query(
            "SELECT COUNT(*) as total FROM public.prueba"
        );
        // Pruebas completadas
        const pruebasCompletadas = await pool.query(
            "SELECT COUNT(*) as total FROM public.prueba_asignacion WHERE estado = 'COMPLETADA'"
        );
        // Total conversaciones de chat
        const totalChats = await pool.query(
            "SELECT COUNT(*) as total FROM public.chats_conversacion"
        );
        // Promedio de mejora PRE->POST
        const promedioMejora = await pool.query(
            `SELECT ROUND(AVG(mejora)::numeric, 2) as promedio
             FROM (
                 SELECT 
                     MAX(CASE WHEN tipo = 'POST' THEN puntaje END) -
                     MAX(CASE WHEN tipo = 'PRE' THEN puntaje END) AS mejora
                 FROM public.prueba_asignacion
                 WHERE estado = 'COMPLETADA'
                 GROUP BY estudiante_id, prueba_id
                 HAVING MAX(CASE WHEN tipo = 'PRE' THEN puntaje END) IS NOT NULL
                    AND MAX(CASE WHEN tipo = 'POST' THEN puntaje END) IS NOT NULL
             ) sub`
        );
        // Materias más populares
        const materiasPop = await pool.query(
            `SELECT m.nombre, COUNT(am.asesor_id) as total_asesores
             FROM public.materia m
             LEFT JOIN public.asesor_materia am ON m.id = am.materia_id
             GROUP BY m.id, m.nombre
             ORDER BY total_asesores DESC
             LIMIT 5`
        );
        // Asesores mejor evaluados
        const topAsesores = await pool.query(
            `SELECT 
                a.nombres || ' ' || a.apellidos AS nombre,
                COALESCE(ROUND(AVG(ea.estrellas)::numeric, 2), 0) AS promedio,
                COUNT(ea.id) AS evaluaciones
             FROM public.asesor a
             LEFT JOIN public.evaluacion_asesor ea ON a.id = ea.asesor_id
             GROUP BY a.id, a.nombres, a.apellidos
             HAVING COUNT(ea.id) > 0
             ORDER BY promedio DESC
             LIMIT 5`
        );
        // Actividad reciente (foros y comentarios por mes)
        const actividadMensual = await pool.query(
            `SELECT 
                TO_CHAR(fecha_creacion, 'YYYY-MM') AS mes,
                'foro' AS tipo,
                COUNT(*) AS total
             FROM public.foro
             GROUP BY TO_CHAR(fecha_creacion, 'YYYY-MM')
             UNION ALL
             SELECT 
                TO_CHAR(fecha_creacion, 'YYYY-MM') AS mes,
                'comentario' AS tipo,
                COUNT(*) AS total
             FROM public.comentario
             GROUP BY TO_CHAR(fecha_creacion, 'YYYY-MM')
             ORDER BY mes DESC
             LIMIT 12`
        );

        res.json({
            ok: true,
            estadisticas: {
                totalEstudiantes: parseInt(totalEstudiantes.rows[0].total),
                totalAsesores: parseInt(totalAsesores.rows[0].total),
                totalBloqueados: parseInt(bloqueados.rows[0].total),
                totalForos: parseInt(totalForos.rows[0].total),
                totalComentarios: parseInt(totalComentarios.rows[0].total),
                totalPruebas: parseInt(totalPruebas.rows[0].total),
                pruebasCompletadas: parseInt(pruebasCompletadas.rows[0].total),
                totalChats: parseInt(totalChats.rows[0].total),
                promedioMejora: parseFloat(promedioMejora.rows[0]?.promedio) || 0,
                materiasPop: materiasPop.rows,
                topAsesores: topAsesores.rows,
                actividadMensual: actividadMensual.rows
            }
        });
    } catch (error) {
        console.error("Error al obtener estadísticas:", error);
        res.status(500).json({ ok: false, mensaje: "Error al obtener estadísticas" });
    }
};

// =============================================
// GESTIÓN DE USUARIOS
// =============================================
exports.getUsuarios = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, nombres, apellidos, email, telefono, carrera, 'Estudiante' AS rol, 
                    COALESCE(bloqueado, FALSE) AS bloqueado,
                    codigo_estudiante AS codigo
             FROM public.estudiante
             UNION ALL
             SELECT id, nombres, apellidos, email, telefono, carrera, 'Asesor' AS rol, 
                    COALESCE(bloqueado, FALSE) AS bloqueado,
                    NULL AS codigo
             FROM public.asesor
             WHERE es_admin = FALSE OR es_admin IS NULL
             ORDER BY rol, nombres`
        );
        res.json({ ok: true, usuarios: result.rows });
    } catch (error) {
        console.error("Error al obtener usuarios:", error);
        res.status(500).json({ ok: false, mensaje: "Error al obtener usuarios" });
    }
};

exports.toggleBloqueo = async (req, res) => {
    const { id, rol, bloqueado } = req.body;
    try {
        const tabla = rol === "Asesor" ? "asesor" : "estudiante";
        await pool.query(
            `UPDATE public.${tabla} SET bloqueado = $1 WHERE id = $2`,
            [bloqueado, id]
        );
        res.json({ 
            ok: true, 
            mensaje: bloqueado ? "Usuario bloqueado correctamente" : "Usuario desbloqueado correctamente" 
        });
    } catch (error) {
        console.error("Error al cambiar bloqueo:", error);
        res.status(500).json({ ok: false, mensaje: "Error al cambiar estado de bloqueo" });
    }
};

// =============================================
// MODERACIÓN DEL FORO
// =============================================
exports.getForosAdmin = async (req, res) => {
    try {
        const foros = await pool.query(
            `SELECT a.id_foro AS id,
                    a.titulo,
                    a.descripcion,
                    a.fecha_creacion AS fecha,
                    a.rol AS rol_creador,
                    CASE
                        WHEN a.rol = 'Asesor' THEN c.nombres || ' ' || c.apellidos
                        ELSE b.nombres || ' ' || b.apellidos
                    END AS creado_por,
                    (SELECT COUNT(*) FROM public.comentario WHERE id_foro = a.id_foro) AS total_comentarios
             FROM public.foro a
             LEFT JOIN public.estudiante b ON a.creado_por = b.id
             LEFT JOIN public.asesor c ON a.creado_por = c.id
             ORDER BY a.fecha_creacion DESC`
        );

        const comentarios = await pool.query(
            `SELECT a.id_come AS id,
                    a.id_foro,
                    a.contenido,
                    a.fecha_creacion AS fecha,
                    a.rol AS rol_creador,
                    CASE
                        WHEN a.rol = 'Asesor' THEN c.nombres || ' ' || c.apellidos
                        ELSE b.nombres || ' ' || b.apellidos
                    END AS creado_por
             FROM public.comentario a
             LEFT JOIN public.estudiante b ON a.creado_por = b.id
             LEFT JOIN public.asesor c ON a.creado_por = c.id
             ORDER BY a.fecha_creacion DESC`
        );

        res.json({ ok: true, foros: foros.rows, comentarios: comentarios.rows });
    } catch (error) {
        console.error("Error al obtener foros admin:", error);
        res.status(500).json({ ok: false, mensaje: "Error al obtener foros" });
    }
};

exports.eliminarComentario = async (req, res) => {
    const { id } = req.body;
    try {
        await pool.query("DELETE FROM public.comentario WHERE id_come = $1", [id]);
        res.json({ ok: true, mensaje: "Comentario eliminado correctamente" });
    } catch (error) {
        console.error("Error al eliminar comentario:", error);
        res.status(500).json({ ok: false, mensaje: "Error al eliminar comentario" });
    }
};

exports.eliminarForo = async (req, res) => {
    const { id } = req.body;
    try {
        // Primero eliminar comentarios del foro
        await pool.query("DELETE FROM public.comentario WHERE id_foro = $1", [id]);
        // Luego eliminar el foro
        await pool.query("DELETE FROM public.foro WHERE id_foro = $1", [id]);
        res.json({ ok: true, mensaje: "Foro y sus comentarios eliminados correctamente" });
    } catch (error) {
        console.error("Error al eliminar foro:", error);
        res.status(500).json({ ok: false, mensaje: "Error al eliminar foro" });
    }
};

// =============================================
// SUPERVISIÓN DE CHATS
// =============================================
exports.getConversaciones = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT c.id,
                    c.id_estudiante,
                    c.id_asesor,
                    c.ultima_actividad,
                    e.nombres || ' ' || e.apellidos AS estudiante,
                    a.nombres || ' ' || a.apellidos AS asesor,
                    (SELECT COUNT(*) FROM public.chat_mensaje WHERE id_conversacion = c.id) AS total_mensajes,
                    (SELECT contenido FROM public.chat_mensaje 
                     WHERE id_conversacion = c.id 
                     ORDER BY fecha_envio DESC LIMIT 1) AS ultimo_mensaje
             FROM public.chats_conversacion c
             INNER JOIN public.estudiante e ON c.id_estudiante = e.id
             INNER JOIN public.asesor a ON c.id_asesor = a.id
             ORDER BY c.ultima_actividad DESC`
        );
        res.json({ ok: true, conversaciones: result.rows });
    } catch (error) {
        console.error("Error al obtener conversaciones:", error);
        res.status(500).json({ ok: false, mensaje: "Error al obtener conversaciones" });
    }
};

exports.getMensajesConversacion = async (req, res) => {
    const { id_conversacion } = req.body;
    try {
        const mensajes = await pool.query(
            `SELECT m.id, m.contenido, m.remitente_id, m.remitente_tipo, m.fecha_envio, m.leido
             FROM public.chat_mensaje m
             WHERE m.id_conversacion = $1
             ORDER BY m.fecha_envio ASC`,
            [id_conversacion]
        );

        // Obtener datos de la conversación
        const conv = await pool.query(
            `SELECT c.id,
                    e.nombres || ' ' || e.apellidos AS estudiante,
                    a.nombres || ' ' || a.apellidos AS asesor
             FROM public.chats_conversacion c
             INNER JOIN public.estudiante e ON c.id_estudiante = e.id
             INNER JOIN public.asesor a ON c.id_asesor = a.id
             WHERE c.id = $1`,
            [id_conversacion]
        );

        res.json({ 
            ok: true, 
            mensajes: mensajes.rows,
            conversacion: conv.rows[0] || null
        });
    } catch (error) {
        console.error("Error al obtener mensajes:", error);
        res.status(500).json({ ok: false, mensaje: "Error al obtener mensajes" });
    }
};

// =============================================
// ESTUDIANTES DE UN ASESOR
// =============================================
exports.getEstudiantesDeAsesor = async (req, res) => {
    const { id_asesor } = req.body;

    if (!id_asesor) {
        return res.status(400).json({ ok: false, mensaje: "Se requiere id_asesor" });
    }

    try {
        const result = await pool.query(
            `SELECT e.id, e.nombres, e.apellidos, e.email, e.carrera, e.telefono,
                    c.fecha_creacion as fecha_contacto
             FROM chats_conversacion c
             INNER JOIN estudiante e ON c.id_estudiante = e.id
             WHERE c.id_asesor = $1
             ORDER BY e.nombres ASC`,
            [id_asesor]
        );

        res.json({
            ok: true,
            estudiantes: result.rows,
            total: result.rowCount
        });
    } catch (error) {
        console.error("Error al obtener estudiantes del asesor:", error);
        res.status(500).json({ ok: false, mensaje: "Error al obtener estudiantes" });
    }
};

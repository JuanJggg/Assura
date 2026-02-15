const pool = require("../config/db.cjs");

exports.crearCalificacion = async (req, res) => {
  const {
    id_estudiante,
    id_asesor,
    id_conversacion,
    puntualidad,
    claridad_explicacion,
    dominio_tema,
    amabilidad,
    resolucion_dudas,
    comentario
  } = req.body;

  try {
    const calificacion_general = (
      puntualidad +
      claridad_explicacion +
      dominio_tema +
      amabilidad +
      resolucion_dudas
    ) / 5;

    const verificarExistente = await pool.query(
      `SELECT id FROM calificacion_asesor
       WHERE id_estudiante = $1 AND id_asesor = $2 AND id_conversacion = $3`,
      [id_estudiante, id_asesor, id_conversacion]
    );

    if (verificarExistente.rowCount > 0) {
      return res.status(400).json({
        ok: false,
        mensaje: "Ya has calificado esta sesión con este asesor"
      });
    }

    const result = await pool.query(
      `INSERT INTO calificacion_asesor
       (id_estudiante, id_asesor, id_conversacion, puntualidad, claridad_explicacion,
        dominio_tema, amabilidad, resolucion_dudas, calificacion_general, comentario)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        id_estudiante,
        id_asesor,
        id_conversacion,
        puntualidad,
        claridad_explicacion,
        dominio_tema,
        amabilidad,
        resolucion_dudas,
        calificacion_general,
        comentario || null
      ]
    );

    res.status(201).json({
      ok: true,
      mensaje: "Calificación registrada exitosamente",
      calificacion: result.rows[0]
    });
  } catch (error) {
    console.error("Error al crear calificación:", error);
    res.status(500).json({
      ok: false,
      mensaje: "Error al registrar la calificación",
      error: error.message
    });
  }
};

exports.obtenerCalificacionesAsesor = async (req, res) => {
  const { id_asesor } = req.params;

  try {
    const calificaciones = await pool.query(
      `SELECT
        ca.*,
        e.nombres as estudiante_nombre,
        e.apellidos as estudiante_apellido
       FROM calificacion_asesor ca
       LEFT JOIN estudiante e ON ca.id_estudiante = e.id
       WHERE ca.id_asesor = $1
       ORDER BY ca.fecha_calificacion DESC`,
      [id_asesor]
    );

    const estadisticas = await pool.query(
      `SELECT
        COUNT(*) as total_calificaciones,
        ROUND(AVG(calificacion_general), 2) as promedio_general,
        ROUND(AVG(puntualidad), 2) as promedio_puntualidad,
        ROUND(AVG(claridad_explicacion), 2) as promedio_claridad,
        ROUND(AVG(dominio_tema), 2) as promedio_dominio,
        ROUND(AVG(amabilidad), 2) as promedio_amabilidad,
        ROUND(AVG(resolucion_dudas), 2) as promedio_resolucion
       FROM calificacion_asesor
       WHERE id_asesor = $1`,
      [id_asesor]
    );

    res.json({
      ok: true,
      calificaciones: calificaciones.rows,
      estadisticas: estadisticas.rows[0]
    });
  } catch (error) {
    console.error("Error al obtener calificaciones:", error);
    res.status(500).json({
      ok: false,
      mensaje: "Error al obtener las calificaciones",
      error: error.message
    });
  }
};

exports.verificarYaCalificado = async (req, res) => {
  const { id_estudiante, id_asesor, id_conversacion } = req.query;

  try {
    const result = await pool.query(
      `SELECT id FROM calificacion_asesor
       WHERE id_estudiante = $1 AND id_asesor = $2 AND id_conversacion = $3`,
      [id_estudiante, id_asesor, id_conversacion]
    );

    res.json({
      ok: true,
      ya_calificado: result.rowCount > 0
    });
  } catch (error) {
    console.error("Error al verificar calificación:", error);
    res.status(500).json({
      ok: false,
      mensaje: "Error al verificar calificación",
      error: error.message
    });
  }
};

exports.obtenerRankingAsesores = async (req, res) => {
  const { limite } = req.query;
  const limit = limite ? parseInt(limite) : 10;

  try {
    const ranking = await pool.query(
      `SELECT * FROM ranking_asesores LIMIT $1`,
      [limit]
    );

    res.json({
      ok: true,
      ranking: ranking.rows
    });
  } catch (error) {
    console.error("Error al obtener ranking:", error);
    res.status(500).json({
      ok: false,
      mensaje: "Error al obtener el ranking de asesores",
      error: error.message
    });
  }
};

exports.obtenerCategoriaAsesor = async (req, res) => {
  const { id_asesor } = req.params;

  try {
    const result = await pool.query(
      `SELECT * FROM obtener_categoria_asesor($1)`,
      [id_asesor]
    );

    if (result.rowCount === 0) {
      return res.json({
        ok: true,
        categoria: "Sin Calificaciones",
        promedio: 0,
        total_calificaciones: 0
      });
    }

    res.json({
      ok: true,
      ...result.rows[0]
    });
  } catch (error) {
    console.error("Error al obtener categoría:", error);
    res.status(500).json({
      ok: false,
      mensaje: "Error al obtener la categoría del asesor",
      error: error.message
    });
  }
};

exports.obtenerMejoresAsesores = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
        a.id,
        a.nombres,
        a.apellidos,
        a.email,
        a.telefono,
        a.carrera,
        COALESCE(COUNT(DISTINCT ca.id), 0) as total_calificaciones,
        COALESCE(ROUND(AVG(ca.calificacion_general), 2), 0) as promedio_general,
        CASE
          WHEN AVG(ca.calificacion_general) >= 4.5 THEN 'Excelente'
          WHEN AVG(ca.calificacion_general) >= 4.0 THEN 'Muy Bueno'
          WHEN AVG(ca.calificacion_general) >= 3.5 THEN 'Bueno'
          WHEN AVG(ca.calificacion_general) >= 3.0 THEN 'Regular'
          WHEN AVG(ca.calificacion_general) IS NULL THEN 'Sin Calificaciones'
          ELSE 'Necesita Mejorar'
        END as categoria,
        COUNT(DISTINCT am.id) as total_materias,
        STRING_AGG(DISTINCT m.nombre, ', ') as materias
       FROM public.asesor a
       LEFT JOIN calificacion_asesor ca ON a.id = ca.id_asesor
       LEFT JOIN asesor_materia am ON a.id = am.asesor_id AND am.activa = 'S'
       LEFT JOIN materia m ON am.materia_id = m.id
       GROUP BY a.id, a.nombres, a.apellidos, a.email, a.telefono, a.carrera
       ORDER BY promedio_general DESC NULLS LAST, total_calificaciones DESC
       LIMIT 20`
    );

    res.json({
      ok: true,
      asesores: result.rows
    });
  } catch (error) {
    console.error("Error al obtener mejores asesores:", error);
    res.status(500).json({
      ok: false,
      mensaje: "Error al obtener los mejores asesores",
      error: error.message
    });
  }
};

exports.obtenerEstadisticasGenerales = async (req, res) => {
  try {
    const estadisticas = await pool.query(
      `SELECT
        COUNT(DISTINCT id_asesor) as total_asesores_calificados,
        COUNT(*) as total_calificaciones,
        ROUND(AVG(calificacion_general), 2) as promedio_plataforma,
        COUNT(CASE WHEN calificacion_general >= 4.5 THEN 1 END) as calificaciones_excelentes,
        COUNT(CASE WHEN calificacion_general >= 4.0 AND calificacion_general < 4.5 THEN 1 END) as calificaciones_muy_buenas,
        COUNT(CASE WHEN calificacion_general >= 3.5 AND calificacion_general < 4.0 THEN 1 END) as calificaciones_buenas,
        COUNT(CASE WHEN calificacion_general < 3.5 THEN 1 END) as calificaciones_regulares
       FROM calificacion_asesor`
    );

    res.json({
      ok: true,
      estadisticas: estadisticas.rows[0]
    });
  } catch (error) {
    console.error("Error al obtener estadísticas:", error);
    res.status(500).json({
      ok: false,
      mensaje: "Error al obtener estadísticas generales",
      error: error.message
    });
  }
};

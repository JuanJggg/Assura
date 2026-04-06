// chatbot.controller.cjs
// Controlador del chatbot IA: proxy hacia el microservicio Python + persistencia en BD

const pool = require("../config/db.cjs");
const axios = require("axios");

const PYTHON_API = process.env.CHATBOT_IA_URL || "http://localhost:8000";

// ── Helper: verificar que el microservicio Python está activo ────────────────────
async function checkPythonService() {
  try {
    await axios.get(`${PYTHON_API}/health`, { timeout: 3000 });
    return true;
  } catch {
    return false;
  }
}

// ── POST /chatbot/enviar ─────────────────────────────────────────────────────────
exports.enviarMensaje = async (req, res) => {
  const { id_estudiante, mensaje } = req.body;

  if (!id_estudiante || !mensaje?.trim()) {
    return res.status(400).json({
      ok: false,
      error: "Se requieren id_estudiante y mensaje",
    });
  }

  const mensajeLimpio = mensaje.trim();

  try {
    // 1. Verificar disponibilidad del servicio BERT
    const pythonActivo = await checkPythonService();

    let resultado;
    if (pythonActivo) {
      // 2a. Clasificar con BERT
      const response = await axios.post(
        `${PYTHON_API}/classify`,
        { mensaje: mensajeLimpio, id_estudiante },
        { timeout: 30000 }
      );
      resultado = response.data;
    } else {
      // 2b. Fallback si el microservicio no está disponible
      console.warn("⚠️ Microservicio BERT no disponible, usando fallback");
      resultado = {
        ok: true,
        categoria: "solicitud_asesoria",
        nombre_categoria: "Solicitud de Asesoría",
        icono: "🤝",
        color: "#8B5CF6",
        confianza: 0.5,
        respuesta:
          "Tu mensaje ha sido recibido. El sistema de IA está iniciando, por favor intenta en unos momentos o contacta directamente a un asesor.",
        recursos: [],
        consejo_rapido: "",
        scores: {},
        fallback: true,
      };
    }

    // 3. Guardar en la base de datos
    try {
      await pool.query(
        `INSERT INTO chatbot_mensajes 
         (id_estudiante, mensaje, categoria, confianza, respuesta, fecha)
         VALUES ($1, $2, $3, $4, $5, NOW())`,
        [
          id_estudiante,
          mensajeLimpio,
          resultado.categoria || "sin_clasificar",
          resultado.confianza || 0,
          resultado.respuesta || "",
        ]
      );
    } catch (dbError) {
      // No interrumpir la respuesta al usuario por error de BD
      console.error("Error guardando en BD:", dbError.message);
    }

    return res.json({
      ok: true,
      ...resultado,
    });
  } catch (err) {
    console.error("Error en enviarMensaje:", err.message);
    return res.status(500).json({
      ok: false,
      error: "Error al procesar el mensaje",
      details: err.message,
    });
  }
};

// ── GET /chatbot/historial/:userId ───────────────────────────────────────────────
exports.getHistorial = async (req, res) => {
  const { userId } = req.params;
  const limit = parseInt(req.query.limit) || 50;

  try {
    const result = await pool.query(
      `SELECT id, mensaje, categoria, confianza, respuesta, fecha
       FROM chatbot_mensajes
       WHERE id_estudiante = $1
       ORDER BY fecha DESC
       LIMIT $2`,
      [userId, limit]
    );

    return res.json({
      ok: true,
      historial: result.rows,
      total: result.rows.length,
    });
  } catch (err) {
    console.error("Error al obtener historial:", err.message);
    return res.status(500).json({ ok: false, error: "Error al obtener historial" });
  }
};

// ── GET /chatbot/estadisticas ─────────────────────────────────────────────────────
exports.getEstadisticas = async (req, res) => {
  try {
    // Conteo por categoría
    const countResult = await pool.query(
      `SELECT categoria, COUNT(*) as count
       FROM chatbot_mensajes
       GROUP BY categoria
       ORDER BY count DESC`
    );

    // Total de mensajes
    const totalResult = await pool.query(
      "SELECT COUNT(*) as total FROM chatbot_mensajes"
    );

    // Estudiantes únicos
    const estudiantesResult = await pool.query(
      "SELECT COUNT(DISTINCT id_estudiante) as total FROM chatbot_mensajes"
    );

    // Confianza promedio
    const confianzaResult = await pool.query(
      "SELECT AVG(confianza) as promedio FROM chatbot_mensajes"
    );

    // Mensajes últimos 7 días
    const recientesResult = await pool.query(
      `SELECT DATE(fecha) as dia, COUNT(*) as count
       FROM chatbot_mensajes
       WHERE fecha >= NOW() - INTERVAL '7 days'
       GROUP BY DATE(fecha)
       ORDER BY dia ASC`
    );

    // Estudiantes con más consultas (para asesor)
    const topEstudiantesResult = await pool.query(
      `SELECT cm.id_estudiante, 
              COALESCE(e.nombres || ' ' || e.apellidos, 'Estudiante #' || cm.id_estudiante) as nombre,
              COUNT(*) as total_consultas,
              MAX(cm.fecha) as ultima_consulta,
              MODE() WITHIN GROUP (ORDER BY cm.categoria) as categoria_frecuente
       FROM chatbot_mensajes cm
       LEFT JOIN estudiante e ON e.id = cm.id_estudiante
       GROUP BY cm.id_estudiante, e.nombres, e.apellidos
       ORDER BY total_consultas DESC
       LIMIT 10`
    );

    return res.json({
      ok: true,
      total_mensajes: parseInt(totalResult.rows[0]?.total || 0),
      total_estudiantes: parseInt(estudiantesResult.rows[0]?.total || 0),
      confianza_promedio: parseFloat(confianzaResult.rows[0]?.promedio || 0).toFixed(3),
      por_categoria: countResult.rows,
      actividad_reciente: recientesResult.rows,
      top_estudiantes: topEstudiantesResult.rows,
    });
  } catch (err) {
    console.error("Error en estadísticas:", err.message);
    return res.status(500).json({ ok: false, error: "Error al obtener estadísticas" });
  }
};

// ── GET /chatbot/consultas ────────────────────────────────────────────────────────
exports.getConsultas = async (req, res) => {
  const { categoria, limit = 100 } = req.query;

  try {
    let query = `
      SELECT cm.id, cm.id_estudiante, cm.mensaje, cm.categoria, 
             cm.confianza, cm.respuesta, cm.fecha,
             COALESCE(e.nombres || ' ' || e.apellidos, 'Estudiante #' || cm.id_estudiante) as nombre_estudiante
      FROM chatbot_mensajes cm
      LEFT JOIN estudiante e ON e.id = cm.id_estudiante
    `;
    const params = [];

    if (categoria) {
      query += " WHERE cm.categoria = $1";
      params.push(categoria);
    }

    query += " ORDER BY cm.fecha DESC LIMIT $" + (params.length + 1);
    params.push(parseInt(limit));

    const result = await pool.query(query, params);

    return res.json({
      ok: true,
      consultas: result.rows,
      total: result.rows.length,
    });
  } catch (err) {
    console.error("Error al obtener consultas:", err.message);
    return res.status(500).json({ ok: false, error: "Error al obtener consultas" });
  }
};

// ── GET /chatbot/health ───────────────────────────────────────────────────────────
exports.getHealth = async (req, res) => {
  const pythonActivo = await checkPythonService();
  return res.json({
    ok: true,
    nodejs: "activo",
    python_bert: pythonActivo ? "activo" : "inactivo",
    url_python: PYTHON_API,
  });
};

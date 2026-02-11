const pool = require("../config/db.cjs");
const pusher = require("../config/pusher.cjs");

exports.crearConversacion = async (req, res) => {
  const id_estudiante = req.body.id_estudiante || req.body.idUsuario;
  const id_asesor = req.body.id_asesor || req.body.idAsesor;
  
  console.log("Crear conversacion entre estudiante", id_estudiante, "y asesor", id_asesor);
  
  try {
    // Verificar si ya existe
    const existing = await pool.query(
      `SELECT c.*, 
              a.nombres AS asesor_nombre, 
              a.apellidos AS asesor_apellido,
              a.telefono AS asesor_telefono,
              '' AS asesor_materia
       FROM chats_conversacion c
       JOIN asesor a ON c.id_asesor = a.id
       WHERE c.id_estudiante = $1 AND c.id_asesor = $2`,
      [id_estudiante, id_asesor]
    );
    
    if (existing.rows.length > 0) {
      console.log("Conversación existente encontrada:", existing.rows[0]);
      return res.json({ 
        ok: true, 
        conversacion: existing.rows[0],
        nuevo: false 
      });
    }
    
    // Crear nueva conversación
    const result = await pool.query(
      "INSERT INTO chats_conversacion (id_estudiante, id_asesor, ultima_actividad) VALUES ($1, $2, NOW()) RETURNING *",
      [id_estudiante, id_asesor]
    );
    
    // Obtener datos completos
    const conversacionCompleta = await pool.query(
      `SELECT c.*, 
              a.nombres AS asesor_nombre, 
              a.apellidos AS asesor_apellido,
              a.telefono AS asesor_telefono,
              '' AS asesor_materia
       FROM chats_conversacion c
       JOIN asesor a ON c.id_asesor = a.id
       WHERE c.id = $1`,
      [result.rows[0].id]
    );
    
    console.log("Nueva conversación creada:", conversacionCompleta.rows[0]);
    
    res.json({ 
      ok: true, 
      conversacion: conversacionCompleta.rows[0],
      nuevo: true 
    });
  } catch (err) {
    console.error("Error al crear conversacion:", err);
    console.error("Detalles del error:", {
      message: err.message,
      code: err.code,
      detail: err.detail,
      constraint: err.constraint
    });
    res.status(500).json({ 
      error: "Error al crear conversacion",
      details: err.message,
      code: err.code
    });
  }
};

exports.getConversacion = async (req, res) => {
  const { tipo, id } = req.params;
  
  try {
    let query;
    if (tipo === "estudiante") {
      query = `SELECT c.*, 
               a.nombres AS asesor_nombre, 
               a.apellidos AS asesor_apellido,
               a.telefono AS asesor_telefono,
               '' AS asesor_materia,
               (SELECT contenido FROM chat_mensaje 
                WHERE id_conversacion = c.id 
                ORDER BY fecha_envio DESC LIMIT 1) as ultimo_mensaje
       FROM chats_conversacion c
       JOIN asesor a ON c.id_asesor = a.id
       WHERE c.id_estudiante = $1
       ORDER BY c.ultima_actividad DESC`;
    } else {
      query = `SELECT c.*, 
               e.nombres AS estudiante_nombre, 
               e.apellidos AS estudiante_apellido,
               (SELECT contenido FROM chat_mensaje 
                WHERE id_conversacion = c.id 
                ORDER BY fecha_envio DESC LIMIT 1) as ultimo_mensaje
       FROM chats_conversacion c
       JOIN estudiante e ON c.id_estudiante = e.id
       WHERE c.id_asesor = $1
       ORDER BY c.ultima_actividad DESC`;
    }
    
    const result = await pool.query(query, [id]);
    res.json({ ok: true, conversaciones: result.rows });
  } catch (err) {
    console.error("Error al obtener conversacion:", err);
    res.status(500).json({ error: "Error al obtener conversacion" });
  }
};

exports.getMensajes = async (req, res) => {
  const { id_conversacion } = req.params;
  
  try {
    const result = await pool.query(
      `SELECT * FROM chat_mensaje 
       WHERE id_conversacion = $1 
       ORDER BY fecha_envio ASC`,
      [id_conversacion]
    );
    res.json({ ok: true, mensajes: result.rows });
  } catch (err) {
    console.error("Error al obtener mensajes:", err);
    res.status(500).json({ error: "Error al obtener mensajes" });
  }
};

exports.guardarMensaje = async (data) => {
  const { chatId, content, senderId } = data;

  try {
    const result = await pool.query(
      `INSERT INTO chat_mensaje (id_conversacion, contenido, id_usuario, fecha_envio)
       VALUES ($1, $2, $3, NOW()) RETURNING *`,
      [chatId, content, senderId]
    );

    await pool.query(
      "UPDATE chats_conversacion SET ultima_actividad = NOW() WHERE id = $1",
      [chatId]
    );

    return result.rows[0];
  } catch (err) {
    console.error("Error al guardar mensaje:", err);
    throw err;
  }
};

exports.enviarMensaje = async (req, res) => {
  const { chatId, content, senderId } = req.body;

  if (!chatId || !content || !senderId) {
    return res.status(400).json({
      error: "Faltan datos requeridos",
      required: ["chatId", "content", "senderId"]
    });
  }

  try {
    const mensajeGuardado = await exports.guardarMensaje({ chatId, content, senderId });

    const conversacion = await pool.query(
      "SELECT id_estudiante, id_asesor FROM chats_conversacion WHERE id = $1",
      [chatId]
    );

    if (conversacion.rows.length === 0) {
      return res.status(404).json({ error: "Conversación no encontrada" });
    }

    const { id_estudiante, id_asesor } = conversacion.rows[0];
    const receptorId = senderId == id_estudiante ? id_asesor : id_estudiante;

    await pool.query(
      `INSERT INTO chats_notificacion (id_conversacion, id_receptor, leido, fecha_creacion)
       VALUES ($1, $2, false, NOW())
       ON CONFLICT (id_conversacion, id_receptor)
       DO UPDATE SET leido = false, fecha_creacion = NOW()`,
      [chatId, receptorId]
    );

    await pusher.trigger(`chat-${chatId}`, "nuevo-mensaje", {
      id: mensajeGuardado.id,
      id_conversacion: chatId,
      contenido: content,
      id_usuario: senderId,
      fecha_envio: mensajeGuardado.fecha_envio,
    });

    res.json({
      ok: true,
      mensaje: mensajeGuardado,
      message: "Mensaje enviado exitosamente"
    });
  } catch (err) {
    console.error("Error al enviar mensaje:", err);
    res.status(500).json({
      error: "Error al enviar mensaje",
      details: err.message
    });
  }
};
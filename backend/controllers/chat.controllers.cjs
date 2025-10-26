const pool = require("../config/db.cjs");

exports.crearConversacion = async (req, res) => {
  // aceptar ambos nombres posibles
  const id_estudiante = req.body.id_estudiante || req.body.idUsuario;
  const id_asesor = req.body.id_asesor || req.body.idAsesor;
  console.log("Crear conversacion entre estudiante", id_estudiante, "y asesor", id_asesor);

  try {
    const existing = await pool.query(
      "SELECT * FROM chats_conversacion WHERE id_estudiante = $1 AND id_asesor = $2",
      [id_estudiante, id_asesor]
    );

    if (existing.rows.length > 0) {
      return res.json({ ok: true, conversacion: existing.rows[0] });
    }

    const result = await pool.query(
      "INSERT INTO chats_conversacion (id_estudiante, id_asesor) VALUES ($1, $2) RETURNING *",
      [id_estudiante, id_asesor]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.log("Error al crear conversacion", err);
    res.status(500).json({ error: "Error al crear conversacion" });
  }
};


exports.getConversacion = async (req, res) => {
  const { tipo, id } = req.params;

  try {
    let query;
    if (tipo === "estudiante") {
      query = `SELECT c.*, a.nombres AS asesor_nombre, a.apellidos AS asesor_apellido 
               FROM chats_conversacion c 
               JOIN asesor a ON c.id_asesor = a.id
               WHERE c.id_estudiante = $1
               ORDER BY c.ultima_actividad DESC`;
    } else {
      query = `SELECT c.*, e.nombres AS estudiante_nombre, e.apellidos AS estudiante_apellido
               FROM chats_conversacion c 
               JOIN estudiante e ON c.id_estudiante = e.id
               WHERE c.id_asesor = $1
               ORDER BY c.ultima_actividad DESC`;
    }

    const result = await pool.query(query, [id]);
    res.json(result.rows);
  } catch (err) {
    console.log("Error al obtener conversacion", err);
    res.status(500).json({ error: "Error al obtener conversacion" });
  }
};

exports.getMensajes = async (req, res) => {
    const { id_conversacion } = req.params;
    try {
        const result = await pool.query(
            `SELECT * FROM chat_mensaje WHERE id_conversacion = $1 ORDER BY fecha_envio ASC`,
            [id_conversacion]
        )
        res.json(result.rows);
    }catch (err) {
        console.log("Error al obtener mensajes", err);
        res.status(500).json({error: "Error al obtener mensajes"});
    }
}

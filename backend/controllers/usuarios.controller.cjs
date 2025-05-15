const pool = require("../config/db.cjs");

exports.getLogin = async (req, res) => {
  const { password, email } = req.body;
  console.log(password,email);
  
  try {
    const result = await pool.query(`
                                    SELECT * FROM (
                                      SELECT email, password FROM public.asesor
                                      UNION
                                      SELECT email, password FROM public.estudiante
                                    ) AS usuarios
                                    WHERE email = $1 AND password = $2
    `, [email, password]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
};

exports.crearUsuario = async (req, res) => {
  const { nombre, correo } = req.body;
  try {
    await pool.query("INSERT INTO usuarios(nombre, correo) VALUES($1, $2)", [
      nombre,
      correo,
    ]);
    res.status(201).json({ mensaje: "Usuario creado" });
  } catch (error) {
    res.status(500).json({ error: "Error al crear usuario" });
  }
};

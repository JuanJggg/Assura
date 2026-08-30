const pool = require("../config/db.cjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

exports.getLogin = async (req, res) => {
  const { password, email } = req.body;

  console.log("Datos de login", {email, password});

  try {
    const result = await pool.query(
      `
        SELECT *
        FROM (
          SELECT email, password, id, 'Asesor' rol, nombres, apellidos, carrera,
                 COALESCE(bloqueado, FALSE) AS bloqueado,
                 COALESCE(es_admin, FALSE) AS es_admin
          FROM public.asesor
          UNION
          SELECT email, password, id, 'Estudiante' rol, nombres, apellidos, carrera,
                 COALESCE(bloqueado, FALSE) AS bloqueado,
                 FALSE AS es_admin
          FROM public.estudiante
        ) AS usuarios
        WHERE email = $1
      `,
      [email]
    );

    console.log("Resultado de login", result.rows);
    
    if (result.rowCount === 0) {
      console.log("Usuario no encontrado");
      return res.status(401).json({ ok: false, mensaje: "Usuario no encontrado" });
    }

    const usuario = result.rows[0];
    console.log("Usuario encontrado", usuario);

    // Verificar si el usuario está bloqueado
    if (usuario.bloqueado) {
      console.log("Usuario bloqueado:", usuario.email);
      return res.status(403).json({ ok: false, mensaje: "Tu cuenta ha sido bloqueada. Contacta al administrador." });
    }

    // Verificar si el usuario tiene contraseña
    const match = await bcrypt.compare(password, usuario.password);
    console.log("Contraseña compartida", match);
    if (!match) {
      console.log("Contraseña incorrecta");
       return res.status(401).json({ ok: false, mensaje: "Contraseña incorrecta" });
    }

    // Determinar rol (Admin si es_admin es true)
    const rolFinal = usuario.es_admin ? "Admin" : usuario.rol;

    console.log("Login exitoso para usuario:", usuario.email, "Rol:", rolFinal);

    res.json({
      ok: true,
      mensaje: "Inicio de sesión exitoso",
      usuario: {
        id: usuario.id,
        nombres: usuario.nombres,
        apellidos: usuario.apellidos,
        rol: rolFinal,
        email: usuario.email,
        carrera: usuario.carrera,
      },
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, mensaje: "Error al obtener usuarios" });
  }
};


exports.crearUsuario = async (req, res) => {
  console.log("crear usuario", req.body);
  const {
    nombres,
    apellidos,
    codigo,
    roles,
    telefono,
    carrera,
    email,
    password,
  } = req.body;
  try {

    // Encriptar la nueva contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    if (roles === "Asesor") {
      console.log("Insertando asesor...");
      await pool.query(
        "INSERT INTO public.asesor(nombres,apellidos,email,telefono,carrera,password) VALUES($1,$2,$3,$4,$5,$6)",
        [nombres, apellidos, email, telefono, carrera, hashedPassword]
      );
    } else {
      await pool.query(
        "INSERT INTO public.estudiante(codigo_estudiante,nombres,apellidos,email,telefono,carrera,password) VALUES($1,$2,$3,$4,$5,$6,$7)",
        [codigo, nombres, apellidos, email, telefono, carrera, hashedPassword]
      );
    }

    res.status(201).json({
      success: true,
      mensaje: "Usuario registrado correctamente.",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      sucess: false,
      mensaje: "Error al crear usuario, intente de nuevo.",
    });
  }
};

exports.updateUsuario = async (req, res) => {
  const { id, rol, nombres, apellidos, telefono, carrera, email } = req.body;

  console.log("Actualizar usuario:", { id, rol, nombres, apellidos, telefono, carrera, email });

  if (!id || !rol) {
    return res.status(400).json({ ok: false, mensaje: "Faltan datos requeridos (id, rol)" });
  }

  try {
    const tabla = rol === "Asesor" || rol === "Admin" ? "asesor" : "estudiante";

    const result = await pool.query(
      `UPDATE public.${tabla} SET nombres = $1, apellidos = $2, telefono = $3, carrera = $4, email = $5 WHERE id = $6 RETURNING id, nombres, apellidos, telefono, carrera, email`,
      [nombres, apellidos, telefono, carrera, email, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ ok: false, mensaje: "Usuario no encontrado" });
    }

    const usuario = result.rows[0];
    console.log("Usuario actualizado:", usuario);

    res.json({
      ok: true,
      mensaje: "Datos actualizados correctamente",
      usuario: {
        id: usuario.id,
        nombres: usuario.nombres,
        apellidos: usuario.apellidos,
        telefono: usuario.telefono,
        carrera: usuario.carrera,
        email: usuario.email,
      },
    });
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    res.status(500).json({ ok: false, mensaje: "Error al actualizar los datos" });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    console.log("Solicitud recibida para:", email);
    console.log("GMAIL_USER:", process.env.GMAIL_USER);
    console.log("GMAIL_PASS cargada:", process.env.GMAIL_PASS ? "Sí" : "No");

    // Verificar usuario
    let usuario = null;
    let result = await pool.query(
      "SELECT * FROM public.asesor WHERE email = $1",
      [email]
    );

    if (result.rowCount > 0) {
      usuario = result.rows[0];
    } else {
      result = await pool.query(
        "SELECT * FROM public.estudiante WHERE email = $1",
        [email]
      );
      if (result.rowCount > 0) {
        usuario = result.rows[0];
      }
    }

    if (!usuario) {
      console.log(
        "Usuario no encontrado, simulando respuesta sin enviar correo"
      );
      return res.json({
        ok: true,
        mensaje: "Se enviará un enlace para recuperar la contraseña",
      });
    }

    const token = jwt.sign({ email }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });
    const link = `${
      process.env.FRONTEND_URL || "http://localhost:5173"
    }/ResetPassword/${token}`;
    console.log("Enlace generado:", link);

    // Configurar transporte — .trim() para evitar espacios en la contraseña
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: (process.env.GMAIL_USER || "").trim(),
        pass: (process.env.GMAIL_PASS || "").trim(),
      },
    });

    const mailOptions = {
      from: `"Soporte Assura" <${(process.env.GMAIL_USER || "").trim()}>`,
      to: email,
      subject: "Recuperación de contraseña - Assura",
      html: `
        <h2>Recuperación de contraseña</h2>
        <p>Hola ${
          usuario.nombres || "usuario"
        }, haz clic en el enlace:</p>
        <a href="${link}" target="_blank">${link}</a>
        <p>Este enlace expira en 15 minutos.</p>
      `,
    };

    // Intentar enviar
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log("Correo enviado:", info.response);
    } catch (smtpError) {
      console.error("Error SMTP al enviar correo:", smtpError.message);
      // No revelar al usuario si el envío falló (seguridad)
    }

    // Siempre responder OK para no revelar si el email existe
    res.json({
      ok: true,
      mensaje: "Si el correo está registrado, recibirás un enlace de recuperación.",
    });
  } catch (error) {
    console.error("Error completo:", error);
    res.status(500).json({ ok: false, mensaje: "Error al procesar la solicitud" });
  }
};

exports.validateToken = async (req, res) => {
  const { token } = req.params;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ ok: true, mensaje: "Token validado", email: decoded.email });
  } catch (error) {
    console.log("Error en validateToken:", error);
    res.status(400).json({ ok: false, mensaje: "Token no valido" });
  }
};

exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    console.log("Token recibido:", token);
    console.log("Password recibido:", password);

    // Decodificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const email = decoded.email;
    console.log("Email decodificado:", email);

    // Encriptar la nueva contraseña
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("Contraseña encriptada:", hashedPassword);

    // Actualizar la contraseña en la tabla asesor
    let result = await pool.query(
      "UPDATE public.asesor SET password = $1 WHERE email = $2 RETURNING *",
      [hashedPassword, email]
    );

    // Verificar si el usuario es asesor o estudiante
    if (result.rowCount === 0) {
      console.log("Usuario no encontrado en tabla asesor, intentando en estudiante");

      result = await pool.query(
        "UPDATE public.estudiante SET password = $1 WHERE email = $2 RETURNING *",
        [hashedPassword, email]
      );
    }

    if (result.rowCount === 0) {
      console.log("Usuario no encontrado en la base de datos");
      return res
        .status(404)
        .json({ ok: false, mensaje: "Usuario no encontrado" });
    }

    console.log("Contraseña actualizada correctamente para:", email);
    res.json({ ok: true, mensaje: "Contraseña actualizada correctamente" });
  } catch (error) {
    console.log("Error en resetPassword:", error);
    res
      .status(400)
      .json({
        ok: false,
        mensaje: error.message || "Error al actualizar la contraseña",
      });
  }
};

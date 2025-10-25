const pool = require("../config/db.cjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
require("dotenv").config();

exports.getLogin = async (req, res) => {
  const { password, email } = req.body;

  console.log("Datos de login", {email, password});

  try {
    const result = await pool.query(
      `
        SELECT *
        FROM (
          SELECT email, password, id, 'Asesor' rol, nombres, apellidos FROM public.asesor
          UNION
          SELECT email, password, id, 'Estudiante' rol, nombres, apellidos FROM public.estudiante
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

    // Verificar si el usuario tiene contraseña
    const match = await bcrypt.compare(password, usuario.password);
    console.log("Contraseña compartida", match);
    if (!match) {
      console.log("Contraseña incorrecta");
       return res.status(401).json({ ok: false, mensaje: "Contraseña incorrecta" });
    }

    console.log("Login exitoso para usuario:", usuario.email);

    res.json({
      ok: true,
      mensaje: "Inicio de sesión exitoso",
      usuario: {
        id: usuario.id,
        nombres: usuario.nombres,
        apellidos: usuario.apellidos,
        rol: usuario.rol,
        email: usuario.email,
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

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    console.log("Solicitud recibida para:", email);
    console.log("GMAIL_USER:", process.env.GMAIL_USER);
    console.log("GMAIL_PASS cargada:", process.env.GMAIL_PASS ? "Sí" : "No");

    // Verificar usuario
    const result = await pool.query(
      "SELECT * FROM public.asesor WHERE email = $1",
      [email]
    );
    if (result.rowCount === 0) {
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

    // Configurar transporte
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    // 🔍 Probar conexión SMTP
    transporter.verify((error, success) => {
      if (error) {
        console.error("Error de conexión SMTP:", error);
      } else {
        console.log("Conexión SMTP exitosa, listo para enviar.");
      }
    });

    const mailOptions = {
      from: `"Soporte Assura" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Recuperación de contraseña - Assura",
      html: `
        <h2>Recuperación de contraseña</h2>
        <p>Hola ${
          result.rows[0].nombres || "usuario"
        }, haz clic en el enlace:</p>
        <a href="${link}" target="_blank">${link}</a>
        <p>Este enlace expira en 15 minutos.</p>
      `,
    };

    // Intentar enviar
    const info = await transporter.sendMail(mailOptions);
    console.log("Correo enviado:", info.response);

    res.json({
      ok: true,
      mensaje: "Correo de recuperación enviado exitosamente",
    });
  } catch (error) {
    console.error("Error completo:", error);
    res.status(500).json({ ok: false, mensaje: "Error al enviar el correo" });
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
    const result = await pool.query(
      "UPDATE public.asesor SET password = $1 WHERE email = $2 RETURNING *",
      [hashedPassword, email]
    );

    if (result.rowCount === 0) {
      console.log("Usuario no encontrado en tabla asesor");
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

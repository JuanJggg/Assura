const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const nodemailer = require("nodemailer");

const user = (process.env.GMAIL_USER || "").trim();
const pass = (process.env.GMAIL_PASS || "").trim();

console.log("=== TEST SMTP ===");
console.log("GMAIL_USER:", user);
console.log("GMAIL_PASS:", pass.substring(0, 4) + "..." + pass.substring(pass.length - 4));
console.log("GMAIL_PASS length:", pass.length);
console.log("GMAIL_PASS full (for debug):", pass);

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: { user, pass },
});

console.log("\nVerificando conexión SMTP...");
transporter.verify()
  .then(() => {
    console.log("✅ Conexión SMTP exitosa!");
    return transporter.sendMail({
      from: `"Soporte Assura" <${user}>`,
      to: "garciajuanjose224@gmail.com",
      subject: "Test Assura - Recuperación",
      html: "<h2>Test exitoso</h2><p>Si ves esto, el correo funciona correctamente.</p>",
    });
  })
  .then((info) => {
    console.log("✅ Correo enviado:", info.response);
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Error:", err.message);
    console.error("Código:", err.code);
    console.error("Respuesta:", err.response);
    process.exit(1);
  });

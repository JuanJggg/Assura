// backend/server/index.cjs

const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// Middleware de logging
app.use((req, res, next) => {
  console.log("Petición entrante:", req.method, req.url);
  next();
});

const usuariosRoutes = require("./routes/usuarios.routes.cjs");
app.use("/usuarios", usuariosRoutes);

const foroRoutes = require("./routes/foro.routes.cjs");
app.use("/foro", foroRoutes);

const asesoriaRoutes = require("./routes/asesoria.routes.cjs");
app.use("/asesoria", asesoriaRoutes);

const dasboardRoutes = require("./routes/dasboard.routes.cjs");
app.use("/dasboard", dasboardRoutes);

const chatRoutes = require("./routes/chatroutes.cjs");
app.use("/chat", chatRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "API de Assura funcionando correctamente",
    timestamp: new Date().toISOString()
  });
});


app.use((req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});


const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log("╔════════════════════════════════════════╗");
  console.log("║   🚀 Servidor Assura Iniciado          ║");
  console.log("╠════════════════════════════════════════╣");
  console.log(`║   Puerto: ${port.toString().padEnd(28)} ║`);
  console.log(`║   URL: http://localhost:${port.toString().padEnd(17)} ║`);
  console.log(`║   Pusher: Configurado                  ║`);
  console.log("╚════════════════════════════════════════╝");
});
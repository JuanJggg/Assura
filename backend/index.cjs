// backend/server/index.cjs

const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const { guardarMensaje } = require("./controllers/chat.controllers.cjs");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

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

io.on("connection", (socket) => {
  console.log("Usuario conectado:", socket.id);

  // Unirse a una sala específica (opcional)
  socket.on("unirse", (data) => {
    const { chatId } = data;
    if (chatId) {
      socket.join(`chat-${chatId}`);
      console.log(`👥 Usuario ${socket.id} se unió a la sala chat-${chatId}`);
    }
  });

  // Cuando un usuario envía un mensaje
  socket.on("mensaje", async (data) => {
    try {
      console.log("📩 Mensaje recibido:", data);
      
      // Guardar en PostgreSQL
      const mensajeGuardado = await guardarMensaje(data);
      
      // Emitir a la sala específica del chat
      if (data.chatId) {
        io.to(`chat-${data.chatId}`).emit("mensaje", {
          id: mensajeGuardado.id,
          id_conversacion: data.chatId,
          contenido: data.content,
          id_remitente: mensajeGuardado.id_usuario || mensajeGuardado.id_remitente,
          id_usuario: mensajeGuardado.id_usuario || mensajeGuardado.id_remitente,
          fecha_envio: mensajeGuardado.fecha_envio
        });
        console.log(`✅ Mensaje guardado y enviado a chat-${data.chatId}`);
      }
    } catch (err) {
      console.error("❌ Error al guardar mensaje:", err);
      socket.emit("error", { message: "Error al enviar mensaje" });
    }
  });

  // Cuando un usuario se desconecta
  socket.on("disconnect", () => {
    console.log("❌ Usuario desconectado:", socket.id);
  });
});

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
server.listen(port, () => {
  console.log("╔════════════════════════════════════════╗");
  console.log("║   🚀 Servidor Assura Iniciado          ║");
  console.log("╠════════════════════════════════════════╣");
  console.log(`║   Puerto: ${port.toString().padEnd(28)} ║`);
  console.log(`║   URL: http://localhost:${port.toString().padEnd(17)} ║`);
  console.log(`║   WebSocket: Activo                    ║`);
  console.log("╚════════════════════════════════════════╝");
});

module.exports = { io };
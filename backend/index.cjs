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

app.use((req, res, next) => {
  console.log("➡️ Petición entrante:", req.method, req.url);
  next();
});


// Rutas API
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

// WebSockets
io.on("connection", (socket) => {
  console.log("Usuario conectado:", socket.id);

  // Cuando un usuario envía un mensaje
  socket.on("sendMessage", async (data) => {
    try {
      console.log("Mensaje recibido:", data);
      await guardarMensaje(data); // guarda en PostgreSQL
      io.emit("receiveMessage", data); // reenviar a todos
    } catch (err) {
      console.error("Error al guardar mensaje:", err);
    }
  });

  // Si quieres manejar salas específicas
  socket.on("joinRoom", (roomID) => {
    socket.join(roomID);
    console.log(`Usuario ${socket.id} se unió a la sala ${roomID}`);
  });

  socket.on("disconnect", () => {
    console.log("Usuario desconectado:", socket.id);
  });
});

const port = process.env.PORT || 3001;
server.listen(port, () => {
  console.log(`Servidor corriendo en puerto ${port}`);
});

module.exports = { io };

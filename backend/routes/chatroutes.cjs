// backend/routes/chatroutes.cjs

const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chat.controllers.cjs");
const pusher = require("../config/pusher.cjs");

// ============================================
// RUTAS DE CHAT
// ============================================

/**
 * POST /chat/crearConversacion
 * Crea una nueva conversación o devuelve una existente
 * Body: { idUsuario, idAsesor } o { id_estudiante, id_asesor }
 */
router.post("/crearConversacion", chatController.crearConversacion);

/**
 * GET /chat/getConversacion/:tipo/:id
 * Obtiene todas las conversaciones de un usuario
 * Params: 
 *   - tipo: "estudiante" o "asesor"
 *   - id: ID del usuario
 */
router.get("/getConversacion/:tipo/:id", chatController.getConversacion);

/**
 * GET /chat/getMensajes/:id_conversacion
 * Obtiene todos los mensajes de una conversación
 * Params: id_conversacion - ID de la conversación
 */
router.get("/getMensajes/:id_conversacion", chatController.getMensajes);

/**
 * POST /chat/mensajes
 * Envía un nuevo mensaje (guarda en DB y dispara evento de Pusher)
 * Body: { chatId, content, senderId }
 */
router.post("/mensajes", chatController.enviarMensaje);

/**
 * GET /chat/test-pusher
 * Prueba la conexión de Pusher
 */
router.get("/test-pusher", async (req, res) => {
  try {
    console.log("🧪 Probando Pusher...");
    const result = await pusher.trigger("test-channel", "test-event", {
      mensaje: "Prueba desde el servidor",
      timestamp: new Date().toISOString()
    });
    console.log("✅ Evento de prueba enviado:", JSON.stringify(result, null, 2));
    res.json({ ok: true, message: "Evento enviado correctamente", result });
  } catch (err) {
    console.error("❌ Error en prueba Pusher:", err.message);
    res.status(500).json({ ok: false, error: err.message, stack: err.stack });
  }
});

module.exports = router;
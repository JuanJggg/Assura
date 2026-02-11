// backend/routes/chatroutes.cjs

const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chat.controllers.cjs");

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

module.exports = router;
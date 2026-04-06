// chatbot.routes.cjs
const express = require("express");
const router = express.Router();
const chatbotController = require("../controllers/chatbot.controller.cjs");

// Estudiante: enviar mensaje al chatbot IA
router.post("/enviar", chatbotController.enviarMensaje);

// Estudiante: obtener historial de conversaciones
router.get("/historial/:userId", chatbotController.getHistorial);

// Asesor: estadísticas globales del chatbot
router.get("/estadisticas", chatbotController.getEstadisticas);

// Asesor: todas las consultas (con filtro opcional por categoría)
router.get("/consultas", chatbotController.getConsultas);

// Health check del sistema (Node + Python)
router.get("/health", chatbotController.getHealth);

module.exports = router;

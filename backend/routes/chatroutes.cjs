const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chat.controllers.cjs");

// Crer conversacion (estudiante, asesor)
router.post("/crearConversacion", chatController.crearConversacion);

// Obtener conversacion (estudiante o asesor)
router.get("/getConversacion/:tipo/:id", chatController.getConversacion);

// Obtener mensajes de una conversacion
router.get("/getMensajes/:id_conversacion", chatController.getMensajes);

module.exports = router;



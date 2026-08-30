const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller.cjs');

// Estadísticas globales
router.post('/estadisticas', adminController.getEstadisticas);

// Gestión de usuarios
router.post('/usuarios', adminController.getUsuarios);
router.post('/toggleBloqueo', adminController.toggleBloqueo);

// Moderación del foro
router.post('/foros', adminController.getForosAdmin);
router.post('/eliminarComentario', adminController.eliminarComentario);
router.post('/eliminarForo', adminController.eliminarForo);

// Supervisión de chats
router.post('/conversaciones', adminController.getConversaciones);
router.post('/mensajes', adminController.getMensajesConversacion);

// Estudiantes por asesor
router.post('/estudiantesAsesor', adminController.getEstudiantesDeAsesor);

module.exports = router;

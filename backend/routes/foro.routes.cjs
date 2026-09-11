const express = require('express');
const router = express.Router();
const foroController = require('../controllers/foro.controller.cjs');
const { uploadForo } = require('../config/upload.cjs');

router.post('/getForos', foroController.getForos);
router.post('/getComentario', foroController.getComentario);

// Hasta 3 archivos al crear foro
router.post('/addForo', uploadForo.array('archivos', 3), foroController.crearForo);

// 1 archivo al crear comentario
router.post('/addComentario', uploadForo.single('archivo'), foroController.crearComentario);

module.exports = router;

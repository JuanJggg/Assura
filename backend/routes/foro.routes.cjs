const express = require('express');
const router = express.Router();
const foroController = require('../controllers/foro.controller.cjs');

router.post('/getForos', foroController.getForos);
router.post('/getComentario', foroController.getComentario);
router.post('/addForo', foroController.crearForo);
router.post('/addComentario', foroController.crearComentario);
module.exports = router;

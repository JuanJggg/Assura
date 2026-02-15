const express = require('express');
const router = express.Router();
const calificacionController = require('../controllers/calificacion.controller.cjs');

router.post('/crear', calificacionController.crearCalificacion);

router.get('/asesor/:id_asesor', calificacionController.obtenerCalificacionesAsesor);

router.get('/verificar', calificacionController.verificarYaCalificado);

router.get('/ranking', calificacionController.obtenerRankingAsesores);

router.get('/categoria/:id_asesor', calificacionController.obtenerCategoriaAsesor);

router.get('/mejores-asesores', calificacionController.obtenerMejoresAsesores);

router.get('/estadisticas', calificacionController.obtenerEstadisticasGenerales);

module.exports = router;

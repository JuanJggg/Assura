const express = require('express');
const router = express.Router();
const pruebasController = require('../controllers/pruebas.controller.cjs');

// CRUD Pruebas
router.post('/crearPrueba', pruebasController.crearPrueba);
router.post('/getPruebasAsesor', pruebasController.getPruebasPorAsesor);
router.post('/getPreguntasPrueba', pruebasController.getPreguntasPrueba);
router.post('/eliminarPrueba', pruebasController.eliminarPrueba);
router.post('/toggleActiva', pruebasController.toggleActivaPrueba);

// Asignación
router.post('/asignarPrueba', pruebasController.asignarPrueba);
router.post('/getPruebasEstudiante', pruebasController.getPruebasEstudiante);
router.post('/getPreguntasAsignacion', pruebasController.getPreguntasAsignacion);

// Responder
router.post('/enviarRespuestas', pruebasController.enviarRespuestas);

// Estadísticas
router.post('/getEstadisticasAsesor', pruebasController.getEstadisticasAsesor);
router.post('/getEstudiantesAsesor', pruebasController.getEstudiantesAsesor);
router.post('/getDetalleRespuestas', pruebasController.getDetalleRespuestas);

// Evaluaciones y Ranking
router.post('/evaluarAsesor', pruebasController.evaluarAsesor);
router.post('/evaluarEstudiante', pruebasController.evaluarEstudiante);
router.post('/getRankingAsesores', pruebasController.getRankingAsesores);
router.post('/getEvaluacionesAsesor', pruebasController.getEvaluacionesAsesor);
router.post('/verificarEvaluacionPendiente', pruebasController.verificarEvaluacionPendiente);

module.exports = router;

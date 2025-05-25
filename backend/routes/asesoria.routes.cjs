const express = require('express');
const router = express.Router();
const materiasController = require('../controllers/asesoria.controller.cjs');

router.post('/getMaterias', materiasController.getMaterias);
router.post('/addAsesoria', materiasController.crearAsesoria);
router.post('/updAsesoria', materiasController.actualizarAsesoria);
router.post('/getAsesoria', materiasController.getAsesoria);
router.post('/updActivo', materiasController.actualizarActivo);
router.post('/delAsesoria', materiasController.eliminarAsesoria);
router.post('/addMateria', materiasController.crearMateria);
module.exports = router;

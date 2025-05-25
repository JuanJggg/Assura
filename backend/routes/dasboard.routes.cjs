const express = require('express');
const router = express.Router();
const dasboardController = require('../controllers/dasboard.controller.cjs');

router.post('/getAsesores', dasboardController.getAsesores);
router.post('/getComentario', dasboardController.getComentarios);
module.exports = router;

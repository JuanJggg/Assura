const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarios.controller.cjs');

router.post('/login', usuarioController.getLogin);
router.post('/addUser', usuarioController.crearUsuario);

module.exports = router;

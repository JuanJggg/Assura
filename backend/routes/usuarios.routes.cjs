const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarios.controller.cjs');

router.post('/login', usuarioController.getLogin);
router.post('/addUser', usuarioController.crearUsuario);
router.post('/forgotPassword', usuarioController.forgotPassword);
router.get('/validateToken/:token', usuarioController.validateToken);
router.post('/resetPassword/:token', usuarioController.resetPassword);

module.exports = router;

require("dotenv").config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const usuariosRoutes = require('./routes/usuarios.routes.cjs');
app.use('/usuarios', usuariosRoutes);

const foroRoutes = require('./routes/foro.routes.cjs');
app.use('/foro', foroRoutes);

const asesoriaRoutes = require('./routes/asesoria.routes.cjs');
app.use('/asesoria', asesoriaRoutes);

const dasboardRoutes = require('./routes/dasboard.routes.cjs');
app.use('/dasboard', dasboardRoutes);

app.listen(3001, () => {
    console.log('Servidor corriendo en puerto 3001');
});

const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const usuariosRoutes = require('./routes/usuarios.routes.cjs');
console.log("holaaaaa");
app.use('/usuarios', usuariosRoutes);

app.listen(3001, () => {
  console.log('Servidor corriendo en puerto 3001');
});

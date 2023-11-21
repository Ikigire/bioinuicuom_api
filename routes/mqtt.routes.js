var express = require('express');
const { getIotInfo } = require('../controller/mqtt.controller');
var MqttRouter = express.Router();


// Definiendo los endpoints para la tabla de Usuarios
// Peticiones con verbo GET
// UsuarioRouter.get('/', getAll); // Obtener todos los registros en la tabla
MqttRouter.get('/:mac', getIotInfo);
// UsuarioRouter.get('/login/:email/:password', login);

// Peticiones con verbo POST
// UsuarioRouter.post('/', createUsuario) // Crear nuevbos usuarios

// Peticiones con verbo PUT
// UsuarioRouter.put('/:user_id', updateUsuario) // Crear nuevbos usuarios

// Peticiones con verbo PUT
// UsuarioRouter.delete('/:user_id', deleteUsuario) // Crear nuevbos usuarios


module.exports = MqttRouter;

var express = require('express');
const { getAll, getById, createUsuario, updateUsuario, deleteUsuario, login } = require('../controller/usuario.controller');
var UsuarioRouter = express.Router();


// Definiendo los endpoints para la tabla de Usuarios
// Peticiones con verbo GET
UsuarioRouter.get('/', getAll); // Obtener todos los registros en la tabla
UsuarioRouter.get('/:user_id', getById);
UsuarioRouter.post('/login', login);

// Peticiones con verbo POST
UsuarioRouter.post('/', createUsuario) // Crear nuevbos usuarios

// Peticiones con verbo PUT
UsuarioRouter.put('/:user_id', updateUsuario) // Crear nuevbos usuarios

// Peticiones con verbo PUT
UsuarioRouter.delete('/:user_id', deleteUsuario) // Crear nuevbos usuarios


module.exports = UsuarioRouter;

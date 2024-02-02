var express = require('express');
const { getHistoricalData, getDatesRange, getGraphicData } = require('../controller/dynamodb');

var DynamoDbRouter = express.Router();


// Definiendo los endpoints para la tabla de Usuarios
// Peticiones con verbo GET
// UsuarioRouter.get('/', getAll); // Obtener todos los registros en la tabla
DynamoDbRouter.get('/:mac/pagination', getHistoricalData);
DynamoDbRouter.get('/:mac/graphic', getGraphicData);
DynamoDbRouter.get('/:mac/datesrange', getDatesRange);
// UsuarioRouter.get('/login/:email/:password', login);

// Peticiones con verbo POST
// UsuarioRouter.post('/', createUsuario) // Crear nuevbos usuarios

// Peticiones con verbo PUT
// UsuarioRouter.put('/:user_id', updateUsuario) // Crear nuevbos usuarios

// Peticiones con verbo PUT
// UsuarioRouter.delete('/:user_id', deleteUsuario) // Crear nuevbos usuarios


module.exports = DynamoDbRouter;

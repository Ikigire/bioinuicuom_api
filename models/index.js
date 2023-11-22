// 'use strict';

// const Sequelize = require('sequelize');
// const process = require('process');
// const usuarioModel = require('./usuario.model');
// const dispositivoModel = require('./dispositivo.model');
// const db = {};

// let sequelize = new Sequelize(
//   process.env.DB_DBNAME,
//   process.env.DB_USER,
//   process.env.DB_PASSWORD,
//   {
//     host: process.env.DB_HOST,
//     dialect: 'mysql'
//   }
// );

// sequelize.authenticate()
//   .then(() => {
//     console.log('connected..')
//   })
//   .catch(err => {
//     console.log('Error' + err)
//   })

// // Creando objeto de base de datos
// db.sequelize = sequelize;
// db.Sequelize = Sequelize;

// // Asignando las tablas que pertenecen a la Base de Datos

// db.usuarios = usuarioModel(sequelize, Sequelize.DataTypes);
// db.dispositivos = dispositivoModel(sequelize, Sequelize.DataTypes);




// sequelize.sync().then(() => console.log("Database is updated now"));







// module.exports = db;

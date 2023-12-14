'use strict';

const Sequelize = require('sequelize');
const process = require('process');
const usuarioModel = require('./usuario.model');
const dispositivoModel = require('./dispositivo.model');
const establecimientoModel = require('./establecimiento.model');
const administradorModel = require('./administrador.model');
const sensorModel = require('./sensor.model');
const grupoModel = require('./grupo.model');
const admon_usuarioModel = require('./admon_usuario.model');
const usuario_estabModel = require('./usuario_estab.model');
const disp_sensorModel = require('./disp_sensor.model');
const est_dispositivoModel = require('./est_dispositivo.model');
const db = {};

let sequelize = new Sequelize(
  process.env.DB_DBNAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql'
  }
);

sequelize.authenticate()
  .then(() => {
    console.log('connected..')
  })
  .catch(err => {
    console.log('Error' + err)
  })

// Creando objeto de base de datos
db.sequelize = sequelize;
db.Sequelize = Sequelize;

// Asignando las tablas que pertenecen a la Base de Datos

// Principales (No tienen o indican relación)
db.usuarios = usuarioModel(sequelize, Sequelize.DataTypes);
db.administrador = administradorModel(sequelize, Sequelize.DataTypes);
db.dispositivos = dispositivoModel(sequelize, Sequelize.DataTypes);
db.establecimiento = establecimientoModel(sequelize, Sequelize.DataTypes);
db.sensor = sensorModel(sequelize, Sequelize.DataTypes);
db.grupo = grupoModel(sequelize, Sequelize.DataTypes);

//Tablas de relación
db.admon_usuario = admon_usuarioModel(sequelize, Sequelize.DataTypes);
db.usuario_estab = usuario_estabModel(sequelize, Sequelize.DataTypes);
db.disp_sensor = disp_sensorModel(sequelize, Sequelize.DataTypes);
db.est_dispositivo = est_dispositivoModel(sequelize, Sequelize.DataTypes);



sequelize.sync().then(() => console.log("Database is updated now"));







module.exports = db;

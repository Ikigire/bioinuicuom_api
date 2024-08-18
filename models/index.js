'use strict';

const Sequelize = require('sequelize');
const process = require('process');
const usuarioModel = require('./usuario.model');
const dispositivoModel = require('./dispositivo.model');
const administradorModel = require('./administrador.model');
const sensorModel = require('./sensor.model');
const admon_usuarioModel = require('./admon_usuario.model');
const disp_sensorModel = require('./disp_sensor.model');
const ubi_dispositivoModel = require('./ubi_dispositivo.model');
const validation_codesModel = require('./validation_codes.model');
const disp_usuarioModel = require('./disp_usuario.model');

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

// Extrayendo los modelos
// Tablas
const Usuario = usuarioModel(sequelize, Sequelize.DataTypes);
const Administrador = administradorModel(sequelize, Sequelize.DataTypes);
const Dispositivo = dispositivoModel(sequelize, Sequelize.DataTypes);
const Sensor = sensorModel(sequelize, Sequelize.DataTypes);
// Relaciones
const Admon_Usuario = admon_usuarioModel(sequelize, Sequelize.DataTypes);
const Disp_Sensor = disp_sensorModel(sequelize, Sequelize.DataTypes);
const Ubi_Dispositivo = ubi_dispositivoModel(sequelize, Sequelize.DataTypes);
const Disp_Usuario = disp_usuarioModel(sequelize, Sequelize.DataTypes);
// Tablas Apoyo 
const ValidationCodes = validation_codesModel(sequelize, Sequelize.DataTypes);

// Creando las relaciones
// Administrador.belongsToMany(Usuario, { through: Admon_Usuario });
// Usuario.belongsToMany(Administrador, { through: Admon_Usuario });

// Usuario.belongsToMany(Establecimiento, { through: Usuario_Estab});
// Establecimiento.belongsToMany(Usuario, { through: Usuario_Estab });

// Establecimiento.belongsToMany(Dispositivo, { through: Est_Dispositivo })
// Establecimiento.belongsToMany(Grupo, { through: Est_Dispositivo })
// Dispositivo.belongsToMany(Establecimiento, { through: Est_Dispositivo });
// Dispositivo.belongsToMany(Grupo, { through: Est_Dispositivo });
// Grupo.belongsToMany(Dispositivo, { through: Est_Dispositivo });
// Grupo.belongsToMany(Establecimiento, { through: Est_Dispositivo });

// Asignando las tablas que pertenecen a la Base de Datos
// Principales (No tienen o indican relación)
db.usuarios = Usuario;
db.administrador = Administrador;
db.dispositivos = Dispositivo;
db.sensor = Sensor;

//Tablas de relación
db.admon_usuario = Admon_Usuario;
db.disp_sensor = Disp_Sensor;
db.ubi_dispositivos = Ubi_Dispositivo;
db.disp_usuario = Disp_Usuario;
// Tablas apoyo
db.validation_codes = ValidationCodes;



sequelize.sync().then(() => console.log("Database is updated now"));







module.exports = db;

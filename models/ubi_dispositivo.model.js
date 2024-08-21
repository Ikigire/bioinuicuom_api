'use strict';

const { type } = require("os");

module.exports = (sequelize, DataTypes) => {
  const Ubi_Dispositivo = sequelize.define('ubi_dispositivos', {
    idUbicacion: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    ubicacion: {
        type: DataTypes.STRING,
        
    },
    zona: {
      type: DataTypes.STRING,
    },
idDispositivo:{
  type:DataTypes.STRING,
  references: {
    model: 'dispositivos',
    key: 'idDispositivo'
}
    },
  }, {
    sequelize
  });

  return Ubi_Dispositivo;
};

'use strict';

module.exports = (sequelize, DataTypes) => {
  const Dispositivo = sequelize.define('dispositivo', {
    idDispositivo: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    nombreDispositivo: DataTypes.STRING,
    modelo: DataTypes.STRING,
  }, {
    sequelize
  });

  return Dispositivo;
};

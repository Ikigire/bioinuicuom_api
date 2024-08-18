'use strict';

module.exports = (sequelize, DataTypes) => {
  const Dispositivo = sequelize.define('dispositivo', {
    idDispositivo: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    modelo: DataTypes.STRING,
  }, {
    sequelize
  });

  return Dispositivo;
};

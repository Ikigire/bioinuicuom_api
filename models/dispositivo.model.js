'use strict';

module.exports = (sequelize, DataTypes) => {
  const Dispositivo = sequelize.define('dispositivo', {
    mac: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    modelo: DataTypes.STRING,
    no_serie: DataTypes.STRING,
  }, {
    sequelize
  });

  return Dispositivo;
};

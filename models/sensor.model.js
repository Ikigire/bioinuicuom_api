'use strict';

module.exports = (sequelize, DataTypes) => {
  const Sensor = sequelize.define('sensor', {
    idSensor: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    tipo: DataTypes.CHAR(1),
    unidadMedida: DataTypes.STRING,
    modelo: DataTypes.STRING
  }, {
    sequelize
  });

  return Sensor;
};

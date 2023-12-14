'use strict';

module.exports = (sequelize, DataTypes) => {
  const Disp_Sensor = sequelize.define('disp_sensor', {
    idDispositivo: {
      type: DataTypes.STRING,
      references: {
        model: 'dispositivos',
        key: 'idDispositivo'
      }
    },
    idSensor: {
      type: DataTypes.BIGINT,
      references: {
        model: 'sensors',
        key: 'idSensor'
      }
    }
  }, {
    sequelize
  });

  return Disp_Sensor;
};

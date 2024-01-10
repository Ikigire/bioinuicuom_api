'use strict';

module.exports = (sequelize, DataTypes) => {
  const Est_Dispositivo = sequelize.define('est_dispositivo', {
    idEstab: {
      type: DataTypes.BIGINT,
      references: {
        model: 'establecimientos',
        key: 'idEstab'
      }
    },
    idGrupo: {
        type: DataTypes.BIGINT,
        references: {
            model: 'grupos',
            key: 'idgrupo'
        }
    },
    idDispositivo: {
      type: DataTypes.STRING,
      references: {
        model: 'dispositivos',
        key: 'idDispositivo'
    }
    },
  }, {
    sequelize
  });

  return Est_Dispositivo;
};

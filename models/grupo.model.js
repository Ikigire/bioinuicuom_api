'use strict';

module.exports = (sequelize, DataTypes) => {
  const Grupo = sequelize.define('grupo', {
    idGrupo: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    grupo: DataTypes.STRING,
  }, {
    sequelize
  });

  return Grupo;
};

'use strict';

module.exports = (sequelize, DataTypes) => {
  const Administrador = sequelize.define('administrador', {
    idAdministrador: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    nombre: DataTypes.STRING,
    email: {
      type: DataTypes.STRING,
      unique: true
    },
    password: DataTypes.STRING
  }, {
    sequelize
  });

  return Administrador;
};

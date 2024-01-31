'use strict';

module.exports = (sequelize, DataTypes) => {
  const ValidationCode = sequelize.define('validation-code', {
    idCode: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    code: DataTypes.STRING,
    email: DataTypes.STRING,
  }, {
    sequelize
  });

  return ValidationCode;
};

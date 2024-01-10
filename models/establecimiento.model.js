'use strict';

module.exports = (sequelize, DataTypes) => {
    const Establecimiento = sequelize.define('establecimiento', {
        idEstab: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        establecimiento: DataTypes.STRING,
        
    }, {
        sequelize
    });

    return Establecimiento;
};

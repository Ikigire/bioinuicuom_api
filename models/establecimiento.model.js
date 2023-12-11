'use strict';

module.exports = (sequelize, DataTypes) => {
    const Establecimiento = sequelize.define('establecimientos', {
        id_establecimiento: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        user_id: {
            type: DataTypes.BIGINT,
            references: {
                model: 'usuarios',
                key: 'user_id'
            }
        },
        mac: {
            type: DataTypes.STRING,
            references: {
                model: 'dispositivos',
                key: 'mac'
            }
        },
        nombre_establecimiento: DataTypes.STRING,
        ubicacion: DataTypes.STRING
    }, {
        sequelize
    });

    return Establecimiento;
};

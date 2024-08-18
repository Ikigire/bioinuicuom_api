'use strict';

module.exports = (sequelize, DataTypes) => {
    const Disp_Usuario = sequelize.define('disp_usuario', {
        idUsuario: {
            type: DataTypes.BIGINT,
            references: {
                model: 'usuarios',
                key: 'idUsuario'
            },
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

    return Disp_Usuario;
};

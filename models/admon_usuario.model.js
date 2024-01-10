'use strict';

module.exports = (sequelize, DataTypes) => {
    const Admon_Usuario = sequelize.define('admon_usuario', {
        idAdministrador: {
            type: DataTypes.BIGINT,
            references: {
                model: 'administradors',
                key: 'idAdministrador'
            }
        },
        idUsuario: {
            type: DataTypes.BIGINT,
            references: {
                model: 'usuarios',
                key: 'idUsuario'
            }
        },
    }, {
        sequelize
    });

    return Admon_Usuario;
};

'use strict';

module.exports = (sequelize, DataTypes) => {
    const Usuario_Estab = sequelize.define('usuario_estab', {
        idUsuario: {
            type: DataTypes.BIGINT,
            references: {
                model: 'usuarios',
                key: 'idUsuario'
            },
        },
        idEstab: {
            type: DataTypes.BIGINT,
            references: {
                model: 'establecimientos',
                key: 'idEstab'
            }
        }
    }, {
        sequelize
    });

    return Usuario_Estab;
};

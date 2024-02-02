const { QueryTypes } = require('sequelize');
const { establecimiento, usuario_estab, sequelize } = require('../models');
const validateEntry = require('../utils/validation.utils');

const Establecimiento = establecimiento; // ORM para la tabla de Establecimiento
const Usuario_Estab = usuario_estab;
const Sequelize = sequelize;



module.exports = {
    createEstablecimiento: async (req, res) => {
        let establecimiento = req.body;
        let minFields = ['establecimiento', 'idUsuario'];

        const { minFields: minF, extraFields } = validateEntry(establecimiento, minFields);

        if (minF.length > 0 || extraFields.length > 0) {
            const message = `${minF.length > 0 ? `Hacen falta los siguientes campos para poder crear un establecimiento {${minF.toString()}}` : ''}${extraFields.length > 0 ? `\nLos siguientes campos no deben exisir {${extraFields.toString()}}` : ''}`;
            return res.status(400).json({
                errorType: 'Objeto incompleto',
                message
            });
        }

        const { idUsuario, ...estab } = establecimiento;
        const { establecimiento: _, ...usuario_est } = establecimiento;

        Establecimiento.create(estab)
            .then(estable => {
                establecimiento = estable;
                usuario_est.idEstab = establecimiento.idEstab;
                return Usuario_Estab.create(usuario_est);
            })
            .then((usuario_estab) => {
                return res.status(200).json({
                    establecimiento,
                    usuario_estab
                });
            })
            .catch(async error => {
                // console.error("Error", Object.keys(error));
                if (establecimiento.createdAt) {
                    await Establecimiento.destroy({ where: { idEstab: establecimiento.idEstab } })
                }
                return res.status(400).json({
                    errorType: `${error.name}`,
                    message: `No se puedo crear el establecimiento`
                });
            });
    },

    getAllEstablecimientos: async (req, res) => {
        const tableFields = ['idEstab', 'establecimiento'];

        const establecimientos = await Establecimiento.findAll({
            attributes: tableFields
        });
        return res.status(200).json(establecimientos);
    },

    getEstablecimientoById: async (req, res) => {
        const idEstab = parseInt(req.params.idEstab);


        if (!idEstab) {
            return res.status(400).json({
                errorType: 'Bad Request',
                message: 'El Id de establecimiento no fue recibido o está mal formateado'
            });
        }

        const establecimiento = await Establecimiento.findOne({
            where: {
                idEstab
            }
        });

        if (establecimiento == null) {
            return res.status(404).json({
                errorType: "Elemento no encontrado",
                message: `No existe Establecimiento con el ID ${idEstab}`
            });
        }

        return res.status(200).json(establecimiento);
    },

    getEstablecimientosByIdUsuario: async (req, res) => {
        const idUsuario = req.params.idUsuario ?? null;
        const { distinct } = req.query;

        if (!idUsuario) {
            return res.status(400).json({
                errorType: 'Bad Request',
                message: 'El Id de Estab no fue recibido o está mal formateado'
            });
        }
        const usuario_estab = await Usuario_Estab.findAll({
            where: {
                idUsuario
            }
        });


        if (usuario_estab == null) {
            return res.status(404).json({
                errorType: "Elemento no encontrado",
                message: `No existe usuario con el ID ${idUsuario}`
            });
        }
        let establecimientos = [];

        if (distinct == 'yes') {
            establecimientos = await Sequelize.query(`SELECT DISTINCT(establecimiento) FROM establecimientos AS e JOIN usuario_estabs AS ue ON e.idEstab = ue.idEstab WHERE ue.idUsuario = ${idUsuario};`, 
            {type: QueryTypes.SELECT});
        } else {
            for (let index = 0; index < usuario_estab.length; index++) {
                const estab = usuario_estab[index];
                if (estab.idEstab)
                    establecimientos.push(await Establecimiento.findOne({ where: { idEstab: estab.idEstab } }));
            }
        }


        return res.status(200).json(establecimientos);
    },

    updateEstablecimiento: async (req, res) => {
        const idEstab = parseInt(req.params.idEstab);
        const establecimiento = req.body;

        if (establecimiento.idEstab != idEstab) {
            return res.status(403).json({
                errorType: `Movimiento no autorizado`,
                message: `Los Id del elemento que busca modificar y la información recibida no coinciden`
            });
        }

        let minFields = ['idEstab', 'establecimiento', 'idUsuario'];

        const { minFields: minF, extraFields } = validateEntry(establecimiento, minFields);

        if (minF.length > 0) {
            return res.status(400).json({
                errorType: 'Objeto incompleto',
                message: `Hacen falta los siguientes campos para poder modificar la información del dispositivo {${minF.toString()}}${extraFields.length > 0 ? `\nLos siguientes campos no deben exisir {${extraFields.toString()}}` : ''}`
            });
        }

        if (await Establecimiento.findOne({ where: { idEstab } }) == null) {
            return res.status(404).json({
                errorType: "Elemento no encontrado",
                message: `No existe establecimiento con el ID ${idEstab}`
            });
        }
        const { idUsuario, ...estab } = establecimiento;

        await Establecimiento.update(estab, { where: { idEstab } });

        return res.status(200).json(await Establecimiento.findOne({ where: { idEstab } }));
    },

    deleteEstablecimiento: async (req, res) => {
        const idEstab = parseInt(req.params.idEstab);
        const establecimiento = await Establecimiento.findOne({
            where: { idEstab }
        });

        if (establecimiento == null) {
            return res.status(404).json({
                errorType: "Elemento no encontrado",
                message: `No existe Dispositivo con el ID ${idEstab}`
            });
        }
        await Usuario_Estab.destroy({ where: { idEstab } })
        await Establecimiento.destroy({ where: { idEstab } });
        return res.status(200).json(establecimiento);
    }
}
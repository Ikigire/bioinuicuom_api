const { QueryTypes } = require('sequelize');
const db = require('../models');
const validateEntry = require('../utils/validation.utils');

const Ubi_Dispositivo = db.ubi_dispositivo; // ORM para la tabla de Ubi_Dispositivo
const Dispositivo = db.dispositivo; // ORM para la tabla de Dispositivo
const Usuario = db.usuario; // ORM para la tabla de Usuario
const sequelize = db.sequelize;

module.exports = {
    createUbiDispositivo: async (req, res) => {
        let ubi_dispositivo = req.body;
        let minFields = ['ubicacion', 'zona', 'idDispositivo'];

        const { minFields: minF, extraFields } = validateEntry(ubi_dispositivo, minFields);

        if (minF.length > 0 || extraFields.length > 0) {
            const message = `${minF.length > 0 ? `Hacen falta los siguientes campos para poder crear un ubi_dispositivo {${minF.toString()}}` : ''}${extraFields.length > 0 ? `\nLos siguientes campos no deben existir {${extraFields.toString()}}` : ''}`;
            return res.status(400).json({
                errorType: 'Objeto incompleto',
                message
            });
        }

        try {
            const newUbiDispositivo = await Ubi_Dispositivo.create(ubi_dispositivo);
            return res.status(200).json(newUbiDispositivo);
        } catch (error) {
            return res.status(400).json({
                errorType: `${error.name}`,
                message: `No se pudo crear el ubi_dispositivo`
            });
        }
    },

    getAllUbiDispositivos: async (req, res) => {
        const tableFields = ['idUbicacion', 'ubicacion', 'zona', 'idDispositivo'];

        const ubi_dispositivos = await Ubi_Dispositivo.findAll({
            attributes: tableFields
        });
        return res.status(200).json(ubi_dispositivos);
    },

    getUbiDispositivoById: async (req, res) => {
        const idUbicacion = parseInt(req.params.idUbicacion);

        if (!idUbicacion) {
            return res.status(400).json({
                errorType: 'Bad Request',
                message: 'El Id de ubi_dispositivo no fue recibido o está mal formateado'
            });
        }

        const ubi_dispositivo = await Ubi_Dispositivo.findOne({
            where: {
                idUbicacion
            }
        });

        if (ubi_dispositivo == null) {
            return res.status(404).json({
                errorType: "Elemento no encontrado",
                message: `No existe ubi_dispositivo con el ID ${idUbicacion}`
            });
        }

        return res.status(200).json(ubi_dispositivo);
    },

    updateUbiDispositivo: async (req, res) => {
        const idUbicacion = parseInt(req.params.idUbicacion);
        const ubi_dispositivo = req.body;

        if (ubi_dispositivo.idUbicacion != idUbicacion) {
            return res.status(403).json({
                errorType: `Movimiento no autorizado`,
                message: `Los Id del elemento que busca modificar y la información recibida no coinciden`
            });
        }

        let minFields = ['idUbicacion', 'ubicacion', 'zona', 'idDispositivo'];

        const { minFields: minF, extraFields } = validateEntry(ubi_dispositivo, minFields);

        if (minF.length > 0 || extraFields.length > 0) {
            return res.status(400).json({
                errorType: 'Objeto incompleto',
                message: `Hacen falta los siguientes campos para poder modificar la información del ubi_dispositivo {${minF.toString()}}${extraFields.length > 0 ? `\nLos siguientes campos no deben existir {${extraFields.toString()}}` : ''}`
            });
        }

        if (await Ubi_Dispositivo.findOne({ where: { idUbicacion } }) == null) {
            return res.status(404).json({
                errorType: "Elemento no encontrado",
                message: `No existe ubi_dispositivo con el ID ${idUbicacion}`
            });
        }

        await Ubi_Dispositivo.update(ubi_dispositivo, { where: { idUbicacion } });

        return res.status(200).json(await Ubi_Dispositivo.findOne({ where: { idUbicacion } }));
    },

    deleteUbiDispositivo: async (req, res) => {
        const idUbicacion = parseInt(req.params.idUbicacion);
        const ubi_dispositivo = await Ubi_Dispositivo.findOne({
            where: { idUbicacion }
        });

        if (ubi_dispositivo == null) {
            return res.status(404).json({
                errorType: "Elemento no encontrado",
                message: `No existe ubi_dispositivo con el ID ${idUbicacion}`
            });
        }

        await Ubi_Dispositivo.destroy({ where: { idUbicacion } });
        return res.status(200).json(ubi_dispositivo);
    }
};

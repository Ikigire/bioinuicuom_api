const { QueryTypes } = require('sequelize');
const db = require('../models');
const validateEntry = require('../utils/validation.utils');

const Dispositivos = db.dispositivo; // ORM para la tabla de Dispositivos
const Ubi_Dispositivo = db.ubi_dispositivo;
const Disp_Usuario = db.disp_usuario; // ORM para la tabla de Disp_Usuario
const sequelize = db.sequelize;

module.exports = {
    createDispositivo: async (req, res) => {
        let dispositivo = req.body;
        let minFields = ['idDispositivo', 'modelo', 'ubicacion', 'zona'];

        const { minFields: minF, extraFields } = validateEntry(dispositivo, minFields);

        if (minF.length > 0 || extraFields.length > 0) {
            const message = `${minF.length > 0 ? `Hacen falta los siguientes campos para poder crear un dispositivo {${minF.toString()}}` : ''}
                ${extraFields.length > 0 ? `Los siguientes campos no deben existir {${extraFields.toString()}}` : ''}`;
            return res.status(400).json({
                errorType: 'Objeto incompleto',
                message
            });
        }

        const { idUbicacion, ...device } = dispositivo;
        const { modelo, ...ubi_dispositivo } = dispositivo;

        Dispositivos.create(device)
            .then(disp => {
                dispositivo = disp;
                return Ubi_Dispositivo.create(ubi_dispositivo);
            })
            .then((ubi_dispositivo) => {
                return res.status(200).json({
                    dispositivo,
                    ubi_dispositivo
                });
            })
            .catch(async error => {
                if (dispositivo.createdAt) {
                    await Dispositivos.destroy({ where: { idDispositivo: dispositivo.idDispositivo } });
                }
                return res.status(400).json({
                    errorType: `${error.name}`,
                    message: `No se pudo crear el dispositivo`
                });
            });
    },

    getAllDispositivos: async (req, res) => {
        const tableFields = ['idDispositivo', 'modelo'];
        let { fields } = req.query;

        if (fields) {
            fields = fields.split(",").map(field => field.trim()).filter(field => tableFields.includes(field));
        } else {
            fields = tableFields;
        }

        const dispositivos = await Dispositivos.findAll({
            attributes: fields
        });
        return res.status(200).json(dispositivos);
    },

    getDispositivoById: async (req, res) => {
        const id = req.params.idDispositivo;

        if (!id) {
            return res.status(400).json({
                errorType: 'Bad Request',
                message: 'El Id de dispositivo no fue recibido o está mal formateado'
            });
        }

        const dispositivo = await sequelize.query(`
            SELECT d.idDispositivo, d.modelo, u.ubicacion, u.zona
            FROM dispositivos d
            INNER JOIN ubi_dispositivos u ON d.idDispositivo = u.idDispositivo
            WHERE d.idDispositivo = :id
        `, {
            replacements: { id },
            type: QueryTypes.SELECT
        });

        if (dispositivo == null || dispositivo.length == 0) {
            return res.status(404).json({
                errorType: "Elemento no encontrado",
                message: `No existe dispositivo con el ID ${id}`
            });
        }

        return res.status(200).json(dispositivo[0]);
    },

    getDispositivosByIdEstab: async (req, res) => {
        const id = req.params.idUbicacion ?? null;

        if (!id) {
            return res.status(400).json({
                errorType: 'Bad Request',
                message: 'El Id de Ubicación no fue recibido o está mal formateado'
            });
        }

        const relaciones = await Ubi_Dispositivo.findAll({
            where: { idUbicacion: id }
        });

        if (relaciones == null || relaciones.length == 0) {
            return res.status(404).json({
                errorType: "Elemento no encontrado",
                message: `No existen dispositivos en la ubicación con el ID ${id}`
            });
        }

        const dispositivos = [];
        for (let index = 0; index < relaciones.length; index++) {
            const { idDispositivo } = relaciones[index];
            const dispositivo = await Dispositivos.findOne({ where: { idDispositivo } });
            if (dispositivo) {
                dispositivos.push(dispositivo);
            }
        }

        return res.status(200).json(dispositivos);
    },

    getDispositivosByUsuario: async (req, res) => {
        const idUsuario = parseInt(req.params.idUsuario);

        if (!idUsuario) {
            return res.status(400).json({
                errorType: 'Bad Request',
                message: 'El Id de Usuario no fue recibido o está mal formateado'
            });
        }

        const dispositivos = await sequelize.query(`
            SELECT d.idDispositivo, d.modelo
            FROM dispositivos AS d
            INNER JOIN ubi_dispositivos AS u ON u.idDispositivo = d.idDispositivo
            INNER JOIN disp_usuario AS du ON du.idDispositivo = d.idDispositivo
            WHERE du.idUsuario = :idUsuario
        `, {
            replacements: { idUsuario },
            type: QueryTypes.SELECT
        });

        return res.status(200).json(dispositivos);
    },

    updateDispositivo: async (req, res) => {
        const idDispositivo = req.params.idDispositivo;
        const dispositivo = req.body;

        if (dispositivo.idDispositivo != idDispositivo) {
            return res.status(403).json({
                errorType: `Movimiento no autorizado`,
                message: `Los Id del elemento que busca modificar y la información recibida no coinciden`
            });
        }

        let minFields = ['idDispositivo', 'modelo'];

        const { minFields: minF, extraFields } = validateEntry(dispositivo, minFields);

        if (minF.length > 0 || extraFields.length > 0) {
            return res.status(400).json({
                errorType: 'Objeto incompleto',
                message: `${minF.length > 0 ? `Hacen falta los campos {${minF.toString()}} para poder modificar la información del dispositivo. ` : ''}${extraFields.length > 0 ? `\nLos siguientes campos no deben existir {${extraFields.toString()}}` : ''}`
            });
        }

        if (await Dispositivos.findOne({ where: { idDispositivo } }) == null) {
            return res.status(404).json({
                errorType: "Elemento no encontrado",
                message: `No existe dispositivo con el ID ${idDispositivo}`
            });
        }

        await Dispositivos.update(dispositivo, { where: { idDispositivo } });

        return res.status(200).json(await Dispositivos.findOne({ where: { idDispositivo } }));
    },

    deleteDispositivo: async (req, res) => {
        const idDispositivo = req.params.idDispositivo;
        const device = await Dispositivos.findOne({
            where: { idDispositivo }
        });

        if (device == null) {
            return res.status(404).json({
                errorType: "Elemento no encontrado",
                message: `No existe dispositivo con el ID ${idDispositivo}`
            });
        }

        await Ubi_Dispositivo.destroy({ where: { idDispositivo } });
        await Dispositivos.destroy({ where: { idDispositivo } });

        return res.status(200).json(device);
    }
};

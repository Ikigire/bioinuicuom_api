const { QueryTypes } = require('sequelize');
const db = require('../models');
const validateEntry = require('../utils/validation.utils');

const Disp_Usuario = db.disp_usuario; // ORM para la tabla de Disp_Usuario
const Dispositivo = db.dispositivo; // ORM para la tabla de Dispositivo
const Usuario = db.usuario; // ORM para la tabla de Usuario
const sequelize = db.sequelize;

module.exports = {
    createDispUsuario: async (req, res) => {
        let disp_usuario = req.body;
        let minFields = ['idUsuario', 'idDispositivo'];

        const { minFields: minF, extraFields } = validateEntry(disp_usuario, minFields);

        if (minF.length > 0 || extraFields.length > 0) {
            const message = `${minF.length > 0 ? `Hacen falta los siguientes campos para poder crear un disp_usuario {${minF.toString()}}` : ''}${extraFields.length > 0 ? `\nLos siguientes campos no deben existir {${extraFields.toString()}}` : ''}`;
            return res.status(400).json({
                errorType: 'Objeto incompleto',
                message
            });
        }

        try {
            const newDispUsuario = await Disp_Usuario.create(disp_usuario);
            return res.status(200).json(newDispUsuario);
        } catch (error) {
            return res.status(400).json({
                errorType: `${error.name}`,
                message: `No se pudo crear el disp_usuario`
            });
        }
    },

    getAllDispUsuarios: async (req, res) => {
        const tableFields = ['idUsuario', 'idDispositivo'];

        const disp_usuarios = await Disp_Usuario.findAll({
            attributes: tableFields
        });
        return res.status(200).json(disp_usuarios);
    },

    getDispUsuarioById: async (req, res) => {
        const idUsuario = parseInt(req.params.idUsuario);

        if (!idUsuario) {
            return res.status(400).json({
                errorType: 'Bad Request',
                message: 'El Id de disp_usuario no fue recibido o está mal formateado'
            });
        }

        const disp_usuario = await Disp_Usuario.findOne({
            where: {
                idUsuario
            }
        });

        if (disp_usuario == null) {
            return res.status(404).json({
                errorType: "Elemento no encontrado",
                message: `No existe disp_usuario con el ID ${idUsuario}`
            });
        }

        return res.status(200).json(disp_usuario);
    },

    updateDispUsuario: async (req, res) => {
        const idUsuario = parseInt(req.params.idUsuario);
        const disp_usuario = req.body;

        if (disp_usuario.idUsuario != idUsuario) {
            return res.status(403).json({
                errorType: `Movimiento no autorizado`,
                message: `Los Id del elemento que busca modificar y la información recibida no coinciden`
            });
        }

        let minFields = ['idUsuario', 'idDispositivo'];

        const { minFields: minF, extraFields } = validateEntry(disp_usuario, minFields);

        if (minF.length > 0 || extraFields.length > 0) {
            return res.status(400).json({
                errorType: 'Objeto incompleto',
                message: `Hacen falta los siguientes campos para poder modificar la información del disp_usuario {${minF.toString()}}${extraFields.length > 0 ? `\nLos siguientes campos no deben existir {${extraFields.toString()}}` : ''}`
            });
        }

        if (await Disp_Usuario.findOne({ where: { idUsuario } }) == null) {
            return res.status(404).json({
                errorType: "Elemento no encontrado",
                message: `No existe disp_usuario con el ID ${idUsuario}`
            });
        }

        await Disp_Usuario.update(disp_usuario, { where: { idUsuario } });

        return res.status(200).json(await Disp_Usuario.findOne({ where: { idUsuario } }));
    },

    deleteDispUsuario: async (req, res) => {
        const idUsuario = parseInt(req.params.idUsuario);
        const disp_usuario = await Disp_Usuario.findOne({
            where: { idUsuario }
        });

        if (disp_usuario == null) {
            return res.status(404).json({
                errorType: "Elemento no encontrado",
                message: `No existe disp_usuario con el ID ${idUsuario}`
            });
        }

        await Disp_Usuario.destroy({ where: { idUsuario } });
        return res.status(200).json(disp_usuario);
    }
}

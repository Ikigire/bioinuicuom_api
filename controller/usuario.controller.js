// const Sequelize = require('sequelize');
// const bcrypt = require('bcrypt');
const validateEntry = require("../utils/validation.utils");
const { encryptPassword, validatePassword } = require('../utils/password.utils')

const db = require('./../models');
const { isRequestBodyPresent } = require("../utils/request.utils");


const Usuario = db.usuarios; // ORM para la tabla de usuarios


// async function validatePassword(password, hash) {
//     return await bcrypt.compareSync(password, hash);
// }

// function encryptPassword(password) {
//     const salt = bcrypt.genSaltSync(10, 'a');
//     password = bcrypt.hashSync(password, salt)
//     return password;
// }

module.exports = {
    createUsuario: async (req, res) => {
        const user = req.body;

        let minFields = ['nombre', 'email', 'password'];

        const {minFields:minF, extraFields} = validateEntry(user, minFields);

        if (minF.length > 0 || extraFields.length > 0) {
            const message = `${ minF.length>0 ? `Hacen falta los siguientes campos para poder crear un usuario {${minF.toString()}}`: '' }. ${ extraFields.length>0 ? `Los siguientes campos no deben exisir {${extraFields.toString()}}`: '' }`;
            return res.status(400).json({
                errorType: 'Objeto incompleto',
                message
            });
        }

        user.password = encryptPassword(user.password);

        Usuario.create(user)
            .then((user) => {
                return res.status(200).json(user);
            })
            .catch(error => {
                // console.log("Error", error.errors[0].message);
                return res.status(400).json({
                    errorType: `${error.errors[0].type}`,
                    message: `${error.errors[0].message}`
                });
            });
    },

    getAll: async (req, res) => {
        const tableFields = ['idUsuario', 'nombre', 'email'];
        let {fields} = req.query;

        if ( fields !== undefined && fields ){
            fields = fields.split(",");
            
            const finalFIelds = [];

            fields.forEach(field => {
                field = field.trim()
                if ( tableFields.includes(field) ){
                    finalFIelds.push(field);
                }
            });
            fields = finalFIelds;
        } else {
            fields = tableFields;
        }

        console.log(fields);
        
        const usuarios = await Usuario.findAll({
            attributes: fields
        });
        return res.status(200).json(usuarios);
    },

    getById: async (req, res) => {
        const id = parseInt(req.params.user_id);

        if (isNaN(id)) {
            return res.status(400).json({
                errorType: 'Bad Request',
                message: 'User id no fue recibido o está mal formateado'
            });
        }
        const user = await Usuario.findOne({
            where: {
                idUsuario: id
            }
        });

        if (user == null) {
            return res.status(404).json({
                errorType: "Elemento no encontrado",
                message: `No existe usuario con el ID ${id}`
            });
        }

        return res.status(200).json(user);
    },

    login: async (req, res) => {
        const loginData = req.body;
        console.log(loginData);

        let minFields = ['email', 'password'];

        const {minFields:minF, extraFields} = validateEntry(loginData, minFields);

        if (minF.length > 0 || extraFields.length > 0) {
            const message = `${ minF.length>0 ? `Hacen falta los siguientes campos para poder logear al usuario {${minF.toString()}}`: '' }. ${ extraFields.length>0 ? `Los siguientes campos no deben exisir {${extraFields.toString()}}`: '' }`;
            return res.status(400).json({
                errorType: 'Objeto incompleto',
                message
            });
        }
        const { email, password } = loginData;

        const user = await Usuario.findOne({
            where: {
                email
            }
        });

        if (user == null) {
            return res.status(404).json({
                errorType: "Elemento no encontrado",
                message: `Email no encontrado`
            });
        }

        if (!validatePassword(password, user.password)) {
            return res.status(404).json({
                errorType: "Elemento no encontrado",
                message: `Password incorrecto`
            });
        }
        const {password:_, ...usuario} = user.dataValues;

        return res.status(200).json(usuario);
    },

    updateUsuario: async (req, res) => {
        const idUsuario = parseInt(req.params.user_id);
        const user = req.body;

        if (user.idUsuario != idUsuario) {
            return res.status(403).json({
                errorType: `Movimiento no autorizado`,
                message: `Los Id del elemento que busca modificar y la información recibida no coinciden`
            })
        }

        let minFields = ['idUsuario', 'nombre', 'email', 'password'];

        minFields = validateEntry(user, minFields);

        if (minFields.length > 0) {
            return res.status(400).json({
                errorType: 'Objeto incompleto',
                message: `Hacen falta los siguientes campos para poder modificar la información del usuario {${minFields.toString()}}`
            });
        }

        if (await Usuario.findOne({ where: { idUsuario } }) == null) {
            return res.status(404).json({
                errorType: "Elemento no encontrado",
                message: `No existe usuario con el ID ${idUsuario}`
            });
        }

        user.password = encryptPassword(user.password);

        const usuario = await Usuario.update(user, { where: { idUsuario } })
        
        return res.status(200).json(user);
    },

    deleteUsuario: async (req, res) => {
        const idUsuario = parseInt(req.params.idUsuario);
        const user = await Usuario.findOne({
            where: { idUsuario }
        })

        if (user == null) {
            return res.status(404).json({
                errorType: "Elemento no encontrado",
                message: `No existe usuario con el ID ${id}`
            });
        }
        await Usuario.destroy({ where: { idUsuario } })
        return res.status(200).json(user);
    }
}
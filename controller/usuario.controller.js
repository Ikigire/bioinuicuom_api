const Sequelize = require('sequelize');
const bcrypt = require('bcrypt');

const db = require('./../models')
const Usuario = db.usuarios; // ORM para la tabla de usuarios

function validateEntry(user, minFields) {

    const keys = Object.keys(user);

    for (let key of keys) {
        // verificando si el objeto en el cuerpo trae los elementos necesarios
        if (minFields.includes(key)) {
            minFields = minFields.filter(value => value != key);
        }
    }

    return minFields
}


async function validatePassword(password, hash) {
    return await bcrypt.compareSync(password, hash);
}

function encryptPassword(password) {
    const salt = bcrypt.genSaltSync(10, 'a');
    password = bcrypt.hashSync(password, salt)
    return password;
}

module.exports = {
    createUsuario: async (req, res) => {
        const user = req.body;
        let minFields = ['nombre', 'email', 'password'];

        minFields = validateEntry(user, minFields);

        if (minFields.length > 0) {
            return res.status(400).json({
                errorType: 'Objeto incompleto',
                message: `Hacen falta los siguientes campos para poder crear un usuario {${minFields.toString()}}`
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

    getAll: async (_, res) => {
        const usuarios = await Usuario.findAll({
            attributes: ['user_id', 'nombre', 'email', 'active']
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
                user_id: id
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
        const { email, password } = req.params;

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

        const correctPassword = await validatePassword(password, user.password);
        if (!correctPassword) {
            return res.status(404).json({
                errorType: "Elemento no encontrado",
                message: `Password incorrecto`
            });
        }

        return res.status(200).json(user);
    },

    updateUsuario: async (req, res) => {
        const user_id = parseInt(req.params.user_id);
        const user = req.body;

        if (user.user_id != user_id) {
            return res.status(403).json({
                errorType: `Movimiento no autorizado`,
                message: `Los Id del elemento que busca modificar y la información recibida no coinciden`
            })
        }

        let minFields = ['user_id', 'nombre', 'email', 'password'];

        minFields = validateEntry(user, minFields);

        if (minFields.length > 0) {
            return res.status(400).json({
                errorType: 'Objeto incompleto',
                message: `Hacen falta los siguientes campos para poder modificar la información del usuario {${minFields.toString()}}`
            });
        }

        if (await Usuario.findOne({ where: { user_id } }) == null) {
            return res.status(404).json({
                errorType: "Elemento no encontrado",
                message: `No existe usuario con el ID ${user_id}`
            });
        }

        user.password = encryptPassword(user.password);

        const usuario = await Usuario.update(user, { where: { user_id } })
        
        return res.status(200).json(user);
    },

    deleteUsuario: async (req, res) => {
        const user_id = parseInt(req.params.user_id);
        const user = await Usuario.findOne({
            where: { user_id }
        })

        if (user == null) {
            return res.status(404).json({
                errorType: "Elemento no encontrado",
                message: `No existe usuario con el ID ${id}`
            });
        }
        await Usuario.destroy({ where: { user_id } })
        return res.status(200).json(user);
    }
}
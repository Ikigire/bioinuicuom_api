const nodemailer = require('nodemailer');
const validateEntry = require('../utils/validation.utils');
const { validation_codes, usuarios } = require('../models');
const { sendEmail } = require('../utils/mailer.utils');

const Usuario = usuarios; // ORM para la tabla de usuarios
const ValidationCodeModel = validation_codes;

module.exports = ({
    createNewCode: (req, res) => {
        const body = req.body;
        let minimal = ['email'];
        const { minFields, extraFields } = validateEntry(body, minimal);

        if (minFields.length > 0 || extraFields.length > 0) {
            const message = `${minFields.length > 0 ? `Hacen falta los siguientes campos para poder crear un código de validación {${minFields.toString()}}` : ''}${extraFields.length > 0 ? `\nLos siguientes campos no deben exisir {${extraFields.toString()}}` : ''}`;
            return res.status(400).json({
                errorType: 'Objeto incompleto',
                message
            });
        }

        const email = String(body.email);

        const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g;
        const match = email.match(emailRegex);
        if (!match) {
            return res.status(400).json({
                errorType: 'Objeto incompleto',
                message: `El dato ${email} no es un email válido`
            });
        }

        const code = (Math.random() + 1).toString(36).substring(7).toUpperCase();
        console.log("Random code:", code);


        // return res.status(200).json({message: `Código creado con éxito para el usuario ${email}`})
        ValidationCodeModel.destroy({
            where: {
                email
            }
        })
            .then(() => {
                return ValidationCodeModel.create({
                    email,
                    code
                })
            })
            .then((nuevoCodigo) => {
                sendEmail(email, code);
                return res.status(200).json({ message: `Código creado con éxito para el usuario ${email}` })
            })
            .catch(error => {
                return res.status(500).json({
                    errorType: 'Internal Server Error',
                    message: error.message
                })
            });
    },

    createRecoveryCode: (req, res) => {
        const body = req.body;
        let minimal = ['email'];
        const { minFields, extraFields } = validateEntry(body, minimal);

        if (minFields.length > 0 || extraFields.length > 0) {
            const message = `${minFields.length > 0 ? `Hacen falta los siguientes campos para poder crear un código de validación {${minFields.toString()}}` : ''}${extraFields.length > 0 ? `\nLos siguientes campos no deben exisir {${extraFields.toString()}}` : ''}`;
            return res.status(400).json({
                errorType: 'Objeto incompleto',
                message
            });
        }

        const email = String(body.email);

        const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g;
        const match = email.match(emailRegex);
        if (!match) {
            return res.status(400).json({
                errorType: 'Objeto incompleto',
                message: `El dato ${email} no es un email válido`
            });
        }

        const code = (Math.random() + 1).toString(36).substring(7).toUpperCase();
        console.log("Random code:", code);


        // return res.status(200).json({message: `Código creado con éxito para el usuario ${email}`})
        ValidationCodeModel.destroy({
            where: {
                email
            }
        })
            .then(() => {
                return ValidationCodeModel.create({
                    email,
                    code
                })
            })
            .then((nuevoCodigo) => {
                sendEmail(email, code, 2);
                return res.status(200).json({ message: `Código creado con éxito para el usuario ${email}` })
            })
            .catch(error => {
                return res.status(500).json({
                    errorType: 'Internal Server Error',
                    message: error.message
                })
            });
    },

    validateCode: (req, res) => {
        const body = req.body;
        let minimal = ['email', 'code'];
        const { minFields, extraFields } = validateEntry(body, minimal);

        if (minFields.length > 0 || extraFields.length > 0) {
            const message = `${minFields.length > 0 ? `Hacen falta los siguientes campos para poder validar un código {${minFields.toString()}}` : ''}${extraFields.length > 0 ? `\nLos siguientes campos no deben exisir {${extraFields.toString()}}` : ''}`;
            return res.status(400).json({
                errorType: 'Objeto incompleto',
                message
            });
        }

        const email = String(body.email);
        const code = String(body.code);

        const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g;
        const match = email.match(emailRegex);
        if (!match) {
            return res.status(400).json({
                errorType: 'Objeto incompleto',
                message: `El dato ${email} no es un email válido`
            });
        }

        ValidationCodeModel.findOne({
            where: {
                email,
                code
            }
        })
            .then(validationCode => {
                if (!validationCode) {
                    throw new Error(`No existe el código ${code} registrado para el correo ${email}`);
                }

                return ValidationCodeModel.destroy({ where: { email } })
            })
            .then(() => {
                return Usuario.findOne({
                    where: {
                        email
                    }
                });
            })
            .then(fulluser => {
                if (!fulluser)
                    return res.status(200).json({ email, code, status: 'Valid' })

                const { password, createdAt, updatedAt, ...user } = fulluser
                return res.status(200).json(user);
            })
            .catch(error => {
                if (error.message.indexOf("No existe") < 0)
                    return res.status(500).json({
                        errorType: 'Internal Server Error',
                        message: error.message
                    });

                return res.status(404).json({
                    errorType: 'Invalid code',
                    message: error.message
                });
            });
    }
});
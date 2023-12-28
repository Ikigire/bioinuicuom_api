const { QueryTypes } = require('sequelize');
const db = require('../models');
const validateEntry = require('../utils/validation.utils');

const Dispositivos = db.dispositivos; // ORM para la tabla de Dispositivos
const Est_Dispositivo = db.est_dispositivo;

const sequelize = db.sequelize;




module.exports = {
    createDispositivo: async (req, res) => {
        let dispositivo = req.body;
        let minFields = ['idDispositivo', 'nombreDispositivo', 'modelo', 'idGrupo', 'idEstab'];

        const { minFields: minF, extraFields } = validateEntry(dispositivo, minFields);

        if (minF.length > 0 || extraFields.length > 0) {
            const message = `${minF.length > 0 ? `Hacen falta los siguientes campos para poder crear un dispositivo {${minF.toString()}}` : ''}
                ${extraFields.length > 0 ? `Los siguientes campos no deben exisir {${extraFields.toString()}}` : ''}`;
            return res.status(400).json({
                errorType: 'Objeto incompleto',
                message
            });
        }

        const { idGrupo, idEstab, ...device } = dispositivo;
        const { nombreDispositivo, modelo, ...est_dispositivo } = dispositivo;

        Dispositivos.create(device)
            .then(disp => {
                dispositivo = disp;
                return Est_Dispositivo.create(est_dispositivo);
            })
            .then((est_disp) => {
                return res.status(200).json({
                    dispositivo,
                    est_disp
                });
            })
            .catch(async error => {
                if ( dispositivo.createdAt ) {
                    await Dispositivos.destroy({where: {idDispositivo: dispositivo.idDispositivo}});
                }
                return res.status(400).json({
                    errorType: `${error.name}`,
                    message: `No se puedo crear el Establecimiento`
                });
            });
    },

    getAllDispositivos: async (req, res) => {
        const tableFields = ['idDispositivo', 'nombreDispositivo', 'modelo'];
        let { fields } = req.query;

        if (fields ?? false) {
            fields = fields.split(",");
            fields = fields.filter(field => {
                field = field.trim();
                return tableFields.includes(field);
            });
        } else
            fields = tableFields;

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
        const dispositivo = await Dispositivos.findOne({
            where: {
                idDispositivo: id
            }
        });

        if (dispositivo == null) {
            return res.status(404).json({
                errorType: "Elemento no encontrado",
                message: `No existe usuario con el ID ${id}`
            });
        }

        return res.status(200).json(dispositivo);
    },

    getDispositivosByIdEstab: async (req, res) => {
        const id = req.params.idEstab ?? null;

        if (!id) {
            return res.status(400).json({
                errorType: 'Bad Request',
                message: 'El Id de Estab no fue recibido o está mal formateado'
            });
        }
        const relaciones = await Est_Dispositivo.findAll({
            where:
            {
                idEstab: id
            }
        });

        if (relaciones == null) {
            return res.status(404).json({
                errorType: "Elemento no encontrado",
                message: `No existe usuario con el ID ${id}`
            });
        }

        const dispositivos = [];
        for (let index = 0; index < relaciones.length; index++) {
            const est_disp = relaciones[index];
            const { idDispositivo } = est_disp;
            dispositivos.push( await Dispositivos.findOne({ where: { idDispositivo } }) )
        }

        return res.status(200).json(dispositivos);
    },

    getDispositivosByEstabUsuario: async (req, res) => {
        const estab = req.params.estab;
        const idUsuario = parseInt(req.params.idUsuario);

        if (!estab || !idUsuario) {
            return res.status(400).json({
                errorType: 'Bad Request',
                message: 'El Id de usuario o nombre de Establecimiento no fue recibido o está mal formateado'
            });
        }
        // const relaciones = await Est_Dispositivo.findAll({
        //     where:
        //     {
        //         idUsuario
        //     }
        // });

        // if (relaciones == null) {
        //     return res.status(404).json({
        //         errorType: "Elemento no encontrado",
        //         message: `No existe usuario con el ID ${id}`
        //     });
        // }

        const dispositivos = await sequelize.query(`SELECT d.idDispositivo, d.nombreDispositivo, d.modelo, g.grupo FROM dispositivos AS d JOIN est_dispositivos AS ed ON d.idDispositivo = ed.idDispositivo JOIN grupos as g ON ed.idGrupo = g.idGrupo JOIN establecimientos AS e ON e.idEstab = ed.idEstab JOIN usuario_estabs AS ue ON e.idEstab = ue.idEstab WHERE e.establecimiento = '${estab}' AND ue.idUsuario = ${idUsuario}; `, 
        {
            type: QueryTypes.SELECT
        });

        return res.status(200).json(dispositivos);
    },


    updateDispositivo: async (req, res) => {
        const idDispositivo = req.params.idDispositivo;
        const dispositivo = req.body;
        console.info(idDispositivo, dispositivo);


        if (dispositivo.idDispositivo != idDispositivo) {
            return res.status(403).json({
                errorType: `Movimiento no autorizado`,
                message: `Los Id del elemento que busca modificar y la información recibida no coinciden`
            })
        }

        let minFields = ['idDispositivo', 'nombreDispositivo', 'modelo'];

        const {minFields: minF, extraFields} = validateEntry(dispositivo, minFields);

        if (minF.length > 0 || extraFields.length > 0) {
            return res.status(400).json({
                errorType: 'Objeto incompleto',
                message: `${ minF.length > 0 ? `Hacen falta los campos {${minF.toString()}} para poder modificar la información del dispositivo. ` : ''}${extraFields.length > 0 ? `\nLos siguientes campos no deben exisir {${extraFields.toString()}}` : ''}`
            });
        }

        if (await Dispositivos.findOne({ where: { idDispositivo } }) == null) {
            return res.status(404).json({
                errorType: "Elemento no encontrado",
                message: `No existe Dispositivo con el ID ${idDispositivo}`
            });
        }

        await Dispositivos.update(dispositivo, { where: { idDispositivo } })

        return res.status(200).json(await Dispositivos.findOne({ where: { idDispositivo } }));
    },

    deleteDispositivo: async (req, res) => {
        const idDispositivo = req.params.idDispositivo;
        const device = await Dispositivos.findOne({
            where: { idDispositivo }
        })

        if (device == null) {
            return res.status(404).json({
                errorType: "Elemento no encontrado",
                message: `No existe Dispositivo con el ID ${idDispositivo}`
            });
        }
        
        const rel = await Est_Dispositivo.findOne({where: {idDispositivo: device.idDispositivo}})

        await Est_Dispositivo.destroy({where: { idDispositivo }});
        await db.usuario_estab.destroy({where: { idEstab: rel.idEstab }});
        await db.grupo.destroy({where: {idGrupo: rel.idGrupo}});
        await db.establecimiento.destroy({where: {idEstab: rel.idEstab}});
        await Dispositivos.destroy({ where: { idDispositivo } });
        return res.status(200).json(device);
    }
}
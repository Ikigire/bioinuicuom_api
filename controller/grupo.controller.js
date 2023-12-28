const { QueryTypes } = require('sequelize');
const { grupo: GrupoModel, est_dispositivo: Est_Dispositivo, sequelize } = require('../models');
const validateEntry = require('../utils/validation.utils');


module.exports = {
    createGrupo: async (req, res) => {
        const grupo = req.body;

        const minf = ['grupo'];

        const { minFields, extraFields } = validateEntry(grupo, minf);
        console.log(minFields, extraFields);
        if (minFields.length > 0 || extraFields.length > 0) {
            return res.status(400).json({
                errorType: 'Objeto mal formateado',
                message: `${minFields.length > 0 ? `Hacen falta los siguientes campos: {${minFields.toString()}}. ` : ''}${extraFields.length > 0 ? `Los campos {${extraFields.toString()}} no deben ser incluidos` : ''}`
            });
        }

        GrupoModel.create(grupo)
            .then(nuevoGrupo => {
                return res.status(200).json(nuevoGrupo);
            })
            .catch(error => {

                return res.status(400).json({
                    errorType: `${error.name}`,
                    message: `No se puedo crear el establecimiento`
                });
            });
    },

    getAllGrupos: async (_, res) => {
        const tableFields = ['idGrupo', 'grupo'];

        const grupos = await GrupoModel.findAll({
            attributes: tableFields
        });

        return res.status(200).json(grupos);
    },

    getGrupoById: async (req, res) => {
        const idGrupo = parseInt(req.params.idGrupo);

        if (!idGrupo) {
            return res.status(400).json({
                errorType: 'Bad request',
                message: 'El Id del grupo no se recibió o está mal formateado'
            });
        }

        const grupo = await GrupoModel.findOne({ where: { idGrupo } });

        if (!grupo) {
            return res.status(404).json({
                errorType: 'Recurso no encontrado',
                message: `No existe grupo con el Id ${idGrupo}`
            });
        }

        return res.status(200).json(grupo);
    },

    getGrupoByIdEstab: async (req, res) => {
        const idEstab = parseInt(req.params.idEstab);

        if (!idEstab) {
            return res.status(400).json({
                errorType: 'Bad request',
                message: 'El Id del grupo no se recibió o está mal formateado'
            });
        }

        const relaciones = await Est_Dispositivo.findAll({ where: { idEstab } });

        // if (!relaciones){
        //     return res.status(404).json({
        //         errorType: 'Recurso no encontrado',
        //         message: `No existe grupos asociados con el Id ${idEstab}`
        //     });
        // }

        const grupos = [];

        for (let index = 0; index < relaciones.length; index++) {
            const relacion = relaciones[index];
            const { idGrupo } = relacion;
            if (!idGrupo)
                continue;
            grupos.push(await GrupoModel.findOne({ where: { idGrupo } }));
        }

        return res.status(200).json(grupos);
    },

    getGrupoByEstab: async (req, res) => {
        const estab = req.params.estab;
        const idUsuario = parseInt(req.params.idUsuario);

        if (!estab || !idUsuario) {
            return res.status(400).json({
                errorType: 'Bad request',
                message: 'El establecimiento  no se recibió o está mal formateado'
            });
        }

        const grupos = await sequelize.query(`SELECT g.idGrupo, g.grupo FROM grupos AS g JOIN est_dispositivos AS ed ON g.idGrupo = ed.idGrupo JOIN establecimientos AS e ON ed.idEstab = e.idEstab JOIN usuario_estabs AS ue ON e.idEstab = ue.idEstab WHERE e.establecimiento = '${estab}' AND ue.idUsuario = ${idUsuario}; `,
            {
                type: QueryTypes.SELECT
            }) ?? [];

        return res.status(200).json(grupos);
    },

    updateGrupo: async (req, res) => {
        const idGrupo = parseInt(req.params.idGrupo);
        const grupo = req.body;

        if (!idGrupo) {
            return res.status(400).json({
                errorType: 'Bad request',
                message: 'El Id del grupo no se recibió o está mal formateado'
            });
        }

        const minf = ['grupo', 'idGrupo'];

        const { minFields, extraFields } = validateEntry(grupo, minf);

        if (minFields.length || extraFields.length) {
            return res.status(400).json({
                errorType: 'Objeto mal formateado',
                message: `${minFields.length ? `Hacen falta los siguientes campos: {${minFields.toString()}}. ` : ''}${extraFields.length ? `Los campos {${extraFields.toString()}} no deben ser incluidos` : ''}`
            });
        }

        if (grupo.idGrupo != idGrupo) {
            return res.status(400).json({
                errorType: 'Bad request',
                message: 'El Id de la información y el Id recibido no coinciden'
            })
        }

        if (!(await GrupoModel.findOne({ where: { idGrupo } }))) {
            return res.status(404).json({
                errorType: 'Recurso no encontrado',
                message: 'El recurso que se busca modificar no existe'
            });
        }

        await GrupoModel.update(grupo, { where: { idGrupo } });

        return res.status(200).json(await GrupoModel.findOne({ where: { idGrupo } }));
    },

    deleteGrupo: async (req, res) => {
        const idGrupo = parseInt(req.params.idGrupo);

        if (!idGrupo) {
            return res.status(400).json({
                errorType: 'Bad request',
                message: 'El Id del grupo no se recibió o está mal formateado'
            });
        }

        const grupo = await GrupoModel.findOne({ where: { idGrupo } })

        if (!grupo) {
            return res.status(404).json({
                errorType: 'Recurso no encontrado',
                message: 'El recurso que se busca eliminar no existe'
            });
        }

        await Est_Dispositivo.destroy({ where: { idGrupo } });
        await GrupoModel.destroy({ where: { idGrupo } });

        return res.status(200).json(grupo);
    }
}
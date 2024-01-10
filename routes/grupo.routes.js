const { Router } = require("express");
const { getAllGrupos, createGrupo, getGrupoById, getGrupoByEstab, getGrupoByIdEstab, updateGrupo, deleteGrupo } = require("../controller/grupo.controller");

const GrupoRouter = Router();

GrupoRouter.get("/", getAllGrupos);
GrupoRouter.get("/:idGrupo", getGrupoById);
GrupoRouter.get("/estab/:idEstab", getGrupoByIdEstab);
GrupoRouter.get("/estab/:estab/:idUsuario", getGrupoByEstab);

GrupoRouter.post("/", createGrupo);

GrupoRouter.put("/:idGrupo", updateGrupo);

GrupoRouter.delete("/:idGrupo", deleteGrupo);

module.exports = GrupoRouter;

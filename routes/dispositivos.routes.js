const { Router } = require("express");
const { getAllDispositivos, getDispositivoById, getDispositivosByIdEstab, createDispositivo, updateDispositivo, deleteDispositivo, getDispositivosByEstabUsuario } = require("../controller/dispositivo.controller");

const DispositivoRouter = Router();

DispositivoRouter.get("/", getAllDispositivos);
DispositivoRouter.get("/:idDispositivo", getDispositivoById);
DispositivoRouter.get("/estab/:idEstab", getDispositivosByIdEstab);
DispositivoRouter.get("/estab/:estab/:idUsuario", getDispositivosByEstabUsuario);

DispositivoRouter.post("/", createDispositivo);

DispositivoRouter.put("/:idDispositivo", updateDispositivo);

DispositivoRouter.delete("/:idDispositivo", deleteDispositivo);

module.exports = DispositivoRouter;
const { Router } = require("express");
const { getAllDispositivos, getDispositivoById, createDispositivo, updateDispositivo, deleteDispositivo, getDispositivosByUsuario } = require("../controller/dispositivo.controller");

const DispositivoRouter = Router();

DispositivoRouter.get("/", getAllDispositivos);
DispositivoRouter.get("/:idDispositivo", getDispositivoById);
DispositivoRouter.get("/usuario/:idUsuario", getDispositivosByUsuario);

DispositivoRouter.post("/", createDispositivo);

DispositivoRouter.put("/:idDispositivo", updateDispositivo);

DispositivoRouter.delete("/:idDispositivo", deleteDispositivo);

module.exports = DispositivoRouter;

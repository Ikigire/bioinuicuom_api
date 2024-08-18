const { Router } = require("express");
const { createUbiDispositivo, deleteUbiDispositivo, getAllUbiDispositivos, getUbiDispositivoById, updateUbiDispositivo } = require("../controller/ubi_dispositivo.controller");

const UbiDispositivoRouter = Router();

UbiDispositivoRouter.get("/", getAllUbiDispositivos);
UbiDispositivoRouter.get("/:idUbicacion", getUbiDispositivoById);

UbiDispositivoRouter.post("/", createUbiDispositivo);

UbiDispositivoRouter.put("/:idUbicacion", updateUbiDispositivo);

UbiDispositivoRouter.delete("/:idUbicacion", deleteUbiDispositivo);

module.exports = UbiDispositivoRouter;

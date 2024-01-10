const { createEstablecimiento, deleteEstablecimiento, getAllEstablecimientos, getEstablecimientoById, getEstablecimientosByIdUsuario, updateEstablecimiento } = require("../controller/establecimiento.controller");

const { Router } = require("express");

const EstablecimientoRouter = Router();

EstablecimientoRouter.get("/", getAllEstablecimientos);
EstablecimientoRouter.get("/:idEstab", getEstablecimientoById);
EstablecimientoRouter.get("/usuario/:idUsuario", getEstablecimientosByIdUsuario);

EstablecimientoRouter.post("/", createEstablecimiento);

EstablecimientoRouter.put("/:idEstab", updateEstablecimiento);

EstablecimientoRouter.delete("/:idEstab", deleteEstablecimiento);

module.exports = EstablecimientoRouter;
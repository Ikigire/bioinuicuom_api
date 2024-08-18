const { Router } = require("express");
const { createDispUsuario, deleteDispUsuario, getAllDispUsuarios, getDispUsuarioById, updateDispUsuario } = require("../controller/disp_usuario.controller");

const DispUsuarioRouter = Router();

DispUsuarioRouter.get("/", getAllDispUsuarios);
DispUsuarioRouter.get("/:idUsuario", getDispUsuarioById);

DispUsuarioRouter.post("/", createDispUsuario);

DispUsuarioRouter.put("/:idUsuario", updateDispUsuario);

DispUsuarioRouter.delete("/:idUsuario", deleteDispUsuario);

module.exports = DispUsuarioRouter;

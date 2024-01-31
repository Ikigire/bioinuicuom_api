const { Router } = require('express');
const { createNewCode, createRecoveryCode, validateCode } = require('../controller/validation_codes.controller')

const ValidationCodesRouter = Router();

ValidationCodesRouter.post("/newcode", createNewCode)
ValidationCodesRouter.post("/recovery", createRecoveryCode)
ValidationCodesRouter.post("/validate", validateCode)

module.exports = ValidationCodesRouter
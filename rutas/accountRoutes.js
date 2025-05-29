const express = require('express');
const router = express.Router();

const consultarController = require('../controladores/consultarController');
const transaccionesController = require('../controladores/retirarController');

// Cuentas
router.get('/cuentas', consultarController.obtenerCuentas);
router.get('/cuentas/:id', consultarController.obtenerCuenta);

module.exports = router;
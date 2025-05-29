const express = require('express');
const router = express.Router();

const consultarController = require('../controladores/consultarController');
const transaccionesController = require('../controladores/retirarController');

// Transacciones
router.post('/transacciones/depositar', transaccionesController.depositar);
router.post('/transacciones/retirar', transaccionesController.retirar);
router.post('/transacciones/transferir', transaccionesController.transferir);
router.get('/transacciones/:cuentaId', transaccionesController.obtenerTransacciones);

module.exports = router;
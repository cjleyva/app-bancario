const express = require('express');
const router = express.Router();

const registroController = require('../controladores/registroController');
const loginController = require('../controladores/loginController');
const consultarController = require('../controladores/consultarController');
const transaccionesController = require('../controladores/retirarController');

// Autenticación
router.post('/registro', registroController.registrar);
router.post('/login', loginController.login);
router.get('/verificar-sesion', (req, res) => {
    res.json({
        success: true,
        message: "Verificación de sesión exitosa",
        timestamp: new Date().toISOString()
    });
});

// Cuentas
router.get('/cuentas', consultarController.obtenerCuentas);
router.get('/cuentas/:id', consultarController.obtenerCuenta);

// Transacciones
router.post('/transacciones/depositar', transaccionesController.depositar);
router.post('/transacciones/retirar', transaccionesController.retirar);
router.get('/transacciones/:cuentaId', transaccionesController.obtenerTransacciones);

module.exports = router;
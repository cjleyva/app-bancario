const express = require('express');
const router = express.Router();

const registroController = require('../controladores/registroController');
const loginController = require('../controladores/loginController');

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

module.exports = router;
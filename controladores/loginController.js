const ServicioLogin = require('../servicios/ServicioLogin');
const servicioLogin = new ServicioLogin();

const login = async (req, res) => {
  try {
    const { email, contrasena } = req.body;
    
    // Validación básica
    if (!email || !contrasena) {
      return res.status(400).json({
        success: false,
        message: 'Email y contraseña son requeridos'
      });
    }

    const resultado = await servicioLogin.login(email, contrasena);
    
    res.json({
      success: true,
      user: resultado.usuario,
      account: resultado.cuenta
    });
    
  } catch (error) {
    const status = error.message.includes('Credenciales') ? 401 : 
      error.message.includes('Cuenta') ? 404 : 500;
    
    res.status(status).json({
      success: false,
      message: error.message,
      details: 'Verifique sus credenciales'
    });
  }
};

module.exports = { login };
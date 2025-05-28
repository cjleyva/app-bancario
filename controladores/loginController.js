const ServicioLogin = require('../servicios/ServicioLogin');

class LoginController {
  constructor() {
    this.servicioLogin = new ServicioLogin();
    this.login = this.login.bind(this);
  }

  async login(req, res) {
    try {
      const { email, contrasena } = req.body;
      console.log('Intento de login recibido:', { email, contrasena });

      if (!email || !contrasena) {
        return res.status(400).json({ 
          success: false,
          message: 'Email y contraseña son requeridos' 
        });
      }

      const resultado = await this.servicioLogin.login(email, contrasena);
      console.log('Login exitoso para:', resultado.email);
      
      return res.json({
        success: true,
        message: 'Login exitoso',
        user: {
          id: resultado._id,
          email: resultado.email,
          nombre: resultado.nombre,
          rol_id: resultado.rol_id
        }
      });
    } catch (error) {
      console.error('Error completo en login:', {
        error: error.message,
        body: req.body,
        timestamp: new Date()
      });
      
      return res.status(401).json({
        success: false,
        message: error.message,
        details: 'Verifique sus credenciales'
      });
    }
  }
}

module.exports = new LoginController();
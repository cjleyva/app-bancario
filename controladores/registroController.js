const ServicioRegistro = require('../servicios/ServicioRegistro');

class RegistroController {
  constructor() {
    this.servicioRegistro = new ServicioRegistro();
  }

  registrar = async (req, res) => {
    try {
      const { nombre, email, contrasena, rol_id } = req.body;

      if (!nombre || !email || !contrasena) {
        return res.status(400).json({ 
          success: false,
          message: 'Nombre, email y contraseña son obligatorios' 
        });
      }

      const usuario = await this.servicioRegistro.registrarUsuario({
        nombre,
        email,
        contrasena, // Contraseña en texto plano (solo para desarrollo)
        rol_id
      });

      res.status(201).json({
        success: true,
        message: 'Usuario registrado exitosamente',
        user: {
          id: usuario._id,
          nombre: usuario.nombre,
          email: usuario.email,
          rol_id: usuario.rol_id
        }
        // No incluimos token
      });
    } catch (error) {
      console.error('Error en registro:', error);
      res.status(400).json({ 
        success: false,
        message: error.message.includes('email') ? 
          error.message : 
          'Error al registrar usuario'
      });
    }
  }
}

module.exports = new RegistroController();
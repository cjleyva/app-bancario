const Usuario = require('../modelos/Usuario');
const RolServicio = require('../servicios/rolServicio');
const rolServicio = new RolServicio();

class RegistroController {
  async registrar(req, res) {
    try {
      const { nombre, email, contrasena, esAdmin = false } = req.body;
      
      // Determinar el rol del nuevo usuario
      const rolId = esAdmin 
        ? await rolServicio.obtenerIdRolAdmin()
        : await rolServicio.obtenerIdRolUsuario();
      
      // Crear nuevo usuario
      const usuario = new Usuario({
        nombre,
        email,
        contrasena,
        rol_id: rolId
      });
      
      await usuario.save();
      
      // Generar token (opcional)
      const token = await usuario.generarAuthToken();
      
      res.status(201).json({
        success: true,
        usuario,
        token
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new RegistroController();
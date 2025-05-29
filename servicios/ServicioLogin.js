const Usuario = require('../modelos/Usuario');

class ServicioLogin {
  async login(email, contrasena) {
    try {
      // Normalizar entrada
      const emailNormalizado = email.trim().toLowerCase();
      const contrasenaLimpia = contrasena.trim();

      // Buscar usuario (insensible a mayúsculas/minúsculas en email)
      const usuario = await Usuario.findOne({ 
        email: { $regex: new RegExp(`^${emailNormalizado}$`, 'i') }
      }).select('+contrasena');

      if (!usuario) {
        console.log('Usuario no encontrado:', emailNormalizado);
        throw new Error('Credenciales inválidas');
      }

      // Comparación directa (sin bcrypt)
      if (contrasenaLimpia !== usuario.contrasena.trim()) {
        console.log('Contraseña incorrecta para:', emailNormalizado);
        throw new Error('Credenciales inválidas');
      }

      // Eliminar contraseña del objeto de respuesta
      const usuarioRespuesta = usuario.toObject();
      delete usuarioRespuesta.contrasena;

      return usuarioRespuesta;
    } catch (error) {
      console.error('Error en login:', {
        error: error.message,
        email: email,
        timestamp: new Date()
      });
      throw error;
    }
  }
}

module.exports = ServicioLogin;
const Usuario = require('../modelos/Usuario');
const bcrypt = require('bcrypt');

class ServicioRegistro {
  async registrarUsuario(datosUsuario) {
    try {
      // Verificar si el email ya está registrado
      const usuarioExistente = await Usuario.findOne({ email: datosUsuario.email });
      if (usuarioExistente) {
        throw new Error('El email ya está registrado');
      }

      //hashear contraseña antes de guardar
      const saltRounds = 10;
      const contrasenaHash = await bcrypt.hash(datosUsuario.contrasena, saltRounds);

      // Crear nuevo usuario
      const nuevoUsuario = new Usuario({
        nombre: datosUsuario.nombre,
        email: datosUsuario.email,
        contrasena: contrasenaHash,
        rol_id: datosUsuario.rol_id || '66532a1e3fc6ae1234567891' // ID de rol por defecto
      });

      // Guardar usuario en la base de datos
      const usuarioGuardado = await nuevoUsuario.save();

      // Convertir a objeto y eliminar contraseña
      const usuarioRespuesta = usuarioGuardado.toObject();
      delete usuarioRespuesta.contrasena;

      return usuarioRespuesta;
    } catch (error) {
      console.error('Error en registro:', error);
      
      // Manejar errores específicos de MongoDB
      if (error.name === 'MongoError' && error.code === 11000) {
        throw new Error('El email ya está registrado');
      }
      
      throw new Error('Error al crear el usuario');
    }
  }
}

module.exports = ServicioRegistro;
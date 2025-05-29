const Usuario = require('../modelos/Usuario');
const Cuenta = require('../modelos/Cuenta');
const bcrypt = require('bcrypt');
const { generarAccountNumber } = require('../utils/requestUtils');

class ServicioRegistro {
  async registrarUsuario(datosUsuario) {
    try {
      // Verificar si el email ya está registrado
      const usuarioExistente = await Usuario.findOne({ email: datosUsuario.email });
      if (usuarioExistente) {
        throw new Error('El email ya está registrado');
      }

      // Crear nuevo usuario (sin encriptar contraseña)
      const nuevoUsuario = new Usuario({
        nombre: datosUsuario.nombre,
        email: datosUsuario.email,
        contrasena: datosUsuario.contrasena, // Almacenar en texto plano (solo desarrollo)
        rol_id: datosUsuario.rol_id || '66532a1e3fc6ae1234567891' // ID de rol por defecto
      });

      // Guardar usuario en la base de datos
      const usuarioGuardado = await nuevoUsuario.save();

      // Convertir a objeto y eliminar contraseña
      const usuarioRespuesta = usuarioGuardado.toObject();
      delete usuarioRespuesta.contrasena;

      // Generar número de cuenta único
      const numeroCuenta = generarAccountNumber();

      // Crear cuenta asociada al usuario
      await this.crearCuenta(usuarioRespuesta._id, numeroCuenta, 0.00);

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

  // metodo para crear una cuenta asociada al usuario
  async crearCuenta(usuarioId, numCuenta, saldoInicial = 0.00) {
    try {
      // Crear una nueva cuenta
      const nuevaCuenta = new Cuenta({
        usuario_id: usuarioId,
        numero_cuenta: numCuenta,
        saldo: saldoInicial,
      });
      // Guardar la cuenta en la base de datos
      const cuentaGuardada = await nuevaCuenta.save();
      return cuentaGuardada;
    } catch (error) {
      console.error('Error en crear cuenta:', error);
      throw new Error('Error al crear la cuenta');
    }
  }
}

module.exports = ServicioRegistro;
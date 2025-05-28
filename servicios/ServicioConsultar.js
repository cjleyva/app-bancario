const Cuenta = require('../modelos/Cuenta');

class ServicioConsultar {
  /**
   * Obtiene todas las cuentas de un usuario
   * @param {string} usuarioId - ID del usuario
   * @returns {Promise<Array>} Lista de cuentas
   */
  static async obtenerCuentas(usuarioId) {
    try {
      const cuentas = await Cuenta.find({ usuario_id: usuarioId });
      return cuentas.map(cuenta => ({
        ...cuenta.toObject(),
        saldo: cuenta.formatearSaldo()
      }));
    } catch (error) {
      console.error('Error al obtener cuentas:', error);
      throw new Error('Error al obtener las cuentas');
    }
  }

  /**
   * Obtiene una cuenta específica por ID
   * @param {string} cuentaId - ID de la cuenta
   * @param {string} usuarioId - ID del usuario (para verificación)
   * @returns {Promise<Object>} Detalles de la cuenta
   */
  static async obtenerCuentaPorId(cuentaId, usuarioId) {
    try {
      const cuenta = await Cuenta.findOne({
        _id: cuentaId,
        usuario_id: usuarioId
      });

      if (!cuenta) {
        throw new Error('Cuenta no encontrada');
      }

      return {
        ...cuenta.toObject(),
        saldo: cuenta.formatearSaldo()
      };
    } catch (error) {
      console.error('Error al obtener cuenta:', error);
      throw new Error('Error al obtener la cuenta');
    }
  }
}

module.exports = ServicioConsultar;
const ServicioConsultar = require('../servicios/ServicioConsultar');

const consultarController = {
  /**
   * Obtiene cuentas de un usuario
   * @param {Object} req - Request
   * @param {Object} res - Response
   */
  obtenerCuentas: async (req, res) => {
    try {
      // En un sistema real, el usuarioId vendría de la sesión o token
      // Aquí lo pasamos como parámetro de consulta para simplificar
      const { usuarioId } = req.query;
      
      if (!usuarioId) {
        return res.status(400).json({
          success: false,
          message: 'Se requiere el ID de usuario'
        });
      }

      const cuentas = await ServicioConsultar.obtenerCuentas(usuarioId);
      
      res.json({
        success: true,
        data: cuentas
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  /**
   * Obtiene detalles de una cuenta específica
   * @param {Object} req - Request
   * @param {Object} res - Response
   */
  obtenerCuenta: async (req, res) => {
    try {
      const { id } = req.params;
      const { usuarioId } = req.query;
      
      if (!usuarioId) {
        return res.status(400).json({
          success: false,
          message: 'Se requiere el ID de usuario'
        });
      }

      const cuenta = await ServicioConsultar.obtenerCuentaPorId(id, usuarioId);
      
      res.json({
        success: true,
        data: cuenta
      });
    } catch (error) {
      const status = error.message.includes('no encontrada') ? 404 : 500;
      res.status(status).json({
        success: false,
        message: error.message
      });
    }
  }
};

module.exports = consultarController;
const ServicioTransacciones = require('../servicios/ServicioRetirar');

const transaccionesController = {
  depositar: async (req, res) => {
    try {
      const { cuentaId, monto } = req.body;
      
      if (!cuentaId || !monto) {
        return res.status(400).json({ 
          success: false, 
          message: 'Se requieren cuentaId y monto' 
        });
      }
      
      const resultado = await ServicioTransacciones.realizarDeposito(
        cuentaId, 
        parseFloat(monto)
      );
      
      res.json(resultado);
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: error.message 
      });
    }
  },

  retirar: async (req, res) => {
    try {
      const { cuentaId, monto } = req.body;
      
      if (!cuentaId || !monto) {
        return res.status(400).json({ 
          success: false, 
          message: 'Se requieren cuentaId y monto' 
        });
      }
      
      const resultado = await ServicioTransacciones.realizarRetiro(
        cuentaId, 
        parseFloat(monto)
      );
      
      res.json(resultado);
    } catch (error) {
      const status = error.message === 'Saldo insuficiente' ? 400 : 500;
      res.status(status).json({ 
        success: false, 
        message: error.message 
      });
    }
  },

  obtenerTransacciones: async (req, res) => {
    try {
      const transacciones = await ServicioTransacciones.obtenerPorCuenta(
        req.params.cuentaId
      );
      
      res.json({
        success: true,
        transacciones
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
};

module.exports = transaccionesController;
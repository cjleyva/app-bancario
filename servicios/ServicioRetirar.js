const Transaccion = require('../modelos/ReritarDepositar');
const Cuenta = require('../modelos/Cuenta');

class ServicioTransacciones {
  static async realizarDeposito(cuentaId, monto) {
    try {
      // Validar monto positivo
      if (monto <= 0) throw new Error('El monto debe ser positivo');
      
      // 1. Actualizar saldo de la cuenta
      const cuenta = await Cuenta.findById(cuentaId);
      if (!cuenta) throw new Error('Cuenta no encontrada');
      
      const nuevoSaldo = cuenta.saldo + monto;
      
      // 2. Crear transacción
      const transaccion = await Transaccion.create({
        cuenta_id: cuentaId,
        tipo: 'ingreso',
        monto,
        saldo_resultante: nuevoSaldo
      });
      
      // 3. Actualizar saldo de la cuenta
      cuenta.saldo = nuevoSaldo;
      await cuenta.save();
      
      return {
        success: true,
        nuevoSaldo,
        transaccion: {
          _id: transaccion._id,
          tipo: transaccion.tipo,
          monto: transaccion.monto,
          saldo_resultante: transaccion.saldo_resultante,
          creado_en: transaccion.creado_en
        }
      };
    } catch (error) {
      throw error;
    }
  }

  static async realizarRetiro(cuentaId, monto) {
    try {
      // Validar monto positivo
      if (monto <= 0) throw new Error('El monto debe ser positivo');
      
      // 1. Verificar saldo suficiente
      const cuenta = await Cuenta.findById(cuentaId);
      if (!cuenta) throw new Error('Cuenta no encontrada');
      if (cuenta.saldo < monto) throw new Error('Saldo insuficiente');
      
      const nuevoSaldo = cuenta.saldo - monto;
      
      // 2. Crear transacción
      const transaccion = await Transaccion.create({
        cuenta_id: cuentaId,
        tipo: 'retiro',
        monto,
        saldo_resultante: nuevoSaldo
      });
      
      // 3. Actualizar saldo de la cuenta
      cuenta.saldo = nuevoSaldo;
      await cuenta.save();
      
      return {
        success: true,
        nuevoSaldo,
        transaccion: {
          _id: transaccion._id,
          tipo: transaccion.tipo,
          monto: transaccion.monto,
          saldo_resultante: transaccion.saldo_resultante,
          creado_en: transaccion.creado_en
        }
      };
    } catch (error) {
      throw error;
    }
  }

  static async obtenerPorCuenta(cuentaId) {
    try {
      return await Transaccion.find({ cuenta_id: cuentaId })
        .sort({ creado_en: -1 })
        .select('tipo monto saldo_resultante creado_en');
    } catch (error) {
      throw error;
    }
  }
}

module.exports = ServicioTransacciones;
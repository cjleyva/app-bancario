const Transaccion = require('../modelos/ReritarDepositar');
const Cuenta = require('../modelos/Cuenta');
const mongoose = require('mongoose');

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

  // transferir entre cuentas 
  static async realizarTransferencia(numeroCuentaOrigen, numeroCuentaDestino, monto) {
    try {
      // Validar monto positivo
      if (monto <= 0) throw new Error('El monto debe ser positivo');
      
      // 1. Verificar cuentas y saldo suficiente
      const cuentaOrigen = await Cuenta.findOne({ numero_cuenta: numeroCuentaOrigen });
      const cuentaDestino = await Cuenta.findOne({ numero_cuenta: numeroCuentaDestino });
      
      if (!cuentaOrigen) throw new Error('Cuenta de origen no encontrada');
      if (!cuentaDestino) throw new Error('Cuenta de destino no encontrada');
      if (cuentaOrigen.saldo < monto) throw new Error('Saldo insuficiente en la cuenta de origen');
      
      // 2. Actualizar saldos
      const nuevoSaldoOrigen = cuentaOrigen.saldo - monto;
      const nuevoSaldoDestino = cuentaDestino.saldo + monto;

      // 3. Crear transacciones (usando una sesión para atomicidad)
      const session = await mongoose.startSession();
      session.startTransaction();
      
      try {
        // Crear transacción de origen
        const transaccionOrigen = await Transaccion.create([{
          cuenta_id: cuentaOrigen._id,
          tipo: 'transferencia',
          monto,
          saldo_resultante: nuevoSaldoOrigen,
          descripcion: `Transferencia a ${numeroCuentaDestino}`
        }], { session });
        
        // Crear transacción de destino
        const transaccionDestino = await Transaccion.create([{
          cuenta_id: cuentaDestino._id,
          tipo: 'deposito',
          monto,
          saldo_resultante: nuevoSaldoDestino,
          descripcion: `Transferencia desde ${numeroCuentaOrigen}`
        }], { session });
        
        // Actualizar saldos de las cuentas
        cuentaOrigen.saldo = nuevoSaldoOrigen;
        cuentaDestino.saldo = nuevoSaldoDestino;
        
        await cuentaOrigen.save({ session });
        await cuentaDestino.save({ session });
        
        await session.commitTransaction();
        
        return {
          success: true,
          nuevoSaldoOrigen,
          transaccionOrigen: transaccionOrigen[0],
          transaccionDestino: transaccionDestino[0]
        };
      } catch (error) {
        await session.abortTransaction();
        throw error;
      } finally {
        session.endSession();
      }
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
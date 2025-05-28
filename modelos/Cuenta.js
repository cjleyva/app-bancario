const mongoose = require('mongoose');

const cuentaSchema = new mongoose.Schema({
  usuario_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'usuarios',
    required: true
  },
  numero_cuenta: {
    type: String,
    required: true,
    unique: true
  },
  saldo: {
    type: Number,
    required: true,
    default: 0
  },
  creado_en: {
    type: Date,
    default: Date.now
  }
});

// Método para formatear el saldo
cuentaSchema.methods.formatearSaldo = function() {
  return this.saldo.toFixed(2);
};

module.exports = mongoose.model('Cuenta', cuentaSchema, 'cuentas');
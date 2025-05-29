const mongoose = require('mongoose');

const transaccionSchema = new mongoose.Schema({
  cuenta_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cuenta',
    required: true
  },
  tipo: {
    type: String,
    enum: ['ingreso', 'retiro', 'deposito', 'transferencia'], 
    required: true
  },
  monto: {
    type: Number,
    required: true,
    min: 0.01
  },
  descripcion: {
    type: String,
    default: ''
  },
  saldo_resultante: {
    type: Number,
    required: true
  },
  creado_en: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Transaccion', transaccionSchema);
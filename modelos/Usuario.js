const mongoose = require('mongoose');

class Usuario {
  constructor() {
    this.schema = new mongoose.Schema({
      nombre: {
        type: String,
        required: [true, 'El nombre es obligatorio'],
        trim: true
      },
      email: {
        type: String,
        required: [true, 'El email es obligatorio'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Por favor ingrese un email válido']
      },
      contrasena: {
        type: String,
        required: [true, 'La contraseña es obligatoria'],
        minlength: [6, 'La contraseña debe tener al menos 6 caracteres']
      },
      rol_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Rol',
        required: true
      },
      creado_en: {
        type: Date,
        default: Date.now
      },
      activo: {
        type: Boolean,
        default: true
      }
    });

    this._configureSchema();
  }

  _configureSchema() {
    // Método simplificado para ocultar contraseña en las respuestas
    this.schema.methods.toJSON = function() {
      const usuario = this.toObject();
      delete usuario.contrasena;
      delete usuario.__v; // Eliminar versión de mongoose
      return usuario;
    };

    // Virtual para acceder fácilmente al rol (sin populate)
    this.schema.virtual('rol').get(function() {
      return this.rol_id ? this.rol_id.toString() : null;
    });
  }

  getModel() {
    return mongoose.model('Usuario', this.schema);
  }
}

module.exports = new Usuario().getModel();
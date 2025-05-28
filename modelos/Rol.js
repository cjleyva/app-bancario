const mongoose = require('mongoose');

class Rol {
  constructor() {
    this.schema = new mongoose.Schema({
      nombre: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        enum: ['admin', 'usuario'], // Solo estos dos roles
        default: 'usuario' // Valor por defecto
      },
      descripcion: {
        type: String,
        trim: true,
        default: function() {
          return this.nombre === 'admin' 
            ? 'Administrador del sistema con todos los permisos' 
            : 'Usuario regular con permisos básicos';
        }
      },
      permisos: {
        type: [String],
        enum: ['crear', 'leer', 'actualizar', 'eliminar', 'administrar'],
        default: function() {
          return this.nombre === 'admin' 
            ? ['crear', 'leer', 'actualizar', 'eliminar', 'administrar']
            : ['leer']; // Permisos básicos para usuarios
        }
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

    // Método para transformar el documento al convertirlo a JSON
    this.schema.methods.toJSON = function() {
      const rol = this.toObject();
      rol.id = rol._id;
      delete rol._id;
      delete rol.__v;
      return rol;
    };

    // Método estático para obtener roles básicos
    this.schema.statics.obtenerRolesBasicos = function() {
      return {
        admin: '66532a1e3fc6ae1234567890', // ID fijo para admin
        usuario: '66532a1e3fc6ae1234567891' // ID fijo para usuario
      };
    };

    this.model = mongoose.model('Rol', this.schema);
  }
}

module.exports = new Rol().model;
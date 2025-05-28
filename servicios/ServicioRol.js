// servicios/rolServicio.js
const Rol = require('../modelos/Rol');

class RolServicio {
  constructor() {
    this.rolesBasicos = {
      admin: '66532a1e3fc6ae1234567890',
      usuario: '66532a1e3fc6ae1234567891'
    };
  }

  async obtenerIdRolAdmin() {
    return this.rolesBasicos.admin;
  }

  async obtenerIdRolUsuario() {
    return this.rolesBasicos.usuario;
  }

  async obtenerRolPorNombre(nombre) {
    try {
      return await Rol.findOne({ nombre });
    } catch (error) {
      throw new Error(`Error al obtener rol: ${error.message}`);
    }
  }
}

module.exports = RolServicio;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const connectDB = async () => {
  try {
    // Conexión a MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/banco');
    console.log('Conectado a MongoDB');

    // Inicializar datos
    await initializeData();
  } catch (error) {
    console.error('Error conectando a MongoDB:', error);
    process.exit(1);
  }
};

const initializeData = async () => {
  try {
    // Verificar si ya existen datos para no duplicarlos
    const rolesCount = await mongoose.connection.db.collection('roles').countDocuments();
    
    if (rolesCount === 0) {
      console.log('Inicializando datos en la base de datos...');
      
      // 1. Insertar roles
      const roles = await mongoose.connection.db.collection('roles').insertMany([
        { _id: new mongoose.Types.ObjectId("66532a1e3fc6ae1234567890"), nombre: "admin" },
        { _id: new mongoose.Types.ObjectId("66532a1e3fc6ae1234567891"), nombre: "usuario" }
      ]);
      console.log('Roles insertados');

      // 2. Insertar usuario admin
      const adminHash = await bcrypt.hash('admin123', 10);
      const admin = await mongoose.connection.db.collection('usuarios').insertOne({
        nombre: "Administrador Principal",
        email: "admin@banco.com",
        contrasena: adminHash,
        rol_id: new mongoose.Types.ObjectId("66532a1e3fc6ae1234567890"),
        creado_en: new Date()
      });
      console.log('Usuario admin creado');

      // 3. Insertar usuario normal
      const usuarioHash = await bcrypt.hash('usuario123', 10);
      const usuario = await mongoose.connection.db.collection('usuarios').insertOne({
        nombre: "Usuario Ejemplo",
        email: "usuario@banco.com",
        contrasena: usuarioHash,
        rol_id: new mongoose.Types.ObjectId("66532a1e3fc6ae1234567891"),
        creado_en: new Date()
      });
      console.log('Usuario normal creado');

      // 4. Insertar cuenta para el usuario normal
      const cuentaUsuario = await mongoose.connection.db.collection('cuentas').insertOne({
        usuario_id: usuario.insertedId,
        numero_cuenta: "1234567890123456",
        saldo: 1000.00
      });
      console.log('Cuenta para usuario creada');

      // 5. Insertar transacción para el usuario normal
      await mongoose.connection.db.collection('transacciones').insertOne({
        cuenta_id: cuentaUsuario.insertedId,
        tipo: "ingreso",
        monto: 1000.00,
        saldo_resultante: 1000.00,
        creado_en: new Date()
      });
      console.log('Transacción inicial creada');

      console.log('Datos iniciales creados exitosamente');
    } else {
      console.log('La base de datos ya contiene datos, omitiendo inicialización');
    }
  } catch (error) {
    console.error('Error inicializando datos:', error);
  }
};

module.exports = connectDB;
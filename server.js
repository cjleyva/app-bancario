require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/databaseMongo');
const webRoutes = require('./rutas/web');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Conexión a DB
connectDB();

// Archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api', webRoutes);

// Manejador de errores para API
app.use('/api', (req, res) => {
  res.status(404).json({ mensaje: 'Ruta API no encontrada' });
});

// SPA Catch-all Route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
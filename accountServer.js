require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/databaseMongo');
const accountRoutes = require('./rutas/accountRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Conexión a DB (puedes usar la misma o una diferente para accounts)
connectDB();

// API Routes - Solo cuentas
app.use('/api/accounts', accountRoutes);

// Manejador de errores
app.use('/api/accounts', (req, res) => {
  res.status(404).json({ mensaje: 'Ruta de cuentas no encontrada' });
});

const PORT = process.env.ACCOUNT_PORT || 3002;
app.listen(PORT, () => {
  console.log(`Account Service running on http://localhost:${PORT}`);
});
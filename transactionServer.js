require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/databaseMongo');
const transactionRoutes = require('./rutas/transactionRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Conexión a DB
connectDB();

// API Routes - Solo transacciones
app.use('/api/transactions', transactionRoutes);

// Manejador de errores
app.use('/api/transactions', (req, res) => {
  res.status(404).json({ mensaje: 'Ruta de transacciones no encontrada' });
});

const PORT = process.env.TRANSACTION_PORT || 3003;
app.listen(PORT, () => {
  console.log(`Transaction Service running on http://localhost:${PORT}`);
});
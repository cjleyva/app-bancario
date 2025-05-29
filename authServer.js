require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/databaseMongo');
const authRoutes = require('./rutas/authRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Conexión a DB (puedes tener una DB específica para auth)
connectDB();

// API Routes - Solo autenticación
app.use('/api/auth', authRoutes);

// Manejador de errores
app.use('/api/auth', (req, res) => {
    res.status(404).json({ mensaje: 'Ruta de autenticación no encontrada' });
});

const PORT = process.env.AUTH_PORT || 3001;
app.listen(PORT, () => {
    console.log(`Auth Service running on http://localhost:${PORT}`);
});
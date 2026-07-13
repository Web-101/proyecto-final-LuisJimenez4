const express = require('express');
const path = require('path');

const carteleraRouter = require('./routes/cartelera');
const preventasRouter = require('./routes/preventas');
const comprasRouter = require('./routes/compras');

const app = express();
const PORT = 3000;

// Middleware para parsear JSON en el cuerpo de las peticiones
app.use(express.json());

// Rutas de la API
app.use('/api/cartelera', carteleraRouter);
app.use('/api/preventas', preventasRouter);
app.use('/api/compras', comprasRouter);

// Sirve el frontend (index.html, css/, js/, assets/, pantallas/)
// para que fetch("/api/...") funcione desde el mismo origen
app.use(express.static(path.join(__dirname, '..')));

// Manejo de rutas no encontradas (como la 404)
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Manejo de errores internos (500)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

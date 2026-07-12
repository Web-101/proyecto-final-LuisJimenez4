const express = require('express');

const carteleraRouter = require('./routes/cartelera');

const app = express();
const PORT = 3000;

// Middleware para parsear JSON en el cuerpo de las peticiones
app.use(express.json());

// Rutas de la API
app.use('/api/cartelera', carteleraRouter);

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

const express = require('express');

const router = express.Router();

// GET /api/cartelera
// Respuesta de prueba; Persona B reemplazará esto con la lógica
// de películas y asientos.
router.get('/', (req, res) => {
  res.json({ mensaje: 'Cartelera funcionando' });
});

module.exports = router;

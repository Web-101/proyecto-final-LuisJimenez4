const express = require('express');
const {
  obtenerPeliculas,
  obtenerPelicula,
  agregarPelicula,
  eliminarPelicula,
  obtenerAsientos,
} = require('../controllers/peliculas');

const router = express.Router();

router.get('/', obtenerPeliculas);
router.post('/', agregarPelicula);
router.get('/:id', obtenerPelicula);
router.delete('/:id', eliminarPelicula);
router.get('/:id/asientos', obtenerAsientos);

module.exports = router;

const express = require('express');
const {
  crearCompra,
  obtenerCompras,
  obtenerCompra,
} = require('../controllers/compras');

const router = express.Router();

router.get('/', obtenerCompras);
router.post('/', crearCompra);
router.get('/:id', obtenerCompra);

module.exports = router;

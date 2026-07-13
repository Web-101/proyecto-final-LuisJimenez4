const express = require('express');
const { obtenerPreventas } = require('../controllers/preventas');

const router = express.Router();

router.get('/', obtenerPreventas);

module.exports = router;

const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, '..', 'data', 'compras.json');
const PELICULAS_PATH = path.join(__dirname, '..', 'data', 'peliculas.json');

const PRECIO_ENTRADA = 35;
const METODOS_VALIDOS = ['tarjeta', 'qr'];
const CAMPOS_CLIENTE = ['nombre', 'apellido', 'documento', 'celular', 'email'];

function leerCompras() {
  const contenido = fs.readFileSync(DATA_PATH, 'utf-8');
  return JSON.parse(contenido);
}

function guardarCompras(compras) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(compras, null, 2));
}

function leerPeliculas() {
  const contenido = fs.readFileSync(PELICULAS_PATH, 'utf-8');
  return JSON.parse(contenido);
}

function validarCompra(datos) {
  const errores = [];
  const { peliculaId, hora, asientos, cliente, metodoPago } = datos;

  if (!Number.isInteger(peliculaId)) {
    errores.push('El campo "peliculaId" es obligatorio y debe ser un número entero.');
  }
  if (typeof hora !== 'string' || hora.trim() === '') {
    errores.push('El campo "hora" es obligatorio y debe ser un texto.');
  }
  const asientosValidos =
    Array.isArray(asientos) &&
    asientos.length > 0 &&
    asientos.every((a) => typeof a === 'string' && a.trim() !== '');
  if (!asientosValidos) {
    errores.push('El campo "asientos" debe ser un arreglo con al menos un asiento.');
  }
  if (!METODOS_VALIDOS.includes(metodoPago)) {
    errores.push(`El campo "metodoPago" debe ser uno de: ${METODOS_VALIDOS.join(', ')}.`);
  }
  if (typeof cliente !== 'object' || cliente === null) {
    errores.push('El campo "cliente" es obligatorio.');
  } else {
    CAMPOS_CLIENTE.forEach((campo) => {
      if (typeof cliente[campo] !== 'string' || cliente[campo].trim() === '') {
        errores.push(`El campo "cliente.${campo}" es obligatorio.`);
      }
    });
    if (typeof cliente.email === 'string' && !/\S+@\S+\.\S+/.test(cliente.email)) {
      errores.push('El campo "cliente.email" no tiene un formato válido.');
    }
  }

  return errores;
}

// POST /api/compras
// Mock de compra: valida y registra la constancia. NO se procesa ningún pago
// y NO se reciben ni guardan datos de tarjeta.
function crearCompra(req, res) {
  const errores = validarCompra(req.body);
  if (errores.length > 0) {
    return res.status(400).json({ error: 'Datos inválidos', detalles: errores });
  }

  const pelicula = leerPeliculas().find((p) => p.id === req.body.peliculaId);
  if (!pelicula) {
    return res.status(404).json({ error: `No existe una película con id ${req.body.peliculaId}.` });
  }

  const compras = leerCompras();
  const nuevoId = compras.reduce((max, c) => Math.max(max, c.id), 0) + 1;

  const cliente = {};
  CAMPOS_CLIENTE.forEach((campo) => {
    cliente[campo] = req.body.cliente[campo].trim();
  });

  const compra = {
    id: nuevoId,
    numeroOrden: `MC-${String(nuevoId).padStart(4, '0')}-BOL`,
    fecha: new Date().toISOString(),
    peliculaId: pelicula.id,
    titulo: pelicula.titulo,
    clasificacion: pelicula.clasificacion ?? 'TP',
    formato: pelicula.formato ?? '2D',
    hora: req.body.hora.trim(),
    asientos: req.body.asientos.map((a) => a.trim()),
    total: req.body.asientos.length * PRECIO_ENTRADA,
    metodoPago: req.body.metodoPago,
    cliente,
  };

  compras.push(compra);
  guardarCompras(compras);

  res.status(201).json(compra);
}

// GET /api/compras
function obtenerCompras(req, res) {
  res.json(leerCompras());
}

// GET /api/compras/:id
function obtenerCompra(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: 'El id debe ser un número entero.' });
  }

  const compra = leerCompras().find((c) => c.id === id);
  if (!compra) {
    return res.status(404).json({ error: `No existe una compra con id ${id}.` });
  }

  res.json(compra);
}

module.exports = {
  crearCompra,
  obtenerCompras,
  obtenerCompra,
  validarCompra,
};

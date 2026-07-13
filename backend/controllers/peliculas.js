const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, '..', 'data', 'peliculas.json');

function leerPeliculas() {
  const contenido = fs.readFileSync(DATA_PATH, 'utf-8');
  return JSON.parse(contenido);
}

function guardarPeliculas(peliculas) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(peliculas, null, 2));
}

function validarPelicula(datos) {
  const errores = [];
  const { titulo, poster, descripcion, genero, duracion, funciones } = datos;

  if (typeof titulo !== 'string' || titulo.trim() === '') {
    errores.push('El campo "titulo" es obligatorio y debe ser un texto.');
  }
  if (typeof poster !== 'string' || poster.trim() === '') {
    errores.push('El campo "poster" es obligatorio y debe ser un texto.');
  }
  if (typeof descripcion !== 'string' || descripcion.trim() === '') {
    errores.push('El campo "descripcion" es obligatorio y debe ser un texto.');
  }
  if (typeof genero !== 'string' || genero.trim() === '') {
    errores.push('El campo "genero" es obligatorio y debe ser un texto.');
  }
  if (typeof duracion !== 'number' || !Number.isFinite(duracion) || duracion <= 0) {
    errores.push('El campo "duracion" es obligatorio y debe ser un número mayor a 0.');
  }
  if (funciones !== undefined) {
    const esArrayDeStrings =
      Array.isArray(funciones) && funciones.every((f) => typeof f === 'string');
    if (!esArrayDeStrings) {
      errores.push('El campo "funciones" debe ser un arreglo de horarios (texto).');
    }
  }

  return errores;
}

// GET /api/cartelera
function obtenerPeliculas(req, res) {
  const peliculas = leerPeliculas();
  res.json(peliculas);
}

// POST /api/cartelera
function agregarPelicula(req, res) {
  const errores = validarPelicula(req.body);
  if (errores.length > 0) {
    return res.status(400).json({ error: 'Datos inválidos', detalles: errores });
  }

  const peliculas = leerPeliculas();
  const nuevoId = peliculas.reduce((max, p) => Math.max(max, p.id), 0) + 1;

  const nuevaPelicula = {
    id: nuevoId,
    titulo: req.body.titulo.trim(),
    poster: req.body.poster.trim(),
    descripcion: req.body.descripcion.trim(),
    genero: req.body.genero.trim(),
    duracion: req.body.duracion,
    funciones: req.body.funciones ?? [],
  };

  peliculas.push(nuevaPelicula);
  guardarPeliculas(peliculas);

  res.status(201).json(nuevaPelicula);
}

// DELETE /api/cartelera/:id
function eliminarPelicula(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: 'El id debe ser un número entero.' });
  }

  const peliculas = leerPeliculas();
  const index = peliculas.findIndex((p) => p.id === id);

  if (index === -1) {
    return res.status(404).json({ error: `No existe una película con id ${id}.` });
  }

  const [eliminada] = peliculas.splice(index, 1);
  guardarPeliculas(peliculas);

  res.json({ mensaje: 'Película eliminada', pelicula: eliminada });
}

const ESTADOS_ASIENTO = ['disponible', 'ocupado', 'seleccionado'];
const PROBABILIDADES = [0.6, 0.3, 0.1]; // disponible / ocupado / seleccionado
const FILAS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
const ASIENTOS_POR_FILA = 10;

function elegirEstadoAleatorio() {
  const azar = Math.random();
  let acumulado = 0;
  for (let i = 0; i < ESTADOS_ASIENTO.length; i++) {
    acumulado += PROBABILIDADES[i];
    if (azar <= acumulado) return ESTADOS_ASIENTO[i];
  }
  return 'disponible';
}

function simularAsientos() {
  return FILAS.map((fila) => ({
    fila,
    asientos: Array.from({ length: ASIENTOS_POR_FILA }, (_, i) => ({
      numero: i + 1,
      codigo: `${fila}${i + 1}`,
      estado: elegirEstadoAleatorio(),
    })),
  }));
}

// GET /api/cartelera/:id/asientos
function obtenerAsientos(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: 'El id debe ser un número entero.' });
  }

  const peliculas = leerPeliculas();
  const pelicula = peliculas.find((p) => p.id === id);

  if (!pelicula) {
    return res.status(404).json({ error: `No existe una película con id ${id}.` });
  }

  res.json({ peliculaId: id, sala: simularAsientos() });
}

module.exports = {
  obtenerPeliculas,
  agregarPelicula,
  eliminarPelicula,
  obtenerAsientos,
  validarPelicula,
};
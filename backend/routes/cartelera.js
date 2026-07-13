const express = require('express');
const router = express.Router();
// 1. Agregamos las herramientas de Node para manejar archivos (Justo aquí arriba)
const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, '../data/peliculas.json');

const leerDatos = () => JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
const guardarDatos = (datos) => fs.writeFileSync(jsonPath, JSON.stringify(datos, null, 2));


// GET /api/cartelera
// 2. REEMPLAZAMOS la respuesta de prueba con la lógica real de lectura
router.get('/', (req, res) => {
  try {
    const peliculas = leerDatos();
    res.json(peliculas);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener la cartelera' });
  }
});


// 3. AÑADIMOS las rutas adicionales requeridas por debajo
// POST /api/cartelera -> Agregar película
router.post('/', (req, res) => {
  const { titulo, genero, duracion } = req.body;
  if (!titulo || !genero || !duracion) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }
  try {
    const peliculas = leerDatos();
    const nuevaPelicula = {
      id: peliculas.length > 0 ? peliculas[peliculas.length - 1].id + 1 : 1,
      titulo, genero, duracion,
      asientos: [
        { "id": "A1", "estado": "disponible" },
        { "id": "A2", "estado": "ocupado" }
      ]
    };
    peliculas.push(nuevaPelicula);
    guardarDatos(peliculas);
    res.status(201).json({ mensaje: 'Película agregada', nuevaPelicula });
  } catch (error) {
    res.status(500).json({ error: 'Error al guardar' });
  }
});

// DELETE /api/cartelera/:id -> Eliminar película
router.delete('/:id', (req, res) => {
  const idEliminar = parseInt(req.params.id);
  try {
    let peliculas = leerDatos();
    const existe = peliculas.find(p => p.id === idEliminar);
    if (!existe) return res.status(404).json({ error: 'No existe esa película' });

    peliculas = peliculas.filter(p => p.id !== idEliminar);
    guardarDatos(peliculas);
    res.json({ mensaje: `Película ${idEliminar} eliminada` });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar' });
  }
});

module.exports = router;

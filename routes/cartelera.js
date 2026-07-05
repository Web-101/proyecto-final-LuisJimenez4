const express = require("express");
const router = express.Router();
const fs = require("fs");

let peliculas = require("cartelera.json");

// GET todas las películas
router.get("/", (req, res) => {
  res.json(peliculas);
});

// POST nueva película
router.post("/", (req, res) => {
  const nueva = { id: Date.now(), ...req.body };
  peliculas.push(nueva);
  res.json(nueva);
});

// DELETE película por id
router.delete("/:id", (req, res) => {
  const id = parseInt(req.params.id);
  peliculas = peliculas.filter(p => p.id !== id);
  res.json({ mensaje: "Película eliminada" });
});

module.exports = router;

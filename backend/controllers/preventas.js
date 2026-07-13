const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, '..', 'data', 'preventas.json');

function leerPreventas() {
  const contenido = fs.readFileSync(DATA_PATH, 'utf-8');
  return JSON.parse(contenido);
}

// GET /api/preventas
// La disponibilidad no se guarda: una preventa deja de serlo cuando
// su fecha de estreno ya pasó, así que se calcula al momento.
function obtenerPreventas(req, res) {
  const hoy = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const preventas = leerPreventas().filter((p) => p.fechaEstreno > hoy);
  res.json(preventas);
}

module.exports = { obtenerPreventas };

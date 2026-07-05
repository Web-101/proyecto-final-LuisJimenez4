const express = require("express");
const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static("public"));

// Rutas
const carteleraRoutes = require("./routes/cartelera");
app.use("/api/cartelera", carteleraRoutes);

// Servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

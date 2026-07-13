// Homepage: carrusel de destacadas, cartelera y preventas desde la API.

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

// "2026-07-25" -> "25 Julio, 2026" (sin usar Date para evitar desfases de zona horaria)
function formatearFechaEstreno(iso) {
  const [anio, mes, dia] = iso.split("-").map(Number);
  return `${dia} ${MESES[mes - 1]}, ${anio}`;
}

// 95 -> "1h 35m"
function formatearDuracionCorta(minutos) {
  return `${Math.floor(minutos / 60)}h ${minutos % 60}m`;
}

/* ---------- Carrusel de película destacada ---------- */

let peliculasCarrusel = [];
let indiceCarrusel = 0;

function mostrarDestacada() {
  const peli = peliculasCarrusel[indiceCarrusel];
  if (!peli) return;

  const seccion = document.querySelector(".pelicula-destacada");
  seccion.querySelector(".destacada-titulo").textContent = peli.titulo;
  seccion.querySelector(".duracion").textContent = formatearDuracionCorta(peli.duracion);
  seccion.querySelector(".clasificacion").textContent = peli.clasificacion || "TP";
  seccion.querySelector(".genero").textContent = peli.genero;
  seccion.querySelector(".btn-comprar").href = `pantallas/funciones.html?id=${peli.id}`;

  // Fondo con el póster de la película actual + degradado para legibilidad
  seccion.style.backgroundImage =
    `linear-gradient(90deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.55) 40%, rgba(0,0,0,0.25) 100%), url('assets/img/${peli.poster || "fondo.png"}')`;
}

function iniciarCarrusel(peliculas) {
  peliculasCarrusel = peliculas;
  mostrarDestacada();

  document.querySelector(".carrusel-prev").addEventListener("click", () => {
    indiceCarrusel = (indiceCarrusel - 1 + peliculasCarrusel.length) % peliculasCarrusel.length;
    mostrarDestacada();
  });
  document.querySelector(".carrusel-next").addEventListener("click", () => {
    indiceCarrusel = (indiceCarrusel + 1) % peliculasCarrusel.length;
    mostrarDestacada();
  });
}

/* ---------- Cartelera ---------- */

function renderizarCartelera(peliculas) {
  const contenedor = document.querySelector(".peliculas-cartelera");
  contenedor.innerHTML = "";

  peliculas.forEach((peli) => {
    const article = document.createElement("article");
    article.className = "tarjeta-pelicula";

    const poster = peli.poster || "pelicula1.png";
    const clasificacion = peli.clasificacion || "TP";

    article.innerHTML = `
      <div class="poster-contenedor">
        <img src="assets/img/${poster}" alt="${peli.titulo}">
        <span class="badge-edad">${clasificacion}</span>
        <div class="overlay-pelicula">
          <p class="overlay-genero">${peli.genero || ""}</p>
          <h3 class="overlay-titulo">${peli.titulo}</h3>
          <a href="pantallas/funciones.html?id=${peli.id}" class="btn-overlay btn-overlay-comprar">Comprar</a>
          <a href="pantallas/funciones.html?id=${peli.id}" class="btn-overlay btn-overlay-horarios">Ver horarios</a>
        </div>
      </div>
    `;
    contenedor.appendChild(article);
  });
}

async function cargarCartelera() {
  const contenedor = document.querySelector(".peliculas-cartelera");
  if (!contenedor) return;

  try {
    const res = await fetch("/api/cartelera");
    if (!res.ok) throw new Error(`Error HTTP ${res.status}`);
    const peliculas = await res.json();

    renderizarCartelera(peliculas);
    iniciarCarrusel(peliculas);
  } catch (error) {
    console.error("No se pudo cargar la cartelera:", error);
    contenedor.innerHTML =
      '<p class="error-cartelera">No se pudo cargar la cartelera. Verifica que el servidor esté corriendo (node backend/server.js).</p>';
  }
}

/* ---------- Preventas ---------- */

async function cargarPreventas() {
  const contenedor = document.querySelector(".peliculas-preventas");
  if (!contenedor) return;

  try {
    const res = await fetch("/api/preventas");
    if (!res.ok) throw new Error(`Error HTTP ${res.status}`);
    const preventas = await res.json();

    contenedor.innerHTML = "";

    preventas.forEach((peli) => {
      const article = document.createElement("article");
      article.className = "tarjeta-preventa";
      article.innerHTML = `
        <div class="poster-contenedor">
          <img src="assets/img/${peli.poster}" alt="${peli.titulo}">
        </div>
        <div class="info-preventa">
          <h3>${peli.titulo}</h3>
          <p class="fecha-estreno">${formatearFechaEstreno(peli.fechaEstreno)}</p>
        </div>
      `;
      contenedor.appendChild(article);
    });
  } catch (error) {
    console.error("No se pudieron cargar las preventas:", error);
    contenedor.innerHTML =
      '<p class="error-cartelera">No se pudieron cargar las preventas.</p>';
  }
}

cargarCartelera();
cargarPreventas();

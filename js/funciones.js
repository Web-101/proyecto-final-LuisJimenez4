// Pantalla Funciones: carga la película indicada en ?id= desde la API
// y genera los horarios dinámicamente.

function formatearDuracion(minutos) {
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  return `${h}H ${String(m).padStart(2, "0")}M`;
}

async function cargarFuncion() {
  const params = new URLSearchParams(window.location.search);
  const id = parseInt(params.get("id")) || 1;

  try {
    const res = await fetch(`/api/cartelera/${id}`);
    if (!res.ok) throw new Error(`Error HTTP ${res.status}`);
    const peli = await res.json();

    // Columna derecha: información de la película
    const poster = document.querySelector(".poster-pelicula");
    poster.src = `../assets/img/${peli.poster || "pelicula1.png"}`;
    poster.alt = peli.titulo;

    document.querySelector(".peli-titulo").textContent = peli.titulo.toUpperCase();
    document.querySelector(".badge-info").innerHTML =
      `<img src="../assets/icons/duracion.svg" alt=""> ${formatearDuracion(peli.duracion)}`;
    document.querySelector(".badge-censura").textContent = peli.clasificacion || "TP";
    document.querySelector(".peli-generos").innerHTML =
      `<span class="tag-genero">${peli.genero}</span>`;
    document.querySelector(".peli-sinopsis").textContent = peli.descripcion;

    // Columna izquierda: bloque de horarios según el formato de la película
    const formato = peli.formato || "2D";
    document.querySelector(".bloque-formato h3").textContent = formato;

    const gridHoras = document.querySelector(".grid-horas");
    gridHoras.innerHTML = "";

    const funciones = Array.isArray(peli.funciones) ? peli.funciones : [];
    funciones.forEach((hora) => {
      const enlace = document.createElement("a");
      enlace.href = "asientos.html";
      enlace.className = "btn-hora";
      enlace.textContent = `${hora} hrs`;
      // Guarda la selección para que asientos.html y pagos.html la recuperen
      enlace.addEventListener("click", () => {
        sessionStorage.setItem(
          "reserva",
          JSON.stringify({ peliculaId: peli.id, hora, formato })
        );
      });
      gridHoras.appendChild(enlace);
    });

    if (funciones.length === 0) {
      gridHoras.innerHTML = "<p>No hay funciones disponibles para esta película.</p>";
    }
  } catch (error) {
    console.error("No se pudo cargar la función:", error);
    document.querySelector(".zona-seleccion").innerHTML =
      "<p>No se pudo cargar la información. Verifica que el servidor esté corriendo.</p>";
  }
}

cargarFuncion();

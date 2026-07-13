// Pantalla Asientos: genera el mapa de sala desde /api/cartelera/:id/asientos,
// permite seleccionar asientos y guarda la selección para pagos.html.

const PRECIO_ENTRADA = 35;

function obtenerReserva() {
  return JSON.parse(sessionStorage.getItem("reserva") || "null") || { peliculaId: 1 };
}

// El cine se arma con la ciudad elegida en el header
function nombreCine() {
  const select = document.getElementById("ciudad");
  if (!select) return "Multicine";
  return `Multicine ${select.options[select.selectedIndex].text}`;
}

function asientosSeleccionados() {
  return Array.from(document.querySelectorAll(".asiento.seleccionado")).map(
    (btn) => btn.dataset.codigo
  );
}

function actualizarResumen() {
  const seleccion = asientosSeleccionados();
  const lista = document.getElementById("lista-asientos");
  lista.innerHTML = seleccion.length
    ? seleccion.map((c) => `<li>${c}</li>`).join("")
    : "<li>—</li>";

  const total = (seleccion.length * PRECIO_ENTRADA).toFixed(2);
  document.querySelector(".resumen-precio .monto strong").textContent = total;
  document.querySelector(".precio-entrada").textContent = `BS. ${total}`;

  const reserva = obtenerReserva();
  document.querySelector(".cant-formato").textContent =
    `${seleccion.length} • General ${reserva.formato || "2D"}`;
}

async function cargarPantallaAsientos() {
  const reserva = obtenerReserva();

  try {
    // Información de la película para el resumen
    const resPeli = await fetch(`/api/cartelera/${reserva.peliculaId}`);
    if (resPeli.ok) {
      const peli = await resPeli.json();
      document.querySelector(".titulo-pelicula strong").textContent = peli.titulo;
      const miniPoster = document.querySelector(".mini-poster img");
      miniPoster.src = `../assets/img/${peli.poster || "pelicula1.png"}`;
      miniPoster.alt = peli.titulo;
      miniPoster.hidden = false;
      document.querySelector(".formato-pelicula").textContent =
        `${peli.formato || "2D"} - Doblada`;
      document.querySelector(".lugar-sala .detalle").textContent = nombreCine();
      // Sala derivada de la película (el backend no maneja salas todavía)
      document.querySelector(".lugar-sala .sala").textContent = `Sala ${peli.id}`;
      document.getElementById("ciudad").addEventListener("change", () => {
        document.querySelector(".lugar-sala .detalle").textContent = nombreCine();
      });
      if (reserva.hora) {
        const fecha = new Date().toLocaleDateString("es-ES", {
          weekday: "short",
          day: "numeric",
          month: "short",
        });
        document.querySelector(".resumen-funcion .fecha").textContent =
          `${fecha} · ${reserva.hora}`;
      }
    }

    // Mapa de asientos simulado por el backend
    const res = await fetch(`/api/cartelera/${reserva.peliculaId}/asientos`);
    if (!res.ok) throw new Error(`Error HTTP ${res.status}`);
    const { sala } = await res.json();

    const contenedor = document.querySelector(".asientos");
    contenedor.innerHTML = "";

    sala.forEach((fila) => {
      const divFila = document.createElement("div");
      divFila.className = "fila";
      divFila.dataset.fila = fila.fila;

      const grupo = fila.asientos
        .map((asiento) => {
          // "ocupado" y "seleccionado" (por otro cliente) no se pueden elegir
          const libre = asiento.estado === "disponible";
          const clase = libre ? "disponible" : "no-disponible";
          const disabled = libre ? "" : "disabled";
          return `<button class="asiento ${clase}" data-codigo="${asiento.codigo}" ${disabled}>${asiento.codigo}</button>`;
        })
        .join("");

      divFila.innerHTML = `
        <div class="etiqueta-fila">${fila.fila}</div>
        <div class="grupo-asientos">${grupo}</div>
      `;
      // Columnas según lo que devuelva el backend (actualmente 8 por fila)
      divFila.querySelector(".grupo-asientos").style.gridTemplateColumns =
        `repeat(${fila.asientos.length}, 42px)`;
      contenedor.appendChild(divFila);
    });

    // Selección con clic (solo asientos disponibles)
    contenedor.addEventListener("click", (e) => {
      const btn = e.target.closest(".asiento");
      if (!btn || btn.disabled) return;
      btn.classList.toggle("seleccionado");
      btn.classList.toggle("disponible");
      actualizarResumen();
    });

    actualizarResumen();

    // CONTINUAR: exige al menos un asiento y guarda la selección
    const btnContinuar = document.querySelector(".acciones .primario a");
    btnContinuar.addEventListener("click", (e) => {
      const seleccion = asientosSeleccionados();
      if (seleccion.length === 0) {
        e.preventDefault();
        alert("Selecciona al menos un asiento para continuar.");
        return;
      }
      sessionStorage.setItem(
        "reserva",
        JSON.stringify({ ...obtenerReserva(), asientos: seleccion })
      );
    });
  } catch (error) {
    console.error("No se pudo cargar el mapa de asientos:", error);
    document.querySelector(".asientos").innerHTML =
      "<p>No se pudo cargar el mapa de asientos. Verifica que el servidor esté corriendo.</p>";
  }
}

cargarPantallaAsientos();

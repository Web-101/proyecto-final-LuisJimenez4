// Carrito del header: al hacer clic muestra las compras registradas (GET /api/compras).
// Funciona en todas las páginas.

(function () {
  const icono = document.querySelector(".compras-icon");
  if (!icono) return;

  icono.style.cursor = "pointer";
  icono.classList.add("compras-icon-activo");

  let panel = null;

  function cerrarPanel() {
    if (panel) {
      panel.remove();
      panel = null;
    }
  }

  async function abrirPanel() {
    panel = document.createElement("div");
    panel.className = "panel-compras";
    panel.innerHTML = '<p class="compras-vacio">Cargando…</p>';
    panel.addEventListener("click", (e) => e.stopPropagation());
    icono.appendChild(panel);

    try {
      const res = await fetch("/api/compras");
      if (!res.ok) throw new Error(`Error HTTP ${res.status}`);
      const compras = await res.json();

      if (compras.length === 0) {
        panel.innerHTML = '<p class="compras-vacio">Aún no tienes compras.</p>';
        return;
      }

      const items = compras
        .slice()
        .reverse()
        .map((c) => {
          const fecha = new Date(c.fecha).toLocaleDateString("es-ES", {
            day: "numeric",
            month: "short",
          });
          return `
            <div class="compra-item">
              <p class="compra-titulo">${c.titulo}</p>
              <p class="compra-detalle">${fecha} · ${c.hora} hrs · ${c.formato}</p>
              <p class="compra-detalle">Asientos: ${c.asientos.join(", ")}</p>
              <p class="compra-detalle">${c.numeroOrden} · Bs. ${c.total.toFixed(2)}</p>
            </div>`;
        })
        .join("");

      panel.innerHTML = `<h4 class="compras-titulo">Mis compras</h4>${items}`;
    } catch (error) {
      console.error("No se pudieron cargar las compras:", error);
      panel.innerHTML = '<p class="compras-vacio">No se pudieron cargar las compras.</p>';
    }
  }

  icono.addEventListener("click", () => {
    if (panel) {
      cerrarPanel();
    } else {
      abrirPanel();
    }
  });

  // Cierra el panel al hacer clic fuera
  document.addEventListener("click", (e) => {
    if (panel && !icono.contains(e.target)) cerrarPanel();
  });
})();

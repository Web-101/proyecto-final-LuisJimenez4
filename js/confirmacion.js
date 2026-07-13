// Pantalla Confirmación: rellena el ticket digital con la compra registrada.

async function cargarTicket() {
  const params = new URLSearchParams(window.location.search);
  const id = parseInt(params.get("id")) || parseInt(sessionStorage.getItem("ultimaCompra"));
  if (!id) return; // sin compra registrada, se muestra el ticket de ejemplo

  try {
    const res = await fetch(`/api/compras/${id}`);
    if (!res.ok) throw new Error(`Error HTTP ${res.status}`);
    const compra = await res.json();

    document.querySelector(".titulo-gracias").textContent =
      `¡Gracias por tu compra, ${compra.cliente.nombre}!`;

    document.getElementById("ticket-pelicula").textContent = compra.titulo;
    document.getElementById("ticket-clasificacion").textContent = compra.clasificacion;
    document.getElementById("ticket-sala").textContent = `Sala 5 - ${compra.formato}`;

    const fecha = new Date(compra.fecha).toLocaleDateString("es-ES", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
    document.getElementById("ticket-fecha").textContent = `${fecha}, ${compra.hora} hrs`;
    document.getElementById("ticket-asientos").textContent = compra.asientos.join(", ");
    document.getElementById("ticket-orden").textContent = `#${compra.numeroOrden}`;
  } catch (error) {
    console.error("No se pudo cargar el ticket:", error);
  }
}

cargarTicket();

// Pantalla Pagos: alterna los campos según método de pago, rellena el resumen
// y al finalizar valida el formulario y registra la compra (mock: sin pago real).

const PRECIO_ENTRADA_PAGO = 35;

// Alternar campos según método de pago
(function () {
  const radios = document.querySelectorAll('input[name="metodo"]');
  const tarjetaCampos = document.querySelector(".tarjeta-campos");

  function actualizarVista() {
    const metodo = document.querySelector('input[name="metodo"]:checked').value;
    if (metodo === "tarjeta") {
      tarjetaCampos.setAttribute("aria-hidden", "false");
      tarjetaCampos.style.display = "";
    } else {
      tarjetaCampos.setAttribute("aria-hidden", "true");
      tarjetaCampos.style.display = "none";
    }
  }

  radios.forEach((r) => r.addEventListener("change", actualizarVista));
  actualizarVista();
})();

// El cine se arma con la ciudad elegida en el header
function nombreCine() {
  const select = document.getElementById("ciudad");
  if (!select) return "Multicine";
  return `Multicine ${select.options[select.selectedIndex].text}`;
}

// Rellenar el resumen con la película, hora y asientos elegidos
async function cargarResumen() {
  const reserva = JSON.parse(sessionStorage.getItem("reserva") || "null");
  if (!reserva) return; // sin reserva activa, el resumen queda con los placeholders

  try {
    const res = await fetch(`/api/cartelera/${reserva.peliculaId}`);
    if (!res.ok) throw new Error(`Error HTTP ${res.status}`);
    const peli = await res.json();

    document.querySelector(".titulo-pelicula strong").textContent = peli.titulo;
    document.querySelector(".formato-pelicula").textContent =
      `${peli.formato || "2D"} - Doblada`;

    const miniPoster = document.querySelector(".mini-poster img");
    miniPoster.src = `../assets/img/${peli.poster || "pelicula1.png"}`;
    miniPoster.alt = peli.titulo;
    miniPoster.hidden = false;

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

    if (Array.isArray(reserva.asientos) && reserva.asientos.length > 0) {
      document.getElementById("lista-asientos").innerHTML = reserva.asientos
        .map((a) => `<li>${a}</li>`)
        .join("");

      const total = (reserva.asientos.length * PRECIO_ENTRADA_PAGO).toFixed(2);
      document.querySelector(".resumen-precio .monto strong").textContent = total;
      document.querySelector(".precio-entrada").textContent = `BS. ${total}`;
      document.querySelector(".cant-formato").textContent =
        `${reserva.asientos.length} • General ${peli.formato || "2D"}`;
    }
  } catch (error) {
    console.error("No se pudo cargar el resumen de la reserva:", error);
  }
}

cargarResumen();

/* ---------- Finalizar compra (mock: no se procesa ningún pago) ---------- */

function valorCampo(id) {
  return document.getElementById(id).value.trim();
}

function marcarError(id, conError) {
  document.getElementById(id).classList.toggle("input-error", conError);
}

// Valida que el formulario esté completo. Devuelve la lista de problemas.
function validarFormulario(metodo) {
  const errores = [];

  const obligatorios = [
    ["nombre", "Nombre"],
    ["apellido", "Apellido"],
    ["documento", "Número de documento"],
    ["celular", "Celular"],
    ["email", "Correo electrónico"],
    ["nit", "NIT o C.I."],
    ["razon", "Nombre o Razón Social"],
  ];
  if (metodo === "tarjeta") {
    obligatorios.push(
      ["numero-tarjeta", "Número de tarjeta"],
      ["vencimiento", "Vencimiento"],
      ["cvv", "CVV"],
      ["titular", "Nombre del titular"]
    );
  }

  obligatorios.forEach(([id, etiqueta]) => {
    const vacio = valorCampo(id) === "";
    marcarError(id, vacio);
    if (vacio) errores.push(`${etiqueta} es obligatorio.`);
  });

  if (valorCampo("email") && !/\S+@\S+\.\S+/.test(valorCampo("email"))) {
    marcarError("email", true);
    errores.push("El correo electrónico no es válido.");
  }
  if (metodo === "tarjeta") {
    if (valorCampo("vencimiento") && !/^\d{2}\/\d{2}$/.test(valorCampo("vencimiento"))) {
      marcarError("vencimiento", true);
      errores.push("El vencimiento debe tener formato MM/AA.");
    }
    if (valorCampo("cvv") && !/^\d{3,4}$/.test(valorCampo("cvv"))) {
      marcarError("cvv", true);
      errores.push("El CVV debe tener 3 o 4 dígitos.");
    }
  }

  return errores;
}

document.getElementById("btn-finalizar").addEventListener("click", async () => {
  const msg = document.getElementById("msg-pago");
  msg.textContent = "";

  const reserva = JSON.parse(sessionStorage.getItem("reserva") || "null");
  if (!reserva || !Array.isArray(reserva.asientos) || reserva.asientos.length === 0) {
    msg.textContent =
      "No hay una reserva activa. Elige película, horario y asientos antes de pagar.";
    return;
  }

  const metodo = document.querySelector('input[name="metodo"]:checked').value;
  const errores = validarFormulario(metodo);
  if (errores.length > 0) {
    msg.textContent = errores[0];
    return;
  }

  // No se procesa ningún pago: solo se registra la constancia de la compra.
  // Los datos de tarjeta NUNCA se envían al servidor.
  const compra = {
    peliculaId: reserva.peliculaId,
    hora: reserva.hora,
    asientos: reserva.asientos,
    metodoPago: metodo,
    cliente: {
      nombre: valorCampo("nombre"),
      apellido: valorCampo("apellido"),
      documento: valorCampo("documento"),
      celular: valorCampo("celular"),
      email: valorCampo("email"),
    },
  };

  try {
    const res = await fetch("/api/compras", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(compra),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || `Error HTTP ${res.status}`);
    }
    const creada = await res.json();

    sessionStorage.setItem("ultimaCompra", creada.id);
    sessionStorage.removeItem("reserva");
    window.location.href = `confirmacion.html?id=${creada.id}`;
  } catch (error) {
    console.error("No se pudo registrar la compra:", error);
    msg.textContent = "No se pudo registrar la compra. Intenta de nuevo.";
  }
});

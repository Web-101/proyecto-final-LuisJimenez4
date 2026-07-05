async function cargarCartelera() {
  const res = await fetch("/api/cartelera");
  const peliculas = await res.json();

  const slidesContainer = document.querySelector(".slides");
  slidesContainer.innerHTML = "";

  peliculas.forEach((peli, i) => {
    const div = document.createElement("div");
    div.className = "slide" + (i === 0 ? " active" : "");
    div.innerHTML = `
      <img src="img/${peli.poster}" alt="${peli.titulo}">
      <h3>${peli.titulo}</h3>
      <p>${peli.descripcion}</p>
      <small>Funciones: ${peli.funciones.join(", ")}</small>
    `;
    slidesContainer.appendChild(div);
  });
}

cargarCartelera();

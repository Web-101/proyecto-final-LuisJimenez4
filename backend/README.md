# Backend — Cartelera de Cine

Servidor en Node.js con Express que expone la API de la cartelera.

## Requisitos

- [Node.js](https://nodejs.org/) (v18 o superior recomendado)

## Instalación

Desde la carpeta `backend/`:

```bash
npm install
```

## Cómo correr el servidor

```bash
npm start
```

o directamente:

```bash
node server.js
```

El servidor queda escuchando en `http://localhost:3000`.

El servidor también sirve el frontend: abre `http://localhost:3000/` en el
navegador para ver la página principal con la cartelera y preventas cargadas
desde la API.

## Endpoints disponibles

| Método | Ruta                          | Descripción                                              |
|--------|-------------------------------|----------------------------------------------------------|
| GET    | `/api/cartelera`              | Lista de películas en cartelera                          |
| GET    | `/api/cartelera/:id`          | Una sola película (la usan funciones/asientos/pagos)     |
| POST   | `/api/cartelera`              | Agrega una película (con validación de campos)           |
| DELETE | `/api/cartelera/:id`          | Elimina la película con ese `id`                         |
| GET    | `/api/cartelera/:id/asientos` | Mapa de sala simulado (8 filas × 8 asientos)             |
| GET    | `/api/preventas`              | Preventas cuya fecha de estreno aún no llegó             |
| GET    | `/api/compras`                | Lista de compras registradas (las muestra el carrito)    |
| GET    | `/api/compras/:id`            | Una compra (la usa la pantalla de confirmación)          |
| POST   | `/api/compras`                | Registra una compra mock: valida datos, **no procesa pago** |

El campo `formato` de películas y preventas acepta: `2D`, `2D XL`, `3D`, `2D SUB`.

## Flujo completo de una compra

El frontend acarrea la selección (`peliculaId`, `hora`, `asientos`) en
`sessionStorage` entre pantallas; el backend solo persiste algo al final,
en el `POST /api/compras`.

```mermaid
sequenceDiagram
    autonumber
    actor U as Usuario
    participant N as Navegador (frontend)
    participant S as Express (server.js)
    participant C as Controladores
    participant D as data/*.json

    U->>N: Abre http://localhost:3000/
    N->>S: GET /api/cartelera
    S->>C: obtenerPeliculas()
    C->>D: leer peliculas.json
    D-->>N: lista de películas (carrusel y tarjetas)
    N->>S: GET /api/preventas
    S->>C: obtenerPreventas()
    C->>D: leer preventas.json (filtra por fechaEstreno > hoy)
    D-->>N: preventas vigentes

    U->>N: Clic en "Comprar" (funciones.html?id=N)
    N->>S: GET /api/cartelera/:id
    S-->>N: película + horarios
    U->>N: Elige hora (se guarda en sessionStorage)

    U->>N: Pasa a asientos.html
    N->>S: GET /api/cartelera/:id/asientos
    S->>C: obtenerAsientos() — simula sala 8×8
    S-->>N: mapa de asientos (aleatorio, no persiste)
    U->>N: Selecciona asientos (sessionStorage)

    U->>N: Completa formulario en pagos.html
    N->>N: Valida formulario completo
    N->>S: POST /api/compras {peliculaId, hora, asientos, metodoPago, cliente}
    S->>C: crearCompra()
    C->>C: validarCompra() — 400 si hay errores
    C->>D: verificar película, calcular total (35 Bs × asiento)
    C->>D: guardar constancia en compras.json
    S-->>N: 201 + compra {numeroOrden "MC-0001-BOL", ...}
    N-->>U: Confirmación / ticket (no se procesó ningún pago real)

    U->>N: Clic en carrito del header
    N->>S: GET /api/compras
    S-->>N: historial de constancias
```

## Manejo de errores

- **400** — Datos inválidos en el POST (devuelve la lista de errores en `detalles`).
- **404** — Ruta o película inexistente.
- **500** — Error interno: `{ "error": "Error interno del servidor" }`

## Estructura

```
backend/
├── server.js                  # Punto de entrada: Express, estáticos, middleware y errores
├── routes/
│   ├── cartelera.js           # Router de /api/cartelera
│   ├── preventas.js           # Router de /api/preventas
│   └── compras.js             # Router de /api/compras
├── controllers/
│   ├── peliculas.js           # Lógica de películas, validación y simulación de asientos
│   ├── preventas.js           # Lógica de preventas (disponibilidad por fecha)
│   └── compras.js             # Lógica de compras mock (validación y constancias)
├── data/
│   ├── peliculas.json         # Persistencia de películas en cartelera
│   ├── preventas.json         # Próximos estrenos / preventas
│   └── compras.json           # Constancias de compras (mock, sin datos de tarjeta)
└── package.json
```

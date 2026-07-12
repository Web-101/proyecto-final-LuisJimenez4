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

## Endpoints disponibles

| Método | Ruta             | Descripción                                        |
|--------|------------------|----------------------------------------------------|
| GET    | `/api/cartelera` | Devuelve un JSON de prueba (respuesta provisional) |

Respuesta actual de `/api/cartelera`:

```json
{ "mensaje": "Cartelera funcionando" }
```

## Manejo de errores

- **404** — Si la ruta solicitada no existe: `{ "error": "Ruta no encontrada" }`
- **500** — Si ocurre un error interno: `{ "error": "Error interno del servidor" }`

## Estructura

```
backend/
├── server.js           # Punto de entrada: configura Express, middleware y errores
├── routes/
│   └── cartelera.js    # Router de /api/cartelera (aquí va la lógica de Persona B)
└── package.json
```

## Notas para Persona B

La ruta `/api/cartelera` está definida en `routes/cartelera.js` y ya está
montada en `server.js`. Para implementar la lógica de películas y asientos,
reemplaza la respuesta de prueba del `router.get('/')` y agrega las rutas
adicionales que necesites dentro del mismo router.

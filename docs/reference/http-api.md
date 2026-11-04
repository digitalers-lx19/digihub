# Referencia: API HTTP

Base: `http://<HOST>:<PORT>` (valores desde `.env`; el backend se monta en `/api/`
y todo `public/` se sirve estático). Los cuerpos JSON se aceptan gracias a
`express.json()` configurado en `src/app.ts`.

## Endpoints de aplicaciones

| Método | Ruta | Descripción | Respuesta |
|-|-|-|-|
| `GET` | `/api/` | Listado del hub | `200` `{ appName: "DigiHub", appList: [{ title, path }] }` |

`appList` se genera recorriendo los directorios de `public/games/`
(`src/services/games.service.ts`).

## Endpoints de autenticación

| Método | Ruta | Cuerpo | Códigos |
|-|-|-|-|
| `POST` | `/api/auth/signup` | `{ name, email, password }` | `201` usuario creado · `400` validación · `409` correo registrado · `500` error interno |
| `POST` | `/api/auth/login` | `{ email, password }` | `200` sesión iniciada · `400` faltan campos · `401` credenciales incorrectas · `500` error interno |

Formato de éxito (ambos endpoints, sin la contraseña):

```json
{ "user": { "id": "string", "name": "string", "email": "string", "createdAt": "ISO-8601" } }
```

Formato de error: `{ "message": "string" }`.

Reglas de validación: `name` ≥ 2 caracteres; `email` con formato válido, guardado
en minúsculas y único; `password` ≥ 6 caracteres.

## Modelo de usuario (`src/models/user.model.ts`)

| Campo | Tipo | Restricciones |
|-|-|-|
| `name` | String | requerido, `trim`, mínimo 2 |
| `email` | String | requerido, único, en minúsculas, `trim` |
| `password` | String | requerido; formato `salt:hash` (scrypt, hex) |
| `createdAt` / `updatedAt` | Date | automático (`timestamps: true`) |

## Rutas estáticas

| Ruta | Contenido |
|-|-|
| `/` | página principal del hub (`public/index.html`) |
| `/games/<juego>/` | frontend de cada juego |
| `/socket.io/socket.io.js` | cliente de Socket.IO provisto por el servidor |

## Configuración (`.env`)

| Variable | Uso | Default |
|-|-|-|
| `HOST` | display en el log de arranque | — |
| `PORT` | puerto HTTP/WebSocket | `3000` |
| `MONGODB_URI` | conexión de mongoose | `mongodb://localhost:27017/digihub` |

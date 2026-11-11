# Tutorial: primeras experiencias con DigiHub

Este tutorial te acompaña en tu primer contacto con el proyecto: instalar, arrancar,
explorar el hub, pintar en colaboración con otra persona y crear tu primera cuenta.
No requiere experiencia previa con el código del repositorio.

> Si buscás instructivos para una tarea concreta, pasá a la sección
> [Cómo](../howto/add-a-game.md). Si buscás datos exactos (endpoints, eventos),
> usá la [Referencia](../reference/http-api.md).

## 1. Requisitos

- Node.js 20 o superior.
- MongoDB accesible (local en `mongodb://localhost:27017/digihub` o Atlas).
- Un navegador.

## 2. Instalar y configurar

```bash
git clone https://github.com/digitalers-lx19/digihub.git
cd digihub
npm install
```

Creá un archivo `.env` en la raíz (se ignora por git, nunca lo subas):

```ini
HOST=localhost
PORT=3000
MONGODB_URI=mongodb://localhost:27017/digihub
```

## 3. Arrancar el servidor

```bash
npm run dev
```

Vas a ver dos confirmaciones: la conexión a la base (`database connected: digihub`)
y el servicio levantado en el puerto configurado.

## 4. Explorar el catálogo

Abrí `http://localhost:3000/api/` en el navegador o con `curl`:

```json
{
  "appName": "DigiHub",
  "appList": [
    { "title": "blackjack", "path": "/games/blackjack/" },
    { "title": "paintit", "path": "/games/paintit/" },
    { "title": "poker", "path": "/games/poker/" },
    { "title": "solitaire", "path": "/games/solitaire/" },
    { "title": "tictactoe", "path": "/games/tictactoe/" }
  ]
}
```

El listado se construye recorriendo las carpetas de `public/games/`: cada carpeta
es una aplicación, sin registro manual. Entrá a `http://localhost:3000/games/tictactoe/`.

## 5. Jugar en red local (dos pestañas)

1. En la pestaña A escribí una sala (por ejemplo `demo`) y creá la partida.
2. En la pestaña B entrás a la misma sala `demo` como segundo jugador.
3. Mové una ficha en A: el tablero de B se actualiza solo, por Socket.IO.
4. Cerrá la pestaña B: A ve la desconexión reflejada en la sala.

Lo mismo aplica a poker y blackjack (con `?room=` o el campo de sala). En paintit,
en lugar de turnos, lo que se sincroniza son los trazos: todo lo que dibujás se
reproduce en la pantalla de los demás usuarios de la misma sala.

## 6. Crear tu cuenta

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Ada Lovelace","email":"ada@example.com","password":"calcul0"}'
```

Respuesta (201), sin la contraseña:

```json
{ "user": { "id": "…", "name": "Ada Lovelace", "email": "ada@example.com", "createdAt": "…" } }
```

Y para iniciar sesión después, `POST /api/auth/login` con `email` y `password`.
El detalle completo está en [Cómo autenticarse](../howto/authentication.md).

## 7. Seguir explorando

- [Cómo agregar un juego nuevo](../howto/add-a-game.md)
- [Arquitectura del hub](../explanation/architecture.md)
- [Eventos de Socket.IO](../reference/websocket-events.md)

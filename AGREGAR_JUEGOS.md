# Cómo agregar juegos o aplicaciones al DigiHub

Guía actualizada a la estructura actual del proyecto: backend en TypeScript (ESM + NodeNext), Socket.IO para la comunicación en tiempo real y frontends estáticos servidos desde `public/`.

La idea central del hub es que **no hace falta tocar el menú ni registrar los handlers a mano**:

- El menú se arma leyendo las carpetas de `public/games/`.
- Los handlers de Socket.IO se registran automáticamente desde `src/sockets/index.ts`.

## 1) Cómo funciona el hub

Flujo de arranque:

```text
src/index.ts
  └── src/app.ts  (App)
        ├── crea el servidor HTTP + Socket.IO
        ├── registra TODAS las funciones exportadas por src/sockets/index.ts
        ├── GET /            → página principal del hub (ver nota 9)
        ├── GET /api/        → { appName, appList }
        └── express.static('./public/')
```

Archivos clave:

| Archivo | Rol |
|-|-|
| `src/index.ts` | Punto de entrada: carga `.env`, conecta la base y arranca `App()` |
| `src/app.ts` | Crea Express, el servidor HTTP, Socket.IO y registra los handlers |
| `src/services/games.service.ts` | Lee `public/games/` y genera el listado del menú |
| `src/controllers/main.controller.ts` | Expone el listado (`getApps`) |
| `src/routes/main.router.ts` | Monta el controlador en `/api/` |
| `src/sockets/index.ts` | Barrel de handlers: todo lo exportado acá se registra solo |
| `src/config/websocket.ts` | Singleton de Socket.IO (`WebSocket`) |
| `src/definitions/` | Tipados compartidos (incluye `definitions/games/`) |
| `public/games/` | Un directorio por juego/aplicación |

## 2) Estructura de carpetas

```text
digihub/
├── src/
│   ├── config/          # database, websocket
│   ├── controllers/     # controladores HTTP
│   ├── definitions/
│   │   └── games/       # tipos por juego
│   ├── routes/          # rutas HTTP
│   ├── services/        # lógica de negocio (listado de juegos)
│   ├── sockets/         # handlers de Socket.IO
│   │   ├── index.ts     # barrel de handlers
│   │   ├── msg.handler.ts
│   │   └── tictactoe.handler.ts
│   ├── utils/
│   ├── app.ts           # configuración de Express + Socket.IO
│   └── index.ts         # entrada
├── public/
│   ├── index.html       # página principal del hub
│   ├── app/             # assets/componentes del hub
│   └── games/
│       └── tictactoe/   # un directorio por juego
│           ├── index.html
│           ├── css/style.css
│           └── js/main.js
├── package.json
└── tsconfig.json
```

## 3) Paso 1: crear el frontend del juego

Crear la carpeta `public/games/<nombre>/`. **El nombre de la carpeta es el `title` y forma parte del `path`** que muestra el menú, así que usar `kebab-case` y sin espacios.

```text
public/games/mi-juego/
├── index.html
├── css/
│   └── style.css
└── js/
    └── main.js
```

`public/games/mi-juego/index.html`:

```html
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mi Juego | DigiHub</title>
    <link rel="stylesheet" href="./css/style.css">
</head>
<body>
    <main class="container">
        <h1>Mi Juego</h1>

        <section class="lobby">
            <input id="roomInput" placeholder="Código de sala" />
            <div class="actions">
                <button id="createBtn">Crear sala</button>
                <button id="joinBtn">Unirse / Observar</button>
            </div>
            <p id="info"></p>
        </section>

        <section class="game hidden">
            <!-- UI del juego -->
        </section>
    </main>

    <script src="/socket.io/socket.io.js"></script>
    <script src="./js/main.js"></script>
</body>
</html>
```

`public/games/mi-juego/js/main.js`:

```js
const socket = io();

const roomInput = document.getElementById("roomInput");
const createBtn = document.getElementById("createBtn");
const joinBtn = document.getElementById("joinBtn");
const info = document.getElementById("info");

let currentRoom = null;
let currentRole = null;

createBtn.addEventListener("click", () => {
    const room = roomInput.value.trim();
    if (!room) return;
    socket.emit("mi-juego:create", { room });
});

joinBtn.addEventListener("click", () => {
    const room = roomInput.value.trim();
    if (!room) return;
    socket.emit("mi-juego:join", { room });
});

socket.on("mi-juego:created", ({ room }) => {
    info.textContent = `Sala creada: ${room}`;
});

socket.on("mi-juego:joined", (data) => {
    currentRoom = data.room;
    currentRole = data.role;
    info.textContent = `Sala ${data.room} — rol: ${data.role}`;
});

socket.on("mi-juego:room:update", (state) => {
    console.log("estado de la sala", state);
});

socket.on("mi-juego:error", ({ message }) => {
    info.textContent = message;
});
```

Convenciones importantes del frontend:

- Usar rutas **relativas** para los assets (`./css/style.css`, `./js/main.js`), porque el juego se sirve en `/games/<nombre>/`.
- El cliente de Socket.IO se carga siempre desde la ruta absoluta `/socket.io/socket.io.js` (la provee el servidor).
- `io()` sin argumentos se conecta al mismo origen; no hardcodear host ni puerto.
- Todo archivo dentro de `public/` se sirve tal cual: no hay paso de compilación configurado para el frontend.
- `tsconfig.json` sólo incluye `src/**/*.ts`, por lo que el TypeScript que se agregue en `public/` **no se compila ni se verifica** con `npm run build`. Para juegos nuevos conviene Vanilla JS. Si se quiere TypeScript, React o Vite, hay que agregar el bundler y sus scripts a `package.json`, y compilar la salida dentro de `public/games/<nombre>/`.

## 4) Paso 2 (opcional): definir los tipos del juego

Si el estado de la sala es compartido o se quiere tipar el handler, crear `src/definitions/games/mi-juego.ts`:

```ts
import type { Object } from "../index.js";

export interface MiJuegoPlayer {
    id: string;
    role: "player" | "observer";
}

export interface MiJuegoRoomState extends Object {
    players: MiJuegoPlayer[];
    turn: string;
    winner: string | null;
}
```

Y exportarlo desde el barrel `src/definitions/games/index.ts`:

```ts
export * from "./tictactoe.js";
export * from "./mi-juego.js";
```

> Los imports internos llevan extensión `.js` (aunque el archivo sea `.ts`) por `module: NodeNext`. Usar `import type` para tipos por `verbatimModuleSyntax`.

## 5) Paso 3: crear el handler de Socket.IO

Crear `src/sockets/mi-juego.handler.ts`. El handler recibe el `Server` de Socket.IO y el `Socket` conectado; **no** hay que importar el singleton `WebSocket`.

```ts
import type { Server, Socket } from "socket.io";
import type { MiJuegoRoomState } from "../definitions/index.js";

const rooms = new Map<string, MiJuegoRoomState>();

const getOrCreateRoom = (room: string): MiJuegoRoomState => {
    if (!rooms.has(room)) {
        rooms.set(room, { players: [], turn: "X", winner: null });
    }
    return rooms.get(room)!;
};

export const miJuegoHandler = (ws: Server, socket: Socket) => {
    socket.on("mi-juego:create", (payload: { room?: string }) => {
        const room = payload?.room?.trim();
        if (!room) return;

        const state = getOrCreateRoom(room);
        socket.join(room);
        socket.emit("mi-juego:created", { room });
        ws.to(room).emit("mi-juego:room:update", state);
    });

    socket.on("mi-juego:join", (payload: { room?: string }) => {
        const room = payload?.room?.trim();
        if (!room) return;

        const state = getOrCreateRoom(room);
        const isPlayer = state.players.length < 2;

        if (isPlayer) {
            state.players.push({ id: socket.id, role: "player" });
        }

        socket.join(room);
        socket.emit("mi-juego:joined", {
            room,
            role: isPlayer ? "player" : "observer"
        });
        ws.to(room).emit("mi-juego:room:update", state);
    });

    socket.on("mi-juego:move", (payload: { room?: string; move?: unknown }) => {
        const room = payload?.room?.trim();
        if (!room || payload.move === undefined) return;

        const state = rooms.get(room);
        if (!state) return;

        const player = state.players.find(
            (p) => p.id === socket.id && p.role === "player"
        );
        if (!player) return;

        // Acá va la validación de la jugada y la actualización del estado.
        // ...

        ws.to(room).emit("mi-juego:move", { from: socket.id, move: payload.move });
        ws.to(room).emit("mi-juego:room:update", state);
    });

    socket.on("disconnecting", () => {
        for (const room of socket.rooms) {
            if (room === socket.id) continue;

            const state = rooms.get(room);
            if (!state) continue;

            const before = state.players.length;
            state.players = state.players.filter((p) => p.id !== socket.id);

            if (state.players.length !== before) {
                ws.to(room).emit("mi-juego:room:update", state);

                if (state.players.length === 0) {
                    rooms.delete(room);
                }
            }
        }
    });
};
```

Luego exportarlo desde `src/sockets/index.ts`:

```ts
export * from "./msg.handler.js";
export * from "./tictactoe.handler.js";
export * from "./mi-juego.handler.js";
```

Con eso queda registrado: `src/app.ts` hace

```ts
import * as Handlers from "./sockets/index.js";

const socketHandlers = Object.values(Handlers).filter(h => typeof h === "function");

ws.connect((socket: Socket) => {
    socketHandlers.map(handler => handler((WebSocket as any).ws, socket));
});
```

> **Ojo:** se registra **toda función exportada** por `src/sockets/index.ts`. Los valores que no son funciones (por ejemplo `chatRoom`) se filtran, pero no exportes helpers como funciones desde ese barrel: se ejecutarían como handlers en cada conexión.

### Contrato de eventos recomendado

| Evento | Dirección | Payload |
|-|-|-|
| `<juego>:create` | cliente → servidor | `{ room }` |
| `<juego>:created` | servidor → cliente | `{ room }` |
| `<juego>:join` | cliente → servidor | `{ room }` |
| `<juego>:joined` | servidor → cliente | `{ room, role, ... }` |
| `<juego>:move` | ambos | `{ room, ...jugada }` |
| `<juego>:room:update` | servidor → sala | estado completo |
| `<juego>:restart` | cliente → servidor | `{ room }` |
| `<juego>:error` | servidor → cliente | `{ message }` |

Reglas:

- Prefijar **todos** los eventos con el nombre del juego para evitar colisiones entre handlers (todos comparten el mismo `Server`).
- Validar siempre en el servidor: sala existente, cantidad de jugadores, turno y jugada.
- El creador entra a la sala con `socket.join(room)` y el estado se difunde con `ws.to(room).emit(...)`.
- Permitir observadores cuando la partida ya tiene el cupo completo.
- En `disconnecting`, quitar al jugador, notificar y borrar la sala si queda vacía.

## 6) Paso 4: el menú se actualiza solo

`src/services/games.service.ts` recorre `public/games/` en cada request:

```ts
export const getGames = () => {
    const appDir = resolve(process.cwd(), "public", "games");
    const entries = readdirSync(appDir, { withFileTypes: true });
    const games = entries
        .filter(entry => entry.isDirectory())
        .map(entry => ({
            title: entry.name,
            path: `/games/${entry.name}/`
        }));
    return games;
};
```

Por lo tanto, con sólo crear `public/games/mi-juego/` el juego ya aparece en:

```http
GET /api/
```

```json
{
  "appName": "DigiHub",
  "appList": [
    { "title": "mi-juego", "path": "/games/mi-juego/" }
  ]
}
```

Sólo hay que editar código si se quiere un título distinto al nombre de la carpeta, un orden particular o un `path` especial. En ese caso se modifica `getGames()` en `src/services/games.service.ts` (o el controlador `src/controllers/main.controller.ts`).

> El listado refleja **directorios**, así que una aplicación sin multijugador también se agrega creando su carpeta en `public/games/` y omitiendo el handler.

## 7) Verificación

```bash
# 1. Chequeo de tipos del backend (debe terminar sin errores)
npx tsc --noEmit

# 2. Levantar el servidor en modo desarrollo
npm run dev

# 3. Compilar para producción (genera dist/)
npm run build
```

Con el servidor levantado (el puerto sale de `.env`, por defecto `3000`):

1. `GET http://localhost:<PORT>/api/` debe incluir `{ "title": "mi-juego", "path": "/games/mi-juego/" }`.
2. `http://localhost:<PORT>/games/mi-juego/` debe cargar el frontend y sus assets.
3. Abrir el juego en dos pestañas o navegadores: la primera crea la sala, la segunda se une como jugador y una tercera como observador.
4. Cerrar una pestaña y verificar que el estado de la sala se actualice y que la sala se elimine al quedar vacía.
5. Revisar la consola del servidor y del navegador sin errores.

## 8) Checklist rápido

- [ ] Carpeta creada en `public/games/<nombre>/` con `index.html`, `css/` y `js/`
- [ ] Assets referenciados con rutas relativas y cliente desde `/socket.io/socket.io.js`
- [ ] Tipos del juego en `src/definitions/games/<nombre>.ts` y exportados en su `index.ts` (opcional)
- [ ] Handler en `src/sockets/<nombre>.handler.ts`
- [ ] Handler exportado en `src/sockets/index.ts` (registro automático)
- [ ] Eventos prefijados con `<nombre>:`
- [ ] Validaciones del lado del servidor y limpieza en `disconnecting`
- [ ] `npx tsc --noEmit` sin errores
- [ ] Probado con 2 jugadores + 1 observador y con desconexiones

## 9) Notas sobre el estado actual del repositorio

- `src/app.ts` referencia `mainController.getAppsPage`, pero el controlador sólo expone `getApps`. Eso hace fallar `npx tsc --noEmit`. Antes de usar esta guía como verificación, alinear ambos nombres (por ejemplo, usar `mainController.getApps` en la ruta `/`, o agregar `getAppsPage` al controlador).
- El menú real vive en `public/games/`. Algunos comentarios de `src/tests/index.test.ts` y del historial mencionan `public/app/`; esa carpeta hoy contiene los componentes del hub (`public/app/Components/`), no los juegos.
- `npm test` apunta a `jest`, pero Jest no está instalado y `src/tests/index.test.ts` sólo contiene comentarios. No hay suite automatizada todavía.
- `npm run build` ejecuta únicamente `tsc`: no copia ni compila `public/`, que ya se sirve estático.

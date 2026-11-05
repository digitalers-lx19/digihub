# Cómo agregar nuevos juegos o aplicaciones al DigiHub

Este documento explica paso a paso cómo agregar una nueva aplicación al hub, tanto el backend (WebSocket + handler), como el frontend (con TypeScript, Vanilla JS o React + Vite) y cómo registrarla en el menú.

## 1) Estructura general del proyecto

```text
digihub/
├── src/
│   ├── config/        # Configuración (database, websocket base)
│   ├── controllers/   # Controladores HTTP
│   ├── definitions/   # Tipados compartidos
│   ├── routes/        # Rutas HTTP
│   ├── sockets/       # Handlers de WebSocket por juego/aplicación
│   └── index.ts       # Punto de entrada
├── public/
│   ├── app/           # Frontends estáticos compilados/servidos
│   └── index.html     # Página principal del hub
└── README.md
```

## 2) Paso 1: Agregar la aplicación al menú del hub

El menú se genera desde `mainController.getApps()`. Ahí hay que agregar la entrada con `title` y `path`.

**Archivo:** `src/controllers/main.controller.ts`

```ts
import type { Request, Response } from "express"
export const mainController = {
    getApps: (_:Request, res:Response) => res.json({
        appName: 'DigiHub',
        appList: [
            { title: 'nodeDraw', path: '/app/nodeDraw/' },
            { title: 'tic-tac-toe', path: '/app/tictactoe/' },
            { title: 'mi-juego', path: '/app/mi-juego/' }
        ]
    }) 
}
```

> El `path` debe coincidir con la carpeta que se va a crear dentro de `public/app/` (o con la ruta que va a servir Express con `express.static('./public/')`).

## 3) Paso 2: Crear el handler de WebSocket para el juego

Todos los handlers van en `src/sockets/`. Usamos el servidor de Socket.IO (`ws`) que ya está instanciado en `src/index.ts`.

**Crear archivo:** `src/sockets/mi-juego.handler.ts`

```ts
import type { Server, Socket } from "socket.io";

interface RoomState {
    players: { id: string; username?: string }[];
    [key: string]: unknown;
}

const rooms = new Map<string, RoomState>();

export const miJuegoHandler = (ws: Server, socket: Socket) => {
    socket.on("mi-juego:create", (payload: { room: string }) => {
        if (!payload?.room) return;
        const room = payload.room.trim();
        if (!room || rooms.has(room)) {
            socket.emit("mi-juego:error", { message: "Sala inválida o ya existe" });
            return;
        }
        rooms.set(room, { players: [] });
        socket.join(room);
        socket.emit("mi-juego:created", { room });
        ws.to(room).emit("mi-juego:room:update", rooms.get(room));
    });

    socket.on("mi-juego:join", (payload: { room: string }) => {
        if (!payload?.room) return;
        const room = payload.room.trim();
        const state = rooms.get(room);
        if (!state) {
            socket.emit("mi-juego:error", { message: "La sala de mi-juego# PR
title doesn't exist" });
            return;
        }
        if (state.players.length < 2) {
            state.players.push({ id: socket.id });
            socket.join(room);
            socket.emit("mi-juego:joined", { room, role: "player" });
        } else {
            socket.join(room);
            socket.emit("mi-juego:joined", { room, role: "observer" });
        }
        ws.to(room).emit("mi-j-tag
room:update", state);
    });

    socket.on("mi-juego:move", (payload: { room: string; data: any }) => {
        if (!payload?.room) return;
        const room = payload.room.trim();
        const state = rooms.get(room);
        if (!state) return;
        ws.to(room).emit("mi-juego:move", { from: socket.id, ...payload.data });
    });

    socket.on("disconnecting", () => {
        for (const room of socket.rooms) {
            if (room === socket.id) continue;
            const state = rooms.get(room);
            if (!state) return;
            const before = state.players.length;
            state.players = state.players.filter((p) => p.id !== socket.id);
            if (state.players.length != before) {
                ws.to(room).emit("mi-juego:room:update", state);
                if (state.players.length === 0) {
                    rooms.delete(room);
                }
            }
        }
    });
};
``` 

## 4) Paso 3: Integrar el handler en el servidor

Agregar la importación y el llamado en `src/index.ts`.

**Archivo:** `src/index.ts`

```ts
import { config } from "dotenv";
import express from "express";
import { createServer } from "node:http";
import { Database, WebSocket } from "./config/index.js";
import { mainRouter } from './routes/main.router.js'
import type { Socket } from "socket.io";
import { msgHandler } from "./config/msg.handler.js";
import { tictactoeHandler } from "./sockets/tictactoe.handler.js";
import { miJuegoHandler } from "./sockets/mi-juego.handler.js";

config();
const db = new Database();
const app = express();
const server = createServer(app)
const ws = new WebSocket(server);

ws.connect((socket: Socket) => {
    msgHandler((WebSocket as any).ws, socket);
    tictactoeHandler((WebSocket as any).ws, socket);
    miJuegoHandler((WebSocket as
.any).ws, socket);
})

app.use('/api/', mainRouter);
app.use(express.static('./public/'));
server.listen(process.env.PORT ?? 3000, () => {
    const { HOST, PORT } = $env
    console.log(`service running on http://${HOST}:${PORT}`)
})
export { db, ws }
``` 

> Nota: Como `WebSocket.ws` is static, usando `(WebSocket as any).ws` or add `static getServer()`. 

## 5) Paso 4: Crear el frontend

Hay three options. The project is configured for static serving from `public/`.

### A) Vanilla JavaScript/HTML/CSS (rápido, sin build extra)

Create folder in `public/app/`.

```text
public/app/mi-juego/
├── index.html
├── css/style.css
│
└── js/main.js
``` 

Example `index.html`:
```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale 1.0">
  <title>Mi Juego | DigiHub</title>
  <link rel="stylesheet" href="./css/style.css">
</head>
<body>
  <main>
    <h1>Mi Juego</h1>
    <div class="lobby">
      <input id="roomInput" placeholder="Código de sala">
      <button id="createBtn">Crear sala</  </button>
      <button id="joinBtn">Unirse / Observador</button>
      <p id="info"></p>
    </div>
    <div class="game hidden">
      <!-- aquí tu UI -->
    </div>
  </main>
  <script src="/socket.io/socket.io.js"></script>
  <script src="./js/main.js"></script>
</body>
</html>
``` 

`main.js` uses `io()`, emit and listen on `mi-juego:*`.

### B) Vanilla TypeScript (src/app) con esbuild

Dependencies:
```bash
npm i -D esbuild copyfiles concurrently
``` 

Structure:
```text
src/app/mi-juego/
├── index.html
├── css/style.css
└── main.ts
``` 

Add script:
```json
{
  "scripts": {
    "build:mi-juego": "esbuild src/app/mi-juego/main.ts --bundle --format=esm --outfile=public/app/mi-juego/main.js && copyfiles -u 2 \"src/app/mi-juego/**/*.{html,css}\" public/app/mi-juego",
    "build:apps": "npm run build:mi-juego && npm run build:ttt",
    "build": "tsc && npm run build:apps"
  }
}
``` 

### C) React + TypeScript + Vite (recomendado)

Dependencies:
```bash
npm i react react-dom socket.io-client
npm i -D vite @vitejs/plugin-react @types/react @types/react-dom
``` 

Create `src/app/mi-juego/vite.config.ts` similar to tic-tac-toe:
```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
export default defineConfig({
  plugins: [react()],
  base: "/app/mi-juego/",
  build: {
    outDir: resolve(__dirname, "../../../public/app/mi-juego"),
    emptyOutDir: true,
    rollnOptions: {
      input: resolve(__dirname, "index.html")
    }
  }
});
``` 

Scripts:
```json
{
  "scripts": {
    "dev:mi-juego": "vite --config src/app/mi-juego/vite.config.ts",
    "build:mi-juego": "vite build --config src/app/mi-juego/vite.config.ts"
  }
}
``` 

For dev: run backend (`npm run dev`) and frontend (`npm run dev:mi-juego`) together.

## 6) Paso 5: Tests & verificación

1. Compilar backend: `npx tsc --noEmit`
2. Compilar frontend: `npm run build:mi-juego` (si aplica)
3. Levantar servidor: `npm run dev`
4. Abrir `http://localhost:{PORT}/api/` to verify appList includes `mi-juego`
5. Abr
    /app/mi-juego/ for frontend
 6. Test socket events with two clients or browser tabs

## Tips & recomendaciones

- **Nomenclatura**: usar prefijo por juego (`mi-juego:evento`), evitar conflictos.
- **Salas**: implementar misma lógica as tic-tac-toe (crear solo si no existe, unirse si existe). Delete empty rooms.
-# PR Title
  - **Observadores**: permitir a la 3ª persona unirse como observador.
- **Tipos**: definir interfaces en `src/definitions/` si se comparten.
- **Error handling**: emitir `*-error` to the client.
- **Frontend build**: for Vite use `base: "/app/<nombre>/"` and build to `public/app/<nombre>/`. For static files keep structure.
- **Static serving**: `app.use(express.static('./public/'))` already exists, so anything in `public/app/` is served.

## Checklist rápido

- [ ] Agregado al menu (`main.controller.ts`)
- [ ] Handler en `src/sockets/`
- [ ] Integrado en `src/index.ts`
- [ ] Frontend en `public/app/<nombre>/` or compiled to it
- [ ] Compila sin errores (`npx tsc --noEmit` or build)
- [ ] Probado en 2 clientes (jugadores + observador)

**Archivo creado:** `AGREGAR_JUEGOS.md` con esta documentación paso a paso. Set up for new users to add games easily.
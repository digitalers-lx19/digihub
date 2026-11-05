# DIGIHUB NodeJS Digitalers

El siguiente proyecto integrador consiste en la implementacion de las diferentes
herramientas aprendidas a lo largo de la capacitacion NodeJS Telecom Digitalers,
el mismo consiste en un hub de aplicaciones con mensajeria integrada.

Aplicaciones incluidas: **paintit** (dibujo colaborativo sincronizado por
websocket), **tictactoe**, **poker**, **blackjack**, **solitario** y un servicio
de **registro e inicio de sesión** de usuarios contra MongoDB.

## Colaboradores

En la siguiente tabla se muestran los usuarios que participaron de este proyecto

| usuario | desarrollador | area |
|-|-|-|
| c215714n | Cristian Racedo | administrador |

## Inicio rápido

```bash
npm install
# crear .env con HOST, PORT y MONGODB_URI
npm run dev
# hub: http://localhost:3000/ · listado: http://localhost:3000/api/
```

## Tabla de contenidos

La documentación sigue el marco Diátaxis (tutoriales, cómo, referencia y
explicación), el mismo que usan Canonical y Ubuntu:

| Tipo | Propósito | Documentos |
|-|-|-|
| 🎓 [Tutorial](docs/tutorial/getting-started.md) | aprender haciendo: primer arranque, primera sala, primera cuenta | [Primeras experiencias](docs/tutorial/getting-started.md) |
| 🛠 [Cómo](docs/howto/add-a-game.md) | resolver tareas concretas paso a paso | [Agregar un juego](docs/howto/add-a-game.md) · [Autenticación](docs/howto/authentication.md) · [Jugar en una sala](docs/howto/play-in-room.md) |
| 📖 [Referencia](docs/reference/http-api.md) | información técnica precisa y completa | [API HTTP](docs/reference/http-api.md) · [Eventos de Socket.IO](docs/reference/websocket-events.md) |
| 🧭 [Explicación](docs/explanation/architecture.md) | comprender el diseño y sus decisiones | [Arquitectura](docs/explanation/architecture.md) · [Seguridad](docs/explanation/security.md) · [Estado de los juegos](docs/explanation/game-state.md) |

### Detalle

- [Tutorial: primeras experiencias con DigiHub](docs/tutorial/getting-started.md)
- [Cómo agregar un juego o aplicación al DigiHub](docs/howto/add-a-game.md)
- [Cómo registrar e iniciar sesión de usuarios](docs/howto/authentication.md)
- [Cómo jugar o pintar en una sala compartida](docs/howto/play-in-room.md)
- [Referencia: API HTTP](docs/reference/http-api.md)
- [Referencia: eventos de Socket.IO](docs/reference/websocket-events.md)
- [Explicación: arquitectura del hub](docs/explanation/architecture.md)
- [Explicación: seguridad de la autenticación](docs/explanation/security.md)
- [Explicación: estado de los juegos y salas](docs/explanation/game-state.md)

## Scripts

| Comando | Descripción |
|-|-|
| `npm run dev` | servidor de desarrollo con recarga (tsx) |
| `npm run build` | compila el backend a `dist/` (tsc) |
| `npm start` | ejecuta `dist/` |
| `npx tsc --noEmit` | chequeo de tipos sin generar salida |

# Explicación: arquitectura del hub

DigiHub es un servidor único que combina HTTP (Express) y tiempo real (Socket.IO)
sobre el mismo servidor Node. La decisión de diseño central es la **convención
sobre configuración**: tanto el menú de aplicaciones como los handlers de sockets
se descubren automáticamente, sin registros manuales.

## Arranque

```text
src/index.ts
  ├── dotenv.config()          # lee .env
  ├── new Database()           # conecta mongoose (singleton)
  └── App()                    # src/app.ts
        ├── express()          # JSON body parser, router /api/, estáticos
        ├── createServer(app)  # servidor HTTP único
        ├── new WebSocket(server)  # Socket.IO sobre el mismo servidor
        └── server.listen(PORT)
```

`Database` y `WebSocket` guardan su instancia en estáticos de clase: el resto del
código no necesita inyectar conexiones.

## Registro automático de handlers

`src/app.ts` importa el barrel `src/sockets/index.ts`, toma **todas las funciones
exportadas** y las ejecuta como handlers en cada conexión:

```ts
const socketHandlers = Object.values(Handlers).filter(h => typeof h === "function");
ws.connect((socket) => socketHandlers.map(handler => handler(WebSocket.ws, socket)));
```

Consecuencia: agregar un juego nuevo es sólo agregar un archivo y exportarlo
desde el barrel. Riesgo conocido: cualquier función exportada desde ese barrel
se ejecuta por cada conexión, por eso los helpers no se exportan ahí.

## Capas del backend

```text
routes/        # definen URLs y métodos (main.router, auth.router)
controllers/   # traden HTTP ↔ servicio (status codes, mensajes)
services/      # lógica de negocio (games.service, auth.service)
models/        # esquemas de mongoose (user.model)
games/         # lógica de dominio pura de los juegos (sin dependencias web)
sockets/       # handlers de Socket.IO: orquestan salas y llaman a games/
definitions/   # tipos compartidos entre backend y frontends
```

El patrón dominante: los handlers de socket **no implementan reglas de juego**;
instancian clases de `src/games/` (por ejemplo `PokerGame`, `BlackjackGame`) y se
limitan a gestionar salas, permisos y difusión de estado.

## Juegos de cartas

`src/games/cards.ts` define las primitivas (`Card`, `Deck`, `Player`) más un
constructor genérico `buildDeck`. Cada juego hereda y especializa:

- `poker.ts`: `PokerCard/PokerDeck/PokerPlayer/PokerGame` — fases
  (waiting → preflop → flop → turn → river → showdown), bote, acciones.
- `blackjack.ts`: `BlackjackCard/BlackjackDeck/BlackjackPlayer/BlackjackGame` —
  valor de ases, estado `playing/stood/busted/blackjack`, turno del dealer.
- `solitaire.ts`: `SolitaireCard/SolitaireDeck/SolitairePlayer/SolitaireGame` —
  tabla de 7 columnas, fundamentos por palo, pila de descarte y stock.

La serialización por vistas se resuelve en `toJSON()` de cada juego: oculta las
cartas que el observador no debe ver y marca al jugador actual.

## Frontends

`public/` se sirve estático, sin build. Cada juego es autónomo en su carpeta
(`index.html` + `css/` + `js/`), y los juegos de cartas comparten
`public/cards/` (estilos y utilidades de render). Paintit organiza su código en
módulos ES bajo `Components/` (Canvas, Shapes, Controls, Network) que se cargan
como módulos desde `index.js`.

## Persistencia

Hoy la única persistencia real es el usuario (MongoDB). El estado de las salas
vive en memoria del proceso (ver [Estado de los juegos](game-state.md)).

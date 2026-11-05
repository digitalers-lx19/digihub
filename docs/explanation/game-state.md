# Explicación: estado de los juegos y salas

## Todo vive en memoria

Cada handler de socket mantiene un `Map<string, ...>` a nivel de módulo:

```ts
const rooms = new Map<string, PokerGame>();   // poker.handler.ts
const rooms = new Map<string, BlackjackGame>();
const rooms = new Map<string, Entry>();       // solitaire: { game, owner }
```

La clave es el código de sala; el valor es la instancia del juego con sus
jugadores, fase y cartas. Esto tiene tres implicaciones:

1. **Las salas se pierden al reiniciar el servidor.** No hay persistencia de
   partidas: sólo el usuario es datos durables (MongoDB).
2. **No escala horizontalmente.** Dos instancias del hub no comparten salas:
   dos usuarios en instancias distintas no se ven entre sí. Para escalar haría
   falta externalizar el estado (Redis, base de datos) o sticky sessions con
   adaptador de Socket.IO (`@socket.io/redis-adapter`).
3. **El estado es autoritativo del servidor.** El frontend nunca calcula reglas:
   envía intenciones (`poker:action`, `blackjack:hit`, `tictactoe:move`) y el
   servidor valida turno, pertenencia y legalidad antes de difundir.

## Difusión por sala

Socket.IO identifica la suscripción con `socket.join(room)`. Dos formas de emitir:

- `ws.to(room).emit(...)`: todos los miembros, incluido el emisor.
- `socket.to(room).emit(...)`: todos **excepto** el emisor (así funciona paintit:
  el trazo local se pinta sin esperar al servidor y la copia remota llega por el
  rebote).

## Vistas por usuario

Los juegos de cartas serializan distinto según quién mire: `game.toJSON(viewerId, room)`
oculta las cartas ajenas (`hidden: true`) y marca al propio jugador. Por eso el
estado difundido es seguro para cualquier destinatario de la sala: nunca viaja
información que un jugador no deba ver.

## Ciclo de vida

- **Crear**: la mayoría de los juegos crea la sala perezosamente en el primer
  `join` (paintit sólo une; tictactoe exige `create`).
- **Observar**: cuando se llena el cupo, el nuevo ingreso entra como observador
  y sigue recibiendo `update`s.
- **Salida**: en `disconnecting` cada handler retira al jugador, avisa a la sala
  y borra la sala si queda vacía, para no filtrar memoria.
- **Reconexión**: poker y blackjack responden a `<juego>:state` con el estado
  actual; es el evento que usa un cliente que perdió la conexión y quiere
  restaurar la vista sin volver a unirse.

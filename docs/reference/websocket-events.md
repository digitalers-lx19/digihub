# Referencia: eventos de Socket.IO

Todos los sockets se conectan al mismo `Server` y cada handler registra sus
eventos con prefijo `<juego>:` (salvo la mensajería base). Los payloads citados
son los que esperan los handlers de `src/sockets/`.

## Mensajería (`msg.handler.ts`)

| Evento | Dirección | Payload | Notas |
|-|-|-|-|
| `join` | cliente → servidor | `room: string` | une al socket a la sala |
| `leave` | cliente → servidor | `room: string` | lo separa |
| `message:public` | ambos | `{ room, ... }` | reenvía a toda la sala |
| `message:private` | ambos | `{ to, ... }` | reenvía sólo al socket destino |

## Tic-tac-toe (`tictactoe.handler.ts`)

| Evento | Dirección | Payload | Notas |
|-|-|-|-|
| `tictactoe:create` | cliente → servidor | `{ room }` | crea sala y une |
| `tictactoe:created` | servidor → cliente | `{ room }` | confirmación |
| `tictactoe:join` | cliente → servidor | `{ room }` | jugador u observador |
| `tictactoe:joined` | servidor → cliente | `{ room, role, ... }` | |
| `tictactoe:move` | cliente → servidor | `{ room, index }` | valida turno y casilla vacía |
| `tictactoe:room:update` | servidor → sala | estado completo (tablero, jugadores, ganador) | |
| `tictactoe:restart` | cliente → servidor | `{ room }` | |

## Paintit (`paintit.handler.ts`)

| Evento | Dirección | Payload | Notas |
|-|-|-|-|
| `paintit:join` | cliente → servidor | `{ room }` | sala desde `?room=` (default `paintit`) |
| `paintit:draw` | cliente → sala | `{ room, phase, shape, sides, lineWidth, strokeStyle, fillStyle, coords }` | `phase`: `start` \| `move` \| `end`; el servidor reenvía a los demás miembros de la sala y descarta payloads sin `coords` o de salas no suscritas |

## Poker (`poker.handler.ts`, lógica en `src/games/poker.ts`)

| Evento | Dirección | Payload | Notas |
|-|-|-|-|
| `poker:join` | cliente → servidor | `{ room, name }` | |
| `poker:joined` | servidor → cliente | `{ room, id }` | |
| `poker:start` | cliente → servidor | `{ room }` | reparte y abre preflop |
| `poker:action` | cliente → servidor | `{ room, action, amount }` | `action`: `fold` \| `check` \| `call` \| `raise` |
| `poker:state` | cliente → servidor | `{ room }` | pide el estado actual |
| `poker:update` | servidor → sala | `{ room, phase, pot, community, players, turn, winners }` | las cartas ajenas llegan ocultas |
| `poker:error` | servidor → cliente | `{ message }` | |

## Blackjack (`blackjack.handler.ts`, lógica en `src/games/blackjack.ts`)

| Evento | Dirección | Payload | Notas |
|-|-|-|-|
| `blackjack:join` | cliente → servidor | `{ room, name }` | |
| `blackjack:joined` | servidor → cliente | `{ room, id }` | |
| `blackjack:start` | cliente → servidor | `{ room }` | |
| `blackjack:hit` | cliente → servidor | `{ room }` | pide carta |
| `blackjack:stand` | cliente → servidor | `{ room }` | se planta |
| `blackjack:state` | cliente → servidor | `{ room }` | estado puntual para reconexión |
| `blackjack:update` | servidor → sala | `{ room, players, dealer, turn, ... }` | el hoyo del dealer llega oculto salvo al mostrar |
| `blackjack:error` | servidor → cliente | `{ message }` | |

## Solitario (`solitaire.handler.ts`, lógica en `src/games/solitaire.ts`)

| Evento | Dirección | Payload | Notas |
|-|-|-|-|
| `solitaire:start` | cliente → servidor | `{ room, name }` | crea la partida y asigna propietario |
| `solitaire:joined` | servidor → cliente | `{ room, id }` | |
| `solitaire:draw` | cliente → servidor | `{ room }` | roba del stock |
| `solitaire:move` | cliente → servidor | `{ room, from, to, cardId }` | `from`/`to`: `{ type: "tableau" \| "foundation" \| "waste", index? }`; sólo el propietario puede mover |
| `solitaire:update` | servidor → sala | `{ room, tableau, foundations, waste, stock, score, moves, won }` | |
| `solitaire:error` | servidor → cliente | `{ message }` | |

## Convenciones

- Prefijo obligatorio por juego: todos los handlers comparten el mismo `Server`.
- El estado se difunde completo con `ws.to(room).emit("<juego>:update", ...)`;
  las vistas por usuario se generan en `toJSON()` de cada juego (cartas ocultas,
  marcaje de "tú").
- En `disconnecting` cada handler retira al jugador de sus salas, notifica y
  borra la sala si queda vacía.

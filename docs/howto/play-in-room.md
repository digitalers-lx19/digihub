# Cómo jugar o pintar en una sala compartida

Todos los juegos multijugador del hub comparten el mismo concepto de **sala**:
un código que identifica un `room` de Socket.IO. Los usuarios que entran con el
mismo código comparten estado; los que usan códigos distintos no se ven entre sí.

## 1. Entrar a una sala

- En **paintit**, la sala se toma del parámetro `?room=` de la URL; si no está,
  se usa `paintit` como sala por defecto:
  `http://localhost:3000/games/paintit/?room=equipo1`
- En **tictactoe, poker, blackjack y solitario**, hay un campo "Código de sala"
  en el lobby; escribí el mismo valor en todas las pestañas o navegadores.

Cada cliente que se une envía su `<juego>:join` (o `join` en mensajería) y el
servidor hace `socket.join(room)`. A partir de ahí, la difusión se hace con
`ws.to(room).emit(...)` o `socket.to(room).emit(...)`.

## 2. Pintar en colaboración (paintit)

1. Dos navegadores abiertos con `?room=trabajo`.
2. Al seleccionar una figura y arrastrar sobre el lienzo, el cliente emite
   `paintit:draw` con la figura, estilos y coordenadas en tres fases:
   `start`, `move` y `end`.
3. El servidor reenvía el evento al resto de la sala; cada usuario ve la figura
   dibujándose en vivo (una vista previa se dibuja en el canvas `preview` y al
   soltar se consolida en el canvas principal).
4. Sólo se sincroniza lo que pasa por el servidor: el propio trazado local se
   pinta directamente en el canvas propio.

## 3. Unirse como observador

En tictactoe, cuando la sala ya tiene dos jugadores, el nuevo ingreso recibe el
rol `observer` y ve las jugadas sin poder mover.

## 4. Reconexión y estado

Los juegos de cartas responden al evento `<juego>:state` (poker y blackjack):
reenvía el estado actual de la sala al socket que lo pide. Si tu conexión se
cortó y sigue en la sala, pedí el estado para volver a pintarlo.

## 5. Salir

Al cerrar la pestaña, el servidor recibe `disconnecting`, retira al jugador de
las salas, notifica al resto y elimina la sala si queda vacía. El estado es
volatile: un reinicio del servidor borra todas las salas (ver
[Estado de los juegos](../explanation/game-state.md)).

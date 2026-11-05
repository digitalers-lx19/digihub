// la conexion debe devolver codigo 200
// la pagina principal debe devolver el menu de aplicacion en formato de array de objetos
// las aplicaciones deben ubicarse dentro de public/app/
// al conectarse al servidor se debe obtener un socket.id
// al conectarse a una sala de juego o aplicacion debe obtenerse un codigo
// el usuario puede unirse a una partida y obtener la cantidad de jugadores 
// solamente se puede unir si la cantidad de jugadores no supera el limite
// si la partida esta llena, no debe poder unirse
// cada aplicacion debe identificar la cantidad de jugadores
// solamente utilizaran numero de sala las aplicaciones de 2 o mas jugadores
// un usuario puede unirse como observador a cualquier partida
// al cerrarse la sesion o ventana, se debe notificar la desconexion en la sala
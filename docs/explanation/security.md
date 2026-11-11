# Explicación: seguridad de la autenticación

## Almacenamiento de contraseñas

`src/services/auth.service.ts` nunca guarda la contraseña en texto plano. El
formato almacenado es `salt:hash`:

1. Se genera un salt aleatorio de 16 bytes (`randomBytes`).
2. Se deriva la clave con **scrypt** (Node `node:crypto`, 64 bytes), una función
   de derivación lenta y con memoria, resistente a ataques offline.
3. Se guarda `salt:hash` en el campo `password` del usuario.

La verificación (`verifyPassword`) vuelve a derivar con el salt guardado y
compara con **`timingSafeEqual`**, que evita filtrar por tiempos de comparación
cuántos coincidieron (mitiga ataques de temporización).

## Validaciones y filtrado de información

- El email se normaliza (`trim` + minúsculas) y es único por índice de mongoose,
  así la concurrencia no crea duplicados.
- Login responde `401 Credenciales incorrectas` tanto si el usuario no existe
  como si la contraseña falla: no revela qué correos están registrados.
- Las respuestas nunca incluyen el campo `password`: `sanitize()` arma el objeto
  de salida con `id`, `name`, `email` y `createdAt` únicamente.
- Los errores del controlador se tradujeron a códigos explícitos; cualquier
  error inesperado devuelven `500` con mensaje genérico y se registran en el
  servidor.

## Límites conocidos (a tener en cuenta al evaluar el proyecto)

- No hay sesiones, cookies ni tokens: `login` confirma credenciales pero el
  servidor no mantiene al usuario autenticado después. Las rutas actuales no
  requieren autorización.
- No hay rate limiting ni bloqueo tras intentos fallidos.
- `cors()` se aplica después de las rutas en `src/app.ts`, por lo que no cubre
  las respuestas preflight de `/api/`; conviene moverlo antes del router si se
  consumirá desde otros orígenes.

Estos puntos quedan deliberadamente fuera del alcance del ejercicio, pero son
los siguientes pasos naturales si el proyecto evoluciona.

# Cómo registrar e iniciar sesión de usuarios

El hub expone autenticación por usuario y contraseña contra MongoDB. No hay
sesiones ni tokens: los endpoints devuelven los datos públicos del usuario y
cada aplicación decide qué hacer con esa información.

## 1. Registrar un usuario

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Ada Lovelace","email":"ada@example.com","password":"calcul0"}'
```

Reglas de validación (todas devuelven `400` con un mensaje):

- `name`: mínimo 2 caracteres.
- `email`: formato válido; se guarda en minúsculas y sin espacios.
- `password`: mínimo 6 caracteres.

Éxito → `201`:

```json
{ "user": { "id": "…", "name": "Ada Lovelace", "email": "ada@example.com", "createdAt": "…" } }
```

El correo duplicado devuelve `409` con `{ "message": "El correo ya está registrado" }`.

## 2. Iniciar sesión

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ada@example.com","password":"calcul0"}'
```

- Credenciales correctas → `200` con el mismo objeto `user` (sin contraseña).
- Credenciales incorrectas o usuario inexistente → `401` con
  `{ "message": "Credenciales incorrectas" }` (mismo mensaje en ambos casos para
  no revelar si el correo existe).

## 3. Desde el navegador (fetch)

```js
const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
});
const { user, message } = await res.json();
if (!res.ok) throw new Error(message);
```

## 4. Dónde se valida todo

La lógica vive en `src/services/auth.service.ts` (hash, verificación y reglas) y
el controlador `src/controllers/auth.controller.ts` traduce los errores
`AuthError` a su código HTTP. El hash usa `scrypt` con salt aleatorio por
contraseña; nunca se guarda la contraseña en texto plano. Ver
[Seguridad de la autenticación](../explanation/security.md).

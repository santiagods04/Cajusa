# Triple Ten web_project_api_full
# Around The U.S. — Backend (Sprint 19)

Backend desarrollado con **Node.js + Express** y persistencia en **MongoDB (Mongoose)**. Implementa autenticación con **JWT**, validación de datos, permisos por recurso y manejo centralizado de errores.

## Qué se hizo en el backend (a nivel de código y funcionalidad)

- **Modelo de usuario y seguridad de contraseñas**
  - Modelo `User` con validaciones básicas (por ejemplo: `email` único y requerido).
  - Hash de contraseñas con **bcrypt** antes de guardar en la base de datos.
  - Lógica de autenticación encapsulada en un método estático tipo `findUserByCredentials` para reutilizar y mantener el controlador limpio.
  - Mensajes de error de login genéricos para no revelar si falló el email o la contraseña.

- **Autenticación con JWT**
  - Endpoint de **login** que genera un JWT con el `_id` del usuario en el payload.
  - Middleware `auth` que:
    - Lee el header `Authorization: Bearer <token>`
    - Verifica el token
    - Expone `req.user` con el payload para controlar acceso a rutas protegidas.
  - Separación clara de rutas públicas (`/signin`, `/signup`) y rutas protegidas (users/cards).

- **Rutas de usuarios**
  - Endpoint para obtener el usuario actual: `GET /users/me` usando `req.user._id`.
  - Endpoints para obtener usuarios y actualizar información del perfil/avatar (según estructura del proyecto).
  - Orden correcto de rutas para evitar colisiones (por ejemplo, declarar `/me` antes de `/:userId`).

- **Rutas de cards (CRUD + permisos)**
  - `GET /cards`: lista de cards.
  - `POST /cards`: crea una card asociando `owner = req.user._id`.
  - `DELETE /cards/:cardId`: eliminación con verificación de **ownership**:
    - Solo el dueño puede borrar; si no, responde **403**.
  - Likes:
    - `PUT /cards/:cardId/likes` con `$addToSet` para evitar duplicados.
    - `DELETE /cards/:cardId/likes` con `$pull`.

- **Validación de datos (Celebrate/Joi)**
  - Validación de `body/params` en rutas críticas (por ejemplo IDs, payloads de creación/actualización).
  - Middleware `errors()` de Celebrate integrado para responder 400 en errores de validación.

- **Manejo centralizado de errores**
  - Clases de error personalizadas (ej: `NotFound`, `Forbidden`, `BadRequest`, etc.) con `statusCode`.
  - Middleware final de errores que:
    - Envia el `statusCode` correspondiente cuando el error es conocido.
    - En errores no controlados responde **500** con mensaje genérico.
  - Middleware 404 para rutas inexistentes.

## Usuarios de prueba

### USER MAIN
- Email: `sprint19@test.com`
- Password: `sprint19@test.com`

### USER 2
- Email: `sprint19alter@test.com`
- Password: `sprint19alter@test.com`

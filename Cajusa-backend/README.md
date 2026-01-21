# Cajusa Backend (API)

Backend de **Cajusa**: API REST para autenticación, usuarios, productos y gestión de catálogo. Construido con **Node.js + Express + MongoDB (Mongoose)** y preparado para despliegue en servidor (PM2 + NGINX).

---

## Tecnologías
- Node.js + Express
- MongoDB + Mongoose
- JWT (autenticación)
- CORS (orígenes configurables)
- Validación y manejo de errores (middlewares)
- PM2 (proceso en producción)

---

## Funcionalidades principales
- **Auth**: registro e inicio de sesión con JWT.
- **Usuarios**: creación y consulta de perfil.
- **Productos**: CRUD (creación restringida a rol **admin**).
- **Seguridad**:
  - Validación de datos en el servidor.
  - Manejo centralizado de errores.
  - Variables de entorno para secretos y conexión a base de datos.
- **Script de administración**:
  - `scripts/seedAdmin.js` permite crear/promover un usuario a **admin** bajo condiciones controladas.

---

## Requisitos
- Node.js (recomendado 18+)
- MongoDB (local o remoto)
- npm

---

## Variables de entorno (`.env`)
Crea un archivo `.env` en la raíz de `Cajusa-backend/` (no se sube al repo):

```env
PORT=3000
MONGO_URI=mongodb://127.0.0.1:27017/cajusa
JWT_SECRET=tu_secreto_seguro
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173


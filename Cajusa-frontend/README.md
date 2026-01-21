# Cajusa Frontend (Web)

Frontend de **Cajusa**: aplicación web para navegar el catálogo, filtrar productos y gestionar acceso (login/registro). Construida con **React + Vite** y conectada a la API desplegada.

---

## Tecnologías
- React
- Vite
- JavaScript
- CSS (estilos del proyecto)
- Fetch API para consumo del backend

---

## Funcionalidades
- **Home** con sección de destacados.
- **Catálogo** con búsqueda y filtros (línea/categoría/subcategoría/talla/color).
- **Autenticación**:
  - Registro e inicio de sesión contra la API.
  - Persistencia de sesión (token en navegador, según implementación del proyecto).
- **Panel/Admin (según rol)** para gestionar productos (cuando aplica).

---

## Requisitos
- Node.js (recomendado 18+)
- npm

---

## Variables de entorno
Crea un archivo `.env` en la raíz de `Cajusa-frontend/`:

```env
VITE_API_URL=https://api.tu-dominio.com

# Cajusa

Monorepo del proyecto **Cajusa** (Frontend + Backend) administrado con **npm workspaces**.

## Requisitos
- **Node.js ≥ 18** y **npm ≥ 10**
- **MongoDB** local o Atlas
- Archivos de entorno por app (`.env`) basados en los `*.env.example`

## Estructura
Cajusa/
├─ Cajusa-frontend/ # React + Vite
└─ Cajusa-backend/ # Node.js + Express + MongoDB

## Instalación y ejecución

Desde la raíz del monorepo:

# Instalar todas las dependencias (workspaces)
npm install

# Levantar ambos servicios (backend + frontend)
npm run dev

## Scripts disponibles

En la raíz:

npm run dev         # back + front (concurrently)
npm run dev:back    # solo backend
npm run dev:front   # solo frontend
npm run build       # build en todos los paquetes
npm run build:back  # build backend (placeholder)
npm run build:front # build frontend
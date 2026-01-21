# Cajusa (Monorepo) — Full Stack E-commerce

Cajusa es una aplicación web full stack para catálogo de productos y gestión de usuarios/roles (cliente y administrador).  
Repositorio monorepo con **frontend** (React/Vite) y **backend** (Node/Express/MongoDB).

## 🌐 Demo (Producción)
- Sitio: https://cajusa.com.co  
- API: https://api.cajusa.com.co

## 🧱 Estructura del repositorio

/
├─ Cajusa-frontend/ # React + Vite
└─ Cajusa-backend/ # Node + Express + MongoDB

## 📌 Tecnologías
- **Frontend:** React, Vite, JavaScript, CSS
- **Backend:** Node.js, Express, MongoDB (Mongoose)
- **Auth:** JWT
- **Deploy:** NGINX + PM2 + HTTPS (Certbot/Let’s Encrypt)

## 🚀 Cómo correr en local (resumen)
### Backend
```bash
cd Cajusa-backend
npm install
npm run dev


# Expenses App – Prueba Técnica - Desarrollador Full Stack

Aplicación web para la gestión de gastos personales, que permite crear, listar, editar, eliminar y filtrar gastos mediante una interfaz moderna y responsiva, consumiendo una API REST.

El proyecto está dividido en frontend (Nuxt 3) y backend (Node.js + API REST).

## Funcionalidades principales

- Listado de gastos en tabla responsiva
- Creación de gastos mediante modal
- Edición de gastos
- Eliminación de gastos con confirmación
- Paginación
- Búsqueda de gastos
- Filtro por categoría
- Notificaciones de éxito y error (toast)

## Links del Deploy
- Frontend: [Live app link](https://gastos-app-ew4w.vercel.app)
- Backend:  [Railway Project Dashboard](https://railway.com/project/afb9476f-f3db-4f64-9639-421ec90c80e8/service/ee4cd9a5-e1e8-4006-a830-0ecf0b3cb758?environmentId=b57de684-8ee1-4c43-987c-1e731f13b735)
- DB: [Neon DB](https://console.neon.tech/app/projects/small-scene-65008691)

## Tecnologías utilizadas

### Frontend
- Nuxt 3
- Vue 3 (Composition API)
- TypeScript
- Nuxt UI
- Tailwind CSS
- vue-toast-notification (mensajes de éxito/error)
- Fetch API (`$fetch`)

### Backend
- Node.js
- Nestjs
- API REST
- Base de datos relacional
- ORM (según implementación del backend)
- Migraciones y seeds para datos iniciales

## Instalación local

### Requisitos previos
- Node.js v18 o superior
- npm o yarn
- Base de datos configurada (local o remota)

### Backend

```bash
cd backend/api-expenses
npm install
npm run start:dev
```

### Frontend

```bash
cd frontend/frontend-expenses
npm install
npm run dev
```

# Sistema de Turnos Médicos — Frontend

Interfaz web del sistema de gestión de turnos médicos. Desarrollada con React + Vite.

## Requisitos previos

- [Node.js](https://nodejs.org/) v18 o superior
- El backend Spring Boot corriendo en `http://localhost:8090`

## Instalación

1. Clonar el repositorio:

```bash
git clone https://github.com/gabiamer/sistema-turnos-front.git
cd sistema-turnos-front
```

2. Instalar dependencias:

```bash
npm install
```

3. Iniciar el servidor de desarrollo:

```bash
npm run dev
```

La aplicación queda disponible en `http://localhost:5173`.

> Las llamadas a `/api` se redirigen automáticamente al backend mediante el proxy de Vite. No hace falta crear un archivo `.env`.

## Scripts disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Inicia el servidor de desarrollo con hot-reload |
| `npm run build` | Genera la build de producción en `/dist` |
| `npm run preview` | Sirve la build de producción localmente |
| `npm run lint` | Ejecuta ESLint |

## Stack

- React 18
- React Router v6
- Axios
- Zustand
- Vite

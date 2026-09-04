# Docker Deployment Guide (OpenRubberDocks)

This guide explains how to use Docker and Docker Compose to run the project in different scenarios: development (isolating parts of the stack) and production (deploying the entire stack).

## 🛠️ Docker Structure in the Project

Currently, the project relies on the following core configuration for Docker:
- `backend/Dockerfile`: Defines how to package and run the Node.js API using `pnpm`.
- `docker-compose.yml` (root): Orchestrates the connection between services (currently PostgreSQL Database and Backend).

---

## 💻 1. Development Environment (Partial Deployments)

During development, it's very common to want to run a part of the code directly on your host machine (e.g., the frontend with live reloading) and let Docker handle the rest of the dependencies (Database and Backend).

### Scenario A: Developing the Frontend (Dockerize Backend + DB only)
If you are purely working on UI/UX in the `frontend/` folder and don't want to deal with installing PostgreSQL or manually starting NestJS:

1. Make sure your `.env` file is configured in the `backend/.env` directory (Especially `DB_SYNCHRONIZE=true`).
2. Go to the project root and start the backend and database:
   ```bash
   docker compose up -d
   ```
3. Now you can go to your terminal, enter the frontend folder, and run your usual development server:
   ```bash
   cd frontend
   npm run dev
   ```
   *(The frontend will be able to make requests to `http://localhost:3000` seamlessly, and the backend will be backed by the DB running in Docker).*

### Scenario B: Developing the Backend (Dockerize DB only)
If you are writing backend code and need fast hot-reloading using `npm run start:dev`, it's best to have **only** the database in Docker:

1. Start only the PostgreSQL service using the service name defined in the compose file:
   ```bash
   docker compose up -d db
   ```
2. The database will be exposed on port `5432` of your `localhost`.
3. Start your backend locally:
   ```bash
   cd backend
   pnpm run start:dev
   ```

---

## 🚀 2. Production Environment (Full Deployment)

For a production or staging environment, the goal is to spin up the **entire** ecosystem (Frontend, Backend, and Database) without relying on the host operating system.

> **Note:** For this to work, it assumes you have created a `Dockerfile` in the `frontend/` folder (usually based on Nginx to serve compiled static files or Node.js if using SSR with Next/Nuxt) and added it as a service in your `docker-compose.yml`.

### Steps for a full deployment:

1. **Prepare production environment variables**:
   Make sure to change `NODE_ENV=production` and `DB_SYNCHRONIZE=false` in your environment variables to prevent TypeORM from accidentally dropping/modifying tables. The DB structure should be managed via [Migrations](./commands.md#migrations).

2. **Start all services**:
   From the root of the project:
   ```bash
   # Build images from scratch (ideal for production)
   docker compose build

   # Start services in the background
   docker compose up -d
   ```

3. **Check status**:
   ```bash
   docker compose ps
   ```

---

## 🛑 Useful Maintenance Commands

- **Stop services (without deleting data)**:
  ```bash
  docker compose stop
  ```
- **Stop and remove containers (preserves data volumes)**:
  ```bash
  docker compose down
  ```
- **Stop, remove containers, and destroy the Database (Volumes)**:
  ```bash
  # Warning! This permanently deletes PostgreSQL data
  docker compose down -v
  ```
- **View logs for a specific service (e.g., backend)**:
  ```bash
  docker compose logs -f backend
  ```
- **Rebuild the backend image if you installed new dependencies (`npm install`)**:
  ```bash
  docker compose up -d --build backend
  ```

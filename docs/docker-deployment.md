# Docker Deployment & Firewall Security Guide (OpenRubberDocks)

This guide explains how to use Docker and Docker Compose to run the project safely across development (hybrid workflows) and production (full stack), while protecting your host firewall (`iptables` / `ufw`) and preventing accidental database exposure.

## 🛠️ Docker Structure in the Project

- [`backend/Dockerfile`](../backend/Dockerfile): Multi-stage `node:20-alpine` image using `pnpm` that compiles NestJS, prunes devDependencies, runs as non-root `node` user, and automatically executes pending TypeORM migrations when `DB_SYNCHRONIZE=false`.
- [`frontend/Dockerfile`](../frontend/Dockerfile): Multi-stage build (`node:20-alpine` + `nginx:1.27-alpine`) that compiles the React 19 / Vite bundle (including custom git-ignored `colors.ts` palettes) and serves it with SPA routing support.
- [`docker-compose.yml`](../docker-compose.yml): Orchestrates `db` (PostgreSQL 15), `backend` (NestJS API), and `frontend` (Nginx SPA under the `full` / `production` profile) over an isolated bridge network (`openrubberdocks-net`) with `no-new-privileges:true`.

---

## 🔒 Firewall (`iptables` / `ufw`) & Database Security

By default, publishing ports in Docker using `"5432:5432"` binds to `0.0.0.0`, which causes Docker to insert DNAT rules into the `DOCKER` chain in `iptables` **before** host firewalls like `ufw` or `firewalld` (`INPUT` chain) are evaluated. On a VPS, this would expose PostgreSQL directly to the public internet.

To prevent this, `docker-compose.yml` enforces two strict rules:

1. **PostgreSQL (`db`) is ALWAYS locked to loopback (`127.0.0.1`)**:
   ```yaml
   ports:
     - "127.0.0.1:${DB_PORT:-5432}:5432"
   ```
   External network interfaces cannot reach `127.0.0.1`, so the database is **never exposed to the internet**, while remaining accessible to local host tools (`pnpm run start:dev`, `pnpm run seed:run`) and containers inside `openrubberdocks-net`.
2. **Configurable `HOST_BIND_IP` (`127.0.0.1` by default) for Backend & Frontend**:
   - **`HOST_BIND_IP=127.0.0.1` (Default / Recommended)**: Binds Backend (`3000`) and Frontend (`5173`) strictly to localhost. Ideal for local development or VPS deployments behind a reverse proxy (Nginx, Caddy, Traefik, Cloudflare Tunnel) without bypassing `ufw`/`iptables`.
   - **`HOST_BIND_IP=0.0.0.0` (Optional)**: Only set this in your root `.env` (or via `./install.sh`) if you explicitly want Docker to expose Backend/Frontend ports directly on all network interfaces without a reverse proxy.

---

## 💻 1. Development Environment (Partial / Hybrid Deployments)

During development, you can run parts of the stack directly on your host machine for instant hot-reloading while Docker manages the database (and optionally the backend).

### Scenario A: Developing the Frontend (Dockerize Backend + DB)
1. Run `./install.sh` (or configure `backend/.env` and `.env`).
2. Start the backend and database from the project root:
   ```bash
   docker compose up -d
   ```
3. Run the frontend dev server locally:
   ```bash
   cd frontend
   pnpm run dev
   ```

### Scenario B: Developing the Backend (Dockerize DB only)
1. Start only the PostgreSQL service:
   ```bash
   docker compose up -d db
   ```
   *(Accessible locally at `127.0.0.1:5432`, completely isolated from external networks).*
2. Start your backend locally:
   ```bash
   cd backend
   pnpm run start:dev
   ```

---

## 🚀 2. Production Environment (Full Containerized Deployment)

For production or staging environments, use the `full` (or `production`) Compose profile to deploy **Database + Backend + Frontend (Nginx)**:

1. **Provision production environment**:
   Run `./install.sh` and select **Production Mode** (`NODE_ENV=production`, `DB_SYNCHRONIZE=false`).
2. **Build and launch all services**:
   ```bash
   docker compose --profile full up -d --build
   ```
3. **Seed initial RBAC permissions and Core Admin (first run)**:
   ```bash
   docker compose exec backend pnpm run seed:run
   ```

---

## 🔄 3. One-Command Automated Update from `main`

To pull the latest changes from `main`, preserve your `.env` and `colors.ts` customizations, install dependencies, compile, and run database migrations + seeders automatically:

```bash
./install.sh --update
# or directly with Node:
node install.mjs --update
```

---

## 🛑 Useful Maintenance Commands

- **Check container status**:
  ```bash
  docker compose ps
  ```
- **Stop services (without deleting data)**:
  ```bash
  docker compose stop
  ```
- **Stop and remove containers (preserves data volumes)**:
  ```bash
  docker compose down
  ```
- **Stop, remove containers, and destroy the Database volume**:
  ```bash
  # Warning! Permanently deletes PostgreSQL data
  docker compose down -v
  ```
- **View logs for a specific service**:
  ```bash
  docker compose logs -f backend
  ```

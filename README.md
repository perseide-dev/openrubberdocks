# OpenRubberDocks

A modern, scalable multi-tenant platform built with **NestJS**, **TypeORM**, **PostgreSQL**, **React 19**, and a **Contemporary Digital Brutalist** design system.

---

## ⚡ Quick Start: Interactive Installation Wizard (TUI)

The platform includes a cross-platform (Linux / Windows / macOS / VPS) interactive terminal installation wizard that automates environment setup, port configuration, security tokens, Core Administrator provisioning, brutalist theme customization, and database seeding.

### Run on Linux / VPS:
```bash
./install.sh
# or directly via Node.js
node install.mjs
```

### Run on Windows:
```cmd
install.bat
:: or in PowerShell
node install.mjs
```

### What the installer handles:
1. **Prerequisite & Environment Checks**: Detects Node, pnpm/npm, Docker, and Compose versions.
2. **Network & Startup Parametrization**: Configures API ports, frontend ports, and public URLs.
3. **Cryptographic JWT Secrets**: Auto-generates 256-bit high-entropy keys.
4. **Core Administrator Provisioning**: Customizes username, handle, and password for the initial `coreAdmin` user.
5. **Theme Customization**: Lets you pick or customize the contemporary brutalist color palette (writes to git-ignored `frontend/src/core/theme/colors.ts`).
6. **Automated Database & Seeders**: Optionally spins up PostgreSQL via Docker Compose and executes all migrations and RBAC seeders.

---

## 📚 Project Documentation

- **[Permissions & Scoped RBAC Guide](docs/permissions-system-guide.md)**: Engine-level authorization, UserTypes (`coreAdmin`, `internal`, `external`), NestJS guards, and frontend `<Can />` components.
- **[Frontend API Consumption Guide](frontend/docs/api-consumption.md)**: Clean Architecture / DDD data flow (`Repositories -> Services -> Hooks -> Components`) and zero-inline-declaration rules.
- **[Digital Brutalist Theme Guide](frontend/docs/theme-guide.md)**: Flat wireframe aesthetic rules, layout-only component styling, and dynamic `colors.ts` overrides.
- **[Docker Deployment Guide](docs/docker-deployment.md)**: Production containerization and hybrid development workflows.
- **[Authentication Consumption Guide](docs/auth-consumption-guide.md)**: HttpOnly cookies and silent JWT rotation setup.

---

## 🛠️ Manual Startup (Without Wizard)

If you prefer to start manually:

```bash
# 1. Start Database
docker compose up -d db

# 2. Setup & Run Backend
cd backend
pnpm install
pnpm run seed:run
pnpm run start:dev

# 3. Setup & Run Frontend
cd ../frontend
pnpm install
pnpm run dev
```

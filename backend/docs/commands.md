# OpenRubberDocks - Project Commands (Scripts)

This document details all the available commands in the backend's `package.json`. These scripts are configured to facilitate development, testing, database management (migrations and seeders), and deployment.

To execute them, make sure to use the project's package manager (`npm` or `pnpm`). Examples: `pnpm run <command>` or `npm run <command>`.

## 🚀 Initialization and Development

| Command | Description |
| :--- | :--- |
| `start` | Starts the application (using `nest start`). |
| `start:dev` | Starts the application in development mode with auto-reload on file changes (`--watch`). |
| `start:debug` | Starts the application in development mode and allows attaching a debugger to the process. |
| `start:prod` | Runs the application from the compiled files in `dist/main.js`. |
| `build` | Compiles the TypeScript project into JavaScript inside the `dist/` folder. |

## 🛠️ Database, Migrations, and Seeders (TypeORM)

Database management is handled through [TypeORM](https://typeorm.io/) and `typeorm-extension`.

### DB Creation and Deletion
| Command | Description |
| :--- | :--- |
| `db:create` | Creates the PostgreSQL database if it doesn't already exist, based on the provided configuration. |
| `db:drop` | Drops the current database and all its data. Use with extreme caution! |

### Migrations
| Command | Description |
| :--- | :--- |
| `migration:run` | Executes all pending migrations and applies structural changes to the DB. |
| `migration:generate` | Compares the current database state with your entities (`.entity.ts`) and auto-generates a new migration file with the found differences. **Example**: `npm run migration:generate -- src/database/migrations/MigrationName` |
| `migration:create` | Creates an empty migration file where you can manually write SQL or TypeORM API calls. **Example**: `npm run migration:create -- src/database/migrations/MigrationName` |
| `migration:revert` | Reverts the most recently executed migration. |

### Schema
| Command | Description |
| :--- | :--- |
| `schema:sync` | Automatically syncs the database structure with your entities without using migrations. **Recommended for development only**. |
| `schema:drop` | Drops all tables in the current schema, leaving the database completely empty. |

### Seeders
| Command | Description |
| :--- | :--- |
| `seed:create` | Creates a new blank Seed class to insert test data or initial configuration. |
| `seed:run` | Executes existing seeders (e.g., `rbac.seeder.ts`) to populate the database with required basic data (roles, admin users, etc.). |

## 🧪 Testing

[Jest](https://jestjs.io/) is used as the main framework for unit and E2E testing.

| Command | Description |
| :--- | :--- |
| `test` | Runs the complete unit test suite once. |
| `test:watch` | Runs tests in watch mode. If you modify a file, Jest automatically re-runs the affected tests. |
| `test:cov` | Runs all tests and generates a code coverage report (in the console and in the `coverage/` folder). |
| `test:debug` | Starts unit tests in debug mode to pause execution at breakpoints. |
| `test:e2e` | Runs end-to-end (E2E) tests using the separate Jest configuration (`jest-e2e.json`). |

## 🧹 Code Formatting and Quality (Linting)

| Command | Description |
| :--- | :--- |
| `format` | Applies [Prettier](https://prettier.io/) formatting to all `.ts` files in the project (code and tests). |
| `lint` | Runs [ESLint](https://eslint.org/) on the project and applies auto-fixes for fixable code style violations. |

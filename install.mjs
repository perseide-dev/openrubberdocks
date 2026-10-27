#!/usr/bin/env node

/**
 * OpenRubberDocks - Interactive TUI Setup, Security & Update Wizard
 * Cross-platform (Linux / Windows / macOS / VPS)
 *
 * License: GNU Affero General Public License v3.0 (AGPL-3.0-only)
 *
 * Capabilities:
 * - License notice & compliance information (GNU AGPLv3)
 * - One-command Automated System Updater (`node install.mjs --update` / `./install.sh update`)
 *   that pulls latest changes from `main`, preserves all user `.env` & `colors.ts` files,
 *   backfills new env keys, rebuilds, and runs migrations + seeders automatically
 * - Environment detection & prerequisite checks (Docker, Compose, Node, pnpm, Git)
 * - Firewall-safe (`iptables` / UFW) network parametrization (`127.0.0.1` loopback binding by default,
 *   strictly preventing PostgreSQL public exposure)
 * - Core Administrator user provisioning (username, handle, secure password)
 * - Digital Brutalist Theme customization (writes git-ignored `colors.ts` using `@theme/*` alias)
 * - Automated env file generation (`.env`, `backend/.env`, `frontend/.env`)
 * - Automatic dependency installation, build, database spin-up, migrations, and seeders execution
 */

import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ANSI Styles & Colors
const C = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bgBlack: '\x1b[40m',
  bgWhite: '\x1b[47m',
  bgYellow: '\x1b[43m',
  bgRed: '\x1b[41m',
  inverse: '\x1b[7m',
};

function clearScreen() {
  output.write('\x1b[2J\x1b[0f');
}

function printBanner() {
  console.log(
    C.bold +
      C.white +
      `
┌─────────────────────────────────────────────────────────────────────────────┐
│  ██████╗ ██████╗ ███████╗███╗   ██╗██████╗  ██████╗  ██████╗ ██╗  ██╗███████╗│
│ ██╔═══██╗██╔══██╗██╔════╝████╗  ██║██╔══██╗██╔═══██╗██╔════╝ ██║ ██╔╝██╔════╝│
│ ██║   ██║██████╔╝█████╗  ██╔██╗ ██║██████╔╝██║   ██║██║      █████╔╝ ███████╗│
│ ██║   ██║██╔═══╝ ██╔══╝  ██║╚██╗██║██╔══██╗██║   ██║██║      ██╔═██╗ ╚════██║│
│ ╚██████╔╝██║     ███████╗██║ ╚████║██║  ██║╚██████╔╝╚██████╗ ██║  ██╗███████║│
│  ╚═════╝ ╚═╝     ╚══════╝╚═╝  ╚═══╝╚═╝  ╚═╝ ╚═════╝  ╚═════╝ ╚═╝  ╚═╝╚══════╝│
│                                                                             │
│              OPENRUBBERDOCKS // INSTALLER, PROVISIONER & UPDATER            │
│               Contemporary Digital Brutalist System Provisioner             │
└─────────────────────────────────────────────────────────────────────────────┘` +
      C.reset,
  );
}

function printLicenseNotice() {
  console.log(
    C.yellow +
      `┌─────────────────────────────────────────────────────────────────────────────┐
│ ${C.bold}AVISO DE LICENCIA // LICENSE NOTICE: GNU AGPLv3 (AGPL-3.0-only)${C.reset}${C.yellow}             │
├─────────────────────────────────────────────────────────────────────────────┤
│ OpenRubberDocks — Copyright (C) 2026 Miguel Vasquez Giraldo                 │
│                                                                             │
│ Este software es libre y de código abierto bajo la licencia                 │
│ ${C.bold}GNU Affero General Public License v3.0 (AGPL-3.0)${C.reset}${C.yellow}.                          │
│ • Puedes usar, auto-alojar, personalizar y redistribuir este programa.      │
│ • Copyleft de Red: Si despliegas versiones modificadas en un servidor o     │
│   red, debes poner el código fuente completo a disposición de los usuarios  │
│   bajo la misma licencia AGPL-3.0 (consulta LICENSE.md para más detalles).  │
│ • Se distribuye SIN NINGUNA GARANTÍA (WITHOUT ANY WARRANTY).                │
└─────────────────────────────────────────────────────────────────────────────┘` +
      C.reset,
  );
}

function printSection(title, stepNumber, totalSteps = 5) {
  const stepText = stepNumber ? `STEP [0${stepNumber}/0${totalSteps}] ` : '';
  console.log('\n' + C.bold + C.inverse + ` ${stepText}${title.toUpperCase()} ` + C.reset);
  console.log(C.dim + '─'.repeat(77) + C.reset);
}

function runCommand(command, cwd = __dirname) {
  try {
    return execSync(command, { cwd, stdio: 'pipe', encoding: 'utf-8' }).trim();
  } catch {
    return null;
  }
}

const lineQueue = [];
let lineWaiters = [];
let rlClosed = false;

function setupReadlineQueue(rl) {
  if (input.isTTY) return;
  rl.on('line', (line) => {
    if (lineWaiters.length > 0) {
      const resolve = lineWaiters.shift();
      resolve(line);
    } else {
      lineQueue.push(line);
    }
  });
  rl.on('close', () => {
    rlClosed = true;
    while (lineWaiters.length > 0) {
      const resolve = lineWaiters.shift();
      resolve('');
    }
  });
}

async function askQuestion(rl, query, defaultValue = '') {
  const defaultText = defaultValue ? `${C.dim}[${defaultValue}]${C.reset} ` : '';
  const promptText = `${C.bold}${query}${C.reset} ${defaultText}`;
  if (input.isTTY) {
    const answer = await rl.question(promptText);
    return answer.trim() || defaultValue;
  }
  output.write(promptText);
  let answer = '';
  if (lineQueue.length > 0) {
    answer = lineQueue.shift();
  } else if (!rlClosed) {
    answer = await new Promise((resolve) => lineWaiters.push(resolve));
  }
  output.write(`${answer}\n`);
  return answer.trim() || defaultValue;
}

async function askPassword(rl, query, defaultValue = '') {
  return askQuestion(rl, query, defaultValue);
}

function generateSecret(bytes = 32) {
  return crypto.randomBytes(bytes).toString('hex');
}

function parseEnvFile(content) {
  const result = {};
  if (!content) return result;
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim();
    result[key] = val;
  }
  return result;
}

function writeSecureFile(filePath, content) {
  fs.writeFileSync(filePath, content, { encoding: 'utf-8', mode: 0o600 });
}

function getPackageManager() {
  return runCommand('pnpm --version') ? 'pnpm' : 'npm';
}

function ensureBackendBuilt(pkgManager) {
  const backendDir = path.join(__dirname, 'backend');
  const typeormConfigDist = path.join(backendDir, 'dist', 'config', 'typeorm.config.js');
  const nodeModulesDir = path.join(backendDir, 'node_modules');

  if (!fs.existsSync(nodeModulesDir)) {
    console.log(C.cyan + `  → Installing backend dependencies (${pkgManager} install)...` + C.reset);
    execSync(`${pkgManager} install`, { cwd: backendDir, stdio: 'inherit' });
  }

  if (!fs.existsSync(typeormConfigDist)) {
    console.log(C.cyan + `  → Compiling backend (${pkgManager} run build)...` + C.reset);
    execSync(`${pkgManager} run build`, { cwd: backendDir, stdio: 'inherit' });
  }
}

async function waitForDockerPostgres(dbUser = 'postgres', dbName = 'openrubberdocks', maxRetries = 20) {
  for (let i = 1; i <= maxRetries; i++) {
    const ready = runCommand(`docker compose exec -T db pg_isready -U ${dbUser} -d ${dbName}`);
    if (ready && ready.includes('accepting connections')) {
      return true;
    }
    await new Promise((resolve) => setTimeout(resolve, 1500));
  }
  return false;
}

function buildRootDockerEnvContent({
  hostBindIp,
  apiPort,
  frontendPort,
  dbPort,
  dbUser,
  dbPassword,
  dbName,
  apiUrl,
}) {
  return `# OpenRubberDocks - Root Docker Compose Environment Configuration
# Controls port bindings and prevents accidental 0.0.0.0 iptables exposure.
HOST_BIND_IP=${hostBindIp}
PORT=${apiPort}
FRONTEND_PORT=${frontendPort}
DB_PORT=${dbPort}
DB_USER=${dbUser}
DB_PASSWORD=${dbPassword}
DB_NAME=${dbName}
VITE_API_URL=${apiUrl}
`;
}

// -------------------------------------------------------------
// AUTOMATED SYSTEM UPDATER (--update / update)
// -------------------------------------------------------------
async function runSystemUpdate() {
  printSection('Actualización Automática // Automated Update from main', 1, 4);

  const rootEnvPath = path.join(__dirname, '.env');
  const backendEnvPath = path.join(__dirname, 'backend', '.env');
  const frontendEnvPath = path.join(__dirname, 'frontend', '.env');
  const frontendColorsPath = path.join(__dirname, 'frontend', 'src', 'core', 'theme', 'colors.ts');

  // 1. Backup existing user configurations in memory
  const backup = {
    rootEnv: fs.existsSync(rootEnvPath) ? fs.readFileSync(rootEnvPath, 'utf-8') : null,
    backendEnv: fs.existsSync(backendEnvPath) ? fs.readFileSync(backendEnvPath, 'utf-8') : null,
    frontendEnv: fs.existsSync(frontendEnvPath) ? fs.readFileSync(frontendEnvPath, 'utf-8') : null,
    colorsTs: fs.existsSync(frontendColorsPath) ? fs.readFileSync(frontendColorsPath, 'utf-8') : null,
  };

  console.log(`  ${C.green}✓${C.reset} Configuraciones locales respaldadas en memoria:`);
  console.log(`    • backend/.env:  ${backup.backendEnv ? C.green + 'Protegido' + C.reset : C.yellow + 'No encontrado (se creará por defecto)' + C.reset}`);
  console.log(`    • frontend/.env: ${backup.frontendEnv ? C.green + 'Protegido' + C.reset : C.yellow + 'No encontrado (se creará por defecto)' + C.reset}`);
  console.log(`    • colors.ts:     ${backup.colorsTs ? C.green + 'Protegido (Paleta personalizada)' + C.reset : C.dim + 'Monocromo por defecto' + C.reset}`);

  // 2. Pull latest changes from main
  printSection('Descargando cambios desde Git (origin/main)', 2, 4);

  const gitVersion = runCommand('git --version');
  if (!gitVersion) {
    throw new Error('Git no está instalado o no se encuentra en el PATH.');
  }

  const gitStatus = runCommand('git status --porcelain');
  let stashed = false;
  if (gitStatus) {
    console.log(C.yellow + '  ! Se detectaron cambios locales en archivos rastreados. Guardando en git stash temporalmente...' + C.reset);
    execSync('git stash push -m "openrubberdocks-auto-update-backup"', { cwd: __dirname, stdio: 'inherit' });
    stashed = true;
  }

  console.log(C.cyan + '  → Ejecutando git pull origin main...' + C.reset);
  execSync('git pull origin main', { cwd: __dirname, stdio: 'inherit' });

  if (stashed) {
    console.log(C.dim + '  (Tus cambios locales previos quedaron respaldados en `git stash list` por seguridad).' + C.reset);
  }

  // 3. Restore & reconcile user configuration files without losing customizations
  printSection('Restaurando y Sincronizando Configuraciones', 3, 4);

  if (backup.colorsTs) {
    fs.writeFileSync(frontendColorsPath, backup.colorsTs, 'utf-8');
    console.log(`  ${C.green}✓${C.reset} Paleta personalizada ${C.bold}frontend/src/core/theme/colors.ts${C.reset} preservada.`);
  }

  let backendContent = backup.backendEnv;
  if (!backendContent) {
    const examplePath = path.join(__dirname, 'backend', '.env.example');
    backendContent = fs.existsSync(examplePath) ? fs.readFileSync(examplePath, 'utf-8') : '';
  }

  const parsedBackend = parseEnvFile(backendContent);
  const parsedFrontend = parseEnvFile(backup.frontendEnv || '');
  const parsedRoot = parseEnvFile(backup.rootEnv || '');

  const apiPort = parsedBackend.PORT || parsedRoot.PORT || '3000';
  const frontendPort = parsedRoot.FRONTEND_PORT || '5173';
  const hostBindIp = parsedRoot.HOST_BIND_IP || '127.0.0.1';
  const dbPort = parsedBackend.DB_PORT || parsedRoot.DB_PORT || '5432';
  const dbUser = parsedBackend.DB_USER || parsedRoot.DB_USER || 'postgres';
  const dbPassword = parsedBackend.DB_PASSWORD || parsedRoot.DB_PASSWORD || 'postgres';
  const dbName = parsedBackend.DB_NAME || parsedRoot.DB_NAME || 'openrubberdocks';
  const apiUrl = parsedFrontend.VITE_API_URL || parsedRoot.VITE_API_URL || `http://localhost:${apiPort}`;

  // Backfill any newly introduced keys in backend/.env without touching user values
  const missingBackendLines = [];
  if (!parsedBackend.FRONTEND_URL) {
    missingBackendLines.push(`FRONTEND_URL=http://localhost:${frontendPort}`);
  }
  if (!parsedBackend.POSTGRES_USER) {
    missingBackendLines.push(`POSTGRES_USER=${dbUser}`);
  }
  if (!parsedBackend.POSTGRES_PASSWORD) {
    missingBackendLines.push(`POSTGRES_PASSWORD=${dbPassword}`);
  }
  if (!parsedBackend.POSTGRES_DB) {
    missingBackendLines.push(`POSTGRES_DB=${dbName}`);
  }
  if (!parsedBackend.ENABLE_MCP) {
    missingBackendLines.push('ENABLE_MCP=true');
  }
  if (!parsedBackend.MCP_BASE_PATH) {
    missingBackendLines.push('MCP_BASE_PATH=/mcp');
  }

  if (missingBackendLines.length > 0) {
    backendContent = backendContent.trimEnd() + '\n\n# Auto-synced variables during update\n' + missingBackendLines.join('\n') + '\n';
  }
  writeSecureFile(backendEnvPath, backendContent);
  console.log(`  ${C.green}✓${C.reset} Configuración ${C.bold}backend/.env${C.reset} verificada y sincronizada.`);

  const finalFrontendEnv = backup.frontendEnv || `# OpenRubberDocks - Frontend Environment Configuration\nVITE_API_URL=${apiUrl}\n`;
  writeSecureFile(frontendEnvPath, finalFrontendEnv);
  console.log(`  ${C.green}✓${C.reset} Configuración ${C.bold}frontend/.env${C.reset} verificada.`);

  const finalRootEnv =
    backup.rootEnv ||
    buildRootDockerEnvContent({
      hostBindIp,
      apiPort,
      frontendPort,
      dbPort,
      dbUser,
      dbPassword,
      dbName,
      apiUrl,
    });
  writeSecureFile(rootEnvPath, finalRootEnv);
  console.log(`  ${C.green}✓${C.reset} Configuración raíz ${C.bold}.env${C.reset} (Docker/Firewall) verificada.`);

  // 4. Rebuild dependencies, run migrations & seeders, and update containers if active
  printSection('Dependencias, Compilación, Migraciones y Contenedores', 4, 4);

  const pkgManager = getPackageManager();
  const dockerRunning = runCommand('docker info');
  const composePs = dockerRunning ? runCommand('docker compose ps --services --filter "status=running"') : null;
  const runningServices = composePs ? composePs.split(/\r?\n/).filter(Boolean) : [];

  console.log(C.cyan + `  [1/4] Actualizando dependencias y compilando Backend (${pkgManager})...` + C.reset);
  execSync(`${pkgManager} install`, { cwd: path.join(__dirname, 'backend'), stdio: 'inherit' });
  execSync(`${pkgManager} run build`, { cwd: path.join(__dirname, 'backend'), stdio: 'inherit' });

  console.log(C.cyan + `  [2/4] Actualizando dependencias y compilando Frontend (${pkgManager})...` + C.reset);
  execSync(`${pkgManager} install`, { cwd: path.join(__dirname, 'frontend'), stdio: 'inherit' });
  execSync(`${pkgManager} run build`, { cwd: path.join(__dirname, 'frontend'), stdio: 'inherit' });

  console.log(C.cyan + '  [3/4] Ejecutando migraciones y seeders en la base de datos...' + C.reset);
  try {
    if (dockerRunning && (parsedBackend.DB_HOST === 'localhost' || parsedBackend.DB_HOST === 'db' || runningServices.includes('db'))) {
      execSync('docker compose up -d db', { cwd: __dirname, stdio: 'inherit' });
      await waitForDockerPostgres(dbUser, dbName);
    }
    execSync(`${pkgManager} run migration:run`, { cwd: path.join(__dirname, 'backend'), stdio: 'inherit' });
    execSync(`${pkgManager} run seed:run`, { cwd: path.join(__dirname, 'backend'), stdio: 'inherit' });
    console.log(C.green + '  ✓ Migraciones y seeders aplicados correctamente.' + C.reset);
  } catch (err) {
    console.log(C.yellow + '  ! Nota al ejecutar migraciones/seeders locales: ' + err.message + C.reset);
  }

  if (runningServices.includes('backend') || runningServices.includes('frontend')) {
    console.log(C.cyan + '  [4/4] Contenedores Docker activos detectados. Reconstruyendo y reiniciando servicios...' + C.reset);
    if (runningServices.includes('frontend')) {
      execSync('docker compose --profile full up -d --build', { cwd: __dirname, stdio: 'inherit' });
    } else {
      execSync('docker compose up -d --build', { cwd: __dirname, stdio: 'inherit' });
    }
  } else {
    console.log(C.dim + '  [4/4] Contenedores de aplicación no estaban corriendo en segundo plano (listos para iniciar cuando desees).' + C.reset);
  }

  const currentCommit = runCommand('git rev-parse --short HEAD') || 'latest';
  console.log(
    '\n' +
      C.bold +
      C.green +
      `┌─────────────────────────────────────────────────────────────────────────────┐
│                ACTUALIZACIÓN COMPLETADA CON ÉXITO (${currentCommit.padEnd(7, ' ')})                │
└─────────────────────────────────────────────────────────────────────────────┘` +
      C.reset,
  );
  console.log(`  • ${C.bold}Configuraciones (.env y colors.ts):${C.reset} Intactas y sincronizadas`);
  console.log(`  • ${C.bold}Seguridad de Red (PostgreSQL):${C.reset}      127.0.0.1:${dbPort} (Protegido contra exposición pública)`);
  console.log(`  • ${C.bold}Bind de Servicios Docker:${C.reset}           ${hostBindIp}`);
  console.log('\n' + C.bold + C.inverse + ' SYSTEM UPDATED & READY ' + C.reset + '\n');
}

// -------------------------------------------------------------
// INTERACTIVE INSTALLER WIZARD
// -------------------------------------------------------------
async function runInteractiveInstall(rl) {
  // ---------------------------------------------------------
  // STEP 1: PREREQUISITES & ENVIRONMENT DETECTION
  // ---------------------------------------------------------
  printSection('Environment & Prerequisites Detection', 1, 5);

  const platform = os.platform();
  const release = os.release();
  const nodeVersion = process.version;
  const dockerVersion = runCommand('docker --version');
  const composeVersion = runCommand('docker compose version') || runCommand('docker-compose --version');
  const pnpmVersion = runCommand('pnpm --version');
  const npmVersion = runCommand('npm --version');
  const gitVersion = runCommand('git --version');

  console.log(`  ${C.bold}OS Platform:${C.reset}       ${platform} (${release})`);
  console.log(`  ${C.bold}Node.js:${C.reset}           ${nodeVersion} ${C.green}✓${C.reset}`);
  console.log(`  ${C.bold}Package Manager:${C.reset}   ${pnpmVersion ? `pnpm v${pnpmVersion} ${C.green}✓${C.reset}` : `npm v${npmVersion} (pnpm recommended)`}`);
  console.log(`  ${C.bold}Git:${C.reset}               ${gitVersion ? `${gitVersion} ${C.green}✓${C.reset}` : `${C.yellow}Not found${C.reset}`}`);
  console.log(`  ${C.bold}Docker Engine:${C.reset}     ${dockerVersion ? `${dockerVersion} ${C.green}✓${C.reset}` : `${C.yellow}Not found / Not in PATH (Optional if running bare-metal)${C.reset}`}`);
  console.log(`  ${C.bold}Docker Compose:${C.reset}    ${composeVersion ? `${composeVersion} ${C.green}✓${C.reset}` : `${C.yellow}Not found${C.reset}`}`);

  // ---------------------------------------------------------
  // STEP 2: NETWORK, FIREWALL & SERVICE CONFIGURATION
  // ---------------------------------------------------------
  printSection('Startup, Firewall Safety & Network Parametrization', 2, 5);

  console.log(C.bold + '// ENVIRONMENT MODE //' + C.reset);
  console.log(`  ${C.bold}[1] Development${C.reset} (Hot-reload, detailed logs, schema sync optional)`);
  console.log(`  ${C.bold}[2] Production${C.reset}  (Strict TypeORM migrations, DB_SYNCHRONIZE=false)`);
  const envModeChoice = await askQuestion(rl, 'Select Environment Mode [1-2]:', '1');
  const isProd = envModeChoice === '2';
  const nodeEnv = isProd ? 'production' : 'development';
  const dbSynchronize = isProd ? 'false' : 'true';

  console.log('\n' + C.bold + '// FIREWALL & IPTABLES PROTECTION (DOCKER PORT BINDING) //' + C.reset);
  console.log(
    C.dim +
      'Nota: Docker modifica iptables al publicar puertos en 0.0.0.0, saltándose firewalls como UFW.\n' +
      'Por seguridad, PostgreSQL (db) SIEMPRE se vincula exclusivamente a 127.0.0.1 (nunca expuesto a internet).\n' +
      'Para el Backend y Frontend puedes elegir:' +
      C.reset,
  );
  console.log(`  ${C.bold}[1] 127.0.0.1 (Recomendado / Seguro)${C.reset} — Solo accesible localmente o mediante Reverse Proxy (Nginx/Caddy/Cloudflare). No expone puertos en iptables.`);
  console.log(`  ${C.bold}[2] 0.0.0.0 (Exposición Directa)${C.reset}     — Expone los puertos del Backend/Frontend directamente en todas las interfaces de red.`);
  const bindChoice = await askQuestion(rl, 'Select Host Bind Mode [1-2]:', '1');
  const hostBindIp = bindChoice === '2' ? '0.0.0.0' : '127.0.0.1';

  console.log('\n' + C.bold + '// PORTS & PUBLIC URLS //' + C.reset);
  const apiPort = await askQuestion(rl, 'Backend API Port:', '3000');
  const frontendPort = await askQuestion(rl, 'Frontend Port:', '5173');
  const defaultApiUrl = `http://localhost:${apiPort}`;
  const apiUrl = await askQuestion(rl, 'Frontend VITE_API_URL (Public API URL/Domain if remote VPS):', defaultApiUrl);
  const defaultFrontendUrl = `http://localhost:${frontendPort}`;
  const frontendUrl = await askQuestion(rl, 'Allowed CORS Origin FRONTEND_URL (Public Frontend URL/Domain):', defaultFrontendUrl);

  console.log('\n' + C.bold + '// DATABASE CONFIGURATION // (PostgreSQL - Bound strictly to 127.0.0.1 on host)' + C.reset);
  const dbHost = await askQuestion(rl, 'Database Host (Use "localhost" for local/hybrid dev):', 'localhost');
  const dbPort = await askQuestion(rl, 'Database Host Port:', '5432');
  const dbName = await askQuestion(rl, 'Database Name:', 'openrubberdocks');
  const dbUser = await askQuestion(rl, 'Database User:', 'postgres');
  const defaultDbPass = isProd ? generateSecret(16) : 'postgres';
  const dbPassword = await askPassword(rl, 'Database Password:', defaultDbPass);

  console.log('\n' + C.bold + '// SECURITY TOKENS & MCP //' + C.reset);
  const defaultAccessSecret = generateSecret(32);
  const defaultRefreshSecret = generateSecret(32);
  console.log(C.dim + 'Auto-generating 256-bit cryptographically secure JWT secrets...' + C.reset);
  const jwtAccessSecret = await askQuestion(rl, 'JWT Access Secret (or press enter for generated):', defaultAccessSecret);
  const jwtRefreshSecret = await askQuestion(rl, 'JWT Refresh Secret (or press enter for generated):', defaultRefreshSecret);
  const enableMcpAnswer = await askQuestion(rl, 'Enable Model Context Protocol (MCP) Server for AI Agents? [y/n]:', 'y');
  const enableMcp = enableMcpAnswer.toLowerCase().startsWith('n') ? 'false' : 'true';

  // ---------------------------------------------------------
  // STEP 3: CORE ADMINISTRATOR PROVISIONING
  // ---------------------------------------------------------
  printSection('Core Administrator Provisioning', 3, 5);
  console.log(C.dim + 'The coreAdmin user has supreme platform privileges and bypasses all scopes.' + C.reset);

  const coreUsername = await askQuestion(rl, 'Core Admin Display Name:', 'Core Administrator');
  const coreHandle = await askQuestion(rl, 'Core Admin Handle (login handle):', 'coreadmin');
  const defaultCorePass = 'AdminPass_' + crypto.randomBytes(4).toString('hex') + '!';
  const corePassword = await askPassword(rl, 'Core Admin Password (or enter for auto-generated):', defaultCorePass);

  // ---------------------------------------------------------
  // STEP 4: CONTEMPORARY BRUTALIST THEME CUSTOMIZATION
  // ---------------------------------------------------------
  printSection('Brutalist Theme & Color Customization', 4, 5);
  console.log(C.dim + 'Select a color palette for the flat contemporary brutalist UI:' + C.reset);
  console.log(`  ${C.bold}[1] Classic Monochrome Wireframe${C.reset} (Pure Stark Black & White #000000 / #FFFFFF)`);
  console.log(`  ${C.bold}[2] Studio "BRUT." Yellow & Vermillion${C.reset} (Electric Yellow #FFE600 & Red #FF3B30 - Reference Studio Style)`);
  console.log(`  ${C.bold}[3] High-Voltage Cyber Orange${C.reset} (International Orange #FF5522 & Black)`);
  console.log(`  ${C.bold}[4] Custom Palette${C.reset} (Manually specify hex codes)`);

  const themeChoice = await askQuestion(rl, 'Select Theme Palette [1-4]:', '2');

  let customColors = null;

  if (themeChoice === '1') {
    customColors = null;
  } else if (themeChoice === '2') {
    customColors = {
      primary: { main: '#000000', contrastText: '#FFFFFF' },
      secondary: { main: '#FFE600', contrastText: '#000000' },
      background: { default: '#FFFFFF', paper: '#FFFFFF', subtle: '#F5F5F3' },
      accents: {
        yellow: '#FFE600',
        orange: '#FF5522',
        red: '#FF3B30',
        blue: '#0066FF',
        green: '#00CC66',
      },
    };
  } else if (themeChoice === '3') {
    customColors = {
      primary: { main: '#000000', contrastText: '#FFFFFF' },
      secondary: { main: '#FF5522', contrastText: '#FFFFFF' },
      background: { default: '#FFFFFF', paper: '#FFFFFF', subtle: '#F5F5F3' },
      accents: {
        yellow: '#FFD700',
        orange: '#FF5522',
        red: '#D32F2F',
        blue: '#0288D1',
        green: '#2E7D32',
      },
    };
  } else if (themeChoice === '4') {
    const priColor = await askQuestion(rl, 'Primary Main Hex:', '#000000');
    const secColor = await askQuestion(rl, 'Secondary Accent Hex:', '#FFE600');
    const accentRed = await askQuestion(rl, 'Alert / Number Highlight Hex:', '#FF3B30');
    customColors = {
      primary: { main: priColor, contrastText: '#FFFFFF' },
      secondary: { main: secColor, contrastText: '#000000' },
      background: { default: '#FFFFFF', paper: '#FFFFFF', subtle: '#F5F5F3' },
      accents: {
        yellow: secColor,
        orange: '#FF5522',
        red: accentRed,
        blue: '#0066FF',
        green: '#00CC66',
      },
    };
  }

  // ---------------------------------------------------------
  // STEP 5: FILE GENERATION & WRITING
  // ---------------------------------------------------------
  printSection('Configuration Files Generation', 5, 5);

  // 1. Root .env (for Docker Compose variable interpolation & port binding safety)
  const rootEnvPath = path.join(__dirname, '.env');
  const rootEnvContent = buildRootDockerEnvContent({
    hostBindIp,
    apiPort,
    frontendPort,
    dbPort,
    dbUser,
    dbPassword,
    dbName,
    apiUrl,
  });
  writeSecureFile(rootEnvPath, rootEnvContent);
  console.log(`  ${C.green}✓${C.reset} Generated ${C.bold}.env${C.reset} (Docker Compose & Firewall binding config)`);

  // 2. Backend .env
  const backendEnvPath = path.join(__dirname, 'backend', '.env');
  const backendEnvContent = `# OpenRubberDocks - Generated Backend Environment Configuration
NODE_ENV=${nodeEnv}
PORT=${apiPort}
FRONTEND_URL=${frontendUrl}

# Database Configuration (PostgreSQL)
DB_HOST=${dbHost}
DB_PORT=${dbPort}
DB_USER=${dbUser}
DB_PASSWORD=${dbPassword}
DB_NAME=${dbName}
DB_SYNCHRONIZE=${dbSynchronize}

# Docker Postgres Container Compatibility
POSTGRES_USER=${dbUser}
POSTGRES_PASSWORD=${dbPassword}
POSTGRES_DB=${dbName}

# Security / Hashing
JWT_ACCESS_SECRET=${jwtAccessSecret}
JWT_REFRESH_SECRET=${jwtRefreshSecret}
BCRYPT_SALT_ROUNDS=12

# Core Administrator Initial Seed Credentials
CORE_ADMIN_USERNAME=${coreUsername}
CORE_ADMIN_HANDLE=${coreHandle}
CORE_ADMIN_PASSWORD=${corePassword}

# Model Context Protocol (MCP) Server for AI Agents
ENABLE_MCP=${enableMcp}
MCP_BASE_PATH=/mcp
`;

  writeSecureFile(backendEnvPath, backendEnvContent);
  console.log(`  ${C.green}✓${C.reset} Generated ${C.bold}backend/.env${C.reset}`);

  // 3. Frontend .env
  const frontendEnvPath = path.join(__dirname, 'frontend', '.env');
  const frontendEnvContent = `# OpenRubberDocks - Generated Frontend Environment Configuration
VITE_API_URL=${apiUrl}
`;
  writeSecureFile(frontendEnvPath, frontendEnvContent);
  console.log(`  ${C.green}✓${C.reset} Generated ${C.bold}frontend/.env${C.reset}`);

  // 4. Frontend custom theme colors.ts (git-ignored, using @theme/* alias)
  const frontendColorsPath = path.join(__dirname, 'frontend', 'src', 'core', 'theme', 'colors.ts');
  if (customColors) {
    const colorsContent = `import type { ThemeColors } from '@theme/colors.interface';

// Generated Custom Brutalist Theme Palette (Git-Ignored)
export const colors: Partial<ThemeColors> = ${JSON.stringify(customColors, null, 2)};

export default colors;
`;
    fs.writeFileSync(frontendColorsPath, colorsContent, 'utf-8');
    console.log(`  ${C.green}✓${C.reset} Generated custom ${C.bold}frontend/src/core/theme/colors.ts${C.reset} (git-ignored)`);
  } else {
    if (fs.existsSync(frontendColorsPath)) {
      fs.unlinkSync(frontendColorsPath);
    }
    console.log(`  ${C.green}✓${C.reset} Using default monochrome palette (clean fallback)`);
  }

  // ---------------------------------------------------------
  // STEP 6: AUTOMATED DATABASE, MIGRATIONS & SEEDERS EXECUTION
  // ---------------------------------------------------------
  console.log('\n' + C.bold + C.inverse + ' DATABASE INITIALIZATION, MIGRATIONS & SEEDERS ' + C.reset);
  console.log(C.dim + '─'.repeat(77) + C.reset);
  console.log(`  ${C.bold}[1] Hybrid / Local Dev:${C.reset} Start PostgreSQL via Docker Compose (127.0.0.1:${dbPort}), build backend & run migrations + seeders`);
  console.log(`  ${C.bold}[2] Full Docker Stack:${C.reset}  Build & start Containers (DB + Backend + Frontend) via Docker Compose & run seeders`);
  console.log(`  ${C.bold}[3] External / Active DB:${C.reset} Run migrations + seeders on already active database (${dbHost}:${dbPort})`);
  console.log(`  ${C.bold}[4] Skip DB Execution:${C.reset}  Only generate configuration files`);

  const dbChoice = await askQuestion(rl, 'Select Execution Option [1-4]:', '1');
  const pkgManager = pnpmVersion ? 'pnpm' : 'npm';

  if (dbChoice === '1') {
    console.log('\n' + C.cyan + '[1/3] Starting PostgreSQL container (bound strictly to 127.0.0.1:' + dbPort + ')...' + C.reset);
    try {
      execSync('docker compose up -d db', { cwd: __dirname, stdio: 'inherit' });
      console.log(C.cyan + '[2/3] Waiting for PostgreSQL healthcheck...' + C.reset);
      const isReady = await waitForDockerPostgres(dbUser, dbName);
      if (!isReady) {
        console.log(C.yellow + '  ! Healthcheck timeout reached, attempting connection anyway...' + C.reset);
      } else {
        console.log(C.green + '✓ PostgreSQL container is healthy and accepting connections.' + C.reset);
      }

      console.log(C.cyan + '[3/3] Ensuring backend is built and running migrations + RBAC seeders...' + C.reset);
      ensureBackendBuilt(pkgManager);
      if (dbSynchronize === 'false') {
        execSync(`${pkgManager} run migration:run`, { cwd: path.join(__dirname, 'backend'), stdio: 'inherit' });
      }
      execSync(`${pkgManager} run seed:run`, { cwd: path.join(__dirname, 'backend'), stdio: 'inherit' });
      console.log(C.green + C.bold + '✓ Database initialized and seeded successfully!' + C.reset);
    } catch (err) {
      console.log(C.red + '✕ Automatic database/seed run encountered an issue:' + C.reset, err.message);
      console.log(C.yellow + `You can manually run seeds anytime with: cd backend && ${pkgManager} run seed:run` + C.reset);
    }
  } else if (dbChoice === '2') {
    console.log('\n' + C.cyan + '[1/2] Building and starting full Docker Compose stack...' + C.reset);
    try {
      execSync('docker compose --profile full up -d --build', { cwd: __dirname, stdio: 'inherit' });
      console.log(C.cyan + '[2/2] Running database migrations & RBAC seeders inside backend container...' + C.reset);
      await waitForDockerPostgres(dbUser, dbName);
      execSync('docker compose exec -T backend pnpm run migration:run', { cwd: __dirname, stdio: 'inherit' });
      execSync('docker compose exec -T backend pnpm run seed:run', { cwd: __dirname, stdio: 'inherit' });
      console.log(C.green + C.bold + '✓ Full Docker stack deployed and seeded successfully!' + C.reset);
    } catch (err) {
      console.log(C.red + '✕ Full Docker deployment encountered an issue:' + C.reset, err.message);
      console.log(C.yellow + 'You can manually run seeds with: docker compose exec backend pnpm run seed:run' + C.reset);
    }
  } else if (dbChoice === '3') {
    console.log('\n' + C.cyan + 'Running migrations and seeders on host ' + dbHost + '...' + C.reset);
    try {
      ensureBackendBuilt(pkgManager);
      if (dbSynchronize === 'false') {
        execSync(`${pkgManager} run migration:run`, { cwd: path.join(__dirname, 'backend'), stdio: 'inherit' });
      }
      execSync(`${pkgManager} run seed:run`, { cwd: path.join(__dirname, 'backend'), stdio: 'inherit' });
      console.log(C.green + C.bold + '✓ Database seeded successfully!' + C.reset);
    } catch (err) {
      console.log(C.red + '✕ Seeder execution failed:' + C.reset, err.message);
      console.log(C.yellow + `Check your database connection and run: cd backend && ${pkgManager} run seed:run` + C.reset);
    }
  } else {
    console.log(C.yellow + `Database initialization skipped. You can run seeders later with "${pkgManager} run seed:run".` + C.reset);
  }

  // ---------------------------------------------------------
  // STEP 7: INSTALLATION SUMMARY & NEXT STEPS
  // ---------------------------------------------------------
  console.log(
    '\n' +
      C.bold +
      C.green +
      `┌─────────────────────────────────────────────────────────────────────────────┐
│                      INSTALLATION COMPLETED SUCCESSFULLY                    │
└─────────────────────────────────────────────────────────────────────────────┘` +
      C.reset,
  );

  console.log(C.bold + 'System Provisioning Summary:' + C.reset);
  console.log(`  • ${C.bold}License:${C.reset}             GNU AGPLv3 (AGPL-3.0-only)`);
  console.log(`  • ${C.bold}Environment Mode:${C.reset}    ${nodeEnv} (DB_SYNCHRONIZE=${dbSynchronize})`);
  console.log(`  • ${C.bold}Docker Bind IP:${C.reset}      ${hostBindIp} (PostgreSQL locked to 127.0.0.1:${dbPort})`);
  console.log(`  • ${C.bold}API Endpoint:${C.reset}        http://${hostBindIp}:${apiPort} (Public URL: ${apiUrl})`);
  console.log(`  • ${C.bold}Frontend Origin:${C.reset}     ${frontendUrl}`);
  console.log(`  • ${C.bold}Core Admin Handle:${C.reset}   ${C.cyan}${coreHandle}${C.reset}`);
  console.log(`  • ${C.bold}Core Admin Password:${C.reset} ${C.yellow}${corePassword}${C.reset}`);
  console.log(`  • ${C.bold}Brutalist Theme:${C.reset}     ${customColors ? 'Custom Studio Accents Active' : 'Classic Monochrome Active'}`);

  console.log('\n' + C.bold + 'Next Steps & Useful Commands:' + C.reset);
  console.log(`  ${C.dim}1. Development Mode (Hybrid / Local):${C.reset}`);
  console.log(`     cd backend && pnpm run start:dev`);
  console.log(`     cd frontend && pnpm run dev`);
  console.log(`  ${C.dim}2. Full Production Deployment with Docker (DB + Backend + Frontend):${C.reset}`);
  console.log(`     docker compose --profile full up -d --build`);
  console.log(`  ${C.dim}3. One-Command Update from 'main' (Preserves .env & theme):${C.reset}`);
  console.log(`     ./install.sh --update   ${C.dim}(or: node install.mjs --update)${C.reset}`);

  console.log('\n' + C.bold + C.inverse + ' SYSTEM READY // HAPPY CODING ' + C.reset + '\n');
}

// -------------------------------------------------------------
// CORS & DOMAINS CONFIGURATOR WIZARD (--cors / cors)
// -------------------------------------------------------------
function normalizeUrlOrigin(rawUrl) {
  let formatted = rawUrl.trim().replace(/\/+$/, '');
  if (!formatted) return '';
  if (!/^https?:\/\//i.test(formatted)) {
    const isLocal = /^(localhost|127\.0\.0\.1|0\.0\.0\.0|192\.168\.|10\.|172\.(1[6-9]|2\d|3[0-1])\.)/i.test(formatted);
    const protocol = isLocal ? 'http://' : 'https://';
    console.log(C.yellow + `  ! Nota: "${formatted}" no incluía protocolo. Se ajustó automáticamente a ${protocol}${formatted}` + C.reset);
    formatted = `${protocol}${formatted}`;
  }
  return formatted;
}

async function configureCorsInteractive(rl) {
  printSection('Configuración Rápida de Dominios y CORS', 1, 1);
  console.log(
    C.dim +
      'Aquí puedes definir desde qué dominio(s) web entrarán tus usuarios (CORS)\n' +
      'y cuál es la dirección pública de tu servidor API, sin tocar código.' +
      C.reset +
      '\n',
  );

  const rootEnvPath = path.join(__dirname, '.env');
  const backendEnvPath = path.join(__dirname, 'backend', '.env');
  const backendExamplePath = path.join(__dirname, 'backend', '.env.example');
  const frontendEnvPath = path.join(__dirname, 'frontend', '.env');

  let backendContent = fs.existsSync(backendEnvPath)
    ? fs.readFileSync(backendEnvPath, 'utf-8')
    : fs.existsSync(backendExamplePath)
      ? fs.readFileSync(backendExamplePath, 'utf-8')
      : '';
  let frontendContent = fs.existsSync(frontendEnvPath) ? fs.readFileSync(frontendEnvPath, 'utf-8') : '';
  let rootContent = fs.existsSync(rootEnvPath) ? fs.readFileSync(rootEnvPath, 'utf-8') : '';

  const parsedBackend = parseEnvFile(backendContent);
  const parsedFrontend = parseEnvFile(frontendContent);
  const currentCors = parsedBackend.FRONTEND_URL || 'http://localhost:5173';
  const currentApiUrl = parsedFrontend.VITE_API_URL || 'http://localhost:3000';

  console.log(`  ${C.bold}1. Dominios permitidos para el Frontend (CORS actual):${C.reset} ${C.yellow}${currentCors}${C.reset}`);
  console.log(`     ${C.dim}Ejemplos:${C.reset}`);
  console.log(`     • Un dominio:      ${C.cyan}https://app.tudominio.com${C.reset}`);
  console.log(`     • Varios dominios: ${C.cyan}https://app.tudominio.com, http://localhost:5173${C.reset}\n`);

  const userInputCors = await askQuestion(
    rl,
    '¿Desde qué dominio(s) abrirán la web tus usuarios? (separa con coma si son varios):',
    currentCors,
  );

  const cleanedOrigins = userInputCors
    .split(',')
    .map((item) => normalizeUrlOrigin(item))
    .filter(Boolean);

  const finalCorsString = cleanedOrigins.join(', ');

  console.log(`\n  ${C.bold}2. Dirección del Servidor Backend API (VITE_API_URL actual):${C.reset} ${C.yellow}${currentApiUrl}${C.reset}`);
  console.log(`     ${C.dim}Ejemplo en VPS: ${C.cyan}https://api.tudominio.com${C.dim} (o presiona Enter para mantener la actual)${C.reset}\n`);

  const userInputApi = await askQuestion(
    rl,
    '¿Cuál es la URL pública de tu Backend API?:',
    currentApiUrl,
  );
  const finalApiUrl = normalizeUrlOrigin(userInputApi) || currentApiUrl;

  // 1. Guardar FRONTEND_URL en backend/.env
  if (backendContent.includes('FRONTEND_URL=')) {
    backendContent = backendContent.replace(/FRONTEND_URL=.*/g, `FRONTEND_URL=${finalCorsString}`);
  } else {
    backendContent = backendContent.trimEnd() + `\nFRONTEND_URL=${finalCorsString}\n`;
  }
  writeSecureFile(backendEnvPath, backendContent);

  // 2. Guardar VITE_API_URL en frontend/.env y .env raíz
  if (frontendContent.includes('VITE_API_URL=')) {
    frontendContent = frontendContent.replace(/VITE_API_URL=.*/g, `VITE_API_URL=${finalApiUrl}`);
  } else {
    frontendContent = `# OpenRubberDocks - Frontend Environment Configuration\nVITE_API_URL=${finalApiUrl}\n`;
  }
  writeSecureFile(frontendEnvPath, frontendContent);

  if (rootContent) {
    if (rootContent.includes('VITE_API_URL=')) {
      rootContent = rootContent.replace(/VITE_API_URL=.*/g, `VITE_API_URL=${finalApiUrl}`);
    } else {
      rootContent = rootContent.trimEnd() + `\nVITE_API_URL=${finalApiUrl}\n`;
    }
    writeSecureFile(rootEnvPath, rootContent);
  }

  console.log(`\n  ${C.green}✓${C.reset} Configuración guardada exitosamente:`);
  console.log(`    • ${C.bold}Dominios CORS permitidos (backend/.env):${C.reset} ${C.green}${finalCorsString}${C.reset}`);
  console.log(`    • ${C.bold}URL del Backend API (frontend/.env):${C.reset}     ${C.green}${finalApiUrl}${C.reset}`);

  // Verificar si Docker está corriendo y aplicar los nuevos .env con `docker compose up -d`
  const dockerRunning = runCommand('docker info');
  const runningServices = dockerRunning ? (runCommand('docker compose ps --services --filter "status=running"') || '') : '';

  if (runningServices.includes('backend')) {
    const restartChoice = await askQuestion(rl, '\n¿Deseas aplicar los cambios en Docker ahora mismo? [y/n]:', 'y');
    if (restartChoice.toLowerCase().startsWith('y') || restartChoice.toLowerCase().startsWith('s')) {
      console.log(C.cyan + '  → Recargando variables de entorno en el contenedor backend...' + C.reset);
      try {
        if (runningServices.includes('frontend') && finalApiUrl !== currentApiUrl) {
          execSync('docker compose --profile full up -d --build backend frontend', { cwd: __dirname, stdio: 'inherit' });
        } else {
          execSync('docker compose up -d backend', { cwd: __dirname, stdio: 'inherit' });
        }
        console.log(C.green + '  ✓ Servicios actualizados y corriendo con la nueva configuración.' + C.reset);
      } catch (err) {
        console.log(C.yellow + '  ! No se pudo recargar automáticamente: ' + err.message + C.reset);
      }
    }
  } else {
    console.log(C.dim + '\nLos cambios ya están guardados y se aplicarán automáticamente al iniciar el servidor.' + C.reset);
  }

  console.log('\n' + C.bold + C.inverse + ' CONFIGURACIÓN DE DOMINIOS Y CORS FINALIZADA ' + C.reset + '\n');
}

// -------------------------------------------------------------
// ENTRYPOINT
// -------------------------------------------------------------
async function main() {
  const args = process.argv.slice(2).map((a) => a.toLowerCase());

  if (args.includes('--help') || args.includes('-h')) {
    printBanner();
    printLicenseNotice();
    console.log(`\n${C.bold}Usage:${C.reset}`);
    console.log(`  ./install.sh                  Run interactive setup / update wizard`);
    console.log(`  ./install.sh --update         Pull latest 'main', preserve configs, build & migrate`);
    console.log(`  ./install.sh --cors           Quick interactive CORS / allowed domains configurator`);
    console.log(`  node install.mjs [update|cors] Direct Node.js execution\n`);
    return;
  }

  clearScreen();
  printBanner();
  printLicenseNotice();

  const rl = readline.createInterface({ input, output });
  setupReadlineQueue(rl);

  // Direct CLI flag for CORS configurator
  if (args.includes('--cors') || args.includes('-c') || args.includes('cors')) {
    try {
      await configureCorsInteractive(rl);
    } catch (err) {
      console.error(C.red + '\n✕ Error al configurar CORS:' + C.reset, err.message || err);
      process.exitCode = 1;
    } finally {
      rl.close();
    }
    return;
  }

  // Direct CLI flag for non-interactive one-command update
  if (args.includes('--update') || args.includes('-u') || args.includes('update')) {
    rl.close();
    try {
      await runSystemUpdate();
    } catch (err) {
      console.error(C.red + '\n✕ Error durante la actualización:' + C.reset, err.message || err);
      process.exitCode = 1;
    }
    return;
  }

  try {
    const hasExistingEnv = fs.existsSync(path.join(__dirname, 'backend', '.env'));
    console.log('\n' + C.bold + '// SELECCIONA UNA OPERACIÓN // SELECT OPERATION //' + C.reset);
    console.log(`  ${C.bold}[1] Instalar o Reconfigurar el Sistema${C.reset} (Asistente interactivo paso a paso)`);
    console.log(
      `  ${C.bold}[2] Actualizar el Programa desde 'main'${C.reset} (Descarga cambios, preserva tus .env/colores y ejecuta migraciones)${
        hasExistingEnv ? C.green + ' [Configuración existente detectada]' + C.reset : ''
      }`,
    );
    console.log(`  ${C.bold}[3] Configurar Dominios y CORS${C.reset} (Permitir acceso a nuevas URLs del Frontend sin tocar código)`);

    const modeChoice = await askQuestion(rl, 'Selecciona una opción [1-3]:', '1');
    if (modeChoice === '2') {
      await runSystemUpdate();
    } else if (modeChoice === '3') {
      await configureCorsInteractive(rl);
    } else {
      await runInteractiveInstall(rl);
    }
  } catch (err) {
    console.error(C.red + '\nInstallation wizard aborted or error occurred:' + C.reset, err);
    process.exitCode = 1;
  } finally {
    rl.close();
  }
}

main();

#!/usr/bin/env node

/**
 * OpenRubberDocks - Interactive TUI Setup & Installation Wizard
 * Cross-platform (Linux / Windows / macOS / VPS)
 * 
 * Capabilities:
 * - Environment detection & prerequisite checks (Docker, Node, pnpm)
 * - Network & startup parametrization (Ports, Hosts, JWT Secrets)
 * - Core Administrator user provisioning (username, handle, secure password)
 * - Digital Brutalist Theme customization (writes gitignored colors.ts)
 * - Automated env file generation (backend/.env, frontend/.env)
 * - Automatic database spin-up and seeders execution
 */

import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { execSync, spawn } from 'node:child_process';
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
  console.log(C.bold + C.white + `
┌─────────────────────────────────────────────────────────────────────────────┐
│  ██████╗ ██████╗ ███████╗███╗   ██╗██████╗  ██████╗  ██████╗ ██╗  ██╗███████╗│
│ ██╔═══██╗██╔══██╗██╔════╝████╗  ██║██╔══██╗██╔═══██╗██╔════╝ ██║ ██╔╝██╔════╝│
│ ██║   ██║██████╔╝█████╗  ██╔██╗ ██║██████╔╝██║   ██║██║      █████╔╝ ███████╗│
│ ██║   ██║██╔═══╝ ██╔══╝  ██║╚██╗██║██╔══██╗██║   ██║██║      ██╔═██╗ ╚════██║│
│ ╚██████╔╝██║     ███████╗██║ ╚████║██║  ██║╚██████╔╝╚██████╗ ██║  ██╗███████║│
│  ╚═════╝ ╚═╝     ╚══════╝╚═╝  ╚═══╝╚═╝  ╚═╝ ╚═════╝  ╚═════╝ ╚═╝  ╚═╝╚══════╝│
│                                                                             │
│                  OPENRUBBERDOCKS // VPS INSTALLER & WIZARD                  │
│               Contemporary Digital Brutalist System Provisioner             │
└─────────────────────────────────────────────────────────────────────────────┘` + C.reset);
}

function printSection(title, stepNumber) {
  const stepText = stepNumber ? `STEP [0${stepNumber}/05] ` : '';
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

async function askQuestion(rl, query, defaultValue = '') {
  const defaultText = defaultValue ? `${C.dim}[${defaultValue}]${C.reset} ` : '';
  const answer = await rl.question(`${C.bold}${query}${C.reset} ${defaultText}`);
  return answer.trim() || defaultValue;
}

async function askPassword(rl, query, defaultValue = '') {
  const defaultText = defaultValue ? `${C.dim}[${defaultValue}]${C.reset} ` : '';
  const answer = await rl.question(`${C.bold}${query}${C.reset} ${defaultText}`);
  return answer.trim() || defaultValue;
}

function generateSecret(bytes = 32) {
  return crypto.randomBytes(bytes).toString('hex');
}

// -------------------------------------------------------------
// MAIN INSTALLER
// -------------------------------------------------------------
async function main() {
  clearScreen();
  printBanner();

  const rl = readline.createInterface({ input, output });

  try {
    // ---------------------------------------------------------
    // STEP 1: PREREQUISITES & ENVIRONMENT DETECTION
    // ---------------------------------------------------------
    printSection('Environment & Prerequisites Detection', 1);

    const platform = os.platform();
    const release = os.release();
    const nodeVersion = process.version;
    const dockerVersion = runCommand('docker --version');
    const composeVersion = runCommand('docker compose version') || runCommand('docker-compose --version');
    const pnpmVersion = runCommand('pnpm --version');
    const npmVersion = runCommand('npm --version');

    console.log(`  ${C.bold}OS Platform:${C.reset}       ${platform} (${release})`);
    console.log(`  ${C.bold}Node.js:${C.reset}           ${nodeVersion} ${C.green}✓${C.reset}`);
    console.log(`  ${C.bold}Package Manager:${C.reset}   ${pnpmVersion ? `pnpm v${pnpmVersion} ${C.green}✓${C.reset}` : `npm v${npmVersion} (pnpm recommended)`}`);
    console.log(`  ${C.bold}Docker Engine:${C.reset}     ${dockerVersion ? `${dockerVersion} ${C.green}✓${C.reset}` : `${C.yellow}Not found / Not in PATH (Optional if running bare-metal)${C.reset}`}`);
    console.log(`  ${C.bold}Docker Compose:${C.reset}    ${composeVersion ? `${composeVersion} ${C.green}✓${C.reset}` : `${C.yellow}Not found${C.reset}`}`);

    // ---------------------------------------------------------
    // STEP 2: NETWORK & SERVICE CONFIGURATION
    // ---------------------------------------------------------
    printSection('Startup & Network Parametrization', 2);
    console.log(C.dim + 'Configure host ports, URLs, and database parameters:' + C.reset);

    const apiPort = await askQuestion(rl, 'Backend API Port:', '3000');
    const frontendPort = await askQuestion(rl, 'Frontend Port:', '5173');
    const defaultApiUrl = `http://localhost:${apiPort}`;
    const apiUrl = await askQuestion(rl, 'Frontend VITE_API_URL (Use VPS public IP/Domain if remote):', defaultApiUrl);

    console.log('\n' + C.bold + '// DATABASE CONFIGURATION // (PostgreSQL)' + C.reset);
    const dbHost = await askQuestion(rl, 'Database Host (Use "localhost" or "db" for docker-compose):', 'localhost');
    const dbPort = await askQuestion(rl, 'Database Port:', '5432');
    const dbName = await askQuestion(rl, 'Database Name:', 'openrubberdocks');
    const dbUser = await askQuestion(rl, 'Database User:', 'postgres');
    const dbPassword = await askQuestion(rl, 'Database Password:', 'postgres');

    console.log('\n' + C.bold + '// SECURITY TOKENS //' + C.reset);
    const defaultAccessSecret = generateSecret(32);
    const defaultRefreshSecret = generateSecret(32);
    console.log(C.dim + 'Auto-generating 256-bit cryptographically secure JWT secrets...' + C.reset);
    const jwtAccessSecret = await askQuestion(rl, 'JWT Access Secret (or press enter for generated):', defaultAccessSecret);
    const jwtRefreshSecret = await askQuestion(rl, 'JWT Refresh Secret (or press enter for generated):', defaultRefreshSecret);

    // ---------------------------------------------------------
    // STEP 3: CORE ADMINISTRATOR PROVISIONING
    // ---------------------------------------------------------
    printSection('Core Administrator Provisioning', 3);
    console.log(C.dim + 'The coreAdmin user has supreme platform privileges and bypasses all scopes.' + C.reset);

    const coreUsername = await askQuestion(rl, 'Core Admin Display Name:', 'Core Administrator');
    const coreHandle = await askQuestion(rl, 'Core Admin Handle (login handle):', 'coreadmin');
    const defaultCorePass = 'AdminPass_' + crypto.randomBytes(4).toString('hex') + '!';
    const corePassword = await askPassword(rl, 'Core Admin Password (or enter for auto-generated):', defaultCorePass);

    // ---------------------------------------------------------
    // STEP 4: CONTEMPORARY BRUTALIST THEME CUSTOMIZATION
    // ---------------------------------------------------------
    printSection('Brutalist Theme & Color Customization', 4);
    console.log(C.dim + 'Select a color palette for the flat contemporary brutalist UI:' + C.reset);
    console.log(`  ${C.bold}[1] Classic Monochrome Wireframe${C.reset} (Pure Stark Black & White #000000 / #FFFFFF)`);
    console.log(`  ${C.bold}[2] Studio "BRUT." Yellow & Vermillion${C.reset} (Electric Yellow #FFE600 & Red #FF3B30 - Reference Studio Style)`);
    console.log(`  ${C.bold}[3] High-Voltage Cyber Orange${C.reset} (International Orange #FF5522 & Black)`);
    console.log(`  ${C.bold}[4] Custom Palette${C.reset} (Manually specify hex codes)`);

    const themeChoice = await askQuestion(rl, 'Select Theme Palette [1-4]:', '2');

    let customColors = null;

    if (themeChoice === '1') {
      // Default monochrome
      customColors = null; // Will use defaultColors cleanly
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
      const secColor = await askQuestion(rl, 'Secondary Accent Hex:', '#FFE600');
      const accentRed = await askQuestion(rl, 'Alert / Number Highlight Hex:', '#FF3B30');
      customColors = {
        primary: { main: '#000000', contrastText: '#FFFFFF' },
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
    printSection('Configuration Files Generation', 5);

    // 1. Backend .env
    const backendEnvPath = path.join(__dirname, 'backend', '.env');
    const backendEnvContent = `# OpenRubberDocks - Generated Backend Environment Configuration
NODE_ENV=development
PORT=${apiPort}
DB_HOST=${dbHost}
DB_PORT=${dbPort}
DB_USER=${dbUser}
DB_PASSWORD=${dbPassword}
DB_NAME=${dbName}
DB_SYNCHRONIZE=true

# Security / Hashing
JWT_ACCESS_SECRET=${jwtAccessSecret}
JWT_REFRESH_SECRET=${jwtRefreshSecret}
BCRYPT_SALT_ROUNDS=12

# Core Administrator Initial Seed Credentials
CORE_ADMIN_USERNAME=${coreUsername}
CORE_ADMIN_HANDLE=${coreHandle}
CORE_ADMIN_PASSWORD=${corePassword}
`;

    fs.writeFileSync(backendEnvPath, backendEnvContent, 'utf-8');
    console.log(`  ${C.green}✓${C.reset} Generated ${C.bold}backend/.env${C.reset}`);

    // 2. Frontend .env
    const frontendEnvPath = path.join(__dirname, 'frontend', '.env');
    const frontendEnvContent = `# OpenRubberDocks - Generated Frontend Environment Configuration
VITE_API_URL=${apiUrl}
`;
    fs.writeFileSync(frontendEnvPath, frontendEnvContent, 'utf-8');
    console.log(`  ${C.green}✓${C.reset} Generated ${C.bold}frontend/.env${C.reset}`);

    // 3. Frontend custom theme colors.ts (git-ignored)
    const frontendColorsPath = path.join(__dirname, 'frontend', 'src', 'core', 'theme', 'colors.ts');
    if (customColors) {
      const colorsContent = `import type { ThemeColors } from './colors.interface';

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
    // STEP 6: AUTOMATED DATABASE & SEEDERS EXECUTION
    // ---------------------------------------------------------
    console.log('\n' + C.bold + C.inverse + ' DATABASE INITIALIZATION & SEEDERS ' + C.reset);
    console.log(C.dim + '─'.repeat(77) + C.reset);
    console.log(`  ${C.bold}[1] Start PostgreSQL via Docker Compose & run migrations + seeders automatically${C.reset}`);
    console.log(`  ${C.bold}[2] Run migrations + seeders on already active database (${dbHost}:${dbPort})${C.reset}`);
    console.log(`  ${C.bold}[3] Skip database execution (files generated only)${C.reset}`);

    const dbChoice = await askQuestion(rl, 'Select Database Execution Option [1-3]:', '1');

    if (dbChoice === '1') {
      console.log('\n' + C.cyan + '[1/3] Starting database container with docker compose...' + C.reset);
      try {
        execSync('docker compose up -d db', { cwd: __dirname, stdio: 'inherit' });
        console.log(C.green + '✓ PostgreSQL container launched successfully.' + C.reset);
        
        console.log(C.cyan + '[2/3] Waiting 6 seconds for database socket to initialize...' + C.reset);
        await new Promise((resolve) => setTimeout(resolve, 6000));

        console.log(C.cyan + '[3/3] Running seeders (Permissions, Roles, and CoreAdmin)...' + C.reset);
        const pkgManager = pnpmVersion ? 'pnpm' : 'npm';
        execSync(`${pkgManager} run seed:run`, { cwd: path.join(__dirname, 'backend'), stdio: 'inherit' });
        console.log(C.green + C.bold + '✓ Database seeded successfully!' + C.reset);
      } catch (err) {
        console.log(C.red + '✕ Automatic database/seed run encountered an issue:' + C.reset, err.message);
        console.log(C.yellow + 'You can manually run seeds anytime with: cd backend && pnpm run seed:run' + C.reset);
      }
    } else if (dbChoice === '2') {
      console.log('\n' + C.cyan + 'Running seeders on host ' + dbHost + '...' + C.reset);
      try {
        const pkgManager = pnpmVersion ? 'pnpm' : 'npm';
        execSync(`${pkgManager} run seed:run`, { cwd: path.join(__dirname, 'backend'), stdio: 'inherit' });
        console.log(C.green + C.bold + '✓ Database seeded successfully!' + C.reset);
      } catch (err) {
        console.log(C.red + '✕ Seeder execution failed:' + C.reset, err.message);
        console.log(C.yellow + 'Check your database connection and run: cd backend && pnpm run seed:run' + C.reset);
      }
    } else {
      console.log(C.yellow + 'Database initialization skipped. You can run seeders later with "pnpm run seed:run".' + C.reset);
    }

    // ---------------------------------------------------------
    // STEP 7: INSTALLATION SUMMARY & NEXT STEPS
    // ---------------------------------------------------------
    console.log('\n' + C.bold + C.green + `
┌─────────────────────────────────────────────────────────────────────────────┐
│                      INSTALLATION COMPLETED SUCCESSFULLY                    │
└─────────────────────────────────────────────────────────────────────────────┘` + C.reset);

    console.log(C.bold + 'System Provisioning Summary:' + C.reset);
    console.log(`  • ${C.bold}API Endpoint:${C.reset}        http://localhost:${apiPort} (Configured for ${apiUrl})`);
    console.log(`  • ${C.bold}Database Host:${C.reset}       ${dbHost}:${dbPort}/${dbName}`);
    console.log(`  • ${C.bold}Core Admin Handle:${C.reset}   ${C.cyan}${coreHandle}${C.reset}`);
    console.log(`  • ${C.bold}Core Admin Password:${C.reset} ${C.yellow}${corePassword}${C.reset}`);
    console.log(`  • ${C.bold}Brutalist Theme:${C.reset}     ${customColors ? 'Custom Studio Accents Active' : 'Classic Monochrome Active'}`);

    console.log('\n' + C.bold + 'Next Steps to Launch:' + C.reset);
    console.log(`  ${C.dim}1. Development Mode (Hybrid / Local):${C.reset}`);
    console.log(`     cd backend && pnpm run start:dev`);
    console.log(`     cd frontend && pnpm run dev`);
    console.log(`  ${C.dim}2. Full Production Deployment with Docker:${C.reset}`);
    console.log(`     docker compose up -d --build`);

    console.log('\n' + C.bold + C.inverse + ' SYSTEM READY // HAPPY CODING ' + C.reset + '\n');
  } catch (err) {
    console.error(C.red + '\nInstallation wizard aborted or error occurred:' + C.reset, err);
  } finally {
    rl.close();
  }
}

main();

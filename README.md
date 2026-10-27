<p align="center">
  <img src="docs/assets/openrubberdocs.svg" alt="OpenRubberDocks Logo" width="160" height="160" />
</p>

<h1 align="center">OpenRubberDocks</h1>

<p align="center">
  <strong>Plataforma moderna y auto-alojada de gestión de proyectos y documentación técnica para desarrolladores</strong><br>
  Construida con <em>NestJS</em>, <em>TypeORM</em>, <em>PostgreSQL</em>, <em>React 19</em> y un sistema de diseño <em>Digital Brutalista Contemporáneo</em>.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Version-v0.0.9%20%22Curious%20Momotus%22-FF5522.svg" alt="Version: v0.0.9 Curious Momotus">
  <a href="LICENSE.md"><img src="https://img.shields.io/badge/License-GNU%20AGPLv3-yellow.svg" alt="License: AGPLv3"></a>
  <img src="https://img.shields.io/badge/Node.js-v20+-green.svg" alt="Node Version">
  <img src="https://img.shields.io/badge/Docker-Ready-blue.svg" alt="Docker">
  <img src="https://img.shields.io/badge/Architecture-DDD%20%2F%20JSON%3AAPI-black.svg" alt="Architecture">
</p>

---

## ⚡ 1. Instalación Rápida con Asistente Interactivo

OpenRubberDocks incluye un instalador interactivo por consola que automatiza:
- Detección de requisitos (Node.js, Docker, Compose, Git).
- Generación de claves criptográficas JWT de 256 bits.
- Creación del usuario supremo inicial (**Core Administrator**).
- Personalización de la paleta de colores digital brutalista (genera `frontend/src/core/theme/colors.ts`).
- Protección de red (PostgreSQL aislado estrictamente en `127.0.0.1` para que Docker no se salte tu firewall `ufw`/`iptables`).
- Descarga de dependencias, compilación e inicialización de la base de datos con migraciones y roles RBAC.

### En Linux / macOS / VPS:
```bash
git clone https://github.com/tu-usuario/openrubberdocks.git
cd openrubberdocks
chmod +x install.sh
./install.sh
```

### En Windows (PowerShell / CMD):
```cmd
git clone https://github.com/tu-usuario/openrubberdocks.git
cd openrubberdocks
install.bat
```

> **Nota para VPS:** Durante el asistente, si vas a utilizar un Reverse Proxy (Caddy o Nginx), selecciona el modo de enlace seguro **`127.0.0.1`**. De esta manera tus puertos quedan resguardados localmente en el servidor.

---

## 🌐 2. Configurar Dominios y CORS sin Tocar Código

Si despliegas en un VPS o cambias de dominio/IP, el usuario no necesita abrir archivos ni editar código fuente para permitir la conexión entre Frontend y Backend.

Ejecuta el configurador dedicado:
```bash
./install.sh --cors
# En Windows: install.bat --cors
```

El asistente te solicitará:
1. **Dominios permitidos (CORS / Frontend)**: Por ejemplo `https://app.tudominio.com` o varios separados por coma `https://app.tudominio.com, http://localhost:5173`. *(Corrige automáticamente barras al final y asigna `https://` si lo olvidas)*.
2. **Dirección pública de la API**: Por ejemplo `https://api.tudominio.com`.
3. Te preguntará si deseas aplicar los cambios reiniciando los contenedores de Docker de inmediato.

---

## 🔄 3. Actualizar el Software desde `main` (Cero Preocupaciones)

Para descargar nuevas actualizaciones del repositorio oficial sin perder tus contraseñas, secretos JWT, base de datos ni tu paleta de colores personalizada:

```bash
./install.sh --update
# En Windows: install.bat --update
```

**¿Qué hace automáticamente?**
1. Respalda en memoria tus archivos de entorno (`.env`, `backend/.env`, `frontend/.env`) y tu archivo de tema `colors.ts`.
2. Guarda cambios locales con `git stash` y descarga las novedades con `git pull origin main`.
3. Sincroniza y rellena nuevas variables de entorno que requieran las versiones más recientes.
4. Reinstala paquetes con `pnpm`, compila Backend y Frontend, y ejecuta migraciones y seeders de la base de datos.
5. Reconstruye y levanta los contenedores en Docker si estaban corriendo.

---

## 🔒 4. Despliegue en VPS: Dominios y Certificados SSL (Let's Encrypt)

Para producción en un VPS con IP pública, OpenRubberDocks se ejecuta escuchando en `127.0.0.1`:
- **Backend API**: `127.0.0.1:3000`
- **Frontend SPA (Nginx en Docker o Vite)**: `127.0.0.1:5173`
- **PostgreSQL**: `127.0.0.1:5432` *(bloqueado a internet)*

Configura un Reverse Proxy para recibir el tráfico en los puertos públicos **80** (HTTP) y **443** (HTTPS) y emitir certificados SSL automáticos. Elige la opción que prefieras:

```
[ Internet (HTTPS :443) ]
           │
           ▼
[ Reverse Proxy (Caddy o Nginx) ] ── (Manejo de SSL Let's Encrypt)
           │
    ┌──────┴─────────────────────────┐
    ▼                                ▼
[ Frontend ] (127.0.0.1:5173)   [ Backend API ] (127.0.0.1:3000)
                                     │
                                     ▼
                                [ PostgreSQL ] (127.0.0.1:5432)
```

---

### Opción A: Con Caddy (Recomendada — SSL 100% Automático)

[Caddy](https://caddyserver.com/) gestiona, solicita y renueva certificados SSL automáticamente sin herramientas adicionales ni cronjobs.

#### 1. Instalar Caddy:
```bash
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install caddy
```

#### 2. Editar el archivo `/etc/caddy/Caddyfile`:
```bash
sudo nano /etc/caddy/Caddyfile
```

Añade la configuración para tus subdominios:
```caddy
# Frontend (Web / Panel de Usuario)
app.tudominio.com {
    reverse_proxy 127.0.0.1:5173
}

# Backend (API REST / Model Context Protocol)
api.tudominio.com {
    reverse_proxy 127.0.0.1:3000
}
```

#### 3. Recargar Caddy:
```bash
sudo systemctl reload caddy
```
*Caddy detectará los dominios, obtendrá los certificados TLS de Let's Encrypt o ZeroSSL y los mantendrá renovados automáticamente.*

---

### Opción B: Con Nginx + Certbot (Estándar Tradicional)

Si tu servidor ya utiliza Nginx o prefieres el ecosistema de Certbot:

#### 1. Instalar Nginx y Certbot:
```bash
sudo apt update
sudo apt install -y nginx certbot python3-certbot-nginx
```

#### 2. Crear archivo de configuración para OpenRubberDocks:
```bash
sudo nano /etc/nginx/sites-available/openrubberdocks
```

Pega la siguiente configuración:
```nginx
# Frontend: app.tudominio.com
server {
    server_name app.tudominio.com;

    location / {
        proxy_pass http://127.0.0.1:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Backend API: api.tudominio.com
server {
    server_name api.tudominio.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### 3. Habilitar el sitio y verificar sintaxis:
```bash
sudo ln -s /etc/nginx/sites-available/openrubberdocks /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### 4. Generar certificados SSL con Certbot:
```bash
sudo certbot --nginx -d app.tudominio.com -d api.tudominio.com
```
*Certbot configurará las redirecciones HTTPS y programará la renovación automática en el sistema.*

---

### 🛡️ Configuración del Firewall del VPS (UFW)

Para máxima seguridad, cierra todos los accesos directos y permite únicamente tráfico web y SSH:
```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

> **Por qué esto es seguro:** Gracias a que en `docker-compose.yml` los servicios están configurados con `127.0.0.1`, Docker **no inserta reglas en `iptables` que anulen tu firewall UFW**, manteniendo la base de datos protegida contra accesos externos.

---

## 💻 5. Modos de Ejecución

### Modo A: Despliegue Completo con Docker (Producción)
Levanta la base de datos PostgreSQL, la API de NestJS y el Frontend servido por Nginx en contenedores aislados:
```bash
docker compose --profile full up -d --build
```

### Modo B: Flujo Híbrido (Desarrollo Frontend)
Levanta la base de datos y la API en Docker, mientras ejecutas el Frontend localmente con Hot-Reload (Vite):
```bash
# 1. Iniciar DB y API en Docker
docker compose up -d

# 2. Iniciar Frontend local
cd frontend
pnpm install
pnpm run dev
```

### Comandos de Utilidad:
- **Ver logs del backend en tiempo real**: `docker compose logs -f backend`
- **Ver estado de los contenedores**: `docker compose ps`
- **Detener servicios sin borrar datos**: `docker compose stop`
- **Ejecutar seeders de roles y permisos manualmente**: `docker compose exec backend pnpm run seed:run`

---

## 📚 Documentación Técnica Detallada

- **[Guía del Sistema de Permisos y RBAC](docs/permissions-system-guide.md)**: Explicación de los roles contextuales y tipos de usuario (`coreAdmin`, `internal`, `external`).
- **[Guía de Despliegue y Seguridad Docker](docs/docker-deployment.md)**: Arquitectura de red, volúmenes y mitigación de exposición en `iptables`.
- **[Consumo de API en Frontend](frontend/docs/api-consumption.md)**: Flujo desacoplado en 4 capas (*Repositories -> Services -> Hooks -> Components*).
- **[Guía del Tema Digital Brutalista](frontend/docs/theme-guide.md)**: Reglas visuales, tipografía monoespaciada y personalización de `colors.ts`.
- **[Consumo de Autenticación](docs/auth-consumption-guide.md)**: Manejo de cookies `httpOnly` y rotación silenciosa de tokens JWT.
- **[Integración de Agentes MCP](docs/mcp-agent-integration.md)**: Conexión de herramientas y modelos de IA mediante Model Context Protocol.

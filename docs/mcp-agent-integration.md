# Integración de Agentes de IA vía MCP (Model Context Protocol)

OpenRubberDocks incluye un servidor **Model Context Protocol (MCP)** nativo sobre transporte **HTTP/SSE (Server-Sent Events)**. Esto permite conectar agentes de inteligencia artificial como **Cursor**, **Claude Desktop**, **Windsurf**, o agentes autónomos personalizados desplegados en un VPS o en máquinas locales.

---

## 1. Arquitectura y Seguridad

- **Transporte HTTP/SSE**:
  - `GET /mcp/sse`: Establece el túnel SSE unidireccional y asigna un `sessionId`.
  - `POST /mcp/messages?sessionId=<id>`: Recibe las peticiones JSON-RPC del cliente MCP.
- **Autenticación mediante Personal Access Tokens (PAT)**:
  - Los agentes se autentican mediante tokens seguros generados para un usuario específico: `ord_live_<hash>`.
  - El token se puede enviar mediante:
    - Encabezado HTTP: `Authorization: Bearer ord_live_...`
    - Encabezado HTTP: `x-api-key: ord_live_...`
    - Parámetro de consulta: `?token=ord_live_...` (ideal para clientes SSE que no permiten personalizar encabezados).
- **Cumplimiento Estricto de Scoped RBAC**:
  - **`coreAdmin`**: Acceso total y global a todos los workspaces y proyectos.
  - **`internal`**: Acceso y mutación acotados a los workspaces y proyectos donde el usuario tiene permisos.
  - **`external`**: **Engine-Level Mutation Lock**. Los usuarios externos sólo pueden realizar consultas de lectura. Cualquier intento del agente de crear tareas, modificar estados o registrar tiempos es bloqueado a nivel del motor.

---

## 2. Activación en el VPS

En el archivo de variables de entorno del backend (`backend/.env` o en `docker-compose.yml`):

```env
# Habilitar servidor MCP
ENABLE_MCP=true
MCP_BASE_PATH=/mcp
```

Si ejecutas las migraciones para añadir la tabla `api_keys`:

```bash
# En el VPS vía Docker Compose:
docker compose exec backend pnpm run migration:run

# O en entorno local:
cd backend
pnpm run migration:run
```

---

## 3. Generación de API Keys (PAT)

### Opción A: Vía CLI en el VPS (Recomendado para Administradores)
Ejecuta el comando `create-api-key` indicando el handle del usuario y un nombre descriptivo para el agente:

```bash
# Vía Docker:
docker compose exec backend pnpm run command:api-key:create admin "CursorVPSAgent" 30

# Vía local en backend/:
pnpm run command:api-key:create admin "CursorVPSAgent" 30
```

*Salida esperada:*
```text
======================================================
🤖 AI AGENT API KEY (PAT) GENERATED SUCCESSFULLY
======================================================
User:         @admin (coreAdmin)
Key Name:     CursorVPSAgent
Key Prefix:   ord_live_7a8b
Expires At:   2026-11-25T17:00:00.000Z
API Token:    ord_live_7a8b9c...
======================================================
⚠️  Store this token securely! It cannot be retrieved again.
```

### Opción B: Vía API REST (JSON:API)
Con una sesión iniciada en la plataforma:

- **Crear token**: `POST /api/v1/api-keys`
  ```json
  {
    "data": {
      "type": "api-keys",
      "attributes": {
        "name": "Cursor Agent",
        "expiresInDays": 30
      }
    }
  }
  ```
- **Listar tokens del usuario**: `GET /api/v1/api-keys`
- **Revocar token**: `PATCH /api/v1/api-keys/:uuid/revoke`
- **Eliminar token**: `DELETE /api/v1/api-keys/:uuid`

---

## 4. Configuración del Reverse Proxy en el VPS (Nginx / Caddy)

El transporte SSE requiere que el proxy inverso mantenga la conexión viva y **desactive el almacenamiento en búfer (`buffering`)**.

### Snippet para Nginx:
```nginx
location /mcp/ {
    proxy_pass http://127.0.0.1:3000/mcp/;
    proxy_http_version 1.1;
    proxy_set_header Connection '';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;

    # Imprescindible para Server-Sent Events (SSE)
    proxy_buffering off;
    proxy_cache off;
    proxy_read_timeout 24h;
    proxy_send_timeout 24h;
}
```

### Snippet para Caddy:
```caddy
reverse_proxy /mcp/* http://127.0.0.1:3000 {
    transport http {
        keepalive 300s
    }
}
```

---

## 5. Configuración de Clientes de IA

### A. Cursor (`.cursor/mcp.json` o Settings > Features > MCP)
Para conectar Cursor a tu OpenRubberDocks desplegado en tu VPS:

```json
{
  "mcpServers": {
    "openrubberdocks": {
      "url": "https://tu-dominio.com/mcp/sse",
      "headers": {
        "Authorization": "Bearer ord_live_tu_token_aqui"
      }
    }
  }
}
```

*(O utilizando el query param: `"url": "https://tu-dominio.com/mcp/sse?token=ord_live_tu_token_aqui"`)*

### B. Claude Desktop (`claude_desktop_config.json`)
Si utilizas el proxy SSE de MCP (`mcp-remote` o `sse-client`):

```json
{
  "mcpServers": {
    "openrubberdocks": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://tu-dominio.com/mcp/sse",
        "--header",
        "Authorization: Bearer ord_live_tu_token_aqui"
      ]
    }
  }
}
```

---

## 6. Herramientas MCP Disponibles (MCP Tools)

| Herramienta | Descripción | Parámetros | Restricción RBAC |
| :--- | :--- | :--- | :--- |
| `ord_list_workspaces` | Lista todos los workspaces accesibles por el usuario autenticado. | Ninguno | Scoped por usuario |
| `ord_list_projects` | Lista todos los proyectos dentro de un workspace específico. | `workspaceUuid` (requerido) | Requiere `canViewProjects` |
| `ord_list_tasks` | Lista las tareas dentro de un proyecto con sus estados y responsables. | `projectUuid` (requerido) | Requiere `canViewProjects` |
| `ord_get_task_details` | Consulta descripción, propiedades, subtareas y logs de tiempo de una tarea. | `taskUuid` (requerido) | Requiere `canViewProjects` |
| `ord_create_task` | Crea una nueva tarea en un proyecto. | `projectUuid`, `title`, `description?`, `statusUuid?`, `typeUuid?`, `dueDate?`, `estimatedMinutes?` | **Bloqueado para `external`** |
| `ord_update_task` | Actualiza título, descripción, fechas, estimación o estado de una tarea. | `taskUuid`, `title?`, `description?`, `statusUuid?`, `typeUuid?`, `dueDate?` | **Bloqueado para `external`** |
| `ord_log_task_time` | Registra tiempo trabajado (en minutos) en una tarea. | `taskUuid`, `minutes`, `description?`, `date?` | **Bloqueado para `external`** |

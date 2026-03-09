# WAHA — WhatsApp Hybrid Automation

**WAHA** is a **WhatsApp Gateway** platform built with a **hybrid architecture**, supporting multiple functions: device/session management (including QR in the dashboard), single message sending, queued broadcasts (with rate limiting), AI-based auto-reply webhooks (OpenAI/Gemini), and a REST API plus dashboard on top.

## Architecture

```text
Dashboard (Next.js :3001)
        │
        ▼
   API Gateway (Node :3000)
        │
        ├──► WWebJS Engine (Node :8090)  ← WhatsApp session (whatsapp-web.js)
        └──► Redis (optional, for broadcast/queue)
```

- **wwebjs-engine** — WhatsApp engine (QR, send messages). Stores WhatsApp login sessions locally.
- **api-gateway** — REST API (devices, messages, broadcast, webhook). Uses a local SQLite database under the `data/` folder.
- **dashboard** — UI: Device Management, Chat, Broadcast, Analytics. Proxies API calls via Next.js rewrites to `:3000`.

## Requirements

- Node.js 18+
- Redis (for broadcast/queue features; run `redis-server` or use Docker)
- (Optional) Chrome/Chromium — for whatsapp-web.js; you can set `CHROME_PATH` if needed

## How to Run (development)

### 1. WWebJS Engine (port 8090)

```bash
cd wwebjs-engine
npm install
node server.js
```

- First time: you need to scan a QR code. Open the dashboard → Device Management → Add Device → Connect / QR, then scan with WhatsApp.
- Session is stored in `.wwebjs_auth` (project root). After the first login, the engine will auto-connect.

### 2. API Gateway (port 3000)

```bash
cd api-gateway
npm install
ENGINE_URL=http://localhost:8090 REDIS_URL=redis://localhost:6379 node server.js
```

- `ENGINE_URL` must point to the engine (default `http://localhost:8090`).
- `REDIS_URL` points to Redis for broadcast/queue (default `redis://localhost:6379`).

### 3. Dashboard (port 3001)

```bash
cd dashboard
npm install
npm run dev
```

Open: **http://localhost:3001**

### 4. Redis (for broadcast)

```bash
redis-server
# or: docker run -d -p 6379:6379 redis:7
```

## Environment Variables

| Variable        | Used in       | Default                  | Description                          |
|-----------------|---------------|--------------------------|--------------------------------------|
| `ENGINE_URL`    | api-gateway   | `http://localhost:8090`  | WWebJS engine URL                    |
| `REDIS_URL`     | api-gateway   | `redis://localhost:6379` | Redis URL (broadcast/queue)         |
| `PORT`          | api-gateway   | `3000`                   | API port                             |
| `WWEBJS_PORT`   | wwebjs-engine | `8090`                   | Engine port                          |
| `OPENAI_API_KEY`| api-gateway   | -                        | For AI auto-reply (optional)        |
| `GEMINI_API_KEY`| api-gateway   | -                        | Alternative AI provider (optional)  |
| `AI_PROVIDER`   | api-gateway   | `openai`                 | `openai` or `gemini`                |
| `JWT_SECRET`    | api-gateway   | (internal dev default)   | Secret for JWT; must be set in prod |

## API Endpoints (via api-gateway :3000)

| Method | Path | Description |
|--------|------|-------------|
| GET    | `/` | Health check |
| GET    | `/devices` | List devices (WWebJS: single logical device `default`) |
| POST   | `/devices` | Add device (body: `{ \"deviceId\": \"default\" }`) |
| DELETE | `/devices/:deviceId` | Delete device (logical) |
| POST   | `/devices/:deviceId/connect` | Get QR code for scanning |
| GET    | `/devices/:deviceId/status` | Device status |
| POST   | `/messages/send` | Send message (body: `deviceId`, `to`, `text`) |
| POST   | `/engine/send` | Alias for send message |
| POST   | `/broadcast/campaign` | Broadcast (body: `deviceId`, `text`, `recipients[]`) |
| GET    | `/broadcast/job/:jobId` | Broadcast job status |
| POST   | `/webhook/incoming` | AI auto-reply hook (body: `deviceId`, `from`, `text`) |
| POST   | `/auth/register` | Register user (body: `name`, `email`, `password`) |
| POST   | `/auth/login` | Login (body: `email`, `password`) → `{ token, user }` |
| GET    | `/auth/me`    | Current user (header: `Authorization: Bearer <token>`) |

## Dashboard

- **Overview** — `/dashboard`
- **Device Management** — `/dashboard/devices` (add device, show QR, connect, delete)
- **Chat** — `/dashboard/chat` (send a single message)
- **Broadcast** — `/dashboard/broadcast` (campaign + check job status)
- **Analytics** — `/dashboard/analytics` (connected devices stats & placeholders)
- **Login** — `/login` (email + password, token stored in `localStorage`)

The dashboard calls the API through a rewrite `/api/*` → `http://localhost:3000/*` (or `API_GATEWAY_URL` in Docker). Make sure the API gateway is running when using the dashboard.

## Authentication

- **Register:** `POST /auth/register` with `{ name, email, password }`.
- **Login:** `POST /auth/login` with `{ email, password }` → response contains a `token` (JWT) and `user`. Set `JWT_SECRET` in the api-gateway environment for production.
- **Protected dashboard:** without a valid token (or if `GET /auth/me` returns 401), users are redirected to `/login`. The **Logout** button in the sidebar clears the token and redirects to `/login`.

## Important Files & Folders

| Path/folder | General description |
|-------------|---------------------|
| `.wwebjs_auth/` | Local WhatsApp session storage (do not commit to git, do not share) |
| `data/` | Local database storage for the API |
| `dump.rdb` | Redis persistence file (if Redis is configured to persist to disk) |
| `wwebjs-engine/` | WhatsApp engine code |
| `api-gateway/` | REST API code |
| `dashboard/` | Next.js dashboard code |

## Build (dashboard, production)

```bash
cd dashboard
npm run build
npm run start   # listen :3001
```

## Quick commands (development)

```bash
# Terminal 1 — Engine
cd wwebjs-engine && node server.js

# Terminal 2 — API
cd api-gateway && ENGINE_URL=http://localhost:8090 REDIS_URL=redis://localhost:6379 node server.js

# Terminal 3 — Dashboard
cd dashboard && npm run dev

# (Optional) Terminal 4 — Redis
redis-server
```

Then open **http://localhost:3001**, go to Device Management, Add Device → Connect / QR, and scan the QR with WhatsApp.

## Run with Docker

```bash
# Build and start all services
docker compose up -d --build

# Logs
docker compose logs -f wwebjs-engine
```

- **Redis** — port 6379  
- **WWebJS Engine** — port 8090 (session stored in `wwebjs_auth` volume)  
- **API Gateway** — port 3000  
- **Dashboard** — port 3001  

First time: open http://localhost:3001/dashboard/devices, Add Device → Connect / QR, scan the QR. To register a new user, use the `POST /auth/register` endpoint on the API gateway, then log in via the dashboard.


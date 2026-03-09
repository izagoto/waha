# WAHA — WhatsApp Gateway

**WAHA** adalah platform **WhatsApp Gateway** yang dibangun dengan arsitektur **hybrid** dan mendukung banyak fungsi: pengelolaan device/session (termasuk QR di dashboard), kirim pesan tunggal, broadcast berqueue (rate limit), webhook untuk auto-reply berbasis AI (OpenAI/Gemini), serta REST API dan dashboard untuk mengoperasikan semuanya.

## Arsitektur

```
Dashboard (Next.js :3001)
        │
        ▼
   API Gateway (Node :3000)
        │
        ├──► WWebJS Engine (Node :8090)  ← WhatsApp session (whatsapp-web.js)
        └──► Redis (optional, untuk broadcast/queue)
```

- **wwebjs-engine** — Engine WhatsApp (QR, kirim pesan). Menyimpan sesi login WhatsApp secara lokal.
- **api-gateway** — REST API (devices, messages, broadcast, webhook). Menggunakan database SQLite lokal di folder `data/`.
- **dashboard** — UI: Device Management, Chat, Broadcast. Proxy API lewat Next.js rewrites ke `:3000`.

## Prasyarat

- Node.js 18+
- Redis (untuk fitur broadcast/queue; jalankan `redis-server` atau Docker)
- (Opsional) Chrome/Chromium — untuk whatsapp-web.js; bisa set `CHROME_PATH` jika perlu

## Cara Menjalankan

### 1. WWebJS Engine (port 8090)

```bash
cd wwebjs-engine
npm install
node server.js
```

- Pertama kali: butuh scan QR. Buka dashboard → Device Management → Add Device → Connect / QR, lalu scan.
- Session tersimpan di `.wwebjs_auth` (root project). Setelah sekali login, berikutnya auto connect.

### 2. API Gateway (port 3000)

```bash
cd api-gateway
npm install
ENGINE_URL=http://localhost:8090 REDIS_URL=redis://localhost:6379 node server.js
```

- `ENGINE_URL` wajib mengarah ke engine (default `http://localhost:8090`).
- `REDIS_URL` untuk broadcast/queue (default `redis://localhost:6379`).

### 3. Dashboard (port 3001)

```bash
cd dashboard
npm install
npm run dev
```

Buka: **http://localhost:3001**

### 4. Redis (untuk broadcast)

```bash
redis-server
# atau: docker run -d -p 6379:6379 redis:7
```

## Environment Variables

| Variabel        | Dipakai di    | Default                  | Keterangan                          |
|-----------------|---------------|--------------------------|-------------------------------------|
| `ENGINE_URL`    | api-gateway   | `http://localhost:8090`  | URL WWebJS engine                   |
| `REDIS_URL`     | api-gateway   | `redis://localhost:6379` | URL Redis (broadcast/queue)         |
| `PORT`          | api-gateway   | `3000`                   | Port API                            |
| `WWEBJS_PORT`   | wwebjs-engine | `8090`                   | Port engine                         |
| `OPENAI_API_KEY`| api-gateway   | -                        | Untuk AI auto-reply (opsional)      |
| `GEMINI_API_KEY`| api-gateway   | -                        | Alternatif AI (opsional)            |
| `AI_PROVIDER`   | api-gateway   | `openai`                 | `openai` atau `gemini`              |
| `JWT_SECRET`    | api-gateway   | (default internal)       | Rahasia untuk JWT; wajib di production |

## Endpoint API (via api-gateway :3000)

| Method | Path | Keterangan |
|--------|------|------------|
| GET    | `/` | Health |
| GET    | `/devices` | Daftar device (WWebJS: satu device `default`) |
| POST   | `/devices` | Add device (body: `{ "deviceId": "default" }`) |
| DELETE | `/devices/:deviceId` | Hapus device (logical) |
| POST   | `/devices/:deviceId/connect` | Ambil QR untuk scan |
| GET    | `/devices/:deviceId/status` | Status device |
| POST   | `/messages/send` | Kirim pesan (body: `deviceId`, `to`, `text`) |
| POST   | `/engine/send` | Alias kirim pesan |
| POST   | `/broadcast/campaign` | Broadcast (body: `deviceId`, `text`, `recipients[]`) |
| GET    | `/broadcast/job/:jobId` | Status job broadcast |
| POST   | `/webhook/incoming` | Auto-reply AI (body: `deviceId`, `from`, `text`) |
| POST   | `/auth/register` | Daftar user (body: `name`, `email`, `password`) |
| POST   | `/auth/login` | Login (body: `email`, `password`) → `{ token, user }` |
| GET    | `/auth/me`    | User saat ini (header: `Authorization: Bearer <token>`) |

## Dashboard

- **Overview** — `/dashboard`
- **Device Management** — `/dashboard/devices` (add device, tampil QR, connect, delete)
- **Chat** — `/dashboard/chat` (kirim satu pesan)
- **Broadcast** — `/dashboard/broadcast` (campaign + cek status job)
- **Analytics** — `/dashboard/analytics` (statistik device terhubung & placeholder pesan/broadcast)
- **Login** — `/login` (email + password, token disimpan di localStorage)

Dashboard memanggil API lewat rewrite `/api/*` → `http://localhost:3000/*`. Pastikan api-gateway jalan saat pakai dashboard.

## Autentikasi

- **Register:** `POST /auth/register` dengan `{ name, email, password }`.
- **Login:** `POST /auth/login` dengan `{ email, password }` → respons berisi `token` (JWT) dan `user`. Set `JWT_SECRET` di env api-gateway untuk production.
- **Dashboard** dilindungi: tanpa token valid (atau jika `GET /auth/me` mengembalikan 401), pengguna diarahkan ke `/login`. Tombol **Logout** di sidebar menghapus token dan mengarahkan ke `/login`.

## File & Folder Penting

| Path/folder | Keterangan umum |
|-------------|-----------------|
| `.wwebjs_auth/` | Penyimpanan sesi WhatsApp lokal (jangan commit ke git, jangan dibagikan) |
| `data/` | Penyimpanan database lokal untuk API |
| `dump.rdb` | File persistence Redis (jika Redis dikonfigurasi menyimpan ke disk) |
| `wwebjs-engine/` | Kode engine WhatsApp |
| `api-gateway/` | Kode REST API |
| `dashboard/` | Kode Next.js dashboard |

## Build production (dashboard)

```bash
cd dashboard
npm run build
npm run start   # listen :3001
```

## Ringkasan perintah (development)

```bash
# Terminal 1 — Engine
cd wwebjs-engine && node server.js

# Terminal 2 — API
cd api-gateway && ENGINE_URL=http://localhost:8090 REDIS_URL=redis://localhost:6379 node server.js

# Terminal 3 — Dashboard
cd dashboard && npm run dev

# (Opsional) Terminal 4 — Redis
redis-server
```

Lalu buka **http://localhost:3001**, masuk Device Management, Add Device → Connect / QR, scan dengan WhatsApp.

## Menjalankan dengan Docker

```bash
# Build dan jalankan semua service
docker compose up -d --build

# Log
docker compose logs -f wwebjs-engine
```

- **Redis** — port 6379  
- **WWebJS Engine** — port 8090 (session di volume `wwebjs_auth`)  
- **API Gateway** — port 3000  
- **Dashboard** — port 3001  

Pertama kali: buka http://localhost:3001/dashboard/devices, Add Device → Connect / QR, scan QR. Untuk register user baru gunakan endpoint `POST /auth/register` di API gateway, lalu login lewat dashboard.

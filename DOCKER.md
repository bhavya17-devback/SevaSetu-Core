# SevaSetu - Docker se deploy karna

Ek command se 3 containers chalte hain: **MongoDB**, **backend (API)** aur **frontend (website, nginx)**.

```
Browser ──> frontend (nginx :8080) ──/api──> backend (:5000, andar hi) ──> mongo (:27017, andar hi)
```

Backend aur MongoDB bahar se seedhe khule nahi hain; sirf website ka port (8080) khula hai.
Website khud `/api` ko backend ko forward karti hai, isliye CORS ki dikkat nahi aati.

## 1. Pehle ye chahiye
- **Docker Desktop** (Windows/Mac) ya Docker Engine + Compose plugin (Linux).
  Check: `docker --version` aur `docker compose version`

## 2. Files kahan rakhni hain
Is zip ki files apne project folder me copy karo, jahan `backend/` aur `sevasetu/` folders hain
(same folder structure, `backend/server.js` replace ho jayegi - usme sirf `TRUST_PROXY` ki 4 lines judi hain).

```
unityintern/
├── docker-compose.yml     <- naya
├── .env.example           <- naya
├── DOCKER.md              <- naya
├── backend/
│   ├── Dockerfile         <- naya
│   ├── .dockerignore      <- naya
│   └── server.js          <- updated
└── sevasetu/
    ├── Dockerfile         <- naya
    ├── nginx.conf         <- naya
    └── .dockerignore      <- naya
```

## 3. Settings (.env)
`docker-compose.yml` wale folder me:

```bash
cp .env.example .env        # Windows: copy .env.example .env
```

`.env` kholo aur ye badlo:
- `JWT_SECRET` - zaroori. Random string banao:
  - Mac/Linux/Git Bash: `openssl rand -hex 32`
  - Windows PowerShell: `-join ((1..32) | % { '{0:x2}' -f (Get-Random -Max 256) })`
- `MONGO_PASSWORD` - apna password (sirf letters + numbers, symbols mat lagana)
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` - pehla admin account yahi banega

## 4. Chalao
```bash
docker compose up -d --build
```
Pehli baar 3-5 minute lagte hain (images ban rahi hain). Status dekho: `docker compose ps`
(teeno `running`/`healthy` hone chahiye).

Pehli baar sirf ek baar admin + categories banao:
```bash
docker compose --profile seed run --rm seed
```

## 5. Use karo
- Website: **http://localhost:8080**
- Admin: **http://localhost:8080/admin/login** (`.env` wala ADMIN_EMAIL / ADMIN_PASSWORD)
- API health: http://localhost:8080/api/health
- **MongoDB Compass** se dekhne ke liye connection string:
  ```
  mongodb://sevasetu:ChangeMe123@localhost:27018/?authSource=admin
  ```
  (username/password wahi jo `.env` me MONGO_USER / MONGO_PASSWORD hai.
  Port 27018 isliye hai ki aapke computer par already chal rahe MongoDB (27017) se na takraye.)

## 6. Roz ke commands
| Kaam | Command |
|---|---|
| Logs dekhna | `docker compose logs -f backend` (ya `frontend`, `mongo`) |
| Band karna (data safe) | `docker compose down` |
| Dobara chalana | `docker compose up -d` |
| Code badalne ke baad update | `docker compose up -d --build` |
| **Sab data delete** | `docker compose down -v`  (database volume bhi ud jata hai!) |

## 7. Dhyan rakhne wali baatein
- **Docker wala database alag hai.** Jo data aapke local MongoDB me hai wo yahan nahi aata.
  Chaho to copy kar sakte ho:
  ```bash
  mongodump --db sevasetu --out ./dump
  docker compose cp ./dump mongo:/dump
  docker compose exec mongo mongorestore -u sevasetu -p ChangeMe123 --authenticationDatabase admin /dump
  ```
- `MONGO_USER` / `MONGO_PASSWORD` sirf **pehli baar** (jab volume banta hai) apply hote hain.
  Baad me badalne hain to `docker compose down -v` karna padega (data delete hoga).
- Frontend ka API address build ke time pe bandh jata hai (`/api`). Badalna ho to `--build` ke saath dobara chalao.
- Bina Docker ke local development pehle jaisa hi chalta hai (`npm run dev` / `npm start`), uske liye `backend/.env` aur `sevasetu/.env` wahi rehte hain.

## 8. Server (VPS) par deploy
1. Server par Docker install karo, project copy karo, upar ke step 3-4 karo.
2. `.env` me `WEB_PORT=80` aur `CLIENT_URL=http://<aapka-domain-ya-ip>`.
3. HTTPS ke liye in teeno ke aage ek reverse proxy lagao (Caddy / nginx + Let's Encrypt) jo `localhost:80` ko forward kare, aur `CLIENT_URL` ko `https://...` kar do.
4. Server ke firewall me sirf 80/443 (aur SSH) kholo. MongoDB ka port (27018) sirf `127.0.0.1` par bind hai, bahar se nahi dikhta.

## Dikkat aaye to
- **`set JWT_SECRET in .env`** error: `.env` file banayi nahi ya JWT_SECRET khaali hai.
- **Port 8080 busy**: `.env` me `WEB_PORT=8081` karke dobara `docker compose up -d`.
- **backend `unhealthy`**: `docker compose logs backend` dekho - aksar MongoDB password galat hota hai (upar wali "sirf pehli baar" baat).
- **Admin login nahi ho raha**: seed command chalaya ki nahi (step 4).

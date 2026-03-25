# V.Two Ops — Production Deployment Guide

**Phase 6: Tasks B1-B4**
**Last Updated:** 2026-03-24

---

## B1: Environment Configuration

### `.env.production` Template

```env
# Database — SQLite file path for Prisma
# In production, use an absolute path or a mounted volume path.
# For hosted Postgres (Railway, Render), replace with the provided connection string:
#   DATABASE_URL="postgresql://user:pass@host:5432/vtwo_ops"
DATABASE_URL="file:./prod.db"

# Runtime environment — must be "production" to enable:
#   - Secure session cookies (cookie.secure = true)
#   - Express trust proxy
#   - Minimized error output to clients
NODE_ENV=production

# Port the Express server listens on.
# Most hosting platforms inject this automatically via $PORT.
PORT=3001

# Session secret — signs the express-session cookie.
# MUST be a unique, random string (min 32 chars). Generate with:
#   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
SESSION_SECRET=<generate-secure-string>

# (Optional) Anthropic API key for the AI assistant feature.
# Only required if the /api/assistant endpoint is in use.
ANTHROPIC_API_KEY=<your-key>
```

### Variable Reference

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | Prisma connection string. SQLite (`file:./prod.db`) or Postgres URI. |
| `NODE_ENV` | Yes | Set to `production`. Controls secure cookies, error verbosity, and Express optimizations. |
| `PORT` | Yes | Server listen port. Most hosts auto-inject this; default `3001`. |
| `SESSION_SECRET` | Yes | Random hex string (>=32 chars) used to sign session cookies. Rotate periodically. |
| `ANTHROPIC_API_KEY` | No | Needed only for the AI assistant route (`/api/assistant`). |

### How to Set in Production

- **Railway / Render / Heroku:** Add each variable in the platform dashboard under "Environment Variables."
- **Docker:** Pass via `--env-file .env.production` or individual `-e` flags.
- **Bare metal / VM:** Export in the shell profile or use a process manager (pm2 ecosystem file, systemd EnvironmentFile).

---

## B2: Docker Setup

### Dockerfile

```dockerfile
# ----------------------------------------------------------
# Stage 1: Install dependencies and prepare the database
# ----------------------------------------------------------
FROM node:18-alpine AS build

WORKDIR /app

# Copy dependency manifests first for layer caching.
# Changes to source code won't bust the npm install cache.
COPY package*.json ./
COPY app/package*.json ./app/

# Copy Prisma schema so we can generate the client.
COPY prisma ./prisma

# Install ALL dependencies (dev included) — needed for "vite build".
RUN npm ci && cd app && npm ci

# Copy remaining source code.
COPY . .

# Generate Prisma client and push schema to the database file.
RUN npx prisma generate && npx prisma db push

# Build the React frontend (outputs to app/dist/).
RUN npm run build

# ----------------------------------------------------------
# Stage 2: Production-only image (smaller)
# ----------------------------------------------------------
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma

# Production-only deps (no vite, jest, etc.).
RUN npm ci --omit=dev && npx prisma generate

# Copy built frontend from the build stage.
COPY --from=build /app/app/dist ./app/dist

# Copy server source.
COPY server ./server

# The SQLite database lives in a volume (see below).
# Default port — override with PORT env var.
EXPOSE 3001

CMD ["node", "server/index.js"]
```

### Build the Image

```bash
docker build -t vtwo-ops:latest .
```

### Run the Container

```bash
docker run -d \
  --name vtwo-ops \
  -p 3001:3001 \
  --env-file .env.production \
  -v vtwo-ops-data:/app/prisma \
  vtwo-ops:latest
```

### Volume Mounts

| Mount | Container Path | Purpose |
|---|---|---|
| `vtwo-ops-data` | `/app/prisma` | Persists the SQLite `prod.db` file across container restarts and redeploys. Without this mount, data is lost when the container is removed. |

> **Tip:** If migrating to Postgres in production, the volume mount is unnecessary — the database lives on the remote server.

### Useful Commands

```bash
# View logs
docker logs -f vtwo-ops

# Open a shell inside the container
docker exec -it vtwo-ops sh

# Seed the database inside the running container
docker exec vtwo-ops node prisma/seed.js

# Stop and remove
docker stop vtwo-ops && docker rm vtwo-ops
```

---

## B3: Deployment Options Analysis

### Option 1: Railway.app (Recommended)

| Attribute | Detail |
|---|---|
| **Effort** | ~10 minutes |
| **GitHub integration** | Yes — auto-deploy on push to main |
| **Free tier** | Yes ($5 credit/month, enough for hobby use) |
| **Database** | Built-in Postgres plugin (swap `DATABASE_URL`) |
| **SSL** | Automatic |
| **Custom domain** | Supported |

**Steps:**
1. Create a Railway project and link the GitHub repo.
2. Add environment variables in the Railway dashboard (see B1).
3. Add the Postgres plugin; Railway auto-injects `DATABASE_URL`.
4. Set build command: `npm ci && cd app && npm ci && npm run build && npx prisma generate && npx prisma db push`
5. Set start command: `node server/index.js`
6. Deploy. Railway provisions, builds, and starts the service.

**Pros:** Fastest path to production. Single platform for app + database. Zero Docker knowledge needed.
**Cons:** Vendor lock-in. Limited free tier resources.

---

### Option 2: Vercel (Frontend) + Render (Backend)

| Attribute | Detail |
|---|---|
| **Effort** | ~30 minutes |
| **Frontend host** | Vercel — optimized for static/React builds |
| **Backend host** | Render — free tier web service with Postgres |
| **SSL** | Automatic on both |

**Steps:**
1. **Vercel:** Import the repo. Set root directory to `app/`. Build command: `npm run build`. Output: `dist/`.
2. **Vercel:** Set env var `VITE_API_URL` to the Render backend URL.
3. **Render:** Create a Web Service from the repo. Set build command: `npm ci && npx prisma generate && npx prisma db push`. Start command: `node server/index.js`.
4. **Render:** Add a Postgres database; Render injects `DATABASE_URL`.
5. **Render:** Add remaining env vars (`NODE_ENV`, `SESSION_SECRET`, etc.).
6. Update CORS in `server/index.js` to allow the Vercel frontend origin.

**Pros:** Best-in-class hosting for each layer. More granular scaling.
**Cons:** Two platforms to manage. Requires CORS coordination. Cold starts on Render free tier.

---

### Option 3: Docker Hub + Heroku

| Attribute | Detail |
|---|---|
| **Effort** | ~20 minutes |
| **Workflow** | Build image locally or in CI, push to Docker Hub, deploy to Heroku |
| **Database** | Heroku Postgres add-on |
| **SSL** | Automatic |

**Steps:**
1. Build and tag: `docker build -t yourdockerhub/vtwo-ops:latest .`
2. Push: `docker push yourdockerhub/vtwo-ops:latest`
3. Create Heroku app: `heroku create vtwo-ops-prod`
4. Add Postgres: `heroku addons:create heroku-postgresql:essential-0`
5. Set env vars: `heroku config:set SESSION_SECRET=... NODE_ENV=production`
6. Deploy container: `heroku container:push web && heroku container:release web`

**Pros:** Standard Docker workflow. Portable image. Established platform.
**Cons:** Heroku no longer has a free tier. More moving parts than Railway.

---

### Recommendation Summary

| Criteria | Railway | Vercel+Render | Docker+Heroku |
|---|---|---|---|
| Speed to deploy | 10 min | 30 min | 20 min |
| Cost (hobby) | Free | Free | ~$5/mo |
| Complexity | Low | Medium | Medium |
| Scalability | Good | Best | Good |
| Docker required | No | No | Yes |

**Default pick: Railway** for simplicity and speed. Switch to Vercel+Render if the frontend needs edge CDN performance, or Docker+Heroku if the team already has a Docker-based CI/CD pipeline.

---

## B4: Pre-Deployment Checklist

### Environment & Build

- [ ] `.env.production` created with all required variables
- [ ] `SESSION_SECRET` is a unique random string (>= 32 chars)
- [ ] `NODE_ENV` is set to `production`
- [ ] `DATABASE_URL` points to the production database
- [ ] `npm run build` completes without errors
- [ ] `npx prisma db push` succeeds against production DB
- [ ] Database seeded if needed (`node prisma/seed.js`)

### Application Verification

- [ ] Server starts and `/api/health` returns 200
- [ ] All API routes respond (candidates, employees, devices, etc.)
- [ ] Frontend loads with no console errors
- [ ] All 16 pages render correctly
- [ ] Authentication flow works (login, session persistence, logout)
- [ ] AI assistant responds (if `ANTHROPIC_API_KEY` is set)

### Security & Infrastructure

- [ ] SSL/HTTPS configured and enforced (redirect HTTP to HTTPS)
- [ ] Session cookie `secure` flag set to `true` in production
- [ ] CORS origin restricted to the production frontend domain
- [ ] No secrets committed to the repository (check `.gitignore`)
- [ ] Rate limiting enabled on auth endpoints

### Operational Readiness

- [ ] Error monitoring configured (Sentry, LogRocket, or platform logs)
- [ ] Database backups scheduled (daily minimum)
- [ ] Uptime monitoring in place (UptimeRobot, Better Uptime, or similar)
- [ ] DNS / custom domain configured and propagated
- [ ] Team notified of deployment URL and credentials

---

## Post-Deployment Verification

Run these checks immediately after deploying:

```bash
# 1. Health check
curl -s https://your-domain.com/api/health | jq .

# 2. API smoke test — should return JSON arrays/objects
curl -s https://your-domain.com/api/candidates | head -c 200
curl -s https://your-domain.com/api/employees | head -c 200
curl -s https://your-domain.com/api/devices | head -c 200

# 3. Frontend — should return HTML with <div id="root">
curl -s https://your-domain.com/ | grep -o '<div id="root">'

# 4. SSL certificate validity
openssl s_client -connect your-domain.com:443 -servername your-domain.com </dev/null 2>/dev/null | openssl x509 -noout -dates

# 5. Response time baseline
curl -w "Connect: %{time_connect}s\nTTFB: %{time_starttransfer}s\nTotal: %{time_total}s\n" -o /dev/null -s https://your-domain.com/api/health
```

### Rollback Procedure

If critical issues are found post-deploy:

1. **Railway:** Click "Rollback" on the previous deployment in the dashboard.
2. **Render:** Redeploy the previous commit from the dashboard.
3. **Docker:** `docker pull yourdockerhub/vtwo-ops:previous-tag && docker stop vtwo-ops && docker run ...` with the previous tag.
4. Investigate logs, fix, and redeploy.

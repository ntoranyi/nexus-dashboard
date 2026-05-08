# 🚀 NEXUS AI — Production Deployment Guide

This guide walks you through deploying the NEXUS AI stack:
- **Frontend** → Vercel (Vite + React)
- **Backend** → Render.com (FastAPI)
- **Database** → MongoDB Atlas (free tier)
- **Keep-alive** → UptimeRobot (prevents Render free cold starts)

Total cost: **$0/month** on free tiers (with cold starts on Render free).

---

## 1️⃣ MongoDB Atlas (Database)

1. Sign up at [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a free **M0 cluster** (Frankfurt or closest region)
3. **Database Access** → add user `nexus_admin` with strong password
4. **Network Access** → add IP `0.0.0.0/0` (allow Render servers)
5. Copy connection string:
   ```
   mongodb+srv://nexus_admin:<password>@cluster0.xxxxx.mongodb.net/nexus_ai?retryWrites=true&w=majority
   ```

---

## 2️⃣ Render.com (Backend) — 1-Click Deploy

This repo includes a [`render.yaml`](./render.yaml) **Blueprint** for instant setup.

### Option A — Blueprint (recommended)

1. Push this repo to GitHub.
2. Go to [dashboard.render.com](https://dashboard.render.com) → **New + → Blueprint**
3. Connect your GitHub repo → Render auto-detects `render.yaml`.
4. Fill the **3 secret env vars**:
   | Key | Value |
   |---|---|
   | `MONGO_URL` | (from step 1) |
   | `ANTHROPIC_API_KEY` | `sk-ant-api03-...` |
   | `ALLOWED_ORIGINS` | `https://YOUR-PROJECT.vercel.app` (comma-separated for multiple) |
5. Click **Apply** → wait ~3 min.
6. Copy your service URL: `https://nexus-ai-backend.onrender.com`
7. **Test**: open `https://nexus-ai-backend.onrender.com/api/ping` → should return `{"pong": true}`

### Option B — Manual

If you prefer manual setup:
- **Type**: Web Service · **Runtime**: Python 3 · **Root Directory**: `backend`
- **Build**: `pip install -r requirements.txt`
- **Start**: `uvicorn server:app --host 0.0.0.0 --port $PORT`
- **Health Check Path**: `/api/health`
- Add the 4 env vars above.

---

## 3️⃣ Vercel (Frontend)

1. Push this repo to GitHub.
2. Go to [vercel.com/new](https://vercel.com/new) → import the repo.
3. Configure:
   | Field | Value |
   |---|---|
   | **Framework Preset** | Vite (auto-detected) |
   | **Root Directory** | `frontend` |
   | **Build Command** | `npm run build` (default) |
   | **Output Directory** | `dist` (default) |
4. **Environment Variables** → add:
   ```
   VITE_API_URL = https://nexus-ai-backend.onrender.com/api
   ```
5. **Deploy** → live in ~1 min at `https://YOUR-PROJECT.vercel.app`

> ⚠️ After your first Vercel URL is known, **go back to Render** and update
> `ALLOWED_ORIGINS` env var with that exact URL, then redeploy the backend.

---

## 4️⃣ UptimeRobot (Keep Render Awake)

Render's free plan sleeps services after 15 min of inactivity, causing 30s cold
starts on the next request. Pinging `/api/ping` every 5 min keeps it warm.

### Setup (free, ~2 min)

1. Sign up at [uptimerobot.com](https://uptimerobot.com) (free plan = 50 monitors).
2. **+ Add New Monitor** → fill:
   | Field | Value |
   |---|---|
   | **Monitor Type** | HTTP(s) |
   | **Friendly Name** | `NEXUS AI — Backend Keep-Alive` |
   | **URL** | `https://nexus-ai-backend.onrender.com/api/ping` |
   | **Monitoring Interval** | `5 minutes` |
   | **Monitor Timeout** | `30 seconds` (cold start tolerance) |
3. **Alert Contacts** → add your email (notified if backend goes down).
4. **Create Monitor**.

✅ Your Render service now stays awake 24/7 on the free plan.

### Why `/api/ping` and not `/api/health`?

- `/api/ping` returns `{"pong": true}` with **no DB/LLM call** → near-zero cost on Render.
- `/api/health` is fine too, but it includes a timestamp computation.
- Either works for keep-alive.

---

## 5️⃣ Verification Checklist

- [ ] `https://your-backend.onrender.com/api/ping` → `{"pong": true}`
- [ ] `https://your-app.vercel.app` → loads dashboard with 12+ products (not the 4 mocks)
- [ ] Open browser DevTools → Network tab → confirm requests go to `your-backend.onrender.com/api/...`
- [ ] No CORS errors in console.
- [ ] Click **AI assistant → ask a question** → real Claude response (not the offline template).
- [ ] UptimeRobot dashboard shows 100% uptime green.

---

## 🆘 Troubleshooting

| Symptom | Fix |
|---|---|
| **CORS error** in browser console | Add your Vercel URL to `ALLOWED_ORIGINS` env var on Render → redeploy backend. |
| **Frontend shows mock data** | `VITE_API_URL` not set on Vercel — go to Settings → Env Vars, add it, then **Redeploy** without cache. |
| **502 / cold start** on first request | Normal on Render free (~30s wakeup). UptimeRobot fixes this. |
| **MongoDB connection error** in Render logs | Check `Network Access` whitelist on Atlas (must be `0.0.0.0/0`) and `MONGO_URL` is correct. |
| **`ANTHROPIC_API_KEY` invalid** | Verify the key on console.anthropic.com → regenerate if needed → update in Render. |

---

## 🔐 Production Hardening (optional, when revenue justifies)

- Upgrade Render to **Starter ($7/mo)** → no cold starts, no UptimeRobot needed.
- Upgrade MongoDB Atlas to **M10 ($57/mo)** when you exceed 5GB or 100 conn/s.
- Add Vercel custom domain (`nexus-ai.com`) and update `ALLOWED_ORIGINS`.
- Rotate `ANTHROPIC_API_KEY` quarterly.
- Enable Render's `auto-scaling` (Pro plan only).

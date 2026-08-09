# 🚀 Free Public Deployment Guide

This app (Flask backend + React frontend) can be published publicly for **free** using:

- **Backend** → [Render](https://render.com) (free web service)
- **Frontend** → [Vercel](https://vercel.com) **or** [Netlify](https://netlify.com) (free static hosting)

Below are the exact steps. All config files are already prepared in this repo.

---

## Architecture After Deployment

```
Public user
   │
   ▼
Frontend (Vercel/Netlify static)  ── /api requests ──►  Backend (Render)
https://your-frontend.vercel.app                     https://your-backend.onrender.com
```

The frontend is built once (`npm run build`) into static files served by Vercel/Netlify.
API calls use `VITE_API_URL` (set at build time) so the browser talks to the Render backend directly.

---

## Step 1 — Install CLI Tools (optional but easier)

```bash
# GitHub CLI
winget install --id GitHub.cli

# Vercel CLI
npm i -g vercel

# Netlify CLI (if you prefer Netlify)
npm i -g netlify-cli
```

> You can also use each platform's web dashboard instead of the CLI — both work.

---

## Step 2 — Push the Code to GitHub

```bash
git init
git add .
git commit -m "Deploy data pipeline dashboard"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/data-pipeline-dashboard.git
git push -u origin main
```

(If you already have a GitHub repo, just push to it.)

---

## Step 3 — Deploy the Backend on Render (free)

1. Go to [render.com](https://render.com) → Sign up (free) → **New** → **Web Service**.
2. Connect your GitHub account and pick the `data-pipeline-dashboard` repo.
3. Render will detect `render.yaml` (blueprint). If it doesn't, configure manually:
   - **Root directory:** `backend`
   - **Build command:** `pip install -r requirements.txt`
   - **Start command:** `gunicorn app:app --bind 0.0.0.0:$PORT`
   - **Instance type:** Free
4. Add environment variables (already defaulted in `config.py`):
   - `HOST` = `0.0.0.0`
   - `PORT` = `10000`
   - `DEBUG` = `false`
   - `CORS_ORIGINS` = `*` (or your frontend URL)
5. Click **Deploy**. Wait for the build.
6. Note your backend URL, e.g. `https://data-pipeline-api.onrender.com`.

**Verify:** open `https://<your-backend-url>/api/health` → should return `{"success": true, ...}`.

---

## Step 4A — Deploy Frontend on Vercel (option A)

1. Edit `frontend/vercel.json` and replace `YOUR_BACKEND_URL.onrender.com` with your real backend URL.
2. Go to [vercel.com](https://vercel.com) → Sign up → **Add New Project** → import your GitHub repo.
3. Set:
   - **Root directory:** `frontend`
   - **Build command:** `npm run build`
   - **Output directory:** `dist`
   - **Environment variable:** `VITE_API_URL = https://<your-backend-url>/api`
4. Click **Deploy**.

Your dashboard is live at `https://data-pipeline-dashboard.vercel.app` 🎉

---

## Step 4B — Deploy Frontend on Netlify (option B)

1. Edit `frontend/netlify.toml` and replace `YOUR_BACKEND_URL.onrender.com` with your real backend URL.
2. Go to [netlify.com](https://netlify.com) → Sign up → **Add new site** → import from GitHub.
3. Set:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
   - **Environment variable:** `VITE_API_URL = https://<your-backend-url>/api`
4. Click **Deploy**.

---

## Step 5 — Verify the Public App

- Open your frontend URL.
- Ingest sample data from `backend/sample_data/`.
- Confirm the dashboard shows stats and records (proves the frontend ↔ backend connection works).

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Frontend shows "Network Error" | Check `VITE_API_URL` is set correctly and the backend health URL is reachable. |
| CORS errors in browser console | Set `CORS_ORIGINS` env var on Render to your frontend URL. |
| Data resets on restart | The backend uses **in-memory** storage. For persistence, add a free DB (see below). |
| Free Render web service sleeps on idle | It auto-wakes on first request (may take ~30s). |

---

## Optional — Persistent Storage (free)

The current backend stores data in memory (resets on restart). To make it persistent:

1. **Render Postgres (free)** + SQLAlchemy, **or** **MongoDB Atlas (free)** + PyMongo.
2. Swap `core/storage.py`'s in-memory list for DB calls.
3. Add the connection string as an env var on Render.

I can implement this for you if desired.

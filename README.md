# Data Pipeline + Dashboard

A full-stack application that ingests data from **JSON, XML, CSV, and external APIs**, normalizes & transforms it, and visualizes it in an interactive **React dashboard**.

## Architecture

```
backend/   - Flask REST API + data pipeline (parse → normalize → store)
frontend/  - React (Vite) dashboard consuming the API
```

## Backend API

| Method | Endpoint               | Description                              |
|--------|------------------------|------------------------------------------|
| GET    | `/api/health`          | Health check + record count              |
| POST   | `/api/ingest/json`     | Ingest JSON payload or URL               |
| POST   | `/api/ingest/xml`      | Ingest XML payload or URL                |
| POST   | `/api/ingest/csv`      | Ingest CSV text or URL                   |
| POST   | `/api/ingest/external` | Ingest from an external API              |
| GET    | `/api/data`            | All normalized records                   |
| GET    | `/api/data/transform`  | Transform (sort / filter / group-by)     |
| GET    | `/api/stats`           | Aggregated statistics                    |
| DELETE | `/api/data`            | Clear all records                        |

### Example ingest (JSON)
```bash
curl -X POST http://localhost:5000/api/ingest/json \
  -H "Content-Type: application/json" \
  -d '{"payload": "[{\"name\":\"Alice\",\"age\":\"30\"}]"}'
```

### Example external API ingest
```bash
curl -X POST http://localhost:5000/api/ingest/external \
  -H "Content-Type: application/json" \
  -d '{"url":"https://jsonplaceholder.typicode.com/users","format":"json"}'
```

### Transform example
```
GET /api/data/transform?sort_by=salary&sort_desc=true&group_by=city
GET /api/data/transform?filter_field=city&filter_value=London
```

## Data Pipeline

1. **Ingest** – accept raw text or fetch from a URL.
2. **Parse** – format-specific parser (`core/parser.py`).
3. **Normalize** – unify keys, coerce types, drop nulls, tag source/ingest time (`core/normalizer.py`).
4. **Store** – append to an in-memory store (`core/storage.py`; easily swapped for a DB).
5. **Expose** – normalized data + stats via REST.

## Running the App

### 1. Backend (port 5000)
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate        # Windows
pip install -r requirements.txt
python app.py
```

### 2. Frontend (port 5173)
```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 in your browser. The Vite dev server proxies `/api` to the Flask backend.

## Sample Data
Ready-made samples live in `backend/sample_data/` (`data.json`, `data.xml`, `data.csv`) and can be pasted into the dashboard's ingest form.

## Deploy Publicly (Free)
This app can be published on the internet for free using **Render** (backend) + **Vercel/Netlify** (frontend).

- 📄 Full step-by-step guide → **[DEPLOY.md](DEPLOY.md)**
- Deployment configs already included:
  - `render.yaml` + `backend/Procfile` (Render backend)
  - `frontend/vercel.json` / `frontend/netlify.toml` (static hosting)
  - Frontend reads `VITE_API_URL` env var at build time to talk to the deployed backend.

**Quick summary:** push to GitHub → deploy `backend/` on Render → deploy `frontend/` on Vercel/Netlify with `VITE_API_URL` set to your Render backend URL.

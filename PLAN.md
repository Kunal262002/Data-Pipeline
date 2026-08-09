# Data Pipeline + Dashboard - Implementation Plan

## Objective
Build a full-stack application with:
- **Flask backend** that ingests & processes data from JSON, XML, CSV, and external APIs.
- **Data transformation & normalization** with clean, scalable REST endpoints.
- **React dashboard** with interactive UI and proper state management.

## Project Structure
```
data-pipeline-dashboard/
├── backend/
│   ├── app.py                 # Flask app factory + CORS
│   ├── requirements.txt
│   ├── config.py
│   ├── core/
│   │   ├── __init__.py
│   │   ├── parser.py          # JSON/XML/CSV parsers -> unified records
│   │   ├── normalizer.py      # Transform & normalize data
│   │   ├── fetcher.py         # External API ingestion
│   │   └── storage.py         # In-memory store (scalable to DB)
│   ├── api/
│   │   ├── __init__.py        # Blueprint registration
│   │   └── routes.py          # REST endpoints
│   └── sample_data/
│       ├── data.json
│       ├── data.xml
│       └── data.csv
├── frontend/                  # React (Vite + JS)
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── api/client.js      # Axios wrapper
│       ├── context/DataContext.jsx  # Global state (Context + useReducer)
│       ├── hooks/useFetch.js  # Reusable fetch hook
│       └── components/
│           ├── Navbar.jsx
│           ├── IngestForm.jsx
│           ├── Dashboard.jsx
│           ├── StatsCards.jsx
│           ├── JsonViewer.jsx
│           └── ...
└── README.md
```

## Backend Endpoints (REST)
| Method | Endpoint              | Purpose                                   |
|--------|-----------------------|-------------------------------------------|
| GET    | /api/health           | Health check                              |
| POST   | /api/ingest/json      | Ingest a JSON payload/URL                  |
| POST   | /api/ingest/xml       | Ingest an XML payload/URL                  |
| POST   | /api/ingest/csv       | Ingest CSV text                            |
| POST   | /api/ingest/external  | Fetch & ingest from an external API        |
| GET    | /api/data             | Get all normalized records                 |
| GET    | /api/data/transform   | Apply transformations (filter/sort/group)  |
| GET    | /api/stats            | Aggregated statistics                      |

## Data Pipeline
1. **Ingest**: Accept raw JSON/XML/CSV text or URLs.
2. **Parse**: Convert each input format into a list of unified record dicts.
3. **Normalize**: coerce types, unify field names, fill defaults, drop nulls.
4. **Store**: Append to in-memory store keyed by source + type.
5. **Expose**: Return normalized data and stats via API.

## React Dashboard Features
- Ingest panel (submit JSON, XML, CSV, or external URL).
- Global state via Context + useReducer.
- Dashboard with stat cards, data table, and source breakdown.
- Interactive controls: filter, sort, group-by, refresh.

## Deliverables & Run Steps
1. Backend: `pip install -r requirements.txt` then `python app.py` (port 5000).
2. Frontend: `npm install` then `npm run dev`.


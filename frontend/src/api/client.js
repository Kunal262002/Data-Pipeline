import axios from "axios";

// Use the deployed backend URL in production (via Vite env var),
// otherwise fall back to the relative "/api" path (dev proxy).
const API_URL = import.meta.env.VITE_API_URL || "/api";

const client = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

function unwrap(resp) {
  // Backend wraps responses as { success, data, ... }
  if (resp.data && resp.data.success !== undefined) {
    return resp.data;
  }
  return { success: true, data: resp.data };
}

export function fetchHealth() {
  return client.get("/health").then(unwrap);
}

export function fetchAllData() {
  return client.get("/data").then(unwrap);
}

export function fetchStats() {
  return client.get("/stats").then(unwrap);
}

export function fetchTransformed(params = {}) {
  return client.get("/data/transform", { params }).then(unwrap);
}

export function ingestJSON({ payload, url } = {}) {
  return client.post("/ingest/json", { payload, url }).then(unwrap);
}

export function ingestXML({ payload, url } = {}) {
  return client.post("/ingest/xml", { payload, url }).then(unwrap);
}

export function ingestCSV({ payload, url } = {}) {
  return client.post("/ingest/csv", { payload, url }).then(unwrap);
}

export function ingestExternal({ url, format, headers } = {}) {
  return client
    .post("/ingest/external", { url, format, headers })
    .then(unwrap);
}

export function clearAllData() {
  return client.delete("/data").then(unwrap);
}

export default client;

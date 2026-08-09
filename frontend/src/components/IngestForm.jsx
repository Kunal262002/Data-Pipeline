import { useState } from "react";
import { useData } from "../context/DataContext.jsx";

const TABS = [
  { key: "JSON", label: "JSON" },
  { key: "XML", label: "XML" },
  { key: "CSV", label: "CSV" },
  { key: "External", label: "External API" },
];

const PLACEHOLDERS = {
  JSON: '[{"Name": "Alice", "Age": "30", "City": "NYC", "Salary": 85000, "Active": "true"}]',
  XML: "<records><record><name>Eve</name><age>28</age><city>Paris</city></record></records>",
  CSV: "Name,Age,City,Salary\nBob,25,London,62000",
  External: "",
};

export default function IngestForm() {
  const { ingest, loading, error } = useData();
  const [tab, setTab] = useState("JSON");
  const [payload, setPayload] = useState(PLACEHOLDERS.JSON);
  const [url, setUrl] = useState("");
  const [format, setFormat] = useState("json");
  const [message, setMessage] = useState(null);

  function switchTab(key) {
    setTab(key);
    setMessage(null);
    setPayload(PLACEHOLDERS[key] ?? "");
    setUrl("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage(null);
    try {
      let resp;
      if (tab === "External") {
        resp = await ingest("External", { url, format });
      } else {
        resp = await ingest(tab, { payload, url: url || undefined });
      }
      setMessage({
        type: "ok",
        text: `Ingested ${resp.ingested} record(s). Total in store: ${resp.total_records}.`,
      });
    } catch (err) {
      setMessage({
        type: "error",
        text: err?.response?.data?.error || err.message,
      });
    }
  }

  const isExternal = tab === "External";

  return (
    <form className="card" onSubmit={handleSubmit}>
      <h2>Ingest Data</h2>
      <div className="tab-row">
        {TABS.map((t) => (
          <button
            type="button"
            key={t.key}
            className={`tab ${tab === t.key ? "active" : ""}`}
            onClick={() => switchTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {!isExternal && (
        <div className="form-group">
          <label htmlFor="url">URL (optional, overrides payload)</label>
          <input
            id="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/data.json"
          />
        </div>
      )}

      {isExternal ? (
        <>
          <div className="form-group">
            <label htmlFor="ext-url">External API URL</label>
            <input
              id="ext-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://jsonplaceholder.typicode.com/users"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="format">Response Format</label>
            <select id="format" value={format} onChange={(e) => setFormat(e.target.value)}>
              <option value="json">JSON</option>
              <option value="xml">XML</option>
              <option value="csv">CSV</option>
              <option value="">Auto-detect</option>
            </select>
          </div>
        </>
      ) : (
        <div className="form-group">
          <label htmlFor="payload">Payload</label>
          <textarea
            id="payload"
            value={payload}
            onChange={(e) => setPayload(e.target.value)}
            placeholder={PLACEHOLDERS[tab]}
            required={!url}
          />
        </div>
      )}

      <button className="btn" type="submit" disabled={loading}>
        {loading ? "Processing…" : "Ingest"}
      </button>

      {message && (
        <div className={`toast ${message.type}`} style={{ marginTop: 14 }}>
          {message.text}
        </div>
      )}
      {error && !message && (
        <div className="toast error" style={{ marginTop: 14 }}>
          {error}
        </div>
      )}
    </form>
  );
}

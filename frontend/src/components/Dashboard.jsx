import { useEffect } from "react";
import { useData } from "../context/DataContext.jsx";
import StatsCards from "./StatsCards.jsx";
import DataTable from "./DataTable.jsx";

export default function Dashboard() {
  const { records, stats, loading, error, refresh, lastIngest } = useData();

  useEffect(() => {
    refresh();
  }, []); // initial load only

  return (
    <div>
      {lastIngest && (
        <div className="toast">
          Last ingest: <strong>{lastIngest.count}</strong> record(s) from{" "}
          <span className="source-chip">{lastIngest.source}</span>
          <span className="muted">at {new Date(lastIngest.at).toLocaleTimeString()}</span>
        </div>
      )}
      {error && <div className="error">{error}</div>}
      {loading && records.length === 0 && <div className="loading">Loading…</div>}

      <StatsCards stats={stats} />

      <div className="card">
        <h2>Records</h2>
        <DataTable records={records} />
      </div>
    </div>
  );
}

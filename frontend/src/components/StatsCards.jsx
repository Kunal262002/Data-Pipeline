export default function StatsCards({ stats }) {
  if (!stats) {
    return (
      <div className="stats-grid">
        <div className="stat-card">
          <div className="value">0</div>
          <div className="label">Total Records</div>
        </div>
      </div>
    );
  }

  const sources = Object.entries(stats.sources || {});
  const numericFields = Object.entries(stats.numeric_fields || {});
  const sampleField = numericFields[0];
  const avgSalary = sampleField ? sampleField[1].avg : null;

  return (
    <div className="stats-grid">
      <div className="stat-card">
        <div className="value">{stats.total_records}</div>
        <div className="label">Total Records</div>
      </div>
      <div className="stat-card">
        <div className="value">{sources.length}</div>
        <div className="label">Data Sources</div>
      </div>
      {sampleField && (
        <div className="stat-card">
          <div className="value">{avgSalary}</div>
          <div className="label">Avg {sampleField[0]}</div>
        </div>
      )}
      <div className="stat-card">
        <div className="value">{numericFields.length}</div>
        <div className="label">Numeric Fields</div>
      </div>
    </div>
  );
}

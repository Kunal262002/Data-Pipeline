import { useMemo, useState } from "react";

export default function DataTable({ records }) {
  const [sortBy, setSortBy] = useState(null);
  const [sortDesc, setSortDesc] = useState(false);
  const [filterField, setFilterField] = useState("");
  const [filterValue, setFilterValue] = useState("");
  const [groupBy, setGroupBy] = useState("");

  const columns = useMemo(() => {
    const set = new Set();
    records.forEach((r) => Object.keys(r).forEach((k) => set.add(k)));
    return Array.from(set);
  }, [records]);

  const groups = useMemo(() => {
    if (!groupBy) return null;
    const map = {};
    records.forEach((r) => {
      const key = r[groupBy] === undefined ? "—" : String(r[groupBy]);
      (map[key] = map[key] || []).push(r);
    });
    return map;
  }, [records, groupBy]);

  const filtered = useMemo(() => {
    let list = records.slice();
    if (filterField && filterValue !== "") {
      list = list.filter(
        (r) => String(r[filterField] ?? "") === String(filterValue)
      );
    }
    if (sortBy) {
      list.sort((a, b) => {
        const av = a[sortBy];
        const bv = b[sortBy];
        if (typeof av === "number" && typeof bv === "number") return av - bv;
        return String(av ?? "").localeCompare(String(bv ?? ""));
      });
      if (sortDesc) list.reverse();
    }
    return list;
  }, [records, filterField, filterValue, sortBy, sortDesc]);

  function handleSort(col) {
    if (sortBy === col) {
      setSortDesc((d) => !d);
    } else {
      setSortBy(col);
      setSortDesc(false);
    }
  }

  function renderRow(r, idx) {
    return (
      <tr key={idx}>
        {columns.map((c) => (
          <td key={c}>{JSON.stringify(r[c])}</td>
        ))}
      </tr>
    );
  }

  return (
    <div>
      <div className="controls">
        {columns.length > 0 && (
          <>
            <div className="form-group">
              <label>Filter by field</label>
              <select value={filterField} onChange={(e) => setFilterField(e.target.value)}>
                <option value="">— none —</option>
                {columns.filter((c) => !c.startsWith("_")).map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Filter value</label>
              <input
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
                placeholder="match value"
              />
            </div>
            <div className="form-group">
              <label>Group by</label>
              <select value={groupBy} onChange={(e) => setGroupBy(e.target.value)}>
                <option value="">— none —</option>
                {columns.filter((c) => !c.startsWith("_")).map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </>
        )}
      </div>

      {records.length === 0 ? (
        <div className="empty">
          No records yet. Ingest JSON, XML, CSV, or an external API to see data here.
        </div>
      ) : (
        <div className="table-wrap">
          {groups ? (
            Object.entries(groups).map(([key, group]) => (
              <div key={key} style={{ marginBottom: 20 }}>
                <h4 style={{ color: "var(--accent)" }}>
                  {groupBy}: {key}{" "}
                  <span className="badge">{group.length}</span>
                </h4>
                <table className="table">
                  <thead>
                    <tr>{columns.map((c) => <th key={c}>{c}</th>)}</tr>
                  </thead>
                  <tbody>{group.map(renderRow)}</tbody>
                </table>
              </div>
            ))
          ) : (
            <table className="table">
              <thead>
                <tr>
                  {columns.map((c) => (
                    <th key={c} onClick={() => handleSort(c)} title="Click to sort">
                      {c} {sortBy === c ? (sortDesc ? "↓" : "↑") : ""}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>{filtered.map(renderRow)}</tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

import { useData } from "../context/DataContext.jsx";

export default function Navbar() {
  const { total, clear, loading } = useData();
  return (
    <header className="navbar">
      <h1>
        <span>🛢️</span> Data Pipeline Dashboard
        <span className="badge">{total}</span>
      </h1>
      <button className="btn danger" onClick={clear} disabled={loading || total === 0}>
        Clear All
      </button>
    </header>
  );
}

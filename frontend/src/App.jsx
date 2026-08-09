import Navbar from "./components/Navbar.jsx";
import IngestForm from "./components/IngestForm.jsx";
import Dashboard from "./components/Dashboard.jsx";

export default function App() {
  return (
    <div className="app">
      <Navbar />
      <div className="container">
        <div className="grid">
          <IngestForm />
          <Dashboard />
        </div>
      </div>
    </div>
  );
}

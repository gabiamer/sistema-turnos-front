// App.jsx — limpiado del template Vite (kick-off ✓)
// Sprint 1 Luciana: se agregan rutas base + CalendarioPage
// Adri agregará Navbar y el Layout en su rama (feature/adri-s1-layout)
// NO modificar las rutas de Adri cuando ella las suba
 
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import CalendarioPage from "./pages/CalendarioPage";
import "./index.css";
 
// Placeholder para rutas que aún no existen (Sprint 2 y 3)
function Placeholder({ nombre }) {
  return (
    <div style={{ padding: 40, color: "#8b8fa8", textAlign: "center" }}>
      <p style={{ fontSize: 18, marginBottom: 8 }}>{nombre}</p>
      <p style={{ fontSize: 13, fontFamily: "monospace", color: "#494d62" }}>
        Pantalla pendiente de implementación
      </p>
    </div>
  );
}
 
// Navbar temporal hasta que Adri suba el Layout real (feature/adri-s1-layout)
function NavTemp() {
  return (
    <nav style={{
      background: "#16181f",
      borderBottom: "1px solid #2a2d3a",
      padding: "12px 24px",
      display: "flex",
      gap: "24px",
      alignItems: "center"
    }}>
      <span style={{ fontWeight: 800, color: "#f06090", marginRight: 16 }}>
        🏥 Turnos Médicos
      </span>
      <Link to="/"           style={{ color: "#8b8fa8", fontSize: 14, textDecoration: "none" }}>Inicio</Link>
      <Link to="/buscar"     style={{ color: "#8b8fa8", fontSize: 14, textDecoration: "none" }}>Buscar Médico</Link>
      <Link to="/calendario" style={{ color: "#f7a8c0", fontSize: 14, textDecoration: "none" }}>Disponibilidad</Link>
      <Link to="/mis-turnos" style={{ color: "#8b8fa8", fontSize: 14, textDecoration: "none" }}>Mis Turnos</Link>
    </nav>
  );
}
 
export default function App() {
  return (
    <BrowserRouter>
      <NavTemp />
      <Routes>
        <Route path="/"           element={<Placeholder nombre="Inicio" />} />
        <Route path="/buscar"     element={<Placeholder nombre="Buscar Médico" />} />
        <Route path="/calendario" element={<CalendarioPage />} />
        <Route path="/mis-turnos" element={<Placeholder nombre="Mis Turnos — Sprint 3" />} />
        <Route path="/agenda"     element={<Placeholder nombre="Gestión Agenda — Sprint 2" />} />
      </Routes>
    </BrowserRouter>
  );
}
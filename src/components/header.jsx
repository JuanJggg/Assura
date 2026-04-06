import React from "react";
import '../App.css';
import { useNavigate } from "react-router-dom";

const LogoutIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <polyline points="16 17 21 12 16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" width="15" height="15">
    <circle cx="11" cy="11" r="8" stroke="#9CA3AF" strokeWidth="2"/>
    <path d="M21 21l-4.35-4.35" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

function Header() {
  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem("usuario")) || {};

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    navigate("/");
  };

  const initials = usuario.nombres
    ? (usuario.nombres[0] + (usuario.apellidos?.[0] || "")).toUpperCase()
    : "U";

  return (
    <>
      <style>{`
        .logout-btn:hover { background: #B91C1C !important; }
        .logout-btn { transition: background 0.15s; }
        .header-search:focus { border-color: #DC2626 !important; background: white !important; }
      `}</style>
      <header style={{
        background: "white", borderBottom: "1px solid #E5E7EB",
        padding: "0 20px", height: 60, display: "flex",
        alignItems: "center", justifyContent: "space-between",
        boxShadow: "0 1px 4px rgba(0,0,0,0.05)", flexShrink: 0, zIndex: 10
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center" }}>
          <img src="/LogoCompleto.png" alt="Assura" style={{ height: 38, width: "auto", cursor: "pointer" }} />
        </div>

        {/* Search */}
        <div style={{ position: "relative", flex: 1, maxWidth: 320, margin: "0 32px" }}>
          <div style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
            <SearchIcon />
          </div>
          <input
            type="text"
            className="header-search"
            placeholder="Buscar..."
            style={{
              width: "100%", padding: "8px 12px 8px 36px", borderRadius: 10,
              border: "1.5px solid #E5E7EB", fontSize: 13, background: "#F9FAFB",
              outline: "none", fontFamily: "inherit", color: "#374151",
              transition: "border-color 0.2s, background 0.2s", boxSizing: "border-box"
            }}
          />
        </div>

        {/* User info + logout */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {usuario.nombres && (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {/* Avatar */}
              <div style={{
                width: 34, height: 34, borderRadius: "50%",
                background: "linear-gradient(135deg,#DC2626,#B91C1C)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "white", fontWeight: 700, fontSize: 12, userSelect: "none"
              }}>
                {initials}
              </div>
              <div style={{ lineHeight: 1.3 }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#111827" }}>
                  {usuario.nombres} {usuario.apellidos}
                </p>
                <p style={{ margin: 0, fontSize: 11, color: "#9CA3AF" }}>{usuario.rol || "Estudiante"}</p>
              </div>
            </div>
          )}
          <button
            className="logout-btn"
            onClick={handleLogout}
            title="Cerrar sesión"
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: 36, height: 36, borderRadius: 9,
              background: "#DC2626", border: "none", cursor: "pointer",
              color: "white", boxShadow: "0 2px 6px rgba(220,38,38,0.25)"
            }}
          >
            <LogoutIcon />
          </button>
        </div>
      </header>
    </>
  );
}

export default Header;

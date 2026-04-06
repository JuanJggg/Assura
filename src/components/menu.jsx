import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../App.css";

// SVG Icons
const HomeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" width="17" height="17">
    <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 21V12h6v9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const AdvisorIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" width="17" height="17">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.8"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
);
const ForumIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" width="17" height="17">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const ChatIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" width="17" height="17">
    <path d="M8 12h.01M12 12h.01M16 12h.01" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const BotIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" width="17" height="17">
    <rect x="3" y="11" width="18" height="10" rx="3" stroke="currentColor" strokeWidth="1.8"/>
    <circle cx="8.5" cy="16" r="1.3" fill="currentColor"/>
    <circle cx="15.5" cy="16" r="1.3" fill="currentColor"/>
    <path d="M12 11V8M10 21h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    <circle cx="12" cy="6.5" r="1.8" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);

function Menu() {
  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = usuario.rol === "Asesor"
    ? [
        { label: "Inicio",            href: "/Dashboard",       icon: <HomeIcon /> },
        { label: "Asesorías",         href: "/Asesor",          icon: <AdvisorIcon /> },
        { label: "Foro de comunidad", href: "/Forum",           icon: <ForumIcon /> },
        { label: "Chatbot IA",        href: "/ChatbotAsesor",   icon: <BotIcon /> },
      ]
    : [
        { label: "Inicio",            href: "/Dashboard",        icon: <HomeIcon /> },
        { label: "Foro de comunidad", href: "/Forum",            icon: <ForumIcon /> },
        { label: "Chats",             href: "/Chatstudy",        icon: <ChatIcon /> },
        { label: "Chatbot IA",        href: "/ChatbotEstudiante",icon: <BotIcon /> },
      ];

  return (
    <>
      <style>{`
        .menu-btn { transition: all 0.15s ease; }
        .menu-btn:hover { background: #F3F4F6 !important; color: #111827 !important; }
        .menu-btn.active { background: #FFF0F0 !important; color: #DC2626 !important; }
      `}</style>
      <aside style={{
        width: 216, flexShrink: 0, background: "white",
        display: "flex", flexDirection: "column",
        padding: "20px 12px", minHeight: "100%",
        borderRight: "1px solid #E5E7EB",
        boxShadow: "1px 0 4px rgba(0,0,0,0.03)"
      }}>
        {/* Sección navegación */}
        <p style={{ margin: "0 0 8px 8px", fontSize: 10, fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.08em", textTransform: "uppercase" }}>Navegación</p>
        <nav>
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {menuItems.map(({ label, href, icon }) => {
              const isActive = location.pathname === href;
              return (
                <li key={label} style={{ marginBottom: 3 }}>
                  <button
                    onClick={() => navigate(href)}
                    className={`menu-btn${isActive ? " active" : ""}`}
                    style={{
                      display: "flex", alignItems: "center", gap: 10,
                      width: "100%", textAlign: "left",
                      padding: "9px 12px", borderRadius: 10, border: "none",
                      cursor: "pointer", fontSize: 13.5, fontWeight: isActive ? 600 : 500,
                      background: isActive ? "#FFF0F0" : "transparent",
                      color: isActive ? "#DC2626" : "#4B5563",
                      fontFamily: "inherit"
                    }}
                  >
                    <span style={{ opacity: isActive ? 1 : 0.65 }}>{icon}</span>
                    {label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Footer info */}
        <div style={{
          padding: "12px", borderRadius: 10, background: "#FFF5F5",
          border: "1px solid #FEE2E2", marginTop: 12
        }}>
          <p style={{ margin: 0, fontSize: 11, color: "#DC2626", fontWeight: 600 }}>Assura</p>
          <p style={{ margin: "2px 0 0", fontSize: 10, color: "#9CA3AF" }}>Plataforma académica</p>
        </div>
      </aside>
    </>
  );
}

export default Menu;

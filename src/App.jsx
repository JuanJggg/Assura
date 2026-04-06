import React, { useEffect, useState } from "react";
import "./App.css";
import Menu from "./components/menu";
import Header from "./components/header";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// ─── Avatar helper ────────────────────────────────────────────
function Avatar({ name, size = 44, fontSize = 16 }) {
  const colors = ["#DC2626","#7C3AED","#2563EB","#059669","#D97706","#DB2777"];
  const idx = (name?.charCodeAt(0) || 0) % colors.length;
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: `linear-gradient(135deg, ${colors[idx]}, ${colors[(idx+1)%colors.length]})`,
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "white", fontWeight: 700, fontSize, flexShrink: 0, userSelect: "none"
    }}>
      {name?.[0]?.toUpperCase() || "?"}
    </div>
  );
}

function App() {
  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem("usuario")) || {};
  const [asesores, setAsesores] = useState([]);
  const [comentario, setComentario] = useState([]);
  const [loadingAsesor, setLoadingAsesor] = useState(null);

  useEffect(() => { getAsesores(); getComentarios(); }, []);

  const getAsesores = async () => {
    try {
      const res = await axios.post("http://localhost:3001/dasboard/getAsesores");
      setAsesores(res.data);
    } catch {}
  };

  const getComentarios = async () => {
    try {
      const res = await axios.post("http://localhost:3001/dasboard/getComentario");
      setComentario(res.data);
    } catch {}
  };

  const formatDate = (date) => date.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });

  const handleClick = async (asesorId) => {
    if (!usuario?.id) { alert("Debes iniciar sesión primero"); navigate("/"); return; }
    setLoadingAsesor(asesorId);
    try {
      const res = await axios.post("http://localhost:3001/chat/crearConversacion", { id_estudiante: usuario.id, id_asesor: asesorId });
      if (res.data.ok) navigate("/Chatstudy", { state: { chatId: res.data.conversacion.id } });
      else alert("No se pudo crear la conversación");
    } catch (err) {
      alert(err.response?.data?.error || "No se pudo iniciar el chat.");
    } finally { setLoadingAsesor(null); }
  };

  const hora = new Date().getHours();
  const saludo = hora < 12 ? "Buenos días" : hora < 18 ? "Buenas tardes" : "Buenas noches";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        .asesor-card { transition: transform 0.2s, box-shadow 0.2s; }
        .asesor-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(0,0,0,0.12) !important; }
        .contact-btn:hover:not(:disabled) { background: #B91C1C !important; }
        .contact-btn { transition: background 0.15s; }
        .dashboard-scroll { scrollbar-width: thin; scrollbar-color: #E5E7EB transparent; }
        .dashboard-scroll::-webkit-scrollbar { width: 5px; }
        .dashboard-scroll::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 4px; }
      `}</style>
      <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden", fontFamily: "'Inter',sans-serif" }}>
        <Header />
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          <Menu />
          <main className="dashboard-scroll" style={{ flex: 1, background: "#F3F4F6", overflowY: "auto", padding: "28px 32px" }}>

            {/* Greeting */}
            <div style={{ marginBottom: 28 }}>
              <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#111827" }}>
                {saludo}, <span style={{ color: "#DC2626" }}>{usuario.nombres || "Estudiante"}</span> 👋
              </h1>
              <p style={{ margin: "4px 0 0", fontSize: 14, color: "#6B7280" }}>
                {new Date().toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>

            {/* Stats rápidos */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 16, marginBottom: 32 }}>
              {[
                { label: "Asesores disponibles", value: asesores.length, color: "#DC2626", icon: <svg viewBox="0 0 24 24" fill="none" width="22" height="22"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.8"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg> },
                { label: "Comentarios en foro", value: comentario.length, color: "#7C3AED", icon: <svg viewBox="0 0 24 24" fill="none" width="22" height="22"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg> },
                { label: "Mi carrera", value: usuario.carrera?.split(" ")[0] || "—", color: "#2563EB", icon: <svg viewBox="0 0 24 24" fill="none" width="22" height="22"><path d="M22 10v6M2 10l10-5 10 5-10 5z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><path d="M6 12v5c3 3 9 3 12 0v-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg> },
              ].map(({ label, value, color, icon }) => (
                <div key={label} style={{ background: "white", borderRadius: 14, padding: "18px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", borderLeft: `4px solid ${color}`, display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: `${color}12`, display: "flex", alignItems: "center", justifyContent: "center", color, flexShrink: 0 }}>{icon}</div>
                  <div>
                    <p style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#111827" }}>{value}</p>
                    <p style={{ margin: "2px 0 0", fontSize: 12, color: "#6B7280", fontWeight: 500 }}>{label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Asesores */}
            <div style={{ marginBottom: 32 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#111827" }}>Asesores disponibles</h2>
                <span style={{ fontSize: 12, color: "#9CA3AF" }}>{asesores.length} en línea</span>
              </div>
              {asesores.length === 0 ? (
                <div style={{ textAlign: "center", padding: "48px 20px", background: "white", borderRadius: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                  <p style={{ color: "#9CA3AF", fontSize: 14 }}>No hay asesores disponibles en este momento.</p>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(230px,1fr))", gap: 16 }}>
                  {asesores.map((asesor, index) => (
                    <div key={asesor.id_asesor || index} className="asesor-card" style={{ background: "white", borderRadius: 16, padding: "24px 20px", boxShadow: "0 2px 8px rgba(0,0,0,0.07)", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                      <Avatar name={asesor.asesor} size={60} fontSize={22} />
                      <h3 style={{ margin: "12px 0 4px", fontSize: 15, fontWeight: 700, color: "#111827" }}>{asesor.asesor || "Sin nombre"}</h3>
                      <p style={{ margin: "0 0 4px", fontSize: 12, color: "#DC2626", fontWeight: 600 }}>{asesor.materia || "Sin materia"}</p>
                      <p style={{ margin: "0 0 16px", fontSize: 12, color: "#9CA3AF" }}>{asesor.telefono || "Sin teléfono"}</p>
                      <button
                        className="contact-btn"
                        onClick={() => handleClick(asesor.id_asesor)}
                        disabled={loadingAsesor === asesor.id_asesor}
                        style={{ width: "100%", padding: "9px", borderRadius: 9, border: "none", background: "#DC2626", color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer", boxShadow: "0 2px 8px rgba(220,38,38,0.25)", opacity: loadingAsesor === asesor.id_asesor ? 0.75 : 1 }}
                      >
                        {loadingAsesor === asesor.id_asesor ? "Conectando..." : "Contactar"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Comentarios recientes */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 8 }}>
              {/* Últimos comentarios */}
              <div style={{ background: "white", borderRadius: 16, padding: "22px 24px", boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#111827" }}>Comentarios recientes</h3>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#DC2626" }}>{comentario.length}</span>
                </div>
                {comentario.length === 0 ? (
                  <p style={{ color: "#9CA3AF", fontSize: 13, textAlign: "center", padding: "20px 0" }}>No hay comentarios aún</p>
                ) : (
                  comentario.slice(0, 4).map((msg, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: i < Math.min(comentario.length, 4) - 1 ? "1px solid #F3F4F6" : "none" }}>
                      <Avatar name={msg.usuario} size={38} fontSize={14} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#111827" }}>{msg.usuario || "Anónimo"}</p>
                        <p style={{ margin: "2px 0 0", fontSize: 12, color: "#6B7280", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{msg.contenido || ""}</p>
                      </div>
                      <span style={{ fontSize: 11, color: "#9CA3AF", flexShrink: 0 }}>{msg.fecha ? formatDate(new Date(msg.fecha)) : ""}</span>
                    </div>
                  ))
                )}
                <button onClick={() => navigate("/Forum")} style={{ marginTop: 16, padding: "8px 18px", borderRadius: 20, background: "#DC2626", color: "white", border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                  Ver foro completo →
                </button>
              </div>

              {/* Acceso rápido */}
              <div style={{ background: "white", borderRadius: 16, padding: "22px 24px", boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}>
                <h3 style={{ margin: "0 0 18px", fontSize: 16, fontWeight: 700, color: "#111827" }}>Acceso rápido</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {[
                    { label: "Ir al foro de la comunidad", path: "/Forum", color: "#7C3AED", desc: "Participa en discusiones académicas" },
                    { label: "Mis chats con asesores", path: "/Chatstudy", color: "#2563EB", desc: "Gestiona tus conversaciones" },
                    { label: "Asistente IA académico", path: "/ChatbotEstudiante", color: "#DC2626", desc: "Consulta al chatbot BERT" },
                  ].map(({ label, path, color, desc }) => (
                    <button key={path} onClick={() => navigate(path)} style={{ display: "flex", alignItems: "center", gap: 14, padding: "13px 16px", borderRadius: 11, border: `1.5px solid ${color}20`, background: `${color}08`, cursor: "pointer", textAlign: "left", transition: "all 0.15s" }}
                      onMouseOver={e => e.currentTarget.style.background = `${color}14`}
                      onMouseOut={e => e.currentTarget.style.background = `${color}08`}>
                      <div style={{ width: 38, height: 38, borderRadius: 9, background: `${color}15`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, color }}><svg viewBox="0 0 24 24" fill="none" width="18" height="18"><path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
                      <div>
                        <p style={{ margin:0, fontSize:13, fontWeight:700, color:"#111827" }}>{label}</p>
                        <p style={{ margin:"2px 0 0", fontSize:11, color:"#9CA3AF" }}>{desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}

export default App;
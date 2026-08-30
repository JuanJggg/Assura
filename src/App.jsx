import React, { useEffect, useState } from "react";
import "./App.css";
import Menu from "./components/menu";
import Header from "./components/header";
import API from "./services/api";
import { useNavigate } from "react-router-dom";
import Toast from "./components/util/alert.jsx";

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

// ─── SVG Icons ────────────────────────────────────────────
const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" width="14" height="14">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8"/>
    <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
);

const XIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const BookIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const DollarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" width="14" height="14">
    <line x1="12" y1="1" x2="12" y2="23" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

function App() {
  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem("usuario")) || {};
  const [asesoresRaw, setAsesoresRaw] = useState([]);
  const [comentario, setComentario] = useState([]);
  const [loadingAsesor, setLoadingAsesor] = useState(null);
  const [selectedAsesor, setSelectedAsesor] = useState(null);
  const [selectedHorario, setSelectedHorario] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => { getAsesores(); getComentarios(); }, []);

  const getAsesores = async () => {
    try {
      const res = await API.post("/dasboard/getAsesores");
      setAsesoresRaw(res.data);
    } catch {}
  };

  const getComentarios = async () => {
    try {
      const res = await API.post("/dasboard/getComentario");
      setComentario(res.data);
    } catch {}
  };

  // Agrupar asesores por id_asesor para las tarjetas
  const asesoresAgrupados = asesoresRaw.reduce((acc, item) => {
    const existing = acc.find(a => a.id_asesor === item.id_asesor);
    const horario = {
      id_asesoria: item.id_asesoria,
      materia: item.materia,
      descripcion: item.descripcion,
      precio_hora: item.precio_hora,
      precio_sesion: item.precio_sesion,
      hora_inicial: item.hora_inicial,
      hora_final: item.hora_final,
    };
    if (existing) {
      existing.asesorias.push(horario);
      if (!existing.materias.includes(item.materia)) {
        existing.materias.push(item.materia);
      }
    } else {
      acc.push({
        id_asesor: item.id_asesor,
        nombre: item.asesor,
        telefono: item.telefono,
        carrera: item.carrera,
        materias: [item.materia],
        asesorias: [horario],
      });
    }
    return acc;
  }, []);

  const formatDate = (date) => date.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });

  const formatTime = (time) => {
    if (!time) return "";
    const parts = time.split(":");
    const h = parseInt(parts[0]);
    const m = parts[1];
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 || 12;
    return `${h12}:${m} ${ampm}`;
  };

  const handleOpenModal = (asesor) => {
    setSelectedAsesor(asesor);
    setSelectedHorario(null);
  };

  const handleCloseModal = () => {
    setSelectedAsesor(null);
    setSelectedHorario(null);
  };

  const handleContactar = async () => {
    if (!usuario?.id) {
      setToast({ type: 'error', message: 'Debes iniciar sesión primero' });
      setTimeout(() => navigate("/"), 1500);
      return;
    }
    if (usuario.rol === 'Asesor' || usuario.rol === 'Admin') {
      setToast({ type: 'warning', message: 'Solo los estudiantes pueden contactar asesores para asesorías' });
      handleCloseModal();
      return;
    }
    if (!selectedAsesor) return;
    setLoadingAsesor(selectedAsesor.id_asesor);
    try {
      const res = await API.post("/chat/crearConversacion", { id_estudiante: usuario.id, id_asesor: selectedAsesor.id_asesor });
      if (res.data.ok) {
        handleCloseModal();
        navigate("/Chatstudy", { state: { chatId: res.data.conversacion.id } });
      } else {
        setToast({ type: 'error', message: 'No se pudo crear la conversación' });
      }
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.error || 'No se pudo iniciar el chat.' });
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
        @keyframes modalFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes modalSlideIn { from { opacity: 0; transform: translateY(30px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .modal-overlay { animation: modalFadeIn 0.2s ease; }
        .modal-content { animation: modalSlideIn 0.3s ease; }
        .horario-option { transition: all 0.2s ease; cursor: pointer; }
        .horario-option:hover { border-color: #DC2626 !important; background: #FFF5F5 !important; }
        .horario-option.selected { border-color: #DC2626 !important; background: #FEF2F2 !important; box-shadow: 0 0 0 3px rgba(220,38,38,0.1); }
        .modal-contactar:hover:not(:disabled) { background: #B91C1C !important; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(220,38,38,0.4) !important; }
        .modal-contactar { transition: all 0.2s ease; }
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
                { label: "Asesores disponibles", value: asesoresAgrupados.length, color: "#DC2626", icon: <svg viewBox="0 0 24 24" fill="none" width="22" height="22"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.8"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg> },
                { label: "Comentarios en foro", value: comentario.length, color: "#7C3AED", icon: <svg viewBox="0 0 24 24" fill="none" width="22" height="22"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg> },
                { label: "Mi carrera", value: usuario.carrera || "—", color: "#2563EB", icon: <svg viewBox="0 0 24 24" fill="none" width="22" height="22"><path d="M22 10v6M2 10l10-5 10 5-10 5z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><path d="M6 12v5c3 3 9 3 12 0v-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg> },
              ].map(({ label, value, color, icon }) => (
                <div key={label} style={{ background: "white", borderRadius: 14, padding: "18px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", borderLeft: `4px solid ${color}`, display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: `${color}12`, display: "flex", alignItems: "center", justifyContent: "center", color, flexShrink: 0 }}>{icon}</div>
                  <div>
                    <p style={{ margin: 0, fontSize: typeof value === 'string' && value.length > 10 ? 14 : 22, fontWeight: 800, color: "#111827" }}>{value}</p>
                    <p style={{ margin: "2px 0 0", fontSize: 12, color: "#6B7280", fontWeight: 500 }}>{label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Asesores */}
            <div style={{ marginBottom: 32 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#111827" }}>Asesores disponibles</h2>
                <span style={{ fontSize: 12, color: "#9CA3AF" }}>{asesoresAgrupados.length} disponibles</span>
              </div>
              {asesoresAgrupados.length === 0 ? (
                <div style={{ textAlign: "center", padding: "48px 20px", background: "white", borderRadius: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                  <p style={{ color: "#9CA3AF", fontSize: 14 }}>No hay asesores disponibles en este momento.</p>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))", gap: 16 }}>
                  {asesoresAgrupados.map((asesor) => (
                    <div key={asesor.id_asesor} className="asesor-card" style={{ background: "white", borderRadius: 16, padding: "24px 20px", boxShadow: "0 2px 8px rgba(0,0,0,0.07)", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                      <Avatar name={asesor.nombre} size={60} fontSize={22} />
                      <h3 style={{ margin: "12px 0 4px", fontSize: 15, fontWeight: 700, color: "#111827" }}>{asesor.nombre || "Sin nombre"}</h3>
                      <p style={{ margin: "0 0 2px", fontSize: 11, color: "#6B7280" }}>{asesor.carrera || ""}</p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4, justifyContent: "center", margin: "6px 0 4px" }}>
                        {asesor.materias.map((m, i) => (
                          <span key={i} style={{ background: "#FEF2F2", color: "#DC2626", padding: "2px 8px", borderRadius: 12, fontSize: 11, fontWeight: 600 }}>{m}</span>
                        ))}
                      </div>
                      <p style={{ margin: "2px 0 14px", fontSize: 11, color: "#9CA3AF" }}>
                        {asesor.asesorias.length} horario{asesor.asesorias.length > 1 ? "s" : ""} disponible{asesor.asesorias.length > 1 ? "s" : ""}
                      </p>
                      <button
                        className="contact-btn"
                        onClick={() => handleOpenModal(asesor)}
                        style={{ width: "100%", padding: "9px", borderRadius: 9, border: "none", background: "#DC2626", color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer", boxShadow: "0 2px 8px rgba(220,38,38,0.25)" }}
                      >
                        Ver info y contactar
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

      {/* ═══════════ MODAL FLOTANTE DE ASESOR ═══════════ */}
      {selectedAsesor && (
        <div className="modal-overlay" style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 100, backdropFilter: "blur(4px)"
        }} onClick={handleCloseModal}>
          <div className="modal-content" style={{
            background: "white", borderRadius: 20, width: "100%", maxWidth: 560,
            maxHeight: "85vh", overflow: "hidden", display: "flex", flexDirection: "column",
            boxShadow: "0 25px 80px rgba(0,0,0,0.2)"
          }} onClick={e => e.stopPropagation()}>

            {/* Header del modal */}
            <div style={{
              background: "linear-gradient(135deg, #DC2626, #991B1B)",
              padding: "24px 28px", color: "white", position: "relative",
              flexShrink: 0
            }}>
              <button onClick={handleCloseModal} style={{
                position: "absolute", top: 16, right: 16, background: "rgba(255,255,255,0.15)",
                border: "none", borderRadius: "50%", width: 36, height: 36,
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", color: "white", transition: "background 0.15s"
              }}
                onMouseOver={e => e.currentTarget.style.background = "rgba(255,255,255,0.25)"}
                onMouseOut={e => e.currentTarget.style.background = "rgba(255,255,255,0.15)"}
              >
                <XIcon />
              </button>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <Avatar name={selectedAsesor.nombre} size={56} fontSize={22} />
                <div>
                  <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>{selectedAsesor.nombre}</h2>
                  <p style={{ margin: "4px 0 0", fontSize: 13, opacity: 0.85 }}>{selectedAsesor.carrera || "Asesor académico"}</p>
                  {selectedAsesor.telefono && (
                    <p style={{ margin: "2px 0 0", fontSize: 12, opacity: 0.7 }}>📞 {selectedAsesor.telefono}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Cuerpo del modal */}
            <div style={{ padding: "20px 28px", overflowY: "auto", flex: 1 }}>
              {/* Materias */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <div style={{ color: "#DC2626" }}><BookIcon /></div>
                  <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#111827" }}>Materias disponibles</h3>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {selectedAsesor.materias.map((m, i) => (
                    <span key={i} style={{
                      background: "#FEF2F2", color: "#DC2626",
                      padding: "4px 12px", borderRadius: 20,
                      fontSize: 12, fontWeight: 600
                    }}>{m}</span>
                  ))}
                </div>
              </div>

              {/* Separador */}
              <div style={{ height: 1, background: "#F3F4F6", margin: "16px 0" }} />

              {/* Horarios disponibles */}
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <div style={{ color: "#DC2626" }}><ClockIcon /></div>
                  <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#111827" }}>
                    Horarios disponibles
                    {selectedAsesor.asesorias.length > 1 && (
                      <span style={{ fontWeight: 400, color: "#6B7280", fontSize: 12, marginLeft: 6 }}>
                        (selecciona uno)
                      </span>
                    )}
                  </h3>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {selectedAsesor.asesorias.map((asesoria, idx) => {
                    const isSelected = selectedHorario === idx;
                    return (
                      <div
                        key={idx}
                        className={`horario-option${isSelected ? " selected" : ""}`}
                        onClick={() => setSelectedHorario(idx)}
                        style={{
                          border: `2px solid ${isSelected ? "#DC2626" : "#E5E7EB"}`,
                          borderRadius: 14, padding: "14px 18px",
                          background: isSelected ? "#FEF2F2" : "white",
                          position: "relative"
                        }}
                      >
                        {/* Radio indicator */}
                        <div style={{
                          position: "absolute", top: 14, right: 16,
                          width: 20, height: 20, borderRadius: "50%",
                          border: `2px solid ${isSelected ? "#DC2626" : "#D1D5DB"}`,
                          display: "flex", alignItems: "center", justifyContent: "center"
                        }}>
                          {isSelected && (
                            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#DC2626" }} />
                          )}
                        </div>

                        {/* Materia */}
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                          <span style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>{asesoria.materia}</span>
                        </div>

                        {/* Descripción */}
                        {asesoria.descripcion && (
                          <p style={{ margin: "0 0 8px", fontSize: 12, color: "#6B7280", lineHeight: 1.5, paddingRight: 30 }}>
                            {asesoria.descripcion}
                          </p>
                        )}

                        {/* Horario y precios */}
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#374151" }}>
                            <ClockIcon />
                            <span style={{ fontSize: 12, fontWeight: 600 }}>
                              {formatTime(asesoria.hora_inicial)} - {formatTime(asesoria.hora_final)}
                            </span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#059669" }}>
                            <DollarIcon />
                            <span style={{ fontSize: 12, fontWeight: 600 }}>
                              ${asesoria.precio_hora}/hora
                            </span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#7C3AED" }}>
                            <DollarIcon />
                            <span style={{ fontSize: 12, fontWeight: 600 }}>
                              ${asesoria.precio_sesion}/sesión
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer del modal */}
            <div style={{
              padding: "16px 28px", borderTop: "1px solid #F3F4F6",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              flexShrink: 0, background: "#FAFAFA"
            }}>
              <button onClick={handleCloseModal} style={{
                padding: "10px 22px", borderRadius: 10,
                border: "1.5px solid #E5E7EB", background: "white",
                fontSize: 13, fontWeight: 600, color: "#374151",
                cursor: "pointer", transition: "all 0.15s"
              }}>
                Cancelar
              </button>
              <button
                className="modal-contactar"
                onClick={handleContactar}
                disabled={loadingAsesor === selectedAsesor.id_asesor || (selectedAsesor.asesorias.length > 1 && selectedHorario === null)}
                style={{
                  padding: "10px 28px", borderRadius: 10, border: "none",
                  background: (selectedAsesor.asesorias.length > 1 && selectedHorario === null) ? "#E5E7EB" : "linear-gradient(135deg, #DC2626, #B91C1C)",
                  color: (selectedAsesor.asesorias.length > 1 && selectedHorario === null) ? "#9CA3AF" : "white",
                  fontSize: 13, fontWeight: 700,
                  cursor: (selectedAsesor.asesorias.length > 1 && selectedHorario === null) ? "not-allowed" : "pointer",
                  boxShadow: (selectedAsesor.asesorias.length > 1 && selectedHorario === null) ? "none" : "0 4px 14px rgba(220,38,38,0.3)",
                  display: "flex", alignItems: "center", gap: 8
                }}
              >
                {loadingAsesor === selectedAsesor.id_asesor ? (
                  <>
                    <div style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", animation: "spin 0.7s linear infinite" }} />
                    Conectando...
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Iniciar conversación
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}

export default App;
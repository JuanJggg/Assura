import React, { useEffect, useState } from "react";
import API from "../../services/api";
import Header from "../header";
import Menu from "../menu";

// ─── Avatar helper ────────────────────────────────────────────
function Avatar({ name, size = 38, fontSize = 14 }) {
  const colors = ["#DC2626","#B91C1C","#059669","#047857","#D97706","#B45309"];
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

// ─── SVG Icons ────────────────────────────────────────────────
const StatsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" width="18" height="18"><path d="M18 20V10M12 20V4M6 20v-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
);
const UsersIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" width="18" height="18"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.8"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
);
const ForumIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" width="18" height="18"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
);
const ChatIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" width="18" height="18"><path d="M8 12h.01M12 12h.01M16 12h.01" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
);
const BlockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" width="16" height="16"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/><path d="M4.93 4.93l14.14 14.14" stroke="currentColor" strokeWidth="2"/></svg>
);
const UnblockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" width="16" height="16"><path d="M5 12l5 5L20 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
);
const TrashIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" width="15" height="15"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
);
const EyeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" width="15" height="15"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8"/></svg>
);
const BackIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" width="16" height="16"><path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
);
const StarIcon = ({ filled }) => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill={filled ? "#D97706" : "none"} stroke={filled ? "#D97706" : "#D1D5DB"} strokeWidth="2">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
);

// ─── Card SVG Icons ──────────────────────────────────────────
const CardStudentIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" width="22" height="22"><path d="M22 10v6M2 10l10-5 10 5-10 5z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><path d="M6 12v5c3 3 9 3 12 0v-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
);
const CardTeacherIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" width="22" height="22"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.8"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
);
const CardBlockedIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" width="22" height="22"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8"/><path d="M4.93 4.93l14.14 14.14" stroke="currentColor" strokeWidth="1.8"/></svg>
);
const CardForumIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" width="22" height="22"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
);
const CardCommentIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" width="22" height="22"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
);
const CardTestIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" width="22" height="22"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><path d="M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><path d="M9 14l2 2 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
);
const CardCheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" width="22" height="22"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><path d="M22 4L12 14.01l-3-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
);
const CardChatIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" width="22" height="22"><path d="M8 12h.01M12 12h.01M16 12h.01" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
);
const TrendUpIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" width="18" height="18"><path d="M23 6l-9.5 9.5-5-5L1 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M17 6h6v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
);
const BookIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" width="18" height="18"><path d="M4 19.5A2.5 2.5 0 016.5 17H20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
);
const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" width="28" height="28"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
);

const TABS = [
  { id: "stats", label: "Estadísticas", icon: <StatsIcon /> },
  { id: "users", label: "Usuarios", icon: <UsersIcon /> },
  { id: "forum", label: "Foro", icon: <ForumIcon /> },
  { id: "chats", label: "Chats", icon: <ChatIcon /> },
];

function AdminPanel() {
  const [activeTab, setActiveTab] = useState("stats");
  const [stats, setStats] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [foros, setForos] = useState([]);
  const [comentarios, setComentarios] = useState([]);
  const [conversaciones, setConversaciones] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [mensajes, setMensajes] = useState([]);
  const [chatInfo, setChatInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchUsers, setSearchUsers] = useState("");
  const [filterRol, setFilterRol] = useState("Todos");
  const [filterEstado, setFilterEstado] = useState("Todos");
  const [expandedForo, setExpandedForo] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    if (activeTab === "stats") loadStats();
    if (activeTab === "users") loadUsuarios();
    if (activeTab === "forum") loadForos();
    if (activeTab === "chats") loadConversaciones();
  }, [activeTab]);

  const loadStats = async () => {
    try {
      const res = await API.post("/admin/estadisticas");
      if (res.data.ok) setStats(res.data.estadisticas);
    } catch (err) { console.error("Error stats:", err); }
  };

  const loadUsuarios = async () => {
    try {
      const res = await API.post("/admin/usuarios");
      if (res.data.ok) setUsuarios(res.data.usuarios);
    } catch (err) { console.error("Error usuarios:", err); }
  };

  const loadForos = async () => {
    try {
      const res = await API.post("/admin/foros");
      if (res.data.ok) {
        setForos(res.data.foros);
        setComentarios(res.data.comentarios);
      }
    } catch (err) { console.error("Error foros:", err); }
  };

  const loadConversaciones = async () => {
    try {
      const res = await API.post("/admin/conversaciones");
      if (res.data.ok) setConversaciones(res.data.conversaciones);
    } catch (err) { console.error("Error chats:", err); }
  };

  const toggleBloqueo = async (id, rol, nuevoEstado) => {
    setLoading(true);
    try {
      await API.post("/admin/toggleBloqueo", { id, rol, bloqueado: nuevoEstado });
      loadUsuarios();
    } catch (err) { console.error("Error bloqueo:", err); }
    setLoading(false);
    setConfirmAction(null);
  };

  const eliminarComentario = async (id) => {
    try {
      await API.post("/admin/eliminarComentario", { id });
      loadForos();
    } catch (err) { console.error("Error eliminar comentario:", err); }
    setConfirmAction(null);
  };

  const eliminarForo = async (id) => {
    try {
      await API.post("/admin/eliminarForo", { id });
      loadForos();
      setExpandedForo(null);
    } catch (err) { console.error("Error eliminar foro:", err); }
    setConfirmAction(null);
  };

  const verMensajes = async (id_conversacion) => {
    try {
      const res = await API.post("/admin/mensajes", { id_conversacion });
      if (res.data.ok) {
        setMensajes(res.data.mensajes);
        setChatInfo(res.data.conversacion);
        setSelectedChat(id_conversacion);
      }
    } catch (err) { console.error("Error mensajes:", err); }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
  const formatDateTime = (d) => new Date(d).toLocaleString("es-ES", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

  // Filtrar usuarios
  const filteredUsers = usuarios.filter(u => {
    const matchSearch = u.nombres?.toLowerCase().includes(searchUsers.toLowerCase()) ||
                        u.apellidos?.toLowerCase().includes(searchUsers.toLowerCase()) ||
                        u.email?.toLowerCase().includes(searchUsers.toLowerCase());
    const matchRol = filterRol === "Todos" || u.rol === filterRol;
    const matchEstado = filterEstado === "Todos" || 
                        (filterEstado === "Activo" && !u.bloqueado) || 
                        (filterEstado === "Bloqueado" && u.bloqueado);
    return matchSearch && matchRol && matchEstado;
  });

  // ─── Simple Bar Chart Component ──────────────────────────────
  const BarChart = ({ data, maxHeight = 120 }) => {
    if (!data || data.length === 0) return <p style={{ color: "#9CA3AF", fontSize: 13 }}>Sin datos disponibles</p>;
    const maxVal = Math.max(...data.map(d => d.value), 1);
    return (
      <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: maxHeight, padding: "0 4px" }}>
        {data.map((d, i) => (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: "#374151" }}>{d.value}</span>
            <div style={{
              width: "100%", maxWidth: 40,
              height: `${Math.max((d.value / maxVal) * (maxHeight - 30), 4)}px`,
              background: `linear-gradient(180deg, ${d.color || "#DC2626"}, ${d.color || "#DC2626"}88)`,
              borderRadius: "4px 4px 0 0",
              transition: "height 0.5s ease"
            }} />
            <span style={{ fontSize: 9, color: "#9CA3AF", textAlign: "center", lineHeight: 1.2 }}>{d.label}</span>
          </div>
        ))}
      </div>
    );
  };

  // ─── Confirm Modal ──────────────────────────────────────────
  const ConfirmModal = () => {
    if (!confirmAction) return null;
    return (
      <div style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex",
        alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(4px)"
      }}>
        <div style={{
          background: "white", borderRadius: 16, padding: "28px 32px", maxWidth: 400, width: "90%",
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)", animation: "modalIn 0.2s ease"
        }}>
          <h3 style={{ margin: "0 0 8px", fontSize: 17, fontWeight: 700, color: "#111827" }}>
            {confirmAction.title}
          </h3>
          <p style={{ margin: "0 0 24px", fontSize: 14, color: "#6B7280", lineHeight: 1.6 }}>
            {confirmAction.message}
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button onClick={() => setConfirmAction(null)} style={{
              padding: "9px 20px", borderRadius: 9, border: "1.5px solid #E5E7EB",
              background: "white", color: "#374151", fontSize: 13, fontWeight: 600,
              cursor: "pointer", fontFamily: "inherit"
            }}>Cancelar</button>
            <button onClick={confirmAction.onConfirm} style={{
              padding: "9px 20px", borderRadius: 9, border: "none",
              background: confirmAction.danger ? "linear-gradient(135deg,#DC2626,#B91C1C)" : "linear-gradient(135deg,#059669,#047857)",
              color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
              boxShadow: confirmAction.danger ? "0 2px 8px rgba(220,38,38,0.3)" : "0 2px 8px rgba(5,150,105,0.3)"
            }}>Confirmar</button>
          </div>
        </div>
      </div>
    );
  };

  // ─── RENDER: Estadísticas ──────────────────────────────────
  const renderStats = () => {
    if (!stats) return <div style={{ textAlign: "center", padding: 60 }}><div className="admin-spinner" /></div>;

    const cards = [
      { label: "Estudiantes", value: stats.totalEstudiantes, color: "#DC2626", icon: <CardStudentIcon /> },
      { label: "Asesores", value: stats.totalAsesores, color: "#059669", icon: <CardTeacherIcon /> },
      { label: "Bloqueados", value: stats.totalBloqueados, color: "#B91C1C", icon: <CardBlockedIcon /> },
      { label: "Temas en foro", value: stats.totalForos, color: "#D97706", icon: <CardForumIcon /> },
      { label: "Comentarios", value: stats.totalComentarios, color: "#059669", icon: <CardCommentIcon /> },
      { label: "Pruebas creadas", value: stats.totalPruebas, color: "#DC2626", icon: <CardTestIcon /> },
      { label: "Pruebas completadas", value: stats.pruebasCompletadas, color: "#059669", icon: <CardCheckIcon /> },
      { label: "Chats activos", value: stats.totalChats, color: "#D97706", icon: <CardChatIcon /> },
    ];

    const chartData = stats.materiasPop?.map((m, i) => ({
      label: m.nombre?.substring(0, 8) || "—",
      value: parseInt(m.total_asesores) || 0,
      color: ["#DC2626", "#059669", "#D97706", "#B91C1C", "#047857"][i % 5]
    })) || [];

    return (
      <div style={{ animation: "fadeIn 0.3s ease" }}>
        {/* Metric Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14, marginBottom: 28 }}>
          {cards.map(c => (
            <div key={c.label} style={{
              background: "white", borderRadius: 14, padding: "18px 20px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)", borderLeft: `4px solid ${c.color}`,
              display: "flex", alignItems: "center", gap: 14, transition: "transform 0.2s",
            }} className="admin-stat-card">
              <div style={{ width: 48, height: 48, borderRadius: 12, background: `${c.color}12`, display: "flex", alignItems: "center", justifyContent: "center", color: c.color, flexShrink: 0 }}>{c.icon}</div>
              <div>
                <p style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#111827" }}>{c.value}</p>
                <p style={{ margin: "2px 0 0", fontSize: 12, color: "#6B7280", fontWeight: 500 }}>{c.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
          {/* Mejora promedio */}
          <div style={{ background: "white", borderRadius: 16, padding: "22px 24px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700, color: "#111827", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: "#059669" }}><TrendUpIcon /></span> Mejora Promedio PRE → POST
            </h3>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{
                width: 90, height: 90, borderRadius: "50%",
                background: `conic-gradient(${stats.promedioMejora > 0 ? "#059669" : "#DC2626"} ${Math.abs(stats.promedioMejora) * 3.6}deg, #F3F4F6 0deg)`,
                display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                <div style={{
                  width: 70, height: 70, borderRadius: "50%", background: "white",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 18, fontWeight: 800, color: stats.promedioMejora > 0 ? "#059669" : "#DC2626"
                }}>
                  {stats.promedioMejora > 0 ? "+" : ""}{stats.promedioMejora}%
                </div>
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#374151" }}>
                  {stats.promedioMejora > 0 ? "Mejora positiva" : stats.promedioMejora === 0 ? "Sin datos suficientes" : "Necesita atención"}
                </p>
                <p style={{ margin: "4px 0 0", fontSize: 12, color: "#9CA3AF" }}>
                  Diferencia promedio entre pruebas PRE y POST
                </p>
              </div>
            </div>
          </div>

          {/* Materias populares */}
          <div style={{ background: "white", borderRadius: 16, padding: "22px 24px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700, color: "#111827", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: "#D97706" }}><BookIcon /></span> Materias con más Asesores
            </h3>
            <BarChart data={chartData} maxHeight={110} />
          </div>
        </div>

        {/* Top Asesores */}
        <div style={{ background: "white", borderRadius: 16, padding: "22px 24px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700, color: "#111827", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: "#D97706" }}><StarIcon filled /></span> Asesores Mejor Evaluados
          </h3>
          {stats.topAsesores?.length === 0 ? (
            <p style={{ color: "#9CA3AF", fontSize: 13 }}>Aún no hay evaluaciones</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {stats.topAsesores?.map((a, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 14, padding: "12px 16px",
                  background: i === 0 ? "#FEF3C7" : "#F9FAFB", borderRadius: 10,
                  border: i === 0 ? "1.5px solid #FCD34D" : "1px solid #F3F4F6"
                }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: i === 0 ? "#D97706" : i === 1 ? "#9CA3AF" : i === 2 ? "#B45309" : "#E5E7EB", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 12, fontWeight: 800, flexShrink: 0 }}>
                    {i + 1}
                  </div>
                  <Avatar name={a.nombre} size={36} fontSize={14} />
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#111827" }}>{a.nombre}</p>
                    <p style={{ margin: "2px 0 0", fontSize: 12, color: "#6B7280" }}>{a.evaluaciones} evaluaciones</p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                    {[1,2,3,4,5].map(s => <StarIcon key={s} filled={s <= Math.round(parseFloat(a.promedio))} />)}
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#D97706", marginLeft: 6 }}>{a.promedio}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // ─── RENDER: Usuarios ──────────────────────────────────────
  const renderUsers = () => (
    <div style={{ animation: "fadeIn 0.3s ease" }}>
      {/* Filters */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <svg viewBox="0 0 24 24" fill="none" width="16" height="16" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}>
            <circle cx="11" cy="11" r="8" stroke="#9CA3AF" strokeWidth="2"/><path d="M21 21l-4.35-4.35" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <input
            type="text" placeholder="Buscar por nombre o email..."
            value={searchUsers} onChange={e => setSearchUsers(e.target.value)}
            className="admin-input"
            style={{
              width: "100%", padding: "10px 14px 10px 38px", borderRadius: 10,
              border: "1.5px solid #E5E7EB", fontSize: 13, fontFamily: "inherit",
              background: "white", color: "#374151", boxSizing: "border-box"
            }}
          />
        </div>
        <select value={filterRol} onChange={e => setFilterRol(e.target.value)}
          style={{ padding: "10px 16px", borderRadius: 10, border: "1.5px solid #E5E7EB", fontSize: 13, fontFamily: "inherit", background: "white", color: "#374151", cursor: "pointer" }}>
          <option value="Todos">Todos los roles</option>
          <option value="Estudiante">Estudiantes</option>
          <option value="Asesor">Asesores</option>
        </select>
        <select value={filterEstado} onChange={e => setFilterEstado(e.target.value)}
          style={{ padding: "10px 16px", borderRadius: 10, border: "1.5px solid #E5E7EB", fontSize: 13, fontFamily: "inherit", background: "white", color: "#374151", cursor: "pointer" }}>
          <option value="Todos">Todos los estados</option>
          <option value="Activo">Activos</option>
          <option value="Bloqueado">Bloqueados</option>
        </select>
      </div>

      {/* Count */}
      <p style={{ margin: "0 0 14px", fontSize: 13, color: "#6B7280" }}>
        Mostrando <strong style={{ color: "#111827" }}>{filteredUsers.length}</strong> de {usuarios.length} usuarios
      </p>

      {/* User Table */}
      <div style={{ background: "white", borderRadius: 14, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "#F9FAFB", borderBottom: "1.5px solid #E5E7EB" }}>
              {["Usuario", "Email", "Rol", "Carrera", "Teléfono", "Estado", "Acción"].map(h => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: "40px 16px", textAlign: "center", color: "#9CA3AF" }}>No se encontraron usuarios</td></tr>
            ) : filteredUsers.map((u, i) => (
              <tr key={`${u.rol}-${u.id}`} style={{ borderBottom: "1px solid #F3F4F6", transition: "background 0.15s" }}
                className="admin-row">
                <td style={{ padding: "12px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Avatar name={u.nombres} size={32} fontSize={12} />
                    <span style={{ fontWeight: 600, color: "#111827" }}>{u.nombres} {u.apellidos}</span>
                  </div>
                </td>
                <td style={{ padding: "12px 16px", color: "#6B7280" }}>{u.email}</td>
                <td style={{ padding: "12px 16px" }}>
                  <span style={{
                    padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700,
                    background: u.rol === "Asesor" ? "#D1FAE5" : "#FEF3C7",
                    color: u.rol === "Asesor" ? "#059669" : "#D97706"
                  }}>{u.rol}</span>
                </td>
                <td style={{ padding: "12px 16px", color: "#6B7280", fontSize: 12 }}>{u.carrera || "—"}</td>
                <td style={{ padding: "12px 16px", color: "#6B7280", fontSize: 12 }}>{u.telefono || "—"}</td>
                <td style={{ padding: "12px 16px" }}>
                  <span style={{
                    padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700,
                    background: u.bloqueado ? "#FEE2E2" : "#D1FAE5",
                    color: u.bloqueado ? "#DC2626" : "#059669"
                  }}>{u.bloqueado ? "Bloqueado" : "Activo"}</span>
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <button
                    disabled={loading}
                    onClick={() => setConfirmAction({
                      title: u.bloqueado ? "Desbloquear usuario" : "Bloquear usuario",
                      message: u.bloqueado
                        ? `¿Deseas desbloquear a ${u.nombres} ${u.apellidos}? Podrá volver a iniciar sesión.`
                        : `¿Deseas bloquear a ${u.nombres} ${u.apellidos}? No podrá iniciar sesión hasta que lo desbloquees.`,
                      danger: !u.bloqueado,
                      onConfirm: () => toggleBloqueo(u.id, u.rol, !u.bloqueado)
                    })}
                    className="admin-action-btn"
                    style={{
                      display: "flex", alignItems: "center", gap: 6,
                      padding: "6px 14px", borderRadius: 8, border: "none",
                      background: u.bloqueado ? "#D1FAE5" : "#FEE2E2",
                      color: u.bloqueado ? "#059669" : "#DC2626",
                      fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit"
                    }}
                  >
                    {u.bloqueado ? <><UnblockIcon /> Desbloquear</> : <><BlockIcon /> Bloquear</>}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // ─── RENDER: Foro ──────────────────────────────────────────
  const renderForum = () => (
    <div style={{ animation: "fadeIn 0.3s ease" }}>
      <p style={{ margin: "0 0 16px", fontSize: 13, color: "#6B7280" }}>
        <strong style={{ color: "#111827" }}>{foros.length}</strong> temas · <strong style={{ color: "#111827" }}>{comentarios.length}</strong> comentarios totales
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {foros.length === 0 ? (
          <div style={{ textAlign: "center", padding: 48, background: "white", borderRadius: 14, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <p style={{ color: "#9CA3AF", fontSize: 14 }}>No hay temas en el foro</p>
          </div>
        ) : foros.map(foro => {
          const foroComentarios = comentarios.filter(c => c.id_foro === foro.id);
          const isExpanded = expandedForo === foro.id;
          return (
            <div key={foro.id} style={{
              background: "white", borderRadius: 14, boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              overflow: "hidden", border: isExpanded ? "1.5px solid #FEE2E2" : "1.5px solid transparent",
              transition: "border-color 0.2s"
            }}>
              {/* Foro Header */}
              <div style={{ padding: "18px 22px", display: "flex", alignItems: "flex-start", gap: 14 }}>
                <div style={{ cursor: "pointer", flex: 1 }} onClick={() => setExpandedForo(isExpanded ? null : foro.id)}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                    <Avatar name={foro.creado_por} size={36} fontSize={13} />
                    <div>
                      <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#111827" }}>{foro.titulo}</h3>
                      <div style={{ display: "flex", gap: 12, marginTop: 2 }}>
                        <span style={{ fontSize: 11, color: "#9CA3AF" }}>Por <strong style={{ color: "#374151" }}>{foro.creado_por}</strong></span>
                        <span style={{ fontSize: 11, color: "#9CA3AF" }}>{formatDate(foro.fecha)}</span>
                        <span style={{ fontSize: 11, color: "#DC2626", fontWeight: 700 }}>{foro.total_comentarios} comentarios</span>
                      </div>
                    </div>
                  </div>
                  <p style={{ margin: "8px 0 0", fontSize: 13, color: "#6B7280", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: isExpanded ? "none" : 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {foro.descripcion}
                  </p>
                </div>
                <button
                  onClick={() => setConfirmAction({
                    title: "Eliminar tema del foro",
                    message: `¿Eliminar "${foro.titulo}" y todos sus ${foro.total_comentarios} comentarios? Esta acción no se puede deshacer.`,
                    danger: true,
                    onConfirm: () => eliminarForo(foro.id)
                  })}
                  className="admin-action-btn"
                  style={{
                    display: "flex", alignItems: "center", gap: 5,
                    padding: "6px 12px", borderRadius: 8, border: "none",
                    background: "#FEE2E2", color: "#DC2626",
                    fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", flexShrink: 0
                  }}
                >
                  <TrashIcon /> Eliminar tema
                </button>
              </div>

              {/* Comentarios expandidos */}
              {isExpanded && (
                <div style={{ padding: "0 22px 20px", borderTop: "1px solid #F3F4F6" }}>
                  <h4 style={{ margin: "16px 0 12px", fontSize: 14, fontWeight: 700, color: "#374151" }}>
                    Comentarios ({foroComentarios.length})
                  </h4>
                  {foroComentarios.length === 0 ? (
                    <p style={{ color: "#9CA3AF", fontSize: 13 }}>Sin comentarios</p>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {foroComentarios.map(c => (
                        <div key={c.id} style={{
                          display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 14px",
                          background: "#F9FAFB", borderRadius: 10
                        }}>
                          <Avatar name={c.creado_por} size={30} fontSize={11} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, alignItems: "center" }}>
                              <div>
                                <span style={{ fontSize: 12, fontWeight: 700, color: "#111827" }}>{c.creado_por}</span>
                                <span style={{ fontSize: 11, color: "#9CA3AF", marginLeft: 10 }}>{formatDate(c.fecha)}</span>
                              </div>
                              <button
                                onClick={() => setConfirmAction({
                                  title: "Eliminar comentario",
                                  message: `¿Eliminar el comentario de ${c.creado_por}?`,
                                  danger: true,
                                  onConfirm: () => eliminarComentario(c.id)
                                })}
                                style={{
                                  display: "flex", alignItems: "center", gap: 4,
                                  padding: "4px 10px", borderRadius: 6, border: "none",
                                  background: "#FEE2E2", color: "#DC2626",
                                  fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit"
                                }}
                              >
                                <TrashIcon /> Eliminar
                              </button>
                            </div>
                            <p style={{ margin: 0, fontSize: 13, color: "#374151", lineHeight: 1.6 }}>{c.contenido}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  // ─── RENDER: Chats ──────────────────────────────────────────
  const renderChats = () => {
    if (selectedChat) {
      return (
        <div style={{ animation: "fadeIn 0.3s ease" }}>
          <button onClick={() => { setSelectedChat(null); setMensajes([]); setChatInfo(null); }}
            className="admin-action-btn"
            style={{
              display: "flex", alignItems: "center", gap: 6, marginBottom: 18,
              padding: "8px 16px", borderRadius: 9, border: "1.5px solid #E5E7EB",
              background: "white", color: "#374151", fontSize: 13, fontWeight: 600,
              cursor: "pointer", fontFamily: "inherit"
            }}>
            <BackIcon /> Volver a conversaciones
          </button>

          {chatInfo && (
            <div style={{
              background: "linear-gradient(135deg, #7F1D1D, #991B1B)", borderRadius: 14,
              padding: "18px 22px", marginBottom: 18, display: "flex", alignItems: "center", gap: 16
            }}>
              <Avatar name={chatInfo.estudiante} size={42} fontSize={16} />
              <div>
                <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "white" }}>
                  {chatInfo.estudiante} ↔ {chatInfo.asesor}
                </p>
                <p style={{ margin: "2px 0 0", fontSize: 12, color: "rgba(255,255,255,0.6)" }}>
                  {mensajes.length} mensajes en esta conversación
                </p>
              </div>
            </div>
          )}

          <div style={{
            background: "white", borderRadius: 14, boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            padding: "20px 24px", maxHeight: 500, overflowY: "auto"
          }} className="admin-scroll">
            {mensajes.length === 0 ? (
              <p style={{ color: "#9CA3AF", fontSize: 13, textAlign: "center", padding: 40 }}>Sin mensajes</p>
            ) : mensajes.map(m => (
              <div key={m.id} style={{
                display: "flex", justifyContent: m.remitente_tipo === "asesor" ? "flex-end" : "flex-start",
                marginBottom: 10
              }}>
                <div style={{
                  maxWidth: "70%", padding: "10px 16px", borderRadius: 12,
                  background: m.remitente_tipo === "asesor" ? "linear-gradient(135deg,#DC2626,#B91C1C)" : "#F3F4F6",
                  color: m.remitente_tipo === "asesor" ? "white" : "#111827"
                }}>
                  <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5 }}>{m.contenido}</p>
                  <p style={{
                    margin: "4px 0 0", fontSize: 10,
                    color: m.remitente_tipo === "asesor" ? "rgba(255,255,255,0.6)" : "#9CA3AF",
                    textAlign: "right"
                  }}>
                    {m.remitente_tipo === "asesor" ? "Asesor" : "Estudiante"} · {formatDateTime(m.fecha_envio)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div style={{ animation: "fadeIn 0.3s ease" }}>
        <p style={{ margin: "0 0 16px", fontSize: 13, color: "#6B7280" }}>
          <strong style={{ color: "#111827" }}>{conversaciones.length}</strong> conversaciones registradas
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {conversaciones.length === 0 ? (
            <div style={{ textAlign: "center", padding: 48, background: "white", borderRadius: 14, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
              <p style={{ color: "#9CA3AF", fontSize: 14 }}>No hay conversaciones registradas</p>
            </div>
          ) : conversaciones.map(conv => (
            <div key={conv.id} style={{
              background: "white", borderRadius: 14, padding: "16px 20px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              display: "flex", alignItems: "center", gap: 14, transition: "transform 0.2s"
            }} className="admin-stat-card">
              <div style={{ display: "flex", alignItems: "center", gap: -8 }}>
                <Avatar name={conv.estudiante} size={36} fontSize={13} />
                <Avatar name={conv.asesor} size={36} fontSize={13} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#111827" }}>
                  {conv.estudiante} ↔ {conv.asesor}
                </p>
                <p style={{ margin: "2px 0 0", fontSize: 12, color: "#6B7280", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {conv.ultimo_mensaje || "Sin mensajes"}
                </p>
                <div style={{ display: "flex", gap: 14, marginTop: 4 }}>
                  <span style={{ fontSize: 11, color: "#9CA3AF" }}>{conv.total_mensajes} mensajes</span>
                  <span style={{ fontSize: 11, color: "#9CA3AF" }}>{formatDateTime(conv.ultima_actividad)}</span>
                </div>
              </div>
              <button
                onClick={() => verMensajes(conv.id)}
                className="admin-action-btn"
                style={{
                  display: "flex", alignItems: "center", gap: 5,
                  padding: "8px 14px", borderRadius: 8, border: "none",
                  background: "#FEE2E2", color: "#DC2626",
                  fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", flexShrink: 0
                }}
              >
                <EyeIcon /> Ver mensajes
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ─── MAIN RENDER ──────────────────────────────────────────
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes modalIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .admin-stat-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.1) !important; }
        .admin-stat-card { transition: transform 0.2s, box-shadow 0.2s; }
        .admin-row:hover { background: #F9FAFB; }
        .admin-action-btn { transition: all 0.15s; }
        .admin-action-btn:hover { opacity: 0.85; transform: scale(1.02); }
        .admin-input:focus { border-color: #DC2626 !important; outline: none; box-shadow: 0 0 0 3px rgba(220,38,38,0.08); }
        .admin-scroll { scrollbar-width: thin; scrollbar-color: #E5E7EB transparent; }
        .admin-scroll::-webkit-scrollbar { width: 5px; }
        .admin-scroll::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 4px; }
        .admin-spinner { width: 32px; height: 32px; border: 3px solid #F3F4F6; border-top-color: #DC2626; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto; }
        .admin-tab { transition: all 0.2s; }
        .admin-tab:hover { background: #F3F4F6 !important; }
      `}</style>

      <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden", fontFamily: "'Inter',sans-serif" }}>
        <Header />
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          <Menu />
          <main className="admin-scroll" style={{ flex: 1, background: "#F3F4F6", overflowY: "auto", padding: "28px 32px" }}>

            {/* Admin Header */}
            <div style={{
              background: "linear-gradient(135deg, #7F1D1D, #991B1B, #DC2626)",
              borderRadius: 18, padding: "28px 32px", marginBottom: 28,
              display: "flex", alignItems: "center", justifyContent: "space-between",
              boxShadow: "0 8px 32px rgba(220,38,38,0.3)"
            }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <span style={{
                    padding: "3px 12px", borderRadius: 20, fontSize: 11, fontWeight: 700,
                    background: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.9)",
                    backdropFilter: "blur(4px)"
                  }}>ADMIN</span>
                </div>
                <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "white" }}>
                  Panel de Administrador
                </h1>
                <p style={{ margin: "6px 0 0", fontSize: 14, color: "rgba(255,255,255,0.65)" }}>
                  Supervisa y gestiona toda la plataforma Assura
                </p>
              </div>
              <div style={{
                width: 56, height: 56, borderRadius: 14,
                background: "rgba(255,255,255,0.1)", backdropFilter: "blur(8px)",
                display: "flex", alignItems: "center", justifyContent: "center"
              }}><ShieldIcon /></div>
            </div>

            {/* Tabs */}
            <div style={{
              display: "flex", gap: 4, marginBottom: 24, background: "white",
              borderRadius: 12, padding: 4, boxShadow: "0 1px 4px rgba(0,0,0,0.06)"
            }}>
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="admin-tab"
                  style={{
                    flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    padding: "11px 16px", borderRadius: 9, border: "none",
                    background: activeTab === tab.id ? "linear-gradient(135deg,#DC2626,#B91C1C)" : "transparent",
                    color: activeTab === tab.id ? "white" : "#6B7280",
                    fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                    boxShadow: activeTab === tab.id ? "0 3px 10px rgba(220,38,38,0.25)" : "none"
                  }}
                >
                  <span style={{ opacity: activeTab === tab.id ? 1 : 0.6 }}>{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {activeTab === "stats" && renderStats()}
            {activeTab === "users" && renderUsers()}
            {activeTab === "forum" && renderForum()}
            {activeTab === "chats" && renderChats()}

          </main>
        </div>
      </div>

      <ConfirmModal />
    </>
  );
}

export default AdminPanel;

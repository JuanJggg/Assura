import React, { useState, useEffect } from "react";
import Menu from "../menu";
import Header from "../header";
import axios from "axios";

const BACKEND = "http://localhost:3001";

const IconBook = () => <svg viewBox="0 0 24 24" fill="none" width="20" height="20"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const IconAlert = () => <svg viewBox="0 0 24 24" fill="none" width="20" height="20"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8"/><line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>;
const IconCompass = () => <svg viewBox="0 0 24 24" fill="none" width="20" height="20"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/></svg>;
const IconWind = () => <svg viewBox="0 0 24 24" fill="none" width="20" height="20"><path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>;
const IconUsers = () => <svg viewBox="0 0 24 24" fill="none" width="20" height="20"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.8"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>;
const IconMsg = () => <svg viewBox="0 0 24 24" fill="none" width="20" height="20"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const IconTarget = () => <svg viewBox="0 0 24 24" fill="none" width="20" height="20"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8"/><circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="1.8"/><circle cx="12" cy="12" r="2" stroke="currentColor" strokeWidth="1.8"/></svg>;
const IconTrend = () => <svg viewBox="0 0 24 24" fill="none" width="16" height="16"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><polyline points="17 6 23 6 23 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const IconBar = () => <svg viewBox="0 0 24 24" fill="none" width="16" height="16"><line x1="18" y1="20" x2="18" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><line x1="12" y1="20" x2="12" y2="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><line x1="6" y1="20" x2="6" y2="14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>;
const IconList = () => <svg viewBox="0 0 24 24" fill="none" width="16" height="16"><line x1="8" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><line x1="8" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><line x1="8" y1="18" x2="21" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><line x1="3" y1="6" x2="3.01" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><line x1="3" y1="12" x2="3.01" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><line x1="3" y1="18" x2="3.01" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>;

const CATEGORIA_ICONS = {
  metodologia_estudio: <IconBook />,
  dificultades_academicas: <IconAlert />,
  orientacion_academica: <IconCompass />,
  estres_presion: <IconWind />,
  solicitud_asesoria: <IconUsers />,
};

const CATEGORIA_CONFIG = {
  metodologia_estudio:     { nombre: "Metodología de Estudio",     color: "#3B82F6", bg: "#EFF6FF" },
  dificultades_academicas: { nombre: "Dificultades Académicas",    color: "#EF4444", bg: "#FEF2F2" },
  orientacion_academica:   { nombre: "Orientación Académica",      color: "#10B981", bg: "#ECFDF5" },
  estres_presion:          { nombre: "Estrés o Presión Académica", color: "#F59E0B", bg: "#FFFBEB" },
  solicitud_asesoria:      { nombre: "Solicitud de Asesoría",      color: "#8B5CF6", bg: "#F5F3FF" },
};

function StatCard({ svgIcon, titulo, valor, subtitulo, color }) {
  return (
    <div style={{
      background: "white", borderRadius: 16, padding: "20px 24px",
      boxShadow: "0 1px 6px rgba(0,0,0,0.08)", display: "flex", alignItems: "center", gap: 16,
      borderLeft: `4px solid ${color}`
    }}>
      <div style={{
        width: 52, height: 52, borderRadius: 14,
        background: `${color}15`, display: "flex", alignItems: "center", justifyContent: "center", color
      }}>{svgIcon}</div>
      <div>
        <p style={{ margin: 0, fontSize: 28, fontWeight: 800, color: "#1F2937" }}>{valor}</p>
        <p style={{ margin: "2px 0 0 0", fontSize: 14, fontWeight: 600, color: "#374151" }}>{titulo}</p>
        {subtitulo && <p style={{ margin: "2px 0 0 0", fontSize: 12, color: "#9CA3AF" }}>{subtitulo}</p>}
      </div>
    </div>
  );
}

function BarraCategoria({ cat, maxCount }) {
  const pct = maxCount > 0 ? (cat.count / maxCount) * 100 : 0;
  const cfg = CATEGORIA_CONFIG[cat.categoria] || { color: "#6B7280", bg: "#F9FAFB", nombre: cat.categoria };
  const icon = CATEGORIA_ICONS[cat.categoria] || null;
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, alignItems: "center" }}>
        <span style={{ fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", gap: 6, color: cfg.color }}>
          {icon} {cfg.nombre}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 13, color: "#6B7280" }}>{cat.porcentaje}%</span>
          <span style={{
            background: cfg.bg, color: cfg.color, borderRadius: 20,
            padding: "2px 10px", fontSize: 12, fontWeight: 700
          }}>{cat.count}</span>
        </div>
      </div>
      <div style={{ height: 10, background: "#F3F4F6", borderRadius: 8, overflow: "hidden" }}>
        <div style={{
          width: `${pct}%`, height: "100%", background: cfg.color,
          borderRadius: 8, transition: "width 0.8s cubic-bezier(.4,0,.2,1)"
        }} />
      </div>
    </div>
  );
}

export default function ChatbotAsesor() {
  const [stats, setStats] = useState(null);
  const [consultas, setConsultas] = useState([]);
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("dashboard"); // dashboard | consultas | estudiantes
  const [bertActivo, setBertActivo] = useState(null);
  const [detalle, setDetalle] = useState(null);

  useEffect(() => {
    cargarDatos();
    checkBert();
  }, []);

  useEffect(() => {
    cargarConsultas(filtroCategoria);
  }, [filtroCategoria]);

  const checkBert = async () => {
    try {
      const res = await axios.get(`${BACKEND}/chatbot/health`);
      setBertActivo(res.data.python_bert === "activo");
    } catch { setBertActivo(false); }
  };

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [statsRes, consultasRes] = await Promise.all([
        axios.get(`${BACKEND}/chatbot/estadisticas`),
        axios.get(`${BACKEND}/chatbot/consultas?limit=200`),
      ]);
      if (statsRes.data.ok) setStats(statsRes.data);
      if (consultasRes.data.ok) setConsultas(consultasRes.data.consultas);
    } catch (err) {
      console.error("Error al cargar datos:", err);
    } finally {
      setLoading(false);
    }
  };

  const cargarConsultas = async (categoria) => {
    try {
      const url = categoria
        ? `${BACKEND}/chatbot/consultas?categoria=${categoria}&limit=200`
        : `${BACKEND}/chatbot/consultas?limit=200`;
      const res = await axios.get(url);
      if (res.data.ok) setConsultas(res.data.consultas);
    } catch { /* silencioso */ }
  };

  const maxCount = stats?.por_categoria?.reduce((m, c) => Math.max(m, c.count), 0) || 1;

  const TabBtn = ({ id, label, svgIcon }) => (
    <button onClick={() => setTab(id)} style={{
      padding: "10px 20px", borderRadius: 10, border: "none", cursor: "pointer",
      fontWeight: 600, fontSize: 14, transition: "all 0.2s",
      background: tab === id ? "#DC2626" : "transparent",
      color: tab === id ? "white" : "#6B7280",
      display: "flex", alignItems: "center", gap: 6,
    }}>{svgIcon} {label}</button>
  );

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');`}</style>
      <div style={{ display: "flex", flexDirection: "column", height: "100vh", fontFamily: "'Inter',sans-serif" }}>
        <Header />
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          <Menu />
          <main style={{ flex: 1, overflowY: "auto", background: "#F3F4F6", padding: "28px 32px" }}>

            {/* Encabezado */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <div>
                <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: "#1F2937", display: "flex", alignItems: "center", gap: 10 }}>
                  <IconBar /> Panel del Asesor — Chatbot IA
                </h1>
                <p style={{ margin: "4px 0 0 0", color: "#6B7280", fontSize: 14 }}>
                  Monitoreo y análisis de consultas académicas procesadas con BERT
                </p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 6,
                  background: "white", borderRadius: 10, padding: "8px 14px",
                  border: "1px solid #E5E7EB", fontSize: 13
                }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: "50%",
                    background: bertActivo === null ? "#F59E0B" : bertActivo ? "#10B981" : "#EF4444"
                  }} />
                  <span style={{ color: "#374151", fontWeight: 600 }}>
                    BERT: {bertActivo === null ? "Verificando..." : bertActivo ? "Activo" : "Inactivo"}
                  </span>
                </div>
                <button onClick={cargarDatos} style={{
                  padding: "8px 16px", borderRadius: 10, background: "#DC2626",
                  color: "white", border: "none", cursor: "pointer", fontWeight: 600, fontSize: 14,
                  display: "flex", alignItems: "center", gap: 6
                }}><svg viewBox="0 0 24 24" fill="none" width="14" height="14"><path d="M23 4v6h-6M1 20v-6h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> Actualizar</button>
              </div>
            </div>

            {/* Tabs */}
            <div style={{
              display: "flex", gap: 4, marginBottom: 24,
              background: "white", borderRadius: 12, padding: 4,
              boxShadow: "0 1px 4px rgba(0,0,0,0.06)", width: "fit-content"
            }}>
              <TabBtn id="dashboard" label="Dashboard" svgIcon={<IconTrend />} />
              <TabBtn id="consultas" label="Consultas" svgIcon={<IconList />} />
              <TabBtn id="estudiantes" label="Estudiantes" svgIcon={<IconUsers />} />
            </div>

            {loading ? (
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: 300 }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: "50%",
                    border: "4px solid #E5E7EB", borderTopColor: "#DC2626",
                    animation: "spin 0.8s linear infinite", margin: "0 auto 16px"
                  }} />
                  <p style={{ color: "#6B7280" }}>Cargando datos...</p>
                </div>
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
              </div>
            ) : (
              <>
                {/* ═══ TAB DASHBOARD ═══ */}
                {tab === "dashboard" && (
                  <>
                    {/* Stats Cards */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 16, marginBottom: 28 }}>
                      <StatCard svgIcon={<IconMsg />} titulo="Total Consultas" valor={stats?.total_mensajes ?? 0} subtitulo="mensajes procesados" color="#3B82F6" />
                      <StatCard svgIcon={<IconUsers />} titulo="Estudiantes" valor={stats?.total_estudiantes ?? 0} subtitulo="que usaron el chatbot" color="#10B981" />
                      <StatCard svgIcon={<IconTarget />} titulo="Confianza Promedio" valor={`${Math.round((parseFloat(stats?.confianza_promedio || 0)) * 100)}%`} subtitulo="precisión del modelo BERT" color="#8B5CF6" />
                      <StatCard svgIcon={<IconTrend />} titulo="Categoría Principal" valor={CATEGORIA_CONFIG[stats?.por_categoria?.[0]?.categoria]?.nombre?.split(" ")[0] || "—"} subtitulo={CATEGORIA_CONFIG[stats?.por_categoria?.[0]?.categoria]?.nombre || "Sin datos"} color="#F59E0B" />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 20, marginBottom: 24 }}>
                      {/* Gráfico de barras */}
                      <div style={{ background: "white", borderRadius: 16, padding: 24, boxShadow: "0 1px 6px rgba(0,0,0,0.08)" }}>
                        <h3 style={{ margin: "0 0 20px", fontSize: 16, fontWeight: 700, color: "#1F2937", display: "flex", alignItems: "center", gap: 8 }}>
                          <IconBar /> Distribución por Categoría
                        </h3>
                        {!stats?.por_categoria?.length ? (
                          <div style={{ textAlign: "center", padding: "40px 0", color: "#9CA3AF" }}>
                            <div style={{ margin: "0 auto 12px", opacity: 0.25, color: "#9CA3AF" }}><IconBar /></div>
                            <p>Sin datos de clasificación aún.</p>
                            <p style={{ fontSize: 13 }}>Los datos aparecerán cuando los estudiantes usen el chatbot.</p>
                          </div>
                        ) : (
                          stats.por_categoria.map(cat => (
                            <BarraCategoria key={cat.categoria} cat={cat} maxCount={maxCount} />
                          ))
                        )}
                      </div>

                      {/* Leyenda categorías */}
                      <div style={{ background: "white", borderRadius: 16, padding: 24, boxShadow: "0 1px 6px rgba(0,0,0,0.08)" }}>
                        <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700, color: "#1F2937", display: "flex", alignItems: "center", gap: 8 }}>
                          <IconList /> Categorías del Modelo
                        </h3>
                        <p style={{ margin: "0 0 16px", fontSize: 13, color: "#6B7280", lineHeight: 1.5 }}>
                          BERT clasifica cada mensaje en una de estas 5 categorías académicas usando Transfer Learning y similitud semántica.
                        </p>
                        {Object.entries(CATEGORIA_CONFIG).map(([id, cfg]) => (
                          <div key={id} style={{
                            display: "flex", alignItems: "center", gap: 10,
                            padding: "10px 12px", marginBottom: 8, borderRadius: 10,
                            background: cfg.bg, border: `1px solid ${cfg.color}25`, color: cfg.color
                          }}>
                            {CATEGORIA_ICONS[id]}
                            <div>
                              <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: cfg.color }}>{cfg.nombre}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Actividad reciente */}
                    {stats?.actividad_reciente?.length > 0 && (
                      <div style={{ background: "white", borderRadius: 16, padding: 24, boxShadow: "0 1px 6px rgba(0,0,0,0.08)" }}>
                        <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700, color: "#1F2937", display: "flex", alignItems: "center", gap: 8 }}>
                          <IconTrend /> Actividad Últimos 7 Días
                        </h3>
                        <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 80 }}>
                          {stats.actividad_reciente.map((a, i) => {
                            const maxD = Math.max(...stats.actividad_reciente.map(x => parseInt(x.count)));
                            const h = maxD > 0 ? (parseInt(a.count) / maxD) * 70 : 4;
                            return (
                              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                                <span style={{ fontSize: 11, color: "#6B7280", fontWeight: 600 }}>{a.count}</span>
                                <div title={`${a.dia}: ${a.count} consultas`} style={{
                                  width: "100%", height: h, background: "linear-gradient(to top,#DC2626,#F87171)",
                                  borderRadius: "4px 4px 0 0", transition: "height 0.5s", minHeight: 4
                                }} />
                                <span style={{ fontSize: 10, color: "#9CA3AF" }}>
                                  {new Date(a.dia).toLocaleDateString("es-ES", { weekday: "short" })}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* ═══ TAB CONSULTAS ═══ */}
                {tab === "consultas" && (
                  <div style={{ background: "white", borderRadius: 16, boxShadow: "0 1px 6px rgba(0,0,0,0.08)", overflow: "hidden" }}>
                    {/* Filtros */}
                    <div style={{ padding: "16px 20px", borderBottom: "1px solid #F3F4F6", display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <button onClick={() => setFiltroCategoria("")} style={{
                        padding: "6px 16px", borderRadius: 20, border: "1px solid #E5E7EB", cursor: "pointer",
                        background: !filtroCategoria ? "#DC2626" : "white",
                        color: !filtroCategoria ? "white" : "#374151", fontSize: 13, fontWeight: 600
                      }}>Todas</button>
                      {Object.entries(CATEGORIA_CONFIG).map(([id, cfg]) => (
                        <button key={id} onClick={() => setFiltroCategoria(id === filtroCategoria ? "" : id)} style={{
                          padding: "6px 14px", borderRadius: 20, border: `1px solid ${cfg.color}40`, cursor: "pointer",
                          background: filtroCategoria === id ? cfg.color : cfg.bg,
                          color: filtroCategoria === id ? "white" : cfg.color, fontSize: 13, fontWeight: 600,
                          display: "flex", alignItems: "center", gap: 4
                        }}>{cfg.icono} {cfg.nombre}</button>
                      ))}
                    </div>

                    {/* Tabla */}
                    {consultas.length === 0 ? (
                      <div style={{ textAlign: "center", padding: "60px 20px", color: "#9CA3AF" }}>
                        <div style={{ margin: "0 auto 12px", opacity: 0.25, color: "#9CA3AF" }}><IconMsg /></div>
                        <p style={{ fontWeight: 600, fontSize: 16 }}>Sin consultas registradas</p>
                        <p style={{ fontSize: 14 }}>Las consultas aparecerán cuando los estudiantes usen el chatbot.</p>
                      </div>
                    ) : (
                      <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                          <thead>
                            <tr style={{ background: "#F9FAFB" }}>
                              {["Estudiante", "Mensaje", "Categoría", "Confianza", "Fecha"].map(h => (
                                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 13, fontWeight: 700, color: "#6B7280", borderBottom: "1px solid #E5E7EB" }}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {consultas.map((c, i) => {
                              const cfg = CATEGORIA_CONFIG[c.categoria] || { color: "#6B7280", bg: "#F9FAFB", icono: "💬", nombre: c.categoria };
                              return (
                                <tr key={c.id} style={{ background: i % 2 === 0 ? "white" : "#FAFAFA", cursor: "pointer" }}
                                  onClick={() => setDetalle(detalle?.id === c.id ? null : c)}>
                                  <td style={{ padding: "12px 16px", fontSize: 14, color: "#1F2937", fontWeight: 600 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                      <div style={{
                                        width: 32, height: 32, borderRadius: "50%", background: "#FEE2E2",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        fontWeight: 700, color: "#DC2626", fontSize: 14
                                      }}>{(c.nombre_estudiante || "E")[0]?.toUpperCase()}</div>
                                      {c.nombre_estudiante}
                                    </div>
                                  </td>
                                  <td style={{ padding: "12px 16px", fontSize: 13, color: "#374151", maxWidth: 280 }}>
                                    <p style={{ margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.mensaje}</p>
                                  </td>
                                  <td style={{ padding: "12px 16px" }}>
                                    <span style={{
                                      display: "inline-flex", alignItems: "center", gap: 6,
                                      background: cfg.bg, color: cfg.color,
                                      border: `1px solid ${cfg.color}30`, borderRadius: 20,
                                      padding: "3px 10px", fontSize: 12, fontWeight: 700
                                    }}>{CATEGORIA_ICONS[c.categoria]} {cfg.nombre}</span>
                                  </td>
                                  <td style={{ padding: "12px 16px" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                      <div style={{ width: 60, height: 6, background: "#E5E7EB", borderRadius: 3 }}>
                                        <div style={{ width: `${Math.round((c.confianza || 0) * 100)}%`, height: "100%", background: cfg.color, borderRadius: 3 }} />
                                      </div>
                                      <span style={{ fontSize: 12, color: "#6B7280" }}>{Math.round((c.confianza || 0) * 100)}%</span>
                                    </div>
                                  </td>
                                  <td style={{ padding: "12px 16px", fontSize: 13, color: "#9CA3AF" }}>
                                    {new Date(c.fecha).toLocaleString("es-ES", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* ═══ TAB ESTUDIANTES ═══ */}
                {tab === "estudiantes" && (
                  <div style={{ background: "white", borderRadius: 16, boxShadow: "0 1px 6px rgba(0,0,0,0.08)", overflow: "hidden" }}>
                    <div style={{ padding: "20px 24px", borderBottom: "1px solid #F3F4F6" }}>
                      <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#1F2937", display: "flex", alignItems: "center", gap: 8 }}>
                        <IconUsers /> Estudiantes con Mayor Actividad
                      </h3>
                      <p style={{ margin: "4px 0 0 0", fontSize: 13, color: "#6B7280" }}>
                        Ordenados por número de consultas al chatbot
                      </p>
                    </div>
                    {!stats?.top_estudiantes?.length ? (
                      <div style={{ textAlign: "center", padding: "60px 20px", color: "#9CA3AF" }}>
                        <div style={{ margin: "0 auto 12px", opacity: 0.25, color: "#9CA3AF" }}><IconUsers /></div>
                        <p>Sin datos de estudiantes todavía.</p>
                      </div>
                    ) : (
                      <div>
                        {stats.top_estudiantes.map((e, i) => {
                          const cfg = CATEGORIA_CONFIG[e.categoria_frecuente] || {};
                          const niveles = [
                            { label: "Alto", color: "#EF4444", bg: "#FEF2F2", min: 10 },
                            { label: "Medio", color: "#F59E0B", bg: "#FFFBEB", min: 5 },
                            { label: "Bajo", color: "#10B981", bg: "#ECFDF5", min: 0 },
                          ];
                          const nivel = niveles.find(n => parseInt(e.total_consultas) >= n.min);
                          return (
                            <div key={i} style={{
                              display: "flex", alignItems: "center", gap: 16,
                              padding: "16px 24px", borderBottom: "1px solid #F3F4F6",
                              transition: "background 0.15s"
                            }}
                              onMouseOver={ev => ev.currentTarget.style.background = "#FAFAFA"}
                              onMouseOut={ev => ev.currentTarget.style.background = ""}
                            >
                              <div style={{
                                width: 36, height: 36, borderRadius: "50%", background: i < 3 ? "linear-gradient(135deg,#DC2626,#B91C1C)" : "#F3F4F6",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                color: i < 3 ? "white" : "#6B7280", fontWeight: 800, fontSize: 15
                              }}>#{i + 1}</div>

                              <div style={{
                                width: 42, height: 42, borderRadius: "50%", background: "#FEE2E2",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontWeight: 700, color: "#DC2626", fontSize: 18
                              }}>{(e.nombre || "E")[0]?.toUpperCase()}</div>

                              <div style={{ flex: 1 }}>
                                <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: "#1F2937" }}>{e.nombre}</p>
                                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                                  {cfg.nombre && (
                                    <span style={{ fontSize: 12, color: cfg.color, display: "inline-flex", alignItems: "center", gap: 4 }}>
                                      {CATEGORIA_ICONS[e.categoria_frecuente]} Cat. frecuente: {cfg.nombre}
                                    </span>
                                  )}
                                  <span style={{ fontSize: 11, color: "#9CA3AF" }}>
                                    Última: {new Date(e.ultima_consulta).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
                                  </span>
                                </div>
                              </div>

                              <div style={{ textAlign: "right" }}>
                                <p style={{ margin: 0, fontWeight: 800, fontSize: 22, color: "#1F2937" }}>{e.total_consultas}</p>
                                <p style={{ margin: "2px 0 0", fontSize: 12, color: "#6B7280" }}>consultas</p>
                              </div>

                              <span style={{
                                padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700,
                                background: nivel.bg, color: nivel.color
                              }}>
                                {nivel.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {/* Modal detalle consulta */}
            {detalle && (
              <div style={{
                position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
                display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999
              }} onClick={() => setDetalle(null)}>
                <div style={{
                  background: "white", borderRadius: 20, padding: 28, maxWidth: 520, width: "90%",
                  boxShadow: "0 20px 60px rgba(0,0,0,0.2)"
                }} onClick={e => e.stopPropagation()}>
                  {(() => {
                    const cfg = CATEGORIA_CONFIG[detalle.categoria] || { color: "#6B7280", bg: "#F9FAFB", icono: "💬", nombre: detalle.categoria };
                    return (
                      <>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
                          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#1F2937" }}>Detalle de Consulta</h3>
                          <button onClick={() => setDetalle(null)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 22, color: "#9CA3AF" }}>✕</button>
                        </div>
                        <div style={{ padding: "12px 16px", background: cfg.bg, borderRadius: 12, marginBottom: 16 }}>
                          <span style={{ color: cfg.color, fontWeight: 700, fontSize: 14 }}>{cfg.icono} {cfg.nombre}</span>
                        </div>
                        <p style={{ margin: "0 0 8px", fontSize: 13, color: "#6B7280", fontWeight: 600 }}>ESTUDIANTE</p>
                        <p style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700, color: "#1F2937" }}>{detalle.nombre_estudiante}</p>
                        <p style={{ margin: "0 0 8px", fontSize: 13, color: "#6B7280", fontWeight: 600 }}>MENSAJE</p>
                        <p style={{ margin: "0 0 16px", fontSize: 15, color: "#374151", padding: 12, background: "#F9FAFB", borderRadius: 10 }}>{detalle.mensaje}</p>
                        <p style={{ margin: "0 0 8px", fontSize: 13, color: "#6B7280", fontWeight: 600 }}>RESPUESTA DEL SISTEMA</p>
                        <p style={{ margin: "0 0 16px", fontSize: 14, color: "#374151", padding: 12, background: "#F9FAFB", borderRadius: 10 }}>{detalle.respuesta}</p>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#9CA3AF" }}>
                          <span>Confianza: <strong style={{ color: cfg.color }}>{Math.round((detalle.confianza || 0) * 100)}%</strong></span>
                          <span>{new Date(detalle.fecha).toLocaleString("es-ES")}</span>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
}

import React, { useEffect, useState } from "react";
import ForumForm from "./ForumForm";
import CommentForm from "./CommentForm";
import axios from "axios";
import Toast from "../util/alert.jsx";

// ── Avatar helper ──────────────────────────────────────────────
function Avatar({ name, size = 38, fontSize = 14 }) {
  const colors = ["#DC2626","#7C3AED","#2563EB","#059669","#D97706","#DB2777"];
  const idx = (name?.charCodeAt(0) || 0) % colors.length;
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: `linear-gradient(135deg,${colors[idx]},${colors[(idx+1)%colors.length]})`, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize, flexShrink: 0, userSelect: "none" }}>
      {name?.[0]?.toUpperCase() || "?"}
    </div>
  );
}

const Form = () => {
  const usuario = JSON.parse(localStorage.getItem("token"))?.[0];
  const [showForm, setShowForm] = useState(false);
  const [topics, setTopics] = useState([]);
  const [coments, setComments] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => { dataInicial(); }, []);

  const dataInicial = async () => {
    try {
      const res = await axios.post("http://localhost:3001/foro/getForos");
      setTopics(res.data);
      getComentarios();
    } catch {}
  };

  const getComentarios = async () => {
    try {
      const res = await axios.post("http://localhost:3001/foro/getComentario");
      setComments(res.data);
    } catch {}
  };

  const handleSubmit = async (formData) => {
    try {
      const res = await axios.post("http://localhost:3001/foro/addForo", { ...formData, id: usuario?.id, rol: usuario?.rol });
      setToast({ type: res.data?.success ? "success" : "error", message: res.data?.mensaje || "Foro creado" });
      dataInicial();
      setShowForm(false);
    } catch { setToast({ type: "error", message: "Error al crear el foro" }); }
  };

  const handleComment = async (topicId, commentData) => {
    try {
      const res = await axios.post("http://localhost:3001/foro/addComentario", { idForo: topicId, comentario: commentData.content, id: usuario?.id, rol: usuario?.rol });
      setToast({ type: res.data?.success ? "success" : "error", message: res.data?.mensaje || "Comentario agregado" });
      dataInicial();
      getComentarios();
    } catch { setToast({ type: "error", message: "Error al comentar" }); }
  };

  const formatDate = (date) => date.toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });

  const filtered = topics.filter(t =>
    t.titulo?.toLowerCase().includes(search.toLowerCase()) ||
    t.descripcion?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        .forum-card { transition: box-shadow 0.2s, transform 0.2s; cursor: pointer; }
        .forum-card:hover { box-shadow: 0 8px 24px rgba(0,0,0,0.1) !important; transform: translateY(-1px); }
        .forum-scroll { scrollbar-width: thin; scrollbar-color: #E5E7EB transparent; }
        .forum-scroll::-webkit-scrollbar { width: 5px; }
        .forum-scroll::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 4px; }
        .forum-input:focus { border-color: #DC2626 !important; outline: none; box-shadow: 0 0 0 3px rgba(220,38,38,0.08); }
      `}</style>
      <div className="forum-scroll" style={{ padding: "28px 32px", fontFamily: "'Inter',sans-serif", maxWidth: 860, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#111827" }}>Foro de la Comunidad</h1>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "#6B7280" }}>{topics.length} discusiones activas</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} style={{ padding: "10px 20px", borderRadius: 10, border: "none", background: showForm ? "#F3F4F6" : "linear-gradient(135deg,#DC2626,#B91C1C)", color: showForm ? "#374151" : "white", fontSize: 13, fontWeight: 700, cursor: "pointer", boxShadow: showForm ? "none" : "0 3px 10px rgba(220,38,38,0.25)", transition: "all 0.2s", fontFamily: "inherit" }}>
            {showForm ? "✕ Cancelar" : "+ Nuevo tema"}
          </button>
        </div>

        {/* Buscador */}
        <div style={{ position: "relative", marginBottom: 24 }}>
          <div style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}>
            <svg viewBox="0 0 24 24" fill="none" width="16" height="16"><circle cx="11" cy="11" r="8" stroke="#9CA3AF" strokeWidth="2"/><path d="M21 21l-4.35-4.35" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round"/></svg>
          </div>
          <input className="forum-input" type="text" placeholder="Buscar temas..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: "100%", padding: "10px 14px 10px 36px", borderRadius: 10, border: "1.5px solid #E5E7EB", fontSize: 13, fontFamily: "inherit", background: "white", color: "#374151", boxSizing: "border-box", transition: "border-color 0.2s" }} />
        </div>

        {/* Formulario nuevo foro */}
        {showForm && (
          <div style={{ marginBottom: 24, animation: "fadeIn 0.2s ease" }}>
            <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}`}</style>
            <ForumForm onSubmit={handleSubmit} onCancel={() => setShowForm(false)} />
          </div>
        )}

        {/* Lista de temas */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 0", background: "white", borderRadius: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <svg viewBox="0 0 24 24" fill="none" width="40" height="40" style={{ margin: "0 auto 12px", display: "block", opacity: 0.2 }}>
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <p style={{ color: "#9CA3AF", fontSize: 14 }}>{search ? "Sin resultados para tu búsqueda" : "Sin temas aún. ¡Crea el primero!"}</p>
            </div>
          ) : filtered.map(topic => {
            const topicComments = coments.filter(x => x.id_foro === topic.id);
            const isOpen = selectedTopic?.id === topic.id;
            return (
              <div key={topic.id} className="forum-card" style={{ background: "white", borderRadius: 14, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", overflow: "hidden", border: isOpen ? "1.5px solid #FEE2E2" : "1.5px solid transparent" }}>
                {/* Encabezado del tema */}
                <div onClick={() => setSelectedTopic(isOpen ? null : topic)} style={{ padding: "18px 22px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                    <Avatar name={topic.creado_por} size={42} fontSize={16} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#111827" }}>{topic.titulo}</h3>
                        <span style={{ padding: "3px 10px", borderRadius: 20, background: "#FEF2F2", color: "#DC2626", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                          {topicComments.length} {topicComments.length === 1 ? "respuesta" : "respuestas"}
                        </span>
                      </div>
                      <p style={{ margin: "5px 0 8px", fontSize: 13, color: "#6B7280", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: isOpen ? "none" : 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{topic.descripcion}</p>
                      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                        <span style={{ fontSize: 11, color: "#9CA3AF" }}>Por <strong style={{ color: "#374151" }}>{topic.creado_por}</strong></span>
                        <span style={{ fontSize: 11, color: "#9CA3AF" }}>{formatDate(new Date(topic.fecha))}</span>
                      </div>
                    </div>
                    <div style={{ color: "#9CA3AF", transition: "transform 0.2s", transform: isOpen ? "rotate(180deg)" : "rotate(0)" }}>
                      <svg viewBox="0 0 24 24" fill="none" width="18" height="18"><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                  </div>
                </div>

                {/* Sección expandida de comentarios */}
                {isOpen && (
                  <div style={{ padding: "0 22px 22px", borderTop: "1px solid #F3F4F6" }}>
                    <h4 style={{ margin: "16px 0 12px", fontSize: 14, fontWeight: 700, color: "#374151" }}>
                      Comentarios ({topicComments.length})
                    </h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }}>
                      {topicComments.length === 0 ? (
                        <p style={{ color: "#9CA3AF", fontSize: 13, padding: "12px 0" }}>Sé el primero en comentar</p>
                      ) : topicComments.map(comment => (
                        <div key={comment.id} style={{ display: "flex", gap: 12, padding: "12px 14px", background: "#F9FAFB", borderRadius: 10 }}>
                          <Avatar name={comment.creado_por} size={32} fontSize={12} />
                          <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                              <span style={{ fontSize: 12, fontWeight: 700, color: "#111827" }}>{comment.creado_por}</span>
                              <span style={{ fontSize: 11, color: "#9CA3AF" }}>{formatDate(new Date(comment.fecha))}</span>
                            </div>
                            <p style={{ margin: 0, fontSize: 13, color: "#374151", lineHeight: 1.6 }}>{comment.contenido}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <CommentForm onSubmit={(commentData) => handleComment(topic.id, commentData)} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
      </div>
    </>
  );
};

export default Form;

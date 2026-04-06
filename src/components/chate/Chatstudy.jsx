import React, { useState, useRef, useEffect } from "react";
import Menu from "./../menu";
import Header from "./../header";
import axios from "axios";
import pusher from "../../services/pusher";
import AsesorSelector from "./AsesorSelector";

// ─── SVG Icons ───────────────────────────────────────────────
const PlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
  </svg>
);

const SendIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
    <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M22 2L15 22 11 13 2 9l20-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const EmptyIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" width="48" height="48" style={{ opacity: 0.25, margin: "0 auto 12px", display: "block" }}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SelectChatIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" width="64" height="64" style={{ opacity: 0.15, margin: "0 auto 16px", display: "block" }}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="#6B7280" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
    <circle cx="11" cy="11" r="8" stroke="#9CA3AF" strokeWidth="2"/>
    <path d="M21 21l-4.35-4.35" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

// ─── Avatar helper ────────────────────────────────────────────
function Avatar({ name, size = 44, fontSize = 17 }) {
  const colors = ["#DC2626","#7C3AED","#2563EB","#059669","#D97706","#DB2777"];
  const idx = (name?.charCodeAt(0) || 0) % colors.length;
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: `linear-gradient(135deg, ${colors[idx]}, ${colors[(idx+1) % colors.length]})`,
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "white", fontWeight: 700, fontSize, flexShrink: 0, userSelect: "none"
    }}>
      {name?.[0]?.toUpperCase() || "?"}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────
function Chatstudy() {
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [message, setMessage] = useState("");
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [showAsesorSelector, setShowAsesorSelector] = useState(false);
  const [creatingConversation, setCreatingConversation] = useState(false);
  const [search, setSearch] = useState("");
  const messagesEndRef = useRef(null);
  const channelRef = useRef(null);
  const notificationChannelRef = useRef(null);
  const selectedChatIdRef = useRef(selectedChatId);
  const inputRef = useRef(null);

  const usuario = JSON.parse(localStorage.getItem("usuario")) || {};
  const userId = usuario.id;

  useEffect(() => { selectedChatIdRef.current = selectedChatId; }, [selectedChatId]);

  // ── Pusher: canal del chat seleccionado
  useEffect(() => {
    if (!selectedChatId) return;
    const channel = pusher.subscribe(`chat-${selectedChatId}`);
    channelRef.current = channel;
    channel.bind("nuevo-mensaje", (data) => {
      if (data.remitente_id != userId) {
        setMessages(prev => [...prev, data]);
      }
    });
    return () => {
      channelRef.current?.unbind_all();
      pusher.unsubscribe(`chat-${selectedChatId}`);
    };
  }, [selectedChatId, userId]);

  // ── Pusher: notificaciones del estudiante
  useEffect(() => {
    if (!userId) return;
    const notificationChannel = pusher.subscribe(`estudiante-${userId}`);
    notificationChannelRef.current = notificationChannel;
    notificationChannel.bind("nueva-conversacion", () => cargarConversaciones());
    notificationChannel.bind("nuevo-mensaje-notificacion", (data) => {
      cargarConversaciones();
      if (data.id_conversacion == selectedChatIdRef.current) {
        cargarMensajes(selectedChatIdRef.current);
      }
    });
    return () => {
      notificationChannelRef.current?.unbind_all();
      pusher.unsubscribe(`estudiante-${userId}`);
    };
  }, [userId]);

  const cargarConversaciones = async () => {
    try {
      const res = await axios.get(`http://localhost:3001/chat/getConversacion/estudiante/${userId}`);
      if (res.data.ok) {
        const conversaciones = res.data.conversaciones.map(conv => ({
          id: conv.id,
          name: `${conv.asesor_nombre} ${conv.asesor_apellido}`,
          status: conv.asesor_materia,
          lastMessage: conv.ultimo_mensaje || "Sin mensajes",
          lastMessageTime: conv.ultima_actividad
            ? new Date(conv.ultima_actividad).toLocaleString("es-ES", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
            : ""
        }));
        setChats(conversaciones);
        if (conversaciones.length > 0 && !selectedChatIdRef.current) {
          setSelectedChatId(conversaciones[0].id);
        }
      }
    } catch {}
  };

  useEffect(() => { if (userId) cargarConversaciones(); }, [userId]);
  useEffect(() => { if (selectedChatId) cargarMensajes(selectedChatId); }, [selectedChatId]);

  const cargarMensajes = async (chatId) => {
    try {
      const res = await axios.get(`http://localhost:3001/chat/getMensajes/${chatId}`);
      if (res.data.ok) setMessages(res.data.mensajes || []);
    } catch {}
  };

  // Scroll suave solo al nuevo mensaje
  const prevCountRef = useRef(0);
  useEffect(() => {
    if (messages.length > prevCountRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: messages.length - prevCountRef.current === 1 ? "smooth" : "auto" });
    }
    prevCountRef.current = messages.length;
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !selectedChatId) return;
    const text = message.trim();
    const tempMessage = {
      id_conversacion: selectedChatId,
      contenido: text,
      remitente_id: userId,
      remitente_tipo: "estudiante",
      fecha_envio: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempMessage]);
    setMessage("");
    if (inputRef.current) { inputRef.current.style.height = "auto"; }
    try {
      await axios.post("http://localhost:3001/chat/mensajes", { chatId: selectedChatId, content: text, senderId: userId });
      setChats(prev => prev.map(c => c.id === selectedChatId
        ? { ...c, lastMessage: text, lastMessageTime: new Date().toLocaleString("es-ES", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) }
        : c
      ));
    } catch (err) {
      console.error("Error al enviar:", err);
    }
  };

  const handleSelectAsesor = async (asesor) => {
    setCreatingConversation(true);
    try {
      const response = await axios.post("http://localhost:3001/chat/crearConversacion", {
        id_estudiante: userId,
        id_asesor: asesor.id
      });
      if (response.data.ok) {
        await cargarConversaciones();
        setSelectedChatId(response.data.conversacion.id);
        setShowAsesorSelector(false);
      }
    } catch {
      alert("No se pudo iniciar la conversación. Intenta nuevamente.");
    } finally {
      setCreatingConversation(false);
    }
  };

  const handleInputChange = (e) => {
    setMessage(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  };

  const selectedChat = chats.find(c => c.id === selectedChatId);
  const filteredChats = chats.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.lastMessage?.toLowerCase().includes(search.toLowerCase())
  );

  // Agrupar mensajes por fecha
  const groupedMessages = messages.reduce((acc, msg, i) => {
    const date = new Date(msg.fecha_envio).toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" });
    const prev = i > 0 ? new Date(messages[i-1].fecha_envio).toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" }) : null;
    return [...acc, ...(date !== prev ? [{ type: "date", label: date }] : []), { type: "msg", data: msg }];
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        .chat-messages { scrollbar-width: thin; scrollbar-color: #E5E7EB transparent; }
        .chat-messages::-webkit-scrollbar { width: 5px; }
        .chat-messages::-webkit-scrollbar-track { background: transparent; }
        .chat-messages::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 4px; }
        .chat-list { scrollbar-width: thin; scrollbar-color: #E5E7EB transparent; }
        .chat-list::-webkit-scrollbar { width: 4px; }
        .chat-list::-webkit-scrollbar-track { background: transparent; }
        .chat-list::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 4px; }
        .chat-item:hover { background: #F9FAFB !important; }
        .chat-item.active { background: #FFF5F5 !important; }
        .send-btn:not(:disabled):hover { background: linear-gradient(135deg,#B91C1C,#991B1B) !important; transform: scale(1.04); }
        .send-btn { transition: all 0.15s ease; }
        .new-chat-btn:hover { background: #B91C1C !important; }
        .new-chat-btn { transition: background 0.15s; }
      `}</style>

      <div style={{ display: "flex", flexDirection: "column", height: "100vh", fontFamily: "'Inter',sans-serif", overflow: "hidden" }}>
        <Header />
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          <Menu />

          {/* ── Layout principal ── */}
          <div style={{ display: "flex", flex: 1, overflow: "hidden", background: "#F0F2F5" }}>

            {/* ── Lista de chats ── */}
            <div style={{
              width: 320, flexShrink: 0, background: "white",
              borderRight: "1px solid #E5E7EB",
              display: "flex", flexDirection: "column", overflow: "hidden"
            }}>
              {/* Cabecera lista */}
              <div style={{ padding: "16px 16px 12px", borderBottom: "1px solid #F3F4F6", flexShrink: 0 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#111827" }}>Chats</h2>
                  <button
                    className="new-chat-btn"
                    onClick={() => setShowAsesorSelector(true)}
                    title="Nuevo chat"
                    style={{
                      width: 36, height: 36, borderRadius: "50%",
                      background: "#DC2626", border: "none", cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center", color: "white",
                      boxShadow: "0 2px 8px rgba(220,38,38,0.3)"
                    }}
                  >
                    <PlusIcon />
                  </button>
                </div>
                {/* Buscador */}
                <div style={{ position: "relative" }}>
                  <div style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }}>
                    <SearchIcon />
                  </div>
                  <input
                    type="text"
                    placeholder="Buscar conversación..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{
                      width: "100%", padding: "8px 12px 8px 34px", borderRadius: 10,
                      border: "1.5px solid #E5E7EB", fontSize: 13, background: "#F9FAFB",
                      outline: "none", fontFamily: "inherit", boxSizing: "border-box",
                      color: "#374151"
                    }}
                    onFocus={e => e.target.style.borderColor = "#DC2626"}
                    onBlur={e => e.target.style.borderColor = "#E5E7EB"}
                  />
                </div>
              </div>

              {/* Lista */}
              <div className="chat-list" style={{ flex: 1, overflowY: "auto" }}>
                {filteredChats.length === 0 ? (
                  <div style={{ padding: 32, textAlign: "center" }}>
                    <EmptyIcon />
                    <p style={{ color: "#9CA3AF", fontSize: 14, margin: 0 }}>
                      {search ? "Sin resultados" : "No hay conversaciones"}
                    </p>
                    {!search && (
                      <p style={{ color: "#D1D5DB", fontSize: 12, marginTop: 6 }}>
                        Presiona + para iniciar una nueva
                      </p>
                    )}
                  </div>
                ) : (
                  filteredChats.map(chat => (
                    <div
                      key={chat.id}
                      className={`chat-item${selectedChatId === chat.id ? " active" : ""}`}
                      onClick={() => setSelectedChatId(chat.id)}
                      style={{
                        padding: "12px 16px", cursor: "pointer",
                        borderBottom: "1px solid #F3F4F6",
                        background: selectedChatId === chat.id ? "#FFF5F5" : "white",
                        transition: "background 0.15s",
                        borderLeft: selectedChatId === chat.id ? "3px solid #DC2626" : "3px solid transparent"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <Avatar name={chat.name} size={46} fontSize={17} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 6 }}>
                            <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {chat.name}
                            </p>
                            <span style={{ fontSize: 11, color: "#9CA3AF", flexShrink: 0 }}>{chat.lastMessageTime}</span>
                          </div>
                          <p style={{ margin: "2px 0 0", fontSize: 12, color: "#6B7280", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {chat.status && <span style={{ color: "#DC2626", fontWeight: 500 }}>{chat.status} · </span>}
                            {chat.lastMessage}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* ── Ventana de chat ── */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
              {selectedChat ? (
                <>
                  {/* Header del chat */}
                  <div style={{
                    padding: "12px 20px", background: "white",
                    borderBottom: "1px solid #E5E7EB",
                    display: "flex", alignItems: "center", gap: 12,
                    boxShadow: "0 1px 4px rgba(0,0,0,0.05)", flexShrink: 0
                  }}>
                    <Avatar name={selectedChat.name} size={42} fontSize={16} />
                    <div>
                      <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#111827" }}>{selectedChat.name}</h3>
                      <p style={{ margin: "2px 0 0", fontSize: 12, color: "#DC2626", fontWeight: 500 }}>
                        {selectedChat.status || "Asesor académico"}
                      </p>
                    </div>
                  </div>

                  {/* Mensajes */}
                  <div
                    className="chat-messages"
                    style={{
                      flex: 1,
                      overflowY: "auto",
                      padding: "20px 24px",
                      display: "flex",
                      flexDirection: "column",
                      gap: 2
                    }}
                  >
                    {groupedMessages.map((item, idx) => {
                      if (item.type === "date") {
                        return (
                          <div key={`date-${idx}`} style={{ display: "flex", alignItems: "center", gap: 10, margin: "12px 0 8px" }}>
                            <div style={{ flex: 1, height: 1, background: "#E5E7EB" }} />
                            <span style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 500, whiteSpace: "nowrap" }}>{item.label}</span>
                            <div style={{ flex: 1, height: 1, background: "#E5E7EB" }} />
                          </div>
                        );
                      }
                      const msg = item.data;
                      const isSender = msg.remitente_id == userId;
                      return (
                        <div key={idx} style={{
                          display: "flex",
                          justifyContent: isSender ? "flex-end" : "flex-start",
                          marginBottom: 6
                        }}>
                          {!isSender && (
                            <div style={{ marginRight: 8, alignSelf: "flex-end", marginBottom: 2 }}>
                              <Avatar name={selectedChat.name} size={28} fontSize={11} />
                            </div>
                          )}
                          <div style={{ maxWidth: "65%" }}>
                            <div style={{
                              padding: "10px 14px",
                              borderRadius: isSender ? "18px 4px 18px 18px" : "4px 18px 18px 18px",
                              background: isSender
                                ? "linear-gradient(135deg,#DC2626,#B91C1C)"
                                : "white",
                              color: isSender ? "white" : "#111827",
                              boxShadow: isSender
                                ? "0 2px 10px rgba(220,38,38,0.2)"
                                : "0 1px 4px rgba(0,0,0,0.07)",
                              border: isSender ? "none" : "1px solid #F3F4F6"
                            }}>
                              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, wordBreak: "break-word" }}>{msg.contenido}</p>
                            </div>
                            <p style={{
                              margin: "3px 4px 0",
                              fontSize: 10, color: "#9CA3AF",
                              textAlign: isSender ? "right" : "left"
                            }}>
                              {msg.fecha_envio
                                ? new Date(msg.fecha_envio).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit", hour12: true })
                                : ""}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input */}
                  <form
                    onSubmit={handleSendMessage}
                    style={{
                      padding: "12px 20px", background: "white",
                      borderTop: "1px solid #E5E7EB",
                      display: "flex", alignItems: "flex-end", gap: 10,
                      boxShadow: "0 -2px 8px rgba(0,0,0,0.04)", flexShrink: 0
                    }}
                  >
                    <textarea
                      ref={inputRef}
                      value={message}
                      onChange={handleInputChange}
                      onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendMessage(e); } }}
                      placeholder="Escribe un mensaje..."
                      rows={1}
                      style={{
                        flex: 1, padding: "11px 16px", borderRadius: 22,
                        border: "1.5px solid #E5E7EB", fontSize: 14,
                        fontFamily: "inherit", outline: "none", resize: "none",
                        lineHeight: 1.5, background: "#F9FAFB",
                        transition: "border-color 0.2s", minHeight: 44, maxHeight: 120,
                        overflow: "auto", boxSizing: "border-box"
                      }}
                      onFocus={e => e.target.style.borderColor = "#DC2626"}
                      onBlur={e => e.target.style.borderColor = "#E5E7EB"}
                    />
                    <button
                      type="submit"
                      className="send-btn"
                      disabled={!message.trim()}
                      title="Enviar"
                      style={{
                        width: 44, height: 44, borderRadius: "50%", border: "none",
                        background: message.trim()
                          ? "linear-gradient(135deg,#DC2626,#B91C1C)"
                          : "#E5E7EB",
                        color: message.trim() ? "white" : "#9CA3AF",
                        cursor: message.trim() ? "pointer" : "not-allowed",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0,
                        boxShadow: message.trim() ? "0 2px 10px rgba(220,38,38,0.3)" : "none"
                      }}
                    >
                      <SendIcon />
                    </button>
                  </form>
                </>
              ) : (
                <div style={{
                  flex: 1, display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center",
                  background: "#F0F2F5"
                }}>
                  <SelectChatIcon />
                  <p style={{ color: "#9CA3AF", fontSize: 15, fontWeight: 500, margin: 0 }}>Selecciona una conversación</p>
                  <p style={{ color: "#D1D5DB", fontSize: 13, marginTop: 6 }}>o inicia una nueva presionando +</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {showAsesorSelector && (
          <AsesorSelector
            onClose={() => setShowAsesorSelector(false)}
            onSelectAsesor={handleSelectAsesor}
          />
        )}

        {creatingConversation && (
          <div style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
            display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50
          }}>
            <div style={{
              background: "white", borderRadius: 16, padding: "32px 40px",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 16,
              boxShadow: "0 20px 60px rgba(0,0,0,0.15)"
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: "50%",
                border: "3px solid #F3F4F6", borderTopColor: "#DC2626",
                animation: "spin 0.7s linear infinite"
              }} />
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
              <p style={{ margin: 0, color: "#374151", fontSize: 14, fontWeight: 500 }}>Iniciando conversación...</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default Chatstudy;
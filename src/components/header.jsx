import React, { useState } from "react";
import '../App.css';
import { useNavigate } from "react-router-dom";
import API from "../services/api";

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

const EditIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" width="14" height="14">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const XIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

function Header() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(JSON.parse(localStorage.getItem("usuario")) || {});
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    nombres: usuario.nombres || '',
    apellidos: usuario.apellidos || '',
    telefono: usuario.telefono || '',
    carrera: usuario.carrera || '',
    email: usuario.email || '',
  });
  const [saving, setSaving] = useState(false);
  const [editMsg, setEditMsg] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    navigate("/");
  };

  const openEditModal = () => {
    setEditForm({
      nombres: usuario.nombres || '',
      apellidos: usuario.apellidos || '',
      telefono: usuario.telefono || '',
      carrera: usuario.carrera || '',
      email: usuario.email || '',
    });
    setEditMsg(null);
    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleEditSave = async () => {
    if (!editForm.nombres.trim() || !editForm.apellidos.trim()) {
      setEditMsg({ type: 'error', text: 'Nombres y apellidos son obligatorios' });
      return;
    }
    setSaving(true);
    setEditMsg(null);
    try {
      const res = await API.post("/usuarios/updateUser", {
        id: usuario.id,
        rol: usuario.rol,
        nombres: editForm.nombres.trim(),
        apellidos: editForm.apellidos.trim(),
        telefono: editForm.telefono.trim(),
        carrera: editForm.carrera.trim(),
        email: editForm.email.trim(),
      });
      if (res.data.ok) {
        const updated = {
          ...usuario,
          nombres: res.data.usuario.nombres,
          apellidos: res.data.usuario.apellidos,
          telefono: res.data.usuario.telefono,
          carrera: res.data.usuario.carrera,
          email: res.data.usuario.email,
        };
        localStorage.setItem("usuario", JSON.stringify(updated));
        setUsuario(updated);
        setEditMsg({ type: 'success', text: 'Datos actualizados correctamente' });
        setTimeout(() => setShowEditModal(false), 1200);
      } else {
        setEditMsg({ type: 'error', text: res.data.mensaje || 'Error al actualizar' });
      }
    } catch (err) {
      console.error("Error al actualizar:", err);
      setEditMsg({ type: 'error', text: 'Error al conectar con el servidor' });
    } finally {
      setSaving(false);
    }
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
        .edit-profile-btn:hover { background: #F3F4F6 !important; }
        .edit-profile-btn { transition: background 0.15s; }
        @keyframes editModalIn { from { opacity: 0; transform: scale(0.95) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        @keyframes editFadeIn { from { opacity: 0; } to { opacity: 1; } }
        .edit-modal-overlay { animation: editFadeIn 0.2s ease; }
        .edit-modal-content { animation: editModalIn 0.25s ease; }
        .edit-input:focus { border-color: #DC2626 !important; box-shadow: 0 0 0 3px rgba(220,38,38,0.08) !important; outline: none; }
        .edit-save-btn:hover:not(:disabled) { background: #B91C1C !important; }
        .edit-save-btn { transition: background 0.15s; }
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

        {/* User info + edit + logout */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
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
          {/* Edit profile button */}
          <button
            className="edit-profile-btn"
            onClick={openEditModal}
            title="Editar perfil"
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: 34, height: 34, borderRadius: 9,
              background: "#F3F4F6", border: "1px solid #E5E7EB", cursor: "pointer",
              color: "#6B7280"
            }}
          >
            <EditIcon />
          </button>
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

      {/* ═══ Modal Editar Perfil ═══ */}
      {showEditModal && (
        <div className="edit-modal-overlay" style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1000, backdropFilter: "blur(4px)"
        }} onClick={() => setShowEditModal(false)}>
          <div className="edit-modal-content" style={{
            background: "white", borderRadius: 18, width: "100%", maxWidth: 440,
            boxShadow: "0 25px 70px rgba(0,0,0,0.2)", overflow: "hidden"
          }} onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div style={{
              background: "linear-gradient(135deg, #DC2626, #991B1B)",
              padding: "20px 24px", color: "white", position: "relative"
            }}>
              <button onClick={() => setShowEditModal(false)} style={{
                position: "absolute", top: 14, right: 14, background: "rgba(255,255,255,0.15)",
                border: "none", borderRadius: "50%", width: 32, height: 32,
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", color: "white"
              }}>
                <XIcon />
              </button>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: "50%",
                  background: "rgba(255,255,255,0.2)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 800, fontSize: 18
                }}>
                  {initials}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>Editar Perfil</h3>
                  <p style={{ margin: "2px 0 0", fontSize: 12, opacity: 0.8 }}>{usuario.email}</p>
                </div>
              </div>
            </div>

            {/* Form */}
            <div style={{ padding: "22px 24px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 4 }}>
                    Nombres *
                  </label>
                  <input
                    type="text" name="nombres" value={editForm.nombres}
                    onChange={handleEditChange} className="edit-input"
                    style={{
                      width: "100%", padding: "10px 12px", borderRadius: 10,
                      border: "1.5px solid #E5E7EB", fontSize: 13, fontFamily: "inherit",
                      color: "#111827", boxSizing: "border-box", outline: "none",
                      transition: "border-color 0.2s, box-shadow 0.2s"
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 4 }}>
                    Apellidos *
                  </label>
                  <input
                    type="text" name="apellidos" value={editForm.apellidos}
                    onChange={handleEditChange} className="edit-input"
                    style={{
                      width: "100%", padding: "10px 12px", borderRadius: 10,
                      border: "1.5px solid #E5E7EB", fontSize: 13, fontFamily: "inherit",
                      color: "#111827", boxSizing: "border-box", outline: "none",
                      transition: "border-color 0.2s, box-shadow 0.2s"
                    }}
                  />
                </div>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 4 }}>
                  Correo electrónico
                </label>
                <input
                  type="email" name="email" value={editForm.email}
                  onChange={handleEditChange} className="edit-input"
                  placeholder="correo@ejemplo.com"
                  style={{
                    width: "100%", padding: "10px 12px", borderRadius: 10,
                    border: "1.5px solid #E5E7EB", fontSize: 13, fontFamily: "inherit",
                    color: "#111827", boxSizing: "border-box", outline: "none",
                    transition: "border-color 0.2s, box-shadow 0.2s"
                  }}
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 18 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 4 }}>
                    Teléfono
                  </label>
                  <input
                    type="text" name="telefono" value={editForm.telefono}
                    onChange={handleEditChange} className="edit-input"
                    placeholder="Ej: 3001234567"
                    style={{
                      width: "100%", padding: "10px 12px", borderRadius: 10,
                      border: "1.5px solid #E5E7EB", fontSize: 13, fontFamily: "inherit",
                      color: "#111827", boxSizing: "border-box", outline: "none",
                      transition: "border-color 0.2s, box-shadow 0.2s"
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 4 }}>
                    Carrera
                  </label>
                  <input
                    type="text" name="carrera" value={editForm.carrera}
                    onChange={handleEditChange} className="edit-input"
                    placeholder="Ej: Ing. Sistemas"
                    style={{
                      width: "100%", padding: "10px 12px", borderRadius: 10,
                      border: "1.5px solid #E5E7EB", fontSize: 13, fontFamily: "inherit",
                      color: "#111827", boxSizing: "border-box", outline: "none",
                      transition: "border-color 0.2s, box-shadow 0.2s"
                    }}
                  />
                </div>
              </div>

              {/* Message */}
              {editMsg && (
                <div style={{
                  padding: "10px 14px", borderRadius: 10, marginBottom: 14,
                  background: editMsg.type === 'success' ? '#D1FAE5' : '#FEE2E2',
                  color: editMsg.type === 'success' ? '#065F46' : '#991B1B',
                  fontSize: 13, fontWeight: 600
                }}>
                  {editMsg.type === 'success' ? '✓ ' : '✕ '}{editMsg.text}
                </div>
              )}

              {/* Buttons */}
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button onClick={() => setShowEditModal(false)} style={{
                  padding: "10px 20px", borderRadius: 10,
                  border: "1.5px solid #E5E7EB", background: "white",
                  fontSize: 13, fontWeight: 600, color: "#374151",
                  cursor: "pointer", fontFamily: "inherit"
                }}>
                  Cancelar
                </button>
                <button
                  className="edit-save-btn"
                  onClick={handleEditSave}
                  disabled={saving}
                  style={{
                    padding: "10px 24px", borderRadius: 10, border: "none",
                    background: "#DC2626", color: "white",
                    fontSize: 13, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer",
                    fontFamily: "inherit", boxShadow: "0 2px 8px rgba(220,38,38,0.3)",
                    display: "flex", alignItems: "center", gap: 6,
                    opacity: saving ? 0.7 : 1
                  }}
                >
                  {saving ? (
                    <>
                      <div style={{
                        width: 14, height: 14, borderRadius: "50%",
                        border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white",
                        animation: "spin 0.7s linear infinite"
                      }} />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" fill="none" width="14" height="14">
                        <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Guardar cambios
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}

export default Header;

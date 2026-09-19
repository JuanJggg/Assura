import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import Toast from "./util/alert.jsx";

const EyeIcon = ({ open }) => (
  <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
    {open ? (
      <>
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </>
    ) : (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
      </>
    )}
  </svg>
);

const BUBBLES = [
  { width: 80, height: 80, top: "10%", left: "5%", delay: "0s", duration: "8s" },
  { width: 50, height: 50, top: "25%", left: "15%", delay: "1.5s", duration: "10s" },
  { width: 110, height: 110, top: "60%", left: "3%", delay: "0.8s", duration: "12s" },
  { width: 40, height: 40, top: "80%", left: "20%", delay: "2s", duration: "9s" },
  { width: 70, height: 70, top: "45%", left: "80%", delay: "0.3s", duration: "11s" },
  { width: 35, height: 35, top: "15%", left: "75%", delay: "1.8s", duration: "7s" },
  { width: 90, height: 90, top: "70%", left: "88%", delay: "0.5s", duration: "13s" },
  { width: 55, height: 55, top: "5%", left: "50%", delay: "2.5s", duration: "10s" },
  { width: 65, height: 65, top: "88%", left: "55%", delay: "1.2s", duration: "9s" },
  { width: 45, height: 45, top: "35%", left: "92%", delay: "3s", duration: "8s" },
];

const CARRERAS = [
  "Ingeniería de Sistemas","Ingeniería Civil","Ingeniería Mecánica","Ingeniería Ambiental",
  "Contaduría Pública","Derecho","Comunicación Social","Zootecnia",
  "Administración de Empresas","Tecnología en Gestión Comercial y Financiera"
];

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();
  const googleInitialized = useRef(false);

  // Estado para modal de rol (nuevo usuario Google)
  const [showRolModal, setShowRolModal] = useState(false);
  const [googleCredential, setGoogleCredential] = useState(null);
  const [googleUserInfo, setGoogleUserInfo] = useState(null);
  const [selectedRol, setSelectedRol] = useState("");
  const [selectedCarrera, setSelectedCarrera] = useState("");
  const [selectedCodigo, setSelectedCodigo] = useState("");
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    setTimeout(() => setMounted(true), 50);
  }, []);

  // Cargar Google Identity Services
  useEffect(() => {
    if (googleInitialized.current) return;

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      if (!clientId || clientId.includes("TU_GOOGLE_CLIENT_ID")) {
        console.warn("Google Client ID no configurado. Agrega VITE_GOOGLE_CLIENT_ID al .env");
        return;
      }
      window.google?.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleCallback,
      });
      googleInitialized.current = true;
    };
    document.head.appendChild(script);

    return () => {};
  }, []);

  const handleGoogleCallback = async (response) => {
    setGoogleLoading(true);
    try {
      const res = await API.post("/usuarios/google-login", {
        credential: response.credential,
      });

      if (res.data.ok) {
        // Usuario existente — login directo
        localStorage.setItem("usuario", JSON.stringify(res.data.usuario));
        if (res.data.usuario.rol === "Admin") {
          window.location.href = "/Admin";
        } else {
          window.location.href = "/Dashboard";
        }
      } else if (res.data.nuevoUsuario) {
        // Usuario nuevo — mostrar modal de selección de rol
        setGoogleCredential(response.credential);
        setGoogleUserInfo(res.data.google);
        setShowRolModal(true);
      } else {
        setToast({ type: "error", message: res.data.mensaje });
      }
    } catch (err) {
      setToast({
        type: "error",
        message: err.response?.data?.mensaje || "Error al iniciar sesión con Google",
      });
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    if (!selectedRol) {
      setToast({ type: "warning", message: "Selecciona un rol para continuar" });
      return;
    }
    if (!selectedCodigo.trim()) {
      setToast({ type: "warning", message: "Ingresa tu código" });
      return;
    }
    if (!selectedCarrera) {
      setToast({ type: "warning", message: "Selecciona tu carrera" });
      return;
    }

    setRegistering(true);
    try {
      const res = await API.post("/usuarios/google-login", {
        credential: googleCredential,
        rol: selectedRol,
        carrera: selectedCarrera,
        codigo: selectedCodigo.trim(),
      });

      if (res.data.ok) {
        localStorage.setItem("usuario", JSON.stringify(res.data.usuario));
        setShowRolModal(false);
        if (res.data.usuario.rol === "Admin") {
          window.location.href = "/Admin";
        } else {
          window.location.href = "/Dashboard";
        }
      } else {
        setToast({ type: "error", message: res.data.mensaje });
      }
    } catch (err) {
      setToast({
        type: "error",
        message: err.response?.data?.mensaje || "Error al registrar con Google",
      });
    } finally {
      setRegistering(false);
    }
  };

  const handleGoogleClick = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId || clientId.includes("TU_GOOGLE_CLIENT_ID")) {
      setToast({ type: "error", message: "Google Sign-In no está configurado aún" });
      return;
    }
    window.google?.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        window.google?.accounts.id.prompt();
      }
    });
  };

  const onLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post("/usuarios/login", { email, password });
      if (res.data.ok) {
        localStorage.setItem("usuario", JSON.stringify(res.data.usuario));
        if (res.data.usuario.rol === "Admin") {
          window.location.href = "/Admin";
        } else {
          window.location.href = "/Dashboard";
        }
      } else {
        setToast({ type: 'error', message: res.data.mensaje });
      }
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.mensaje || 'Error en el Inicio de Sesión' });
    } finally {
      setLoading(false);
    }
  };

  const goTo = (path) => {
    setMounted(false);
    setTimeout(() => navigate(path), 350);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }

        @keyframes floatBubble {
          0%   { transform: translateY(0px) scale(1); opacity: 0.12; }
          33%  { transform: translateY(-22px) scale(1.05); opacity: 0.18; }
          66%  { transform: translateY(-8px) scale(0.97); opacity: 0.14; }
          100% { transform: translateY(0px) scale(1); opacity: 0.12; }
        }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateX(40px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeSlideOut {
          from { opacity: 1; transform: translateX(0); }
          to   { opacity: 0; transform: translateX(-40px); }
        }
        @keyframes panelIn {
          from { opacity: 0; transform: translateX(-40px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes modalFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes modalSlideIn { from { opacity: 0; transform: translateY(30px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }

        .login-page-wrapper {
          animation: ${mounted ? "none" : "fadeSlideIn 0.4s ease"};
        }
        .left-panel-anim {
          animation: panelIn 0.5s ease both;
        }
        .right-panel-anim {
          animation: fadeSlideIn 0.5s 0.1s ease both;
        }
        .login-input { transition: border-color 0.2s, box-shadow 0.2s; }
        .login-input:focus { border-color: #DC2626 !important; box-shadow: 0 0 0 3px rgba(220,38,38,0.1) !important; outline: none; }
        .login-btn:hover:not(:disabled) { background: #B91C1C !important; transform: translateY(-2px); box-shadow: 0 8px 24px rgba(220,38,38,0.4) !important; }
        .login-btn:active:not(:disabled) { transform: translateY(0); }
        .login-btn { transition: all 0.25s cubic-bezier(0.34,1.56,0.64,1); }
        .link-btn { transition: color 0.2s; }
        .link-btn:hover { color: #B91C1C !important; text-decoration: underline; }
        .eye-btn:hover { color: #374151 !important; }

        .bubble {
          position: absolute;
          border-radius: 50%;
          background: rgba(255,255,255,0.15);
          animation: floatBubble var(--dur) var(--delay) ease-in-out infinite;
          pointer-events: none;
        }

        .loading-spinner {
          display: inline-block;
          width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,0.4);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          margin-right: 8px;
          vertical-align: middle;
        }

        .google-btn {
          transition: all 0.2s ease;
        }
        .google-btn:hover:not(:disabled) {
          background: #F3F4F6 !important;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important;
          transform: translateY(-1px);
        }
        .google-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .rol-card {
          transition: all 0.2s ease;
          cursor: pointer;
        }
        .rol-card:hover {
          border-color: #DC2626 !important;
          background: #FFF5F5 !important;
        }
        .rol-card.selected {
          border-color: #DC2626 !important;
          background: #FEF2F2 !important;
          box-shadow: 0 0 0 3px rgba(220,38,38,0.1);
        }
      `}</style>

      <div className="auth-wrapper" style={{
        display: "flex", height: "100vh", width: "100%", fontFamily: "'Inter',sans-serif",
        background: "linear-gradient(135deg, #fff 60%, #FEF2F2 100%)",
        opacity: mounted ? 1 : 0,
        transition: "opacity 0.35s ease"
      }}>
        {/* Panel izquierdo decorativo con burbujas */}
        <div className="left-panel-anim auth-panel-left" style={{
          flex: 1, background: "linear-gradient(150deg, #DC2626 0%, #7F1D1D 100%)",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          padding: 48, position: "relative", overflow: "hidden"
        }}>
          {BUBBLES.map((b, i) => (
            <div key={i} className="bubble" style={{
              width: b.width, height: b.height, top: b.top, left: b.left,
              "--delay": b.delay, "--dur": b.duration,
            }} />
          ))}
          <div style={{ position: "absolute", width: 320, height: 320, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.08)", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }} />
          <div style={{ position: "absolute", width: 480, height: 480, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.04)", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }} />

          <img src="/LogoCompleto.png" alt="Assura" style={{ height: 62, marginBottom: 32, filter: "brightness(0) invert(1)", position: "relative", zIndex: 1 }} />
          <h1 style={{ color: "white", fontSize: 34, fontWeight: 800, margin: 0, textAlign: "center", lineHeight: 1.2, position: "relative", zIndex: 1 }}>
            Bienvenido a Assura
          </h1>
          <p style={{ color: "rgba(255,255,255,0.78)", fontSize: 16, marginTop: 16, textAlign: "center", lineHeight: 1.7, maxWidth: 320, position: "relative", zIndex: 1 }}>
            Tu plataforma de apoyo académico integral. Conecta con asesores, participa en el foro y accede al asistente IA.
          </p>
          <div style={{ marginTop: 40, position: "relative", zIndex: 1 }}>
            {["Asesorías personalizadas", "Foro de la comunidad", "Chatbot académico IA"].map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <div style={{ width: 24, height: 24, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg viewBox="0 0 24 24" fill="none" width="13" height="13">
                    <path d="M5 12l5 5L20 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span style={{ color: "rgba(255,255,255,0.88)", fontSize: 14 }}>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Panel derecho: formulario */}
        <div className="right-panel-anim auth-panel-right" style={{
          width: 460, flexShrink: 0, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", padding: "48px 48px",
          background: "white"
        }}>
          <div style={{ width: "100%", maxWidth: 360 }}>
            <img src="/LogoCompleto.png" alt="Assura" style={{ height: 44, marginBottom: 32 }} />
            <h2 style={{ margin: "0 0 6px", fontSize: 26, fontWeight: 800, color: "#111827" }}>Iniciar sesión</h2>
            <p style={{ margin: "0 0 28px", fontSize: 14, color: "#6B7280" }}>Ingresa tus credenciales para continuar</p>

            {/* Botón de Google */}
            <button
              id="google-signin-btn"
              className="google-btn"
              type="button"
              disabled={googleLoading}
              onClick={handleGoogleClick}
              style={{
                width: "100%", padding: "11px 16px", borderRadius: 10,
                border: "1.5px solid #E5E7EB", background: "white",
                fontSize: 14, fontWeight: 600, color: "#374151",
                cursor: googleLoading ? "not-allowed" : "pointer",
                fontFamily: "inherit",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                opacity: googleLoading ? 0.7 : 1,
              }}
            >
              {googleLoading ? (
                <>
                  <span style={{
                    display: "inline-block", width: 16, height: 16,
                    border: "2px solid #E5E7EB", borderTopColor: "#DC2626",
                    borderRadius: "50%", animation: "spin 0.7s linear infinite"
                  }} />
                  Iniciando con Google...
                </>
              ) : (
                <>
                  <GoogleIcon />
                  Continuar con Google
                </>
              )}
            </button>

            {/* Separador */}
            <div style={{ display: "flex", alignItems: "center", gap: 14, margin: "22px 0" }}>
              <div style={{ flex: 1, height: 1, background: "#E5E7EB" }} />
              <span style={{ fontSize: 12, color: "#9CA3AF", fontWeight: 500, whiteSpace: "nowrap" }}>o inicia con email</span>
              <div style={{ flex: 1, height: 1, background: "#E5E7EB" }} />
            </div>

            <form onSubmit={onLogin}>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                  Correo electrónico
                </label>
                <input
                  className="login-input"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="ejemplo@correo.com"
                  required
                  style={{
                    width: "100%", padding: "11px 14px", borderRadius: 10,
                    border: "1.5px solid #E5E7EB", fontSize: 14, fontFamily: "inherit",
                    background: "#F9FAFB", color: "#111827"
                  }}
                />
              </div>

              <div style={{ marginBottom: 28, position: "relative" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>Contraseña</label>
                  <span
                    className="link-btn"
                    onClick={() => goTo("/ForgotPassword")}
                    style={{ fontSize: 12, color: "#DC2626", cursor: "pointer", fontWeight: 500 }}
                  >¿Olvidaste tu contraseña?</span>
                </div>
                <div style={{ position: "relative" }}>
                  <input
                    className="login-input"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    required
                    style={{
                      width: "100%", padding: "11px 44px 11px 14px", borderRadius: 10,
                      border: "1.5px solid #E5E7EB", fontSize: 14, fontFamily: "inherit",
                      background: "#F9FAFB", color: "#111827"
                    }}
                  />
                  <button
                    type="button"
                    className="eye-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                      background: "none", border: "none", cursor: "pointer", color: "#9CA3AF", padding: 4
                    }}
                  >
                    <EyeIcon open={showPassword} />
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="login-btn"
                disabled={loading}
                style={{
                  width: "100%", padding: "13px", borderRadius: 10, border: "none",
                  background: "linear-gradient(135deg,#DC2626,#B91C1C)", color: "white",
                  fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
                  boxShadow: "0 4px 14px rgba(220,38,38,0.3)", opacity: loading ? 0.85 : 1,
                  fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center"
                }}
              >
                {loading && <span className="loading-spinner" />}
                {loading ? "Iniciando sesión..." : "Iniciar sesión"}
              </button>
            </form>

            <p style={{ marginTop: 24, textAlign: "center", fontSize: 13, color: "#6B7280" }}>
              ¿No tienes cuenta?{" "}
              <span
                className="link-btn"
                onClick={() => goTo("/Register")}
                style={{ color: "#DC2626", fontWeight: 600, cursor: "pointer" }}
              >Regístrate gratis</span>
            </p>
          </div>
        </div>
      </div>

      {/* ═══════════ MODAL SELECCIÓN DE ROL (nuevo usuario Google) ═══════════ */}
      {showRolModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 100, backdropFilter: "blur(4px)",
          animation: "modalFadeIn 0.2s ease",
          fontFamily: "'Inter',sans-serif"
        }} onClick={() => setShowRolModal(false)}>
          <div style={{
            background: "white", borderRadius: 20, width: "100%", maxWidth: 440,
            padding: 0, boxShadow: "0 25px 80px rgba(0,0,0,0.2)",
            animation: "modalSlideIn 0.3s ease", overflow: "hidden"
          }} onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div style={{
              background: "linear-gradient(135deg, #DC2626, #991B1B)",
              padding: "24px 28px", color: "white"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <GoogleIcon />
                <div>
                  <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>Completa tu registro</h2>
                  <p style={{ margin: "4px 0 0", fontSize: 13, opacity: 0.85 }}>
                    {googleUserInfo?.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div style={{ padding: "24px 28px" }}>
              <p style={{ margin: "0 0 8px", fontSize: 13, color: "#6B7280" }}>
                Hola <strong style={{ color: "#111827" }}>{googleUserInfo?.nombres}</strong>, selecciona cómo deseas usar Assura:
              </p>

              {/* Selección de rol */}
              <div style={{ display: "flex", gap: 12, margin: "16px 0" }}>
                {[
                  { value: "Estudiante", icon: "🎓", desc: "Busca asesorías y aprende" },
                  { value: "Asesor", icon: "📚", desc: "Ofrece asesorías académicas" },
                ].map(({ value, icon, desc }) => (
                  <div
                    key={value}
                    className={`rol-card${selectedRol === value ? " selected" : ""}`}
                    onClick={() => setSelectedRol(value)}
                    style={{
                      flex: 1, padding: "18px 16px", borderRadius: 14,
                      border: `2px solid ${selectedRol === value ? "#DC2626" : "#E5E7EB"}`,
                      background: selectedRol === value ? "#FEF2F2" : "white",
                      textAlign: "center"
                    }}
                  >
                    <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#111827" }}>{value}</p>
                    <p style={{ margin: "4px 0 0", fontSize: 11, color: "#6B7280" }}>{desc}</p>
                  </div>
                ))}
              </div>

              {/* Código */}
              <div style={{ marginTop: 16 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  Código
                </label>
                <input
                  type="text"
                  value={selectedCodigo}
                  onChange={e => setSelectedCodigo(e.target.value)}
                  placeholder="Ingresa tu código"
                  style={{
                    width: "100%", padding: "10px 14px", borderRadius: 10,
                    border: "1.5px solid #E5E7EB", fontSize: 13, fontFamily: "inherit",
                    background: "#F9FAFB", color: "#111827", outline: "none",
                    boxSizing: "border-box"
                  }}
                />
              </div>

              {/* Selección de carrera */}
              <div style={{ marginTop: 16 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  Carrera
                </label>
                <select
                  value={selectedCarrera}
                  onChange={e => setSelectedCarrera(e.target.value)}
                  style={{
                    width: "100%", padding: "10px 14px", borderRadius: 10,
                    border: "1.5px solid #E5E7EB", fontSize: 13, fontFamily: "inherit",
                    background: "#F9FAFB", color: selectedCarrera ? "#111827" : "#9CA3AF",
                    cursor: "pointer", outline: "none"
                  }}
                >
                  <option value="">Selecciona tu carrera</option>
                  {CARRERAS.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Footer */}
            <div style={{
              padding: "16px 28px", borderTop: "1px solid #F3F4F6",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              background: "#FAFAFA"
            }}>
              <button onClick={() => setShowRolModal(false)} style={{
                padding: "10px 22px", borderRadius: 10,
                border: "1.5px solid #E5E7EB", background: "white",
                fontSize: 13, fontWeight: 600, color: "#374151",
                cursor: "pointer"
              }}>
                Cancelar
              </button>
              <button
                onClick={handleGoogleRegister}
                disabled={registering || !selectedRol || !selectedCarrera || !selectedCodigo.trim()}
                style={{
                  padding: "10px 28px", borderRadius: 10, border: "none",
                  background: (!selectedRol || !selectedCarrera || !selectedCodigo.trim()) ? "#E5E7EB" : "linear-gradient(135deg, #DC2626, #B91C1C)",
                  color: (!selectedRol || !selectedCarrera || !selectedCodigo.trim()) ? "#9CA3AF" : "white",
                  fontSize: 13, fontWeight: 700,
                  cursor: (!selectedRol || !selectedCarrera || !selectedCodigo.trim()) ? "not-allowed" : "pointer",
                  boxShadow: (!selectedRol || !selectedCarrera || !selectedCodigo.trim()) ? "none" : "0 4px 14px rgba(220,38,38,0.3)",
                  display: "flex", alignItems: "center", gap: 8,
                  transition: "all 0.2s ease"
                }}
              >
                {registering ? (
                  <>
                    <span style={{
                      display: "inline-block", width: 16, height: 16, borderRadius: "50%",
                      border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white",
                      animation: "spin 0.7s linear infinite"
                    }} />
                    Registrando...
                  </>
                ) : (
                  "Completar registro"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

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

export default Login;

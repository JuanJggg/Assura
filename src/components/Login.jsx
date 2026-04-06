import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

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

// Datos de burbujas estáticos para evitar re-renders
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

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => setMounted(true), 50);
  }, []);

  const onLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:3001/usuarios/login", { email, password });
      if (res.data.ok) {
        localStorage.setItem("usuario", JSON.stringify(res.data.usuario));
        window.location.href = "/Dashboard";
      } else {
        alert(res.data.mensaje);
      }
    } catch {
      alert("Error en el Inicio de Sesión");
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
      `}</style>

      <div style={{
        display: "flex", height: "100vh", width: "100%", fontFamily: "'Inter',sans-serif",
        background: "linear-gradient(135deg, #fff 60%, #FEF2F2 100%)",
        opacity: mounted ? 1 : 0,
        transition: "opacity 0.35s ease"
      }}>
        {/* Panel izquierdo decorativo con burbujas */}
        <div className="left-panel-anim" style={{
          flex: 1, background: "linear-gradient(150deg, #DC2626 0%, #7F1D1D 100%)",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          padding: 48, position: "relative", overflow: "hidden"
        }}>
          {/* Burbujas animadas */}
          {BUBBLES.map((b, i) => (
            <div
              key={i}
              className="bubble"
              style={{
                width: b.width, height: b.height,
                top: b.top, left: b.left,
                "--delay": b.delay,
                "--dur": b.duration,
              }}
            />
          ))}

          {/* Anillo grande decorativo */}
          <div style={{
            position: "absolute", width: 320, height: 320, borderRadius: "50%",
            border: "2px solid rgba(255,255,255,0.08)", top: "50%", left: "50%",
            transform: "translate(-50%, -50%)"
          }} />
          <div style={{
            position: "absolute", width: 480, height: 480, borderRadius: "50%",
            border: "1px solid rgba(255,255,255,0.04)", top: "50%", left: "50%",
            transform: "translate(-50%, -50%)"
          }} />

          <img src="/LogoCompleto.png" alt="Assura" style={{ height: 62, marginBottom: 32, filter: "brightness(0) invert(1)", position: "relative", zIndex: 1 }} />
          <h1 style={{ color: "white", fontSize: 34, fontWeight: 800, margin: 0, textAlign: "center", lineHeight: 1.2, position: "relative", zIndex: 1 }}>
            Bienvenido a Assura
          </h1>
          <p style={{ color: "rgba(255,255,255,0.78)", fontSize: 16, marginTop: 16, textAlign: "center", lineHeight: 1.7, maxWidth: 320, position: "relative", zIndex: 1 }}>
            Tu plataforma de apoyo académico integral. Conecta con asesores, participa en el foro y accede al asistente IA.
          </p>

          {/* Features list */}
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
        <div className="right-panel-anim" style={{
          width: 460, flexShrink: 0, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", padding: "48px 48px",
          background: "white"
        }}>
          <div style={{ width: "100%", maxWidth: 360 }}>
            <img src="/LogoCompleto.png" alt="Assura" style={{ height: 44, marginBottom: 32 }} />
            <h2 style={{ margin: "0 0 6px", fontSize: 26, fontWeight: 800, color: "#111827" }}>Iniciar sesión</h2>
            <p style={{ margin: "0 0 32px", fontSize: 14, color: "#6B7280" }}>Ingresa tus credenciales para continuar</p>

            <form onSubmit={onLogin}>
              {/* Email */}
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

              {/* Contraseña */}
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
    </>
  );
}

export default Login;
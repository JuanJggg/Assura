import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const BUBBLES = [
  { width: 70,  height: 70,  top: "10%", left: "5%",  delay: "0s",   duration: "8s"  },
  { width: 40,  height: 40,  top: "30%", left: "14%", delay: "1.4s", duration: "11s" },
  { width: 100, height: 100, top: "58%", left: "3%",  delay: "0.7s", duration: "13s" },
  { width: 35,  height: 35,  top: "80%", left: "20%", delay: "2.0s", duration: "9s"  },
  { width: 65,  height: 65,  top: "40%", left: "80%", delay: "0.3s", duration: "10s" },
  { width: 30,  height: 30,  top: "15%", left: "75%", delay: "1.8s", duration: "7s"  },
  { width: 88,  height: 88,  top: "72%", left: "88%", delay: "0.5s", duration: "12s" },
  { width: 52,  height: 52,  top: "5%",  left: "50%", delay: "2.6s", duration: "9s"  },
];

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => setMounted(true), 50);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje(""); setError("");
    if (!/\S+@\S+\.\S+/.test(email)) { setError("Por favor ingresa un correo válido."); return; }
    try {
      setLoading(true);
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
      const res = await axios.post(`${API_URL}/usuarios/forgotPassword`, { email });
      if (res.data.ok) setMensaje("Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.");
      else setError(res.data.mensaje);
    } catch { setError("Hubo un error al procesar la solicitud."); }
    finally { setLoading(false); }
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
          33%  { transform: translateY(-20px) scale(1.04); opacity: 0.18; }
          66%  { transform: translateY(-7px) scale(0.97); opacity: 0.14; }
          100% { transform: translateY(0px) scale(1); opacity: 0.12; }
        }
        @keyframes panelIn {
          from { opacity: 0; transform: translateX(-40px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes formIn {
          from { opacity: 0; transform: translateX(40px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes successPulse {
          0%   { transform: scale(0.8); opacity: 0; }
          60%  { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }

        .fp-left { animation: panelIn 0.5s ease both; }
        .fp-right { animation: formIn 0.5s 0.1s ease both; }
        .fp-input:focus { border-color: #DC2626 !important; box-shadow: 0 0 0 3px rgba(220,38,38,0.1) !important; outline: none; }
        .fp-btn:hover:not(:disabled) { background: #B91C1C !important; transform: translateY(-2px); box-shadow: 0 8px 24px rgba(220,38,38,0.4) !important; }
        .fp-btn:active:not(:disabled) { transform: translateY(0); }
        .fp-btn { transition: all 0.25s cubic-bezier(0.34,1.56,0.64,1); }
        .fp-back { transition: color 0.2s; }
        .fp-back:hover { color: #B91C1C !important; }

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
        .success-box {
          animation: successPulse 0.4s ease both;
        }
      `}</style>

      <div style={{
        display: "flex", height: "100vh", fontFamily: "'Inter',sans-serif",
        background: "linear-gradient(135deg,#fff 60%,#FEF2F2 100%)",
        opacity: mounted ? 1 : 0,
        transition: "opacity 0.35s ease"
      }}>
        {/* Panel rojo con burbujas */}
        <div className="fp-left" style={{
          width: 380, flexShrink: 0,
          background: "linear-gradient(150deg,#DC2626 0%,#7F1D1D 100%)",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          padding: 48, position: "relative", overflow: "hidden"
        }}>
          {BUBBLES.map((b, i) => (
            <div key={i} className="bubble" style={{
              width: b.width, height: b.height,
              top: b.top, left: b.left,
              "--delay": b.delay, "--dur": b.duration,
            }} />
          ))}

          {/* Anillos decorativos */}
          <div style={{ position: "absolute", width: 280, height: 280, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.08)", top: "50%", left: "50%", transform: "translate(-50%,-50%)" }} />
          <div style={{ position: "absolute", width: 420, height: 420, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.04)", top: "50%", left: "50%", transform: "translate(-50%,-50%)" }} />

          <img src="/LogoCompleto.png" alt="Assura" style={{ height: 52, marginBottom: 28, filter: "brightness(0) invert(1)", position: "relative", zIndex: 1 }} />
          <div style={{
            width: 76, height: 76, borderRadius: "50%", background: "rgba(255,255,255,0.16)",
            display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24,
            position: "relative", zIndex: 1,
            boxShadow: "0 0 0 12px rgba(255,255,255,0.06)"
          }}>
            <svg viewBox="0 0 24 24" fill="none" width="34" height="34">
              <rect x="3" y="11" width="18" height="11" rx="2" stroke="white" strokeWidth="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <h2 style={{ color: "white", fontSize: 22, fontWeight: 800, margin: "0 0 12px", textAlign: "center", position: "relative", zIndex: 1 }}>
            ¿Olvidaste tu contraseña?
          </h2>
          <p style={{ color: "rgba(255,255,255,0.78)", fontSize: 14, textAlign: "center", lineHeight: 1.7, margin: 0, position: "relative", zIndex: 1 }}>
            Te enviaremos un enlace seguro a tu correo para que puedas restablecerla en minutos.
          </p>
        </div>

        {/* Panel formulario */}
        <div className="fp-right" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "48px" }}>
          <div style={{ width: "100%", maxWidth: 380 }}>
            <h2 style={{ margin: "0 0 6px", fontSize: 26, fontWeight: 800, color: "#111827" }}>Recuperar contraseña</h2>
            <p style={{ margin: "0 0 32px", fontSize: 14, color: "#6B7280" }}>Ingresa tu correo y te enviaremos las instrucciones</p>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Correo electrónico</label>
                <input
                  className="fp-input"
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1.5px solid #E5E7EB", fontSize: 14, fontFamily: "inherit", background: "#F9FAFB", color: "#111827", outline: "none", transition: "border-color 0.2s", boxSizing: "border-box" }}
                />
              </div>

              {error && (
                <div style={{ padding: "10px 14px", borderRadius: 8, background: "#FEF2F2", border: "1px solid #FECACA", marginBottom: 16 }}>
                  <p style={{ margin: 0, fontSize: 13, color: "#DC2626" }}>{error}</p>
                </div>
              )}
              {mensaje && (
                <div className="success-box" style={{ padding: "12px 16px", borderRadius: 10, background: "#F0FDF4", border: "1px solid #BBF7D0", marginBottom: 16, display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <svg viewBox="0 0 24 24" fill="none" width="18" height="18" style={{ flexShrink: 0, marginTop: 1 }}>
                    <circle cx="12" cy="12" r="10" fill="#16A34A" opacity="0.15"/>
                    <path d="M8 12l3 3 5-6" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <p style={{ margin: 0, fontSize: 13, color: "#15803D", lineHeight: 1.6 }}>{mensaje}</p>
                </div>
              )}

              <button
                type="submit"
                className="fp-btn"
                disabled={loading}
                style={{ width: "100%", padding: "13px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#DC2626,#B91C1C)", color: "white", fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", boxShadow: "0 4px 14px rgba(220,38,38,0.25)", opacity: loading ? 0.85 : 1, fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                {loading && <span className="loading-spinner" />}
                {loading ? "Enviando..." : "Enviar enlace de recuperación"}
              </button>
            </form>

            <p style={{ marginTop: 24, textAlign: "center", fontSize: 13, color: "#6B7280" }}>
              <span className="fp-back" onClick={() => goTo("/")} style={{ color: "#DC2626", fontWeight: 600, cursor: "pointer" }}>
                ← Volver al inicio de sesión
              </span>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default ForgotPassword;

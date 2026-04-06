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

const CARRERAS = [
  "Ingeniería de Sistemas","Ingeniería Civil","Ingeniería Mecánica","Ingeniería Ambiental",
  "Contaduría Pública","Derecho","Comunicación Social","Zootecnia",
  "Administración de Empresas","Tecnología en Gestión Comercial y Financiera"
];

const BUBBLES = [
  { width: 90,  height: 90,  top: "8%",  left: "6%",  delay: "0s",   duration: "9s"  },
  { width: 45,  height: 45,  top: "22%", left: "16%", delay: "1.2s", duration: "11s" },
  { width: 120, height: 120, top: "55%", left: "2%",  delay: "0.6s", duration: "13s" },
  { width: 38,  height: 38,  top: "78%", left: "18%", delay: "2.1s", duration: "8s"  },
  { width: 72,  height: 72,  top: "42%", left: "82%", delay: "0.4s", duration: "10s" },
  { width: 30,  height: 30,  top: "12%", left: "72%", delay: "1.9s", duration: "7s"  },
  { width: 95,  height: 95,  top: "68%", left: "90%", delay: "0.9s", duration: "12s" },
  { width: 58,  height: 58,  top: "4%",  left: "52%", delay: "2.8s", duration: "9s"  },
  { width: 68,  height: 68,  top: "85%", left: "58%", delay: "1.5s", duration: "10s" },
  { width: 48,  height: 48,  top: "33%", left: "94%", delay: "3.2s", duration: "8s"  },
];

function InputField({ label, error, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.04em" }}>
        {label}
      </label>
      {children}
      {error && <p style={{ margin: "4px 0 0", fontSize: 11, color: "#DC2626" }}>{error}</p>}
    </div>
  );
}

function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombres: "", apellidos: "", codigo: "", roles: "",
    telefono: "", carrera: "", email: "", password: "",
  });
  const [errores, setErrores] = useState({});

  useEffect(() => {
    setTimeout(() => setMounted(true), 50);
  }, []);

  const inputStyle = (hasError) => ({
    width: "100%", padding: "10px 13px", borderRadius: 9,
    border: `1.5px solid ${hasError ? "#DC2626" : "#E5E7EB"}`,
    fontSize: 13, fontFamily: "inherit", background: "#F9FAFB", color: "#111827",
    outline: "none", transition: "border-color 0.2s, box-shadow 0.2s", boxSizing: "border-box"
  });

  const validarCampo = (nombre, valor) => {
    let error = "";
    switch (nombre) {
      case "nombres": if (!valor.trim()) error = "Nombre requerido"; break;
      case "apellidos": if (!valor.trim()) error = "Apellido requerido"; break;
      case "codigo":
        if (!valor.trim()) error = "Código requerido";
        else if (!/^\d+$/.test(valor)) error = "Solo números";
        break;
      case "carrera": if (!valor.trim()) error = "Carrera requerida"; break;
      case "email": if (!/\S+@\S+\.\S+/.test(valor)) error = "Correo inválido"; break;
      case "password": if (valor.length < 6) error = "Mínimo 6 caracteres"; break;
      case "roles": if (!valor.trim()) error = "Rol requerido"; break;
      case "telefono":
        if (!valor.trim()) error = "Teléfono requerido";
        else if (!/^\d+$/.test(valor)) error = "Solo números";
        else if (valor.length !== 10) error = "Debe tener 10 dígitos";
        break;
    }
    setErrores(prev => ({ ...prev, [nombre]: error }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    validarCampo(name, value);
  };

  const onRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:3001/usuarios/addUser", formData);
      alert(res.data.mensaje);
      if (res.data.ok) goTo("/");
    } catch {
      alert("Error al registrar");
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
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .reg-left { animation: panelIn 0.5s ease both; }
        .reg-right { animation: formIn 0.5s 0.1s ease both; }
        .reg-input:focus { border-color: #DC2626 !important; box-shadow: 0 0 0 3px rgba(220,38,38,0.08) !important; outline: none; }
        .reg-btn:hover:not(:disabled) { background: #B91C1C !important; transform: translateY(-2px); box-shadow: 0 8px 24px rgba(220,38,38,0.4) !important; }
        .reg-btn:active:not(:disabled) { transform: translateY(0); }
        .reg-btn { transition: all 0.25s cubic-bezier(0.34,1.56,0.64,1); }
        .reg-link { transition: color 0.2s; color: #DC2626; font-weight: 600; cursor: pointer; }
        .reg-link:hover { color: #B91C1C !important; text-decoration: underline; }

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
        minHeight: "100vh", display: "flex", fontFamily: "'Inter',sans-serif",
        background: "linear-gradient(135deg, #fff 55%, #FEF2F2 100%)",
        opacity: mounted ? 1 : 0,
        transition: "opacity 0.35s ease"
      }}>
        {/* Panel izquierdo decorativo */}
        <div className="reg-left" style={{
          width: 320, flexShrink: 0, background: "linear-gradient(150deg,#DC2626 0%,#7F1D1D 100%)",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          padding: 40, position: "relative", overflow: "hidden"
        }}>
          {BUBBLES.map((b, i) => (
            <div key={i} className="bubble" style={{
              width: b.width, height: b.height,
              top: b.top, left: b.left,
              "--delay": b.delay, "--dur": b.duration,
            }} />
          ))}

          {/* Anillos */}
          <div style={{ position: "absolute", width: 260, height: 260, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.08)", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }} />
          <div style={{ position: "absolute", width: 380, height: 380, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.04)", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }} />

          <img src="/LogoCompleto.png" alt="Assura" style={{ height: 50, marginBottom: 28, filter: "brightness(0) invert(1)", position: "relative", zIndex: 1 }} />
          <h2 style={{ color: "white", fontSize: 24, fontWeight: 800, margin: "0 0 12px", textAlign: "center", position: "relative", zIndex: 1 }}>Crea tu cuenta</h2>
          <p style={{ color: "rgba(255,255,255,0.78)", fontSize: 14, textAlign: "center", lineHeight: 1.7, margin: 0, position: "relative", zIndex: 1 }}>
            Únete a Assura y accede a tutorías, foros académicos y asistencia con IA.
          </p>
          <div style={{ marginTop: 40, width: "100%", position: "relative", zIndex: 1 }}>
            {["Asesorías personalizadas","Foro de la comunidad","Chatbot académico IA"].map(item => (
              <div key={item} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <div style={{ width: 22, height: 22, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg viewBox="0 0 24 24" fill="none" width="12" height="12">
                    <path d="M5 12l5 5L20 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span style={{ color: "rgba(255,255,255,0.88)", fontSize: 13 }}>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Panel derecho: formulario */}
        <div className="reg-right" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 48px" }}>
          <div style={{ width: "100%", maxWidth: 680 }}>
            <h2 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 800, color: "#111827" }}>Registro de usuario</h2>
            <p style={{ margin: "0 0 28px", fontSize: 13, color: "#6B7280" }}>Completa todos los campos para crear tu cuenta</p>

            <form onSubmit={onRegister}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px" }}>
                <InputField label="Nombres" error={errores.nombres}>
                  <input className="reg-input" type="text" name="nombres" value={formData.nombres} onChange={handleChange} placeholder="Tus nombres" style={inputStyle(errores.nombres)} required />
                </InputField>
                <InputField label="Apellidos" error={errores.apellidos}>
                  <input className="reg-input" type="text" name="apellidos" value={formData.apellidos} onChange={handleChange} placeholder="Tus apellidos" style={inputStyle(errores.apellidos)} required />
                </InputField>
                <InputField label="Código estudiantil" error={errores.codigo}>
                  <input className="reg-input" type="text" name="codigo" value={formData.codigo} onChange={handleChange} placeholder="Ej: 20230001" style={inputStyle(errores.codigo)} required />
                </InputField>
                <InputField label="Teléfono" error={errores.telefono}>
                  <input className="reg-input" type="text" name="telefono" value={formData.telefono} onChange={handleChange} placeholder="10 dígitos" style={inputStyle(errores.telefono)} required />
                </InputField>
                <InputField label="Rol" error={errores.roles}>
                  <select className="reg-input" name="roles" value={formData.roles} onChange={handleChange} style={inputStyle(errores.roles)} required>
                    <option value="">Selecciona un rol</option>
                    <option value="Estudiante">Estudiante</option>
                    <option value="Asesor">Asesor</option>
                  </select>
                </InputField>
                <InputField label="Carrera" error={errores.carrera}>
                  <select className="reg-input" name="carrera" value={formData.carrera} onChange={handleChange} style={inputStyle(errores.carrera)} required>
                    <option value="">Selecciona tu carrera</option>
                    {CARRERAS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </InputField>
                <InputField label="Correo electrónico" error={errores.email}>
                  <input className="reg-input" type="email" name="email" value={formData.email} onChange={handleChange} placeholder="correo@ejemplo.com" style={inputStyle(errores.email)} required />
                </InputField>
                <InputField label="Contraseña" error={errores.password}>
                  <div style={{ position: "relative" }}>
                    <input
                      className="reg-input"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Mínimo 6 caracteres"
                      style={{ ...inputStyle(errores.password), paddingRight: 40 }}
                      required
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9CA3AF", padding: 4 }}>
                      <EyeIcon open={showPassword} />
                    </button>
                  </div>
                </InputField>
              </div>

              <button
                type="submit"
                className="reg-btn"
                disabled={loading}
                style={{
                  width: "100%", marginTop: 8, padding: "13px", borderRadius: 10, border: "none",
                  background: "linear-gradient(135deg,#DC2626,#B91C1C)", color: "white",
                  fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
                  boxShadow: "0 4px 14px rgba(220,38,38,0.25)", opacity: loading ? 0.85 : 1,
                  fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center"
                }}
              >
                {loading && <span className="loading-spinner" />}
                {loading ? "Creando cuenta..." : "Crear cuenta"}
              </button>
            </form>

            <p style={{ marginTop: 20, textAlign: "center", fontSize: 13, color: "#6B7280" }}>
              ¿Ya tienes cuenta?{" "}
              <span className="reg-link" onClick={() => goTo("/")}>Inicia sesión</span>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default Register;

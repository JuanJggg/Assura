import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [valid, setValid] = useState(false);
  const [loading, setLoading] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

  useEffect(() => {
    axios.get(`${API_URL}/usuarios/validateToken/${token}`)
      .then(res => { if (res.data.ok) setValid(true); })
      .catch(() => setError("El enlace ha expirado o es inválido."));
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) { setError("Las contraseñas no coinciden."); return; }
    if (password.length < 6) { setError("La contraseña debe tener al menos 6 caracteres."); return; }
    try {
      setLoading(true);
      const res = await axios.post(`${API_URL}/usuarios/resetPassword/${token}`, { password });
      if (res.data.ok) {
        setMensaje("Contraseña actualizada correctamente. Redirigiendo...");
        setTimeout(() => navigate("/"), 2000);
      } else setError(res.data.mensaje);
    } catch { setError("Error al actualizar la contraseña."); }
    finally { setLoading(false); }
  };

  if (!valid && !error) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100vh", fontFamily:"Inter,sans-serif" }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ width:40, height:40, borderRadius:"50%", border:"3px solid #E5E7EB", borderTopColor:"#DC2626", animation:"spin 0.8s linear infinite", margin:"0 auto 16px" }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <p style={{ color:"#6B7280", fontSize:14 }}>Verificando enlace...</p>
      </div>
    </div>
  );

  if (error && !valid) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100vh", fontFamily:"Inter,sans-serif" }}>
      <div style={{ textAlign:"center", maxWidth:360, padding:32 }}>
        <div style={{ width:64, height:64, borderRadius:"50%", background:"#FEF2F2", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px" }}>
          <svg viewBox="0 0 24 24" fill="none" width="28" height="28">
            <circle cx="12" cy="12" r="10" stroke="#DC2626" strokeWidth="2"/>
            <path d="M12 8v4M12 16h.01" stroke="#DC2626" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
        <h3 style={{ color:"#111827", fontSize:18, fontWeight:700, margin:"0 0 8px" }}>Enlace inválido</h3>
        <p style={{ color:"#6B7280", fontSize:14 }}>{error}</p>
        <button onClick={() => navigate("/")} style={{ marginTop:20, padding:"10px 24px", borderRadius:9, background:"#DC2626", color:"white", border:"none", cursor:"pointer", fontWeight:600, fontSize:14 }}>
          Ir al inicio
        </button>
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        .rp-input:focus { border-color: #DC2626 !important; box-shadow: 0 0 0 3px rgba(220,38,38,0.1) !important; outline: none; }
        .rp-btn:hover:not(:disabled) { background: #B91C1C !important; transform: translateY(-1px); }
        .rp-btn { transition: all 0.2s; }
      `}</style>
      <div style={{ display:"flex", height:"100vh", fontFamily:"'Inter',sans-serif", background:"linear-gradient(135deg,#fff 60%,#FEF2F2 100%)" }}>
        {/* Panel rojo */}
        <div style={{ width:380, flexShrink:0, background:"linear-gradient(150deg,#DC2626 0%,#991B1B 100%)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:48, position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", top:-80, right:-80, width:280, height:280, borderRadius:"50%", background:"rgba(255,255,255,0.06)" }} />
          <img src="/LogoCompleto.png" alt="Assura" style={{ height:52, marginBottom:28, filter:"brightness(0) invert(1)" }} />
          <div style={{ width:72, height:72, borderRadius:"50%", background:"rgba(255,255,255,0.15)", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:24 }}>
            <svg viewBox="0 0 24 24" fill="none" width="34" height="34">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2 style={{ color:"white", fontSize:22, fontWeight:800, margin:"0 0 12px", textAlign:"center" }}>Nueva contraseña</h2>
          <p style={{ color:"rgba(255,255,255,0.75)", fontSize:14, textAlign:"center", lineHeight:1.7, margin:0 }}>
            Elige una contraseña segura de al menos 6 caracteres. Te recomendamos combinar letras, números y símbolos.
          </p>
        </div>

        {/* Panel formulario */}
        <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:48 }}>
          <div style={{ width:"100%", maxWidth:380 }}>
            <h2 style={{ margin:"0 0 6px", fontSize:26, fontWeight:800, color:"#111827" }}>Restablecer contraseña</h2>
            <p style={{ margin:"0 0 32px", fontSize:14, color:"#6B7280" }}>Escribe tu nueva contraseña dos veces para confirmar</p>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom:20 }}>
                <label style={{ display:"block", fontSize:13, fontWeight:600, color:"#374151", marginBottom:6 }}>Nueva contraseña</label>
                <input className="rp-input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" required
                  style={{ width:"100%", padding:"11px 14px", borderRadius:10, border:"1.5px solid #E5E7EB", fontSize:14, fontFamily:"inherit", background:"#F9FAFB", color:"#111827", transition:"border-color 0.2s", boxSizing:"border-box" }} />
              </div>
              <div style={{ marginBottom:24 }}>
                <label style={{ display:"block", fontSize:13, fontWeight:600, color:"#374151", marginBottom:6 }}>Confirmar contraseña</label>
                <input className="rp-input" type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Repite la contraseña" required
                  style={{ width:"100%", padding:"11px 14px", borderRadius:10, border:`1.5px solid ${confirm && confirm !== password ? "#DC2626" : "#E5E7EB"}`, fontSize:14, fontFamily:"inherit", background:"#F9FAFB", color:"#111827", transition:"border-color 0.2s", boxSizing:"border-box" }} />
                {confirm && confirm !== password && <p style={{ margin:"4px 0 0", fontSize:11, color:"#DC2626" }}>Las contraseñas no coinciden</p>}
              </div>

              {error && <div style={{ padding:"10px 14px", borderRadius:8, background:"#FEF2F2", border:"1px solid #FECACA", marginBottom:16 }}><p style={{ margin:0, fontSize:13, color:"#DC2626" }}>{error}</p></div>}
              {mensaje && <div style={{ padding:"10px 14px", borderRadius:8, background:"#F0FDF4", border:"1px solid #BBF7D0", marginBottom:16 }}><p style={{ margin:0, fontSize:13, color:"#16A34A" }}>{mensaje}</p></div>}

              <button type="submit" className="rp-btn" disabled={loading || (confirm && confirm !== password)}
                style={{ width:"100%", padding:"13px", borderRadius:10, border:"none", background:"linear-gradient(135deg,#DC2626,#B91C1C)", color:"white", fontSize:15, fontWeight:700, cursor:loading?"not-allowed":"pointer", boxShadow:"0 4px 14px rgba(220,38,38,0.25)", opacity:loading?0.75:1, fontFamily:"inherit" }}>
                {loading ? "Guardando..." : "Guardar nueva contraseña"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default ResetPassword;

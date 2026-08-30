import React, { useState, useEffect } from "react";
import API from "../../services/api";
import { X, MessageCircle, Clock, BookOpen, DollarSign } from "lucide-react";

// ─── Avatar helper ────────────────────────────────────────────
function Avatar({ name, size = 44, fontSize = 16 }) {
  const colors = ["#DC2626","#7C3AED","#2563EB","#059669","#D97706","#DB2777"];
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

function AsesorSelector({ onClose, onSelectAsesor }) {
  const [asesores, setAsesores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedAsesor, setExpandedAsesor] = useState(null);
  const [selectedHorario, setSelectedHorario] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    cargarAsesores();
  }, []);

  const cargarAsesores = async () => {
    try {
      setLoading(true);
      // Cargar asesores con info detallada
      const res = await API.post("/dasboard/getAsesores");
      
      // Agrupar por asesor
      const agrupados = res.data.reduce((acc, item) => {
        const existing = acc.find(a => a.id === item.id_asesor);
        const horario = {
          id_asesoria: item.id_asesoria,
          materia: item.materia,
          descripcion: item.descripcion,
          precio_hora: item.precio_hora,
          precio_sesion: item.precio_sesion,
          hora_inicial: item.hora_inicial,
          hora_final: item.hora_final,
        };
        if (existing) {
          existing.asesorias.push(horario);
          if (!existing.materias_list.includes(item.materia)) {
            existing.materias_list.push(item.materia);
          }
        } else {
          acc.push({
            id: item.id_asesor,
            nombres: item.asesor.split(" ")[0],
            apellidos: item.asesor.split(" ").slice(1).join(" "),
            nombre_completo: item.asesor,
            email: "",
            telefono: item.telefono,
            carrera: item.carrera,
            materias: item.materia,
            materias_list: [item.materia],
            asesorias: [horario],
          });
        }
        return acc;
      }, []);

      setAsesores(agrupados);
    } catch (err) {
      console.error("Error al cargar asesores:", err);
      setError("No se pudieron cargar los asesores disponibles");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (time) => {
    if (!time) return "";
    const parts = time.split(":");
    const h = parseInt(parts[0]);
    const m = parts[1];
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 || 12;
    return `${h12}:${m} ${ampm}`;
  };

  const handleExpandAsesor = (asesorId) => {
    if (expandedAsesor === asesorId) {
      setExpandedAsesor(null);
      setSelectedHorario(null);
    } else {
      setExpandedAsesor(asesorId);
      setSelectedHorario(null);
    }
  };

  const handleSelectAsesor = (asesor) => {
    onSelectAsesor(asesor);
  };

  const filteredAsesores = asesores.filter(a => {
    const s = search.toLowerCase();
    return a.nombre_completo?.toLowerCase().includes(s) ||
           a.materias_list.some(m => m.toLowerCase().includes(s)) ||
           a.carrera?.toLowerCase().includes(s);
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      style={{ backdropFilter: "blur(4px)" }}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden"
        style={{ animation: "modalSlideIn 0.3s ease" }}>
        
        <style>{`
          @keyframes modalSlideIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
          .asesor-item { transition: all 0.2s ease; }
          .asesor-item:hover { background: #FAFAFA; }
          .horario-card { transition: all 0.2s ease; cursor: pointer; }
          .horario-card:hover { border-color: #DC2626 !important; background: #FFF5F5 !important; }
          .horario-card.active { border-color: #DC2626 !important; background: #FEF2F2 !important; box-shadow: 0 0 0 3px rgba(220,38,38,0.1); }
        `}</style>

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100"
          style={{ background: "linear-gradient(135deg, #DC2626, #991B1B)" }}>
          <div>
            <h2 className="text-xl font-bold text-white">Selecciona un Asesor</h2>
            <p className="text-sm text-white mt-1" style={{ opacity: 0.8 }}>
              Explora sus materias y horarios disponibles
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full transition-colors"
            style={{ background: "rgba(255,255,255,0.15)", color: "white" }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Search */}
        <div style={{ padding: "12px 20px", borderBottom: "1px solid #F3F4F6" }}>
          <input
            type="text"
            placeholder="Buscar por nombre, materia o carrera..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: "100%", padding: "10px 14px", borderRadius: 10,
              border: "1.5px solid #E5E7EB", fontSize: 13, background: "#F9FAFB",
              outline: "none", fontFamily: "inherit", boxSizing: "border-box"
            }}
            onFocus={e => e.target.style.borderColor = "#DC2626"}
            onBlur={e => e.target.style.borderColor = "#E5E7EB"}
          />
        </div>

        {/* Body */}
        <div className="p-4 overflow-y-auto" style={{ maxHeight: "calc(90vh - 160px)" }}>
          {loading && (
            <div className="text-center py-8">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-red-600 border-r-transparent"></div>
              <p className="mt-2 text-gray-600">Cargando asesores...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-8 text-red-600">
              {error}
            </div>
          )}

          {!loading && !error && filteredAsesores.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {search ? `No se encontraron asesores para "${search}"` : "No hay asesores disponibles en este momento"}
            </div>
          )}

          {!loading && !error && filteredAsesores.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {filteredAsesores.map((asesor) => {
                const isExpanded = expandedAsesor === asesor.id;
                return (
                  <div key={asesor.id} style={{
                    border: `2px solid ${isExpanded ? "#DC2626" : "#E5E7EB"}`,
                    borderRadius: 16, overflow: "hidden",
                    transition: "border-color 0.2s"
                  }}>
                    {/* Asesor row */}
                    <div
                      className="asesor-item"
                      onClick={() => handleExpandAsesor(asesor.id)}
                      style={{
                        padding: "16px 20px", cursor: "pointer",
                        display: "flex", alignItems: "center", gap: 14
                      }}
                    >
                      <Avatar name={asesor.nombre_completo} size={50} fontSize={19} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#111827" }}>
                          {asesor.nombre_completo}
                        </h3>
                        <p style={{ margin: "2px 0 0", fontSize: 12, color: "#6B7280" }}>
                          {asesor.carrera || "Asesor académico"}
                        </p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 6 }}>
                          {asesor.materias_list.map((m, i) => (
                            <span key={i} style={{
                              background: "#FEF2F2", color: "#DC2626",
                              padding: "2px 8px", borderRadius: 12,
                              fontSize: 11, fontWeight: 600
                            }}>{m}</span>
                          ))}
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 12, color: "#9CA3AF" }}>
                          {asesor.asesorias.length} horario{asesor.asesorias.length > 1 ? "s" : ""}
                        </span>
                        <div style={{
                          transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                          transition: "transform 0.3s", color: "#9CA3AF"
                        }}>
                          <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
                            <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Expanded: horarios */}
                    {isExpanded && (
                      <div style={{
                        padding: "0 20px 16px",
                        borderTop: "1px solid #F3F4F6",
                        background: "#FAFAFA"
                      }}>
                        <p style={{ margin: "12px 0 10px", fontSize: 13, fontWeight: 600, color: "#374151", display: "flex", alignItems: "center", gap: 6 }}>
                          <Clock size={14} style={{ color: "#DC2626" }} />
                          Selecciona un horario para iniciar la conversación:
                        </p>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          {asesor.asesorias.map((asesoria, idx) => {
                            const isSelected = selectedHorario === idx;
                            return (
                              <div
                                key={idx}
                                className={`horario-card${isSelected ? " active" : ""}`}
                                onClick={() => setSelectedHorario(idx)}
                                style={{
                                  border: `2px solid ${isSelected ? "#DC2626" : "#E5E7EB"}`,
                                  borderRadius: 12, padding: "12px 16px",
                                  background: isSelected ? "#FEF2F2" : "white",
                                  position: "relative"
                                }}
                              >
                                {/* Radio */}
                                <div style={{
                                  position: "absolute", top: 12, right: 14,
                                  width: 18, height: 18, borderRadius: "50%",
                                  border: `2px solid ${isSelected ? "#DC2626" : "#D1D5DB"}`,
                                  display: "flex", alignItems: "center", justifyContent: "center"
                                }}>
                                  {isSelected && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#DC2626" }} />}
                                </div>

                                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                                  <BookOpen size={14} style={{ color: "#DC2626" }} />
                                  <span style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>{asesoria.materia}</span>
                                </div>

                                {asesoria.descripcion && (
                                  <p style={{ margin: "0 0 6px", fontSize: 12, color: "#6B7280", lineHeight: 1.4, paddingRight: 28 }}>
                                    {asesoria.descripcion}
                                  </p>
                                )}

                                <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#374151" }}>
                                    <Clock size={13} />
                                    <span style={{ fontSize: 12, fontWeight: 600 }}>
                                      {formatTime(asesoria.hora_inicial)} - {formatTime(asesoria.hora_final)}
                                    </span>
                                  </div>
                                  <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#059669" }}>
                                    <DollarSign size={13} />
                                    <span style={{ fontSize: 12, fontWeight: 600 }}>
                                      ${asesoria.precio_hora}/hora
                                    </span>
                                  </div>
                                  <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#7C3AED" }}>
                                    <DollarSign size={13} />
                                    <span style={{ fontSize: 12, fontWeight: 600 }}>
                                      ${asesoria.precio_sesion}/sesión
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Botón de chatear */}
                        <button
                          onClick={() => handleSelectAsesor(asesor)}
                          disabled={selectedHorario === null && asesor.asesorias.length > 1}
                          style={{
                            marginTop: 12, width: "100%", padding: "10px",
                            borderRadius: 10, border: "none",
                            background: (selectedHorario === null && asesor.asesorias.length > 1)
                              ? "#E5E7EB"
                              : "linear-gradient(135deg, #DC2626, #B91C1C)",
                            color: (selectedHorario === null && asesor.asesorias.length > 1) ? "#9CA3AF" : "white",
                            fontSize: 13, fontWeight: 700,
                            cursor: (selectedHorario === null && asesor.asesorias.length > 1) ? "not-allowed" : "pointer",
                            boxShadow: (selectedHorario === null && asesor.asesorias.length > 1) ? "none" : "0 4px 14px rgba(220,38,38,0.3)",
                            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                            transition: "all 0.2s"
                          }}
                        >
                          <MessageCircle size={16} />
                          {(selectedHorario === null && asesor.asesorias.length > 1)
                            ? "Selecciona un horario primero"
                            : "Iniciar conversación"}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AsesorSelector;

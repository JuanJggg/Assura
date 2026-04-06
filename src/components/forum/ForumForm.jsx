import React, { useState } from "react";

const ForumForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({ title: "", description: "" });
  const [errors, setErrors] = useState({ title: "", description: "" });

  const validate = () => {
    const newErrors = { title: "", description: "" };
    if (!formData.title.trim()) newErrors.title = "El título es obligatorio";
    else if (formData.title.length < 5) newErrors.title = "Mínimo 5 caracteres";
    if (!formData.description.trim()) newErrors.description = "La descripción es obligatoria";
    else if (formData.description.length < 10) newErrors.description = "Mínimo 10 caracteres";
    setErrors(newErrors);
    return !newErrors.title && !newErrors.description;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) { onSubmit(formData); setFormData({ title: "", description: "" }); }
  };

  const inputStyle = (hasError) => ({
    width: "100%", padding: "10px 14px", borderRadius: 10,
    border: `1.5px solid ${hasError ? "#DC2626" : "#E5E7EB"}`,
    fontSize: 14, fontFamily: "inherit", background: "#F9FAFB",
    color: "#111827", outline: "none", transition: "border-color 0.2s",
    boxSizing: "border-box"
  });

  return (
    <>
      <style>{`.ff-input:focus{border-color:#DC2626!important;box-shadow:0 0 0 3px rgba(220,38,38,0.08)!important;}`}</style>
      <div style={{ background: "white", borderRadius: 14, padding: "22px 24px", boxShadow: "0 2px 12px rgba(0,0,0,0.08)", border: "1.5px solid #FEE2E2" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <div style={{ width: 4, height: 20, borderRadius: 2, background: "#DC2626" }} />
          <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: "#111827" }}>Crear nuevo tema</h2>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>Título</label>
            <input className="ff-input" type="text" name="title" value={formData.title} onChange={handleChange} placeholder="¿Sobre qué quieres hablar?" style={inputStyle(errors.title)} />
            {errors.title && <p style={{ margin: "4px 0 0", fontSize: 11, color: "#DC2626" }}>{errors.title}</p>}
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>Descripción</label>
            <textarea className="ff-input" name="description" value={formData.description} onChange={handleChange} rows={4} placeholder="Describe detalladamente el tema..." style={{ ...inputStyle(errors.description), resize: "vertical", lineHeight: 1.6 }} />
            {errors.description && <p style={{ margin: "4px 0 0", fontSize: 11, color: "#DC2626" }}>{errors.description}</p>}
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            {onCancel && (
              <button type="button" onClick={onCancel} style={{ padding: "10px 20px", borderRadius: 9, border: "1.5px solid #E5E7EB", background: "white", color: "#374151", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                Cancelar
              </button>
            )}
            <button type="submit" style={{ padding: "10px 24px", borderRadius: 9, border: "none", background: "linear-gradient(135deg,#DC2626,#B91C1C)", color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer", boxShadow: "0 3px 10px rgba(220,38,38,0.25)", fontFamily: "inherit" }}>
              Publicar tema
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default ForumForm;
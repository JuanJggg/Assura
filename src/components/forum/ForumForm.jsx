import React, { useState, useRef } from "react";

// ── SVG Icons ──────────────────────────────────────────────
const PaperclipIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const XIcon = ({ size = 14 }) => (
  <svg viewBox="0 0 24 24" fill="none" width={size} height={size}>
    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
  </svg>
);

const PdfIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="#DC2626" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <polyline points="14 2 14 8 20 8" stroke="#DC2626" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <text x="7" y="17" fontSize="6" fontWeight="bold" fill="#DC2626" fontFamily="sans-serif">PDF</text>
  </svg>
);

const MAX_FILES = 3;
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

const ForumForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({ title: "", description: "" });
  const [errors, setErrors] = useState({ title: "", description: "" });
  const [files, setFiles] = useState([]);
  const [fileError, setFileError] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

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

  const handleFileSelect = (e) => {
    const selected = Array.from(e.target.files || []);
    setFileError("");

    if (files.length + selected.length > MAX_FILES) {
      setFileError(`Máximo ${MAX_FILES} archivos permitidos`);
      return;
    }

    for (const f of selected) {
      if (f.size > MAX_SIZE) {
        setFileError(`"${f.name}" excede el límite de 10 MB`);
        return;
      }
      const isImage = f.type.startsWith("image/");
      const isPdf = f.type === "application/pdf";
      if (!isImage && !isPdf) {
        setFileError(`"${f.name}" no es un formato permitido. Solo imágenes y PDF.`);
        return;
      }
    }

    // Crear previews
    const newFiles = selected.map(f => ({
      file: f,
      name: f.name,
      type: f.type,
      preview: f.type.startsWith("image/") ? URL.createObjectURL(f) : null
    }));

    setFiles(prev => [...prev, ...newFiles]);
    // Reset input para permitir re-seleccionar el mismo archivo
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (idx) => {
    setFiles(prev => {
      const removed = prev[idx];
      if (removed.preview) URL.revokeObjectURL(removed.preview);
      return prev.filter((_, i) => i !== idx);
    });
    setFileError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setUploading(true);
    try {
      await onSubmit(formData, files.map(f => f.file));
      // Limpiar previews
      files.forEach(f => { if (f.preview) URL.revokeObjectURL(f.preview); });
      setFormData({ title: "", description: "" });
      setFiles([]);
    } finally {
      setUploading(false);
    }
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
      <style>{`
        .ff-input:focus{border-color:#DC2626!important;box-shadow:0 0 0 3px rgba(220,38,38,0.08)!important;}
        .ff-attach-btn{transition:all 0.15s;}
        .ff-attach-btn:hover{background:#FEF2F2!important;color:#DC2626!important;}
        .ff-file-remove{transition:all 0.15s;opacity:0.6;}
        .ff-file-remove:hover{opacity:1;background:#FEE2E2!important;}
        @keyframes ffPulse{0%,100%{opacity:1}50%{opacity:0.5}}
      `}</style>
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
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>Descripción</label>
            <textarea className="ff-input" name="description" value={formData.description} onChange={handleChange} rows={4} placeholder="Describe detalladamente el tema..." style={{ ...inputStyle(errors.description), resize: "vertical", lineHeight: 1.6 }} />
            {errors.description && <p style={{ margin: "4px 0 0", fontSize: 11, color: "#DC2626" }}>{errors.description}</p>}
          </div>

          {/* Adjuntar archivos */}
          <div style={{ marginBottom: 20 }}>
            <input ref={fileInputRef} type="file" accept="image/*,.pdf" multiple onChange={handleFileSelect} style={{ display: "none" }} />
            <button
              type="button"
              className="ff-attach-btn"
              onClick={() => fileInputRef.current?.click()}
              disabled={files.length >= MAX_FILES}
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "8px 14px", borderRadius: 8,
                border: "1.5px dashed #D1D5DB", background: "white",
                color: files.length >= MAX_FILES ? "#D1D5DB" : "#6B7280",
                fontSize: 13, fontWeight: 600, cursor: files.length >= MAX_FILES ? "not-allowed" : "pointer",
                fontFamily: "inherit"
              }}
            >
              <PaperclipIcon />
              Adjuntar archivos ({files.length}/{MAX_FILES})
            </button>
            {fileError && <p style={{ margin: "6px 0 0", fontSize: 11, color: "#DC2626" }}>{fileError}</p>}

            {/* Previews */}
            {files.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 12 }}>
                {files.map((f, idx) => (
                  <div key={idx} style={{ position: "relative", borderRadius: 10, overflow: "hidden", border: "1.5px solid #E5E7EB", background: "#F9FAFB" }}>
                    {f.preview ? (
                      <img src={f.preview} alt={f.name} style={{ width: 80, height: 80, objectFit: "cover", display: "block" }} />
                    ) : (
                      <div style={{ width: 80, height: 80, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, padding: 6 }}>
                        <PdfIcon />
                        <span style={{ fontSize: 9, color: "#6B7280", textAlign: "center", wordBreak: "break-all", lineHeight: 1.2, maxHeight: 26, overflow: "hidden" }}>{f.name}</span>
                      </div>
                    )}
                    <button
                      type="button"
                      className="ff-file-remove"
                      onClick={() => removeFile(idx)}
                      style={{
                        position: "absolute", top: 3, right: 3,
                        width: 20, height: 20, borderRadius: "50%",
                        border: "none", background: "rgba(255,255,255,0.9)",
                        cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                        color: "#DC2626", padding: 0
                      }}
                    >
                      <XIcon size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            {onCancel && (
              <button type="button" onClick={onCancel} disabled={uploading} style={{ padding: "10px 20px", borderRadius: 9, border: "1.5px solid #E5E7EB", background: "white", color: "#374151", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                Cancelar
              </button>
            )}
            <button type="submit" disabled={uploading} style={{
              padding: "10px 24px", borderRadius: 9, border: "none",
              background: uploading ? "#F3F4F6" : "linear-gradient(135deg,#DC2626,#B91C1C)",
              color: uploading ? "#9CA3AF" : "white",
              fontSize: 13, fontWeight: 700, cursor: uploading ? "wait" : "pointer",
              boxShadow: uploading ? "none" : "0 3px 10px rgba(220,38,38,0.25)",
              fontFamily: "inherit", display: "flex", alignItems: "center", gap: 8
            }}>
              {uploading && <div style={{ width: 14, height: 14, border: "2px solid #D1D5DB", borderTopColor: "#DC2626", borderRadius: "50%", animation: "ffPulse 0.8s linear infinite" }} />}
              {uploading ? "Publicando..." : "Publicar tema"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default ForumForm;
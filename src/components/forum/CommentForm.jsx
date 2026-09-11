import React, { useState, useRef } from "react";

const PaperclipIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const XIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" width="12" height="12">
    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
  </svg>
);

const MAX_SIZE = 10 * 1024 * 1024;

const CommentForm = ({ onSubmit, onCancel }) => {
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [fileError, setFileError] = useState("");
  const [uploading, setUploading] = useState(false);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    setContent(e.target.value);
    setError("");
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  };

  const handleFileSelect = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFileError("");

    if (selected.size > MAX_SIZE) {
      setFileError("El archivo excede 10 MB");
      return;
    }
    const isImage = selected.type.startsWith("image/");
    const isPdf = selected.type === "application/pdf";
    if (!isImage && !isPdf) {
      setFileError("Solo imágenes y PDF permitidos");
      return;
    }

    setFile(selected);
    setFilePreview(isImage ? URL.createObjectURL(selected) : null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = () => {
    if (filePreview) URL.revokeObjectURL(filePreview);
    setFile(null);
    setFilePreview(null);
    setFileError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && !file) { setError("Escribe un comentario o adjunta un archivo"); return; }
    if (content.trim() && content.trim().length < 5) { setError("Mínimo 5 caracteres"); return; }
    setUploading(true);
    try {
      await onSubmit({ content: content.trim() }, file || null);
      if (filePreview) URL.revokeObjectURL(filePreview);
      setContent("");
      setFile(null);
      setFilePreview(null);
      setError("");
      if (textareaRef.current) textareaRef.current.style.height = "auto";
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <style>{`
        .cf-ta:focus{border-color:#DC2626!important;box-shadow:0 0 0 3px rgba(220,38,38,0.08)!important;outline:none;}
        .cf-clip{transition:all 0.15s;opacity:0.5;}
        .cf-clip:hover{opacity:1;color:#DC2626!important;}
      `}</style>
      <form onSubmit={handleSubmit}>
        {/* File preview */}
        {file && (
          <div style={{ marginBottom: 8, display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 10px", background: "#F9FAFB", borderRadius: 8, border: "1px solid #E5E7EB" }}>
            {filePreview ? (
              <img src={filePreview} alt="" style={{ width: 36, height: 36, objectFit: "cover", borderRadius: 6 }} />
            ) : (
              <div style={{ width: 36, height: 36, borderRadius: 6, background: "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg viewBox="0 0 24 24" fill="none" width="16" height="16"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="#DC2626" strokeWidth="1.5"/><polyline points="14 2 14 8 20 8" stroke="#DC2626" strokeWidth="1.5"/></svg>
              </div>
            )}
            <span style={{ fontSize: 11, color: "#374151", maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.name}</span>
            <button type="button" onClick={removeFile} style={{ background: "none", border: "none", cursor: "pointer", color: "#9CA3AF", padding: 2, display: "flex" }}>
              <XIcon />
            </button>
          </div>
        )}

        <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
          {/* Clip button */}
          <input ref={fileInputRef} type="file" accept="image/*,.pdf" onChange={handleFileSelect} style={{ display: "none" }} />
          <button
            type="button"
            className="cf-clip"
            onClick={() => fileInputRef.current?.click()}
            disabled={!!file || uploading}
            style={{
              width: 36, height: 36, borderRadius: "50%",
              border: "1px solid #E5E7EB", background: "white",
              cursor: file || uploading ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#9CA3AF", flexShrink: 0, padding: 0
            }}
            title="Adjuntar archivo"
          >
            <PaperclipIcon />
          </button>

          <textarea
            ref={textareaRef}
            className="cf-ta"
            value={content}
            onChange={handleChange}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(e); } }}
            placeholder="Escribe tu comentario... (Enter para enviar)"
            rows={2}
            disabled={uploading}
            style={{ flex: 1, padding: "10px 14px", borderRadius: 10, border: `1.5px solid ${error ? "#DC2626" : "#E5E7EB"}`, fontSize: 13, fontFamily: "inherit", background: "#F9FAFB", color: "#111827", resize: "none", lineHeight: 1.6, transition: "border-color 0.2s", minHeight: 44, maxHeight: 120, overflow: "auto", boxSizing: "border-box" }}
          />
          <button type="submit" disabled={(!content.trim() && !file) || uploading} style={{ width: 40, height: 40, borderRadius: "50%", border: "none", background: (content.trim() || file) && !uploading ? "linear-gradient(135deg,#DC2626,#B91C1C)" : "#E5E7EB", color: (content.trim() || file) && !uploading ? "white" : "#9CA3AF", cursor: (content.trim() || file) && !uploading ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: (content.trim() || file) && !uploading ? "0 2px 8px rgba(220,38,38,0.3)" : "none", transition: "all 0.15s" }}>
            <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
              <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M22 2L15 22 11 13 2 9l20-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        {(error || fileError) && <p style={{ margin: "4px 0 0", fontSize: 11, color: "#DC2626" }}>{error || fileError}</p>}
      </form>
    </>
  );
};

export default CommentForm;
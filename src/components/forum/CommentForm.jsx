import React, { useState, useRef } from "react";

const CommentForm = ({ onSubmit, onCancel }) => {
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const textareaRef = useRef(null);

  const handleChange = (e) => {
    setContent(e.target.value);
    setError("");
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) { setError("El comentario es obligatorio"); return; }
    if (content.trim().length < 5) { setError("Mínimo 5 caracteres"); return; }
    onSubmit({ content: content.trim() });
    setContent("");
    setError("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  return (
    <>
      <style>{`.cf-ta:focus{border-color:#DC2626!important;box-shadow:0 0 0 3px rgba(220,38,38,0.08)!important;outline:none;}`}</style>
      <form onSubmit={handleSubmit}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 10 }}>
          <textarea
            ref={textareaRef}
            className="cf-ta"
            value={content}
            onChange={handleChange}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(e); } }}
            placeholder="Escribe tu comentario... (Enter para enviar)"
            rows={2}
            style={{ flex: 1, padding: "10px 14px", borderRadius: 10, border: `1.5px solid ${error ? "#DC2626" : "#E5E7EB"}`, fontSize: 13, fontFamily: "inherit", background: "#F9FAFB", color: "#111827", resize: "none", lineHeight: 1.6, transition: "border-color 0.2s", minHeight: 44, maxHeight: 120, overflow: "auto", boxSizing: "border-box" }}
          />
          <button type="submit" disabled={!content.trim()} style={{ width: 40, height: 40, borderRadius: "50%", border: "none", background: content.trim() ? "linear-gradient(135deg,#DC2626,#B91C1C)" : "#E5E7EB", color: content.trim() ? "white" : "#9CA3AF", cursor: content.trim() ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: content.trim() ? "0 2px 8px rgba(220,38,38,0.3)" : "none", transition: "all 0.15s" }}>
            <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
              <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M22 2L15 22 11 13 2 9l20-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        {error && <p style={{ margin: "4px 0 0", fontSize: 11, color: "#DC2626" }}>{error}</p>}
      </form>
    </>
  );
};

export default CommentForm;
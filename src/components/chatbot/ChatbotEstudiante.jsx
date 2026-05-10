import React, { useState, useRef, useEffect, useCallback } from "react";
import Menu from "../menu";
import Header from "../header";
import axios from "axios";

const BACKEND = "http://localhost:3001";
const BERT_API = "http://localhost:8000";

// ── Configuración de categorías ──────────────────────────────────────────────
const CATEGORIA_CONFIG = {
  metodologia_estudio:    { nombre: "Metodología de Estudio",      color: "#3B82F6", bg: "#EFF6FF" },
  dificultades_academicas:{ nombre: "Dificultades Académicas",     color: "#EF4444", bg: "#FEF2F2" },
  orientacion_academica:  { nombre: "Orientación Académica",       color: "#10B981", bg: "#ECFDF5" },
  estres_presion:         { nombre: "Estrés o Presión Académica",  color: "#F59E0B", bg: "#FFFBEB" },
  solicitud_asesoria:     { nombre: "Solicitud de Asesoría",       color: "#8B5CF6", bg: "#F5F3FF" },
  solicitud_ejercicio:    { nombre: "Ejercicio",                   color: "#06B6D4", bg: "#ECFEFF" },
  envio_ejercicio:        { nombre: "Solución Paso a Paso",        color: "#EC4899", bg: "#FDF2F8" },
};

const INTENCION_CONFIG = {
  saludo:           { label: "Saludo",            color: "#10B981" },
  despedida:        { label: "Despedida",         color: "#6B7280" },
  agradecimiento:   { label: "Gracias recibido",  color: "#10B981" },
  identidad:        { label: "Sobre Assura IA",   color: "#8B5CF6" },
  ayuda:            { label: "Ayuda",             color: "#3B82F6" },
  ejercicio_pedir:  { label: "Ejercicio",         color: "#06B6D4" },
  ejercicio_enviar: { label: "Resolución",        color: "#EC4899" },
  explicar_tema:    { label: "Explicación",       color: "#3B82F6" },
  motivacion:       { label: "Motivación",        color: "#F59E0B" },
  estres_emocional: { label: "Bienestar",         color: "#F59E0B" },
  asesoria:         { label: "Asesoría",          color: "#8B5CF6" },
  tecnica_estudio:  { label: "Técnica de Estudio",color: "#3B82F6" },
  general:          { label: "Conversación",      color: "#6B7280" },
};

// ── Fallback local cuando el backend no está disponible ──────────────────────
const FALLBACK_INTENCIONES = {
  saludo: /^(hola|buenos\s+d[ií]as|buenas\s+tardes|buenas\s+noches|hey|hi|saludos|qu[eé]\s+tal)/i,
  despedida: /^(adi[oó]s|hasta\s+luego|chao|bye|nos\s+vemos)/i,
  agradecimiento: /\b(gracias|muchas\s+gracias|thank\s+you)\b/i,
  identidad: /(qui[eé]n\s+eres|qu[eé]\s+eres|eres\s+un\s+bot|eres\s+ia|qu[eé]\s+puedes\s+hacer)/i,
  ayuda: /^(ayuda|help|no\s+s[eé]|por\s+d[oó]nde)/i,
  ejercicio_pedir: /(dame\s+un\s+ejercicio|gen[eé]ra(me)?\s+un\s+ejercicio|quiero\s+practicar|ejercicio\s+de)/i,
  ejercicio_enviar: /(resuelve|calcula|simplifica|factoriza|=\s*\d|\d\s*[+\-*/^]\s*\d)/i,
  explicar_tema: /(expl[ií]ca(me)?|qu[eé]\s+es|c[oó]mo\s+funciona|enséñame)/i,
  estres_emocional: /(estresado|ansiedad|ansioso|p[aá]nico|no\s+aguanto|agotado)/i,
  motivacion: /(no\s+puedo|no\s+sirvo|soy\s+malo|me\s+rindo|reprob[eé])/i,
  asesoria: /(asesor|tutor|tutor[ií]a|cita|reuni[oó]n|hablar\s+con\s+alguien)/i,
};

function detectarIntencionLocal(texto) {
  for (const [intent, regex] of Object.entries(FALLBACK_INTENCIONES)) {
    if (regex.test(texto)) return intent;
  }
  return "general";
}

function generarRespuestaLocal(texto, nombreUsuario = "") {
  const intencion = detectarIntencionLocal(texto);
  const nombre = nombreUsuario ? `, ${nombreUsuario}` : "";

  const respuestas = {
    saludo: `¡Hola${nombre}! 👋 Soy **Assura IA**, tu asistente académico.\n\nPuedo ayudarte con:\n• 📐 Resolver y generar ejercicios matemáticos\n• 📚 Explicar temas académicos\n• 🎯 Técnicas de estudio\n• 💆 Manejo del estrés\n• 🤝 Conectarte con un asesor\n\n¿Con qué necesitas ayuda?`,
    despedida: "¡Hasta luego! 👋 Fue un gusto ayudarte. ¡Mucho éxito en tus estudios! 🎓",
    agradecimiento: "¡De nada! 😊 Para eso estoy aquí. ¿Hay algo más en lo que pueda ayudarte?",
    identidad: `Soy **Assura IA** 🤖, el asistente académico inteligente de Assura.\n\nPuedo resolver ejercicios, explicar temas, darte técnicas de estudio y apoyarte emocionalmente. ¿Qué necesitas?`,
    ayuda: `**Puedo ayudarte con:**\n\n• Escribe *"resuelve: 3x + 6 = 15"* → lo resuelvo paso a paso\n• Escribe *"dame un ejercicio de álgebra"* → genero uno con solución\n• Escribe *"explícame qué es una derivada"* → explicación detallada\n• Escribe *"técnicas de estudio"* → Pomodoro, Feynman y más\n• Escribe *"estoy estresado"* → apoyo emocional`,
    ejercicio_pedir: "¡Claro! Puedo generar ejercicios de álgebra, cálculo, estadística, geometría y más.\n\nEscribe por ejemplo:\n• *\"Dame un ejercicio de cálculo difícil\"*\n• *\"Ejercicio fácil de estadística\"*\n\nO usa los botones de acceso rápido abajo 👇",
    ejercicio_enviar: "¡Entendido! Para resolver bien el ejercicio, escríbelo claramente:\n• *\"Resuelve: 2x + 5 = 11\"*\n• *\"Derivada de x³ + 2x\"*\n• *\"Media de: 5, 8, 12, 7\"*",
    explicar_tema: "Puedo explicar: derivadas, integrales, límites, ecuaciones, probabilidad, estadística, fracciones, porcentajes, Pomodoro, Feynman, mapas mentales... ¿Cuál quieres?",
    estres_emocional: "Respira profundo. El estrés académico es muy real y muy común. 💙\n\n**Técnica inmediata:** Inhala 4s → Mantén 7s → Exhala 8s. Repite 4 veces.\n\nCuéntame qué estás sintiendo. No estás solo/a.",
    motivacion: "Entiendo cómo te sientes. Pero el hecho de que estés aquí buscando apoyo ya es una señal de fortaleza. 💪\n\nLas dificultades académicas rara vez son por falta de inteligencia — casi siempre son por falta del método correcto. ¿Qué está pasando exactamente?",
    asesoria: "Para conectarte con un asesor:\n\n1. 📋 Ve al **Dashboard** → sección 'Asesores Disponibles'\n2. 💬 Inicia un chat o programa una cita\n3. ⏰ Hay asesores disponibles en varios horarios\n\n¿Sobre qué tema necesitas asesoría?",
    general: "Estoy aquí para ayudarte. 😊 Puedo resolver ejercicios matemáticos, explicar temas, darte técnicas de estudio o apoyarte emocionalmente.\n\n¿Qué necesitas?",
  };

  return { respuesta: respuestas[intencion], intencion, categoria: null, confianza: null, recursos: [], consejo_rapido: null };
}

// ── Iconos SVG ──────────────────────────────────────────────────────────────
const BotIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
    <rect x="3" y="11" width="18" height="11" rx="3" fill="#7C3AED" opacity="0.15"/>
    <rect x="3" y="11" width="18" height="11" rx="3" stroke="#7C3AED" strokeWidth="1.5"/>
    <circle cx="8.5" cy="16.5" r="1.5" fill="#7C3AED"/>
    <circle cx="15.5" cy="16.5" r="1.5" fill="#7C3AED"/>
    <path d="M9 20.5h6" stroke="#7C3AED" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M12 11V8" stroke="#7C3AED" strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="12" cy="6.5" r="2" fill="#7C3AED"/>
    <path d="M3 16h-1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1h1M21 16h1a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1h-1" stroke="#7C3AED" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const SendIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
    <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M22 2L15 22 11 13 2 9l20-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const HistoryIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3 3v5h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 7v5l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const LightbulbIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" width="14" height="14">
    <path d="M9 18h6M10 22h4M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7z" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ChevronIcon = ({ open }) => (
  <svg viewBox="0 0 24 24" fill="none" width="14" height="14" style={{ transform: open ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }}>
    <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const MathIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" width="14" height="14">
    <path d="M4 6h16M4 12h10M4 18h7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M18 14v8M14 18h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const ACCIONES_RAPIDAS_EJERCICIOS = [
  { label: "Álgebra 🔢", mensaje: "Dame un ejercicio de álgebra de nivel medio" },
  { label: "Cálculo 📈", mensaje: "Dame un ejercicio de cálculo" },
  { label: "Física ⚛️", mensaje: "Dame un ejercicio de física" },
  { label: "Programación 💻", mensaje: "Dame un ejercicio de programación" },
  { label: "Estadística 📊", mensaje: "Dame un ejercicio de estadística" },
  { label: "Geometría 📐", mensaje: "Dame un ejercicio de geometría" },
  { label: "Álgebra Lineal 📊", mensaje: "Dame un ejercicio de álgebra lineal" },
  { label: "Discretas 🔗", mensaje: "Dame un ejercicio de matemáticas discretas" },
  { label: "Bases de Datos 🗄️", mensaje: "Dame un ejercicio de bases de datos" },
  { label: "Aritmética ➕", mensaje: "Dame un ejercicio de aritmética" },
  { label: "Lógica 🧠", mensaje: "Dame un ejercicio de lógica" },
  { label: "Difícil 🔥", mensaje: "Dame un ejercicio muy difícil de cálculo" },
];

const SUGERENCIAS = [
  "Hola, ¿qué puedes hacer?",
  "Explícame qué es una derivada",
  "Resuelve: 3x + 6 = 15",
  "Dame un ejercicio de física",
  "Dame un ejercicio de programación",
  "Explícame bases de datos",
  "Técnicas para estudiar mejor",
];

// ── Componentes UI ─────────────────────────────────────────────────────────
function TypingIndicator() {
  return (
    <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 12, alignItems: "flex-end", gap: 8 }}>
      <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,#7C3AED,#4F46E5)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <BotIcon />
      </div>
      <div style={{ background: "white", border: "1px solid #E5E7EB", borderRadius: "4px 18px 18px 18px", padding: "14px 18px", display: "flex", alignItems: "center", gap: 6, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
        <style>{`@keyframes typingBounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-5px)} }`}</style>
        {[0, 1, 2].map(i => (
          <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: "#9CA3AF", animation: "typingBounce 1.2s infinite", animationDelay: `${i * 0.2}s` }} />
        ))}
      </div>
    </div>
  );
}

function IntencionBadge({ intencion, categoria }) {
  const cfg = intencion ? INTENCION_CONFIG[intencion] : null;
  const catCfg = categoria ? CATEGORIA_CONFIG[categoria] : null;
  const config = cfg || (catCfg ? { label: catCfg.nombre, color: catCfg.color } : null);
  if (!config) return null;
  return (
    <span style={{
      display: "inline-block",
      background: config.color + "18",
      color: config.color,
      border: `1px solid ${config.color}40`,
      borderRadius: 20,
      padding: "2px 10px",
      fontSize: 11,
      fontWeight: 600,
      marginBottom: 6,
    }}>
      {config.label}
    </span>
  );
}

// Renderiza **bold**, bullet points y saltos de línea
function FormattedText({ text }) {
  const lines = text.split("\n");
  return (
    <div style={{ margin: 0, color: "#1F2937", fontSize: 14, lineHeight: 1.75 }}>
      {lines.map((line, i) => {
        if (!line.trim()) return <div key={i} style={{ height: 6 }} />;
        const parts = line.split(/(\*\*[^*]+\*\*)/g);
        return (
          <div key={i} style={{ marginBottom: 2 }}>
            {parts.map((part, j) => {
              if (part.startsWith("**") && part.endsWith("**")) {
                return <strong key={j}>{part.slice(2, -2)}</strong>;
              }
              return <span key={j}>{part}</span>;
            })}
          </div>
        );
      })}
    </div>
  );
}

// Muestra solución de ejercicio con pasos colapsables
function EjercicioCard({ ejercicioData }) {
  const [mostrarSolucion, setMostrarSolucion] = useState(false);
  if (!ejercicioData) return null;

  const { tipo_accion, nombre_materia, ejercicio, solucion, dificultad } = ejercicioData;

  // Para resolución directa
  if (tipo_accion === "resolucion" && solucion) {
    const pasos = solucion.pasos || [];
    return (
      <div style={{ marginTop: 12, border: "1px solid #E0F2FE", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ background: "linear-gradient(135deg,#0EA5E9,#06B6D4)", padding: "10px 14px", display: "flex", alignItems: "center", gap: 8 }}>
          <MathIcon />
          <span style={{ color: "white", fontWeight: 700, fontSize: 13 }}>
            {solucion.tipo || "Solución"} · {nombre_materia}
          </span>
        </div>
        <div style={{ padding: "12px 14px", background: "white" }}>
          {pasos.map((paso, i) => (
            <div key={i} style={{ display: "flex", gap: 10, marginBottom: 8, alignItems: "flex-start" }}>
              <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#0EA5E9", color: "white", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                {i + 1}
              </div>
              <p style={{ margin: 0, fontSize: 13, color: "#374151", lineHeight: 1.6 }}>{paso}</p>
            </div>
          ))}
          {solucion.resultado && (
            <div style={{ marginTop: 10, padding: "8px 12px", background: "#F0FDF4", border: "1px solid #BBFFD8", borderRadius: 8, fontWeight: 700, color: "#166534", fontSize: 14 }}>
              ✅ Resultado: {solucion.resultado}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Para ejercicio generado (con solución colapsable)
  if (tipo_accion === "generacion" && ejercicio) {
    const sol = ejercicio.solucion || {};
    const pasos = sol.pasos || [];
    return (
      <div style={{ marginTop: 12, border: "1px solid #E0F2FE", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ background: "linear-gradient(135deg,#7C3AED,#4F46E5)", padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <MathIcon />
            <span style={{ color: "white", fontWeight: 700, fontSize: 13 }}>
              {nombre_materia} · {dificultad || ejercicio.dificultad || "medio"}
            </span>
          </div>
          <span style={{ background: "rgba(255,255,255,0.2)", color: "white", borderRadius: 12, padding: "2px 8px", fontSize: 11 }}>
            ejercicio
          </span>
        </div>
        <div style={{ padding: "12px 14px", background: "#FAFAFA", borderBottom: "1px solid #E5E7EB" }}>
          <p style={{ margin: 0, fontSize: 14, color: "#1F2937", fontWeight: 600 }}>{ejercicio.enunciado}</p>
        </div>
        <div style={{ background: "white" }}>
          <button
            onClick={() => setMostrarSolucion(!mostrarSolucion)}
            style={{ width: "100%", padding: "10px 14px", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", color: "#6366F1", fontWeight: 600, fontSize: 13 }}
          >
            <span>{mostrarSolucion ? "Ocultar solución" : "Ver solución paso a paso"}</span>
            <ChevronIcon open={mostrarSolucion} />
          </button>
          {mostrarSolucion && (
            <div style={{ padding: "10px 14px", borderTop: "1px solid #F3F4F6" }}>
              {pasos.map((paso, i) => (
                <div key={i} style={{ display: "flex", gap: 10, marginBottom: 8, alignItems: "flex-start" }}>
                  <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#6366F1", color: "white", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                    {i + 1}
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: "#374151", lineHeight: 1.6 }}>{paso}</p>
                </div>
              ))}
              {sol.resultado && (
                <div style={{ marginTop: 10, padding: "8px 12px", background: "#F0FDF4", border: "1px solid #BBFFD8", borderRadius: 8, fontWeight: 700, color: "#166534", fontSize: 14 }}>
                  ✅ Resultado: {sol.resultado}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}

function BotMessage({ msg, isNew }) {
  const [showRecursos, setShowRecursos] = useState(false);
  return (
    <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 16, alignItems: "flex-end", gap: 8, animation: isNew ? "fadeInMsg 0.3s ease" : "none" }}>
      <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,#7C3AED,#4F46E5)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <BotIcon />
      </div>
      <div style={{ maxWidth: "78%" }}>
        <IntencionBadge intencion={msg.intencion} categoria={msg.categoria} />
        <div style={{ background: "white", border: "1px solid #E5E7EB", borderRadius: "4px 18px 18px 18px", padding: "14px 18px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
          <FormattedText text={msg.texto} />

          {/* Card de ejercicio con pasos */}
          {msg.ejercicio_data && <EjercicioCard ejercicioData={msg.ejercicio_data} />}

          {/* Consejo rápido */}
          {msg.consejo && (
            <div style={{ marginTop: 12, padding: "10px 14px", background: "#F0FDF4", borderLeft: "3px solid #10B981", borderRadius: "0 8px 8px 0", display: "flex", gap: 8, alignItems: "flex-start" }}>
              <LightbulbIcon />
              <p style={{ margin: 0, fontSize: 13, color: "#065F46", lineHeight: 1.6 }}>{msg.consejo}</p>
            </div>
          )}

          {/* Recursos colapsables */}
          {msg.recursos?.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <button onClick={() => setShowRecursos(!showRecursos)} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", color: "#6366F1", fontSize: 12, fontWeight: 600, padding: 0 }}>
                <ChevronIcon open={showRecursos} />
                {showRecursos ? "Ocultar" : "Ver"} recursos ({msg.recursos.length})
              </button>
              {showRecursos && (
                <ul style={{ marginTop: 8, paddingLeft: 0, listStyle: "none" }}>
                  {msg.recursos.map((r, i) => (
                    <li key={i} style={{ fontSize: 13, color: "#374151", padding: "6px 0", borderBottom: i < msg.recursos.length - 1 ? "1px solid #F3F4F6" : "none", display: "flex", alignItems: "flex-start", gap: 8 }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#6366F1", flexShrink: 0, display: "inline-block", marginTop: 5 }} />
                      {r}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {msg.confianza != null && (
          <div style={{ marginTop: 5, display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 60, height: 3, background: "#E5E7EB", borderRadius: 2 }}>
              <div style={{ width: `${Math.round(msg.confianza * 100)}%`, height: "100%", background: "linear-gradient(to right,#6366F1,#8B5CF6)", borderRadius: 2 }} />
            </div>
            <span style={{ fontSize: 10, color: "#9CA3AF" }}>IA: {Math.round(msg.confianza * 100)}%</span>
          </div>
        )}
        <p style={{ margin: "4px 0 0 0", fontSize: 11, color: "#9CA3AF" }}>{msg.hora}</p>
      </div>
    </div>
  );
}

function UserMessage({ msg, isNew }) {
  return (
    <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16, animation: isNew ? "fadeInMsg 0.3s ease" : "none" }}>
      <div style={{ maxWidth: "68%" }}>
        <div style={{ background: "linear-gradient(135deg,#DC2626,#B91C1C)", color: "white", borderRadius: "18px 4px 18px 18px", padding: "12px 16px", boxShadow: "0 2px 12px rgba(220,38,38,0.22)" }}>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.7 }}>{msg.texto}</p>
        </div>
        <p style={{ margin: "4px 0 0 0", fontSize: 11, color: "#9CA3AF", textAlign: "right" }}>{msg.hora}</p>
      </div>
    </div>
  );
}

// ── Panel de acciones rápidas ───────────────────────────────────────────────
function AccionesRapidas({ onSelect }) {
  const [abierto, setAbierto] = useState(false);
  return (
    <div style={{ padding: "8px 20px 0", flexShrink: 0 }}>
      <button
        onClick={() => setAbierto(!abierto)}
        style={{ display: "flex", alignItems: "center", gap: 6, background: "#F5F3FF", border: "1px solid #DDD6FE", borderRadius: 8, padding: "5px 12px", cursor: "pointer", fontSize: 12, color: "#7C3AED", fontWeight: 600, transition: "all 0.15s" }}
      >
        <MathIcon />
        Ejercicios rápidos
        <ChevronIcon open={abierto} />
      </button>
      {abierto && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
          {ACCIONES_RAPIDAS_EJERCICIOS.map((a, i) => (
            <button
              key={i}
              className="accion-btn"
              onClick={() => { onSelect(a.mensaje); setAbierto(false); }}
              style={{ padding: "5px 12px", borderRadius: 20, fontSize: 12, background: "white", border: "1px solid #E5E7EB", cursor: "pointer", color: "#374151", transition: "all 0.15s" }}
            >
              {a.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Componente principal ─────────────────────────────────────────────────────
export default function ChatbotEstudiante() {
  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
  const userId = usuario.id;
  const nombreUsuario = usuario.nombres || "";

  const mensajeInicial = {
    id: 0, tipo: "bot",
    hora: new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
    texto: `¡Hola${nombreUsuario ? `, ${nombreUsuario}` : ""}! 👋 Soy **Assura IA**, tu asistente académico de Ingeniería de Sistemas.\n\nPuedo ayudarte con TODO lo académico:\n• 📐 **Matemáticas:** derivadas, integrales, límites, álgebra lineal\n• ⚛️ **Física:** cinemática, dinámica, electricidad\n• 💻 **Programación:** algoritmos, POO, estructuras de datos\n• 🗄️ **Bases de Datos:** SQL, normalización, JOINs\n• 🔗 **Discretas:** grafos, combinatoria, inducción\n• 📊 **Estadística y Probabilidad**\n• 🎯 Técnicas de estudio y apoyo emocional\n\nEscribe tu pregunta o usa los botones de abajo 👇`,
    recursos: [], consejo: null, categoria: null, intencion: "saludo", confianza: null, isNew: false, ejercicio_data: null,
  };

  const [mensajes, setMensajes] = useState([mensajeInicial]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [historial, setHistorial] = useState([]);
  const [mostrarHistorial, setMostrarHistorial] = useState(false);
  const [bertActivo, setBertActivo] = useState(null);
  const endRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes, loading]);

  useEffect(() => {
    cargarHistorial();
    checkBert();
  }, []);

  const checkBert = async () => {
    try {
      const res = await axios.get(`${BACKEND}/chatbot/health`);
      setBertActivo(res.data.python_bert === "activo");
    } catch { setBertActivo(false); }
  };

  const cargarHistorial = async () => {
    if (!userId) return;
    try {
      const res = await axios.get(`${BACKEND}/chatbot/historial/${userId}`);
      if (res.data.ok) setHistorial(res.data.historial);
    } catch {}
  };

  const hora = () => new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });

  // Convierte la conversación actual a historial para enviar al backend
  const buildHistorial = () => {
    return mensajes.slice(-12).map(m => ({
      role: m.tipo === "user" ? "user" : "bot",
      content: m.texto,
      intencion: m.intencion || null,
      categoria: m.categoria || null,
    }));
  };

  const agregarMensajeBot = (data) => {
    setMensajes(prev => [...prev, {
      id: Date.now() + 1, tipo: "bot", hora: hora(),
      texto: data.respuesta || "Gracias por tu mensaje.",
      categoria: data.categoria,
      intencion: data.intencion,
      confianza: data.confianza,
      recursos: data.recursos || [],
      consejo: data.consejo_rapido || null,
      ejercicio_data: data.ejercicio_data || null,
      isNew: true,
    }]);
  };

  const enviarMensaje = useCallback(async (textoInput) => {
    const texto = (textoInput || input).trim();
    if (!texto || loading) return;

    const ts = hora();
    setMensajes(prev => [...prev, { id: Date.now(), tipo: "user", texto, hora: ts, isNew: true }]);
    setInput("");
    setLoading(true);
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    try {
      const res = await axios.post(`${BACKEND}/chatbot/enviar`, {
        id_estudiante: userId,
        mensaje: texto,
        nombre_estudiante: nombreUsuario,
        historial: buildHistorial(),
      });
      setLoading(false);
      agregarMensajeBot(res.data);
      cargarHistorial();
    } catch {
      // Fallback local completo si el backend no está disponible
      await new Promise(r => setTimeout(r, 700 + Math.random() * 500));
      const data = generarRespuestaLocal(texto, nombreUsuario);
      setLoading(false);
      agregarMensajeBot(data);
    }
  }, [input, loading, mensajes, userId, nombreUsuario]);

  const handleTextareaChange = (e) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      enviarMensaje();
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        @keyframes typingBounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-5px)} }
        @keyframes fadeInMsg {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .chat-textarea { scrollbar-width: thin; scrollbar-color: #E5E7EB transparent; }
        .chat-textarea::-webkit-scrollbar { width: 4px; }
        .chat-textarea::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 4px; }
        .messages-area { scrollbar-width: thin; scrollbar-color: #E5E7EB transparent; }
        .messages-area::-webkit-scrollbar { width: 5px; }
        .messages-area::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 4px; }
        .sugerencia-btn { transition: all 0.2s cubic-bezier(0.34,1.56,0.64,1); }
        .sugerencia-btn:hover { border-color: #DC2626 !important; color: #DC2626 !important; background: #FFF5F5 !important; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(220,38,38,0.12) !important; }
        .send-btn:not(:disabled):hover { background: linear-gradient(135deg,#B91C1C,#991B1B) !important; transform: scale(1.07); }
        .send-btn { transition: all 0.2s cubic-bezier(0.34,1.56,0.64,1); }
        .hist-item { transition: all 0.15s ease; }
        .hist-item:hover { background: #F3F4F6 !important; transform: translateX(3px); }
        .accion-btn:hover { border-color: #7C3AED !important; color: #7C3AED !important; background: #F5F3FF !important; }
      `}</style>

      <div style={{ display: "flex", flexDirection: "column", height: "100vh", fontFamily: "'Inter',sans-serif", overflow: "hidden" }}>
        <Header />
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          <Menu />

          <div style={{ flex: 1, display: "flex", overflow: "hidden", background: "#F3F4F6" }}>

            {/* Sidebar historial */}
            <div style={{ width: mostrarHistorial ? 290 : 0, overflow: "hidden", transition: "width 0.3s cubic-bezier(0.4,0,0.2,1)", background: "white", borderRight: "1px solid #E5E7EB", display: "flex", flexDirection: "column", flexShrink: 0 }}>
              <div style={{ padding: "18px 16px", borderBottom: "1px solid #F3F4F6" }}>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#1F2937" }}>Historial</h3>
                <p style={{ margin: "3px 0 0", fontSize: 12, color: "#9CA3AF" }}>{historial.length} consultas anteriores</p>
              </div>
              <div className="messages-area" style={{ flex: 1, overflowY: "auto", padding: "10px 12px" }}>
                {historial.length === 0 ? (
                  <p style={{ textAlign: "center", color: "#9CA3AF", fontSize: 13, marginTop: 24 }}>Sin consultas previas</p>
                ) : (
                  historial.map(h => {
                    const cfg = CATEGORIA_CONFIG[h.categoria] || {};
                    return (
                      <div
                        key={h.id}
                        className="hist-item"
                        style={{ padding: "10px 12px", marginBottom: 8, borderRadius: 10, background: cfg.bg || "#F9FAFB", border: "1px solid #E5E7EB", cursor: "pointer" }}
                        onClick={() => setMensajes(prev => [...prev,
                          { id: Date.now(), tipo: "user", texto: h.mensaje, hora: new Date(h.fecha).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }), isNew: false },
                          { id: Date.now() + 1, tipo: "bot", texto: h.respuesta, categoria: h.categoria, confianza: h.confianza, recursos: [], consejo: null, ejercicio_data: null, hora: new Date(h.fecha).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }), isNew: false }
                        ])}
                      >
                        <p style={{ margin: 0, fontSize: 13, color: "#374151", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{h.mensaje}</p>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 5 }}>
                          <span style={{ fontSize: 11, color: cfg.color || "#9CA3AF", fontWeight: 600 }}>{cfg.nombre || h.categoria}</span>
                          <span style={{ fontSize: 11, color: "#9CA3AF" }}>{new Date(h.fecha).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Chat principal */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>

              {/* Header del chat */}
              <div style={{ padding: "12px 20px", background: "white", borderBottom: "1px solid #E5E7EB", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", flexShrink: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <button
                    onClick={() => setMostrarHistorial(!mostrarHistorial)}
                    style={{ display: "flex", alignItems: "center", gap: 6, background: mostrarHistorial ? "#EFF6FF" : "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 12, color: mostrarHistorial ? "#3B82F6" : "#6B7280", fontWeight: 600, transition: "all 0.15s" }}
                  >
                    <HistoryIcon /> Historial
                  </button>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg,#7C3AED,#4F46E5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <BotIcon />
                  </div>
                  <div>
                    <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#1F2937" }}>Assura IA</h2>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 2 }}>
                      <div style={{ width: 7, height: 7, borderRadius: "50%", background: bertActivo === null ? "#F59E0B" : bertActivo ? "#10B981" : "#94A3B8" }} />
                      <span style={{ fontSize: 11, color: "#9CA3AF" }}>
                        {bertActivo === null ? "Conectando..." : bertActivo ? "En línea · IA conversacional activa" : "Modo local activo"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Área de mensajes */}
              <div className="messages-area" style={{ flex: 1, overflowY: "auto", padding: "20px 28px" }}>
                {mensajes.map(msg =>
                  msg.tipo === "user"
                    ? <UserMessage key={msg.id} msg={msg} isNew={msg.isNew} />
                    : <BotMessage key={msg.id} msg={msg} isNew={msg.isNew} />
                )}
                {loading && <TypingIndicator />}
                <div ref={endRef} />
              </div>

              {/* Sugerencias (solo al inicio) */}
              {mensajes.length === 1 && (
                <div style={{ padding: "10px 28px 0", display: "flex", gap: 8, flexWrap: "wrap", flexShrink: 0 }}>
                  {SUGERENCIAS.map((s, i) => (
                    <button
                      key={i}
                      className="sugerencia-btn"
                      onClick={() => enviarMensaje(s)}
                      style={{ padding: "6px 14px", borderRadius: 20, fontSize: 12, background: "white", border: "1px solid #E5E7EB", cursor: "pointer", color: "#374151", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}
                    >{s}</button>
                  ))}
                </div>
              )}

              {/* Panel de ejercicios rápidos */}
              <AccionesRapidas onSelect={(msg) => enviarMensaje(msg)} />

              {/* Input */}
              <div style={{ padding: "14px 20px", background: "white", borderTop: "1px solid #E5E7EB", boxShadow: "0 -2px 8px rgba(0,0,0,0.04)", flexShrink: 0 }}>
                <form onSubmit={e => { e.preventDefault(); enviarMensaje(); }} style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
                  <textarea
                    ref={textareaRef}
                    className="chat-textarea"
                    value={input}
                    onChange={handleTextareaChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Escribe tu pregunta, ejercicio o consulta... (Enter para enviar)"
                    rows={1}
                    style={{ flex: 1, padding: "11px 16px", borderRadius: 22, resize: "none", border: "1.5px solid #E5E7EB", fontSize: 14, fontFamily: "inherit", outline: "none", lineHeight: 1.6, transition: "border-color 0.2s", background: "#F9FAFB", minHeight: 44, maxHeight: 120, overflow: "auto" }}
                    onFocus={e => e.target.style.borderColor = "#DC2626"}
                    onBlur={e => e.target.style.borderColor = "#E5E7EB"}
                  />
                  <button
                    type="submit"
                    className="send-btn"
                    disabled={!input.trim() || loading}
                    title="Enviar mensaje"
                    style={{ width: 44, height: 44, borderRadius: "50%", border: "none", background: input.trim() && !loading ? "linear-gradient(135deg,#DC2626,#B91C1C)" : "#E5E7EB", color: input.trim() && !loading ? "white" : "#9CA3AF", cursor: input.trim() && !loading ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: input.trim() && !loading ? "0 2px 10px rgba(220,38,38,0.3)" : "none" }}
                  >
                    <SendIcon />
                  </button>
                </form>
                <p style={{ margin: "8px 0 0 0", fontSize: 10, color: "#D1D5DB", textAlign: "center", letterSpacing: "0.02em" }}>
                  Assura IA · Motor conversacional v3.0 · {bertActivo ? "Modo completo activo" : "Modo local activo"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

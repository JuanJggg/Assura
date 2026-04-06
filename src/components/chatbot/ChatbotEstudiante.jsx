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
};

const CATEGORIA_ICONS = {
  metodologia_estudio: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
    </svg>
  ),
  dificultades_academicas: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  ),
  orientacion_academica: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
      <circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
    </svg>
  ),
  estres_presion: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
      <path d="M18 3a3 3 0 0 0-3 3l-7 7a3 3 0 0 0 0 6h1a3 3 0 0 0 3-3l7-7a3 3 0 0 0 0-6h-1z"/>
    </svg>
  ),
  solicitud_asesoria: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
};

// ── Respuestas inteligentes locales (fallback cuando BERT no está disponible) ──
const RESPUESTAS_INTELIGENTES = {
  saludos: {
    patron: /^(hola|buenos días|buenas tardes|buenas noches|hey|hi|qué tal|cómo estás|saludos)/i,
    respuesta: (nombre) => `¡Hola${nombre ? ` ${nombre}` : ""}! 👋 Soy tu asistente académico de Assura, impulsado por inteligencia artificial.\n\nEstoy aquí para ayudarte con cualquier aspecto de tu vida académica:\n• 📖 Técnicas y organización de estudio\n• 🎯 Dificultades en tus materias\n• 🧭 Orientación académica y carrera\n• 💆 Manejo del estrés y presión\n• 🤝 Conectarte con un asesor personal\n\n¿En qué área te puedo ayudar hoy?`,
  },
  despedida: {
    patron: /^(adiós|hasta luego|chao|bye|gracias|thank you|muchas gracias)$/i,
    respuesta: () => `¡Fue un placer ayudarte! 😊\n\nRecuerda que estoy aquí cuando lo necesites. ¡Mucho éxito en tus estudios! 🎓\n\nSi en algún momento necesitas apoyo adicional, no dudes en volver.`,
  },
  identidad: {
    patron: /(quién eres|qué eres|eres un bot|eres ia|eres humano|cómo funciones|cómo funciona)/i,
    respuesta: () => `Soy el **Asistente Académico de Assura** 🤖, un sistema de inteligencia artificial diseñado para apoyar a estudiantes universitarios.\n\nUtilizo tecnología **BERT** (Bidirectional Encoder Representations from Transformers) de Google para analizar el significado semántico de tus mensajes y darte respuestas personalizadas.\n\n**¿Qué puedo hacer?**\n• Analizar tu consulta académica con IA\n• Darte recursos y técnicas comprobadas\n• Orientarte sobre decisiones académicas\n• Conectarte con asesores reales cuando lo necesites\n\nNo soy un humano, soy IA — pero estoy aquí para escucharte con atención 💙`,
  },
  ayuda: {
    patron: /^(ayuda|help|no sé qué preguntar|no sé por dónde empezar|qué puedo preguntarte)/i,
    respuesta: () => `Claro, aquí está todo lo que puedo ayudarte:\n\n**📖 Metodología de Estudio**\nTécnicas Pomodoro, mapas mentales, plan de estudio, memoria, apuntes.\n\n**⚠️ Dificultades Académicas**\nProblemas con materias, bajas calificaciones, no entender al profesor.\n\n**🧭 Orientación de Carrera**\nElección de carrera, plan de estudios, especializaciones, posgrados.\n\n**💆 Estrés y Bienestar**\nManejo de ansiedad, equilibrio vida-universidad, técnicas de relajación.\n\n**🤝 Asesoría Personalizada**\nConectarte con un asesor académico real para atención personalizada.\n\n¿Sobre cuál de estos temas quieres que hablemos?`,
  },
};

// ── Respuestas de seguimiento contextuales ─────────────────────────────────────
const SEGUIMIENTOS = {
  metodologia_estudio: [
    "¿Ya intentaste la técnica Pomodoro? ¿Cómo te ha ido con ella?",
    "¿Qué materia te resulta más difícil de estudiar?",
    "¿Tienes problemas para concentrarte o para memorizar?",
  ],
  dificultades_academicas: [
    "¿Es una materia específica o varias las que te generan dificultades?",
    "¿Has podido hablar con tu profesor sobre esto?",
    "¿Hace cuánto tiempo llevas con esta dificultad?",
  ],
  orientacion_academica: [
    "¿En qué semestre estás actualmente?",
    "¿Ya tienes clara alguna área de tu carrera que te guste más?",
    "¿Hay algún campo profesional específico que te interese?",
  ],
  estres_presion: [
    "¿El estrés es reciente o llevas tiempo sintiéndolo?",
    "¿Tienes personas de apoyo, como amigos o familia, con quienes hablar?",
    "¿Has podido mantener el sueño y la alimentación bien durante este período?",
  ],
  solicitud_asesoria: [
    "¿Es urgente o puedes esperar unos días para la cita?",
    "¿Prefieres asesoría en línea o presencial?",
    "¿Es sobre una materia específica o sobre orientación general?",
  ],
};

// ── Respuestas de temas complejos ─────────────────────────────────────────────
const TEMAS_COMPLEJOS = {
  pomodoro: {
    patron: /(pomodoro|pomodoro technique)/i,
    respuesta: `La **Técnica Pomodoro** es uno de los métodos de productividad más efectivos. Aquí tienes una guía completa:\n\n**¿Cómo funciona?**\n1. ⏱️ Elige una tarea específica\n2. 🔴 Trabaja enfocado durante **25 minutos** exactos\n3. ✅ Toma un descanso de **5 minutos**\n4. 🔄 Repite 4 veces\n5. 💤 Descansa **15-30 minutos** (descanso largo)\n\n**Consejos clave:**\n• Silencia tu celular durante cada Pomodoro\n• Si surge algo urgente, anótalo y sigue\n• Cada Pomodoro es sagrado — no lo interrumpas\n• Usa apps como Forest, Tomato Timer o Be Focused\n\n**¿Por qué funciona?** El cerebro mantiene mejor el enfoque en intervalos cortos. Los descansos regulares previenen el agotamiento mental y consolidan la memoria.`,
  },
  mapas_mentales: {
    patron: /(mapas? mentales?|mind map)/i,
    respuesta: `Los **mapas mentales** son una herramienta visual poderosa para organizar información. Aquí cómo hacerlos bien:\n\n**Pasos para crear uno efectivo:**\n1. 🎯 Escribe el tema central en el medio\n2. 🌿 Crea ramas principales para cada subtema\n3. 🍃 Añade ramas secundarias con detalles\n4. 🎨 Usa colores diferentes para cada rama\n5. 📸 Añade imágenes o íconos cuando sea posible\n\n**Herramientas recomendadas:**\n• **Físico**: Papel, lápices de colores\n• **Digital**: MindMeister, XMind, Coggle, Miro\n• **Gratis**: FreeMind, draw.io\n\n**¿Cuándo usarlos?**\nSon ideales para repasar temas, planificar trabajos, preparar exposiciones y comprender sistemas complejos.`,
  },
  ansiedad: {
    patron: /(ansiedad|ataque de pánico|pánico|angustia|no puedo respirar)/i,
    respuesta: `Entiendo lo que sientes. La ansiedad académica es muy real y muy común. Primero, respira:\n\n**Técnica de respiración 4-7-8 (para ahora mismo):**\n1. 🫁 Inhala por la nariz contando **4 segundos**\n2. ⏸️ Mantén el aire **7 segundos**\n3. 💨 Exhala lento por la boca **8 segundos**\n4. Repite 4 veces\n\n**Para el largo plazo:**\n• 🚶 Ejercicio físico moderado (30 min/día reduce cortisol)\n• 😴 Sueño regular: 7-8 horas\n• 📵 Límites con redes sociales durante épocas de exámenes\n• 🗣️ Habla con alguien de confianza\n\n**🔴 Importante:** Si los ataques de ansiedad son frecuentes o intensos, te recomiendo buscar apoyo en el servicio de bienestar estudiantil o psicología universitaria. No tienes que atravesarlo solo.`,
  },
  reprobar: {
    patron: /(reprobé|reprobé el examen|saqué mala nota|perdí la materia|jalé)/i,
    respuesta: `Sé que no es fácil. Reprobar duele, pero no define tu futuro académico. Vamos a ver qué puedes hacer:\n\n**Pasos inmediatos:**\n1. 📞 Habla con tu profesor — pregunta qué salió mal y si hay opciones de recuperación\n2. 📋 Revisa el reglamento: ¿hay habilitaciones, supletorios o segundas oportunidades?\n3. 🔍 Identifica la causa: ¿falta de tiempo? ¿no entendiste el tema? ¿ansiedad?\n\n**Plan de acción para la siguiente vez:**\n• Empieza a estudiar con **3 semanas** de anticipación\n• Haz ejercicios prácticos, no solo leer\n• Forma un grupo de estudio\n• Habla con el profesor en horas de consulta antes del examen\n\n**Recuerda:** Muchos estudiantes exitosos han reprobado materias. Lo que importa es cómo respondes a eso. ¿Quieres que te ayude a crear un plan de recuperación?`,
  },
};

// ── Íconos SVG ──────────────────────────────────────────────────────────────
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

const SUGERENCIAS = [
  "No sé cómo organizar mi tiempo",
  "Estoy muy estresado por los exámenes",
  "Reprobé y no sé qué hacer",
  "¿Qué carrera debo elegir?",
  "¿Cómo funciona la técnica Pomodoro?",
  "Quiero hablar con un asesor",
];

// ── Función: procesar mensaje localmente (fallback inteligente) ─────────────
function procesarMensajeLocal(texto, contexto = {}) {
  const input = texto.toLowerCase().trim();

  // 1. Saludos
  if (RESPUESTAS_INTELIGENTES.saludos.patron.test(input)) {
    return {
      respuesta: RESPUESTAS_INTELIGENTES.saludos.respuesta(contexto.nombre),
      categoria: null, confianza: null, recursos: [], consejo_rapido: null,
    };
  }

  // 2. Despedida
  if (RESPUESTAS_INTELIGENTES.despedida.patron.test(input)) {
    return {
      respuesta: RESPUESTAS_INTELIGENTES.despedida.respuesta(),
      categoria: null, confianza: null, recursos: [], consejo_rapido: null,
    };
  }

  // 3. Preguntas de identidad
  if (RESPUESTAS_INTELIGENTES.identidad.patron.test(input)) {
    return {
      respuesta: RESPUESTAS_INTELIGENTES.identidad.respuesta(),
      categoria: null, confianza: null, recursos: [], consejo_rapido: null,
    };
  }

  // 4. Ayuda general
  if (RESPUESTAS_INTELIGENTES.ayuda.patron.test(input)) {
    return {
      respuesta: RESPUESTAS_INTELIGENTES.ayuda.respuesta(),
      categoria: null, confianza: null, recursos: [], consejo_rapido: null,
    };
  }

  // 5. Temas complejos específicos
  for (const [, tema] of Object.entries(TEMAS_COMPLEJOS)) {
    if (tema.patron.test(input)) {
      return {
        respuesta: tema.respuesta,
        categoria: null, confianza: null, recursos: [], consejo_rapido: null,
      };
    }
  }

  // 6. Seguimientos contextuales
  if (contexto.ultimaCategoria && input.length < 50) {
    const preguntas = SEGUIMIENTOS[contexto.ultimaCategoria] || [];
    if (preguntas.length > 0) {
      const pregunta = preguntas[Math.floor(Math.random() * preguntas.length)];
      return {
        respuesta: `Entiendo. Para poder ayudarte mejor: ${pregunta}`,
        categoria: contexto.ultimaCategoria, confianza: null, recursos: [], consejo_rapido: null,
      };
    }
  }

  // 7. Clasificación por palabras clave locales
  const clasificaciones = [
    { cat: "metodologia_estudio", keywords: ["estudiar", "estudio", "aprender", "memorizar", "concentración", "pomodoro", "apuntes", "método", "técnica", "horario", "tiempo", "organizar", "plan", "repasar", "leer"] },
    { cat: "dificultades_academicas", keywords: ["reprobé", "reprobar", "jalé", "perdí", "mala nota", "no entiendo", "difícil", "física", "química", "matemáticas", "cálculo", "estadística", "ejercicios", "examen", "evaluación", "rendimiento", "bajo rendimiento"] },
    { cat: "orientacion_academica", keywords: ["carrera", "elegir", "cambiar de carrera", "especialización", "graduarme", "requisitos", "plan de estudios", "semestre", "materias", "inscribir", "becas", "posgrado", "prácticas", "pasantías"] },
    { cat: "estres_presion", keywords: ["estrés", "estresado", "ansioso", "ansiedad", "presión", "agotado", "cansado", "angustia", "nervios", "no puedo más", "llorar", "pánico", "deprimido", "solo", "equilibrio"] },
    { cat: "solicitud_asesoria", keywords: ["asesor", "tutor", "tutoría", "consejero", "cita", "reunión", "hablar con alguien", "asesoría", "ayuda personalizada", "orientador"] },
  ];

  let mejorCategoria = null;
  let mejorScore = 0;

  for (const { cat, keywords } of clasificaciones) {
    let score = 0;
    for (const kw of keywords) {
      if (input.includes(kw)) score++;
    }
    if (score > mejorScore) {
      mejorScore = score;
      mejorCategoria = cat;
    }
  }

  if (mejorCategoria && mejorScore > 0) {
    const seguimientos = SEGUIMIENTOS[mejorCategoria];
    const preguntaSeguimiento = seguimientos[Math.floor(Math.random() * seguimientos.length)];

    const respuestas = {
      metodologia_estudio: `Identifico que tienes una consulta sobre **metodología de estudio**. Aquí hay algunas estrategias que pueden ayudarte:\n\n📖 **Técnicas recomendadas:**\n• **Pomodoro**: 25 min de estudio + 5 min descanso\n• **Feynman**: Explica el tema como si se lo enseñaras a alguien más\n• **Repaso espaciado**: Revisa el material a las 24h, 3 días y 1 semana\n• **Mapas mentales**: Para conceptos ampios y relaciones entre temas\n• **Cornell**: Divide tus apuntes en categorías: notas, preguntas y resumen\n\n${preguntaSeguimiento}`,
      dificultades_academicas: `Noto que estás pasando por una **dificultad académica**. No estás solo, esto es más común de lo que crees.\n\n🎯 **Primeros pasos:**\n• Identifica exactamente qué parte no entiendes\n• Busca recursos en YouTube, Khan Academy o Coursera\n• Habla con el profesor en horas de consulta\n• Forma un grupo de estudio\n• Considera tutorías especializadas\n\n¿Sabías que la mayoría de dificultades vienen de vacíos en conocimiento previo? Volvamos a los fundamentos.\n\n${preguntaSeguimiento}`,
      orientacion_academica: `Excelente que busques **orientación académica** — es una decisión muy importante.\n\n🧭 **Para orientarte mejor:**\n• Consulta el pensum oficial de tu carrera\n• Habla con egresados de tu programa\n• Explora salidas laborales en LinkedIn\n• Agenda una cita con el departamento académico\n• Revisa los requisitos de graduación con tu coordinador\n\n${preguntaSeguimiento}`,
      estres_presion: `Lamento que estés sintiéndote así. El **estrés académico** es muy real y merece atención.\n\n💆 **Para aliviar la presión ahora mismo:**\n• Respira profundo: 4 segundos inhalando, 4 manteniendo, 6 exhalando\n• Haz una lista de todo lo que te preocupa y prioriza\n• Recuerda: no todo tiene la misma urgencia\n• Habla con alguien de confianza\n\n💙 **Tu bienestar es más importante que cualquier calificación.**\n\n${preguntaSeguimiento}`,
      solicitud_asesoria: `¡Con gusto te conectamos con un asesor! La **asesoría personalizada** puede marcarte la diferencia.\n\n🤝 **Puedes:**\n• Ir a la sección "Asesores Disponibles" en el dashboard\n• Iniciar un chat directo con el asesor de tu elección\n• Ver horarios de atención en tiempo real\n\n${preguntaSeguimiento}`,
    };

    return {
      respuesta: respuestas[mejorCategoria],
      categoria: mejorCategoria,
      confianza: 0.6 + (mejorScore * 0.05),
      recursos: [],
      consejo_rapido: null,
    };
  }

  // 8. Respuesta genérica inteligente
  return {
    respuesta: `Gracias por tu mensaje. Aunque no pude clasificar tu consulta con precisión en este momento, aquí está lo que puedo decirte:\n\n🤔 **Si tu consulta es académica**, puedo ayudarte con:\n• Técnicas de estudio y organización\n• Superar dificultades en materias\n• Orientación sobre tu carrera\n• Manejo del estrés y bienestar\n• Conectarte con un asesor real\n\nPuedes intentar **ser más específico** sobre lo que necesitas, o hacer clic en una de las sugerencias rápidas. También puedes escribir "ayuda" para ver todo lo que puedo hacer.\n\n¿Hay algo en particular que quieras que te explique?`,
    categoria: null, confianza: null, recursos: [], consejo_rapido: null,
  };
}

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

function CategoriaBadge({ categoria }) {
  const cfg = CATEGORIA_CONFIG[categoria] || { nombre: categoria, color: "#6B7280", bg: "#F9FAFB" };
  const icon = CATEGORIA_ICONS[categoria] || null;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}30`, borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 600 }}>
      <span style={{ color: cfg.color }}>{icon}</span>
      {cfg.nombre}
    </span>
  );
}

function FormattedText({ text }) {
  // Renderiza **bold** y bullet points
  const lines = text.split("\n");
  return (
    <div style={{ margin: 0, color: "#1F2937", fontSize: 14, lineHeight: 1.75 }}>
      {lines.map((line, i) => {
        if (!line.trim()) return <div key={i} style={{ height: 6 }} />;
        // Procesar **bold**
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

function BotMessage({ msg, isNew }) {
  const [showRecursos, setShowRecursos] = useState(false);
  return (
    <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 16, alignItems: "flex-end", gap: 8, animation: isNew ? "fadeInMsg 0.3s ease" : "none" }}>
      <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,#7C3AED,#4F46E5)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <BotIcon />
      </div>
      <div style={{ maxWidth: "75%" }}>
        {msg.categoria && (
          <div style={{ marginBottom: 6 }}>
            <CategoriaBadge categoria={msg.categoria} />
          </div>
        )}
        <div style={{ background: "white", border: "1px solid #E5E7EB", borderRadius: "4px 18px 18px 18px", padding: "14px 18px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
          <FormattedText text={msg.texto} />

          {msg.consejo && (
            <div style={{ marginTop: 12, padding: "10px 14px", background: "#F0FDF4", borderLeft: "3px solid #10B981", borderRadius: "0 8px 8px 0", display: "flex", gap: 8, alignItems: "flex-start" }}>
              <LightbulbIcon />
              <p style={{ margin: 0, fontSize: 13, color: "#065F46", lineHeight: 1.6 }}>{msg.consejo}</p>
            </div>
          )}

          {msg.recursos?.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <button onClick={() => setShowRecursos(!showRecursos)} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", color: "#6366F1", fontSize: 12, fontWeight: 600, padding: 0 }}>
                <ChevronIcon open={showRecursos} />
                Ver recursos recomendados ({msg.recursos.length})
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
            <span style={{ fontSize: 10, color: "#9CA3AF" }}>Confianza: {Math.round(msg.confianza * 100)}%</span>
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

// ── Componente principal ─────────────────────────────────────────────────────
export default function ChatbotEstudiante() {
  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
  const userId = usuario.id;
  const nombreUsuario = usuario.nombres || "";

  const mensajeInicial = {
    id: 0, tipo: "bot",
    hora: new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
    texto: `¡Hola${nombreUsuario ? `, ${nombreUsuario}` : ""}! 👋 Soy tu **Asistente Académico de Assura**, impulsado por inteligencia artificial.\n\nEstoy aquí para orientarte con cualquier aspecto de tu vida académica. Puedo ayudarte con:\n• 📖 Técnicas de estudio y organización del tiempo\n• 🎯 Superar dificultades en tus materias\n• 🧭 Orientación académica y de carrera\n• 💆 Manejo del estrés y bienestar\n• 🤝 Conectarte con un asesor personal\n\n¿En qué te puedo ayudar hoy?`,
    recursos: [], consejo: null, categoria: null, confianza: null, isNew: false,
  };

  const [mensajes, setMensajes] = useState([mensajeInicial]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [historial, setHistorial] = useState([]);
  const [mostrarHistorial, setMostrarHistorial] = useState(false);
  const [bertActivo, setBertActivo] = useState(null);
  const [contexto, setContexto] = useState({ ultimaCategoria: null, nombre: nombreUsuario });
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

  const agregarMensajeBot = (data, isNew = true) => {
    setMensajes(prev => [...prev, {
      id: Date.now() + 1, tipo: "bot", hora: hora(),
      texto: data.respuesta || "Gracias por tu mensaje.",
      categoria: data.categoria,
      confianza: data.confianza,
      recursos: data.recursos || [],
      consejo: data.consejo_rapido || null,
      isNew,
    }]);
    if (data.categoria) {
      setContexto(prev => ({ ...prev, ultimaCategoria: data.categoria }));
    }
  };

  const enviarMensaje = useCallback(async (textoInput) => {
    const texto = (textoInput || input).trim();
    if (!texto || loading) return;

    const ts = hora();
    setMensajes(prev => [...prev, { id: Date.now(), tipo: "user", texto, hora: ts, isNew: true }]);
    setInput("");
    setLoading(true);
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    // Verificar si es una pregunta local primero (saludos, despedidas, etc.)
    const esLocal = 
      RESPUESTAS_INTELIGENTES.saludos.patron.test(texto) ||
      RESPUESTAS_INTELIGENTES.despedida.patron.test(texto) ||
      RESPUESTAS_INTELIGENTES.identidad.patron.test(texto) ||
      RESPUESTAS_INTELIGENTES.ayuda.patron.test(texto) ||
      Object.values(TEMAS_COMPLEJOS).some(t => t.patron.test(texto));

    if (esLocal) {
      // Simular delay para UX más natural
      await new Promise(r => setTimeout(r, 700 + Math.random() * 500));
      const data = procesarMensajeLocal(texto, contexto);
      setLoading(false);
      agregarMensajeBot(data);
      return;
    }

    // Intentar con el backend
    try {
      const res = await axios.post(`${BACKEND}/chatbot/enviar`, {
        id_estudiante: userId,
        mensaje: texto,
      });
      const data = res.data;
      setLoading(false);
      agregarMensajeBot(data);
      cargarHistorial();
    } catch {
      // Backend no disponible — usar clasificación local inteligente
      await new Promise(r => setTimeout(r, 800 + Math.random() * 600));
      const data = procesarMensajeLocal(texto, contexto);
      setLoading(false);
      agregarMensajeBot(data);
    }
  }, [input, loading, contexto, userId]);

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
                          { id: Date.now() + 1, tipo: "bot", texto: h.respuesta, categoria: h.categoria, confianza: h.confianza, recursos: [], consejo: null, hora: new Date(h.fecha).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }), isNew: false }
                        ])}
                      >
                        <p style={{ margin: 0, fontSize: 13, color: "#374151", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{h.mensaje}</p>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 5 }}>
                          <span style={{ fontSize: 11, color: cfg.color || "#9CA3AF", fontWeight: 600 }}>
                            {CATEGORIA_ICONS[h.categoria] && <span style={{ verticalAlign: "middle", marginRight: 3 }}>{CATEGORIA_ICONS[h.categoria]}</span>}
                            {cfg.nombre || h.categoria}
                          </span>
                          <span style={{ fontSize: 11, color: "#9CA3AF" }}>
                            {new Date(h.fecha).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
                          </span>
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
                    <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#1F2937" }}>Asistente Académico</h2>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 2 }}>
                      <div style={{ width: 7, height: 7, borderRadius: "50%", background: bertActivo === null ? "#F59E0B" : bertActivo ? "#10B981" : "#94A3B8" }} />
                      <span style={{ fontSize: 11, color: "#9CA3AF" }}>
                        {bertActivo === null ? "Conectando..." : bertActivo ? "En línea · BERT activo" : "Modo IA local activo"}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 6 }}>
                  {Object.entries(CATEGORIA_CONFIG).map(([key, c]) => (
                    <div key={key} title={c.nombre} style={{ width: 28, height: 28, borderRadius: "50%", background: c.bg, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${c.color}30`, color: c.color }}>
                      {CATEGORIA_ICONS[key]}
                    </div>
                  ))}
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

              {/* Sugerencias */}
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

              {/* Input */}
              <div style={{ padding: "14px 20px", background: "white", borderTop: "1px solid #E5E7EB", boxShadow: "0 -2px 8px rgba(0,0,0,0.04)", flexShrink: 0 }}>
                <form onSubmit={e => { e.preventDefault(); enviarMensaje(); }} style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
                  <textarea
                    ref={textareaRef}
                    className="chat-textarea"
                    value={input}
                    onChange={handleTextareaChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Escribe tu consulta... (Enter para enviar, Shift+Enter para nueva línea)"
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
                  Assura IA · BERT + Clasificación inteligente local · {bertActivo ? "Modo completo" : "Modo local activo"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

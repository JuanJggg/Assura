import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Send, Lightbulb, TrendingUp, Brain } from "lucide-react";

function ChatbotIA() {
  const [mensajes, setMensajes] = useState([]);
  const [inputMensaje, setInputMensaje] = useState("");
  const [cargando, setCargando] = useState(false);
  const [recomendaciones, setRecomendaciones] = useState([]);
  const [desempeño, setDesempeño] = useState([]);
  const [patrones, setPatrones] = useState([]);
  const [sesionId] = useState(`sesion-${Date.now()}`);
  const [pestaña, setPestaña] = useState("chat");
  const messagesEndRef = useRef(null);

  const usuario = JSON.parse(localStorage.getItem("usuario")) || {};
  const idEstudiante = usuario.id;

  useEffect(() => {
    if (idEstudiante) {
      cargarDatos();
    }
  }, [idEstudiante]);

  const cargarDatos = async () => {
    try {
      const [resRecomendaciones, resDesempeño, resPatrones] = await Promise.all([
        axios.get(`http://localhost:3001/chatbot-ia/recomendaciones/${idEstudiante}`),
        axios.get(`http://localhost:3001/chatbot-ia/resumen-desempeño/${idEstudiante}`),
        axios.get(`http://localhost:3001/chatbot-ia/analizar-patrones/${idEstudiante}`)
      ]);

      setRecomendaciones(resRecomendaciones.data.recomendaciones || []);
      setDesempeño(resDesempeño.data.desempeño || []);
      setPatrones(resPatrones.data.patrones || []);

      if (mensajes.length === 0) {
        setMensajes([
          {
            id: 0,
            tipo: "bot",
            contenido: `¡Hola ${usuario.nombre}! Soy tu asistente académico inteligente. Estoy aquí para ayudarte a mejorar tu desempeño académico. ¿En qué tema necesitas ayuda hoy?`,
            timestamp: new Date()
          }
        ]);
      }
    } catch (error) {
      console.error("Error cargando datos:", error);
    }
  };

  const enviarMensaje = async (e) => {
    e.preventDefault();
    if (!inputMensaje.trim() || cargando) return;

    const nuevoMensajeUsuario = {
      id: mensajes.length,
      tipo: "usuario",
      contenido: inputMensaje,
      timestamp: new Date()
    };

    setMensajes(prev => [...prev, nuevoMensajeUsuario]);
    setInputMensaje("");
    setCargando(true);

    try {
      const respuesta = await axios.post(
        "http://localhost:3001/chatbot-ia/procesar-mensaje",
        {
          idEstudiante,
          mensaje: inputMensaje,
          sesionId
        }
      );

      const nuevoMensajeBot = {
        id: mensajes.length + 1,
        tipo: "bot",
        contenido: respuesta.data.respuesta,
        materia: respuesta.data.materia,
        sentimiento: respuesta.data.sentimiento,
        calidad: respuesta.data.calidad,
        recomendaciones: respuesta.data.recomendaciones,
        timestamp: new Date()
      };

      setMensajes(prev => [...prev, nuevoMensajeBot]);

      if (respuesta.data.recomendaciones.length > 0) {
        cargarDatos();
      }
    } catch (error) {
      console.error("Error al enviar mensaje:", error);
      const errorMsg = {
        id: mensajes.length + 1,
        tipo: "bot",
        contenido: "Lo siento, ocurrió un error. Por favor intenta de nuevo.",
        timestamp: new Date()
      };
      setMensajes(prev => [...prev, errorMsg]);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes]);

  const obtenerColorMateria = (materia) => {
    const colores = {
      "Cálculo": "bg-blue-100 text-blue-800",
      "Álgebra": "bg-purple-100 text-purple-800",
      "Física": "bg-green-100 text-green-800",
      "Química": "bg-orange-100 text-orange-800",
      "Programación": "bg-pink-100 text-pink-800",
      "Estadística": "bg-indigo-100 text-indigo-800",
      "Geometría": "bg-cyan-100 text-cyan-800"
    };
    return colores[materia] || "bg-gray-100 text-gray-800";
  };

  const obtenerIconoUrgencia = (urgencia) => {
    if (urgencia === "alta") return "🔴";
    if (urgencia === "media") return "🟡";
    return "🟢";
  };

  return (
    <div className="h-full bg-gradient-to-br from-blue-50 to-indigo-50 flex">
      {/* Panel Lateral - Recomendaciones y Análisis */}
      <div className="w-96 border-r border-gray-200 bg-white overflow-y-auto shadow-sm">
        <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
          <div className="p-4 flex gap-2">
            <button
              onClick={() => setPestaña("recomendaciones")}
              className={`flex-1 py-2 px-3 rounded-lg font-medium text-sm transition-all ${
                pestaña === "recomendaciones"
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Lightbulb className="inline mr-1" size={16} />
              Recomendaciones
            </button>
            <button
              onClick={() => setPestaña("analisis")}
              className={`flex-1 py-2 px-3 rounded-lg font-medium text-sm transition-all ${
                pestaña === "analisis"
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <TrendingUp className="inline mr-1" size={16} />
              Análisis
            </button>
          </div>
        </div>

        <div className="p-4">
          {pestaña === "recomendaciones" ? (
            <div className="space-y-3">
              {recomendaciones.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No hay recomendaciones aún. Continúa interactuando para recibir sugerencias personalizadas.
                </p>
              ) : (
                recomendaciones.map((rec) => (
                  <div
                    key={rec.id}
                    className="border-l-4 border-blue-500 bg-blue-50 p-3 rounded-r-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-gray-900 text-sm pr-2">
                        {rec.titulo}
                      </h4>
                      <span className="text-lg flex-shrink-0">
                        {obtenerIconoUrgencia(rec.nivel_urgencia)}
                      </span>
                    </div>
                    <p className="text-gray-700 text-sm mb-2">
                      {rec.descripcion}
                    </p>
                    {rec.materia_objetivo && (
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${obtenerColorMateria(rec.materia_objetivo)}`}>
                        {rec.materia_objetivo}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 text-white">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Brain size={18} />
                  Tu Desempeño Académico
                </h3>
                {desempeño.length === 0 ? (
                  <p className="text-blue-100 text-sm">
                    Comienza a hacer preguntas para ver tu análisis de desempeño.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {desempeño.map((mat) => (
                      <div key={mat.id} className="bg-blue-400 bg-opacity-40 p-3 rounded">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium text-sm">{mat.materia}</span>
                          <span className="text-xs bg-blue-600 px-2 py-1 rounded">
                            {(mat.promedio_calidad * 100).toFixed(0)}%
                          </span>
                        </div>
                        <div className="w-full bg-blue-300 bg-opacity-40 rounded-full h-2">
                          <div
                            className="bg-blue-200 h-2 rounded-full transition-all"
                            style={{ width: `${(mat.promedio_calidad * 100).toFixed(0)}%` }}
                          />
                        </div>
                        <p className="text-xs text-blue-100 mt-1">
                          {mat.preguntas_respondidas} preguntas
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {patrones.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 text-sm">
                    Patrones Detectados
                  </h4>
                  <div className="space-y-2">
                    {patrones.map((patron, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <span className="w-2 h-2 bg-blue-500 rounded-full" />
                        <span className="text-gray-700">
                          {patron.materia_relacionada}: {patron.frecuencia} consultas
                          {patron.tasa_dificultad > 0.5 && (
                            <span className="ml-2 text-orange-600 font-medium">
                              (High difficulty)
                            </span>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Chat Principal */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Brain className="text-blue-600" size={28} />
            Asistente Académico IA
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            Tu compañero inteligente para mejorar tu desempeño académico
          </p>
        </div>

        {/* Mensajes */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {mensajes.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.tipo === "usuario" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-md rounded-lg p-4 ${
                  msg.tipo === "usuario"
                    ? "bg-blue-600 text-white rounded-br-none"
                    : "bg-white text-gray-900 border border-gray-200 rounded-bl-none shadow-sm"
                }`}
              >
                <p className="text-sm mb-2">{msg.contenido}</p>
                {msg.materia && (
                  <div className="flex items-center gap-2 mt-2 text-xs">
                    <span className={`px-2 py-1 rounded ${obtenerColorMateria(msg.materia)}`}>
                      {msg.materia}
                    </span>
                    {msg.sentimiento && (
                      <span className="text-gray-500">
                        {msg.sentimiento === "confundido" && "😕"}
                        {msg.sentimiento === "interesado" && "😊"}
                        {msg.sentimiento === "frustrado" && "😞"}
                        {msg.sentimiento === "neutral" && "😐"}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
          {cargando && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 rounded-lg rounded-bl-none p-4">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="bg-white border-t border-gray-200 p-4 shadow-lg">
          <form onSubmit={enviarMensaje} className="flex gap-3">
            <input
              type="text"
              value={inputMensaje}
              onChange={(e) => setInputMensaje(e.target.value)}
              placeholder="Haz una pregunta o cuéntame sobre tus dudas académicas..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={cargando}
            />
            <button
              type="submit"
              disabled={!inputMensaje.trim() || cargando}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-full p-3 transition-all duration-200 shadow-md hover:shadow-lg disabled:cursor-not-allowed"
            >
              <Send size={20} />
            </button>
          </form>
          <p className="text-xs text-gray-500 mt-2 text-center">
            El chatbot analiza tus patrones de estudio para ofrecerte recomendaciones personalizadas
          </p>
        </div>
      </div>
    </div>
  );
}

export default ChatbotIA;

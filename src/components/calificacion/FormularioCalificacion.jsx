import React, { useState } from "react";
import axios from "axios";
import { X, Star, Send } from "lucide-react";

function FormularioCalificacion({
  idEstudiante,
  idAsesor,
  nombreAsesor,
  idConversacion,
  onClose,
  onCalificacionEnviada
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [calificaciones, setCalificaciones] = useState({
    puntualidad: 5,
    claridad_explicacion: 5,
    dominio_tema: 5,
    amabilidad: 5,
    resolucion_dudas: 5
  });

  const [comentario, setComentario] = useState("");

  const criterios = [
    {
      key: "puntualidad",
      titulo: "Puntualidad",
      descripcion: "¿El asesor fue puntual y respetó los horarios?"
    },
    {
      key: "claridad_explicacion",
      titulo: "Claridad en las Explicaciones",
      descripcion: "¿Qué tan claro y comprensible fue el asesor al explicar?"
    },
    {
      key: "dominio_tema",
      titulo: "Dominio del Tema",
      descripcion: "¿El asesor demuestra conocimiento profundo del tema?"
    },
    {
      key: "amabilidad",
      titulo: "Amabilidad y Trato",
      descripcion: "¿El asesor fue amable y respetuoso durante la sesión?"
    },
    {
      key: "resolucion_dudas",
      titulo: "Resolución de Dudas",
      descripcion: "¿El asesor resolvió efectivamente tus preguntas?"
    }
  ];

  const handleCalificacionChange = (criterio, valor) => {
    setCalificaciones(prev => ({
      ...prev,
      [criterio]: valor
    }));
  };

  const calcularPromedioGeneral = () => {
    const suma = Object.values(calificaciones).reduce((acc, val) => acc + val, 0);
    return (suma / Object.keys(calificaciones).length).toFixed(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post("http://localhost:3001/calificacion/crear", {
        id_estudiante: idEstudiante,
        id_asesor: idAsesor,
        id_conversacion: idConversacion,
        ...calificaciones,
        comentario: comentario.trim() || null
      });

      if (response.data.ok) {
        setSuccess(true);
        setTimeout(() => {
          if (onCalificacionEnviada) {
            onCalificacionEnviada(response.data.calificacion);
          }
          onClose();
        }, 2000);
      }
    } catch (err) {
      console.error("Error al enviar calificación:", err);
      setError(
        err.response?.data?.mensaje ||
        "No se pudo enviar la calificación. Intenta de nuevo."
      );
    } finally {
      setLoading(false);
    }
  };

  const getEstrellasColor = (valor) => {
    if (valor >= 5) return "text-green-500";
    if (valor >= 4) return "text-blue-500";
    if (valor >= 3) return "text-yellow-500";
    if (valor >= 2) return "text-orange-500";
    return "text-red-500";
  };

  const getTextoCalificacion = (valor) => {
    if (valor === 5) return "Excelente";
    if (valor === 4) return "Muy Bueno";
    if (valor === 3) return "Bueno";
    if (valor === 2) return "Regular";
    return "Necesita Mejorar";
  };

  if (success) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Star className="text-green-600" size={32} fill="currentColor" />
          </div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-2">
            ¡Gracias por tu Calificación!
          </h3>
          <p className="text-gray-600">
            Tu opinión nos ayuda a mejorar la calidad del servicio.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-red-600 text-white">
          <div>
            <h2 className="text-2xl font-semibold">Calificar Asesor</h2>
            <p className="text-red-100 text-sm mt-1">{nombreAsesor}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-red-700 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          <p className="text-gray-600 mb-6">
            Por favor, califica tu experiencia con este asesor en los siguientes aspectos.
            Desliza las barras de 1 (muy mal) a 5 (excelente).
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          <div className="space-y-6">
            {criterios.map((criterio) => (
              <div key={criterio.key} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {criterio.titulo}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {criterio.descripcion}
                    </p>
                  </div>
                  <div className="ml-4 text-right">
                    <div className={`text-3xl font-bold ${getEstrellasColor(calificaciones[criterio.key])}`}>
                      {calificaciones[criterio.key]}
                    </div>
                    <div className={`text-xs font-medium ${getEstrellasColor(calificaciones[criterio.key])}`}>
                      {getTextoCalificacion(calificaciones[criterio.key])}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-500 w-8">1</span>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="1"
                    value={calificaciones[criterio.key]}
                    onChange={(e) => handleCalificacionChange(criterio.key, parseInt(e.target.value))}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600"
                  />
                  <span className="text-sm text-gray-500 w-8 text-right">5</span>
                </div>

                <div className="flex justify-between mt-2">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => handleCalificacionChange(criterio.key, num)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                        calificaciones[criterio.key] === num
                          ? "bg-red-600 text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Calificación General</p>
                <p className="text-xs text-gray-500">Promedio de todos los criterios</p>
              </div>
              <div className="text-4xl font-bold text-blue-600">
                {calcularPromedioGeneral()}
                <span className="text-lg text-gray-500">/5</span>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comentarios Adicionales (Opcional)
            </label>
            <textarea
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              rows={4}
              placeholder="Comparte más detalles sobre tu experiencia con este asesor..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">
              {comentario.length}/500 caracteres
            </p>
          </div>

          <div className="mt-8 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></div>
                  <span>Enviando...</span>
                </>
              ) : (
                <>
                  <Send size={20} />
                  <span>Enviar Calificación</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default FormularioCalificacion;

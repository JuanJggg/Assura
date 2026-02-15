import React, { useState, useEffect } from "react";
import axios from "axios";
import { Star, Award, TrendingUp, User, BookOpen } from "lucide-react";

function MejoresAsesores() {
  const [asesores, setAsesores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarMejoresAsesores();
  }, []);

  const cargarMejoresAsesores = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:3001/calificacion/mejores-asesores");

      if (response.data.ok) {
        setAsesores(response.data.asesores);
      }
    } catch (err) {
      console.error("Error al cargar mejores asesores:", err);
      setError("No se pudieron cargar los asesores");
    } finally {
      setLoading(false);
    }
  };

  const getCategoriaColor = (categoria) => {
    const colores = {
      "Excelente": "bg-green-100 text-green-800 border-green-200",
      "Muy Bueno": "bg-blue-100 text-blue-800 border-blue-200",
      "Bueno": "bg-yellow-100 text-yellow-800 border-yellow-200",
      "Regular": "bg-orange-100 text-orange-800 border-orange-200",
      "Necesita Mejorar": "bg-red-100 text-red-800 border-red-200",
      "Sin Calificaciones": "bg-gray-100 text-gray-800 border-gray-200"
    };
    return colores[categoria] || colores["Sin Calificaciones"];
  };

  const getIconoCategoria = (categoria) => {
    if (categoria === "Excelente") return <Award className="w-5 h-5" />;
    if (categoria === "Muy Bueno") return <TrendingUp className="w-5 h-5" />;
    return <Star className="w-5 h-5" />;
  };

  const renderEstrellas = (promedio) => {
    const estrellas = [];
    const promedioNum = parseFloat(promedio) || 0;

    for (let i = 1; i <= 5; i++) {
      if (i <= promedioNum) {
        estrellas.push(
          <Star key={i} size={16} className="text-yellow-400" fill="currentColor" />
        );
      } else if (i - 0.5 <= promedioNum) {
        estrellas.push(
          <div key={i} className="relative">
            <Star size={16} className="text-gray-300" />
            <Star
              size={16}
              className="text-yellow-400 absolute top-0 left-0"
              fill="currentColor"
              style={{ clipPath: "inset(0 50% 0 0)" }}
            />
          </div>
        );
      } else {
        estrellas.push(
          <Star key={i} size={16} className="text-gray-300" />
        );
      }
    }

    return estrellas;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-red-600 border-r-transparent mb-4"></div>
          <p className="text-gray-600">Cargando mejores asesores...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-2">{error}</div>
        <button
          onClick={cargarMejoresAsesores}
          className="text-red-600 hover:text-red-700 underline"
        >
          Intentar de nuevo
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
          <Award className="text-red-600" size={32} />
          <span>Mejores Asesores</span>
        </h2>
        <p className="text-gray-600 mt-1">
          Asesores destacados según las calificaciones de los estudiantes
        </p>
      </div>

      {asesores.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Star className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-600">
            Aún no hay asesores calificados
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {asesores.map((asesor, index) => (
            <div
              key={asesor.id}
              className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow relative overflow-hidden"
            >
              {index < 3 && (
                <div className="absolute top-0 right-0">
                  <div className={`px-3 py-1 rounded-bl-lg font-semibold text-sm ${
                    index === 0 ? "bg-yellow-400 text-yellow-900" :
                    index === 1 ? "bg-gray-300 text-gray-900" :
                    "bg-orange-400 text-orange-900"
                  }`}>
                    {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"} Top {index + 1}
                  </div>
                </div>
              )}

              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="text-red-600" size={32} />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {asesor.nombres} {asesor.apellidos}
                  </h3>
                  <p className="text-sm text-gray-600 truncate">{asesor.carrera}</p>

                  <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full border mt-2 text-xs font-medium ${getCategoriaColor(asesor.categoria)}`}>
                    {getIconoCategoria(asesor.categoria)}
                    <span>{asesor.categoria}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    {renderEstrellas(asesor.promedio_general)}
                  </div>
                  <span className="text-2xl font-bold text-gray-900">
                    {parseFloat(asesor.promedio_general).toFixed(1)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>{asesor.total_calificaciones} calificaciones</span>
                  {asesor.total_materias > 0 && (
                    <div className="flex items-center space-x-1">
                      <BookOpen size={14} />
                      <span>{asesor.total_materias} materias</span>
                    </div>
                  )}
                </div>

                {asesor.materias && (
                  <div className="pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500 font-medium mb-1">Materias:</p>
                    <p className="text-sm text-gray-700 line-clamp-2">
                      {asesor.materias}
                    </p>
                  </div>
                )}

                <div className="pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500">
                    <span className="font-medium">Email:</span> {asesor.email}
                  </p>
                  {asesor.telefono && (
                    <p className="text-xs text-gray-500 mt-1">
                      <span className="font-medium">Tel:</span> {asesor.telefono}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MejoresAsesores;

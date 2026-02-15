import React, { useState, useEffect } from "react";
import axios from "axios";
import { X, MessageCircle } from "lucide-react";

function AsesorSelector({ onClose, onSelectAsesor }) {
  const [asesores, setAsesores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarAsesores();
  }, []);

  const cargarAsesores = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:3001/asesoria/getAsesoresDisponibles");

      if (res.data.ok) {
        setAsesores(res.data.asesores);
      }
    } catch (err) {
      console.error("Error al cargar asesores:", err);
      setError("No se pudieron cargar los asesores disponibles");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAsesor = (asesor) => {
    onSelectAsesor(asesor);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-red-600 text-white">
          <h2 className="text-xl font-semibold">Selecciona un Asesor</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-red-700 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-4 overflow-y-auto max-h-[calc(90vh-80px)]">
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

          {!loading && !error && asesores.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No hay asesores disponibles en este momento
            </div>
          )}

          {!loading && !error && asesores.length > 0 && (
            <div className="grid gap-4">
              {asesores.map((asesor) => (
                <div
                  key={asesor.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                          <span className="text-red-600 font-semibold text-lg">
                            {asesor.nombres?.[0]?.toUpperCase() || "?"}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {asesor.nombres} {asesor.apellidos}
                          </h3>
                          <p className="text-sm text-gray-600">{asesor.carrera}</p>
                        </div>
                      </div>

                      <div className="mt-3 space-y-1">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Email:</span> {asesor.email}
                        </p>
                        {asesor.telefono && (
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Teléfono:</span> {asesor.telefono}
                          </p>
                        )}
                        {asesor.materias && (
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Materias:</span> {asesor.materias}
                          </p>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleSelectAsesor(asesor)}
                      className="ml-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                    >
                      <MessageCircle size={18} />
                      <span>Chatear</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AsesorSelector;

import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';

function PruebaForm({ onSubmit, materias }) {
    const [formData, setFormData] = useState({
        materia_id: '',
        titulo: '',
        descripcion: '',
    });

    const [preguntas, setPreguntas] = useState([
        { texto_pregunta: '', opcion_a: '', opcion_b: '', opcion_c: '', opcion_d: '', respuesta_correcta: 'A' }
    ]);

    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: undefined }));
    };

    const handlePreguntaChange = (index, field, value) => {
        setPreguntas(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });
        // Limpiar error de esa pregunta
        if (errors[`pregunta_${index}`]) {
            setErrors(prev => ({ ...prev, [`pregunta_${index}`]: undefined }));
        }
    };

    const addPregunta = () => {
        setPreguntas(prev => [
            ...prev,
            { texto_pregunta: '', opcion_a: '', opcion_b: '', opcion_c: '', opcion_d: '', respuesta_correcta: 'A' }
        ]);
    };

    const removePregunta = (index) => {
        if (preguntas.length <= 1) return;
        setPreguntas(prev => prev.filter((_, i) => i !== index));
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.materia_id) newErrors.materia_id = 'Seleccione una materia';
        if (!formData.titulo.trim()) newErrors.titulo = 'El título es requerido';

        preguntas.forEach((p, i) => {
            if (!p.texto_pregunta.trim() || !p.opcion_a.trim() || !p.opcion_b.trim() ||
                !p.opcion_c.trim() || !p.opcion_d.trim()) {
                newErrors[`pregunta_${i}`] = 'Todos los campos de la pregunta son requeridos';
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validate()) {
            onSubmit({
                ...formData,
                materia_id: parseInt(formData.materia_id),
                preguntas
            });
        }
    };

    return (
        <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Datos de la prueba */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-800 flex items-center gap-2">
                        <svg viewBox="0 0 24 24" fill="none" width="20" height="20" className="text-red-600">
                            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                        </svg>
                        Información de la Prueba
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="titulo" className="block text-sm font-medium text-gray-700 mb-1">
                                Título de la Prueba *
                            </label>
                            <input
                                type="text"
                                id="titulo"
                                name="titulo"
                                value={formData.titulo}
                                onChange={handleChange}
                                className={`w-full px-3 py-2 border ${errors.titulo ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-red-600 focus:border-red-600`}
                                placeholder="Ej: Evaluación de Cálculo Diferencial"
                            />
                            {errors.titulo && <p className="mt-1 text-sm text-red-600">{errors.titulo}</p>}
                        </div>

                        <div>
                            <label htmlFor="materia_id" className="block text-sm font-medium text-gray-700 mb-1">
                                Materia *
                            </label>
                            <select
                                id="materia_id"
                                name="materia_id"
                                value={formData.materia_id}
                                onChange={handleChange}
                                className={`w-full px-3 py-2 border ${errors.materia_id ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-red-600 focus:border-red-600`}
                            >
                                <option value="">Seleccione una materia</option>
                                {materias.map(m => (
                                    <option key={m.id} value={m.id}>{m.nombre}</option>
                                ))}
                            </select>
                            {errors.materia_id && <p className="mt-1 text-sm text-red-600">{errors.materia_id}</p>}
                        </div>
                    </div>

                    <div>
                        <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-1">
                            Descripción
                        </label>
                        <textarea
                            id="descripcion"
                            name="descripcion"
                            value={formData.descripcion}
                            onChange={handleChange}
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-600 focus:border-red-600"
                            placeholder="Breve descripción de la prueba..."
                        />
                    </div>
                </div>

                {/* Preguntas */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium text-gray-800 flex items-center gap-2">
                            <svg viewBox="0 0 24 24" fill="none" width="20" height="20" className="text-red-600">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8"/>
                                <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                            </svg>
                            Preguntas ({preguntas.length})
                        </h3>
                        <button
                            type="button"
                            onClick={addPregunta}
                            className="bg-green-600 hover:bg-green-500 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1"
                        >
                            <svg viewBox="0 0 24 24" fill="none" width="14" height="14">
                                <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                            </svg>
                            Agregar Pregunta
                        </button>
                    </div>

                    <div className="overflow-y-auto pr-2" style={{ maxHeight: '50vh' }}>
                    {preguntas.map((pregunta, index) => (
                        <div key={index} className="border border-gray-200 rounded-xl p-5 bg-gray-50 space-y-4 relative mb-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-bold text-red-600">Pregunta {index + 1}</span>
                                {preguntas.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removePregunta(index)}
                                        className="text-red-400 hover:text-red-600 text-sm transition-colors"
                                    >
                                        ✕ Eliminar
                                    </button>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Enunciado de la pregunta *
                                </label>
                                <textarea
                                    value={pregunta.texto_pregunta}
                                    onChange={e => handlePreguntaChange(index, 'texto_pregunta', e.target.value)}
                                    rows={2}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-600 focus:border-red-600"
                                    placeholder="Escribe la pregunta aquí..."
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {[
                                    { letra: 'A', field: 'opcion_a', color: 'blue' },
                                    { letra: 'B', field: 'opcion_b', color: 'green' },
                                    { letra: 'C', field: 'opcion_c', color: 'purple' },
                                    { letra: 'D', field: 'opcion_d', color: 'orange' },
                                ].map(({ letra, field, color }) => (
                                    <div key={letra} className="flex items-center gap-2">
                                        <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                                            pregunta.respuesta_correcta === letra
                                                ? 'bg-green-500 text-white'
                                                : 'bg-gray-200 text-gray-600'
                                        }`}>
                                            {letra}
                                        </span>
                                        <input
                                            type="text"
                                            value={pregunta[field]}
                                            onChange={e => handlePreguntaChange(index, field, e.target.value)}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-red-600 focus:border-red-600"
                                            placeholder={`Opción ${letra}`}
                                        />
                                    </div>
                                ))}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Respuesta correcta *
                                </label>
                                <div className="flex gap-3">
                                    {['A', 'B', 'C', 'D'].map(letra => (
                                        <button
                                            key={letra}
                                            type="button"
                                            onClick={() => handlePreguntaChange(index, 'respuesta_correcta', letra)}
                                            className={`w-10 h-10 rounded-full font-bold text-sm transition-all duration-200 ${
                                                pregunta.respuesta_correcta === letra
                                                    ? 'bg-green-500 text-white shadow-md scale-110'
                                                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                            }`}
                                        >
                                            {letra}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {errors[`pregunta_${index}`] && (
                                <p className="text-sm text-red-600 flex items-center gap-1">
                                    <AlertCircle className="w-4 h-4" />
                                    {errors[`pregunta_${index}`]}
                                </p>
                            )}
                        </div>
                    ))}
                    </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                    <button
                        type="submit"
                        className="inline-flex items-center gap-2 py-2.5 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-600 transition-colors duration-200"
                    >
                        <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
                            <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Guardar Prueba ({preguntas.length} {preguntas.length === 1 ? 'pregunta' : 'preguntas'})
                    </button>
                </div>
            </form>
        </div>
    );
}

export default PruebaForm;

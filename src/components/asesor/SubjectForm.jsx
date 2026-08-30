import React, {useState} from 'react';
import {AlertCircle, Plus, Trash2, Clock} from "lucide-react";

function SubjectForm({onSubmit, initialData, categories}) {

    const [formData, setFormData] = useState({
        id: initialData ? initialData.id : '',
        id_materia: initialData ? initialData.id_materia : '',
        materia: initialData ? initialData.materia : '',
        descripcion: initialData ? initialData.descripcion : '',
        precio_hora: initialData ? initialData.precio_hora : '',
        precio_sesion: initialData ? initialData.precio_sesion : '',
        activa: initialData ? (initialData.activa === 'S') : false,
        hora_inicial: initialData ? initialData.hora_inicial : '08:00',
        hora_final: initialData ? initialData.hora_final : '18:00',
    });

    // Horarios adicionales (solo para creación nueva, no edición)
    const [horariosExtra, setHorariosExtra] = useState([]);

    const [errors, setErrors] = useState({});

    const validateForm = () => {
        const newErrors = {};

        if (!formData.materia || !formData.materia.toString().trim()) {
            newErrors.materia = 'La materia es requerida';
        }

        if (!formData.descripcion.trim()) {
            newErrors.descripcion = 'La descripción es requerida';
        }

        if (formData.precio_hora <= 0) {
            newErrors.precio_hora = 'El precio por hora debe ser mayor a 0';
        }

        if (formData.precio_sesion <= 0) {
            newErrors.precio_sesion = 'El precio por sesión debe ser mayor a 0';
        }

        if (formData.hora_inicial >= formData.hora_final) {
            newErrors.hora_inicial = 'La hora inicial debe ser menor que la hora final';
            newErrors.hora_final = 'La hora final debe ser mayor que la hora inicial';
        }

        // Validar horarios extra
        horariosExtra.forEach((h, idx) => {
            if (h.hora_inicial >= h.hora_final) {
                newErrors[`extra_${idx}`] = 'La hora inicial debe ser menor que la hora final';
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const {name, value, type} = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseFloat(value) || 0 : value
        }));

        if (errors[name]) {
            setErrors(prev => ({...prev, [name]: undefined}));
        }
    };

    const handleToggleChange = () => {
        setFormData(prev => ({
            ...prev,
            activa: !prev.activa
        }));
    };

    const addHorario = () => {
        setHorariosExtra(prev => [...prev, {
            hora_inicial: '08:00',
            hora_final: '18:00'
        }]);
    };

    const removeHorario = (idx) => {
        setHorariosExtra(prev => prev.filter((_, i) => i !== idx));
    };

    const updateHorario = (idx, field, value) => {
        setHorariosExtra(prev => prev.map((h, i) => 
            i === idx ? {...h, [field]: value} : h
        ));
        if (errors[`extra_${idx}`]) {
            setErrors(prev => ({...prev, [`extra_${idx}`]: undefined}));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (validateForm()) {
            if (!initialData && horariosExtra.length > 0) {
                // Modo creación con múltiples horarios
                onSubmit({
                    ...formData,
                    horariosExtra: horariosExtra
                });
            } else {
                onSubmit(formData);
            }
        }
    };

    return (
        <div className="p-6">
            <h3 className="text-lg font-medium text-gray-800 mb-4">
                {initialData ? 'Editar Asesoría' : 'Agregar Nueva Asesoría'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="materia" className="block text-sm font-medium text-gray-700 mb-1">
                        Materia
                    </label>
                    <select
                        id="materia"
                        name="materia"
                        value={formData.materia}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-600 focus:border-red-600"
                    >
                        <option value={''} disabled={true}>Seleccione una opción</option>
                        {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                                {category.nombre}
                            </option>
                        ))}
                    </select>
                </div>


                <div>
                    <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-1">
                        Descripción *
                    </label>
                    <textarea
                        id="descripcion"
                        name="descripcion"
                        value={formData.descripcion}
                        onChange={handleChange}
                        rows={3}
                        className={`w-full px-3 py-2 border ${errors.descripcion ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-red-600 focus:border-red-600`}
                        placeholder="Describe brevemente el contenido y temas que puedes asesorar en esta materia"
                    ></textarea>
                    {errors.descripcion && <p className="mt-1 text-sm text-red-600">{errors.descripcion}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="precio_hora" className="block text-sm font-medium text-gray-700 mb-1">
                            Precio por Hora (COP) *
                        </label>
                        <div className="relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="text-gray-500 sm:text-sm">$</span>
                            </div>
                            <input
                                type="number"
                                id="precio_hora"
                                name="precio_hora"
                                value={formData.precio_hora || ''}
                                onChange={handleChange}
                                min="0"
                                className={`w-full pl-7 pr-3 py-2 border ${errors.precio_hora ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-red-600 focus:border-red-600`}
                                placeholder="0"
                            />
                        </div>
                        {errors.precio_hora && <p className="mt-1 text-sm text-red-600">{errors.precio_hora}</p>}
                    </div>

                    <div>
                        <label htmlFor="precio_sesion" className="block text-sm font-medium text-gray-700 mb-1">
                            Precio por Sesión (COP) *
                        </label>
                        <div className="relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="text-gray-500 sm:text-sm">$</span>
                            </div>
                            <input
                                type="number"
                                id="precio_sesion"
                                name="precio_sesion"
                                value={formData.precio_sesion || ''}
                                onChange={handleChange}
                                min="0"
                                className={`w-full pl-7 pr-3 py-2 border ${errors.precio_sesion ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-red-600 focus:border-red-600`}
                                placeholder="0"
                            />
                        </div>
                        {errors.precio_sesion && <p className="mt-1 text-sm text-red-600">{errors.precio_sesion}</p>}
                    </div>
                </div>

                {/* ═══ SECCIÓN DE HORARIOS ═══ */}
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-red-600" />
                            <span className="text-sm font-semibold text-gray-800">
                                Horario {!initialData && horariosExtra.length > 0 ? '1' : 'de disponibilidad'} *
                            </span>
                        </div>
                        {!initialData && (
                            <button
                                type="button"
                                onClick={addHorario}
                                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors border border-red-200"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                Agregar otro horario
                            </button>
                        )}
                    </div>

                    {/* Horario principal */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="hora_inicial" className="block text-sm font-medium text-gray-700 mb-1">
                                Hora inicial
                            </label>
                            <input
                                type="time"
                                id="hora_inicial"
                                name="hora_inicial"
                                value={formData.hora_inicial}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 rounded-lg border ${
                                    errors.hora_inicial ? 'border-red-500' : 'border-gray-300'
                                } focus:outline-none focus:ring-2 focus:ring-red-600 transition-colors`}
                            />
                            {errors.hora_inicial && (
                                <p className="mt-1 text-sm text-red-600 flex items-center">
                                    <AlertCircle className="w-4 h-4 mr-1"/>
                                    {errors.hora_inicial}
                                </p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="hora_final" className="block text-sm font-medium text-gray-700 mb-1">
                                Hora final
                            </label>
                            <input
                                type="time"
                                id="hora_final"
                                name="hora_final"
                                value={formData.hora_final}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 rounded-lg border ${
                                    errors.hora_final ? 'border-red-500' : 'border-gray-300'
                                } focus:outline-none focus:ring-2 focus:ring-red-600 transition-colors`}
                            />
                            {errors.hora_final && (
                                <p className="mt-1 text-sm text-red-600 flex items-center">
                                    <AlertCircle className="w-4 h-4 mr-1"/>
                                    {errors.hora_final}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* ═══ HORARIOS ADICIONALES ═══ */}
                {horariosExtra.map((horario, idx) => (
                    <div key={idx} className="border border-red-200 rounded-lg p-4 bg-red-50 relative">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-red-600" />
                                <span className="text-sm font-semibold text-gray-800">
                                    Horario {idx + 2}
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={() => removeHorario(idx)}
                                className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-100 rounded-md transition-colors"
                                title="Eliminar horario"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                                Quitar
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Hora inicial
                                </label>
                                <input
                                    type="time"
                                    value={horario.hora_inicial}
                                    onChange={(e) => updateHorario(idx, 'hora_inicial', e.target.value)}
                                    className={`w-full px-4 py-3 rounded-lg border ${
                                        errors[`extra_${idx}`] ? 'border-red-500' : 'border-gray-300'
                                    } focus:outline-none focus:ring-2 focus:ring-red-600 transition-colors bg-white`}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Hora final
                                </label>
                                <input
                                    type="time"
                                    value={horario.hora_final}
                                    onChange={(e) => updateHorario(idx, 'hora_final', e.target.value)}
                                    className={`w-full px-4 py-3 rounded-lg border ${
                                        errors[`extra_${idx}`] ? 'border-red-500' : 'border-gray-300'
                                    } focus:outline-none focus:ring-2 focus:ring-red-600 transition-colors bg-white`}
                                />
                            </div>
                        </div>
                        {errors[`extra_${idx}`] && (
                            <p className="mt-2 text-sm text-red-600 flex items-center">
                                <AlertCircle className="w-4 h-4 mr-1"/>
                                {errors[`extra_${idx}`]}
                            </p>
                        )}
                    </div>
                ))}

                {!initialData && horariosExtra.length === 0 && (
                    <p className="text-xs text-gray-400 -mt-2">
                        💡 Puedes agregar múltiples horarios para que los estudiantes elijan el que mejor les convenga.
                    </p>
                )}

                {/* Estado (activa/inactiva) */}
                <div className="col-span-1 md:col-span-2">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Estado de la materia</span>
                        <div
                            className="relative inline-block w-12 align-middle select-none transition duration-200 ease-in">
                            <input
                                type="checkbox"
                                name="activa"
                                id="activa"
                                checked={formData.activa}
                                onChange={handleToggleChange}
                                className="sr-only"
                            />
                            <label
                                htmlFor="activa"
                                className={`toggle-bg block overflow-hidden h-6 rounded-full cursor-pointer ${
                                    formData.activa ? 'bg-red-600' : 'bg-gray-300'
                                }`}
                            >
                            <span
                                className={`block h-6 w-6 rounded-full bg-white shadow transform transition-transform duration-200 ease-in-out ${
                                    formData.activa ? 'translate-x-6' : 'translate-x-0'
                                }`}
                            />
                            </label>
                        </div>
                    </div>
                </div>
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                    <button
                        type="submit"
                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-600 transition-colors duration-200"
                    >
                        {initialData ? 'Actualizar Materia' : 
                         horariosExtra.length > 0 ? `Guardar ${horariosExtra.length + 1} Horarios` : 'Guardar Materia'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default SubjectForm;
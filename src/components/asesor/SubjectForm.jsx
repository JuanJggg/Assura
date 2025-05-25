import React, {useState} from 'react';
import {AlertCircle} from "lucide-react";

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

    const [errors, setErrors] = useState({});
    const [submitStatus, setSubmitStatus] = useState('idle');

    const validateForm = () => {
        const newErrors = {};

        if (!formData.materia.trim()) {
            newErrors.materia = 'El nombre de la materia es requerido';
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

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const {name, value, type} = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseFloat(value) || 0 : value
        }));

        // Clear error when field is edited
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

    const handleSubmit = (e) => {
        console.log("holaaa", validateForm(), errors, formData)
        e.preventDefault();

        if (validateForm()) {
            onSubmit(formData);
        } else {
            setSubmitStatus('error');
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
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
                        className={`w-full px-3 py-2 border ${errors.descripcion ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
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
                                className={`w-full pl-7 pr-3 py-2 border ${errors.precio_hora ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
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
                                className={`w-full pl-7 pr-3 py-2 border ${errors.precio_sesion ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                                placeholder="0"
                            />
                        </div>
                        {errors.precio_sesion && <p className="mt-1 text-sm text-red-600">{errors.precio_sesion}</p>}
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Horario */}
                    <div>
                        <label htmlFor="hora_inicial" className="block text-sm font-medium text-gray-700 mb-1">
                            Hora inicial *
                        </label>
                        <input
                            type="time"
                            id="hora_inicial"
                            name="hora_inicial"
                            value={formData.hora_inicial}
                            onChange={handleChange}
                            className={`w-full px-4 py-3 rounded-lg border ${
                                errors.hora_inicial ? 'border-red-500' : 'border-gray-300'
                            } focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors`}
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
                            Hora final *
                        </label>
                        <input
                            type="time"
                            id="hora_final"
                            name="hora_final"
                            value={formData.hora_final}
                            onChange={handleChange}
                            className={`w-full px-4 py-3 rounded-lg border ${
                                errors.hora_final ? 'border-red-500' : 'border-gray-300'
                            } focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors`}
                        />
                        {errors.hora_final && (
                            <p className="mt-1 text-sm text-red-600 flex items-center">
                                <AlertCircle className="w-4 h-4 mr-1"/>
                                {errors.hora_final}
                            </p>
                        )}
                    </div>
                </div>

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
                                    formData.activa ? 'bg-indigo-500' : 'bg-gray-300'
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
                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                    >
                        {initialData ? 'Actualizar Materia' : 'Guardar Materia'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default SubjectForm;
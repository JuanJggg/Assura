import React, {useEffect, useState} from 'react';
import {AlertCircle, PlusCircle} from 'lucide-react';
import axios from "axios";
import Toast from "../util/alert.jsx";

function MateriaRegistration() {
    const [formData, setFormData] = useState({
        materia: ''
    });

    const [materias, setMaterias] = useState([]);
    const [errors, setErrors] = useState({});
    const [submitStatus, setSubmitStatus] = useState('idle');
    const [toast, setToast] = useState(null);

    useEffect(() => {
        getMaterias();
    }, []);

    const getMaterias = async () => {
        try {
            const res = await axios.post(
                "http://localhost:3001/asesoria/getMaterias");
            console.log("respuesta", res.data);
            setMaterias(res.data);
        } catch (err) {
            console.log(err);
            alert("Error al registrar");
        }
    }

    const validateForm = () => {
        const newErrors = {};

        if (!formData.materia.trim()) {
            newErrors.materia = 'El nombre de la materia es requerido';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const {name, value} = e.target;
        setFormData(prev => ({...prev, [name]: value}));
        if (errors[name]) {
            setErrors(prev => ({...prev, [name]: undefined}));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (validateForm()) {

            try {
                const res = await axios.post("http://localhost:3001/asesoria/addMateria", formData);
                console.log("respuesta", res.data);
                // Mostrar toast de éxito
                setToast({
                    type: res.data?.success ? 'success' : 'error',
                    message: res.data?.mensaje || "Materia registrada correctamente",
                });
                getMaterias();
            } catch (err) {
                console.log(err);
                alert("Error al registrar");
            }
            // console.log('Form data submitted:', formData);
            // setSubmitStatus('success');
            //
            // setTimeout(() => {
            //     setFormData({materia: ''});
            //     setSubmitStatus('idle');
            // }, 3000);
        } else {
            setSubmitStatus('error');
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Registro de Materias</h1>
                <p className="text-gray-600">Agrega nuevas materias para ofrecer asesorías</p>
            </div>

            {submitStatus === 'success' && (
                <div
                    className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 flex items-center">
                    <PlusCircle className="w-5 h-5 mr-2"/>
                    <span>¡Materia agregada exitosamente!</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6">
                <div className="mb-6">
                    <label htmlFor="materia" className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre de la materia *
                    </label>
                    <input
                        type="text"
                        id="materia"
                        name="materia"
                        value={formData.materia}
                        onChange={handleChange}
                        placeholder="Ej: Cálculo Diferencial"
                        className={`w-full px-4 py-3 rounded-lg border ${
                            errors.materia ? 'border-red-500' : 'border-gray-300'
                        } focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors`}
                    />
                    {errors.materia && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                            <AlertCircle className="w-4 h-4 mr-1"/>
                            {errors.materia}
                        </p>
                    )}
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        className="px-6 py-3 bg-indigo-600 text-white rounded-lg shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors flex items-center"
                    >
                        <PlusCircle className="w-5 h-5 mr-2"/>
                        Agregar Materia
                    </button>
                </div>
            </form>

            <div className="mt-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Materias Registradas</h2>
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <th scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Materia
                            </th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {materias.map((materia, idx) => (
                            <tr key={idx} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {materia.nombre}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {toast && (
                <Toast
                    type={toast.type}
                    message={toast.message}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
}

export default MateriaRegistration;
import React, {useEffect, useState} from 'react';
import SubjectForm from './SubjectForm';
import SubjectList from './SubjectList';
import axios from "axios";
import '../../App.css';
import Toast from '../util/alert.jsx';

function SubjectRegistration() {
    const usuario = JSON.parse(localStorage.getItem("token"))?.[0]; // asegúrate de que existe
    const [subjects, setSubjects] = useState();
    const [editingSubject, setEditingSubject] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [categories, setCategories] = useState([]);
    const [toast, setToast] = useState(null);

    const handleAddSubject = async (newSubject) => {

        try {
            let url = "http://localhost:3001/asesoria/addAsesoria";
            if (editingSubject) {
                url = "http://localhost:3001/asesoria/updAsesoria";
            }
            const res = await axios.post(url, {
                ...newSubject,
                idUsuario: usuario.id
            });
            console.log("respuesta ase", res.data);
            // Mostrar toast de éxito
            setToast({
                type: res.data?.success ? 'success' : 'error',
                message: res.data?.mensaje || "Asesoría registrada correctamente",
            });
            getAsesoria();
        } catch (err) {
            console.err(err);
            alert("Error al registrar");
        }


        setShowForm(false);
    };

    const handleEditSubject = (subject) => {
        setEditingSubject(subject);
        setShowForm(true);
    };

    const handleDeleteSubject = async (id) => {
        console.log(id)
        try {
            const res = await axios.post(
                "http://localhost:3001/asesoria/delAsesoria", {
                    id: id,
                });
            console.log("respuesta", res.data);
            // Mostrar toast de éxito
            setToast({
                type: res.data?.success ? 'success' : 'error',
                message: res.data?.mensaje || "Error al eliminar",
            });
            getAsesoria();
        } catch (err) {
            console.err(err);
            alert("Error al registrar");
        }
    };

    const handleToggleActive = async (id, activo) => {
        try {
            const res = await axios.post(
                "http://localhost:3001/asesoria/updActivo", {
                    id: id, activo: activo === 'S' ? 'N' : 'S'
                });
            console.log("respuesta", res.data);
            // Mostrar toast de éxito
            setToast({
                type: res.data?.success ? 'success' : 'error',
                message: res.data?.mensaje || "Estado acutalizado correctamente",
            });
            getAsesoria();
        } catch (err) {
            console.err(err);
            alert("Error al registrar");
        }
    };

    useEffect(() => {
        getMaterias();
        getAsesoria();
    }, []);

    const getMaterias = async () => {
        try {
            const res = await axios.post(
                "http://localhost:3001/asesoria/getMaterias");
            console.log("respuesta", res.data);
            setCategories(res.data);
        } catch (err) {
            console.err(err);
            alert("Error al registrar");
        }
    }

    const getAsesoria = async () => {
        try {
            const res = await axios.post(
                "http://localhost:3001/asesoria/getAsesoria");
            console.log("respuesta", res.data);
            setSubjects(res.data)
        } catch (err) {
            console.err(err);
            alert("Error al registrar");
        }
    }


    return (

        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold text-gray-800">Registro de Asesorias</h2>
                <button
                    onClick={() => {
                        setEditingSubject(null);
                        setShowForm(!showForm);
                    }}
                    className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center"
                >
                    {showForm ? 'Cancelar' : 'Agregar Asesoría'}
                </button>
            </div>

            {showForm ? (
                <div className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 ease-in-out">
                    <SubjectForm
                        onSubmit={handleAddSubject}
                        initialData={editingSubject || undefined}
                        categories={categories}
                    />
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    <div className="bg-white rounded-xl shadow-md overflow-hidden">
                        <div className="p-6">
                            <h3 className="text-lg font-medium text-gray-800 mb-4">Estadísticas Rápidas</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-indigo-50 p-4 rounded-lg">
                                    <p className="text-sm font-medium text-indigo-800">Asesorías Activas</p>
                                    <p className="text-2xl font-bold text-indigo-600">
                                        {Array.isArray(subjects) ? subjects.filter(s => s.activa === 'S').length : 0}
                                    </p>
                                </div>

                                <div className="bg-green-50 p-4 rounded-lg">
                                    <p className="text-sm font-medium text-green-800">Precio Promedio/Hora</p>
                                    <p className="text-2xl font-bold text-green-600">
                                        ${Array.isArray(subjects) && subjects.length > 0
                                        ? Math.round(subjects.reduce((acc, s) => acc + Number(s.precio_hora), 0) / subjects.length)
                                        : 0}
                                    </p>
                                </div>

                                <div className="bg-purple-50 p-4 rounded-lg">
                                    <p className="text-sm font-medium text-purple-800">Total Materias</p>
                                    <p className="text-2xl font-bold text-purple-600">
                                        {Array.isArray(subjects) ? subjects.length : 0}
                                    </p>
                                </div>

                            </div>
                        </div>
                    </div>

                    <SubjectList
                        subjects={subjects}
                        onEdit={handleEditSubject}
                        onDelete={handleDeleteSubject}
                        onToggleActive={handleToggleActive}
                    />
                </div>
            )}
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

export default SubjectRegistration;
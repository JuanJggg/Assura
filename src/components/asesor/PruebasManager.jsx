import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Toast from '../util/alert.jsx';
import PruebaForm from './PruebaForm.jsx';
import PruebaEstadisticas from './PruebaEstadisticas.jsx';

function PruebasManager() {
    const usuario = JSON.parse(localStorage.getItem("usuario")) || {};
    const [pruebas, setPruebas] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [showStats, setShowStats] = useState(false);
    const [showAsignar, setShowAsignar] = useState(null);
    const [estudiantes, setEstudiantes] = useState([]);
    const [materias, setMaterias] = useState([]);
    const [toast, setToast] = useState(null);
    const [asignarTipo, setAsignarTipo] = useState('PRE');
    const [asignarEstudiante, setAsignarEstudiante] = useState('');
    const [preguntasDetalle, setPreguntasDetalle] = useState(null);
    const [pruebaDetalle, setPruebaDetalle] = useState(null);

    useEffect(() => {
        getPruebas();
        getMaterias();
        getEstudiantes();
    }, []);

    const getPruebas = async () => {
        try {
            const res = await axios.post("http://localhost:3001/pruebas/getPruebasAsesor", {
                asesor_id: usuario.id
            });
            if (res.data.ok) setPruebas(res.data.pruebas);
        } catch (err) {
            console.error(err);
        }
    };

    const getMaterias = async () => {
        try {
            const res = await axios.post("http://localhost:3001/asesoria/getMaterias");
            setMaterias(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const getEstudiantes = async () => {
        try {
            const res = await axios.post("http://localhost:3001/pruebas/getEstudiantesAsesor", {
                asesor_id: usuario.id
            });
            if (res.data.ok) setEstudiantes(res.data.estudiantes);
        } catch (err) {
            console.error(err);
        }
    };

    const handleCrearPrueba = async (datosPrueba) => {
        try {
            const res = await axios.post("http://localhost:3001/pruebas/crearPrueba", {
                ...datosPrueba,
                asesor_id: usuario.id
            });
            setToast({
                type: res.data.success ? 'success' : 'error',
                message: res.data.mensaje
            });
            if (res.data.success) {
                getPruebas();
                setShowForm(false);
            }
        } catch (err) {
            console.error(err);
            setToast({ type: 'error', message: 'Error al crear la prueba' });
        }
    };

    const handleEliminar = async (pruebaId) => {
        if (!window.confirm('¿Estás seguro de eliminar esta prueba?')) return;
        try {
            const res = await axios.post("http://localhost:3001/pruebas/eliminarPrueba", {
                prueba_id: pruebaId
            });
            setToast({
                type: res.data.success ? 'success' : 'error',
                message: res.data.mensaje
            });
            getPruebas();
        } catch (err) {
            console.error(err);
        }
    };

    const handleToggleActiva = async (pruebaId, activa) => {
        try {
            const nuevoEstado = activa === 'S' ? 'N' : 'S';
            const res = await axios.post("http://localhost:3001/pruebas/toggleActiva", {
                prueba_id: pruebaId,
                activa: nuevoEstado
            });
            setToast({
                type: res.data.success ? 'success' : 'error',
                message: res.data.mensaje
            });
            getPruebas();
        } catch (err) {
            console.error(err);
        }
    };

    const handleAsignar = async () => {
        if (!asignarEstudiante || !showAsignar) return;
        try {
            const res = await axios.post("http://localhost:3001/pruebas/asignarPrueba", {
                prueba_id: showAsignar,
                estudiante_id: parseInt(asignarEstudiante),
                asesor_id: usuario.id,
                tipo: asignarTipo
            });
            setToast({
                type: res.data.success ? 'success' : 'error',
                message: res.data.mensaje
            });
            if (res.data.success) {
                setShowAsignar(null);
                setAsignarEstudiante('');
                setAsignarTipo('PRE');
            }
        } catch (err) {
            console.error(err);
            setToast({ type: 'error', message: 'Error al asignar la prueba' });
        }
    };

    const handleVerPreguntas = async (prueba) => {
        try {
            const res = await axios.post("http://localhost:3001/pruebas/getPreguntasPrueba", {
                prueba_id: prueba.id
            });
            if (res.data.ok) {
                setPreguntasDetalle(res.data.preguntas);
                setPruebaDetalle(prueba);
            }
        } catch (err) {
            console.error(err);
        }
    };

    // Vista de estadísticas
    if (showStats) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-semibold text-gray-800">Estadísticas de Pruebas</h2>
                    <button
                        onClick={() => setShowStats(false)}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                    >
                        ← Volver a Pruebas
                    </button>
                </div>
                <PruebaEstadisticas asesorId={usuario.id} />
            </div>
        );
    }

    // Vista de formulario
    if (showForm) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-semibold text-gray-800">Crear Nueva Prueba</h2>
                    <button
                        onClick={() => setShowForm(false)}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                    >
                        ← Cancelar
                    </button>
                </div>
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <PruebaForm onSubmit={handleCrearPrueba} materias={materias} />
                </div>
                {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
            </div>
        );
    }

    // Vista detalle de preguntas
    if (preguntasDetalle && pruebaDetalle) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-semibold text-gray-800">
                        Preguntas: {pruebaDetalle.titulo}
                    </h2>
                    <button
                        onClick={() => { setPreguntasDetalle(null); setPruebaDetalle(null); }}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                    >
                        ← Volver
                    </button>
                </div>

                <div className="space-y-4">
                    {preguntasDetalle.map((p, idx) => (
                        <div key={p.id} className="bg-white rounded-xl shadow-md p-6">
                            <p className="text-sm font-bold text-red-600 mb-2">Pregunta {idx + 1}</p>
                            <p className="text-gray-800 font-medium mb-4">{p.texto_pregunta}</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {['A', 'B', 'C', 'D'].map(letra => (
                                    <div
                                        key={letra}
                                        className={`p-3 rounded-lg border-2 ${
                                            p.respuesta_correcta?.trim() === letra
                                                ? 'border-green-500 bg-green-50'
                                                : 'border-gray-200 bg-gray-50'
                                        }`}
                                    >
                                        <span className={`font-bold mr-2 ${
                                            p.respuesta_correcta?.trim() === letra ? 'text-green-600' : 'text-gray-500'
                                        }`}>
                                            {letra})
                                        </span>
                                        <span className="text-gray-700">
                                            {p[`opcion_${letra.toLowerCase()}`]}
                                        </span>
                                        {p.respuesta_correcta?.trim() === letra && (
                                            <span className="ml-2 text-green-600 text-xs font-bold">✓ Correcta</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // Vista principal: lista de pruebas
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold text-gray-800">Gestión de Pruebas</h2>
                <div className="flex gap-3">
                    <button
                        onClick={() => setShowStats(true)}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center gap-2"
                    >
                        <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
                            <path d="M18 20V10M12 20V4M6 20v-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Estadísticas
                    </button>
                    <button
                        onClick={() => setShowForm(true)}
                        className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center gap-2"
                    >
                        <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
                            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                        Crear Prueba
                    </button>
                </div>
            </div>

            {/* Estadísticas rápidas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-indigo-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-indigo-800">Total Pruebas</p>
                    <p className="text-2xl font-bold text-indigo-600">{pruebas.length}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-green-800">Pruebas Activas</p>
                    <p className="text-2xl font-bold text-green-600">
                        {pruebas.filter(p => p.activa === 'S').length}
                    </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-purple-800">Estudiantes Conectados</p>
                    <p className="text-2xl font-bold text-purple-600">{estudiantes.length}</p>
                </div>
            </div>

            {/* Lista de pruebas */}
            {pruebas.length === 0 ? (
                <div className="bg-white rounded-xl shadow-md p-12 text-center">
                    <svg viewBox="0 0 24 24" fill="none" width="48" height="48" className="mx-auto mb-4 text-gray-300">
                        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    <p className="text-gray-500 text-lg">No tienes pruebas creadas aún.</p>
                    <p className="text-gray-400 text-sm mt-1">Crea tu primera prueba para evaluar a tus estudiantes.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {pruebas.map(prueba => (
                        <div key={prueba.id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-lg font-semibold text-gray-800">{prueba.titulo}</h3>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                            prueba.activa === 'S'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-gray-100 text-gray-500'
                                        }`}>
                                            {prueba.activa === 'S' ? 'Activa' : 'Inactiva'}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 mb-1">{prueba.descripcion}</p>
                                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                                        <span className="bg-red-50 text-red-600 px-2 py-1 rounded font-medium">
                                            {prueba.materia}
                                        </span>
                                        <span>{prueba.total_preguntas} preguntas</span>
                                        <span>
                                            {new Date(prueba.fecha_creacion).toLocaleDateString('es-ES', {
                                                day: 'numeric', month: 'short', year: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 ml-4">
                                    <button
                                        onClick={() => handleVerPreguntas(prueba)}
                                        className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                                        title="Ver preguntas"
                                    >
                                        <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="1.8"/>
                                            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8"/>
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => { setShowAsignar(prueba.id); setAsignarEstudiante(''); setAsignarTipo('PRE'); }}
                                        className="p-2 rounded-lg hover:bg-green-50 text-green-600 transition-colors"
                                        title="Asignar a estudiante"
                                    >
                                        <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
                                            <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                                            <circle cx="8.5" cy="7" r="4" stroke="currentColor" strokeWidth="1.8"/>
                                            <path d="M20 8v6M23 11h-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => handleToggleActiva(prueba.id, prueba.activa)}
                                        className={`p-2 rounded-lg transition-colors ${
                                            prueba.activa === 'S'
                                                ? 'hover:bg-yellow-50 text-yellow-600'
                                                : 'hover:bg-green-50 text-green-600'
                                        }`}
                                        title={prueba.activa === 'S' ? 'Desactivar' : 'Activar'}
                                    >
                                        <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
                                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8"/>
                                            {prueba.activa === 'S' ? (
                                                <path d="M15 9l-6 6M9 9l6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                                            ) : (
                                                <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                                            )}
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => handleEliminar(prueba.id)}
                                        className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                                        title="Eliminar"
                                    >
                                        <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
                                            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            {/* Modal asignar */}
                            {showAsignar === prueba.id && (
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <p className="text-sm font-semibold text-gray-700 mb-3">Asignar prueba a estudiante</p>
                                    <div className="flex flex-wrap gap-3 items-end">
                                        <div className="flex-1 min-w-[200px]">
                                            <label className="block text-xs font-medium text-gray-500 mb-1">Estudiante</label>
                                            <select
                                                value={asignarEstudiante}
                                                onChange={e => setAsignarEstudiante(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-red-600 focus:border-red-600"
                                            >
                                                <option value="">Seleccione un estudiante</option>
                                                {estudiantes.map(est => (
                                                    <option key={est.id} value={est.id}>
                                                        {est.nombres} {est.apellidos} ({est.email})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="min-w-[120px]">
                                            <label className="block text-xs font-medium text-gray-500 mb-1">Tipo</label>
                                            <select
                                                value={asignarTipo}
                                                onChange={e => setAsignarTipo(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-red-600 focus:border-red-600"
                                            >
                                                <option value="PRE">PRE (Inicio)</option>
                                                <option value="POST">POST (Final)</option>
                                            </select>
                                        </div>
                                        <button
                                            onClick={handleAsignar}
                                            disabled={!asignarEstudiante}
                                            className="px-4 py-2 bg-green-600 hover:bg-green-500 disabled:bg-gray-300 text-white rounded-md text-sm font-medium transition-colors"
                                        >
                                            Asignar
                                        </button>
                                        <button
                                            onClick={() => setShowAsignar(null)}
                                            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md text-sm font-medium transition-colors"
                                        >
                                            Cancelar
                                        </button>
                                    </div>
                                    {estudiantes.length === 0 && (
                                        <p className="text-xs text-amber-600 mt-2">
                                            ⚠️ No tienes estudiantes conectados. Un estudiante debe contactarte por chat primero.
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
        </div>
    );
}

export default PruebasManager;

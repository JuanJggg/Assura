import React, { useState, useEffect } from 'react';
import API from "../../services/api";
import Menu from '../menu';
import Header from '../header';
import Toast from '../util/alert.jsx';
import EvaluacionPostPrueba from './EvaluacionPostPrueba.jsx';

function PruebasEstudiante() {
    const usuario = JSON.parse(localStorage.getItem("usuario")) || {};
    const [asignaciones, setAsignaciones] = useState([]);
    const [pruebaActiva, setPruebaActiva] = useState(null);
    const [preguntas, setPreguntas] = useState([]);
    const [respuestas, setRespuestas] = useState({});
    const [resultado, setResultado] = useState(null);
    const [toast, setToast] = useState(null);
    const [loading, setLoading] = useState(false);
    const [enviando, setEnviando] = useState(false);
    const [showEvaluacion, setShowEvaluacion] = useState(false);
    const [evaluacionesRealizadas, setEvaluacionesRealizadas] = useState({});

    useEffect(() => {
        getAsignaciones();
    }, []);

    const getAsignaciones = async () => {
        try {
            const res = await API.post("/pruebas/getPruebasEstudiante", {
                estudiante_id: usuario.id
            });
            if (res.data.ok) setAsignaciones(res.data.asignaciones);
        } catch (err) {
            console.error(err);
        }
    };

    const iniciarPrueba = async (asignacion) => {
        setLoading(true);
        try {
            const res = await API.post("/pruebas/getPreguntasAsignacion", {
                asignacion_id: asignacion.id
            });
            if (res.data.ok) {
                setPruebaActiva(res.data.asignacion);
                setPreguntas(res.data.preguntas);
                // Cargar respuestas previas si las hay
                const previas = {};
                res.data.respuestas_previas?.forEach(r => {
                    previas[r.pregunta_id] = r.respuesta_estudiante?.trim();
                });
                setRespuestas(previas);
                setResultado(null);
            }
        } catch (err) {
            console.error(err);
            setToast({ type: 'error', message: 'Error al cargar la prueba' });
        } finally {
            setLoading(false);
        }
    };

    const seleccionarRespuesta = (preguntaId, letra) => {
        setRespuestas(prev => ({ ...prev, [preguntaId]: letra }));
    };

    const enviarPrueba = async () => {
        // Validar que todas las preguntas estén respondidas
        const sinResponder = preguntas.filter(p => !respuestas[p.id]);
        if (sinResponder.length > 0) {
            setToast({ type: 'warning', message: `Faltan ${sinResponder.length} preguntas por responder` });
            return;
        }

        setEnviando(true);
        try {
            const respuestasArray = preguntas.map(p => ({
                pregunta_id: p.id,
                respuesta_estudiante: respuestas[p.id]
            }));

            const res = await API.post("/pruebas/enviarRespuestas", {
                asignacion_id: pruebaActiva.id,
                respuestas: respuestasArray
            });

            if (res.data.success) {
                setResultado(res.data.resultado);
                setToast({ type: 'success', message: 'Prueba completada exitosamente' });
                getAsignaciones();
                // Si es prueba POST, mostrar evaluación automáticamente
                if (pruebaActiva.tipo === 'POST') {
                    setTimeout(() => setShowEvaluacion(true), 2000);
                }
            } else {
                setToast({ type: 'error', message: res.data.mensaje });
            }
        } catch (err) {
            console.error(err);
            setToast({ type: 'error', message: 'Error al enviar las respuestas' });
        } finally {
            setEnviando(false);
        }
    };

    const verificarEvaluacion = async (asignacionId) => {
        try {
            const res = await API.post("/pruebas/verificarEvaluacionPendiente", {
                asignacion_id: asignacionId,
                tipo: 'asesor'
            });
            if (res.data.ok) {
                setEvaluacionesRealizadas(prev => ({ ...prev, [asignacionId]: res.data.yaEvaluado }));
            }
        } catch (err) {
            console.error(err);
        }
    };

    // Verificar evaluaciones para asignaciones POST completadas
    useEffect(() => {
        asignaciones
            .filter(a => a.tipo === 'POST' && a.estado === 'COMPLETADA')
            .forEach(a => {
                if (evaluacionesRealizadas[a.id] === undefined) {
                    verificarEvaluacion(a.id);
                }
            });
    }, [asignaciones]);

    const volverALista = () => {
        setPruebaActiva(null);
        setPreguntas([]);
        setRespuestas({});
        setResultado(null);
    };

    const getEstadoBadge = (estado) => {
        switch (estado) {
            case 'COMPLETADA':
                return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700">Completada</span>;
            case 'EN_PROGRESO':
                return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700">En Progreso</span>;
            default:
                return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700">Pendiente</span>;
        }
    };

    const getTipoBadge = (tipo) => {
        return tipo === 'PRE'
            ? <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-700">PRE - Inicio</span>
            : <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-700">POST - Final</span>;
    };

    // ====== Vista de prueba activa ======
    if (pruebaActiva) {
        return (
            <div className="flex flex-col h-screen overflow-hidden font-sans">
                <Header />
                <div className="flex flex-1 overflow-hidden">
                    <Menu />
                    <main className="flex-1 bg-gray-100 overflow-y-auto p-8">
                        <style>{`
                            .option-btn { transition: all 0.2s ease; }
                            .option-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
                        `}</style>

                        {/* Header de la prueba */}
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800">{pruebaActiva.titulo}</h2>
                                <div className="flex items-center gap-3 mt-1">
                                    <span className="text-sm text-gray-500">{pruebaActiva.materia}</span>
                                    {getTipoBadge(pruebaActiva.tipo)}
                                </div>
                            </div>
                            <button
                                onClick={volverALista}
                                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                            >
                                ← Volver
                            </button>
                        </div>

                        {pruebaActiva.descripcion && (
                            <p className="text-sm text-gray-500 mb-6 bg-white rounded-xl p-4 shadow-sm">{pruebaActiva.descripcion}</p>
                        )}

                        {/* Resultado */}
                        {resultado && (
                            <>
                                <div className={`rounded-xl shadow-lg p-8 mb-6 text-center ${
                                    resultado.puntaje >= 80 ? 'bg-green-50 border-2 border-green-200' :
                                    resultado.puntaje >= 60 ? 'bg-yellow-50 border-2 border-yellow-200' :
                                    'bg-red-50 border-2 border-red-200'
                                }`}>
                                    <div className="text-6xl mb-4">
                                        {resultado.puntaje >= 80 ? '🎉' : resultado.puntaje >= 60 ? '👍' : '💪'}
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-800 mb-2">¡Prueba Completada!</h3>
                                    <div className={`text-5xl font-black mb-2 ${
                                        resultado.puntaje >= 80 ? 'text-green-600' :
                                        resultado.puntaje >= 60 ? 'text-yellow-600' :
                                        'text-red-600'
                                    }`}>
                                        {resultado.puntaje}%
                                    </div>
                                    <p className="text-gray-600">
                                        {resultado.correctas} de {resultado.total} respuestas correctas
                                    </p>
                                </div>

                                {/* Evaluación post-prueba (solo para POST) */}
                                {showEvaluacion && pruebaActiva.tipo === 'POST' && (
                                    <div className="mb-6">
                                        <EvaluacionPostPrueba
                                            asignacion={pruebaActiva}
                                            onClose={() => setShowEvaluacion(false)}
                                            onSubmitSuccess={() => {
                                                setShowEvaluacion(false);
                                                setToast({ type: 'success', message: '¡Gracias por tu evaluación!' });
                                                setEvaluacionesRealizadas(prev => ({ ...prev, [pruebaActiva.id]: true }));
                                            }}
                                        />
                                    </div>
                                )}
                            </>
                        )}

                        {/* Preguntas */}
                        {!resultado && (
                            <>
                                {/* Barra de progreso */}
                                <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-medium text-gray-600">Progreso</span>
                                        <span className="text-sm font-bold text-red-600">
                                            {Object.keys(respuestas).length} / {preguntas.length}
                                        </span>
                                    </div>
                                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-red-500 rounded-full transition-all duration-300"
                                            style={{ width: `${(Object.keys(respuestas).length / preguntas.length) * 100}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    {preguntas.map((pregunta, idx) => (
                                        <div key={pregunta.id} className="bg-white rounded-xl shadow-md p-6">
                                            <div className="flex items-start gap-4 mb-4">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                                                    respuestas[pregunta.id]
                                                        ? 'bg-green-500 text-white'
                                                        : 'bg-gray-200 text-gray-600'
                                                }`}>
                                                    {idx + 1}
                                                </div>
                                                <p className="text-gray-800 font-medium text-base pt-2">{pregunta.texto_pregunta}</p>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 ml-14">
                                                {[
                                                    { letra: 'A', texto: pregunta.opcion_a },
                                                    { letra: 'B', texto: pregunta.opcion_b },
                                                    { letra: 'C', texto: pregunta.opcion_c },
                                                    { letra: 'D', texto: pregunta.opcion_d },
                                                ].map(({ letra, texto }) => {
                                                    const selected = respuestas[pregunta.id] === letra;
                                                    return (
                                                        <button
                                                            key={letra}
                                                            className={`option-btn text-left p-4 rounded-xl border-2 font-medium text-sm flex items-center gap-3 ${
                                                                selected
                                                                    ? 'border-red-500 bg-red-50 text-red-800'
                                                                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-400'
                                                            }`}
                                                            onClick={() => seleccionarRespuesta(pregunta.id, letra)}
                                                        >
                                                            <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                                                                selected
                                                                    ? 'bg-red-500 text-white'
                                                                    : 'bg-gray-100 text-gray-500'
                                                            }`}>
                                                                {letra}
                                                            </span>
                                                            {texto}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Botón enviar */}
                                <div className="mt-8 flex justify-center">
                                    <button
                                        onClick={enviarPrueba}
                                        disabled={enviando}
                                        className="px-8 py-3 bg-red-600 hover:bg-red-500 disabled:bg-gray-400 text-white font-bold rounded-xl text-base shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
                                    >
                                        {enviando ? (
                                            <>
                                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.25"/>
                                                    <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round"/>
                                                </svg>
                                                Enviando...
                                            </>
                                        ) : (
                                            <>
                                                <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
                                                    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                                                </svg>
                                                Enviar Prueba ({Object.keys(respuestas).length}/{preguntas.length})
                                            </>
                                        )}
                                    </button>
                                </div>
                            </>
                        )}

                        {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
                    </main>
                </div>
            </div>
        );
    }

    // ====== Vista de lista de asignaciones ======
    return (
        <div className="flex flex-col h-screen overflow-hidden font-sans">
            <Header />
            <div className="flex flex-1 overflow-hidden">
                <Menu />
                <main className="flex-1 bg-gray-100 overflow-y-auto p-8">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">Mis Pruebas</h2>
                        <p className="text-sm text-gray-500 mt-1">Aquí puedes ver y resolver las pruebas asignadas por tus asesores</p>
                    </div>

                    {/* Resumen */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-blue-500">
                            <p className="text-xs font-medium text-gray-500 uppercase">Pendientes</p>
                            <p className="text-2xl font-bold text-blue-600 mt-1">
                                {asignaciones.filter(a => a.estado === 'PENDIENTE').length}
                            </p>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-green-500">
                            <p className="text-xs font-medium text-gray-500 uppercase">Completadas</p>
                            <p className="text-2xl font-bold text-green-600 mt-1">
                                {asignaciones.filter(a => a.estado === 'COMPLETADA').length}
                            </p>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-purple-500">
                            <p className="text-xs font-medium text-gray-500 uppercase">Promedio General</p>
                            <p className="text-2xl font-bold text-purple-600 mt-1">
                                {(() => {
                                    const comp = asignaciones.filter(a => a.puntaje !== null);
                                    return comp.length > 0
                                        ? (comp.reduce((acc, a) => acc + Number(a.puntaje), 0) / comp.length).toFixed(1) + '%'
                                        : '—';
                                })()}
                            </p>
                        </div>
                    </div>

                    {asignaciones.length === 0 ? (
                        <div className="bg-white rounded-xl shadow-md p-12 text-center">
                            <svg viewBox="0 0 24 24" fill="none" width="48" height="48" className="mx-auto mb-4 text-gray-300">
                                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                            </svg>
                            <p className="text-gray-500 text-lg">No tienes pruebas asignadas.</p>
                            <p className="text-gray-400 text-sm mt-1">Tu asesor te asignará pruebas cuando inicies una asesoría.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {asignaciones.map(asig => (
                                <div key={asig.id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-lg font-semibold text-gray-800">{asig.titulo}</h3>
                                                {getEstadoBadge(asig.estado)}
                                                {getTipoBadge(asig.tipo)}
                                            </div>
                                            {asig.descripcion && (
                                                <p className="text-sm text-gray-500 mb-1">{asig.descripcion}</p>
                                            )}
                                            <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                                                <span className="bg-red-50 text-red-600 px-2 py-1 rounded font-medium">{asig.materia}</span>
                                                <span>Asesor: {asig.asesor}</span>
                                                <span>{asig.total_preguntas} preguntas</span>
                                                <span>
                                                    {new Date(asig.fecha_asignacion).toLocaleDateString('es-ES', {
                                                        day: 'numeric', month: 'short', year: 'numeric'
                                                    })}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="ml-4 flex items-center gap-3">
                                            {asig.estado === 'COMPLETADA' ? (
                                                <div className="flex items-center gap-3">
                                                    <div className="text-center">
                                                        <p className={`text-2xl font-black ${
                                                            Number(asig.puntaje) >= 80 ? 'text-green-600' :
                                                            Number(asig.puntaje) >= 60 ? 'text-yellow-600' :
                                                            'text-red-600'
                                                        }`}>
                                                            {Number(asig.puntaje).toFixed(0)}%
                                                        </p>
                                                        <p className="text-xs text-gray-400">
                                                            {asig.respuestas_correctas}/{asig.total_preguntas}
                                                        </p>
                                                    </div>
                                                    {/* Botón evaluar para POST completadas sin evaluación */}
                                                    {asig.tipo === 'POST' && evaluacionesRealizadas[asig.id] === false && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setPruebaActiva(asig);
                                                                setResultado({ puntaje: Number(asig.puntaje), correctas: asig.respuestas_correctas, total: asig.total_preguntas });
                                                                setShowEvaluacion(true);
                                                            }}
                                                            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-white font-bold rounded-lg text-xs shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-1"
                                                        >
                                                            <svg viewBox="0 0 24 24" width="14" height="14" fill="#F59E0B" stroke="#D97706" strokeWidth="1">
                                                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                                            </svg>
                                                            Evaluar
                                                        </button>
                                                    )}
                                                    {asig.tipo === 'POST' && evaluacionesRealizadas[asig.id] === true && (
                                                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700">
                                                            ✓ Evaluado
                                                        </span>
                                                    )}
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => iniciarPrueba(asig)}
                                                    disabled={loading}
                                                    className="px-5 py-2.5 bg-red-600 hover:bg-red-500 disabled:bg-gray-400 text-white font-bold rounded-lg text-sm shadow-md hover:shadow-lg transition-all duration-200"
                                                >
                                                    {loading ? 'Cargando...' : 'Iniciar Prueba'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
                </main>
            </div>
        </div>
    );
}

export default PruebasEstudiante;

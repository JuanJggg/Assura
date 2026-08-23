import React, { useState, useEffect } from 'react';
import API from "../../services/api";

function PruebaEstadisticas({ asesorId }) {
    const [estadisticas, setEstadisticas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [detalleModal, setDetalleModal] = useState(null);
    // Evaluación del asesor al estudiante
    const [evalModal, setEvalModal] = useState(null); // { est, asignacion_id }
    const [evalEstrellas, setEvalEstrellas] = useState(0);
    const [evalHover, setEvalHover] = useState(0);
    const [evalComentario, setEvalComentario] = useState('');
    const [evalEnviando, setEvalEnviando] = useState(false);
    const [evalRealizadas, setEvalRealizadas] = useState({});

    useEffect(() => {
        getEstadisticas();
    }, [asesorId]);

    const getEstadisticas = async () => {
        try {
            const res = await API.post("/pruebas/getEstadisticasAsesor", {
                asesor_id: asesorId
            });
            if (res.data.ok) {
                setEstadisticas(res.data.estadisticas);
                // Verificar evaluaciones realizadas
                res.data.estadisticas.forEach(est => {
                    if (est.post_asignacion_id) {
                        verificarEval(est.post_asignacion_id);
                    }
                });
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const verificarEval = async (asignacionId) => {
        try {
            const res = await API.post("/pruebas/verificarEvaluacionPendiente", {
                asignacion_id: asignacionId,
                tipo: 'estudiante'
            });
            if (res.data.ok) {
                setEvalRealizadas(prev => ({ ...prev, [asignacionId]: res.data.yaEvaluado }));
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleEvaluar = async () => {
        if (!evalModal || evalEstrellas === 0) return;
        setEvalEnviando(true);
        try {
            const res = await API.post("/pruebas/evaluarEstudiante", {
                asignacion_id: evalModal.asignacion_id,
                asesor_id: asesorId,
                estudiante_id: evalModal.estudiante_id,
                estrellas: evalEstrellas,
                comentario: evalComentario.trim() || null
            });
            if (res.data.success) {
                setEvalRealizadas(prev => ({ ...prev, [evalModal.asignacion_id]: true }));
                setEvalModal(null);
                setEvalEstrellas(0);
                setEvalComentario('');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setEvalEnviando(false);
        }
    };

    const getPuntajeColor = (puntaje) => {
        if (puntaje === null || puntaje === undefined) return 'text-gray-400';
        if (puntaje >= 80) return 'text-green-600';
        if (puntaje >= 60) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getPuntajeBg = (puntaje) => {
        if (puntaje === null || puntaje === undefined) return 'bg-gray-100';
        if (puntaje >= 80) return 'bg-green-50';
        if (puntaje >= 60) return 'bg-yellow-50';
        return 'bg-red-50';
    };

    const getMejoraIcon = (mejora) => {
        if (mejora === null || mejora === undefined) return '—';
        if (mejora > 0) return <span className="text-green-600 font-bold">▲ +{Number(mejora).toFixed(1)}%</span>;
        if (mejora < 0) return <span className="text-red-600 font-bold">▼ {Number(mejora).toFixed(1)}%</span>;
        return <span className="text-gray-500 font-medium">= 0%</span>;
    };

    const etiquetasEval = { 1: 'Muy bajo', 2: 'Bajo', 3: 'Regular', 4: 'Bueno', 5: 'Excelente' };

    // Calcular resumen general
    const completadas = estadisticas.filter(e => e.puntaje_pre !== null && e.puntaje_post !== null);
    const promedioMejora = completadas.length > 0
        ? (completadas.reduce((acc, e) => acc + Number(e.mejora || 0), 0) / completadas.length).toFixed(1)
        : 0;
    const promedioPre = completadas.length > 0
        ? (completadas.reduce((acc, e) => acc + Number(e.puntaje_pre || 0), 0) / completadas.length).toFixed(1)
        : 0;
    const promedioPost = completadas.length > 0
        ? (completadas.reduce((acc, e) => acc + Number(e.puntaje_post || 0), 0) / completadas.length).toFixed(1)
        : 0;

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <style>{`
                .eval-star-btn { transition: all 0.15s ease; }
                .eval-star-btn:hover { transform: scale(1.15); }
            `}</style>

            {/* Resumen general */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-indigo-500">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Evaluados</p>
                    <p className="text-3xl font-bold text-indigo-600 mt-1">{estadisticas.length}</p>
                </div>
                <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-blue-500">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Promedio PRE</p>
                    <p className="text-3xl font-bold text-blue-600 mt-1">{promedioPre}%</p>
                </div>
                <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-green-500">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Promedio POST</p>
                    <p className="text-3xl font-bold text-green-600 mt-1">{promedioPost}%</p>
                </div>
                <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-purple-500">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Mejora Promedio</p>
                    <p className={`text-3xl font-bold mt-1 ${Number(promedioMejora) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {Number(promedioMejora) > 0 ? '+' : ''}{promedioMejora}%
                    </p>
                </div>
            </div>

            {/* Tabla de resultados */}
            {estadisticas.length === 0 ? (
                <div className="bg-white rounded-xl shadow-md p-12 text-center">
                    <svg viewBox="0 0 24 24" fill="none" width="48" height="48" className="mx-auto mb-4 text-gray-300">
                        <path d="M18 20V10M12 20V4M6 20v-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <p className="text-gray-500 text-lg">No hay estadísticas disponibles aún.</p>
                    <p className="text-gray-400 text-sm mt-1">Asigna pruebas PRE y POST a tus estudiantes para ver sus resultados.</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="p-5 border-b border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-800">Resultados por Estudiante</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Estudiante
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Materia
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Puntaje PRE
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Puntaje POST
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Mejora
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Progreso
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Evaluar
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {estadisticas.map((est, idx) => {
                                    const pre = est.puntaje_pre !== null ? Number(est.puntaje_pre) : null;
                                    const post = est.puntaje_post !== null ? Number(est.puntaje_post) : null;
                                    const hasPostCompleted = est.post_asignacion_id !== null;
                                    const yaEvaluado = evalRealizadas[est.post_asignacion_id];
                                    return (
                                        <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                                        {est.estudiante?.[0]?.toUpperCase() || '?'}
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-800">{est.estudiante}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded font-medium">
                                                    {est.materia}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${getPuntajeBg(pre)} ${getPuntajeColor(pre)}`}>
                                                    {pre !== null ? `${pre}%` : 'Pendiente'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${getPuntajeBg(post)} ${getPuntajeColor(post)}`}>
                                                    {post !== null ? `${post}%` : 'Pendiente'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center text-sm">
                                                {getMejoraIcon(est.mejora)}
                                            </td>
                                            <td className="px-6 py-4">
                                                {pre !== null && post !== null ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full rounded-full transition-all duration-500"
                                                                style={{
                                                                    width: `${Math.min(post, 100)}%`,
                                                                    background: post >= 80 ? '#16A34A' : post >= 60 ? '#CA8A04' : '#DC2626'
                                                                }}
                                                            />
                                                        </div>
                                                        <span className="text-xs text-gray-500 min-w-[40px]">{post}%</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-gray-400">—</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {hasPostCompleted ? (
                                                    yaEvaluado ? (
                                                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700">
                                                            ✓ Evaluado
                                                        </span>
                                                    ) : (
                                                        <button
                                                            onClick={() => {
                                                                setEvalModal({
                                                                    estudiante: est.estudiante,
                                                                    estudiante_id: est.estudiante_id,
                                                                    asignacion_id: est.post_asignacion_id
                                                                });
                                                                setEvalEstrellas(0);
                                                                setEvalComentario('');
                                                            }}
                                                            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-white font-bold rounded-lg text-xs shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-1 mx-auto"
                                                        >
                                                            <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
                                                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                                            </svg>
                                                            Evaluar
                                                        </button>
                                                    )
                                                ) : (
                                                    <span className="text-xs text-gray-400">—</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal de evaluación */}
            {evalModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 9999, padding: 20
                }}
                    onClick={() => setEvalModal(null)}
                >
                    <div style={{
                        background: 'white', borderRadius: 20, padding: '32px 28px',
                        maxWidth: 480, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
                        animation: 'evalSlideUp 0.3s ease-out'
                    }}
                        onClick={e => e.stopPropagation()}
                    >
                        <style>{`
                            @keyframes evalSlideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                        `}</style>

                        {/* Header */}
                        <div style={{ textAlign: 'center', marginBottom: 24 }}>
                            <div style={{
                                width: 56, height: 56, borderRadius: '50%',
                                background: 'linear-gradient(135deg, #FEF3C7, #FDE68A)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto 14px', fontSize: 26
                            }}>⭐</div>
                            <h3 style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 800, color: '#111827' }}>
                                Evaluar Estudiante
                            </h3>
                            <p style={{ margin: 0, fontSize: 13, color: '#6B7280' }}>
                                ¿Qué tan diligente fue <strong>{evalModal.estudiante}</strong>?
                            </p>
                        </div>

                        {/* Estrellas */}
                        <div style={{ textAlign: 'center', marginBottom: 20 }}>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: 6 }}>
                                {[1,2,3,4,5].map(i => {
                                    const active = i <= (evalHover || evalEstrellas);
                                    return (
                                        <button key={i} className="eval-star-btn"
                                            onClick={() => setEvalEstrellas(i)}
                                            onMouseEnter={() => setEvalHover(i)}
                                            onMouseLeave={() => setEvalHover(0)}
                                            style={{ background: 'none', border: 'none', padding: 3, cursor: 'pointer' }}
                                        >
                                            <svg viewBox="0 0 24 24" width="36" height="36"
                                                fill={active ? '#F59E0B' : '#E5E7EB'}
                                                stroke={active ? '#D97706' : '#D1D5DB'}
                                                strokeWidth="1.2"
                                                style={{ filter: active ? 'drop-shadow(0 2px 4px rgba(245,158,11,0.4))' : 'none' }}
                                            >
                                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                            </svg>
                                        </button>
                                    );
                                })}
                            </div>
                            {(evalHover || evalEstrellas) > 0 && (
                                <p style={{ fontSize: 13, fontWeight: 600, marginTop: 6,
                                    color: (evalHover || evalEstrellas) >= 4 ? '#059669' :
                                           (evalHover || evalEstrellas) >= 3 ? '#D97706' : '#DC2626'
                                }}>
                                    {etiquetasEval[evalHover || evalEstrellas]}
                                </p>
                            )}
                        </div>

                        {/* Comentario */}
                        <div style={{ marginBottom: 20 }}>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                                Comentario sobre la diligencia <span style={{ color: '#9CA3AF', fontWeight: 400 }}>(opcional)</span>
                            </label>
                            <textarea
                                value={evalComentario}
                                onChange={e => setEvalComentario(e.target.value)}
                                rows={3}
                                placeholder="¿Cómo fue el desempeño del estudiante?"
                                style={{
                                    width: '100%', padding: '10px 14px', borderRadius: 10,
                                    border: '2px solid #E5E7EB', fontSize: 13, fontFamily: 'inherit',
                                    resize: 'vertical', outline: 'none', boxSizing: 'border-box',
                                    transition: 'border-color 0.2s'
                                }}
                                onFocus={e => e.target.style.borderColor = '#DC2626'}
                                onBlur={e => e.target.style.borderColor = '#E5E7EB'}
                            />
                        </div>

                        {/* Botones */}
                        <div style={{ display: 'flex', gap: 10 }}>
                            <button
                                onClick={() => setEvalModal(null)}
                                style={{
                                    flex: 1, padding: '10px', borderRadius: 10,
                                    border: '2px solid #E5E7EB', background: 'white',
                                    color: '#6B7280', fontSize: 13, fontWeight: 600, cursor: 'pointer'
                                }}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleEvaluar}
                                disabled={evalEstrellas === 0 || evalEnviando}
                                style={{
                                    flex: 2, padding: '10px', borderRadius: 10,
                                    border: 'none',
                                    background: evalEstrellas > 0 ? 'linear-gradient(135deg, #DC2626, #B91C1C)' : '#E5E7EB',
                                    color: evalEstrellas > 0 ? 'white' : '#9CA3AF',
                                    fontSize: 13, fontWeight: 700,
                                    cursor: evalEstrellas > 0 ? 'pointer' : 'not-allowed',
                                    boxShadow: evalEstrellas > 0 ? '0 4px 14px rgba(220,38,38,0.3)' : 'none',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
                                }}
                            >
                                {evalEnviando ? 'Enviando...' : 'Enviar Evaluación'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PruebaEstadisticas;

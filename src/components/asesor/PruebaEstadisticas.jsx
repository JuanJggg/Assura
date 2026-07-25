import React, { useState, useEffect } from 'react';
import axios from 'axios';

function PruebaEstadisticas({ asesorId }) {
    const [estadisticas, setEstadisticas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [detalleModal, setDetalleModal] = useState(null);

    useEffect(() => {
        getEstadisticas();
    }, [asesorId]);

    const getEstadisticas = async () => {
        try {
            const res = await axios.post("http://localhost:3001/pruebas/getEstadisticasAsesor", {
                asesor_id: asesorId
            });
            if (res.data.ok) setEstadisticas(res.data.estadisticas);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
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
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {estadisticas.map((est, idx) => {
                                    const pre = est.puntaje_pre !== null ? Number(est.puntaje_pre) : null;
                                    const post = est.puntaje_post !== null ? Number(est.puntaje_post) : null;
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
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PruebaEstadisticas;

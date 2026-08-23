import React, { useState, useEffect } from 'react';
import API from "../../services/api";
import Menu from '../menu';
import Header from '../header';

// Avatar helper
function Avatar({ name, size = 44, fontSize = 16 }) {
    const colors = ["#DC2626","#7C3AED","#2563EB","#059669","#D97706","#DB2777"];
    const idx = (name?.charCodeAt(0) || 0) % colors.length;
    return (
        <div style={{
            width: size, height: size, borderRadius: '50%',
            background: `linear-gradient(135deg, ${colors[idx]}, ${colors[(idx+1)%colors.length]})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 700, fontSize, flexShrink: 0, userSelect: 'none'
        }}>
            {name?.[0]?.toUpperCase() || '?'}
        </div>
    );
}

// Star display component
function Stars({ rating, size = 16 }) {
    return (
        <div style={{ display: 'flex', gap: 2 }}>
            {[1,2,3,4,5].map(i => {
                const filled = i <= Math.floor(rating);
                const half = !filled && i - rating < 1 && i - rating > 0;
                return (
                    <svg key={i} viewBox="0 0 24 24" width={size} height={size}
                        fill={filled ? '#F59E0B' : half ? 'url(#halfStar)' : '#E5E7EB'}
                        stroke={filled || half ? '#D97706' : '#D1D5DB'}
                        strokeWidth="1">
                        {half && (
                            <defs>
                                <linearGradient id="halfStar">
                                    <stop offset="50%" stopColor="#F59E0B"/>
                                    <stop offset="50%" stopColor="#E5E7EB"/>
                                </linearGradient>
                            </defs>
                        )}
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                );
            })}
        </div>
    );
}

function RankingAsesores() {
    const [ranking, setRanking] = useState([]);
    const [selectedAsesor, setSelectedAsesor] = useState(null);
    const [evaluaciones, setEvaluaciones] = useState([]);
    const [loadingEval, setLoadingEval] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getRanking();
    }, []);

    const getRanking = async () => {
        try {
            const res = await API.post("/pruebas/getRankingAsesores");
            if (res.data.ok) setRanking(res.data.ranking);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const verEvaluaciones = async (asesor) => {
        if (selectedAsesor?.asesor_id === asesor.asesor_id) {
            setSelectedAsesor(null);
            setEvaluaciones([]);
            return;
        }
        setSelectedAsesor(asesor);
        setLoadingEval(true);
        try {
            const res = await API.post("/pruebas/getEvaluacionesAsesor", {
                asesor_id: asesor.asesor_id
            });
            if (res.data.ok) setEvaluaciones(res.data.evaluaciones);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingEval(false);
        }
    };

    const getMedalla = (pos) => {
        if (pos === 0) return { emoji: '🥇', bg: 'linear-gradient(135deg, #FEF3C7, #FDE68A)', border: '#F59E0B', shadow: '0 4px 20px rgba(245,158,11,0.2)' };
        if (pos === 1) return { emoji: '🥈', bg: 'linear-gradient(135deg, #F3F4F6, #E5E7EB)', border: '#9CA3AF', shadow: '0 4px 20px rgba(156,163,175,0.2)' };
        if (pos === 2) return { emoji: '🥉', bg: 'linear-gradient(135deg, #FED7AA, #FDBA74)', border: '#F97316', shadow: '0 4px 20px rgba(249,115,22,0.2)' };
        return { emoji: `#${pos + 1}`, bg: 'white', border: '#E5E7EB', shadow: '0 2px 8px rgba(0,0,0,0.06)' };
    };

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
                @keyframes rankSlideIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes rankPulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
                .rank-card { transition: all 0.25s ease; cursor: pointer; }
                .rank-card:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(0,0,0,0.12) !important; }
                .rank-entry { animation: rankSlideIn 0.4s ease-out backwards; }
                .rank-medal-top { animation: rankPulse 3s ease-in-out infinite; }
                .rank-scroll { scrollbar-width: thin; scrollbar-color: #E5E7EB transparent; }
                .rank-scroll::-webkit-scrollbar { width: 5px; }
                .rank-scroll::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 4px; }
                .eval-card { transition: all 0.2s ease; }
                .eval-card:hover { background: #FAFAFA !important; }
            `}</style>

            <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', fontFamily: "'Inter',sans-serif" }}>
                <Header />
                <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                    <Menu />
                    <main className="rank-scroll" style={{ flex: 1, background: '#F3F4F6', overflowY: 'auto', padding: '28px 32px' }}>

                        {/* Header */}
                        <div style={{ marginBottom: 28 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                                <div style={{
                                    width: 42, height: 42, borderRadius: 12,
                                    background: 'linear-gradient(135deg, #FEF3C7, #FDE68A)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 22
                                }}>
                                    🏆
                                </div>
                                <div>
                                    <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#111827' }}>
                                        Ranking de Asesores
                                    </h1>
                                    <p style={{ margin: '2px 0 0', fontSize: 13, color: '#6B7280' }}>
                                        Los mejores asesores calificados por estudiantes
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Stats */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16, marginBottom: 28 }}>
                            <div style={{
                                background: 'white', borderRadius: 14, padding: '18px 20px',
                                boxShadow: '0 1px 4px rgba(0,0,0,0.06)', borderLeft: '4px solid #F59E0B',
                                display: 'flex', alignItems: 'center', gap: 14
                            }}>
                                <div style={{
                                    width: 44, height: 44, borderRadius: 12,
                                    background: '#FFFBEB', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 20
                                }}>⭐</div>
                                <div>
                                    <p style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#111827' }}>
                                        {ranking.length}
                                    </p>
                                    <p style={{ margin: '2px 0 0', fontSize: 12, color: '#6B7280', fontWeight: 500 }}>
                                        Asesores calificados
                                    </p>
                                </div>
                            </div>
                            <div style={{
                                background: 'white', borderRadius: 14, padding: '18px 20px',
                                boxShadow: '0 1px 4px rgba(0,0,0,0.06)', borderLeft: '4px solid #7C3AED',
                                display: 'flex', alignItems: 'center', gap: 14
                            }}>
                                <div style={{
                                    width: 44, height: 44, borderRadius: 12,
                                    background: '#F5F3FF', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 20
                                }}>💬</div>
                                <div>
                                    <p style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#111827' }}>
                                        {ranking.reduce((acc, a) => acc + parseInt(a.total_evaluaciones || 0), 0)}
                                    </p>
                                    <p style={{ margin: '2px 0 0', fontSize: 12, color: '#6B7280', fontWeight: 500 }}>
                                        Total evaluaciones
                                    </p>
                                </div>
                            </div>
                            <div style={{
                                background: 'white', borderRadius: 14, padding: '18px 20px',
                                boxShadow: '0 1px 4px rgba(0,0,0,0.06)', borderLeft: '4px solid #059669',
                                display: 'flex', alignItems: 'center', gap: 14
                            }}>
                                <div style={{
                                    width: 44, height: 44, borderRadius: 12,
                                    background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 20
                                }}>📊</div>
                                <div>
                                    <p style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#111827' }}>
                                        {ranking.length > 0
                                            ? (ranking.reduce((acc, a) => acc + parseFloat(a.promedio_estrellas || 0), 0) / ranking.length).toFixed(1)
                                            : '—'}
                                    </p>
                                    <p style={{ margin: '2px 0 0', fontSize: 12, color: '#6B7280', fontWeight: 500 }}>
                                        Promedio general
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Loading */}
                        {loading ? (
                            <div style={{ textAlign: 'center', padding: '60px 0' }}>
                                <div style={{ fontSize: 40, marginBottom: 12 }}>⏳</div>
                                <p style={{ color: '#6B7280', fontSize: 14 }}>Cargando ranking...</p>
                            </div>
                        ) : ranking.length === 0 ? (
                            <div style={{
                                background: 'white', borderRadius: 16, padding: '60px 20px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.06)', textAlign: 'center'
                            }}>
                                <div style={{ fontSize: 48, marginBottom: 12 }}>🏆</div>
                                <h3 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700, color: '#374151' }}>
                                    Aún no hay asesores calificados
                                </h3>
                                <p style={{ margin: 0, fontSize: 14, color: '#9CA3AF' }}>
                                    Las evaluaciones aparecerán aquí cuando los estudiantes completen sus pruebas finales
                                </p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {ranking.map((asesor, index) => {
                                    const medalla = getMedalla(index);
                                    const isSelected = selectedAsesor?.asesor_id === asesor.asesor_id;

                                    return (
                                        <div key={asesor.asesor_id}
                                            className="rank-entry"
                                            style={{ animationDelay: `${index * 0.08}s` }}
                                        >
                                            <div
                                                className="rank-card"
                                                onClick={() => verEvaluaciones(asesor)}
                                                style={{
                                                    background: 'white',
                                                    borderRadius: 16,
                                                    padding: '20px 24px',
                                                    boxShadow: medalla.shadow,
                                                    border: `2px solid ${isSelected ? '#DC2626' : medalla.border}`,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 18,
                                                    position: 'relative',
                                                    overflow: 'hidden'
                                                }}
                                            >
                                                {/* Top 3 shimmer effect */}
                                                {index < 3 && (
                                                    <div style={{
                                                        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                                                        background: medalla.bg, opacity: 0.15, pointerEvents: 'none'
                                                    }}/>
                                                )}

                                                {/* Position */}
                                                <div className={index < 3 ? 'rank-medal-top' : ''}
                                                    style={{
                                                        width: 48, height: 48, borderRadius: 14,
                                                        background: medalla.bg,
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        fontSize: index < 3 ? 24 : 16,
                                                        fontWeight: 800, color: '#374151',
                                                        flexShrink: 0, position: 'relative',
                                                        border: `2px solid ${medalla.border}`
                                                    }}
                                                >
                                                    {medalla.emoji}
                                                </div>

                                                {/* Avatar + Info */}
                                                <Avatar name={asesor.nombre} size={50} fontSize={20} />
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700, color: '#111827' }}>
                                                        {asesor.nombre}
                                                    </h3>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                                        <span style={{
                                                            background: '#FEF2F2', color: '#DC2626',
                                                            padding: '2px 10px', borderRadius: 20,
                                                            fontSize: 11, fontWeight: 600
                                                        }}>
                                                            {asesor.materias || 'Sin materia'}
                                                        </span>
                                                        <span style={{ fontSize: 12, color: '#9CA3AF' }}>
                                                            {asesor.total_evaluaciones} evaluación{asesor.total_evaluaciones !== '1' ? 'es' : ''}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Stars + Rating */}
                                                <div style={{ textAlign: 'center', flexShrink: 0 }}>
                                                    <Stars rating={parseFloat(asesor.promedio_estrellas)} size={20} />
                                                    <p style={{
                                                        margin: '4px 0 0', fontSize: 20, fontWeight: 800,
                                                        color: parseFloat(asesor.promedio_estrellas) >= 4 ? '#059669' :
                                                               parseFloat(asesor.promedio_estrellas) >= 3 ? '#D97706' : '#DC2626'
                                                    }}>
                                                        {parseFloat(asesor.promedio_estrellas).toFixed(1)}
                                                    </p>
                                                </div>

                                                {/* Expand icon */}
                                                <div style={{
                                                    flexShrink: 0, color: '#9CA3AF',
                                                    transform: isSelected ? 'rotate(180deg)' : 'rotate(0)',
                                                    transition: 'transform 0.3s ease'
                                                }}>
                                                    <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
                                                        <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                    </svg>
                                                </div>
                                            </div>

                                            {/* Expanded comments */}
                                            {isSelected && (
                                                <div style={{
                                                    background: '#FAFAFA', borderRadius: '0 0 16px 16px',
                                                    border: '2px solid #DC2626', borderTop: 'none',
                                                    padding: '20px 24px', marginTop: -2
                                                }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                                                        <svg viewBox="0 0 24 24" fill="none" width="18" height="18" style={{ color: '#DC2626' }}>
                                                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                                                        </svg>
                                                        <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#111827' }}>
                                                            Comentarios de estudiantes
                                                        </h4>
                                                    </div>

                                                    {loadingEval ? (
                                                        <p style={{ textAlign: 'center', color: '#9CA3AF', fontSize: 13, padding: '20px 0' }}>
                                                            Cargando comentarios...
                                                        </p>
                                                    ) : evaluaciones.length === 0 ? (
                                                        <p style={{ textAlign: 'center', color: '#9CA3AF', fontSize: 13, padding: '20px 0' }}>
                                                            No hay comentarios aún
                                                        </p>
                                                    ) : (
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                                            {evaluaciones.map(ev => (
                                                                <div key={ev.id} className="eval-card" style={{
                                                                    background: 'white', borderRadius: 12,
                                                                    padding: '14px 18px', border: '1px solid #E5E7EB',
                                                                    transition: 'background 0.2s'
                                                                }}>
                                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                                            <Avatar name={ev.estudiante} size={32} fontSize={12} />
                                                                            <div>
                                                                                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#111827' }}>
                                                                                    {ev.estudiante}
                                                                                </p>
                                                                                <p style={{ margin: '1px 0 0', fontSize: 11, color: '#9CA3AF' }}>
                                                                                    {ev.materia} — {ev.prueba_titulo}
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                                            <Stars rating={ev.estrellas} size={14} />
                                                                            <span style={{
                                                                                fontSize: 11, color: '#9CA3AF'
                                                                            }}>
                                                                                {new Date(ev.fecha_evaluacion).toLocaleDateString('es-ES', {
                                                                                    day: 'numeric', month: 'short', year: 'numeric'
                                                                                })}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                    {ev.comentario && (
                                                                        <p style={{
                                                                            margin: 0, fontSize: 13, color: '#4B5563',
                                                                            lineHeight: 1.5, paddingLeft: 42,
                                                                            fontStyle: 'italic'
                                                                        }}>
                                                                            "{ev.comentario}"
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </>
    );
}

export default RankingAsesores;

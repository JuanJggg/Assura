import React, { useState } from 'react';
import API from "../../services/api";

function EvaluacionPostPrueba({ asignacion, onClose, onSubmitSuccess }) {
    const [estrellas, setEstrellas] = useState(0);
    const [hoverEstrellas, setHoverEstrellas] = useState(0);
    const [comentario, setComentario] = useState('');
    const [enviando, setEnviando] = useState(false);
    const [enviado, setEnviado] = useState(false);
    const usuario = JSON.parse(localStorage.getItem("usuario")) || {};

    const preguntas = [
        "¿Cómo calificarías la atención de tu asesor?",
        "¿Fue claro en sus explicaciones?",
        "¿Te ayudó a mejorar en la materia?",
    ];

    const etiquetas = {
        1: 'Muy malo',
        2: 'Malo',
        3: 'Regular',
        4: 'Bueno',
        5: 'Excelente'
    };

    const handleSubmit = async () => {
        if (estrellas === 0) return;
        setEnviando(true);
        try {
            const axios = (await import('axios')).default;
            const res = await API.post("/pruebas/evaluarAsesor", {
                asignacion_id: asignacion.id,
                estudiante_id: usuario.id,
                asesor_id: asignacion.asesor_id,
                estrellas,
                comentario: comentario.trim() || null
            });
            if (res.data.success) {
                setEnviado(true);
                setTimeout(() => {
                    if (onSubmitSuccess) onSubmitSuccess();
                }, 2000);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setEnviando(false);
        }
    };

    const handleSkip = () => {
        if (onClose) onClose();
    };

    return (
        <>
            <style>{`
                @keyframes evalSlideUp {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes evalStarPop {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.35); }
                    100% { transform: scale(1); }
                }
                @keyframes evalSuccessPulse {
                    0% { transform: scale(0.8); opacity: 0; }
                    50% { transform: scale(1.1); }
                    100% { transform: scale(1); opacity: 1; }
                }
                @keyframes evalShimmer {
                    0% { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
                }
                .eval-container { animation: evalSlideUp 0.5s ease-out; }
                .eval-star { transition: all 0.15s ease; cursor: pointer; }
                .eval-star:hover { transform: scale(1.2); }
                .eval-star.selected { animation: evalStarPop 0.3s ease; }
                .eval-success { animation: evalSuccessPulse 0.5s ease-out; }
                .eval-shimmer {
                    background: linear-gradient(90deg, transparent 33%, rgba(255,255,255,0.3) 50%, transparent 66%);
                    background-size: 200% 100%;
                    animation: evalShimmer 2s infinite;
                }
                .eval-textarea:focus { box-shadow: 0 0 0 3px rgba(220,38,38,0.15); }
            `}</style>

            <div className="eval-container" style={{
                background: 'white',
                borderRadius: 20,
                padding: '36px 32px',
                boxShadow: '0 8px 40px rgba(0,0,0,0.1)',
                border: '1px solid #F3E8FF',
                maxWidth: 560,
                margin: '0 auto'
            }}>
                {enviado ? (
                    <div className="eval-success" style={{ textAlign: 'center', padding: '40px 0' }}>
                        <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
                        <h3 style={{ fontSize: 22, fontWeight: 800, color: '#111827', margin: '0 0 8px' }}>
                            ¡Gracias por tu evaluación!
                        </h3>
                        <p style={{ fontSize: 14, color: '#6B7280', margin: 0 }}>
                            Tu opinión ayuda a mejorar la calidad de las asesorías
                        </p>
                        <div style={{
                            marginTop: 20,
                            display: 'flex', justifyContent: 'center', gap: 4
                        }}>
                            {[1,2,3,4,5].map(i => (
                                <svg key={i} viewBox="0 0 24 24" width="28" height="28"
                                    fill={i <= estrellas ? '#F59E0B' : '#E5E7EB'}
                                    stroke={i <= estrellas ? '#F59E0B' : '#E5E7EB'}
                                    strokeWidth="1">
                                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                </svg>
                            ))}
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Header */}
                        <div style={{ textAlign: 'center', marginBottom: 28 }}>
                            <div style={{
                                width: 64, height: 64, borderRadius: '50%',
                                background: 'linear-gradient(135deg, #FEF3C7, #FDE68A)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto 16px', fontSize: 30
                            }}>
                                ⭐
                            </div>
                            <h3 style={{ fontSize: 20, fontWeight: 800, color: '#111827', margin: '0 0 6px' }}>
                                Evalúa a tu Asesor
                            </h3>
                            <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>
                                Tu opinión es muy importante para mejorar las asesorías
                            </p>
                        </div>

                        {/* Preguntas guía */}
                        <div style={{
                            background: '#FFFBEB', borderRadius: 12, padding: '14px 18px',
                            marginBottom: 24, border: '1px solid #FEF3C7'
                        }}>
                            <p style={{ fontSize: 12, fontWeight: 700, color: '#92400E', margin: '0 0 8px' }}>
                                Ten en cuenta estas preguntas:
                            </p>
                            {preguntas.map((q, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: i < preguntas.length - 1 ? 4 : 0 }}>
                                    <span style={{
                                        width: 18, height: 18, borderRadius: '50%',
                                        background: '#FDE68A', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: 10, fontWeight: 700, color: '#92400E', flexShrink: 0
                                    }}>
                                        {i + 1}
                                    </span>
                                    <span style={{ fontSize: 12, color: '#78350F' }}>{q}</span>
                                </div>
                            ))}
                        </div>

                        {/* Estrellas */}
                        <div style={{ textAlign: 'center', marginBottom: 24 }}>
                            <p style={{ fontSize: 14, fontWeight: 600, color: '#374151', margin: '0 0 12px' }}>
                                ¿Cómo calificarías tu experiencia?
                            </p>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
                                {[1, 2, 3, 4, 5].map(i => {
                                    const active = i <= (hoverEstrellas || estrellas);
                                    return (
                                        <button
                                            key={i}
                                            className={`eval-star${i <= estrellas ? ' selected' : ''}`}
                                            onClick={() => setEstrellas(i)}
                                            onMouseEnter={() => setHoverEstrellas(i)}
                                            onMouseLeave={() => setHoverEstrellas(0)}
                                            style={{
                                                background: 'none', border: 'none', padding: 4, cursor: 'pointer'
                                            }}
                                        >
                                            <svg viewBox="0 0 24 24" width="40" height="40"
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
                            {(hoverEstrellas || estrellas) > 0 && (
                                <p style={{
                                    fontSize: 13, fontWeight: 600, marginTop: 8,
                                    color: (hoverEstrellas || estrellas) >= 4 ? '#059669' :
                                           (hoverEstrellas || estrellas) >= 3 ? '#D97706' : '#DC2626'
                                }}>
                                    {etiquetas[hoverEstrellas || estrellas]}
                                </p>
                            )}
                        </div>

                        {/* Comentario */}
                        <div style={{ marginBottom: 24 }}>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                                Deja un comentario <span style={{ color: '#9CA3AF', fontWeight: 400 }}>(opcional)</span>
                            </label>
                            <textarea
                                className="eval-textarea"
                                value={comentario}
                                onChange={e => setComentario(e.target.value)}
                                rows={3}
                                placeholder="Cuéntanos tu experiencia con el asesor..."
                                style={{
                                    width: '100%', padding: '12px 14px', borderRadius: 12,
                                    border: '2px solid #E5E7EB', fontSize: 13, fontFamily: 'inherit',
                                    resize: 'vertical', outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s',
                                    boxSizing: 'border-box'
                                }}
                                onFocus={e => e.target.style.borderColor = '#DC2626'}
                                onBlur={e => e.target.style.borderColor = '#E5E7EB'}
                            />
                        </div>

                        {/* Botones */}
                        <div style={{ display: 'flex', gap: 12 }}>
                            <button
                                onClick={handleSkip}
                                style={{
                                    flex: 1, padding: '12px', borderRadius: 12,
                                    border: '2px solid #E5E7EB', background: 'white',
                                    color: '#6B7280', fontSize: 13, fontWeight: 600,
                                    cursor: 'pointer', transition: 'all 0.2s'
                                }}
                                onMouseOver={e => { e.target.style.background = '#F9FAFB'; e.target.style.borderColor = '#D1D5DB'; }}
                                onMouseOut={e => { e.target.style.background = 'white'; e.target.style.borderColor = '#E5E7EB'; }}
                            >
                                Omitir
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={estrellas === 0 || enviando}
                                style={{
                                    flex: 2, padding: '12px', borderRadius: 12,
                                    border: 'none',
                                    background: estrellas > 0 ? 'linear-gradient(135deg, #DC2626, #B91C1C)' : '#E5E7EB',
                                    color: estrellas > 0 ? 'white' : '#9CA3AF',
                                    fontSize: 14, fontWeight: 700,
                                    cursor: estrellas > 0 ? 'pointer' : 'not-allowed',
                                    transition: 'all 0.2s',
                                    boxShadow: estrellas > 0 ? '0 4px 14px rgba(220,38,38,0.3)' : 'none',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                                }}
                            >
                                {enviando ? (
                                    <>
                                        <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
                                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25"/>
                                            <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                                        </svg>
                                        Enviando...
                                    </>
                                ) : (
                                    <>
                                        <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
                                            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                        Enviar Evaluación
                                    </>
                                )}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </>
    );
}

export default EvaluacionPostPrueba;

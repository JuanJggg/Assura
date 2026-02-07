/*
  # Sistema de Chatbot Inteligente con IA Adaptativa

  1. Nuevas Tablas
    - `estudiante_interacciones`: Registra todas las interacciones del estudiante
    - `analisis_patrones`: Almacena patrones de comportamiento detectados
    - `desempeño_materia`: Rastrea desempeño por materia/tema
    - `recomendaciones_personalizadas`: Almacena recomendaciones generadas por IA
    - `historial_chatbot`: Historial de conversaciones con el chatbot

  2. Características
    - Análisis automático de patrones de estudio
    - Detección inteligente de temas y materias
    - Recomendaciones personalizadas basadas en comportamiento
    - Historial completo para mejora continua
*/

-- Tabla para registrar interacciones del estudiante
CREATE TABLE IF NOT EXISTS estudiante_interacciones (
  id SERIAL PRIMARY KEY,
  id_estudiante INTEGER NOT NULL,
  tipo_interaccion VARCHAR(50) NOT NULL,
  contenido TEXT NOT NULL,
  materia_relacionada VARCHAR(100),
  duracion_sesion INTEGER,
  hora_interaccion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  sentimiento_consulta VARCHAR(20),
  calidad_pregunta VARCHAR(20)
);

-- Tabla para almacenar análisis de patrones
CREATE TABLE IF NOT EXISTS analisis_patrones (
  id SERIAL PRIMARY KEY,
  id_estudiante INTEGER NOT NULL,
  patron_tipo VARCHAR(100) NOT NULL,
  descripcion TEXT,
  valor_numerico DECIMAL(10, 2),
  confianza DECIMAL(3, 2),
  fecha_analisis TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  metadatos JSONB
);

-- Tabla para desempeño por materia
CREATE TABLE IF NOT EXISTS desempeño_materia (
  id SERIAL PRIMARY KEY,
  id_estudiante INTEGER NOT NULL,
  materia VARCHAR(100) NOT NULL,
  preguntas_totales INTEGER DEFAULT 0,
  preguntas_respondidas INTEGER DEFAULT 0,
  promedio_calidad DECIMAL(3, 2),
  temas_débiles TEXT[],
  última_actualización TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(id_estudiante, materia)
);

-- Tabla para recomendaciones personalizadas
CREATE TABLE IF NOT EXISTS recomendaciones_personalizadas (
  id SERIAL PRIMARY KEY,
  id_estudiante INTEGER NOT NULL,
  tipo_recomendacion VARCHAR(100) NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT NOT NULL,
  materia_objetivo VARCHAR(100),
  nivel_urgencia VARCHAR(20),
  basada_en_patron VARCHAR(100),
  score_relevancia DECIMAL(3, 2),
  estado VARCHAR(20) DEFAULT 'activa',
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_seguimiento TIMESTAMP
);

-- Tabla para historial del chatbot
CREATE TABLE IF NOT EXISTS historial_chatbot_ia (
  id SERIAL PRIMARY KEY,
  id_estudiante INTEGER NOT NULL,
  mensaje_usuario TEXT NOT NULL,
  respuesta_chatbot TEXT NOT NULL,
  tema_detectado VARCHAR(100),
  nivel_respuesta VARCHAR(20),
  útil_para_estudiante BOOLEAN,
  fecha_interaccion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  sesion_id VARCHAR(100)
);

-- Índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_interacciones_estudiante ON estudiante_interacciones(id_estudiante);
CREATE INDEX IF NOT EXISTS idx_interacciones_materia ON estudiante_interacciones(materia_relacionada);
CREATE INDEX IF NOT EXISTS idx_interacciones_fecha ON estudiante_interacciones(hora_interaccion);

CREATE INDEX IF NOT EXISTS idx_patrones_estudiante ON analisis_patrones(id_estudiante);
CREATE INDEX IF NOT EXISTS idx_patrones_tipo ON analisis_patrones(patron_tipo);

CREATE INDEX IF NOT EXISTS idx_desempeño_estudiante ON desempeño_materia(id_estudiante);
CREATE INDEX IF NOT EXISTS idx_desempeño_materia ON desempeño_materia(materia);

CREATE INDEX IF NOT EXISTS idx_recomendaciones_estudiante ON recomendaciones_personalizadas(id_estudiante);
CREATE INDEX IF NOT EXISTS idx_recomendaciones_estado ON recomendaciones_personalizadas(estado);

CREATE INDEX IF NOT EXISTS idx_chatbot_estudiante ON historial_chatbot_ia(id_estudiante);
CREATE INDEX IF NOT EXISTS idx_chatbot_sesion ON historial_chatbot_ia(sesion_id);

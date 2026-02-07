const pool = require("../config/db.cjs");

// Diccionario de palabras clave para detectar materias
const MATERIAS_KEYWORDS = {
  "Cálculo": ["derivada", "integral", "limite", "función", "diferencial", "serie", "convergencia"],
  "Álgebra": ["matriz", "vector", "ecuación", "sistema", "polinomio", "factor", "raíz"],
  "Física": ["velocidad", "aceleración", "fuerza", "energía", "momento", "dinámica", "cinemática"],
  "Química": ["átomo", "molécula", "reacción", "elemento", "compuesto", "óxido", "ácido"],
  "Programación": ["variable", "función", "bucle", "condicional", "array", "objeto", "algoritmo"],
  "Estadística": ["media", "desviación", "distribución", "probabilidad", "varianza", "correlación"],
  "Geometría": ["ángulo", "triángulo", "círculo", "área", "volumen", "perímetro", "diagonal"]
};

// Palabras que indican dificultad o confusión
const CONFUSION_KEYWORDS = ["no entiendo", "confundido", "duda", "difícil", "no me sale", "ayuda", "explicar"];
const INTEREST_KEYWORDS = ["interesante", "cómo", "por qué", "ejemplo", "aplicación", "práctico"];

class ChatbotIAController {
  /**
   * Detecta la materia principal del mensaje del usuario
   */
  static detectarMateria(mensaje) {
    const mensajeLower = mensaje.toLowerCase();
    let materiaDetectada = null;
    let maxCoincidencias = 0;

    for (const [materia, keywords] of Object.entries(MATERIAS_KEYWORDS)) {
      const coincidencias = keywords.filter(kw => mensajeLower.includes(kw)).length;
      if (coincidencias > maxCoincidencias) {
        maxCoincidencias = coincidencias;
        materiaDetectada = materia;
      }
    }

    return materiaDetectada || "General";
  }

  /**
   * Detecta el sentimiento de la consulta
   */
  static detectarSentimiento(mensaje) {
    const mensajeLower = mensaje.toLowerCase();

    if (CONFUSION_KEYWORDS.some(kw => mensajeLower.includes(kw))) {
      return "confundido";
    }

    if (INTEREST_KEYWORDS.some(kw => mensajeLower.includes(kw))) {
      return "interesado";
    }

    if (mensajeLower.includes("frustrado") || mensajeLower.includes("desesperado")) {
      return "frustrado";
    }

    return "neutral";
  }

  /**
   * Determina la calidad de la pregunta
   */
  static determinarCalidadPregunta(mensaje) {
    const palabras = mensaje.split(" ").length;
    const tieneDetalles = mensaje.includes("?") || mensaje.includes("porque");
    const esEspecifica = palabras > 10 && tieneDetalles;

    if (esEspecifica) return "profunda";
    if (tieneDetalles && palabras > 5) return "intermedia";
    if (palabras > 3) return "basica";
    return "superficial";
  }

  /**
   * Registra una interacción del estudiante
   */
  static async registrarInteraccion(idEstudiante, contenido, materia, sentimiento, calidad) {
    try {
      const resultado = await pool.query(
        `INSERT INTO estudiante_interacciones
        (id_estudiante, tipo_interaccion, contenido, materia_relacionada, sentimiento_consulta, calidad_pregunta)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id`,
        [idEstudiante, "pregunta_chatbot", contenido, materia, sentimiento, calidad]
      );
      return resultado.rows[0];
    } catch (error) {
      console.error("Error registrando interacción:", error);
      throw error;
    }
  }

  /**
   * Actualiza el desempeño del estudiante por materia
   */
  static async actualizarDesempeñoMateria(idEstudiante, materia, calidad) {
    try {
      const consulta = await pool.query(
        `SELECT * FROM desempeño_materia WHERE id_estudiante = $1 AND materia = $2`,
        [idEstudiante, materia]
      );

      const calificacionNumerica = { "profunda": 1, "intermedia": 0.7, "basica": 0.4, "superficial": 0.2 }[calidad] || 0.5;

      if (consulta.rows.length === 0) {
        await pool.query(
          `INSERT INTO desempeño_materia (id_estudiante, materia, preguntas_totales, preguntas_respondidas, promedio_calidad)
          VALUES ($1, $2, $3, $4, $5)`,
          [idEstudiante, materia, 1, 1, calificacionNumerica]
        );
      } else {
        const registro = consulta.rows[0];
        const nuevaMedia =
          (registro.promedio_calidad * registro.preguntas_respondidas + calificacionNumerica) /
          (registro.preguntas_respondidas + 1);

        await pool.query(
          `UPDATE desempeño_materia
          SET preguntas_totales = preguntas_totales + 1,
              preguntas_respondidas = preguntas_respondidas + 1,
              promedio_calidad = $1,
              última_actualización = CURRENT_TIMESTAMP
          WHERE id_estudiante = $2 AND materia = $3`,
          [nuevaMedia, idEstudiante, materia]
        );
      }
    } catch (error) {
      console.error("Error actualizando desempeño:", error);
      throw error;
    }
  }

  /**
   * Analiza patrones de comportamiento del estudiante
   */
  static async analizarPatrones(idEstudiante) {
    try {
      const ultimosMeses = 30; // Últimos 30 días
      const resultados = await pool.query(
        `SELECT
          materia_relacionada,
          COUNT(*) as frecuencia,
          AVG(CASE WHEN sentimiento_consulta = 'confundido' THEN 1 ELSE 0 END) as tasa_dificultad,
          AVG(CASE WHEN EXTRACT(HOUR FROM hora_interaccion) BETWEEN 18 AND 21 THEN 1 ELSE 0 END) as pico_nocturno
        FROM estudiante_interacciones
        WHERE id_estudiante = $1 AND hora_interaccion > CURRENT_TIMESTAMP - INTERVAL '${ultimosMeses} days'
        GROUP BY materia_relacionada
        ORDER BY frecuencia DESC`,
        [idEstudiante]
      );

      return resultados.rows;
    } catch (error) {
      console.error("Error analizando patrones:", error);
      throw error;
    }
  }

  /**
   * Genera recomendaciones personalizadas basadas en patrones
   */
  static async generarRecomendaciones(idEstudiante) {
    try {
      const patrones = await this.analizarPatrones(idEstudiante);

      if (patrones.length === 0) return [];

      const recomendaciones = [];

      for (const patron of patrones) {
        if (patron.tasa_dificultad > 0.5) {
          // Si tiene muchas dudas en una materia, recomendar práctica
          recomendaciones.push({
            tipo: "estrategia_estudio",
            titulo: `Mejora tu comprensión en ${patron.materia_relacionada}`,
            descripcion: `Detectamos que tienes dudas frecuentes en ${patron.materia_relacionada}. Te recomendamos hacer ejercicios prácticos y revisar conceptos fundamentales.`,
            materia: patron.materia_relacionada,
            urgencia: "alta",
            patron: "tasa_alta_confusión"
          });
        }

        if (patron.frecuencia > 5) {
          // Si consulta mucho sobre una materia
          recomendaciones.push({
            tipo: "recurso_externo",
            titulo: `Profundiza en ${patron.materia_relacionada}`,
            descripcion: `Observamos que ${patron.materia_relacionada} es tu área de mayor interés. Aquí hay recursos avanzados para ampliar tus conocimientos.`,
            materia: patron.materia_relacionada,
            urgencia: "media",
            patron: "interes_alto"
          });
        }
      }

      // Guardar recomendaciones en la BD
      for (const rec of recomendaciones) {
        await pool.query(
          `INSERT INTO recomendaciones_personalizadas
          (id_estudiante, tipo_recomendacion, titulo, descripcion, materia_objetivo, nivel_urgencia, basada_en_patron, score_relevancia)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            idEstudiante,
            rec.tipo,
            rec.titulo,
            rec.descripcion,
            rec.materia,
            rec.urgencia,
            rec.patron,
            0.85
          ]
        );
      }

      return recomendaciones;
    } catch (error) {
      console.error("Error generando recomendaciones:", error);
      throw error;
    }
  }

  /**
   * Genera una respuesta inteligente del chatbot
   */
  static generarRespuestaInteligente(materia, sentimiento, calidad) {
    const respuestas = {
      "profunda": {
        "confundido": `Excelente pregunta profunda sobre ${materia}. Veo que tienes interés en entender bien este tema. Te sugiero que:\n1. Revises los conceptos fundamentales\n2. Hagas ejercicios prácticos paso a paso\n3. Consultes con tu asesor sobre los puntos específicos.`,
        "interesado": `Muy bien, tu pregunta demuestra curiosidad académica. Para ${materia}, te recomiendo:\n1. Estudiar ejemplos reales\n2. Resolver ejercicios avanzados\n3. Explorar aplicaciones prácticas del concepto.`,
        "neutral": `Tu pregunta muestra buen análisis en ${materia}. Para profundizar:\n1. Estudia casos de uso específicos\n2. Resuelve problemas complejos\n3. Relaciona con otras áreas de estudio.`
      },
      "intermedia": {
        "confundido": `Entiendo tu duda sobre ${materia}. Aquí está el plan:\n1. Repasa los conceptos clave\n2. Haz ejercicios guiados\n3. Pide ayuda a tu asesor si es necesario.`,
        "interesado": `Buena pregunta sobre ${materia}. Te recomiendo:\n1. Consultar ejemplos prácticos\n2. Resolver ejercicios variados\n3. Unir conceptos relacionados.`,
        "neutral": `Para mejorar en ${materia}:\n1. Practica regularmente\n2. Resuelve ejercicios variados\n3. Revisa tus errores.`
      },
      "basica": {
        "confundido": `No te preocupes, ${materia} requiere paciencia. Comienza:\n1. Desde conceptos muy básicos\n2. Con ejercicios simples\n3. Aumentando gradualmente la dificultad.`,
        "interesado": `Te motiva ${materia}, excelente. Continúa con:\n1. Ejercicios introductorios\n2. Lectura de conceptos\n3. Práctica consistente.`,
        "neutral": `Para aprender ${materia}:\n1. Empieza con lo básico\n2. Practica frecuentemente\n3. Incrementa la dificultad gradualmente.`
      }
    };

    const nivelCalidad = Object.keys(respuestas).find(k => k === calidad) || "basica";
    const tipo = sentimiento || "neutral";

    return respuestas[nivelCalidad]?.[tipo] || respuestas["basica"]["neutral"];
  }

  /**
   * Procesa un mensaje del chatbot
   */
  static async procesarMensaje(idEstudiante, mensaje) {
    try {
      // 1. Detectar materia
      const materia = this.detectarMateria(mensaje);

      // 2. Detectar sentimiento
      const sentimiento = this.detectarSentimiento(mensaje);

      // 3. Determinar calidad
      const calidad = this.determinarCalidadPregunta(mensaje);

      // 4. Registrar interacción
      await this.registrarInteraccion(idEstudiante, mensaje, materia, sentimiento, calidad);

      // 5. Actualizar desempeño
      await this.actualizarDesempeñoMateria(idEstudiante, materia, calidad);

      // 6. Generar respuesta
      const respuesta = this.generarRespuestaInteligente(materia, sentimiento, calidad);

      // 7. Generar recomendaciones
      const recomendaciones = await this.generarRecomendaciones(idEstudiante);

      return {
        respuesta,
        materia,
        sentimiento,
        calidad,
        recomendaciones
      };
    } catch (error) {
      console.error("Error procesando mensaje:", error);
      throw error;
    }
  }

  /**
   * Obtiene resumen de desempeño del estudiante
   */
  static async obtenerResumenDesempeño(idEstudiante) {
    try {
      const resultado = await pool.query(
        `SELECT
          materia,
          preguntas_totales,
          preguntas_respondidas,
          promedio_calidad,
          temas_débiles,
          última_actualización
        FROM desempeño_materia
        WHERE id_estudiante = $1
        ORDER BY promedio_calidad ASC`,
        [idEstudiante]
      );

      return resultado.rows;
    } catch (error) {
      console.error("Error obteniendo resumen:", error);
      throw error;
    }
  }

  /**
   * Obtiene recomendaciones activas
   */
  static async obtenerRecomendacionesActivas(idEstudiante) {
    try {
      const resultado = await pool.query(
        `SELECT * FROM recomendaciones_personalizadas
        WHERE id_estudiante = $1 AND estado = 'activa'
        ORDER BY nivel_urgencia DESC, fecha_creacion DESC
        LIMIT 10`,
        [idEstudiante]
      );

      return resultado.rows;
    } catch (error) {
      console.error("Error obteniendo recomendaciones:", error);
      throw error;
    }
  }

  /**
   * Guarda el historial de conversación
   */
  static async guardarHistorialChatbot(idEstudiante, mensajeUsuario, respuestaBot, temaNDetectado, sesionId) {
    try {
      await pool.query(
        `INSERT INTO historial_chatbot_ia (id_estudiante, mensaje_usuario, respuesta_chatbot, tema_detectado, sesion_id)
        VALUES ($1, $2, $3, $4, $5)`,
        [idEstudiante, mensajeUsuario, respuestaBot, temaNDetectado, sesionId]
      );
    } catch (error) {
      console.error("Error guardando historial:", error);
      throw error;
    }
  }
}

module.exports = ChatbotIAController;

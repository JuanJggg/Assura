# Documentación - Chatbot Inteligente con IA Adaptativa

## Descripción General

El Chatbot Inteligente es un asistente académico basado en IA que analiza el comportamiento del estudiante y proporciona recomendaciones personalizadas para mejorar su desempeño académico. El sistema aprende continuamente de las interacciones del usuario y se adapta a sus necesidades específicas.

## Características Principales

### 1. **Análisis Inteligente de Comportamiento**
- Rastrea todas las interacciones del estudiante
- Identifica patrones de estudio y consulta
- Detecta materias problemáticas
- Analiza el sentimiento y nivel de dificultad de las preguntas

### 2. **Detección Automática de Materias**
- NLP básico para identificar temas académicos
- Palabras clave específicas por materia
- Soporta: Cálculo, Álgebra, Física, Química, Programación, Estadística, Geometría

### 3. **Generación de Recomendaciones Personalizadas**
- Recomendaciones basadas en patrones detectados
- Niveles de urgencia (alta, media, baja)
- Estrategias de estudio personalizadas
- Recursos externos recomendados

### 4. **Análisis de Desempeño por Materia**
- Calificación de calidad de preguntas
- Historial de consultas por tema
- Identificación de temas débiles
- Progreso en el tiempo

## Arquitectura del Sistema

### Base de Datos

```
Tablas principales:
├── estudiante_interacciones
│   ├── id
│   ├── id_estudiante
│   ├── tipo_interaccion
│   ├── contenido
│   ├── materia_relacionada
│   ├── sentimiento_consulta (confundido, interesado, frustrado, neutral)
│   ├── calidad_pregunta (superficial, básica, intermedia, profunda)
│   └── hora_interaccion
│
├── analisis_patrones
│   ├── id
│   ├── id_estudiante
│   ├── patron_tipo
│   ├── descripcion
│   ├── valor_numerico
│   ├── confianza (0.0 - 1.0)
│   └── metadatos (JSONB)
│
├── desempeño_materia
│   ├── id
│   ├── id_estudiante
│   ├── materia
│   ├── preguntas_totales
│   ├── preguntas_respondidas
│   ├── promedio_calidad
│   └── temas_débiles (array)
│
├── recomendaciones_personalizadas
│   ├── id
│   ├── id_estudiante
│   ├── tipo_recomendacion
│   ├── titulo
│   ├── descripcion
│   ├── materia_objetivo
│   ├── nivel_urgencia
│   ├── score_relevancia
│   └── estado (activa, completada, archivada)
│
└── historial_chatbot_ia
    ├── id
    ├── id_estudiante
    ├── mensaje_usuario
    ├── respuesta_chatbot
    ├── tema_detectado
    ├── útil_para_estudiante
    └── sesion_id
```

### Backend (Node.js)

**Controlador Principal:** `backend/controllers/chatbot-ia.controller.cjs`

Métodos clave:

```javascript
// Detecta la materia del mensaje
static detectarMateria(mensaje) → "Cálculo" | "Álgebra" | ...

// Detecta el sentimiento (confundido, interesado, etc.)
static detectarSentimiento(mensaje) → string

// Determina calidad de la pregunta
static determinarCalidadPregunta(mensaje) → "profunda" | "intermedia" | "basica" | "superficial"

// Procesa un mensaje completo
static async procesarMensaje(idEstudiante, mensaje) → {
  respuesta,
  materia,
  sentimiento,
  calidad,
  recomendaciones
}

// Analiza patrones de comportamiento
static async analizarPatrones(idEstudiante) → patrones[]

// Genera recomendaciones
static async generarRecomendaciones(idEstudiante) → recomendaciones[]
```

**Rutas:** `backend/routes/chatbot-ia.routes.cjs`

```
POST /chatbot-ia/procesar-mensaje
  Body: { idEstudiante, mensaje, sesionId }
  Respuesta: { respuesta, materia, sentimiento, calidad, recomendaciones }

GET /chatbot-ia/resumen-desempeño/:idEstudiante
  Respuesta: { desempeño[] }

GET /chatbot-ia/recomendaciones/:idEstudiante
  Respuesta: { recomendaciones[] }

GET /chatbot-ia/analizar-patrones/:idEstudiante
  Respuesta: { patrones[] }
```

### Frontend (React)

**Componente:** `src/components/chatbot/ChatbotIA.jsx`

Características:
- Chat interactivo en tiempo real
- Panel lateral con análisis de desempeño
- Recomendaciones personalizadas en tiempo real
- Patrones detectados automáticamente
- Indicadores de sentimiento y materia

## Flujo de Funcionamiento

### 1. Estudiante Envía Mensaje

```javascript
// El usuario escribe y envía un mensaje
const mensaje = "No entiendo cómo calcular la derivada de una función compuesta";
```

### 2. Sistema Procesa el Mensaje

```
1. Detecta Materia: "Cálculo" (por palabra clave "derivada")
2. Detecta Sentimiento: "confundido" (por "no entiendo")
3. Determina Calidad: "profunda" (pregunta detallada)
4. Registra Interacción en BD
5. Actualiza Desempeño en "Cálculo"
6. Genera Respuesta Adaptada
7. Analiza Patrones
8. Crea Recomendaciones si es necesario
```

### 3. Respuesta Inteligente

El sistema genera una respuesta basada en:
- **Materia**: Contexto académico
- **Sentimiento**: Tono empático
- **Calidad**: Profundidad de la explicación

Ejemplo de respuesta para pregunta profunda + confundido:
```
"Excelente pregunta profunda sobre Cálculo. Veo que tienes interés
en entender bien este tema. Te sugiero que:
1. Revises los conceptos fundamentales
2. Hagas ejercicios prácticos paso a paso
3. Consultes con tu asesor sobre los puntos específicos."
```

### 4. Actualización de Análisis

```
- Registra en historial_chatbot_ia
- Actualiza promedio_calidad en desempeño_materia
- Analiza patrones globales del estudiante
- Genera/actualiza recomendaciones si hay cambios significativos
```

## Algoritmos de IA

### 1. Detección de Materias (NLP Básico)

```javascript
MATERIAS_KEYWORDS = {
  "Cálculo": ["derivada", "integral", "límite", "función", ...],
  "Álgebra": ["matriz", "vector", "ecuación", "sistema", ...],
  ...
}

// Algoritmo: Cuenta coincidencias de palabras clave
// La materia con más coincidencias es la detectada
```

### 2. Análisis de Sentimiento

```javascript
Reglas:
- Si contiene: ["no entiendo", "duda", "confundido", ...]
  → Sentimiento = "confundido"

- Si contiene: ["interesante", "cómo", "por qué", "aplicación", ...]
  → Sentimiento = "interesado"

- Si contiene: ["frustrado", "desesperado"]
  → Sentimiento = "frustrado"

- Por defecto: "neutral"
```

### 3. Evaluación de Calidad de Pregunta

```javascript
- Profunda:   > 10 palabras + detalles + puntuación
- Intermedia: > 5 palabras + algunos detalles
- Básica:     > 3 palabras
- Superficial: < 3 palabras
```

### 4. Generación de Recomendaciones

```javascript
Reglas:
1. Si tasa_dificultad > 0.5 en una materia
   → Recomendar práctica intensiva

2. Si frecuencia_consulta > 5 en una materia
   → Recomendar recursos avanzados

3. Se crean automáticamente y se guardan en BD
```

## Métricas y Análisis

### Desempeño por Materia

```
{
  materia: "Cálculo",
  preguntas_totales: 15,
  preguntas_respondidas: 15,
  promedio_calidad: 0.75,
  temas_débiles: ["derivadas parciales", "integrales impropias"],
  última_actualización: "2024-02-07T10:30:00Z"
}
```

### Patrones Detectados

```
{
  materia_relacionada: "Cálculo",
  frecuencia: 8,           // 8 preguntas sobre Cálculo
  tasa_dificultad: 0.65,   // 65% de confusión
  pico_nocturno: 0.75      // 75% de consultas por la noche
}
```

## API de Integración

### Procesar Mensaje

```bash
curl -X POST http://localhost:3001/chatbot-ia/procesar-mensaje \
  -H "Content-Type: application/json" \
  -d '{
    "idEstudiante": 1,
    "mensaje": "¿Cómo se calcula la integral definida?",
    "sesionId": "sesion-1707300000000"
  }'
```

Respuesta:
```json
{
  "ok": true,
  "respuesta": "Tu pregunta demuestra buen análisis en Cálculo...",
  "materia": "Cálculo",
  "sentimiento": "interesado",
  "calidad": "profunda",
  "recomendaciones": [
    {
      "id": 1,
      "tipo_recomendacion": "estrategia_estudio",
      "titulo": "Mejora tu comprensión en Cálculo",
      "materia_objetivo": "Cálculo",
      "nivel_urgencia": "media"
    }
  ]
}
```

### Obtener Desempeño

```bash
curl http://localhost:3001/chatbot-ia/resumen-desempeño/1
```

### Obtener Recomendaciones

```bash
curl http://localhost:3001/chatbot-ia/recomendaciones/1
```

### Analizar Patrones

```bash
curl http://localhost:3001/chatbot-ia/analizar-patrones/1
```

## Casos de Uso

### 1. Estudiante Confundido en una Materia

**Input:**
```
"No entiendo nada de álgebra lineal, especialmente las matrices"
```

**Detección:**
- Materia: Álgebra
- Sentimiento: confundido
- Calidad: intermedia

**Respuesta:**
```
"Entiendo tu duda sobre Álgebra. Aquí está el plan:
1. Repasa los conceptos clave
2. Haz ejercicios guiados
3. Pide ayuda a tu asesor si es necesario"
```

**Recomendación Generada:**
- Tipo: estrategia_estudio
- Urgencia: alta
- Descripción: "Detectamos que tienes dudas frecuentes en Álgebra..."

### 2. Estudiante Muy Interesado

**Input:**
```
"¿Cuáles son las aplicaciones prácticas de las integrales dobles?"
```

**Detección:**
- Materia: Cálculo
- Sentimiento: interesado
- Calidad: profunda

**Respuesta:**
```
"Muy bien, tu pregunta demuestra curiosidad académica. Para Cálculo:
1. Estudia ejemplos reales
2. Resuelve ejercicios avanzados
3. Explora aplicaciones prácticas"
```

**Recomendación Generada:**
- Tipo: recurso_externo
- Urgencia: media
- Descripción: "Observamos que Cálculo es tu área de mayor interés..."

## Mejoras Futuras

1. **NLP Mejorado**
   - Procesamiento de lenguaje natural más avanzado
   - Análisis de sintaxis y semántica
   - Detección de conceptos relacionados

2. **Machine Learning**
   - Modelos de clasificación entrenables
   - Predicción de calificaciones
   - Recomendación de tutores basada en datos

3. **Integración con IA Generativa**
   - Respuestas más naturales y conversacionales
   - Generación de ejemplos personalizados
   - Explicaciones adaptativas

4. **Gamificación**
   - Sistema de puntos y badges
   - Desafíos personalizados
   - Competencias académicas

5. **Análisis Predictivo**
   - Predicción de riesgo académico
   - Alertas tempranas para bajo desempeño
   - Sugerencias preventivas

6. **Exportación de Reportes**
   - Reportes PDF de desempeño
   - Gráficos de progreso
   - Planes de mejora descargables

## Cómo Usar

### Para Estudiantes

1. **Acceder al Chatbot IA**
   - Ir a Menu → "Asistente IA"
   - O navegar a `/ChatbotIA`

2. **Hacer Preguntas**
   - Escribir cualquier pregunta académica
   - El chatbot analizará automáticamente
   - Recibirá respuesta personalizada

3. **Ver Análisis**
   - Pestaña "Análisis" muestra desempeño
   - Patrones detectados automáticamente
   - Progreso por materia

4. **Recibir Recomendaciones**
   - Pestaña "Recomendaciones" muestra sugerencias
   - Se actualizan automáticamente
   - Clasificadas por urgencia

## Estructura de Archivos

```
src/
├── components/
│   └── chatbot/
│       └── ChatbotIA.jsx          (Componente principal del chatbot)
│
backend/
├── controllers/
│   └── chatbot-ia.controller.cjs   (Lógica de IA)
├── routes/
│   └── chatbot-ia.routes.cjs       (Endpoints del API)
└── index.cjs                       (Servidor principal)

Database:
├── estudiante_interacciones
├── analisis_patrones
├── desempeño_materia
├── recomendaciones_personalizadas
└── historial_chatbot_ia
```

## Troubleshooting

### El chatbot no responde

**Verificar:**
1. Backend está corriendo: `npm start` en carpeta backend
2. Base de datos conectada correctamente
3. Consola del navegador no muestra errores

### Recomendaciones no aparecen

**Verificar:**
1. Hacer varias preguntas para generar patrones
2. Patrones requieren mínimo 30 días de datos
3. Revisar estado en BD: debe ser 'activa'

### Materia no se detecta correctamente

**Verificar:**
1. Usar palabras clave específicas
2. Escribir palabras completas (no abreviaturas)
3. Revisar lista de palabras clave en controller

## Soporte

Para reportar bugs o sugerencias, contactar al equipo de desarrollo.

## Licencia

Sistema propietario de Assura - Todos los derechos reservados

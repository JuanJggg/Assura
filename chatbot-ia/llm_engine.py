import os
import json
import google.generativeai as genai
from dotenv import load_dotenv

# Cargar variables de entorno desde la raíz del proyecto
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    
# Configuración del modelo — optimizada para velocidad
generation_config = {
    "temperature": 0.7,
    "top_p": 0.95,
    "top_k": 40,
    "max_output_tokens": 2048,
    "response_mime_type": "application/json",
}

if GEMINI_API_KEY:
    model = genai.GenerativeModel(
        model_name="gemini-2.0-flash-lite",
        generation_config=generation_config,
    )
else:
    model = None

SYSTEM_PROMPT = """
Eres Assura IA, el profesor y asesor académico virtual de la plataforma escolar Assura.
Tu misión es ayudar a estudiantes a resolver dudas, enseñarles conceptos, proporcionarles ejercicios y aconsejarles sobre métodos de estudio.
Debes actuar como un tutor paciente, motivador, empático y MUY inteligente. 
Conoces de TODAS las materias (Matemáticas, Física, Programación, Química, Historia, Economía, Biología, etc.) y puedes resolver CUALQUIER ejercicio.

DEBES responder SIEMPRE en formato JSON válido con la siguiente estructura exacta:
{
    "respuesta": "Tu respuesta conversacional en formato Markdown. Usa emojis, sé empático y estructura bien la información usando negritas y viñetas.",
    "intencion": "Una palabra clave corta que describa la intención (ej. explicacion, resolucion, generacion_ejercicio, saludo, motivacion, tecnica_estudio, general)",
    "categoria": "La materia o tema principal abordado (ej. matematicas, fisica, programacion, quimica, bienestar, general)",
    "recursos": ["Lista de 1 a 3 frases cortas de recursos o temas relacionados que el estudiante podría explorar o buscar"],
    "consejo_rapido": "Un tip corto de estudio o motivación",
    "ejercicio_data": {
        "tipo_accion": "generacion o resolucion (usa este campo SOLO si aplicaste matemáticas o código para resolver o crear un problema. Si no, debe ser nulo o ignorado)",
        "ejercicio": {
            "enunciado": "El problema exacto",
            "solucion": {
                "pasos": ["Paso 1: ...", "Paso 2: ..."],
                "resultado": "El resultado final corto"
            }
        }
    }
}

IMPORTANTE SOBRE EJERCICIOS:
1. Si el usuario te ENVÍA un ejercicio para resolver, resuelve el problema paso a paso dentro del objeto `ejercicio_data` y en `respuesta` da una explicación amigable o análisis de la respuesta.
2. Si el usuario TE PIDE un ejercicio para practicar, invéntate un ejercicio completo, ponlo en `ejercicio_data` (con enunciado, pasos y solución), y en `respuesta` anímale a intentarlo antes de mirar los pasos.
3. Si el usuario SÓLO pregunta conceptos, charla, pide tips de estudio, etc., entonces omite por completo el `ejercicio_data` (envía `null`).
"""

def generar_respuesta_chat(mensaje: str, historial: list, nombre_estudiante: str = ""):
    if not model:
        return {"error": "API Key de Gemini no configurada."}
    
    # Construir el prompt con historial
    prompt = f"{SYSTEM_PROMPT}\n\n"
    if nombre_estudiante:
        prompt += f"Nombre del estudiante (trátalo por su nombre): {nombre_estudiante}\n\n"
        
    prompt += "Historial reciente de la conversación (para contexto):\n"
    for msg in historial[-4:]:  # Últimos 4 mensajes (menos contexto = más rápido)
        rol = "Estudiante" if msg.get("role") == "user" else "Assura IA"
        prompt += f"{rol}: {msg.get('content')}\n"
        
    prompt += f"\n---\nNUEVO MENSAJE DEL ESTUDIANTE: {mensaje}\n"
    prompt += "Genera tu respuesta como JSON:"
    
    try:
        response = model.generate_content(
            prompt,
            request_options={"timeout": 15},
        )
        text = response.text
        if text.strip().startswith("```json"):
            text = text.strip()[7:-3].strip()
        return json.loads(text)
    except Exception as e:
        print(f"⚠️ Error en LLM: {e}")
        return None

def generar_ejercicio_materia(materia: str, dificultad: str):
    if not model:
        return None
        
    prompt = f"""
Eres el generador de ejercicios de Assura.
Genera un problema académico de la materia '{materia}' con dificultad '{dificultad}'.
Debes devolver ÚNICAMENTE un JSON válido con esta estructura (nada más):
{{
    "materia": "{materia}",
    "dificultad": "{dificultad}",
    "enunciado": "El problema o pregunta",
    "solucion": {{
        "exito": true,
        "materia": "{materia}",
        "tipo": "problema generado por IA",
        "expresion": "La ecuación original o pregunta clave",
        "resultado": "El resultado final o respuesta en pocas palabras",
        "pasos": [
            "Paso 1: ...",
            "Paso 2: ...",
            "Paso 3: ..."
        ]
    }}
}}
"""
    try:
        response = model.generate_content(
            prompt,
            request_options={"timeout": 15},
        )
        text = response.text
        if text.strip().startswith("```json"):
            text = text.strip()[7:-3].strip()
        return json.loads(text)
    except Exception as e:
        print(f"⚠️ Error en LLM ejercicio: {e}")
        return None

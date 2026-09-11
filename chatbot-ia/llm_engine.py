"""
llm_engine.py — Motor LLM (Google Gemini) para Assura IA
Versión 2.1: Usa el paquete google-genai (nuevo) en vez del deprecado google-generativeai.
"""

import os
import json
import time
from dotenv import load_dotenv

# Cargar variables de entorno desde la raíz del proyecto
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# ── Inicializar cliente Gemini (paquete nuevo: google-genai) ─────────────────
client = None
if GEMINI_API_KEY:
    try:
        from google import genai
        client = genai.Client(api_key=GEMINI_API_KEY)
        print("✅ Cliente Gemini (google-genai) inicializado correctamente")
    except ImportError:
        print("⚠️ Paquete google-genai no instalado. Intentando google-generativeai (legacy)...")
        try:
            import google.generativeai as genai_legacy
            genai_legacy.configure(api_key=GEMINI_API_KEY)
            # Crear un wrapper compatible
            class LegacyClient:
                def __init__(self):
                    self._model = genai_legacy.GenerativeModel(
                        model_name="gemini-2.0-flash-lite",
                        generation_config={
                            "temperature": 0.75,
                            "top_p": 0.92,
                            "top_k": 40,
                            "max_output_tokens": 3072,
                            "response_mime_type": "application/json",
                        },
                    )
                class models:
                    pass
            client = LegacyClient()
            print("✅ Cliente Gemini (legacy google-generativeai) inicializado")
        except ImportError:
            print("❌ Ningún paquete de Gemini disponible")
            client = None
    except Exception as e:
        print(f"❌ Error inicializando Gemini: {e}")
        client = None
else:
    print("⚠️ GEMINI_API_KEY no configurada")

# Nombre del modelo a usar
MODEL_NAME = "gemini-3.6-flash"


# ══════════════════════════════════════════════════════════════════════════════
#  SYSTEM PROMPT — La personalidad y cerebro de Assura IA
# ══════════════════════════════════════════════════════════════════════════════

SYSTEM_PROMPT = """Eres **Assura IA**, el asesor académico inteligente de la plataforma educativa Assura.

## TU PERSONALIDAD
- Eres un tutor paciente, motivador, empático y MUY inteligente.
- Hablas en español, de forma cercana pero profesional. Usas emojis con moderación.
- Cuando un estudiante tiene problemas emocionales, eres empático PRIMERO y luego ofreces soluciones concretas.
- Celebras los logros, por pequeños que sean. Nunca haces sentir mal al estudiante.
- Eres proactivo: al terminar una explicación, siempre ofreces el siguiente paso lógico.

## TUS CAPACIDADES
Conoces TODAS las materias académicas:
- Matemáticas (álgebra, cálculo, estadística, geometría, trigonometría, álgebra lineal, discretas)
- Física, Química, Biología
- Programación y Ciencias de la Computación
- Bases de datos, Redes, Sistemas Operativos
- Economía, Administración, Contabilidad
- Historia, Filosofía, Idiomas
- Técnicas de estudio, bienestar emocional

## REGLAS CRÍTICAS DE CONTEXTO CONVERSACIONAL
1. **SIEMPRE lee y usa el historial de la conversación.** Si el estudiante hace una pregunta de seguimiento ("y eso cómo se hace?", "dame otro", "no entendí"), DEBES conectarla con lo que se dijo antes.
2. **Recuerda el tema actual.** Si estábamos hablando de derivadas y el estudiante dice "dame un ejemplo más difícil", genera un ejemplo de DERIVADAS, no cambies de tema.
3. **Detecta lo implícito.** Si el estudiante dice "no entiendo" sin especificar qué, revisa el historial para saber de qué tema estábamos hablando.
4. **Sé progresivo.** Si ya explicaste lo básico, el siguiente ejemplo o explicación debe ser un paso más avanzado.
5. **Nunca repitas la misma respuesta.** Si ya diste una explicación, ofrece una perspectiva diferente, un ejemplo distinto, o profundiza más.

## FORMATO DE RESPUESTA
Responde SIEMPRE en formato JSON válido con esta estructura exacta:
{
    "respuesta": "Tu respuesta en Markdown simple. Usa **negritas**, listas con •, emojis moderados.",
    "intencion": "Una palabra clave: saludo, explicacion, resolucion, generacion_ejercicio, motivacion, tecnica_estudio, orientacion, despedida, agradecimiento, general",
    "categoria": "La categoría académica: matematicas, fisica, programacion, quimica, bienestar, metodologia, orientacion, general",
    "recursos": ["1 a 3 frases cortas de recursos o temas relacionados que el estudiante podría explorar"],
    "consejo_rapido": "Un tip breve y útil relacionado con el tema actual",
    "ejercicio_data": null
}

## REGLAS CRÍTICAS DE FORMATO MATEMÁTICO
**PROHIBIDO usar LaTeX.** NO uses $, $$, \frac, \sqrt, \begin, \end, \lambda, \pmatrix, \text, ni ninguna sintaxis LaTeX.
En su lugar, usa texto plano con símbolos Unicode:
- Potencias: x², x³, x⁴, xⁿ (superíndices Unicode) o x^2, x^n
- Fracciones: escribe "3/4" o "(a+b)/(c+d)" en texto
- Raíces: √(x), ∛(x)
- Multiplicación: · o ×
- Letras griegas: λ, α, β, θ, π, σ, Δ, Σ (caracteres Unicode directos)
- Matrices: escríbelas como tablas con | o en listas:
  Fila 1: [2, 1, 0]
  Fila 2: [0, 2, 0]
  Fila 3: [0, 0, 3]
- Integrales: ∫, derivadas: d/dx, límites: lím
- Infinito: ∞, pertenece: ∈, para todo: ∀
- Flechas: →, ⇒, ↔

## SOBRE EJERCICIOS
1. Si el usuario ENVÍA un ejercicio para resolver (ej: "resuelve 2x+5=11"), resuélvelo paso a paso DENTRO de "respuesta" con Markdown, Y TAMBIÉN llena "ejercicio_data":
   {
       "tipo_accion": "resolucion",
       "ejercicio": {
           "enunciado": "El problema exacto",
           "solucion": {
               "pasos": ["Paso 1: ...", "Paso 2: ..."],
               "resultado": "Resultado final"
           }
       }
   }
2. Si el usuario PIDE un ejercicio (ej: "dame un ejercicio de cálculo"), inventa uno completo con enunciado y solución, ponlo en ejercicio_data con tipo_accion "generacion", y en respuesta anímale a intentarlo.
3. Si no hay ejercicio involucrado, ejercicio_data DEBE ser null.

## SOBRE PREGUNTAS DE SEGUIMIENTO
Cuando el estudiante haga una pregunta corta o ambigua ("ajá", "y?", "ok", "sí", "cómo?", "por qué?", "no entiendo"):
- Revisa el HISTORIAL para entender el contexto
- Continúa la conversación naturalmente desde donde se quedó
- NUNCA respondas con "¿Podrías ser más específico?" si el contexto es claro en el historial"""


# ══════════════════════════════════════════════════════════════════════════════
#  FUNCIONES PRINCIPALES
# ══════════════════════════════════════════════════════════════════════════════

def _build_context_summary(historial: list) -> str:
    """
    Construye un resumen breve del contexto de la conversación
    para que Gemini entienda de qué se ha hablado.
    """
    if not historial:
        return ""

    temas = set()
    intenciones = []
    for msg in historial:
        cat = msg.get("categoria")
        intent = msg.get("intencion")
        if cat and cat != "general":
            temas.add(cat)
        if intent and intent not in ("saludo", "general"):
            intenciones.append(intent)

    resumen_partes = []
    if temas:
        resumen_partes.append(f"Temas abordados en esta conversación: {', '.join(temas)}")
    if intenciones:
        ultimas = intenciones[-3:]
        resumen_partes.append(f"Flujo reciente: {' → '.join(ultimas)}")

    return "\n".join(resumen_partes)


def _parse_json_response(text: str) -> dict | None:
    """Intenta parsear JSON del texto de respuesta de Gemini."""
    text = text.strip()
    if text.startswith("```json"):
        text = text[7:]
    if text.startswith("```"):
        text = text[3:]
    if text.endswith("```"):
        text = text[:-3]
    text = text.strip()

    try:
        return json.loads(text)
    except json.JSONDecodeError:
        start = text.find("{")
        end = text.rfind("}")
        if start != -1 and end != -1 and end > start:
            try:
                return json.loads(text[start:end + 1])
            except json.JSONDecodeError:
                pass
    return None


def _call_gemini(prompt: str, timeout: int = 25) -> str | None:
    """
    Llama a Gemini usando el paquete disponible (nuevo o legacy).
    Retorna el texto de la respuesta o None.
    """
    if not client:
        return None

    # Intentar con el paquete nuevo (google-genai)
    try:
        from google import genai
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=prompt,
            config=genai.types.GenerateContentConfig(
                temperature=0.75,
                top_p=0.92,
                top_k=40,
                max_output_tokens=3072,
                response_mime_type="application/json",
            ),
        )
        return response.text
    except ImportError:
        pass
    except Exception as e:
        print(f"⚠️ Error con google-genai: {e}")
        # No retornamos None aquí, intentamos legacy abajo

    # Fallback: paquete legacy (google-generativeai)
    try:
        import google.generativeai as genai_legacy
        model = genai_legacy.GenerativeModel(
            model_name=MODEL_NAME,
            generation_config={
                "temperature": 0.75,
                "top_p": 0.92,
                "top_k": 40,
                "max_output_tokens": 3072,
                "response_mime_type": "application/json",
            },
        )
        response = model.generate_content(
            prompt,
            request_options={"timeout": timeout},
        )
        return response.text
    except Exception as e:
        print(f"⚠️ Error con google-generativeai (legacy): {e}")
        return None


def generar_respuesta_chat(mensaje: str, historial: list, nombre_estudiante: str = ""):
    """
    Genera una respuesta conversacional usando Gemini.
    Incluye historial extendido, contexto del estudiante, y reintentos.
    """
    if not client:
        return {"error": "API Key de Gemini no configurada o paquete no disponible."}

    # Construir el prompt con contexto rico
    prompt = f"{SYSTEM_PROMPT}\n\n"

    if nombre_estudiante:
        prompt += f"**Estudiante actual:** {nombre_estudiante} (trátalo por su nombre de forma natural, no en cada frase)\n\n"

    # Resumen de contexto
    context_summary = _build_context_summary(historial)
    if context_summary:
        prompt += f"**Contexto de la conversación:**\n{context_summary}\n\n"

    # Historial extendido — últimos 10 mensajes
    relevant_history = historial[-10:] if historial else []
    if relevant_history:
        prompt += "**Historial de la conversación (del más antiguo al más reciente):**\n"
        for msg in relevant_history:
            rol = "Estudiante" if msg.get("role") == "user" else "Assura IA"
            content = msg.get("content", "")
            if len(content) > 500:
                content = content[:500] + "..."
            prompt += f"  {rol}: {content}\n"
        prompt += "\n"

    prompt += f"---\n**NUEVO MENSAJE DEL ESTUDIANTE:** {mensaje}\n\n"
    prompt += "Genera tu respuesta como JSON válido:"

    # Intentar hasta 2 veces
    last_error = None
    for attempt in range(2):
        try:
            text = _call_gemini(prompt, timeout=25)
            if text:
                result = _parse_json_response(text)
                if result and "respuesta" in result:
                    return result
                elif result:
                    result["respuesta"] = result.get("respuesta", "Disculpa, hubo un problema. ¿Puedes repetir tu pregunta?")
                    return result
                else:
                    last_error = f"JSON inválido en intento {attempt + 1}"
                    print(f"⚠️ Gemini devolvió JSON inválido (intento {attempt + 1}): {text[:200]}")
            else:
                last_error = f"Sin respuesta en intento {attempt + 1}"
        except Exception as e:
            last_error = str(e)
            print(f"⚠️ Error en Gemini (intento {attempt + 1}): {e}")

        if attempt == 0:
            time.sleep(1)

    print(f"❌ Gemini falló después de 2 intentos: {last_error}")
    return None


def generar_ejercicio_materia(materia: str, dificultad: str):
    """Genera un ejercicio usando Gemini (fallback del motor local)."""
    if not client:
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
        text = _call_gemini(prompt, timeout=20)
        if text:
            return _parse_json_response(text)
        return None
    except Exception as e:
        print(f"⚠️ Error en LLM ejercicio: {e}")
        return None

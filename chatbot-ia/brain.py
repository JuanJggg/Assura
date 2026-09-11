"""
brain.py — Motor conversacional central de Assura IA (v2.0)
Arquitectura Gemini-first: el LLM es el cerebro principal,
los handlers locales son herramientas especializadas.
Compatible con Python 3.9+.
"""

import random
import re
from typing import Optional


# ── Limpieza de notación SymPy ───────────────────────────────────────────────
def sympy_to_readable(text: str) -> str:
    """
    Convierte notación Python/SymPy a notación matemática legible.
    Ej: 'x**2 + 3*x' → 'x² + 3x'
    """
    if not isinstance(text, str):
        text = str(text)

    # Potencias numéricas comunes: x**2 → x²,  x**3 → x³, etc.
    superscripts = {'0':'\u2070','1':'\u00b9','2':'\u00b2','3':'\u00b3','4':'\u2074',
                    '5':'\u2075','6':'\u2076','7':'\u2077','8':'\u2078','9':'\u2079'}

    def replace_power(m):
        base = m.group(1)
        exp  = m.group(2)
        # Si el exponente tiene un solo dígito, usar superíndice unicode
        if len(exp) == 1 and exp in superscripts:
            return base + superscripts[exp]
        return base + '^' + exp

    # Reemplazar **N (potencias)
    text = re.sub(r'([\w\)]+)\*\*(\d+)', replace_power, text)
    # Potencias genéricas restantes (ej. x**n) → x^n
    text = re.sub(r'\*\*', '^', text)
    # Multiplicación explícita n*x o x*n → nx (si hay número antes)
    text = re.sub(r'(\d)\*([a-zA-Z])', r'\1\2', text)
    # Multiplicación x*y → x·y solo si ambos son letras o paréntesis
    text = re.sub(r'([a-zA-Z\)])\*([a-zA-Z\(])', '\\1\u00b7\\2', text)
    # Eliminar * restantes entre dígitos y expresiones
    text = text.replace('*', '\u00b7')
    # Exponencial e: exp(n) → e^n
    text = re.sub(r'exp\((\d+)\)', 'e^\\1', text)
    text = re.sub(r'exp\(1\)', 'e', text)
    # sqrt → √
    text = re.sub(r'sqrt\(([^)]+)\)', '\u221a(\\1)', text)
    # oo → ∞
    text = re.sub(r'\boo\b', '\u221e', text)
    # pi → π
    text = re.sub(r'\bpi\b', '\u03c0', text)
    return text


def clean_pasos(pasos: list) -> list:
    """Aplica sympy_to_readable a cada paso de la solución."""
    return [sympy_to_readable(p) for p in (pasos or [])]


# ══════════════════════════════════════════════════════════════════════════════
#  EXPLICACIONES ACADÉMICAS — Fallback local cuando Gemini no está disponible
# ══════════════════════════════════════════════════════════════════════════════

EXPLICACIONES_TEMAS = {
    "derivada": """📈 **¿Qué es una derivada?**

La derivada mide la **tasa de cambio** de una función. Responde: ¿cuánto cambia f(x) cuando x cambia un poquito?

**Notación:** f'(x) o df/dx

**Reglas esenciales:**
• **Potencia:** d/dx(xⁿ) = n·xⁿ⁻¹  → Ejemplo: d/dx(x³) = 3x²
• **Constante:** d/dx(c) = 0
• **Suma/Resta:** d/dx(f ± g) = f' ± g'
• **Producto:** d/dx(f·g) = f'g + fg'
• **Cociente:** d/dx(f/g) = (f'g - fg') / g²
• **Cadena:** d/dx(f(g(x))) = f'(g(x))·g'(x)

**Ejemplo completo:**
f(x) = 3x⁴ + 2x² - 5x + 1
f'(x) = 12x³ + 4x - 5

💡 **Tip:** La derivada en un punto es la **pendiente de la recta tangente** en ese punto.

¿Quieres que resuelva una derivada específica? Solo escríbela y la resuelvo paso a paso.""",

    "integral": """📉 **¿Qué es una integral?**

La integral es la operación **inversa de la derivada**. Mide el **área bajo una curva**.

**Tipos:**
• **Indefinida:** ∫f(x)dx = F(x) + C (antiderivada)
• **Definida:** ∫ₐᵇf(x)dx = F(b) - F(a) (área entre a y b)

**Reglas básicas:**
• ∫xⁿ dx = xⁿ⁺¹/(n+1) + C  → Ejemplo: ∫x³ dx = x⁴/4 + C
• ∫k dx = kx + C
• ∫eˣ dx = eˣ + C
• ∫sin(x) dx = -cos(x) + C
• ∫cos(x) dx = sin(x) + C

**Ejemplo:**
∫(3x² + 2x) dx = x³ + x² + C

💡 **Tip:** La C en la integral indefinida representa una constante desconocida.

¿Tienes una integral para resolver? ¡Compártela!""",

    "limite": """🔣 **¿Qué es un límite?**

Un límite describe el comportamiento de una función **cuando x se acerca** a un valor, sin necesariamente llegar a él.

**Notación:** lím(x→a) f(x) = L

**Casos comunes:**
• **Directo:** Si f(a) existe, lím(x→a)f(x) = f(a)  
  Ejemplo: lím(x→2)(x² + 1) = 4 + 1 = 5

• **Indeterminado 0/0:** Factorizar o usar L'Hôpital
  Ejemplo: lím(x→1)(x²-1)/(x-1) = lím(x→1)(x+1) = 2

• **Al infinito:** Ver qué domina cuando x→∞
  Ejemplo: lím(x→∞)(2x³+x)/(x³) = 2

**Regla de L'Hôpital:** Si el límite da 0/0 o ∞/∞:
lím(x→a) f(x)/g(x) = lím(x→a) f'(x)/g'(x)

¿Tienes un límite para calcular? Escríbelo así: "límite de x²-1/(x-1) cuando x tiende a 1" """,

    "ecuacion": """🔢 **Cómo resolver ecuaciones**

**Lineal (ax + b = c):**
1. Pasar variables a un lado: ax = c - b
2. Despejar x: x = (c-b)/a
Ejemplo: 3x + 6 = 15 → 3x = 9 → x = 3

**Cuadrática (ax² + bx + c = 0):**
Fórmula cuadrática: x = (-b ± √(b²-4ac)) / 2a
Ejemplo: x² - 5x + 6 = 0 → (x-2)(x-3) = 0 → x=2 ó x=3

**Sistema de ecuaciones:**
• Sustitución: despejar una variable y sustituir
• Eliminación: sumar/restar ecuaciones para eliminar una variable

💡 **Truco:** Siempre verifica tu solución sustituyendo en la ecuación original.

¿Quieres que resuelva una ecuación? Solo escríbela con el signo =.""",

    "probabilidad": """🎲 **Probabilidad — Conceptos clave**

**Definición:** P(A) = casos favorables / casos totales

**Propiedades:**
• 0 ≤ P(A) ≤ 1
• P(espacio muestral) = 1
• P(A') = 1 - P(A) (complemento)

**Tipos de eventos:**
• **Independientes:** P(A ∩ B) = P(A) · P(B)
• **Mutuamente excluyentes:** P(A ∪ B) = P(A) + P(B)
• **Condicional:** P(A|B) = P(A ∩ B) / P(B)

**Conteo:**
• Permutaciones: P(n,r) = n!/(n-r)!
• Combinaciones: C(n,r) = n!/(r!(n-r)!)

¿Tienes un problema de probabilidad específico?""",

    "estadistica": """📊 **Estadística Descriptiva**

**Medidas de tendencia central:**
• **Media:** x̄ = Σxᵢ/n
• **Mediana:** valor central al ordenar los datos
• **Moda:** valor que más se repite

**Medidas de dispersión:**
• **Varianza:** σ² = Σ(xᵢ - x̄)² / n
• **Desviación estándar:** σ = √varianza
• **Rango:** máximo - mínimo

¿Tienes un conjunto de datos para analizar?""",

    "estres": """💆 **Manejo del estrés académico**

**Técnicas de alivio inmediato:**

**Respiración 4-7-8:**
1. Inhala 4 segundos
2. Mantén 7 segundos
3. Exhala 8 segundos
Repite 4 veces.

**Técnica 5-4-3-2-1 (anclaje):**
Nombra: 5 cosas que ves → 4 que tocas → 3 que escuchas → 2 que hueles → 1 que saboreas

**Para el largo plazo:**
• 🏃 30 min de ejercicio diario
• 😴 7-8 horas de sueño
• 📋 Lista de 3 prioridades diarias
• 🗣️ Habla con alguien de confianza

🔴 **Si el estrés es intenso:** busca apoyo en psicología universitaria.

¿Quieres hablar de lo que está causando el estrés?""",

    "pomodoro": """⏱️ **Técnica Pomodoro**

1. 🎯 Elige UNA tarea específica
2. ⏱️ Trabaja **25 minutos exactos**
3. ✅ Descansa **5 minutos**
4. 🔁 Repite 4 veces
5. 💤 Descansa **20-30 minutos**

**¿Por qué funciona?**
El cerebro mantiene foco máximo ~25 min. Los descansos previenen agotamiento y consolidan lo aprendido.

**Apps recomendadas:**
• Forest, Pomofocus.io, Be Focused

¿Quieres ayuda para planificar tu sesión de estudio con Pomodoro?""",
}

# Sinónimos para detectar temas (usado en fallback local)
SINONIMOS_TEMAS = {
    "derivada": ["derivada", "derivar", "d/dx", "diferencial", "derivadas", "regla de la cadena", "regla del producto"],
    "integral": ["integral", "integrar", "antiderivada", "primitiva", "integrales", "área bajo la curva"],
    "limite": ["límite", "limite", "lim", "límites", "tiende a", "infinito", "l'hopital"],
    "ecuacion": ["ecuación", "ecuacion", "ecuaciones", "despejar", "resolver ecuación", "cuadrática", "lineal"],
    "probabilidad": ["probabilidad", "probabilidades", "probabilistico", "chances", "evento", "muestra"],
    "estadistica": ["estadística", "estadistica", "media", "varianza", "datos", "promedio", "moda", "mediana", "distribución"],
    "estres": ["estrés", "estres", "ansiedad", "nervios", "angustia", "agotamiento", "burnout", "presión académica"],
    "pomodoro": ["pomodoro", "técnica pomodoro", "25 minutos", "bloques de tiempo"],
}


# ══════════════════════════════════════════════════════════════════════════════
#  DETECCIÓN RÁPIDA DE INTENCIONES TRIVIALES (local, sin LLM)
# ══════════════════════════════════════════════════════════════════════════════

# Solo detecta intenciones que se resuelven instantáneamente sin Gemini
PATRONES_RAPIDOS = {
    "saludo": re.compile(
        r"^(hola|buenos días|buenos dias|buenas tardes|buenas noches|hey|hi|saludos|qué tal|que tal|cómo estás|como estas|buen día|buen dia)\b",
        re.IGNORECASE,
    ),
    "despedida": re.compile(
        r"^(adiós|adios|hasta luego|chao|bye|nos vemos|hasta pronto|me voy|hasta mañana)\b",
        re.IGNORECASE,
    ),
    "agradecimiento": re.compile(
        r"^\s*(gracias|muchas gracias|te lo agradezco|muy amable|genial gracias|excelente gracias)\s*[!.]*\s*$",
        re.IGNORECASE,
    ),
}

# Detecta si un mensaje es claramente un ejercicio para resolver con SymPy
PATRON_EJERCICIO_ENVIAR = re.compile(
    r"(^resuelve\b|^calcula\b|^simplifica\b|^factoriza\b|^encuentra\b|^halla\b|^deriva\b|^integral de\b|^límite de\b|^limite de\b)",
    re.IGNORECASE,
)

PATRON_EJERCICIO_PEDIR = re.compile(
    r"(dame un ejercicio|genéra(me)? un ejercicio|genera(me)? un ejercicio|quiero practicar|ejercicio de|problema de|dame otro ejercicio|otro ejercicio)",
    re.IGNORECASE,
)

# Detecta si un mensaje contiene operaciones matemáticas claras
PATRON_MATEMATICO = re.compile(
    r"(\d+\s*x\s*[+\-*/^=]|\bx\s*[²³⁴]\b|\d+\s*[+\-*/]\s*\d+\s*=|x\^?\d|d/dx|\∫|lím)",
)


# ══════════════════════════════════════════════════════════════════════════════
#  RESPUESTAS INSTANTÁNEAS (no necesitan Gemini)
# ══════════════════════════════════════════════════════════════════════════════

SALUDOS = [
    lambda nombre: f"¡Hola{', ' + nombre if nombre else ''}! 👋 Soy **Assura IA**, tu asistente académico inteligente.\n\nEstoy aquí para ayudarte con:\n• 📐 Resolver y generar ejercicios paso a paso\n• 📚 Explicar temas académicos en profundidad\n• 🎯 Técnicas de estudio y organización\n• 💆 Manejo del estrés y bienestar\n• 🤝 Conectarte con un asesor personal\n\n¿Con qué te puedo ayudar hoy?",
    lambda nombre: f"¡Buenas{', ' + nombre if nombre else ''}! 🎓 Estoy listo para ayudarte.\n\nPuedo explicar temas, resolver ejercicios, darte técnicas de estudio o simplemente escucharte. ¿Por dónde empezamos?",
    lambda nombre: f"👋 ¡Bienvenid@{', ' + nombre if nombre else ''}! Aquí Assura IA.\n\n**Puedo ayudarte con:**\n📐 Álgebra, Cálculo, Estadística, Geometría, Física\n💻 Programación, Bases de datos, Álgebra Lineal\n📚 Trigonometría, Química, Economía y más\n\nEscribe tu pregunta o ejercicio y lo resolvemos juntos. 🚀",
]

DESPEDIDAS = [
    "¡Hasta luego! 👋 Fue un gusto acompañarte. Recuerda que estaré aquí cuando me necesites. ¡Mucho éxito en tus estudios! 🎓",
    "¡Cuídate mucho! 😊 Espero haberte ayudado. Si más adelante tienes dudas, no dudes en volver. ¡Sigue adelante! 💪",
    "¡Hasta pronto! ✨ Recuerda tomar descansos y cuidarte. El aprendizaje es un maratón, no una carrera de velocidad. 🌟",
]

AGRADECIMIENTOS = [
    "¡De nada! 😊 Para eso estoy aquí. ¿Hay algo más en lo que te pueda ayudar?",
    "¡Con gusto! 🎓 Si tienes más preguntas, no dudes en preguntar.",
    "¡Me alegra haber ayudado! ✨ ¿Necesitas algo más?",
]


# ══════════════════════════════════════════════════════════════════════════════
#  MOTOR CONVERSACIONAL PRINCIPAL — Gemini-first Architecture
# ══════════════════════════════════════════════════════════════════════════════

class AssuraBrain:
    """
    Motor conversacional central de Assura IA v2.0.
    
    Arquitectura Gemini-first:
    1. Intenciones triviales (saludo, despedida, agradecimiento) → respuesta local instantánea
    2. Ejercicios explícitos (resolver/generar) → motor local SymPy
    3. Todo lo demás → Gemini con historial completo
    4. Si Gemini falla → fallback inteligente local
    """

    def responder(
        self,
        mensaje: str,
        historial: list[dict] = None,
        nombre_estudiante: str = "",
    ) -> dict:
        """
        Genera una respuesta completa para el mensaje del estudiante.
        """
        historial = historial or []
        texto = mensaje.strip()
        texto_lower = texto.lower()

        # ══════════════════════════════════════════════════════════════
        # CAPA 1: Intenciones triviales — Respuesta local instantánea
        # ══════════════════════════════════════════════════════════════
        if PATRONES_RAPIDOS["saludo"].search(texto):
            # Solo si es un saludo puro (sin pregunta después)
            if len(texto.split()) <= 6:
                respuesta = random.choice(SALUDOS)(nombre_estudiante)
                return self._wrap(respuesta, "saludo", None, 0.98)

        if PATRONES_RAPIDOS["despedida"].search(texto):
            if len(texto.split()) <= 5:
                return self._wrap(random.choice(DESPEDIDAS), "despedida", None, 0.97)

        if PATRONES_RAPIDOS["agradecimiento"].search(texto):
            if len(texto.split()) <= 6:
                return self._wrap(random.choice(AGRADECIMIENTOS), "agradecimiento", None, 0.96)

        # ══════════════════════════════════════════════════════════════
        # CAPA 2: Ejercicios explícitos — Motor local SymPy
        # ══════════════════════════════════════════════════════════════
        
        # 2a. Pedir ejercicio → generar con motor local
        if PATRON_EJERCICIO_PEDIR.search(texto):
            resultado = self._generar_ejercicio(mensaje)
            resultado["intencion"] = "ejercicio_pedir"
            resultado["confianza"] = resultado.get("confianza", 0.95)
            return resultado

        # 2b. Enviar ejercicio explícito → resolver con SymPy
        if PATRON_EJERCICIO_ENVIAR.search(texto):
            resultado = self._resolver_ejercicio(mensaje)
            resultado["intencion"] = "ejercicio_enviar"
            resultado["confianza"] = resultado.get("confianza", 0.95)
            return resultado
        
        # 2c. Expresiones matemáticas puras (ej: "2x + 5 = 11")
        if PATRON_MATEMATICO.search(texto) and len(texto.split()) <= 15:
            resultado = self._resolver_ejercicio(mensaje)
            if resultado.get("ejercicio_data") and resultado["ejercicio_data"].get("solucion", {}).get("exito"):
                resultado["intencion"] = "ejercicio_enviar"
                resultado["confianza"] = resultado.get("confianza", 0.95)
                return resultado
            # Si no se pudo resolver con SymPy, dejar que Gemini intente

        # ══════════════════════════════════════════════════════════════
        # CAPA 3: Gemini — El cerebro principal
        # ══════════════════════════════════════════════════════════════
        try:
            from llm_engine import generar_respuesta_chat

            resultado = generar_respuesta_chat(mensaje, historial, nombre_estudiante)
            if resultado and "error" not in resultado and resultado.get("respuesta"):
                # Asegurar que tiene todos los campos necesarios
                resultado.setdefault("intencion", "general")
                resultado.setdefault("confianza", 0.90)
                resultado.setdefault("categoria", None)
                resultado.setdefault("recursos", [])
                resultado.setdefault("consejo_rapido", None)
                resultado.setdefault("ejercicio_data", None)
                
                # Si Gemini generó ejercicio_data, limpiar notación SymPy
                ej_data = resultado.get("ejercicio_data")
                if ej_data and isinstance(ej_data, dict):
                    sol = ej_data.get("solucion") or ej_data.get("ejercicio", {}).get("solucion")
                    if sol and isinstance(sol, dict):
                        if "pasos" in sol:
                            sol["pasos"] = clean_pasos(sol.get("pasos", []))
                        if "resultado" in sol:
                            sol["resultado"] = sympy_to_readable(str(sol.get("resultado", "")))
                
                return resultado
            else:
                print(f"⚠️ Gemini devolvió respuesta inválida, usando fallback local")
        except Exception as e:
            print(f"⚠️ Gemini no disponible: {e}")

        # ══════════════════════════════════════════════════════════════
        # CAPA 4: Fallback inteligente local
        # ══════════════════════════════════════════════════════════════
        return self._fallback_local(texto, texto_lower, historial, nombre_estudiante)

    # ── Utilidad para empaquetar respuestas simples ──────────────────
    def _wrap(self, respuesta: str, intencion: str, categoria: Optional[str], confianza: float) -> dict:
        """Empaqueta una respuesta simple en el formato estándar."""
        return {
            "respuesta": respuesta,
            "intencion": intencion,
            "categoria": categoria,
            "confianza": confianza,
            "ejercicio_data": None,
            "recursos": [],
            "consejo_rapido": None,
        }

    # ── Handler de ejercicios (usa motor SymPy local) ───────────────

    def _generar_ejercicio(self, mensaje: str) -> dict:
        """Genera un ejercicio de la materia detectada usando el motor local."""
        from ejercicio_engine import generator, detectar_materia, MATERIAS

        materia = detectar_materia(mensaje)

        # Detectar dificultad
        dificultad = "medio"
        if re.search(r"\b(fácil|facil|básico|basico|simple|sencillo)\b", mensaje, re.IGNORECASE):
            dificultad = "facil"
        elif re.search(r"\b(difícil|dificil|complejo|avanzado|complicado)\b", mensaje, re.IGNORECASE):
            dificultad = "dificil"

        try:
            ejercicio = generator.generar(materia=materia, dificultad=dificultad)
            nombre_materia = MATERIAS.get(materia, {}).get("nombre", materia)
            icono = MATERIAS.get(materia, {}).get("icono", "📐")

            # Limpiar notación SymPy
            solucion = ejercicio.get("solucion", {})
            if solucion and isinstance(solucion, dict):
                solucion["pasos"] = clean_pasos(solucion.get("pasos", []))
                solucion["resultado"] = sympy_to_readable(str(solucion.get("resultado", "")))
                ejercicio["solucion"] = solucion

            respuesta = (
                f"¡Aquí tienes un ejercicio de **{nombre_materia}** (nivel {dificultad})! {icono}\n\n"
                f"💡 *Intenta resolverlo primero antes de ver la solución. "
                f"El esfuerzo de recuperación activa fortalece la memoria 3× más.*"
            )

            return {
                "respuesta": respuesta,
                "categoria": "solicitud_ejercicio",
                "ejercicio_data": {
                    "tipo_accion": "generacion",
                    "materia_detectada": materia,
                    "nombre_materia": nombre_materia,
                    "dificultad": dificultad,
                    "ejercicio": ejercicio,
                },
                "recursos": [
                    "✏️ Intenta resolverlo antes de ver la solución",
                    "🔄 Puedes pedir otro: 'dame otro ejercicio de " + nombre_materia + "'",
                    f"📚 O pide explicación del tema: 'explícame {nombre_materia}'",
                ],
                "consejo_rapido": "Después de ver la solución, cierra la tarjeta e inténtalo de memoria.",
            }
        except Exception as e:
            return {
                "respuesta": f"Lo siento, hubo un error generando el ejercicio: {str(e)}. Intenta especificar así: 'dame un ejercicio de álgebra'",
                "categoria": "solicitud_ejercicio",
            }

    def _resolver_ejercicio(self, mensaje: str) -> dict:
        """Resuelve un ejercicio enviado por el estudiante usando SymPy."""
        from ejercicio_engine import solver, detectar_materia, MATERIAS

        materia = detectar_materia(mensaje)
        nombre_materia = MATERIAS.get(materia, {}).get("nombre", materia)

        try:
            solucion = solver.solve(mensaje)

            if solucion.get("exito"):
                # Limpiar notación SymPy
                solucion["pasos"] = clean_pasos(solucion.get("pasos", []))
                solucion["resultado"] = sympy_to_readable(str(solucion.get("resultado", "")))
                solucion["expresion"] = sympy_to_readable(str(solucion.get("expresion", "")))

                respuesta = f"¡Aquí está la resolución de **{solucion.get('tipo', 'ejercicio')}**! 🧮"

                return {
                    "respuesta": respuesta,
                    "categoria": "envio_ejercicio",
                    "ejercicio_data": {
                        "tipo_accion": "resolucion",
                        "materia_detectada": materia,
                        "nombre_materia": nombre_materia,
                        "solucion": solucion,
                    },
                    "recursos": [
                        "🔄 Cambia los números e intenta resolverlo de nuevo",
                        "📝 Anota el procedimiento en tus apuntes",
                        "🎯 ¿Quieres un ejercicio similar para practicar?",
                    ],
                    "consejo_rapido": "Para verificar: sustituye el resultado en la expresión original y confirma que se cumple la igualdad.",
                }
            else:
                return {
                    "respuesta": (
                        f"No pude resolver eso automáticamente. 🤔\n\n"
                        f"**Inténtalo así:**\n"
                        f"• Ecuación: *'Resuelve: 2x + 5 = 11'*\n"
                        f"• Derivada: *'Calcula la derivada de x³ + 2x'*\n"
                        f"• Integral: *'Integral de 3x² dx'*\n"
                        f"• Sistema: *'Sistema: 2x + y = 7, x − y = 2'*\n\n"
                        f"Pista: {solucion.get('error', 'Formato no reconocido')}"
                    ),
                    "categoria": "envio_ejercicio",
                }
        except Exception as e:
            return {
                "respuesta": (
                    f"Hubo un problema procesando el ejercicio. 😅\n\n"
                    f"Escríbelo de esta forma:\n"
                    f"• *'Resuelve: 3x + 6 = 15'*\n"
                    f"• *'Derivada de x² + 3x'*\n"
                    f"• *'Calcula media de: 5, 8, 12, 7, 3'*"
                ),
                "categoria": "envio_ejercicio",
            }

    # ── Fallback local inteligente ───────────────────────────────────

    def _fallback_local(self, texto: str, texto_lower: str, historial: list, nombre: str) -> dict:
        """
        Fallback cuando Gemini no está disponible.
        Intenta dar la mejor respuesta posible con el conocimiento local.
        """
        # 1. Intentar detectar tema académico en el mensaje
        for tema_id, sinonimos in SINONIMOS_TEMAS.items():
            for s in sinonimos:
                if s in texto_lower:
                    explicacion = EXPLICACIONES_TEMAS.get(tema_id)
                    if explicacion:
                        return {
                            "respuesta": explicacion,
                            "intencion": "explicar_tema",
                            "categoria": "metodologia_estudio",
                            "confianza": 0.85,
                            "recursos": [
                                f"🎯 Puedo generar ejercicios: 'dame un ejercicio de {tema_id}'",
                                "🔄 Cuéntame si tienes dudas sobre alguna parte",
                            ],
                            "consejo_rapido": "Intenta explicar este tema en tus propias palabras (Técnica Feynman).",
                            "ejercicio_data": None,
                        }

        # 2. Detectar intenciones emocionales/motivacionales
        if re.search(r"(estresado|ansiedad|ansioso|pánico|no aguanto|agotado|deprimido|no puedo más|no puedo mas|burnout)", texto_lower):
            return {
                "respuesta": EXPLICACIONES_TEMAS.get("estres", "Entiendo cómo te sientes. Respira profundo. ¿Quieres hablar de lo que te preocupa?"),
                "intencion": "estres_emocional",
                "categoria": "estres_presion",
                "confianza": 0.90,
                "recursos": ["💙 Recuerda que no estás solo/a"],
                "consejo_rapido": "Técnica inmediata: Inhala 4s → Mantén 7s → Exhala 8s. Repite 4 veces.",
                "ejercicio_data": None,
            }

        if re.search(r"(no puedo|no sirvo|soy malo|me rindo|reprobé|fracasé|no entiendo nada|todo me cuesta)", texto_lower):
            return {
                "respuesta": (
                    "Entiendo cómo te sientes. Pero escúchame: **el hecho de que estés aquí buscando apoyo ya es una señal de fortaleza.** 💪\n\n"
                    "Las dificultades académicas rara vez son por falta de inteligencia — casi siempre son por falta del método correcto.\n\n"
                    "**¿Qué está pasando exactamente?** Cuéntame:\n"
                    "• ¿Es una materia específica?\n"
                    "• ¿Falta de tiempo?\n"
                    "• ¿Sientes que estudias pero no aprendes?\n\n"
                    "Con más contexto, puedo ayudarte a encontrar la solución real. 💙"
                ),
                "intencion": "motivacion",
                "categoria": "estres_presion",
                "confianza": 0.88,
                "recursos": [],
                "consejo_rapido": "Una calificación no define tu valor ni tu capacidad.",
                "ejercicio_data": None,
            }

        # 3. Asesoría
        if re.search(r"(asesor|tutor|tutoría|tutoria|cita|reunión|hablar con alguien)", texto_lower):
            return {
                "respuesta": (
                    "¡Buena decisión buscar asesoría! 🤝\n\n"
                    "**Para conectarte con un asesor en Assura:**\n"
                    "1. 📋 Ve al **Dashboard** → sección 'Asesores Disponibles'\n"
                    "2. 👤 Selecciona un asesor según tu necesidad\n"
                    "3. 💬 Inicia un chat directo\n\n"
                    "¿Sobre qué tema necesitas asesoría?"
                ),
                "intencion": "asesoria",
                "categoria": "solicitud_asesoria",
                "confianza": 0.92,
                "recursos": [],
                "consejo_rapido": None,
                "ejercicio_data": None,
            }

        # 4. Usar contexto del historial si es una pregunta de seguimiento
        if historial and len(texto.split()) <= 8:
            ultimo_bot = None
            for msg in reversed(historial):
                if msg.get("role") == "bot":
                    ultimo_bot = msg
                    break
            
            if ultimo_bot:
                ultima_cat = ultimo_bot.get("categoria", "")
                ultima_intent = ultimo_bot.get("intencion", "")
                
                if ultima_cat in ("solicitud_ejercicio", "envio_ejercicio") or ultima_intent in ("ejercicio_pedir", "ejercicio_enviar"):
                    return {
                        "respuesta": (
                            "¿Necesitas más ayuda con ese ejercicio? Puedo:\n\n"
                            "• **Resolver paso a paso**: escribe 'resuelve: [ejercicio]'\n"
                            "• **Generar otro similar**: escribe 'dame otro ejercicio'\n"
                            "• **Explicar el tema**: escribe 'explícame [el tema]'\n\n"
                            "¿Qué necesitas?"
                        ),
                        "intencion": "general",
                        "categoria": ultima_cat,
                        "confianza": 0.80,
                        "recursos": [],
                        "consejo_rapido": None,
                        "ejercicio_data": None,
                    }

        # 5. Respuesta genérica final
        respuestas_generales = [
            "Estoy aquí para ayudarte. 😊 Puedo resolver ejercicios matemáticos, explicar temas académicos, darte técnicas de estudio o apoyarte emocionalmente.\n\n¿Qué necesitas?",
            "Cuéntame más sobre lo que necesitas. Puedo ayudarte con ejercicios, explicaciones de temas, técnicas de estudio o apoyo emocional. 🎓",
            "¡Claro! Para darte la mejor ayuda, ¿podrías contarme un poco más? ¿Es una duda académica, un ejercicio, o algo sobre tu bienestar? 💡",
        ]

        return {
            "respuesta": random.choice(respuestas_generales),
            "intencion": "general",
            "categoria": "orientacion_academica",
            "confianza": 0.70,
            "recursos": [
                "📐 Escribe 'resuelve: [ecuación]' para resolver ejercicios",
                "📚 Escribe 'explícame [tema]' para explicaciones",
                "🎯 Escribe 'dame un ejercicio de [materia]' para practicar",
            ],
            "consejo_rapido": None,
            "ejercicio_data": None,
        }


# Instancia global
brain = AssuraBrain()

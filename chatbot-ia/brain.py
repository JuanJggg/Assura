"""
brain.py — Motor conversacional central de Assura IA
Genera respuestas dinámicas, inteligentes y contextuales para el chatbot académico.
Funciona con o sin BERT. Compatible con Python 3.9+.
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
#  CONOCIMIENTO ACADÉMICO — Explicaciones detalladas de temas
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

¿Quieres que resuelva una derivada específica? Solo escríbela y la resolver paso a paso.""",

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

**Tipos y estrategias:**

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
  Ejemplo: lanzar dos dados
• **Mutuamente excluyentes:** P(A ∪ B) = P(A) + P(B)
  Ejemplo: cara o cruz en una moneda
• **Condicional:** P(A|B) = P(A ∩ B) / P(B)

**Ejemplos clásicos:**
• P(cara en moneda) = 1/2 = 0.5
• P(sacar 6 en dado) = 1/6 ≈ 0.167
• P(carta de corazones) = 13/52 = 1/4

**Conteo:**
• Permutaciones: P(n,r) = n!/(n-r)!
• Combinaciones: C(n,r) = n!/(r!(n-r)!)

¿Tienes un problema de probabilidad específico?""",

    "estadistica": """📊 **Estadística Descriptiva — Lo esencial**

**Medidas de tendencia central:**
• **Media:** suma de datos / cantidad → x̄ = Σxᵢ/n
• **Mediana:** valor central al ordenar los datos
• **Moda:** valor que más se repite

**Medidas de dispersión:**
• **Varianza:** σ² = Σ(xᵢ - x̄)² / n
• **Desviación estándar:** σ = √varianza
• **Rango:** máximo - mínimo

**Ejemplo práctico:**
Datos: 4, 7, 2, 9, 5
• Media: (4+7+2+9+5)/5 = 27/5 = 5.4
• Ordenados: 2, 4, 5, 7, 9 → Mediana = 5
• Moda: no hay (todos únicos)
• Rango: 9 - 2 = 7

💡 **Cuándo usar cada medida:**
- Media: datos sin valores extremos
- Mediana: cuando hay valores muy altos o bajos
- Moda: datos categóricos

¿Tienes un conjunto de datos para analizar?""",

    "fraccion": """➗ **Fracciones — Todo lo que necesitas saber**

**Operaciones básicas:**

**Suma/Resta:** Buscar denominador común (MCM)
a/b + c/d = (ad + bc) / bd
Ejemplo: 1/3 + 1/4 = 4/12 + 3/12 = 7/12

**Multiplicación:** Numerador por numerador, denominador por denominador
a/b × c/d = (ac)/(bd)
Ejemplo: 2/3 × 3/4 = 6/12 = 1/2

**División:** Multiplicar por el recíproco del divisor
a/b ÷ c/d = a/b × d/c = (ad)/(bc)
Ejemplo: 2/3 ÷ 4/5 = 2/3 × 5/4 = 10/12 = 5/6

**Simplificar:** Dividir numerador y denominador por el MCD
Ejemplo: 12/18 → MCD(12,18)=6 → 2/3

**Fracción a decimal:** Dividir numerador entre denominador
Ejemplo: 3/4 = 0.75

¿Tienes una operación de fracciones para resolver?""",

    "porcentaje": """💯 **Porcentajes — Fórmulas clave**

**Fórmulas fundamentales:**
• % de un número: (porcentaje / 100) × número
• Qué % es A de B: (A / B) × 100
• Incremento %: ((nuevo - original) / original) × 100
• Original dado el %: nuevo / (1 + %/100)

**Ejemplos:**
• 20% de 150 → (20/100) × 150 = 30
• ¿Qué % es 25 de 200? → (25/200) × 100 = 12.5%
• Un precio de $80 aumentó a $100 → ((100-80)/80)×100 = 25% de aumento
• Si con 15% de descuento algo cuesta $85 → original = 85/(1-0.15) = 100

**Trucos rápidos:**
• 10% → desplaza un decimal: 10% de 350 = 35
• 5% → mitad del 10%: 5% de 350 = 17.5
• 25% → divide entre 4
• 50% → divide entre 2

¿Tienes un cálculo de porcentaje específico?""",

    "pomodoro": """⏱️ **Técnica Pomodoro — Guía completa**

**¿Cómo funciona?**
1. 🎯 Elige UNA tarea específica
2. ⏱️ Trabaja **25 minutos exactos** (esto es 1 Pomodoro)
3. ✅ Descansa **5 minutos** (descansa de verdad: camina, estira)
4. 🔁 Repite 4 veces
5. 💤 Descansa **20-30 minutos** (descanso largo)

**Reglas importantes:**
• Si interrumpen, marca la interrupción y retoma si puedes
• El Pomodoro es indivisible — si lo interrumpes, se reinicia
• Registra cuántos Pomodoros le toma cada tarea

**¿Por qué funciona?**
El cerebro mantiene foco máximo ~25 min. Los descansos previenen el agotamiento mental y consolidan lo aprendido.

**Apps recomendadas:**
• Forest (gamificado, planta árboles)
• Pomofocus.io (web, gratis)
• Be Focused (iOS/Mac)
• Tomato Timer (web, simple)

**Para exámenes:** Usa Pomodoros de 45 min + 10 min descanso (tu cerebro ya entrenado aguanta más).

¿Quieres ayuda para planificar tu sesión de estudio con Pomodoro?""",

    "estres": """💆 **Manejo del estrés académico**

**Técnicas de alivio inmediato:**

**Respiración 4-7-8:**
1. Inhala 4 segundos
2. Mantén 7 segundos
3. Exhala 8 segundos
Repite 4 veces. Activa el sistema nervioso parasimpático en minutos.

**Técnica 5-4-3-2-1 (anclaje):**
Nombra: 5 cosas que ves → 4 que tocas → 3 que escuchas → 2 que hueles → 1 que saboreas
Ancla tu mente al presente, corta el bucle de pensamientos.

**Para el largo plazo:**
• 🏃 30 min de ejercicio diario → reduce cortisol 30%
• 😴 7-8 horas de sueño → la memoria consolida durante el sueño
• 📵 Límites con redes sociales en época de parciales
• 📋 Lista de 3 prioridades diarias → reduce sensación de caos
• 🗣️ Habla con alguien de confianza

**Perspectiva:**
Recuerda: una calificación no define tu valor. La mayoría de los estudiantes exitosos han tenido momentos difíciles.

🔴 **Si el estrés es intenso y frecuente:** busca apoyo en psicología universitaria. Es gratuita y confidencial.

¿Quieres hablar de lo que está causando el estrés?""",

    "mapa_mental": """🗺️ **Mapas mentales — Cómo hacerlos bien**

**Pasos para crear uno efectivo:**
1. 🎯 Escribe el **tema central** en el medio (con un círculo)
2. 🌿 Crea **ramas principales** para los subtemas (4-6 máximo)
3. 🍃 Añade **ramas secundarias** con detalles específicos
4. 🎨 Usa **colores diferentes** para cada rama principal
5. 📸 Añade **íconos o imágenes** para activar la memoria visual

**Reglas del mapa mental:**
• Una sola palabra o frase corta por rama (no párrafos)
• Las ramas deben fluir orgánicamente, no en listas
• Usa líneas curvas, no rectas (más natural para el cerebro)

**Herramientas digitales:**
• **MindMeister** (colaborativo, en español)
• **XMind** (potente, versión gratis)
• **Coggle** (simples y bonitos)
• **Miro** (para trabajo en equipo)
• **draw.io** (gratis, sin registro)

**¿Cuándo usarlos?**
✅ Repasar un tema complejo
✅ Planificar un trabajo o proyecto
✅ Preparar una exposición
✅ Conectar conceptos de una materia

¿Para qué materia o tema necesitas hacer el mapa mental?""",

    "feynman": """🧠 **Técnica Feynman — Aprender de verdad**

**¿Qué es?**
Un método del físico Richard Feynman (Nobel de Física) para aprender cualquier cosa profundamente.

**Los 4 pasos:**
1. **Elige el concepto** que quieres aprender
2. **Explícalo como si le enseñaras a un niño de 12 años**
   (sin términos técnicos, con ejemplos simples)
3. **Identifica las lagunas** — donde te trabaste = lo que NO sabes aún
4. **Regresa al material** a rellenar esas lagunas. Repite hasta que fluya.

**¿Por qué funciona?**
Explicar algo con tus propias palabras obliga a tu cerebro a procesar la información a nivel profundo, no solo memorizar.

**Aplicación práctica:**
• Estudia el tema 30 min
• Cierra el libro y explícalo en voz alta a alguien (o a ti mismo)
• Cada vez que te traben → ese es tu punto débil
• Vuelve al material SOLO para ese punto

**Para exámenes:** Úsala con los temas de los que estés menos seguro, no con los que ya dominas.

¿Sobre qué tema quieres aplicar la técnica Feynman?""",

    "sistemaecuaciones": """🔣 **Sistemas de ecuaciones — Métodos de solución**

**Método de sustitución:**
1. Despejar una variable en una ecuación
2. Sustituir en la otra ecuación
3. Resolver la ecuación resultante
4. Hallar la otra variable

Ejemplo: 2x + y = 7 y x - y = 2
→ De la 2ª: x = y + 2
→ Sustituir: 2(y+2) + y = 7 → 3y = 3 → y = 1
→ x = 1 + 2 = 3 ✓

**Método de eliminación:**
1. Multiplicar ecuaciones para igualar coeficientes
2. Sumar o restar para eliminar una variable
3. Resolver y sustituir

Ejemplo: mismas ecuaciones
→ Sumar: 3x = 9 → x = 3 → y = 1 ✓

**Gráfico:**
Cada ecuación es una recta. La solución es el punto de **intersección**.

**Casos especiales:**
• Sin solución: rectas paralelas (sin intersección)
• Infinitas soluciones: misma recta (coincidentes)

¿Tienes un sistema de ecuaciones para resolver?""",

    "geometria": """📐 **Geometría — Fórmulas esenciales**

**Triángulos:**
• Área = (base × altura) / 2
• Pitágoras: c² = a² + b² (triángulo rectángulo)
• Suma ángulos = 180°

**Cuadriláteros:**
• Cuadrado: A = l², P = 4l
• Rectángulo: A = b×h, P = 2(b+h)
• Paralelogramo: A = b×h

**Círculo:**
• Área = πr²
• Circunferencia = 2πr
• π ≈ 3.14159

**Sólidos 3D:**
• Cubo: V = l³, A_sup = 6l²
• Cilindro: V = πr²h
• Esfera: V = (4/3)πr³

**Recta y pendiente:**
• Pendiente m = (y₂-y₁)/(x₂-x₁)
• Ecuación: y = mx + b (forma pendiente-intersección)
• Dos puntos: y - y₁ = m(x - x₁)

¿Tienes un problema de geometría específico?""",

    "memoria": """🧠 **Técnicas de memoria para estudiar**

**Repaso espaciado (la más efectiva):**
Revisa el material en intervalos crecientes:
• A las 24 horas de aprenderlo
• A los 3 días
• A la semana
• Al mes
Cada repaso fortalece las conexiones neuronales.

**Método de los loci (palacio de la memoria):**
Asocia cada concepto con un lugar familiar (tu casa).
Recorre mentalmente el lugar para recordar la información.

**Acrónimos y frases:**
• Crear una palabra con las iniciales de lo que memorizar
• Ejemplo: "ROYGBIV" para los colores del arcoíris

**Método Cornell para apuntes:**
• Columna derecha (70%): notas de la clase
• Columna izquierda (30%): preguntas y palabras clave
• Abajo (10%): resumen con tus propias palabras

**Asociación y storytelling:**
• Conecta el concepto nuevo con algo que ya conoces
• Crea una historia con los elementos a memorizar

**Lo que NO funciona:**
❌ Releer pasivamente el texto
❌ Remarcar/subrayar sin pensar
❌ Estudiar todo el día antes del examen

¿Qué materia te resulta más difícil de memorizar?""",

    "fisica": """⚛️ **Física — Conceptos fundamentales**

**Cinemática (movimiento):**
• **MRU** (Movimiento Rectilíneo Uniforme): d = v × t
• **MRUA**: vf = v₀ + a·t | d = v₀·t + ½·a·t²
• **Caída libre**: h = ½·g·t² (g = 9.8 m/s²)

**Dinámica (fuerzas — Leyes de Newton):**
• 1ª Ley: Un cuerpo permanece en reposo o MRU si no hay fuerza neta
• 2ª Ley: F = m·a
• 3ª Ley: Acción y reacción (fuerzas iguales y opuestas)

**Trabajo y Energía:**
• Trabajo: W = F·d·cos(θ)
• Energía cinética: Ec = ½·m·v²
• Energía potencial: Ep = m·g·h
• Conservación: Ec₁ + Ep₁ = Ec₂ + Ep₂

**Electricidad:**
• Ley de Ohm: V = I·R
• Potencia: P = V·I
• Resistencias en serie: R_total = R₁ + R₂ + ...
• Resistencias en paralelo: 1/R_total = 1/R₁ + 1/R₂ + ...

¿Quieres un ejercicio de física? Escribe: 'dame un ejercicio de física'""",

    "programacion": """💻 **Programación — Fundamentos**

**Conceptos básicos:**
• **Variable**: espacio en memoria para almacenar datos
• **Tipos de datos**: int, float, string, boolean, array/lista
• **Estructuras de control**: if/else, for, while
• **Funciones**: bloques de código reutilizables

**Estructuras de datos:**
• **Array/Lista**: colección ordenada, acceso O(1) por índice
• **Pila (Stack)**: LIFO — push, pop
• **Cola (Queue)**: FIFO — enqueue, dequeue
• **Árbol binario**: búsqueda O(log n)
• **Tabla hash**: búsqueda O(1) promedio

**POO (Programación Orientada a Objetos):**
• **Clase**: plantilla para crear objetos
• **Herencia**: reutilizar código de una clase padre
• **Polimorfismo**: misma interfaz, diferente comportamiento
• **Encapsulamiento**: proteger datos internos

**Complejidad algorítmica (Big O):**
• O(1): constante | O(log n): logarítmica
• O(n): lineal | O(n²): cuadrática
• O(2^n): exponencial

¿Quieres un ejercicio de programación?""",

    "algebra_lineal": """📊 **Álgebra Lineal — Lo esencial**

**Matrices:**
• Suma: A + B (misma dimensión, elemento a elemento)
• Multiplicación: Aₘₓₙ × Bₙₓₚ = Cₘₓₚ
• Determinante 2×2: det = ad - bc
• Inversa: A⁻¹ = (1/det) × adj(A)

**Vectores:**
• Producto punto: a·b = |a|·|b|·cos(θ)
• Producto cruz: a×b (perpendicular a ambos)

**Valores y vectores propios:**
• det(A - λI) = 0 → encontrar λ
• (A - λI)v = 0 → encontrar v

¿Quieres un ejercicio de álgebra lineal?""",

    "discreta": """🔗 **Matemáticas Discretas**

**Combinatoria:**
• Permutaciones: P(n,r) = n!/(n-r)!
• Combinaciones: C(n,r) = n!/(r!(n-r)!)
• Permutaciones con repetición: n^r

**Teoría de grafos:**
• Grafo: conjunto de nodos y aristas
• Grafo completo Kn: n(n-1)/2 aristas
• Árbol: grafo conexo sin ciclos, n-1 aristas
• BFS: recorrido en anchura | DFS: en profundidad

**Inducción matemática:**
1. Probar caso base (n=1)
2. Asumir para n=k (hipótesis inductiva)
3. Demostrar para n=k+1

**Ejemplo:** 1+2+3+...+n = n(n+1)/2
• Base n=1: 1 = 1(2)/2 = 1 ✓
• Hip.: 1+...+k = k(k+1)/2
• k+1: k(k+1)/2 + (k+1) = (k+1)(k+2)/2 ✓

¿Quieres un ejercicio de matemáticas discretas?""",

    "bases_datos": """🗄️ **Bases de Datos — Conceptos clave**

**SQL básico:**
• SELECT columnas FROM tabla WHERE condición
• INSERT INTO tabla (cols) VALUES (vals)
• UPDATE tabla SET col=val WHERE condición
• DELETE FROM tabla WHERE condición
• GROUP BY + HAVING: agrupar y filtrar grupos
• ORDER BY columna DESC/ASC: ordenar resultados

**JOINs:**
• INNER JOIN: solo coincidencias entre ambas tablas
• LEFT JOIN: todos de la izquierda + coincidencias derechas
• RIGHT JOIN: todos de la derecha + coincidencias izquierdas
• FULL OUTER JOIN: todos, con o sin coincidencia

**Ejemplo de JOIN:**
```sql
SELECT e.nombre, c.nombre_curso
FROM estudiantes e
JOIN inscripciones i ON e.id = i.id_est
JOIN cursos c ON i.id_curso = c.id;
```

**Normalización:**
• 1NF: atributos atómicos (sin listas en celdas)
• 2NF: cumple 1NF + sin dependencias parciales
• 3NF: cumple 2NF + sin dependencias transitivas

¿Quieres un ejercicio de SQL o bases de datos?""",

    "trigonometria": """📐 **Trigonometría — Conceptos esenciales**

**Razones trigonométricas (triángulo rectángulo):**
• sen(θ) = opuesto / hipotenusa
• cos(θ) = adyacente / hipotenusa
• tan(θ) = opuesto / adyacente = sen/cos

**Valores exactos clave:**
| Ángulo | sen | cos | tan |
|--------|-----|-----|-----|
| 0°     | 0   | 1   | 0   |
| 30°    | 1/2 | √3/2 | 1/√3 |
| 45°    | √2/2 | √2/2 | 1  |
| 60°    | √3/2 | 1/2 | √3  |
| 90°    | 1   | 0   | ∞   |

**Identidades fundamentales:**
• sen²(θ) + cos²(θ) = 1
• tan(θ) = sen(θ)/cos(θ)
• 1 + tan²(θ) = sec²(θ)

**Ángulos complementarios:**
• sen(90° - θ) = cos(θ)
• cos(90° - θ) = sen(θ)

💡 Regla mnemotécnica: **SOH-CAH-TOA**
(Sen=Opuesto/Hipotenusa, Cos=Adyacente/H, Tan=Opuesto/A)

¿Quieres que resuelva un ejercicio de trigonometría?""",

    "regla_tres": """🔄 **Regla de Tres — Simple y Compuesta**

**Regla de tres simple directa:**
Si A produce B, ¿cuánto produce C?
x = (C × B) / A

Ejemplo: Si 3 kg cuestan $15, ¿cuánto cuestan 7 kg?
x = (7 × 15) / 3 = 35 → **$35**

**Regla de tres simple inversa:**
A más de X, menos de Y (relación inversa)
x = (A × B) / C

Ejemplo: 6 obreros terminan en 12 días. ¿Cuántos días tardan 9?
x = (6 × 12) / 9 = 8 → **8 días**

**¿Cómo identificar si es directa o inversa?**
• Directa: ambas variables aumentan o disminuyen juntas
• Inversa: cuando una sube, la otra baja

**Regla de tres compuesta:**
Varias variables relacionadas. Se resuelve con cadena de reglas simples.

¿Tienes un problema de regla de tres para resolver?""",

    "mcd_mcm": """🔢 **MCD y MCM — Cómo calcularlos**

**MCD (Máximo Común Divisor):**
El mayor número que divide exactamente a todos los datos.

**Método 1 - Factores primos:**
• Descomponer cada número en factores primos
• MCD = producto de factores comunes con menor exponente

Ejemplo: MCD(24, 36)
• 24 = 2³ × 3
• 36 = 2² × 3²
• MCD = 2² × 3 = 12

**MCM (Mínimo Común Múltiplo):**
El menor número múltiplo de todos los dados.
• MCM = producto de factores comunes e individuales con mayor exponente

Ejemplo: MCM(24, 36)
• MCM = 2³ × 3² = 8 × 9 = 72

**Relación útil:** MCD(a,b) × MCM(a,b) = a × b

**Método del algoritmo de Euclides (para MCD):**
1. Divide el mayor entre el menor
2. El nuevo dividendo es el divisor, el nuevo divisor es el residuo
3. Repite hasta que el residuo sea 0
4. El último divisor es el MCD

¿Tienes números para calcular el MCD o MCM?""",

    "quimica_basica": """⚗️ **Química Básica — Conceptos clave**

**Tabla periódica — Grupos importantes:**
• Grupo 1 (alcalinos): Li, Na, K, Rb, Cs — 1 electrón de valencia
• Grupo 17 (halógenos): F, Cl, Br, I — 7 electrones de valencia
• Grupo 18 (nobles): He, Ne, Ar — estables (8 electrones)

**Nomenclatura de compuestos:**
• Óxidos básicos: metal + O₂  → Ejemplo: Na₂O (óxido de sodio)
• Óxidos ácidos: no-metal + O₂ → Ejemplo: CO₂ (dióxido de carbono)
• Ácidos: H + no-metal o radical ácido

**Reacciones químicas básicas:**
• Síntesis: A + B → AB
• Descomposición: AB → A + B
• Sustitución simple: A + BC → AC + B
• Doble sustitución: AB + CD → AD + CB

**Balanceo de ecuaciones:**
El número de átomos de cada elemento debe ser igual en ambos lados.
Ejemplo: H₂ + O₂ → H₂O
Balanceado: 2H₂ + O₂ → 2H₂O ✓

**Molaridad:** M = moles de soluto / litros de solución

¿Tienes una pregunta específica de química?""",

    "economia_basica": """💰 **Economía Básica — Conceptos fundamentales**

**Oferta y Demanda:**
• **Ley de la demanda:** A mayor precio → menor cantidad demandada
• **Ley de la oferta:** A mayor precio → mayor cantidad ofrecida
• **Equilibrio:** Punto donde oferta = demanda (precio y cantidad de equilibrio)

**Indicadores macroeconómicos:**
• **PIB (Producto Interno Bruto):** Valor total de bienes y servicios producidos en un país en un período
• **Inflación:** Aumento generalizado y sostenido de precios. Se mide con el IPC
• **Desempleo:** % de la PEA sin trabajo activo
• **PEA:** Población Económicamente Activa (puede trabajar y quiere hacerlo)

**Tipos de mercado:**
• Competencia perfecta: muchos compradores y vendedores, productos homogéneos
• Monopolio: un solo vendedor controla el mercado
• Oligopolio: pocos grandes vendedores dominan el mercado

**Concepto de costo de oportunidad:**
El valor de la mejor alternativa que se sacrifica al tomar una decisión.

¿Tienes una pregunta específica de economía o administración?""",
}

# Sinónimos para detectar temas
SINONIMOS_TEMAS = {
    "derivada": ["derivada", "derivar", "d/dx", "diferencial", "derivadas", "regla de la cadena", "regla del producto"],
    "integral": ["integral", "integrar", "antiderivada", "primitiva", "integrales", "área bajo la curva"],
    "limite": ["límite", "limite", "lim", "límites", "tiende a", "infinito", "l'hopital"],
    "ecuacion": ["ecuación", "ecuacion", "ecuaciones", "despejar", "resolver ecuación", "cuadrática", "lineal"],
    "probabilidad": ["probabilidad", "probabilidades", "probabilistico", "chances", "evento", "muestra"],
    "estadistica": ["estadística", "estadistica", "media", "varianza", "datos", "promedio", "moda", "mediana", "distribución"],
    "fraccion": ["fraccion", "fracción", "fracciones", "numerador", "denominador", "quebrado"],
    "porcentaje": ["porcentaje", "porcentajes", "descuento", "aumento porcentual", "tanto por ciento"],
    "pomodoro": ["pomodoro", "técnica pomodoro", "25 minutos", "bloques de tiempo", "temporizador de estudio"],
    "estres": ["estrés", "estres", "ansiedad", "nervios", "angustia", "agotamiento", "burnout", "presión académica"],
    "mapa_mental": ["mapa mental", "mapas mentales", "mind map", "mapa conceptual"],
    "feynman": ["feynman", "técnica feynman", "enseñar para aprender"],
    "sistemaecuaciones": ["sistema de ecuaciones", "2 ecuaciones", "ecuaciones simultáneas", "eliminación gaussiana"],
    "geometria": ["geometria", "geometría", "área", "triángulo", "círculo", "pitágoras", "perímetro", "volumen"],
    "memoria": ["memoria", "memorizar", "memorización", "recordar", "aprender de memoria", "retención"],
    "fisica": ["física", "fisica", "cinemática", "cinematica", "dinámica", "dinamica", "newton", "caída libre", "mru", "mrua", "energía cinética", "ohm", "circuito", "fuerza", "aceleración", "velocidad", "óptica", "termodinámica"],
    "programacion": ["programación", "programacion", "código", "codigo", "python", "java", "javascript", "algoritmo", "pseudocódigo", "poo", "clase", "objeto", "herencia", "estructura de datos", "pila", "cola", "árbol", "recursión", "big o", "complejidad"],
    "algebra_lineal": ["álgebra lineal", "algebra lineal", "matrices", "matriz", "determinante", "vector", "vectores", "valor propio", "eigenvalor", "espacio vectorial", "transformación lineal"],
    "discreta": ["discreta", "matemáticas discretas", "matematicas discretas", "combinatoria", "permutación", "grafo", "grafos", "inducción", "induccion", "conjunto", "relación binaria", "árbol binario"],
    "bases_datos": ["base de datos", "bases de datos", "sql", "select", "join", "normalización", "normalizacion", "consulta sql", "modelo entidad", "foreign key", "primary key"],
    "trigonometria": ["trigonometría", "trigonometria", "seno", "coseno", "tangente", "sen", "cos", "tan", "hipotenusa", "ángulo", "radianes", "identidad trigonométrica", "sohtcahtoa"],
    "regla_tres": ["regla de tres", "regla de 3", "proporción", "proporcion", "proporcional", "directamente proporcional", "inversamente proporcional"],
    "mcd_mcm": ["mcd", "mcm", "máximo común divisor", "maximo comun divisor", "mínimo común múltiplo", "minimo comun multiplo", "factores primos", "euclides"],
    "quimica_basica": ["química", "quimica", "tabla periódica", "tabla periodica", "átomo", "molecula", "molécula", "reacción química", "balancear", "compuesto", "elemento", "molaridad"],
    "economia_basica": ["economía", "economia", "oferta", "demanda", "pib", "inflación", "inflacion", "microeconomía", "macroeconomía", "mercado", "costo de oportunidad", "monopolio"],
}


# ══════════════════════════════════════════════════════════════════════════════
#  INTENCIONES — Detección basada en patrones
# ══════════════════════════════════════════════════════════════════════════════

class IntentDetector:
    """Detecta la intención del mensaje del estudiante."""

    PATRONES = {
        "saludo": re.compile(
            r"^(hola|buenos días|buenos dias|buenas tardes|buenas noches|hey|hi|saludos|qué tal|que tal|cómo estás|como estas|buen día|buen dia)\b",
            re.IGNORECASE,
        ),
        "despedida": re.compile(
            r"^(adiós|adios|hasta luego|chao|bye|nos vemos|hasta pronto|me voy|hasta mañana)\b",
            re.IGNORECASE,
        ),
        "agradecimiento": re.compile(
            r"\b(gracias|muchas gracias|thank you|te lo agradezco|muy amable|excelente)\b",
            re.IGNORECASE,
        ),
        "identidad": re.compile(
            r"(quién eres|quien eres|qué eres|que eres|eres un bot|eres ia|eres humano|cómo funciona|como funciona|qué puedes hacer|que puedes hacer)",
            re.IGNORECASE,
        ),
        "ayuda": re.compile(
            r"^(ayuda|help|no sé|no se|por dónde|por donde|qué hago|que hago|qué puedo|que puedo)",
            re.IGNORECASE,
        ),
        "ejercicio_pedir": re.compile(
            r"(dame un ejercicio|gen[eé]ra(me)? un ejercicio|quiero practicar|ejercicio de|problema de|practica(r)?|un ejemplo de|muéstrame un|muestrame un)",
            re.IGNORECASE,
        ),
        "ejercicio_enviar": re.compile(
            r"(resuelve|calcula|simplifica|factoriza|encuentra|halla|deriva|integral|límite|limite|=\s*\d|\d\s*[+\-*/^]\s*\d|ecuación:|ecuacion:)",
            re.IGNORECASE,
        ),
        "explicar_tema": re.compile(
            r"(explíca(me)?|explicame|qué es|que es|cómo funciona|como funciona|enséñame|enseñame|cómo se hace|como se hace|qué son|que son|defin[ei]|háblame de|hablame de)",
            re.IGNORECASE,
        ),
        "motivacion": re.compile(
            r"(no puedo|no sirvo|soy malo|soy pée?simo|me rindo|reprobé|reprobé todo|me va mal|fracasé|no entiendo nada|todo me cuesta)",
            re.IGNORECASE,
        ),
        "estres_emocional": re.compile(
            r"(estresado|ansiedad|ansioso|pánico|no aguanto|me siento mal|deprimido|llorar|agotado|no duermo|burnout)",
            re.IGNORECASE,
        ),
        "asesoria": re.compile(
            r"(asesor|tutor|tutoría|tutoria|cita|reunión|reunion|hablar con alguien|asesoría acad|asesoria acad|orientador)",
            re.IGNORECASE,
        ),
        "tecnica_estudio": re.compile(
            r"(técnica|tecnica|método|metodo|consejos? para estudiar|organizar(me)?|plan de estudio|cómo estudiar|como estudiar|productividad|concentración|concentracion)",
            re.IGNORECASE,
        ),
    }

    def detect(self, mensaje: str, historial: list[dict] = None) -> str:
        """Detecta la intención principal del mensaje."""
        texto = mensaje.strip()

        # Orden de prioridad en la detección
        for intencion, patron in self.PATRONES.items():
            if patron.search(texto):
                return intencion

        # Detectar si es una pregunta de explicación de tema académico
        if self._is_tema_academico(texto):
            return "explicar_tema"

        # Detectar ejercicio matemático por caracteres matemáticos
        if re.search(r"[\+\-\*/\^=<>√∫]|x\^?\d|d/dx|\d+x", texto):
            return "ejercicio_enviar"

        # Si hay historial, usar contexto
        if historial:
            ultima_intencion = historial[-1].get("intencion") if historial else None
            if ultima_intencion == "ejercicio_pedir":
                return "ejercicio_enviar"

        return "general"

    def _is_tema_academico(self, texto: str) -> bool:
        """Comprueba si el mensaje pregunta por un tema académico conocido."""
        texto_lower = texto.lower()
        for sinonimos in SINONIMOS_TEMAS.values():
            for s in sinonimos:
                if s in texto_lower:
                    return True
        return False

    def detectar_tema(self, texto: str) -> Optional[str]:
        """Detecta qué tema académico se menciona."""
        texto_lower = texto.lower()
        for tema_id, sinonimos in SINONIMOS_TEMAS.items():
            for s in sinonimos:
                if s in texto_lower:
                    return tema_id
        return None


# ══════════════════════════════════════════════════════════════════════════════
#  RESPUESTAS DINÁMICAS
# ══════════════════════════════════════════════════════════════════════════════

SALUDOS = [
    lambda nombre: f"¡Hola{', ' + nombre if nombre else ''}! 👋 Soy **Assura IA**, tu asistente académico inteligente.\n\nEstoy aquí para ayudarte con:\n• 📐 Resolver y generar ejercicios matemáticos paso a paso\n• 📚 Explicar temas académicos en profundidad\n• 🎯 Técnicas de estudio y organización\n• 💆 Manejo del estrés y bienestar\n• 🤝 Conectarte con un asesor personal\n\n¿Con qué te puedo ayudar hoy?",
    lambda nombre: f"¡Buenas{', ' + nombre if nombre else ''}! 🎓 Estoy listo para ayudarte en lo que necesites.\n\nPuedo explicar temas, resolver ejercicios, darte técnicas de estudio o simplemente escucharte si tienes un día difícil. ¿Por dónde empezamos?",
    lambda nombre: f"¡Hola! 😊 Me alegra que estés aquí{', ' + nombre if nombre else ''}.\n\nSoy tu asistente académico de Assura. Puedes escribirme lo que sea: preguntas académicas, ejercicios de matemáticas, dudas sobre tu carrera, o cómo manejar el estrés.\n\n¿Qué necesitas?",
    lambda nombre: f"👋 ¡Bienvenid@{', ' + nombre if nombre else ''}! Aquí Assura IA.\n\n**Esta semana puedo ayudarte con:**\n📐 Álgebra, Cálculo, Estadística, Geometría, Física\n💻 Programación, Bases de datos, Álgebra Lineal\n📚 Trigonometría, Química, Economía y más\n\nEscribe tu pregunta o ejercicio y lo resolvemos juntos. 🚀",
    lambda nombre: f"¡Hola{', ' + nombre if nombre else ''}! 🌟 Listo para estudiar.\n\nPuedes pedirme cosas como:\n• *'Explícame qué es una derivada'*\n• *'Dame un ejercicio de estadística difícil'*\n• *'Resuelve: 3x² - 5x + 2 = 0'*\n• *'Técnicas para memorizar mejor'*\n\n¿Por dónde empezamos?",
]

DESPEDIDAS = [
    "¡Hasta luego! 👋 Fue un gusto acompañarte. Recuerda que estaré aquí cuando me necesites. ¡Mucho éxito en tus estudios! 🎓",
    "¡Cuídate mucho! 😊 Espero haberte ayudado. Si más adelante tienes dudas, no dudes en volver.\n\n¡Sigue adelante, tú puedes! 💪",
    "¡Hasta pronto! ✨ Recuerda tomar descansos y cuidarte. El aprendizaje es un maratón, no una carrera de velocidad. 🌟",
]

AGRADECIMIENTOS = [
    "¡De nada! 😊 Para eso estoy aquí. ¿Hay algo más en lo que te pueda ayudar?",
    "¡Con gusto! 🎓 Si tienes más preguntas, no dudes en preguntar.",
    "¡Me alegra haber ayudado! ✨ ¿Necesitas algo más?",
]

IDENTIDAD_RESPUESTAS = [
    """Soy **Assura IA** 🤖, el asistente académico inteligente de la plataforma Assura.

**¿Qué puedo hacer por ti?**
• 📐 **Resolver ejercicios** matemáticos con pasos detallados (álgebra, cálculo, estadística, geometría)
• 🎲 **Generar ejercicios** con solución para que practiques
• 📚 **Explicar temas** académicos en profundidad (derivadas, integrales, probabilidad, fracciones, y más)
• 🎯 **Técnicas de estudio**: Pomodoro, Feynman, mapas mentales, repaso espaciado
• 💆 **Apoyo emocional**: manejo del estrés, ansiedad académica
• 🤝 **Asesoría**: conectarte con un asesor académico real

No soy un chatbot simple — analizo el contexto de la conversación para darte respuestas más útiles. ¿Por dónde empezamos?""",
]

MOTIVACION_RESPUESTAS = [
    """Entiendo cómo te sientes. Ese momento de "ya no puedo más" es uno de los más difíciles de la vida universitaria.

Pero escúchame: **el hecho de que estés aquí, buscando apoyo, ya es una señal de fortaleza.**

**Perspectiva importante:**
• Reprobar o tener dificultades NO significa que no sirves para esto
• Casi todos los estudiantes exitosos han pasado por momentos así
• Tu cerebro es capaz de aprender esto — con el método correcto

**¿Qué está pasando exactamente?**
Cuéntame más: ¿es una materia específica? ¿falta de tiempo? ¿no entiendes los temas? ¿sientes que estudias pero no aprendes?

Con más contexto, puedo ayudarte a encontrar la solución real. No estás solo/a en esto. 💙""",
    
    """Lo que sientes es completamente válido. La presión académica puede ser aplastante.

Quiero que sepas algo: **las dificultades académicas rara vez son por falta de inteligencia**. Casi siempre son por:
• Falta del método de estudio correcto
• Vacíos en conocimiento previo
• Factores externos: estrés, sueño, distribución del tiempo

**Paso 1:** Cuéntame qué materia o situación te está causando esto. Vamos a analizarlo juntos y buscar una solución concreta.

No te rindas todavía. 💪""",

    """¡Oye! A veces el camino universitario se siente imposible. Pero quiero que veas algo:

**Algunos datos que ayudan a poner las cosas en perspectiva:**
• Einstein reprobó el examen de ingreso a la universidad
• Edison falló miles de veces antes de inventar la bombilla
• El fracaso es parte del proceso de aprendizaje, no el final

**Hoy mismo podemos hacer algo concreto:**
1. 📝 Dime cuál materia te está dando más problemas
2. 🔍 Analizamos juntos qué parte específicamente no está clara
3. 📐 Trabajamos en eso con ejercicios paso a paso

¿Cuál es la materia o el tema que más te preocupa ahora mismo? 🤝""",
]

ASESORIA_RESPUESTA = """¡Buena decisión buscar asesoría! La orientación personalizada puede marcar una gran diferencia.

**Para conectarte con un asesor en Assura:**
1. 📋 Ve al **Dashboard** → sección "Asesores Disponibles"
2. 👤 Selecciona un asesor según tu necesidad
3. 💬 Inicia un chat directo o programa una cita
4. ⏰ Los asesores tienen horarios flexibles (mañana, tarde y noche)

**💡 Consejo para aprovechar la sesión:**
Antes de la reunión, anota:
• Tu situación académica actual
• Las materias que más te preocupan
• Preguntas específicas que quieras resolver

¿Hay algo en particular sobre lo que quieres recibir asesoría?"""

TECNICAS_ESTUDIO_RESPUESTA = """¡Excelente que quieras mejorar tu metodología! Estas son las técnicas más respaldadas por la neurociencia del aprendizaje:

🏆 **Top 5 técnicas más efectivas:**

**1. Repaso espaciado** (la más poderosa)
Estudia → repasa a las 24h → 3 días → 1 semana → 1 mes.
Consolida la memoria a largo plazo.

**2. Práctica de recuperación** (más efectiva que releer)
En lugar de releer tus apuntes, intenta recordarlos sin mirarlos. Los errores te dicen exactamente qué repasar.

**3. Técnica Pomodoro**
25 min de estudio intenso + 5 min descanso. Mantiene el foco y previene el agotamiento.

**4. Técnica Feynman**
Explica el tema como si lo enseñaras a alguien más. Lo que no puedas explicar es lo que no has entendido.

**5. Mapas mentales**
Para visualizar conexiones entre conceptos y repasar de forma eficiente.

❌ **Lo que NO funciona:**
- Releer pasivamente el texto
- Subrayar sin pensar
- Estudiar todo en la noche anterior

¿Sobre cuál quieres que te explique más en detalle?"""

AYUDA_RESPUESTA = """¡Hola! Puedo ayudarte con muchas cosas. Aquí está todo lo que puedo hacer:

**📐 Ejercicios matemáticos**
- *"Resuelve: 3x + 6 = 15"* → lo resuelvo paso a paso
- *"Dame un ejercicio de cálculo difícil"* → genero uno con solución
- *"Calcula la derivada de x³ + 2x"* → te explico cada paso

**📚 Explicar temas académicos**
- *"Explícame qué es una derivada"*
- *"¿Cómo funciona la probabilidad?"*
- *"¿Qué es el teorema de Pitágoras?"*

**🎯 Técnicas de estudio**
- *"¿Cómo funciona la técnica Pomodoro?"*
- *"Cómo mejorar mi memoria para exámenes"*
- *"Ayúdame a organizarme"*

**💆 Apoyo emocional**
- *"Estoy muy estresado por los exámenes"*
- *"No puedo más con la universidad"*

**🤝 Conectar con asesor**
- *"Quiero hablar con un asesor"*

¿Sobre qué quieres hablar?"""

GENERAL_RESPUESTAS = [
    "Interesante. ¿Puedes contarme más sobre lo que necesitas? Puedo ayudarte con ejercicios matemáticos, explicar temas, técnicas de estudio o apoyo emocional. 😊",
    "Entiendo. Para darte la mejor ayuda, ¿podrías ser más específico sobre lo que necesitas? ¿Es una duda académica, un ejercicio, o algo relacionado con tu bienestar? 🎓",
    "¡Cuéntame más! Estoy aquí para ayudarte en lo que necesites. Puedo resolver ejercicios, explicar temas, o darte consejos de estudio. 💡",
]


# ══════════════════════════════════════════════════════════════════════════════
#  MOTOR CONVERSACIONAL PRINCIPAL
# ══════════════════════════════════════════════════════════════════════════════

class AssuraBrain:
    """
    Motor conversacional central de Assura IA.
    Genera respuestas dinámicas, contextuales y enriquecidas.
    """

    def __init__(self):
        self.detector = IntentDetector()

    def responder(
        self,
        mensaje: str,
        historial: list[dict] = None,
        nombre_estudiante: str = "",
    ) -> dict:
        """
        Genera una respuesta completa para el mensaje del estudiante.

        Arquitectura híbrida:
        1. Detecta la intención del mensaje con IntentDetector (local, instantáneo).
        2. Si la intención es conocida → usa el handler local correspondiente (~0 ms).
        3. Solo si la intención es "general" y no se detecta un tema académico
           → delega a Gemini como fallback.
        """
        historial = historial or []
        intencion = self.detector.detect(mensaje, historial)

        # ── Handlers locales (instantáneos) ──────────────────────────
        if intencion == "saludo":
            respuesta = random.choice(SALUDOS)(nombre_estudiante)
            return self._wrap(respuesta, intencion, None, 0.98)

        if intencion == "despedida":
            return self._wrap(random.choice(DESPEDIDAS), intencion, None, 0.97)

        if intencion == "agradecimiento":
            return self._wrap(random.choice(AGRADECIMIENTOS), intencion, None, 0.96)

        if intencion == "identidad":
            return self._wrap(random.choice(IDENTIDAD_RESPUESTAS), intencion, None, 0.99)

        if intencion == "ayuda":
            return self._wrap(AYUDA_RESPUESTA, intencion, None, 0.98)

        if intencion == "ejercicio_pedir":
            resultado = self._generar_ejercicio(mensaje)
            resultado["intencion"] = intencion
            resultado["confianza"] = resultado.get("confianza", 0.95)
            return resultado

        if intencion == "ejercicio_enviar":
            resultado = self._resolver_ejercicio(mensaje)
            resultado["intencion"] = intencion
            resultado["confianza"] = resultado.get("confianza", 0.95)
            return resultado

        if intencion == "explicar_tema":
            resultado = self._explicar_tema(mensaje)
            resultado["intencion"] = intencion
            resultado["confianza"] = resultado.get("confianza", 0.95)
            return resultado

        if intencion == "motivacion":
            return self._wrap(random.choice(MOTIVACION_RESPUESTAS), intencion, "estres_presion", 0.94)

        if intencion == "estres_emocional":
            return self._wrap(
                EXPLICACIONES_TEMAS.get("estres", random.choice(MOTIVACION_RESPUESTAS)),
                intencion, "estres_presion", 0.94,
            )

        if intencion == "asesoria":
            return self._wrap(ASESORIA_RESPUESTA, intencion, "solicitud_asesoria", 0.96)

        if intencion == "tecnica_estudio":
            resultado = self._responder_tecnica_estudio(mensaje)
            resultado["intencion"] = intencion
            resultado["confianza"] = resultado.get("confianza", 0.95)
            return resultado

        # ── Intención "general": intentar tema académico local primero ──
        tema = self.detector.detectar_tema(mensaje)
        if tema and tema in EXPLICACIONES_TEMAS:
            resultado = self._explicar_tema(mensaje)
            resultado["intencion"] = "explicar_tema"
            resultado["confianza"] = resultado.get("confianza", 0.90)
            return resultado

        # ── Fallback: Gemini solo para mensajes realmente generales ──
        try:
            from llm_engine import generar_respuesta_chat

            resultado = generar_respuesta_chat(mensaje, historial, nombre_estudiante)
            if resultado and "error" not in resultado:
                resultado["intencion"] = resultado.get("intencion", "general")
                resultado["confianza"] = resultado.get("confianza", 0.85)
                return resultado
        except Exception as e:
            print(f"⚠️ Gemini no disponible, usando respuesta local: {e}")

        # ── Último fallback: respuesta local genérica ────────────────
        resultado = self._respuesta_general(mensaje, historial)
        resultado["intencion"] = "general"
        resultado["confianza"] = resultado.get("confianza", 0.80)
        return resultado

    # ── Utilidad para empaquetar respuestas simples ──────────────────
    def _wrap(self, respuesta: str, intencion: str, categoria: Optional[str], confianza: float) -> dict:
        """Empaqueta una respuesta simple en el formato estándar."""
        return {
            "respuesta": respuesta,
            "intencion": intencion,
            "categoria": categoria or self._intencion_a_categoria(intencion),
            "confianza": confianza,
            "ejercicio_data": None,
            "recursos": [],
            "consejo_rapido": None,
        }

    # ── Handlers específicos ───────────────────────────────────────────────

    def _generar_ejercicio(self, mensaje: str) -> dict:
        """Genera un ejercicio de la materia detectada."""
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

            # Limpiar notación SymPy en los pasos de la solución
            solucion = ejercicio.get("solucion", {})
            if solucion and isinstance(solucion, dict):
                solucion["pasos"] = clean_pasos(solucion.get("pasos", []))
                solucion["resultado"] = sympy_to_readable(str(solucion.get("resultado", "")))
                ejercicio["solucion"] = solucion

            # Respuesta corta — la tarjeta del frontend muestra el detalle
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
                "consejo_rapido": "Después de ver la solución, cierra la tarjeta e inténtalo de memoria. Si puedes hacerlo, realmente lo aprendiste.",
            }
        except Exception as e:
            return {
                "respuesta": f"Lo siento, hubo un error generando el ejercicio: {str(e)}. Intenta especificar así: 'dame un ejercicio de álgebra'",
                "categoria": "solicitud_ejercicio",
            }


    def _resolver_ejercicio(self, mensaje: str) -> dict:
        """Resuelve un ejercicio enviado por el estudiante."""
        from ejercicio_engine import solver, detectar_materia, MATERIAS

        materia = detectar_materia(mensaje)
        nombre_materia = MATERIAS.get(materia, {}).get("nombre", materia)

        try:
            solucion = solver.solve(mensaje)

            if solucion.get("exito"):
                # Limpiar notación SymPy antes de enviar
                solucion["pasos"] = clean_pasos(solucion.get("pasos", []))
                solucion["resultado"] = sympy_to_readable(str(solucion.get("resultado", "")))
                solucion["expresion"] = sympy_to_readable(str(solucion.get("expresion", "")))

                # Respuesta corta — la tarjeta del frontend muestra los pasos
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

    def _explicar_tema(self, mensaje: str) -> dict:
        """Explica un tema académico en profundidad."""
        tema = self.detector.detectar_tema(mensaje)

        if tema and tema in EXPLICACIONES_TEMAS:
            explicacion = EXPLICACIONES_TEMAS[tema]
            return {
                "respuesta": explicacion,
                "categoria": "metodologia_estudio",
                "recursos": [
                    "🎯 Puedo generar ejercicios de este tema: 'dame un ejercicio de " + tema + "'",
                    "🔄 Cuéntame si tienes dudas sobre alguna parte específica",
                    "📚 También puedo explicar temas relacionados",
                ],
                "consejo_rapido": "Después de leer esta explicación, intenta explicarla en tus propias palabras (Técnica Feynman). Si no puedes, identifica qué parte no está clara.",
            }

        # Tema no reconocido — respuesta genérica para tema académico
        return {
            "respuesta": (
                f"Me gustaría explicarte ese tema mejor. 📚\n\n"
                f"**Temas que puedo explicar en detalle:**\n"
                f"• **Cálculo:** derivadas, integrales, límites\n"
                f"• **Álgebra:** ecuaciones, sistemas, factorización, fracciones, porcentajes\n"
                f"• **Geometría & Trigonometría:** áreas, perímetros, seno, coseno, Pitágoras\n"
                f"• **Estadística & Probabilidad:** media, varianza, distribuciones\n"
                f"• **Álgebra Lineal:** matrices, determinantes, vectores\n"
                f"• **Física:** cinemática, dinámica, energía, electricidad\n"
                f"• **Programación:** algoritmos, POO, estructuras de datos, Big O\n"
                f"• **Bases de datos:** SQL, JOIN, normalización\n"
                f"• **Química & Economía:** tabla periódica, oferta y demanda, PIB\n"
                f"• **Técnicas de estudio:** Pomodoro, Feynman, mapas mentales\n"
                f"• **Bienestar:** manejo del estrés, concentración\n\n"
                f"¿Sobre cuál de estos temas me preguntas? Escribe: *'Explícame [el tema]'*"
            ),
            "categoria": "metodologia_estudio",
        }

    def _responder_tecnica_estudio(self, mensaje: str) -> dict:
        """Responde preguntas sobre técnicas de estudio."""
        mensaje_lower = mensaje.lower()

        # Detectar técnica específica
        if "pomodoro" in mensaje_lower:
            return {
                "respuesta": EXPLICACIONES_TEMAS["pomodoro"],
                "categoria": "metodologia_estudio",
            }
        if "feynman" in mensaje_lower:
            return {
                "respuesta": EXPLICACIONES_TEMAS["feynman"],
                "categoria": "metodologia_estudio",
            }
        if "mapa" in mensaje_lower:
            return {
                "respuesta": EXPLICACIONES_TEMAS["mapa_mental"],
                "categoria": "metodologia_estudio",
            }
        if any(k in mensaje_lower for k in ["memori", "recordar", "aprender"]):
            return {
                "respuesta": EXPLICACIONES_TEMAS["memoria"],
                "categoria": "metodologia_estudio",
            }

        # Respuesta general de técnicas
        return {
            "respuesta": TECNICAS_ESTUDIO_RESPUESTA,
            "categoria": "metodologia_estudio",
            "recursos": [
                "📖 Escribe 'explícame la técnica Pomodoro' para ver la guía completa",
                "🧠 O 'explícame la técnica Feynman'",
                "🗺️ O 'cómo hacer un mapa mental'",
            ],
            "consejo_rapido": "La técnica más subestimada: el repaso espaciado. Revisar el material a las 24h, 3 días y 1 semana es 10× más efectivo que estudiar todo en un día.",
        }

    def _respuesta_general(self, mensaje: str, historial: list[dict]) -> dict:
        """Genera una respuesta inteligente para mensajes generales."""
        # Intentar interpretar contexto del historial
        if historial:
            ultimo = historial[-1] if historial else {}
            ultima_categoria = ultimo.get("categoria") or ultimo.get("intencion", "")

            if ultima_categoria in ("solicitud_ejercicio", "envio_ejercicio"):
                return {
                    "respuesta": (
                        "¿Necesitas ayuda con ese ejercicio? Puedo:\n\n"
                        "• **Resolver paso a paso**: escribe el ejercicio con '=' o dime 'resuelve: [ejercicio]'\n"
                        "• **Generar otro similar**: escribe 'dame otro ejercicio'\n"
                        "• **Explicar el tema**: escribe 'explícame [el tema]'\n\n"
                        "¿Qué necesitas?"
                    ),
                    "categoria": ultima_categoria,
                }

        return {
            "respuesta": random.choice(GENERAL_RESPUESTAS),
            "categoria": "orientacion_academica",
        }

    def _intencion_a_categoria(self, intencion: str) -> str:
        """Mapea intención a categoría del sistema."""
        mapa = {
            "saludo": None,
            "despedida": None,
            "agradecimiento": None,
            "identidad": None,
            "ayuda": None,
            "ejercicio_pedir": "solicitud_ejercicio",
            "ejercicio_enviar": "envio_ejercicio",
            "explicar_tema": "metodologia_estudio",
            "motivacion": "estres_presion",
            "estres_emocional": "estres_presion",
            "asesoria": "solicitud_asesoria",
            "tecnica_estudio": "metodologia_estudio",
            "general": "orientacion_academica",
        }
        return mapa.get(intencion)


# Instancia global
brain = AssuraBrain()

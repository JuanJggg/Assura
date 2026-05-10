"""
ejercicio_engine.py — Motor de resolución y generación de ejercicios académicos
Usa SymPy para cómputo simbólico y resolución paso a paso.
"""

import re
import random
import math
from typing import Optional

import sympy as sp
from sympy import (
    symbols, solve, diff, integrate, limit, factorial, log, sqrt,
    sin, cos, tan, Matrix, Rational, oo, simplify, expand, factor,
    gcd as sp_gcd, det, pi, sympify, latex, N as sp_N,
)
from sympy.parsing.sympy_parser import (
    parse_expr, standard_transformations, implicit_multiplication_application,
    convert_xor,
)

x, y, z, n, t = symbols("x y z n t")

TRANSFORMATIONS = standard_transformations + (
    implicit_multiplication_application,
    convert_xor,
)

# ── Materias soportadas ─────────────────────────────────────────────────────────
MATERIAS = {
    "algebra": {
        "nombre": "Álgebra",
        "icono": "🔢",
        "temas": ["ecuaciones lineales", "ecuaciones cuadráticas", "factorización",
                  "sistemas de ecuaciones", "polinomios", "inecuaciones"],
    },
    "calculo": {
        "nombre": "Cálculo",
        "icono": "📈",
        "temas": ["derivadas", "integrales", "límites", "series", "Taylor"],
    },
    "estadistica": {
        "nombre": "Estadística",
        "icono": "📊",
        "temas": ["media", "varianza", "desviación estándar", "probabilidad", "combinatoria"],
    },
    "aritmetica": {
        "nombre": "Aritmética",
        "icono": "➕",
        "temas": ["fracciones", "porcentajes", "MCD/MCM", "potencias", "regla de tres"],
    },
    "logica": {
        "nombre": "Lógica",
        "icono": "🧠",
        "temas": ["tablas de verdad", "proposiciones", "circuitos lógicos"],
    },
    "geometria": {
        "nombre": "Geometría",
        "icono": "📐",
        "temas": ["áreas", "perímetros", "teorema de Pitágoras", "pendiente de recta"],
    },
    "fisica": {
        "nombre": "Física",
        "icono": "⚛️",
        "temas": ["cinemática", "dinámica", "trabajo y energía", "electricidad",
                  "MRU", "MRUA", "caída libre", "leyes de Newton", "ley de Ohm"],
    },
    "programacion": {
        "nombre": "Programación",
        "icono": "💻",
        "temas": ["algoritmos", "pseudocódigo", "Python", "Java", "estructuras de datos",
                  "complejidad", "recursión", "POO", "SQL básico"],
    },
    "algebra_lineal": {
        "nombre": "Álgebra Lineal",
        "icono": "📊",
        "temas": ["matrices", "determinantes", "vectores", "espacios vectoriales",
                  "transformaciones lineales", "valores propios"],
    },
    "discreta": {
        "nombre": "Matemáticas Discretas",
        "icono": "🔗",
        "temas": ["teoría de conjuntos", "relaciones", "grafos", "árboles",
                  "combinatoria", "inducción matemática"],
    },
    "bases_datos": {
        "nombre": "Bases de Datos",
        "icono": "🗄️",
        "temas": ["SQL", "normalización", "modelo ER", "consultas",
                  "JOIN", "índices", "transacciones"],
    },
}


# ═══════════════════════════════════════════════════════════════════════════════
#  DETECTOR DE MATERIA
# ═══════════════════════════════════════════════════════════════════════════════

_MATERIA_KEYWORDS: dict[str, list[str]] = {
    "calculo": [
        "derivada", "integral", "límite", "limite", "dx", "d/dx",
        "antiderivada", "primitiva", "diferencial", "serie", "taylor",
        "maclaurin", "convergencia", "cálculo", "calculo",
    ],
    "fisica": [
        "física", "fisica", "velocidad", "aceleración", "aceleracion",
        "fuerza", "newton", "energía", "energia", "trabajo", "potencia fisica",
        "caída libre", "caida libre", "mru", "mrua", "cinemática", "cinematica",
        "dinámica", "dinamica", "ohm", "resistencia", "voltaje", "corriente",
        "circuito", "gravedad", "masa", "peso", "fricción", "friccion",
        "momento", "impulso", "ley de coulomb", "campo eléctrico",
    ],
    "programacion": [
        "programación", "programacion", "código", "codigo", "python", "java",
        "javascript", "algoritmo", "pseudocódigo", "pseudocodigo", "función",
        "funcion", "variable programa", "bucle", "ciclo",
        "array", "arreglo", "lista enlazada", "pila", "cola",
        "árbol binario", "recursión", "recursion", "recursiva", "clase",
        "objeto", "herencia", "polimorfismo", "encapsulamiento", "poo",
        "complejidad", "big o", "ordenamiento", "búsqueda binaria",
        "html", "css", "react", "node", "api rest",
    ],
    "algebra_lineal": [
        "álgebra lineal", "algebra lineal", "matriz", "matrices", "determinante",
        "vector", "vectores", "espacio vectorial", "transformación lineal",
        "transformacion lineal", "valor propio", "eigenvalor", "eigenvector",
        "rango", "nulidad", "producto punto", "producto cruz", "inversa de matriz",
    ],
    "algebra": [
        "ecuación", "ecuacion", "factori", "polinomio", "sistema",
        "inecuación", "inecuacion", "raíces", "raices",
        "cuadrática", "cuadratica", "simplifica",
    ],
    "estadistica": [
        "media", "promedio", "varianza", "desviación", "desviacion",
        "probabilidad", "moda", "mediana", "frecuencia", "dato",
        "combinatoria", "permutación", "permutacion", "binomial",
    ],
    "aritmetica": [
        "fracción", "fraccion", "porcentaje", "mcd", "mcm",
        "potencia", "regla de tres", "factorial",
    ],
    "logica": [
        "verdad", "proposición", "proposicion", "lógica", "logica",
        "conjunción", "disyunción", "negación", "tabla de verdad",
    ],
    "geometria": [
        "área", "area", "perímetro", "perimetro", "triángulo", "triangulo",
        "hipotenusa", "pitágoras", "pitagoras", "pendiente", "recta",
        "círculo", "circulo", "radio",
    ],
    "discreta": [
        "discreta", "conjunto", "relación binaria", "grafo", "árbol binario",
        "inducción", "induccion", "grafos", "nodos", "aristas",
    ],
    "bases_datos": [
        "base de datos", "bases de datos", "sql", "normalización",
        "normalizacion", "entidad relación", "join", "consulta sql",
        "foreign key", "primary key", "índice", "indice",
    ],
}


def detectar_materia(texto: str) -> str:
    """Detecta la materia del ejercicio a partir del texto."""
    texto_lower = texto.lower()
    # Check multi-word phrases first with higher weight
    scores: dict[str, int] = {m: 0 for m in _MATERIA_KEYWORDS}
    for materia, keywords in _MATERIA_KEYWORDS.items():
        for kw in keywords:
            if kw in texto_lower:
                # Multi-word keywords get extra weight to avoid false matches
                weight = 3 if " " in kw else 1
                scores[materia] += weight
    best = max(scores, key=scores.get)
    return best if scores[best] > 0 else "algebra"


# ═══════════════════════════════════════════════════════════════════════════════
#  PARSER SEGURO
# ═══════════════════════════════════════════════════════════════════════════════

def _safe_parse(expr_str: str):
    """Parsea una expresión matemática de forma segura."""
    expr_str = (
        expr_str
        .replace("^", "**")
        .replace("²", "**2")
        .replace("³", "**3")
        .replace("{", "")
        .replace("}", "")
        .replace("sen", "sin")
        .replace("coseno", "cos")
        .replace("tangente", "tan")
        .replace("raíz", "sqrt")
        .replace("raiz", "sqrt")
    )
    return parse_expr(expr_str, transformations=TRANSFORMATIONS, local_dict={
        "x": x, "y": y, "z": z, "n": n, "t": t,
        "pi": pi, "e": sp.E,
    })


def _extraer_expresion(texto: str) -> Optional[str]:
    """Intenta extraer una expresión matemática del texto natural."""
    patterns = [
        r"(?:resuelve|calcula|simplifica|factoriza|evalúa|evalua|encuentra)\s*(?:la\s+ecuaci[oó]n(?: cuadr[aá]tica)?\s*:?|el\s+sistema\s*:?|la\s+derivada\s+de|el\s+l[ií]mite\s+de)?[:\s]+(.+)",
        r"(?:cu[aá]nto|cu[aá]l)\s+(?:es|da|vale)[:\s]+(.+)",
        r"(?:derivada|integral|l[ií]mite)\s+(?:de)[:\s]+(.+)",
    ]
    for pat in patterns:
        m = re.search(pat, texto, re.IGNORECASE)
        if m:
            return m.group(1).strip().rstrip("?.,;!")
    # Si tiene signos matemáticos, tomar la parte que parece expr
    m = re.search(r"([\d\w\s\+\-\*/\^\(\)=<>\.]+[=<>][\d\w\s\+\-\*/\^\(\)\.]+)", texto)
    if m:
        return m.group(1).strip()
    m = re.search(r"(\d[\d\w\s\+\-\*/\^\(\)\.]{3,})", texto)
    if m:
        return m.group(1).strip()
    return None


# ═══════════════════════════════════════════════════════════════════════════════
#  SOLVER — Resuelve el ejercicio enviado por el estudiante
# ═══════════════════════════════════════════════════════════════════════════════

class ExerciseSolver:
    """Resuelve ejercicios matemáticos con explicación paso a paso."""

    def solve(self, texto: str) -> dict:
        """Punto de entrada principal: intenta resolver lo que envíe el estudiante."""
        texto_lower = texto.lower()
        materia = detectar_materia(texto)

        try:
            # --- Derivada ---
            if any(k in texto_lower for k in ["derivada", "d/dx", "deriva"]):
                return self._solve_derivative(texto)

            # --- Integral ---
            if any(k in texto_lower for k in ["integral", "∫", "antiderivada", "primitiva"]):
                return self._solve_integral(texto)

            # --- Límite ---
            if any(k in texto_lower for k in ["límite", "limite", "lim"]):
                return self._solve_limit(texto)

            # --- Media / Promedio ---
            if any(k in texto_lower for k in ["media", "promedio"]):
                return self._solve_mean(texto)

            # --- Desviación estándar ---
            if any(k in texto_lower for k in ["desviación", "desviacion"]):
                return self._solve_std(texto)

            # --- Factorial ---
            if "factorial" in texto_lower or re.search(r"\d+\s*!", texto):
                return self._solve_factorial(texto)

            # --- Determinante ---
            if "determinante" in texto_lower or "matriz" in texto_lower:
                return self._solve_determinant(texto)

            # --- MCD ---
            if "mcd" in texto_lower:
                return self._solve_gcd(texto)

            # --- Pendiente ---
            if "pendiente" in texto_lower:
                return self._solve_slope(texto)

            # --- Área triángulo ---
            if ("área" in texto_lower or "area" in texto_lower) and "triángulo" in texto_lower.replace("triangulo","triángulo"):
                return self._solve_triangle_area(texto)

            # --- Hipotenusa / Pitágoras ---
            if any(k in texto_lower for k in ["hipotenusa", "pitágoras", "pitagoras", "cateto"]):
                return self._solve_pythagoras(texto)

            # --- Grados a radianes ---
            if "radianes" in texto_lower or "grados" in texto_lower:
                return self._solve_deg_to_rad(texto)

            # --- Factorización ---
            if any(k in texto_lower for k in ["factori", "factor"]):
                return self._solve_factor(texto)

            # --- Log ---
            if "log" in texto_lower:
                return self._solve_log(texto)

            # --- Sistema de ecuaciones ---
            if "sistema" in texto_lower or ("," in texto and "=" in texto):
                return self._solve_system(texto)

            # --- Inecuación ---
            if any(c in texto for c in [">", "<", "≥", "≤"]):
                return self._solve_inequality(texto)

            # --- Porcentaje ---
            if "%" in texto or "porcentaje" in texto_lower:
                return self._solve_percentage(texto)

            # --- Simplificar ---
            if "simplifica" in texto_lower:
                return self._solve_simplify(texto)

            # --- Ecuación general ---
            if "=" in texto:
                return self._solve_equation(texto)

            # --- Evaluar expresión ---
            return self._solve_evaluate(texto)

        except Exception as e:
            return {
                "exito": False,
                "materia": materia,
                "error": f"No pude resolver este ejercicio automáticamente: {str(e)}",
                "sugerencia": "Intenta reformular el ejercicio de forma más clara, por ejemplo: 'Resuelve: 2x + 5 = 11' o 'Calcula la derivada de x^3 + 2x'",
            }

    # ── Solvers específicos ──────────────────────────────────────────────────

    def _solve_percentage(self, texto: str) -> dict:
        nums = [float(n) for n in re.findall(r"[\d]+\.?\d*", texto)]
        if len(nums) >= 2:
            pct, val = nums[0], nums[1]
            result = (pct / 100) * val
            pasos = [
                f"Paso 1: Identificar el porcentaje → {pct}%",
                f"Paso 2: Convertir a decimal → {pct} / 100 = {pct/100}",
                f"Paso 3: Multiplicar por el valor → {pct/100} × {val} = {result}",
            ]
            return {"exito": True, "materia": "aritmetica", "tipo": "porcentaje",
                    "expresion": f"{pct}% de {val}", "resultado": str(result), "pasos": pasos}
        raise ValueError("Necesito el porcentaje y el valor")

    def _solve_equation(self, texto: str) -> dict:
        expr_str = _extraer_expresion(texto) or texto
        # "2x + 5 = 11" → "2x + 5 - (11)"
        if "=" in expr_str:
            left, right = expr_str.split("=", 1)
            expr = _safe_parse(f"({left}) - ({right})")
        else:
            expr = _safe_parse(expr_str)
        sols = solve(expr, x)
        pasos = [
            f"Paso 1: Identificar la ecuación → {expr_str}",
            f"Paso 2: Reorganizar la ecuación igualando a cero → {expr} = 0",
            f"Paso 3: Resolver para x",
            f"Paso 4: Solución: x = {', '.join(str(s) for s in sols)}",
        ]
        if len(sols) == 1:
            pasos.append(f"Paso 5: Verificación → sustituyendo x = {sols[0]} en la ecuación original se confirma la igualdad ✓")
        return {"exito": True, "materia": "algebra", "tipo": "ecuación",
                "expresion": expr_str, "resultado": str(sols), "pasos": pasos}

    def _solve_derivative(self, texto: str) -> dict:
        expr_str = _extraer_expresion(texto) or texto
        for rem in ["derivada de", "derivada", "d/dx", "deriva"]:
            expr_str = expr_str.lower().replace(rem, "").strip()
        expr = _safe_parse(expr_str)
        deriv = diff(expr, x)
        pasos = [
            f"Paso 1: Función original → f(x) = {expr}",
            f"Paso 2: Aplicar reglas de derivación (potencia, cadena, producto/cociente según aplique)",
            f"Paso 3: f'(x) = {deriv}",
            f"Paso 4: Simplificando → f'(x) = {simplify(deriv)}",
        ]
        return {"exito": True, "materia": "calculo", "tipo": "derivada",
                "expresion": str(expr), "resultado": str(simplify(deriv)), "pasos": pasos}

    def _solve_integral(self, texto: str) -> dict:
        expr_str = _extraer_expresion(texto) or texto
        for rem in ["integral de", "integral", "∫", "antiderivada de", "antiderivada"]:
            expr_str = expr_str.lower().replace(rem, "").strip()
        # Integral definida: "de 0 a 1 de x³"
        definite_match = re.search(r"de\s+([\d\.\-]+)\s+a\s+([\d\.\-]+)\s+(?:de\s+)?(.+?)(?:\s*dx)?$", expr_str, re.IGNORECASE)
        if definite_match:
            a, b = float(definite_match.group(1)), float(definite_match.group(2))
            expr = _safe_parse(definite_match.group(3).strip())
            result = integrate(expr, (x, a, b))
            pasos = [
                f"Paso 1: Integral definida → ∫ de {a} a {b} de {expr} dx",
                f"Paso 2: Encontrar la antiderivada F(x) = {integrate(expr, x)}",
                f"Paso 3: Evaluar F({b}) - F({a})",
                f"Paso 4: Resultado = {result}",
            ]
            return {"exito": True, "materia": "calculo", "tipo": "integral definida",
                    "expresion": str(expr), "resultado": str(result), "pasos": pasos}
        # Remover "dx" si existe
        expr_str = re.sub(r"\s*dx\s*$", "", expr_str).strip()
        expr = _safe_parse(expr_str)
        result = integrate(expr, x)
        pasos = [
            f"Paso 1: Integral indefinida → ∫ {expr} dx",
            f"Paso 2: Aplicar reglas de integración",
            f"Paso 3: ∫ {expr} dx = {result} + C",
        ]
        return {"exito": True, "materia": "calculo", "tipo": "integral indefinida",
                "expresion": str(expr), "resultado": f"{result} + C", "pasos": pasos}

    def _solve_limit(self, texto: str) -> dict:
        expr_str = _extraer_expresion(texto) or texto
        for rem in ["límite de", "limite de", "límite", "limite", "lim"]:
            expr_str = expr_str.lower().replace(rem, "").strip()
        # "cuando x tiende a 1"
        tend_match = re.search(r"cuando\s+x\s+(?:tiende|→|->)\s+(?:a\s+)?(.+?)$", expr_str, re.IGNORECASE)
        punto = 0
        if tend_match:
            punto_str = tend_match.group(1).strip()
            punto = sp.oo if "infinito" in punto_str or "inf" in punto_str else float(punto_str)
            expr_str = expr_str[:tend_match.start()].strip()
        expr = _safe_parse(expr_str)
        result = limit(expr, x, punto)
        pasos = [
            f"Paso 1: Calcular lím (x→{punto}) de {expr}",
            f"Paso 2: Evaluar el comportamiento de la función",
            f"Paso 3: Resultado = {result}",
        ]
        return {"exito": True, "materia": "calculo", "tipo": "límite",
                "expresion": str(expr), "resultado": str(result), "pasos": pasos}

    def _solve_mean(self, texto: str) -> dict:
        nums = [float(n) for n in re.findall(r"[\d]+\.?\d*", texto)]
        if not nums:
            raise ValueError("No encontré números en el texto")
        media = sum(nums) / len(nums)
        pasos = [
            f"Paso 1: Datos → {nums}",
            f"Paso 2: Sumar todos los valores → {sum(nums)}",
            f"Paso 3: Dividir entre n={len(nums)}",
            f"Paso 4: Media = {sum(nums)} / {len(nums)} = {media}",
        ]
        return {"exito": True, "materia": "estadistica", "tipo": "media aritmética",
                "expresion": str(nums), "resultado": str(round(media, 4)), "pasos": pasos}

    def _solve_std(self, texto: str) -> dict:
        nums = [float(n) for n in re.findall(r"[\d]+\.?\d*", texto)]
        if not nums:
            raise ValueError("No encontré números")
        media = sum(nums) / len(nums)
        var = sum((xi - media) ** 2 for xi in nums) / len(nums)
        std = math.sqrt(var)
        pasos = [
            f"Paso 1: Datos → {nums}",
            f"Paso 2: Media = {round(media, 4)}",
            f"Paso 3: Varianza = Σ(xi - media)² / n = {round(var, 4)}",
            f"Paso 4: Desviación estándar = √varianza = {round(std, 4)}",
        ]
        return {"exito": True, "materia": "estadistica", "tipo": "desviación estándar",
                "expresion": str(nums), "resultado": str(round(std, 4)), "pasos": pasos}

    def _solve_factorial(self, texto: str) -> dict:
        m = re.search(r"(\d+)\s*!", texto) or re.search(r"factorial\s+(?:de\s+)?(\d+)", texto, re.IGNORECASE)
        if not m:
            raise ValueError("No encontré el número para el factorial")
        n_val = int(m.group(1))
        result = math.factorial(n_val)
        pasos = [
            f"Paso 1: Calcular {n_val}!",
            f"Paso 2: {n_val}! = " + " × ".join(str(i) for i in range(n_val, 0, -1)),
            f"Paso 3: Resultado = {result}",
        ]
        return {"exito": True, "materia": "aritmetica", "tipo": "factorial",
                "expresion": f"{n_val}!", "resultado": str(result), "pasos": pasos}

    def _solve_determinant(self, texto: str) -> dict:
        nums = re.findall(r"[-]?\d+", texto)
        if len(nums) == 4:
            a, b, c, d = [int(x) for x in nums]
            mat = Matrix([[a, b], [c, d]])
            result = det(mat)
            pasos = [
                f"Paso 1: Matriz A = |{a} {b}| / |{c} {d}|",
                f"Paso 2: det(A) = ({a})({d}) - ({b})({c})",
                f"Paso 3: det(A) = {a*d} - {b*c} = {result}",
            ]
            return {"exito": True, "materia": "algebra", "tipo": "determinante",
                    "expresion": str(mat.tolist()), "resultado": str(result), "pasos": pasos}
        raise ValueError("Solo soporto matrices 2×2 por ahora")

    def _solve_gcd(self, texto: str) -> dict:
        nums = [int(n) for n in re.findall(r"\d+", texto)]
        if len(nums) < 2:
            raise ValueError("Necesito al menos 2 números")
        result = math.gcd(nums[0], nums[1])
        for i in range(2, len(nums)):
            result = math.gcd(result, nums[i])
        pasos = [
            f"Paso 1: Encontrar MCD de {nums}",
            f"Paso 2: Descomponer en factores primos",
            f"Paso 3: MCD = {result}",
        ]
        return {"exito": True, "materia": "aritmetica", "tipo": "MCD",
                "expresion": str(nums), "resultado": str(result), "pasos": pasos}

    def _solve_slope(self, texto: str) -> dict:
        nums = re.findall(r"[-]?\d+\.?\d*", texto)
        if len(nums) >= 4:
            x1, y1, x2, y2 = [float(n) for n in nums[:4]]
            if x2 == x1:
                raise ValueError("La pendiente es indefinida (recta vertical)")
            m = (y2 - y1) / (x2 - x1)
            pasos = [
                f"Paso 1: Puntos → ({x1}, {y1}) y ({x2}, {y2})",
                f"Paso 2: m = (y2 - y1) / (x2 - x1)",
                f"Paso 3: m = ({y2} - {y1}) / ({x2} - {x1}) = {y2-y1} / {x2-x1}",
                f"Paso 4: m = {m}",
            ]
            return {"exito": True, "materia": "geometria", "tipo": "pendiente",
                    "expresion": f"({x1},{y1}) y ({x2},{y2})", "resultado": str(m), "pasos": pasos}
        raise ValueError("Necesito 4 coordenadas (x1, y1, x2, y2)")

    def _solve_triangle_area(self, texto: str) -> dict:
        nums = [float(n) for n in re.findall(r"[\d]+\.?\d*", texto)]
        if len(nums) >= 2:
            b, h = nums[0], nums[1]
            area = b * h / 2
            pasos = [
                f"Paso 1: Base = {b}, Altura = {h}",
                f"Paso 2: Área = (base × altura) / 2",
                f"Paso 3: Área = ({b} × {h}) / 2 = {area}",
            ]
            return {"exito": True, "materia": "geometria", "tipo": "área de triángulo",
                    "expresion": f"b={b}, h={h}", "resultado": str(area), "pasos": pasos}
        raise ValueError("Necesito base y altura")

    def _solve_pythagoras(self, texto: str) -> dict:
        nums = [float(n) for n in re.findall(r"[\d]+\.?\d*", texto)]
        if len(nums) >= 2:
            a, b = nums[0], nums[1]
            c = math.sqrt(a**2 + b**2)
            pasos = [
                f"Paso 1: Catetos → a = {a}, b = {b}",
                f"Paso 2: Teorema de Pitágoras: c² = a² + b²",
                f"Paso 3: c² = {a}² + {b}² = {a**2} + {b**2} = {a**2 + b**2}",
                f"Paso 4: c = √{a**2 + b**2} = {round(c, 4)}",
            ]
            return {"exito": True, "materia": "geometria", "tipo": "Pitágoras",
                    "expresion": f"catetos {a} y {b}", "resultado": str(round(c, 4)), "pasos": pasos}
        raise ValueError("Necesito dos catetos")

    def _solve_deg_to_rad(self, texto: str) -> dict:
        nums = [float(n) for n in re.findall(r"[\d]+\.?\d*", texto)]
        if nums:
            deg = nums[0]
            rad = sp.Rational(int(deg), 180) * pi
            pasos = [
                f"Paso 1: Convertir {deg}° a radianes",
                f"Paso 2: Fórmula → rad = grados × π / 180",
                f"Paso 3: rad = {deg} × π / 180 = {rad}",
            ]
            return {"exito": True, "materia": "geometria", "tipo": "conversión grados→radianes",
                    "expresion": f"{deg}°", "resultado": str(rad), "pasos": pasos}
        raise ValueError("No encontré el valor en grados")

    def _solve_factor(self, texto: str) -> dict:
        expr_str = _extraer_expresion(texto) or texto
        for rem in ["factoriza", "factorización de", "factorizar", "factor"]:
            expr_str = expr_str.lower().replace(rem, "").strip()
        expr = _safe_parse(expr_str)
        result = factor(expr)
        pasos = [
            f"Paso 1: Expresión original → {expr}",
            f"Paso 2: Buscar factores comunes y aplicar identidades",
            f"Paso 3: Forma factorizada → {result}",
        ]
        return {"exito": True, "materia": "algebra", "tipo": "factorización",
                "expresion": str(expr), "resultado": str(result), "pasos": pasos}

    def _solve_log(self, texto: str) -> dict:
        m = re.search(r"log\s*(?:base|b)?\s*(\d+)\s*(?:de)?\s*(\d+)", texto, re.IGNORECASE)
        if m:
            base, val = int(m.group(1)), int(m.group(2))
            result = sp.log(val, base)
            pasos = [
                f"Paso 1: Calcular log base {base} de {val}",
                f"Paso 2: Buscar n tal que {base}^n = {val}",
                f"Paso 3: Resultado = {result} ≈ {float(sp.N(result)):.4f}",
            ]
            return {"exito": True, "materia": "algebra", "tipo": "logaritmo",
                    "expresion": f"log_{base}({val})", "resultado": str(result), "pasos": pasos}
        raise ValueError("Formato: 'log base N de M'")

    def _solve_system(self, texto: str) -> dict:
        eqs_str = re.split(r"[,;]\s*", _extraer_expresion(texto) or texto)
        eqs = []
        for eq_str in eqs_str:
            if "=" in eq_str:
                left, right = eq_str.split("=", 1)
                eqs.append(_safe_parse(f"({left}) - ({right})"))
        if len(eqs) >= 2:
            sols = solve(eqs[:2], [x, y])
            pasos = [
                f"Paso 1: Sistema de ecuaciones con {len(eqs)} ecuaciones",
                f"Paso 2: Resolver simultáneamente para x, y",
                f"Paso 3: Solución → {sols}",
            ]
            return {"exito": True, "materia": "algebra", "tipo": "sistema de ecuaciones",
                    "expresion": str(eqs_str), "resultado": str(sols), "pasos": pasos}
        raise ValueError("Necesito al menos 2 ecuaciones separadas por coma")

    def _solve_inequality(self, texto: str) -> dict:
        expr_str = _extraer_expresion(texto) or texto
        for rem in ["resuelve", "la inecuación", "la inecuacion"]:
            expr_str = expr_str.lower().replace(rem, "").strip()
        for op in [">=", "<=", "≥", "≤", ">", "<"]:
            if op in expr_str:
                left, right = expr_str.split(op, 1)
                expr = _safe_parse(f"({left}) - ({right})")
                sols = sp.solve(expr, x)
                pasos = [
                    f"Paso 1: Inecuación → {expr_str}",
                    f"Paso 2: Resolver la ecuación asociada → {expr} = 0 → x = {sols}",
                    f"Paso 3: Analizar los intervalos de solución",
                ]
                return {"exito": True, "materia": "algebra", "tipo": "inecuación",
                        "expresion": expr_str, "resultado": str(sols), "pasos": pasos}
        raise ValueError("No encontré el operador de desigualdad")

    def _solve_simplify(self, texto: str) -> dict:
        expr_str = _extraer_expresion(texto) or texto
        for rem in ["simplifica", "simplificar"]:
            expr_str = expr_str.lower().replace(rem, "").strip()
        expr = _safe_parse(expr_str)
        result = simplify(expr)
        pasos = [
            f"Paso 1: Expresión original → {expr}",
            f"Paso 2: Simplificar algebraicamente",
            f"Paso 3: Resultado → {result}",
        ]
        return {"exito": True, "materia": "algebra", "tipo": "simplificación",
                "expresion": str(expr), "resultado": str(result), "pasos": pasos}

    def _solve_evaluate(self, texto: str) -> dict:
        expr_str = _extraer_expresion(texto) or texto
        for rem in ["calcula", "cuánto es", "cuanto es", "evalúa"]:
            expr_str = expr_str.lower().replace(rem, "").strip()
        expr = _safe_parse(expr_str)
        result = simplify(expr)
        pasos = [
            f"Paso 1: Expresión → {expr}",
            f"Paso 2: Evaluar → {result}",
        ]
        return {"exito": True, "materia": "aritmetica", "tipo": "evaluación",
                "expresion": str(expr), "resultado": str(result), "pasos": pasos}


# ═══════════════════════════════════════════════════════════════════════════════
#  GENERATOR — Genera ejercicios aleatorios por materia
# ═══════════════════════════════════════════════════════════════════════════════

class ExerciseGenerator:
    """Genera ejercicios aleatorios con su solución paso a paso."""

    def __init__(self):
        self.solver = ExerciseSolver()

    def generar(self, materia: str = "algebra", dificultad: str = "medio") -> dict:
        """Genera un ejercicio aleatorio de la materia indicada."""
        generators = {
            "algebra": self._gen_algebra,
            "calculo": self._gen_calculo,
            "estadistica": self._gen_estadistica,
            "aritmetica": self._gen_aritmetica,
            "geometria": self._gen_geometria,
            "logica": self._gen_logica,
            "fisica": self._gen_fisica,
            "programacion": self._gen_programacion,
            "algebra_lineal": self._gen_algebra_lineal,
            "discreta": self._gen_discreta,
            "bases_datos": self._gen_bases_datos,
        }
        gen = generators.get(materia, self._gen_algebra)
        return gen(dificultad)

    def _gen_algebra(self, dif: str) -> dict:
        if dif == "facil":
            a, b = random.randint(1, 10), random.randint(1, 20)
            enunciado = f"Resuelve la ecuación: {a}x + {b} = {a * random.randint(1, 5) + b}"
        elif dif == "dificil":
            a = random.randint(1, 5)
            b = random.randint(-10, 10)
            c = random.randint(-10, 10)
            enunciado = f"Resuelve la ecuación cuadrática: {a}x² + {b}x + {c} = 0"
        else:
            a, b = random.randint(2, 8), random.randint(1, 15)
            c, d = random.randint(1, 6), random.randint(1, 20)
            enunciado = f"Resuelve el sistema: {a}x + {b}y = {a*2 + b*3}, {c}x + {d}y = {c*2 + d*3}"
        solucion = self.solver.solve(enunciado)
        return {"materia": "algebra", "dificultad": dif, "enunciado": enunciado, "solucion": solucion}

    def _gen_calculo(self, dif: str) -> dict:
        if dif == "facil":
            opciones = [
                lambda: f"Calcula la derivada de x^{random.randint(2, 6)}",
                lambda: f"Calcula la derivada de {random.randint(2,8)}*x^{random.randint(2,4)}",
                lambda: f"Calcula la integral de x^{random.randint(1,4)} dx",
                lambda: f"Calcula la derivada de {random.randint(2,5)}*x + {random.randint(1,10)}",
            ]
            enunciado = random.choice(opciones)()
        elif dif == "dificil":
            opciones = [
                lambda: f"Calcula la integral definida de 0 a {random.randint(1,3)} de {random.randint(1,5)}*x^{random.randint(2,4)} dx",
                lambda: f"Calcula la derivada de sin(x)*cos(x)",
                lambda: f"Calcula la integral de sin(x) dx",
                lambda: f"Calcula la derivada de x^{random.randint(2,4)}*sin(x)",
                lambda: f"Calcula el límite de (x^2-{random.randint(1,9)})/(x-{random.randint(1,3)}) cuando x tiende a {random.randint(1,3)}",
            ]
            enunciado = random.choice(opciones)()
        else:
            opciones = [
                lambda: f"Calcula la derivada de {random.randint(1,6)}*x^3 + {random.randint(1,6)}*x^2",
                lambda: f"Calcula la integral de {random.randint(2,6)}*x^{random.randint(1,3)} dx",
                lambda: f"Calcula la derivada de {random.randint(2,5)}*x^{random.randint(2,4)} - {random.randint(1,8)}*x + {random.randint(1,10)}",
                lambda: f"Calcula la integral de {random.randint(1,4)}*x^2 + {random.randint(1,6)}*x dx",
            ]
            enunciado = random.choice(opciones)()
        solucion = self.solver.solve(enunciado)
        return {"materia": "calculo", "dificultad": dif, "enunciado": enunciado, "solucion": solucion}

    def _gen_estadistica(self, dif: str) -> dict:
        n = random.randint(4, 8)
        datos = [random.randint(5, 50) for _ in range(n)]
        datos_str = ", ".join(str(d) for d in datos)
        if dif == "facil":
            enunciado = f"Calcula la media de: {datos_str}"
        else:
            enunciado = f"Calcula la desviación estándar de: {datos_str}"
        solucion = self.solver.solve(enunciado)
        return {"materia": "estadistica", "dificultad": dif, "enunciado": enunciado, "solucion": solucion}

    def _gen_aritmetica(self, dif: str) -> dict:
        if dif == "facil":
            a, b = random.randint(1, 20), random.randint(1, 20)
            enunciado = f"Calcula el MCD de {a} y {b}"
        elif dif == "dificil":
            n = random.randint(5, 10)
            enunciado = f"¿Cuánto es {n}! (factorial de {n})?"
        else:
            a = random.randint(10, 100)
            b = random.randint(10, 50)
            enunciado = f"¿Cuánto es el {b}% de {a}?"
        solucion = self.solver.solve(enunciado)
        return {"materia": "aritmetica", "dificultad": dif, "enunciado": enunciado, "solucion": solucion}

    def _gen_geometria(self, dif: str) -> dict:
        if dif == "facil":
            b, h = random.randint(3, 15), random.randint(3, 15)
            enunciado = f"Calcula el área de un triángulo con base {b} y altura {h}"
        elif dif == "dificil":
            deg = random.choice([30, 45, 60, 90, 120, 150, 180, 270])
            enunciado = f"Convierte {deg} grados a radianes"
        else:
            a, b = random.randint(3, 12), random.randint(3, 12)
            enunciado = f"Calcula la hipotenusa de un triángulo con catetos {a} y {b}"
        solucion = self.solver.solve(enunciado)
        return {"materia": "geometria", "dificultad": dif, "enunciado": enunciado, "solucion": solucion}

    def _gen_logica(self, dif: str) -> dict:
        ops = ["∧ (AND)", "∨ (OR)", "→ (IMPLICA)", "↔ (BICONDICIONAL)"]
        op = random.choice(ops)
        p_val, q_val = random.choice(["V", "F"]), random.choice(["V", "F"])
        enunciado = f"Evalúa la proposición: p {op} q, donde p = {p_val} y q = {q_val}"
        # Resolver manualmente
        p = p_val == "V"
        q = q_val == "V"
        if "AND" in op: r = p and q
        elif "OR" in op: r = p or q
        elif "IMPLICA" in op: r = (not p) or q
        else: r = p == q
        resultado = "Verdadero (V)" if r else "Falso (F)"
        pasos = [
            f"Paso 1: p = {p_val}, q = {q_val}",
            f"Paso 2: Operación: {op}",
            f"Paso 3: Resultado = {resultado}",
        ]
        return {
            "materia": "logica", "dificultad": dif, "enunciado": enunciado,
            "solucion": {"exito": True, "materia": "logica", "tipo": "proposición lógica",
                         "expresion": enunciado, "resultado": resultado, "pasos": pasos}
        }

    def _gen_fisica(self, dif: str) -> dict:
        g = 9.8
        ejercicios = []
        if dif == "facil":
            ejercicios = [
                lambda: self._manual_exercise("fisica", dif, *self._fisica_mru()),
                lambda: self._manual_exercise("fisica", dif, *self._fisica_peso()),
            ]
        elif dif == "dificil":
            ejercicios = [
                lambda: self._manual_exercise("fisica", dif, *self._fisica_energia()),
                lambda: self._manual_exercise("fisica", dif, *self._fisica_ohm_serie()),
            ]
        else:
            ejercicios = [
                lambda: self._manual_exercise("fisica", dif, *self._fisica_mrua()),
                lambda: self._manual_exercise("fisica", dif, *self._fisica_caida()),
            ]
        return random.choice(ejercicios)()

    def _fisica_mru(self):
        v = random.randint(10, 100)
        t = random.randint(1, 20)
        d = v * t
        return (f"Un auto viaja a {v} m/s durante {t} segundos. ¿Qué distancia recorre? (MRU)",
                str(d) + " m",
                [f"Paso 1: Datos → v = {v} m/s, t = {t} s",
                 "Paso 2: Fórmula MRU → d = v × t",
                 f"Paso 3: d = {v} × {t} = {d} m"])

    def _fisica_peso(self):
        m = random.randint(5, 100)
        w = round(m * 9.8, 1)
        return (f"Calcula el peso de un objeto de {m} kg (g = 9.8 m/s²)",
                str(w) + " N",
                [f"Paso 1: masa = {m} kg, g = 9.8 m/s²",
                 "Paso 2: W = m × g",
                 f"Paso 3: W = {m} × 9.8 = {w} N"])

    def _fisica_mrua(self):
        v0 = random.randint(0, 20)
        a = random.randint(2, 10)
        t = random.randint(2, 10)
        vf = v0 + a * t
        d = round(v0 * t + 0.5 * a * t**2, 2)
        return (f"Un móvil parte con v₀ = {v0} m/s y aceleración a = {a} m/s². Calcula velocidad final y distancia a los {t} s.",
                f"vf = {vf} m/s, d = {d} m",
                [f"Paso 1: v₀ = {v0}, a = {a}, t = {t}",
                 f"Paso 2: vf = v₀ + a·t = {v0} + {a}·{t} = {vf} m/s",
                 f"Paso 3: d = v₀·t + ½·a·t² = {v0}·{t} + 0.5·{a}·{t}² = {d} m"])

    def _fisica_caida(self):
        h = random.choice([20, 45, 80, 100, 125])
        t = round((2 * h / 9.8) ** 0.5, 2)
        vf = round(9.8 * t, 2)
        return (f"Un objeto cae desde {h} m de altura. ¿Cuánto tarda en llegar al suelo y con qué velocidad? (g = 9.8 m/s²)",
                f"t = {t} s, vf = {vf} m/s",
                [f"Paso 1: h = {h} m, g = 9.8 m/s², v₀ = 0",
                 f"Paso 2: t = √(2h/g) = √(2·{h}/9.8) = {t} s",
                 f"Paso 3: vf = g·t = 9.8·{t} = {vf} m/s"])

    def _fisica_energia(self):
        m = random.randint(2, 20)
        v = random.randint(5, 30)
        h = random.randint(5, 50)
        ec = round(0.5 * m * v**2, 2)
        ep = round(m * 9.8 * h, 2)
        return (f"Un objeto de {m} kg se mueve a {v} m/s a una altura de {h} m. Calcula energía cinética y potencial.",
                f"Ec = {ec} J, Ep = {ep} J",
                [f"Paso 1: m = {m} kg, v = {v} m/s, h = {h} m",
                 f"Paso 2: Ec = ½mv² = 0.5·{m}·{v}² = {ec} J",
                 f"Paso 3: Ep = mgh = {m}·9.8·{h} = {ep} J"])

    def _fisica_ohm_serie(self):
        v = random.choice([12, 24, 36, 48, 120])
        r1 = random.randint(10, 100)
        r2 = random.randint(10, 100)
        rt = r1 + r2
        i = round(v / rt, 4)
        return (f"Circuito en serie: V = {v} V, R₁ = {r1} Ω, R₂ = {r2} Ω. Calcula la corriente.",
                f"I = {i} A",
                [f"Paso 1: V = {v} V, R₁ = {r1} Ω, R₂ = {r2} Ω",
                 f"Paso 2: R_total = R₁ + R₂ = {r1} + {r2} = {rt} Ω",
                 f"Paso 3: I = V / R = {v} / {rt} = {i} A"])

    def _manual_exercise(self, materia, dif, enunciado, resultado, pasos):
        return {"materia": materia, "dificultad": dif, "enunciado": enunciado,
                "solucion": {"exito": True, "materia": materia, "tipo": materia,
                             "expresion": enunciado, "resultado": resultado, "pasos": pasos}}

    def _gen_programacion(self, dif: str) -> dict:
        if dif == "facil":
            ejercicios = [
                {"e": "Escribe un algoritmo en pseudocódigo que lea un número e indique si es par o impar.",
                 "r": "Si (n mod 2 == 0) → Par, sino → Impar",
                 "p": ["Paso 1: Leer n", "Paso 2: Calcular n mod 2", "Paso 3: Si resultado == 0, es par; sino, impar"]},
                {"e": "¿Cuál es la salida de: for i in range(5): print(i)?",
                 "r": "0, 1, 2, 3, 4",
                 "p": ["Paso 1: range(5) genera [0,1,2,3,4]", "Paso 2: El ciclo imprime cada valor", "Paso 3: Salida: 0 1 2 3 4"]},
                {"e": "Escribe una función en Python que sume todos los elementos de una lista.",
                 "r": "def sumar(lista): return sum(lista)",
                 "p": ["Paso 1: Definir función con parámetro lista", "Paso 2: Usar sum() o un ciclo acumulador", "Paso 3: Retornar el resultado"]},
            ]
        elif dif == "dificil":
            ejercicios = [
                {"e": "Implementa una función recursiva para calcular el n-ésimo número de Fibonacci.",
                 "r": "def fib(n): return n if n <= 1 else fib(n-1) + fib(n-2)",
                 "p": ["Paso 1: Caso base: fib(0)=0, fib(1)=1", "Paso 2: Caso recursivo: fib(n) = fib(n-1) + fib(n-2)", "Paso 3: Complejidad O(2^n) sin memorización"]},
                {"e": "¿Cuál es la complejidad Big O de buscar un elemento en un árbol binario de búsqueda balanceado?",
                 "r": "O(log n)",
                 "p": ["Paso 1: En cada nivel se descarta la mitad del árbol", "Paso 2: Hay log₂(n) niveles en un árbol balanceado", "Paso 3: Complejidad = O(log n)"]},
                {"e": "Explica la diferencia entre una Pila (Stack) y una Cola (Queue) con ejemplos de uso.",
                 "r": "Pila: LIFO (Ctrl+Z). Cola: FIFO (fila de impresión)",
                 "p": ["Paso 1: Pila → Last In First Out (el último en entrar sale primero)", "Paso 2: Cola → First In First Out (el primero en entrar sale primero)", "Paso 3: Pila: historial del navegador. Cola: cola de procesos del SO"]},
            ]
        else:
            ejercicios = [
                {"e": "Escribe una función en Python que reciba una lista y devuelva la lista ordenada usando Bubble Sort.",
                 "r": "Comparar pares adyacentes e intercambiar si están desordenados",
                 "p": ["Paso 1: Recorrer lista con dos ciclos anidados", "Paso 2: Comparar arr[j] > arr[j+1] → intercambiar", "Paso 3: Repetir hasta que no haya intercambios. Complejidad O(n²)"]},
                {"e": "¿Qué patrón de diseño usarías para que solo exista una instancia de una clase? Implementa en Python.",
                 "r": "Patrón Singleton",
                 "p": ["Paso 1: Usar variable de clase _instance = None", "Paso 2: En __new__, verificar si _instance existe", "Paso 3: Si existe retornarla, si no crearla y guardarla"]},
            ]
        ej = random.choice(ejercicios)
        return self._manual_exercise("programacion", dif, ej["e"], ej["r"], ej["p"])

    def _gen_algebra_lineal(self, dif: str) -> dict:
        if dif == "facil":
            a, b, c, d = [random.randint(-5, 5) for _ in range(4)]
            det_val = a * d - b * c
            return self._manual_exercise("algebra_lineal", dif,
                f"Calcula el determinante de la matriz [[{a},{b}],[{c},{d}]]",
                str(det_val),
                [f"Paso 1: Matriz A = [{a} {b}] / [{c} {d}]",
                 f"Paso 2: det = ad - bc = ({a})({d}) - ({b})({c})",
                 f"Paso 3: det = {a*d} - {b*c} = {det_val}"])
        elif dif == "dificil":
            vals = [random.randint(-3, 3) for _ in range(4)]
            a, b, c, d = vals
            return self._manual_exercise("algebra_lineal", dif,
                f"Encuentra los valores propios de la matriz [[{a},{b}],[{c},{d}]]",
                f"Resolver (λ-{a})(λ-{d}) - ({b})({c}) = 0",
                [f"Paso 1: det(A - λI) = 0",
                 f"Paso 2: (({a}-λ)({d}-λ)) - ({b}·{c}) = 0",
                 f"Paso 3: λ² - {a+d}λ + {a*d - b*c} = 0",
                 f"Paso 4: Resolver con fórmula cuadrática"])
        else:
            a1, b1, c1, d1 = [random.randint(0, 5) for _ in range(4)]
            a2, b2, c2, d2 = [random.randint(0, 5) for _ in range(4)]
            return self._manual_exercise("algebra_lineal", dif,
                f"Multiplica: A=[[{a1},{b1}],[{c1},{d1}]] × B=[[{a2},{b2}],[{c2},{d2}]]",
                f"[[{a1*a2+b1*c2},{a1*b2+b1*d2}],[{c1*a2+d1*c2},{c1*b2+d1*d2}]]",
                [f"Paso 1: C[0][0] = {a1}·{a2} + {b1}·{c2} = {a1*a2+b1*c2}",
                 f"Paso 2: C[0][1] = {a1}·{b2} + {b1}·{d2} = {a1*b2+b1*d2}",
                 f"Paso 3: C[1][0] = {c1}·{a2} + {d1}·{c2} = {c1*a2+d1*c2}",
                 f"Paso 4: C[1][1] = {c1}·{b2} + {d1}·{d2} = {c1*b2+d1*d2}"])

    def _gen_discreta(self, dif: str) -> dict:
        if dif == "facil":
            n = random.randint(5, 12)
            r = random.randint(2, min(4, n))
            comb = math.factorial(n) // (math.factorial(r) * math.factorial(n - r))
            return self._manual_exercise("discreta", dif,
                f"¿De cuántas formas se pueden elegir {r} elementos de {n}? (Combinación)",
                str(comb),
                [f"Paso 1: C({n},{r}) = {n}! / ({r}! · ({n}-{r})!)",
                 f"Paso 2: = {math.factorial(n)} / ({math.factorial(r)} · {math.factorial(n-r)})",
                 f"Paso 3: = {comb}"])
        elif dif == "dificil":
            ejercicios = [
                {"e": "Demuestra por inducción matemática que 1+2+3+...+n = n(n+1)/2",
                 "r": "Se cumple por inducción",
                 "p": ["Paso 1: Caso base n=1: 1 = 1(2)/2 = 1 ✓",
                       "Paso 2: Hipótesis: suponer que vale para n=k → 1+2+...+k = k(k+1)/2",
                       "Paso 3: Probar para n=k+1: k(k+1)/2 + (k+1) = (k+1)(k+2)/2 ✓"]},
                {"e": "En un grafo completo K₅, ¿cuántas aristas tiene?",
                 "r": "10 aristas",
                 "p": ["Paso 1: En un grafo completo Kn, aristas = n(n-1)/2",
                       "Paso 2: K₅ → 5(5-1)/2 = 20/2",
                       "Paso 3: = 10 aristas"]},
            ]
            ej = random.choice(ejercicios)
            return self._manual_exercise("discreta", dif, ej["e"], ej["r"], ej["p"])
        else:
            n = random.randint(4, 8)
            r = random.randint(2, min(3, n))
            perm = math.factorial(n) // math.factorial(n - r)
            return self._manual_exercise("discreta", dif,
                f"¿Cuántas permutaciones de {r} elementos se pueden hacer con {n} objetos?",
                str(perm),
                [f"Paso 1: P({n},{r}) = {n}! / ({n}-{r})!",
                 f"Paso 2: = {math.factorial(n)} / {math.factorial(n-r)}",
                 f"Paso 3: = {perm}"])

    def _gen_bases_datos(self, dif: str) -> dict:
        ejercicios_facil = [
            {"e": "Escribe una consulta SQL para obtener todos los estudiantes con nota mayor a 80 de la tabla 'estudiantes'.",
             "r": "SELECT * FROM estudiantes WHERE nota > 80;",
             "p": ["Paso 1: SELECT * → seleccionar todas las columnas", "Paso 2: FROM estudiantes → de la tabla estudiantes", "Paso 3: WHERE nota > 80 → filtrar por nota"]},
            {"e": "¿Qué hace la sentencia INSERT INTO productos (nombre, precio) VALUES ('Laptop', 999)?",
             "r": "Inserta un nuevo registro con nombre='Laptop' y precio=999",
             "p": ["Paso 1: INSERT INTO → insertar en la tabla productos", "Paso 2: (nombre, precio) → columnas destino", "Paso 3: VALUES → valores a insertar"]},
        ]
        ejercicios_medio = [
            {"e": "Escribe un JOIN para obtener el nombre del estudiante y el nombre del curso en el que está inscrito. Tablas: estudiantes(id, nombre), inscripciones(id_est, id_curso), cursos(id, nombre_curso).",
             "r": "SELECT e.nombre, c.nombre_curso FROM estudiantes e JOIN inscripciones i ON e.id = i.id_est JOIN cursos c ON i.id_curso = c.id;",
             "p": ["Paso 1: Identificar las tablas y sus relaciones", "Paso 2: JOIN estudiantes con inscripciones por id", "Paso 3: JOIN inscripciones con cursos por id_curso"]},
            {"e": "¿Cuál es la diferencia entre las formas normales 1NF, 2NF y 3NF?",
             "r": "1NF: atómicos. 2NF: sin dep. parciales. 3NF: sin dep. transitivas",
             "p": ["Paso 1: 1NF → todos los atributos son atómicos (sin listas)", "Paso 2: 2NF → cumple 1NF + no hay dependencias parciales de la clave", "Paso 3: 3NF → cumple 2NF + no hay dependencias transitivas"]},
        ]
        ejercicios_dificil = [
            {"e": "Escribe una subconsulta para encontrar los estudiantes que tienen una nota superior al promedio general.",
             "r": "SELECT * FROM estudiantes WHERE nota > (SELECT AVG(nota) FROM estudiantes);",
             "p": ["Paso 1: Subconsulta: SELECT AVG(nota) FROM estudiantes", "Paso 2: Consulta principal filtra nota > promedio", "Paso 3: Se ejecuta primero la subconsulta, luego la principal"]},
        ]
        if dif == "facil": pool = ejercicios_facil
        elif dif == "dificil": pool = ejercicios_dificil
        else: pool = ejercicios_medio
        ej = random.choice(pool)
        return self._manual_exercise("bases_datos", dif, ej["e"], ej["r"], ej["p"])


# ── Instancias globales ─────────────────────────────────────────────────────────
solver = ExerciseSolver()
generator = ExerciseGenerator()


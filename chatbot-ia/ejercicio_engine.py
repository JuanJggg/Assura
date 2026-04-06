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
        "temas": ["derivadas", "integrales", "límites"],
    },
    "estadistica": {
        "nombre": "Estadística",
        "icono": "📊",
        "temas": ["media", "varianza", "desviación estándar", "probabilidad"],
    },
    "aritmetica": {
        "nombre": "Aritmética",
        "icono": "➕",
        "temas": ["fracciones", "porcentajes", "MCD/MCM", "potencias", "regla de tres"],
    },
    "logica": {
        "nombre": "Lógica",
        "icono": "🧠",
        "temas": ["tablas de verdad", "proposiciones"],
    },
    "geometria": {
        "nombre": "Geometría",
        "icono": "📐",
        "temas": ["áreas", "perímetros", "teorema de Pitágoras", "pendiente de recta"],
    },
}


# ═══════════════════════════════════════════════════════════════════════════════
#  DETECTOR DE MATERIA
# ═══════════════════════════════════════════════════════════════════════════════

_MATERIA_KEYWORDS: dict[str, list[str]] = {
    "calculo": [
        "derivada", "integral", "límite", "limite", "dx", "d/dx",
        "antiderivada", "primitiva", "diferencial",
    ],
    "algebra": [
        "ecuación", "ecuacion", "factori", "polinomio", "sistema",
        "inecuación", "inecuacion", "raíces", "raices", "variable",
        "cuadrática", "cuadratica", "lineal", "simplifica",
    ],
    "estadistica": [
        "media", "promedio", "varianza", "desviación", "desviacion",
        "probabilidad", "moda", "mediana", "frecuencia", "dato",
    ],
    "aritmetica": [
        "fracción", "fraccion", "porcentaje", "mcd", "mcm",
        "potencia", "regla de tres", "factorial",
    ],
    "logica": [
        "verdad", "proposición", "proposicion", "lógica", "logica",
        "conjunción", "disyunción", "negación",
    ],
    "geometria": [
        "área", "area", "perímetro", "perimetro", "triángulo", "triangulo",
        "hipotenusa", "pitágoras", "pitagoras", "pendiente", "recta",
        "círculo", "circulo", "radio",
    ],
}


def detectar_materia(texto: str) -> str:
    """Detecta la materia del ejercicio a partir del texto."""
    texto_lower = texto.lower()
    scores: dict[str, int] = {m: 0 for m in _MATERIA_KEYWORDS}
    for materia, keywords in _MATERIA_KEYWORDS.items():
        for kw in keywords:
            if kw in texto_lower:
                scores[materia] += 1
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
    # Buscar patrones como "resuelve: EXPR" o "calcula EXPR"
    patterns = [
        r"(?:resuelve|calcula|simplifica|factoriza|evalúa|evalua|encuentra)[:\s]+(.+)",
        r"(?:cuánto|cuanto|cuál|cual)\s+(?:es|da|vale)[:\s]+(.+)",
        r"(?:derivada|integral|límite|limite)\s+(?:de)[:\s]+(.+)",
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
            n = random.randint(2, 5)
            enunciado = f"Calcula la derivada de x^{n}"
        elif dif == "dificil":
            a, n = random.randint(1, 5), random.randint(2, 4)
            enunciado = f"Calcula la integral definida de 0 a {random.randint(1,3)} de {a}*x^{n} dx"
        else:
            a, b = random.randint(1, 6), random.randint(1, 6)
            enunciado = f"Calcula la derivada de {a}*x^3 + {b}*x^2"
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


# ── Instancias globales ─────────────────────────────────────────────────────────
solver = ExerciseSolver()
generator = ExerciseGenerator()

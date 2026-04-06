"""
main.py — API FastAPI del microservicio de chatbot IA para Assura
Puerto: 8000
"""

import json
import time
from contextlib import asynccontextmanager
from datetime import datetime
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from classifier import classifier, CATEGORY_NAMES, CATEGORY_ICONS, CATEGORY_COLORS

# ── Registro en memoria de clasificaciones (para estadísticas sin DB en Python) ─
clasificaciones_log: list[dict] = []


# ── Lifecycle: carga el modelo al iniciar ────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("=" * 60)
    print("🚀 Iniciando microservicio BERT de Assura")
    print("=" * 60)
    print("⏳ Cargando modelo BERT... (puede tomar 1-2 min la primera vez)")
    start = time.time()
    classifier.load()
    elapsed = time.time() - start
    print(f"✅ Modelo listo en {elapsed:.1f}s")
    print("=" * 60)
    yield
    print("🛑 Cerrando microservicio BERT")


# ── App ──────────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="Assura BERT Chatbot API",
    description="Microservicio de clasificación académica con BERT (Transfer Learning) + Motor de Ejercicios",
    version="2.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Schemas ──────────────────────────────────────────────────────────────────────
class ClasificarRequest(BaseModel):
    mensaje: str
    id_estudiante: Optional[int] = None


class ClasificarResponse(BaseModel):
    ok: bool
    categoria: str
    nombre_categoria: str
    icono: str
    color: str
    confianza: float
    respuesta: str
    recursos: list[str]
    consejo_rapido: str
    scores: dict
    ejercicio_data: Optional[dict] = None


class SolveRequest(BaseModel):
    ejercicio: str


class GenerarRequest(BaseModel):
    materia: str = "algebra"
    dificultad: str = "medio"


# ── Endpoints ────────────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {
        "ok": True,
        "status": "running",
        "modelo": "bert-base-multilingual-cased",
        "modelo_cargado": classifier.is_loaded(),
        "version": "2.0.0",
        "capacidades": ["clasificacion", "resolucion_ejercicios", "generacion_ejercicios"],
        "timestamp": datetime.utcnow().isoformat(),
    }


@app.post("/classify", response_model=ClasificarResponse)
def classify(req: ClasificarRequest):
    """
    Clasifica un mensaje académico usando BERT con Transfer Learning.
    Si detecta solicitud o envío de ejercicio, incluye la resolución/generación.
    """
    if not classifier.is_loaded():
        raise HTTPException(status_code=503, detail="El modelo BERT aún está cargando. Intenta en unos segundos.")

    mensaje = req.mensaje.strip()
    if not mensaje:
        raise HTTPException(status_code=400, detail="El mensaje no puede estar vacío.")
    if len(mensaje) > 2000:
        raise HTTPException(status_code=400, detail="El mensaje es demasiado largo (máx. 2000 caracteres).")

    resultado = classifier.classify(mensaje)

    # Guardar log en memoria
    clasificaciones_log.append({
        "id_estudiante": req.id_estudiante,
        "mensaje": mensaje,
        "categoria": resultado["categoria"],
        "confianza": resultado["confianza"],
        "timestamp": datetime.utcnow().isoformat(),
    })

    return ClasificarResponse(ok=True, **resultado)


@app.post("/solve")
def solve_exercise(req: SolveRequest):
    """
    Resuelve un ejercicio matemático directamente (sin clasificación BERT).
    Endpoint directo para resolver problemas sin pasar por el clasificador.
    """
    from ejercicio_engine import solver, detectar_materia, MATERIAS

    ejercicio = req.ejercicio.strip()
    if not ejercicio:
        raise HTTPException(status_code=400, detail="El ejercicio no puede estar vacío.")

    materia = detectar_materia(ejercicio)
    resultado = solver.solve(ejercicio)

    return {
        "ok": True,
        "materia": materia,
        "nombre_materia": MATERIAS.get(materia, {}).get("nombre", materia),
        "resultado": resultado,
    }


@app.get("/ejercicio/{materia}")
def generar_ejercicio(materia: str, dificultad: str = "medio"):
    """
    Genera un ejercicio aleatorio de la materia indicada con solución paso a paso.
    Materias: algebra, calculo, estadistica, aritmetica, geometria, logica
    Dificultades: facil, medio, dificil
    """
    from ejercicio_engine import generator, MATERIAS

    if materia not in MATERIAS:
        raise HTTPException(
            status_code=400,
            detail=f"Materia '{materia}' no soportada. Usa: {', '.join(MATERIAS.keys())}",
        )
    if dificultad not in ("facil", "medio", "dificil"):
        raise HTTPException(status_code=400, detail="Dificultad debe ser: facil, medio, dificil")

    ejercicio = generator.generar(materia=materia, dificultad=dificultad)

    return {
        "ok": True,
        "ejercicio": ejercicio,
    }


@app.get("/materias")
def get_materias():
    """Lista las materias soportadas con sus temas y niveles de dificultad."""
    from ejercicio_engine import MATERIAS

    return {
        "ok": True,
        "materias": [
            {
                "id": mat_id,
                "nombre": info["nombre"],
                "icono": info["icono"],
                "temas": info["temas"],
                "dificultades": ["facil", "medio", "dificil"],
            }
            for mat_id, info in MATERIAS.items()
        ],
    }


@app.get("/stats")
def get_stats():
    """Retorna estadísticas de uso del clasificador."""
    conteo: dict[str, int] = {cat: 0 for cat in CATEGORY_NAMES}

    for entry in clasificaciones_log:
        cat = entry.get("categoria")
        if cat in conteo:
            conteo[cat] += 1

    total = sum(conteo.values())
    stats = []
    for cat_id, count in conteo.items():
        stats.append({
            "categoria": cat_id,
            "nombre": CATEGORY_NAMES.get(cat_id, cat_id),
            "icono": CATEGORY_ICONS.get(cat_id, "💬"),
            "color": CATEGORY_COLORS.get(cat_id, "#6B7280"),
            "count": count,
            "porcentaje": round((count / total * 100) if total > 0 else 0, 1),
        })

    stats.sort(key=lambda x: x["count"], reverse=True)

    return {
        "ok": True,
        "total_clasificaciones": total,
        "categorias": stats,
    }


@app.get("/categorias")
def get_categorias():
    """Lista las categorías disponibles."""
    return {
        "ok": True,
        "categorias": [
            {
                "id": cat_id,
                "nombre": nombre,
                "icono": CATEGORY_ICONS.get(cat_id, "💬"),
                "color": CATEGORY_COLORS.get(cat_id, "#6B7280"),
            }
            for cat_id, nombre in CATEGORY_NAMES.items()
        ],
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)

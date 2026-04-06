"""
classifier.py — Módulo de clasificación BERT para Assura
Usa bert-base-multilingual-cased con embeddings por similitud de coseno
(Transfer Learning: se usan las representaciones internas de BERT sin fine-tuning adicional,
lo que permite clasificación inmediata con el dataset propio)
"""

import json
import numpy as np
from pathlib import Path
from transformers import AutoTokenizer, AutoModel
import torch
import torch.nn.functional as F


BASE_DIR = Path(__file__).parent

# ── Cargar dataset ──────────────────────────────────────────────────────────────
with open(BASE_DIR / "dataset.json", encoding="utf-8") as f:
    DATASET = json.load(f)

# ── Cargar respuestas ───────────────────────────────────────────────────────────
with open(BASE_DIR / "responses.json", encoding="utf-8") as f:
    RESPONSES = json.load(f)

# ── Nombres de categorías ───────────────────────────────────────────────────────
CATEGORY_NAMES = {
    "metodologia_estudio": "Metodología de Estudio",
    "dificultades_academicas": "Dificultades Académicas",
    "orientacion_academica": "Orientación Académica",
    "estres_presion": "Estrés o Presión Académica",
    "solicitud_asesoria": "Solicitud de Asesoría",
    "solicitud_ejercicio": "Solicitud de Ejercicios",
    "envio_ejercicio": "Envío de Ejercicio",
}

# ── Iconos por categoría ────────────────────────────────────────────────────────
CATEGORY_ICONS = {
    "metodologia_estudio": "📖",
    "dificultades_academicas": "⚠️",
    "orientacion_academica": "🧭",
    "estres_presion": "💆",
    "solicitud_asesoria": "🤝",
    "solicitud_ejercicio": "✏️",
    "envio_ejercicio": "🧮",
}

# ── Colores por categoría ───────────────────────────────────────────────────────
CATEGORY_COLORS = {
    "metodologia_estudio": "#3B82F6",
    "dificultades_academicas": "#EF4444",
    "orientacion_academica": "#10B981",
    "estres_presion": "#F59E0B",
    "solicitud_asesoria": "#8B5CF6",
    "solicitud_ejercicio": "#06B6D4",
    "envio_ejercicio": "#EC4899",
}


class BERTClassifier:
    """
    Clasificador académico basado en BERT con Transfer Learning.
    
    Utiliza bert-base-multilingual-cased (soporta español) para generar
    embeddings contextuales de los mensajes. Aplica similitud de coseno
    entre el embedding del mensaje entrante y los embeddings prototipo
    de cada categoría calculados sobre el dataset de entrenamiento.
    
    Esto constituye Transfer Learning: se reutilizan las representaciones
    aprendidas por BERT sobre grandes corpus multilingües y se adaptan
    a la tarea de clasificación académica sin necesidad de fine-tuning
    completo (que requeriría miles de ejemplos y GPU).
    """

    MODEL_NAME = "bert-base-multilingual-cased"

    def __init__(self):
        self.tokenizer = None
        self.model = None
        self.category_embeddings: dict[str, np.ndarray] = {}
        self._loaded = False

    def load(self):
        """Carga el modelo BERT y pre-computa los embeddings del dataset."""
        print("🔄 Cargando tokenizador BERT...")
        self.tokenizer = AutoTokenizer.from_pretrained(self.MODEL_NAME)

        print("🔄 Cargando modelo BERT (bert-base-multilingual-cased)...")
        self.model = AutoModel.from_pretrained(self.MODEL_NAME)
        self.model.eval()  # Modo inferencia (Transfer Learning: pesos fijos)
        print("✅ Modelo BERT cargado correctamente")

        print("🔄 Pre-computando embeddings del dataset de entrenamiento...")
        for categoria in DATASET["categorias"]:
            cat_id = categoria["id"]
            ejemplos = categoria["ejemplos"]
            embeddings = [self._encode(e) for e in ejemplos]
            # Prototipo: promedio de todos los embeddings de la categoría
            self.category_embeddings[cat_id] = np.mean(embeddings, axis=0)
            print(f"   ✅ Categoría '{cat_id}' ({len(ejemplos)} ejemplos)")

        self._loaded = True
        total_examples = sum(len(c["ejemplos"]) for c in DATASET["categorias"])
        print(f"🚀 Clasificador BERT listo — {len(DATASET['categorias'])} categorías, {total_examples} ejemplos totales")

    def _encode(self, text: str) -> np.ndarray:
        """
        Convierte texto a embedding usando BERT (CLS token representation).
        Este es el núcleo del Transfer Learning: BERT genera una representación
        vectorial densa que captura el significado semántico del texto.
        """
        inputs = self.tokenizer(
            text,
            return_tensors="pt",
            truncation=True,
            max_length=512,
            padding=True,
        )
        with torch.no_grad():
            outputs = self.model(**inputs)
        # Usamos el token [CLS] como representación global del texto
        cls_embedding = outputs.last_hidden_state[:, 0, :].squeeze().numpy()
        return cls_embedding

    def classify(self, mensaje: str) -> dict:
        """
        Clasifica un mensaje en una de las 7 categorías académicas.
        Cuando la categoría es solicitud_ejercicio o envio_ejercicio,
        invoca el motor de ejercicios para resolver/generar.
        
        Returns:
            dict con categoria, nombre, confianza, icono, color, respuesta, recursos
            + campos adicionales del motor de ejercicios si aplica
        """
        if not self._loaded:
            raise RuntimeError("El clasificador no está cargado. Llama a load() primero.")

        # 1. Generar embedding del mensaje entrante
        msg_embedding = self._encode(mensaje)

        # 2. Calcular similitud de coseno con cada prototipo de categoría
        scores = {}
        for cat_id, proto_embedding in self.category_embeddings.items():
            msg_tensor = torch.tensor(msg_embedding).unsqueeze(0)
            proto_tensor = torch.tensor(proto_embedding).unsqueeze(0)
            similarity = F.cosine_similarity(msg_tensor, proto_tensor).item()
            scores[cat_id] = similarity

        # 3. La categoría ganadora es la de mayor similitud
        best_category = max(scores, key=scores.get)
        best_score = scores[best_category]

        # 4. Normalizar scores a probabilidades con softmax para confianza
        score_values = np.array(list(scores.values()))
        softmax_scores = np.exp(score_values) / np.sum(np.exp(score_values))
        confianza = float(softmax_scores[list(scores.keys()).index(best_category)])

        # 5. Obtener respuesta y recursos para la categoría
        resp_data = RESPONSES.get(best_category, {})

        result = {
            "categoria": best_category,
            "nombre_categoria": CATEGORY_NAMES.get(best_category, best_category),
            "icono": CATEGORY_ICONS.get(best_category, "💬"),
            "color": CATEGORY_COLORS.get(best_category, "#6B7280"),
            "confianza": round(confianza, 4),
            "scores": {k: round(float(v), 4) for k, v in scores.items()},
            "respuesta": resp_data.get("respuesta", "Gracias por tu mensaje. Un asesor te contactará pronto."),
            "recursos": resp_data.get("recursos", []),
            "consejo_rapido": resp_data.get("consejo_rapido", ""),
        }

        # 6. Si es categoría de ejercicios, invocar el motor
        if best_category in ("solicitud_ejercicio", "envio_ejercicio"):
            result["ejercicio_data"] = self._process_exercise(best_category, mensaje)

        return result

    def _process_exercise(self, category: str, mensaje: str) -> dict:
        """Procesa ejercicios usando el motor de resolución/generación."""
        from ejercicio_engine import solver, generator, detectar_materia, MATERIAS

        materia = detectar_materia(mensaje)

        if category == "envio_ejercicio":
            # El estudiante envió un ejercicio → resolverlo
            solucion = solver.solve(mensaje)
            return {
                "tipo_accion": "resolucion",
                "materia_detectada": materia,
                "nombre_materia": MATERIAS.get(materia, {}).get("nombre", materia),
                "solucion": solucion,
            }
        else:
            # El estudiante pide un ejercicio → generar uno
            ejercicio = generator.generar(materia=materia, dificultad="medio")
            return {
                "tipo_accion": "generacion",
                "materia_detectada": materia,
                "nombre_materia": MATERIAS.get(materia, {}).get("nombre", materia),
                "ejercicio": ejercicio,
            }

    def is_loaded(self) -> bool:
        return self._loaded


# Instancia global del clasificador
classifier = BERTClassifier()

const express = require("express");
const router = express.Router();
const ChatbotIAController = require("../controllers/chatbot-ia.controller.cjs");

// POST: Procesar mensaje del usuario y obtener respuesta inteligente
router.post("/procesar-mensaje", async (req, res) => {
  try {
    const { idEstudiante, mensaje, sesionId } = req.body;

    if (!idEstudiante || !mensaje) {
      return res.status(400).json({
        ok: false,
        error: "Faltan datos requeridos"
      });
    }

    const resultado = await ChatbotIAController.procesarMensaje(idEstudiante, mensaje);

    // Guardar en historial
    await ChatbotIAController.guardarHistorialChatbot(
      idEstudiante,
      mensaje,
      resultado.respuesta,
      resultado.materia,
      sesionId
    );

    res.json({
      ok: true,
      respuesta: resultado.respuesta,
      materia: resultado.materia,
      sentimiento: resultado.sentimiento,
      calidad: resultado.calidad,
      recomendaciones: resultado.recomendaciones
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      ok: false,
      error: "Error al procesar mensaje"
    });
  }
});

// GET: Obtener resumen de desempeño
router.get("/resumen-desempeño/:idEstudiante", async (req, res) => {
  try {
    const { idEstudiante } = req.params;
    const desempeño = await ChatbotIAController.obtenerResumenDesempeño(idEstudiante);

    res.json({
      ok: true,
      desempeño
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      ok: false,
      error: "Error al obtener resumen"
    });
  }
});

// GET: Obtener recomendaciones activas
router.get("/recomendaciones/:idEstudiante", async (req, res) => {
  try {
    const { idEstudiante } = req.params;
    const recomendaciones = await ChatbotIAController.obtenerRecomendacionesActivas(idEstudiante);

    res.json({
      ok: true,
      recomendaciones
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      ok: false,
      error: "Error al obtener recomendaciones"
    });
  }
});

// GET: Analizar patrones
router.get("/analizar-patrones/:idEstudiante", async (req, res) => {
  try {
    const { idEstudiante } = req.params;
    const patrones = await ChatbotIAController.analizarPatrones(idEstudiante);

    res.json({
      ok: true,
      patrones
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      ok: false,
      error: "Error al analizar patrones"
    });
  }
});

module.exports = router;

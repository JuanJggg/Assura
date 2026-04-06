// Script para crear la tabla chatbot_mensajes en PostgreSQL
// Ejecutar con: node run_migration.cjs

const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "Assura",
  password: "0409156",
  port: 5432,
});

async function runMigration() {
  console.log("🔄 Ejecutando migración: chatbot_mensajes...");
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS chatbot_mensajes (
        id          SERIAL PRIMARY KEY,
        id_estudiante INTEGER NOT NULL,
        mensaje     TEXT    NOT NULL,
        categoria   VARCHAR(60),
        confianza   NUMERIC(5, 4) DEFAULT 0,
        respuesta   TEXT,
        fecha       TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log("✅ Tabla chatbot_mensajes creada/verificada");

    await pool.query(`CREATE INDEX IF NOT EXISTS idx_chatbot_estudiante ON chatbot_mensajes(id_estudiante);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_chatbot_categoria  ON chatbot_mensajes(categoria);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_chatbot_fecha      ON chatbot_mensajes(fecha DESC);`);
    console.log("✅ Índices creados/verificados");

    await pool.query(`
      CREATE OR REPLACE VIEW v_chatbot_resumen AS
      SELECT
        cm.id,
        cm.id_estudiante,
        COALESCE(e.nombres || ' ' || e.apellidos, 'Estudiante #' || cm.id_estudiante) AS nombre_estudiante,
        cm.mensaje,
        cm.categoria,
        cm.confianza,
        cm.respuesta,
        cm.fecha
      FROM chatbot_mensajes cm
      LEFT JOIN estudiante e ON e.id = cm.id_estudiante
      ORDER BY cm.fecha DESC;
    `);
    console.log("✅ Vista v_chatbot_resumen creada/actualizada");

    console.log("\n🎉 Migración completada con éxito!");
  } catch (err) {
    console.error("❌ Error en migración:", err.message);
  } finally {
    await pool.end();
  }
}

runMigration();

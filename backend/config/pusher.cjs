const Pusher = require("pusher");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

console.log("🔧 Inicializando Pusher con:");
console.log("   APP_ID:", process.env.PUSHER_APP_ID);
console.log("   KEY:", process.env.PUSHER_KEY);
console.log("   SECRET:", process.env.PUSHER_SECRET ? "***" + process.env.PUSHER_SECRET.slice(-4) : "NO DEFINIDO");
console.log("   CLUSTER:", process.env.PUSHER_CLUSTER);

if (!process.env.PUSHER_APP_ID || !process.env.PUSHER_KEY || !process.env.PUSHER_SECRET || !process.env.PUSHER_CLUSTER) {
  console.error("⚠️ ADVERTENCIA: Faltan credenciales de Pusher en el archivo .env");
}

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
  useTLS: true,
});

console.log("✅ Pusher inicializado correctamente\n");

module.exports = pusher;

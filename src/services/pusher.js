import Pusher from "pusher-js";

// Habilitar logs de Pusher para debug (quitar en producción)
Pusher.logToConsole = true;

console.log("Inicializando Pusher...");
console.log("Key:", import.meta.env.VITE_PUSHER_KEY);
console.log("Cluster:", import.meta.env.VITE_PUSHER_CLUSTER);

const pusher = new Pusher(import.meta.env.VITE_PUSHER_KEY, {
  cluster: import.meta.env.VITE_PUSHER_CLUSTER,
  forceTLS: true,
  // Reconexión automática
  activityTimeout: 120000,
  pongTimeout: 30000,
});

pusher.connection.bind("connected", () => {
  console.log("✅ Pusher conectado - Socket ID:", pusher.connection.socket_id);
});

pusher.connection.bind("error", (err) => {
  console.error("❌ Error Pusher:", err);
});

pusher.connection.bind("disconnected", () => {
  console.warn("⚠️ Pusher desconectado - reintentando...");
});

pusher.connection.bind("unavailable", () => {
  console.warn("⚠️ Pusher no disponible - verificar conexión");
});

pusher.connection.bind("state_change", (states) => {
  console.log("Pusher:", states.previous, "→", states.current);
});

export default pusher;

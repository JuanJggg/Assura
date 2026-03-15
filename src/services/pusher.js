import Pusher from "pusher-js";

console.log("🔧 Inicializando Pusher con:");
console.log("  Key:", import.meta.env.VITE_PUSHER_KEY);
console.log("  Cluster:", import.meta.env.VITE_PUSHER_CLUSTER);

const pusher = new Pusher(import.meta.env.VITE_PUSHER_KEY, {
  cluster: import.meta.env.VITE_PUSHER_CLUSTER,
  encrypted: true,
});

pusher.connection.bind("connected", () => {
  console.log("✅ Pusher conectado exitosamente");
  console.log("   Socket ID:", pusher.connection.socket_id);
});

pusher.connection.bind("error", (err) => {
  console.error("❌ Error de conexión Pusher:", err);
});

pusher.connection.bind("disconnected", () => {
  console.warn("⚠️ Pusher desconectado");
});

export default pusher;

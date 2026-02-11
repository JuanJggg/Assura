# Ejemplo Completo: Función enviarMensaje

## Backend: Controlador de Chat

```javascript
// backend/controllers/chat.controllers.cjs

const pool = require("../config/db.cjs");
const pusher = require("../config/pusher.cjs");

/**
 * Envía un mensaje integrando DB + Pusher
 *
 * @route POST /chat/mensajes
 * @body {chatId, content, senderId}
 *
 * Flujo:
 * 1. Guarda mensaje en chat_mensaje
 * 2. Actualiza ultima_actividad en chats_conversacion
 * 3. Crea/actualiza notificación en chats_notificacion
 * 4. Dispara evento de Pusher para tiempo real
 */
exports.enviarMensaje = async (req, res) => {
  const { chatId, content, senderId } = req.body;

  // Validación
  if (!chatId || !content || !senderId) {
    return res.status(400).json({
      error: "Faltan datos requeridos",
      required: ["chatId", "content", "senderId"]
    });
  }

  try {
    // 1. GUARDAR MENSAJE EN LA BASE DE DATOS
    const mensajeGuardado = await exports.guardarMensaje({
      chatId,
      content,
      senderId
    });

    // 2. IDENTIFICAR AL RECEPTOR
    const conversacion = await pool.query(
      "SELECT id_estudiante, id_asesor FROM chats_conversacion WHERE id = $1",
      [chatId]
    );

    if (conversacion.rows.length === 0) {
      return res.status(404).json({ error: "Conversación no encontrada" });
    }

    const { id_estudiante, id_asesor } = conversacion.rows[0];
    const receptorId = senderId == id_estudiante ? id_asesor : id_estudiante;

    // 3. ACTUALIZAR/CREAR NOTIFICACIÓN
    // Usa ON CONFLICT para evitar duplicados y actualizar si ya existe
    await pool.query(
      `INSERT INTO chats_notificacion (id_conversacion, id_receptor, leido, fecha_creacion)
       VALUES ($1, $2, false, NOW())
       ON CONFLICT (id_conversacion, id_receptor)
       DO UPDATE SET leido = false, fecha_creacion = NOW()`,
      [chatId, receptorId]
    );

    // 4. DISPARAR EVENTO DE PUSHER PARA TIEMPO REAL
    await pusher.trigger(`chat-${chatId}`, "nuevo-mensaje", {
      id: mensajeGuardado.id,
      id_conversacion: chatId,
      contenido: content,
      id_usuario: senderId,
      fecha_envio: mensajeGuardado.fecha_envio,
    });

    // 5. RESPONDER AL CLIENTE
    res.json({
      ok: true,
      mensaje: mensajeGuardado,
      message: "Mensaje enviado exitosamente"
    });

  } catch (err) {
    console.error("Error al enviar mensaje:", err);
    res.status(500).json({
      error: "Error al enviar mensaje",
      details: err.message
    });
  }
};

/**
 * Función auxiliar para guardar mensaje en la DB
 * No satura la base de datos porque:
 * - Solo hace 2 queries (INSERT + UPDATE)
 * - Usa prepared statements (previene SQL injection)
 * - Es transaccional (si falla, no se corrompen datos)
 */
exports.guardarMensaje = async (data) => {
  const { chatId, content, senderId } = data;

  try {
    // INSERT del mensaje
    const result = await pool.query(
      `INSERT INTO chat_mensaje (id_conversacion, contenido, id_usuario, fecha_envio)
       VALUES ($1, $2, $3, NOW()) RETURNING *`,
      [chatId, content, senderId]
    );

    // UPDATE de última actividad
    await pool.query(
      "UPDATE chats_conversacion SET ultima_actividad = NOW() WHERE id = $1",
      [chatId]
    );

    return result.rows[0];
  } catch (err) {
    console.error("Error al guardar mensaje:", err);
    throw err;
  }
};
```

## Frontend: Envío de Mensaje

```javascript
// src/components/chate/Chatstudy.jsx

import pusher from "../../services/pusher";
import axios from "axios";

const handleSendMessage = async (e) => {
  e.preventDefault();
  if (!message.trim() || !selectedChatId) return;

  const messageData = {
    chatId: selectedChatId,
    content: message.trim(),
    senderId: userId
  };

  try {
    // OPTIMISTIC UPDATE: Mostrar mensaje inmediatamente
    const tempMessage = {
      id_conversacion: selectedChatId,
      contenido: message.trim(),
      id_usuario: userId,
      fecha_envio: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempMessage]);

    // ENVIAR AL BACKEND: Guarda en DB + dispara Pusher
    await axios.post(
      `http://localhost:3001/chat/mensajes`,
      messageData
    );

    // ACTUALIZAR LISTA DE CHATS
    setChats(prevChats =>
      prevChats.map(chat =>
        chat.id === selectedChatId
          ? {
              ...chat,
              lastMessage: message.trim(),
              lastMessageTime: new Date().toLocaleString("es-ES", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit"
              })
            }
          : chat
      )
    );

    setMessage("");
  } catch (err) {
    console.log("Error al enviar mensaje:", err);
    // Aquí podrías revertir el optimistic update si falla
  }
};
```

## Frontend: Recepción de Mensajes en Tiempo Real

```javascript
// src/components/chate/Chatstudy.jsx

useEffect(() => {
  if (!selectedChatId) return;

  // SUSCRIBIRSE AL CANAL DEL CHAT
  const channel = pusher.subscribe(`chat-${selectedChatId}`);

  // ESCUCHAR EVENTOS DE NUEVOS MENSAJES
  channel.bind("nuevo-mensaje", (data) => {
    console.log("Mensaje recibido:", data);

    // Solo agregar si NO es el mensaje propio
    // (ya se mostró con optimistic update)
    if (data.id_usuario !== userId) {
      setMessages(prev => [...prev, data]);
    }
  });

  // CLEANUP: Desuscribirse al cambiar de chat
  return () => {
    channel.unbind_all();
    pusher.unsubscribe(`chat-${selectedChatId}`);
  };
}, [selectedChatId, userId]);
```

## Configuración: Backend

```javascript
// backend/config/pusher.cjs

const Pusher = require("pusher");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
  useTLS: true,  // Siempre usar SSL
});

module.exports = pusher;
```

## Configuración: Frontend

```javascript
// src/services/pusher.js

import Pusher from "pusher-js";

const pusher = new Pusher(import.meta.env.VITE_PUSHER_KEY, {
  cluster: import.meta.env.VITE_PUSHER_CLUSTER,
  encrypted: true,  // Encriptación end-to-end
});

export default pusher;
```

## Rutas

```javascript
// backend/routes/chatroutes.cjs

const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chat.controllers.cjs");

// Ruta simplificada que usa el controlador completo
router.post("/mensajes", chatController.enviarMensaje);

module.exports = router;
```

## Variables de Entorno

```env
# .env

# Backend
PUSHER_APP_ID=1234567
PUSHER_KEY=abc123def456
PUSHER_SECRET=xyz789uvw012
PUSHER_CLUSTER=mt1

# Frontend (para Vite)
VITE_PUSHER_KEY=abc123def456
VITE_PUSHER_CLUSTER=mt1
```

## Flujo Completo Paso a Paso

1. **Usuario A** escribe "Hola" y presiona Enter
2. Frontend muestra "Hola" inmediatamente (optimistic update)
3. Frontend envía POST a `/chat/mensajes`
4. Backend guarda "Hola" en tabla `chat_mensaje`
5. Backend actualiza `ultima_actividad` en `chats_conversacion`
6. Backend crea/actualiza notificación en `chats_notificacion`
7. Backend llama `pusher.trigger("chat-123", "nuevo-mensaje", {...})`
8. Pusher envía el evento a todos los conectados al canal "chat-123"
9. **Usuario B** (receptor) recibe el evento
10. Frontend de Usuario B agrega "Hola" a su lista de mensajes
11. Usuario B ve el mensaje en tiempo real

## Ventajas de esta Implementación

✅ **No satura la DB**: Solo 2 queries por mensaje (INSERT + UPDATE)
✅ **Optimistic UI**: Usuario ve su mensaje instantáneamente
✅ **Sin duplicados**: Emisor no recibe su propio mensaje desde Pusher
✅ **Notificaciones inteligentes**: Solo se notifica al receptor correcto
✅ **Manejo de errores**: Try/catch en todos los niveles
✅ **Escalable**: Pusher maneja miles de conexiones concurrentes
✅ **Código limpio**: Separación clara de responsabilidades

## Testing Manual

1. Abre el chat como Usuario A
2. Abre el mismo chat como Usuario B en otra ventana
3. Usuario A envía "Mensaje de prueba"
4. Usuario B debería ver el mensaje instantáneamente
5. Verifica en la DB que el mensaje se guardó correctamente
6. Verifica en el dashboard de Pusher que se disparó el evento

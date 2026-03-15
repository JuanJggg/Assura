# Migración de Socket.io a Pusher

## Resumen de Cambios

Se ha completado exitosamente la migración del sistema de chat de Socket.io a Pusher, eliminando la dependencia de un servidor WebSocket propio.

## Arquitectura Implementada

### Backend (Node.js/Express)

**Archivos Modificados:**
- `backend/config/pusher.cjs` - Configuración de Pusher
- `backend/controllers/chat.controllers.cjs` - Controlador con lógica de mensajes + Pusher
- `backend/routes/chatroutes.cjs` - Rutas optimizadas
- `backend/index.cjs` - Servidor sin Socket.io

**Función Principal: `enviarMensaje`**

```javascript
exports.enviarMensaje = async (req, res) => {
  const { chatId, content, senderId } = req.body;

  // 1. Guarda el mensaje en chat_mensaje
  const mensajeGuardado = await exports.guardarMensaje({ chatId, content, senderId });

  // 2. Identifica al receptor
  const conversacion = await pool.query(
    "SELECT id_estudiante, id_asesor FROM chats_conversacion WHERE id = $1",
    [chatId]
  );
  const receptorId = senderId == id_estudiante ? id_asesor : id_estudiante;

  // 3. Actualiza/crea notificación en chats_notificacion
  await pool.query(
    `INSERT INTO chats_notificacion (id_conversacion, id_receptor, leido, fecha_creacion)
     VALUES ($1, $2, false, NOW())
     ON CONFLICT (id_conversacion, id_receptor)
     DO UPDATE SET leido = false, fecha_creacion = NOW()`,
    [chatId, receptorId]
  );

  // 4. Dispara evento en Pusher para tiempo real
  await pusher.trigger(`chat-${chatId}`, "nuevo-mensaje", {
    id: mensajeGuardado.id,
    id_conversacion: chatId,
    contenido: content,
    id_usuario: senderId,
    fecha_envio: mensajeGuardado.fecha_envio,
  });

  res.json({ ok: true, mensaje: mensajeGuardado });
};
```

### Frontend (React)

**Archivos Modificados:**
- `src/services/pusher.js` - Cliente de Pusher
- `src/components/chate/Chatstudy.jsx` - Componente de chat con Pusher

**Archivos Eliminados:**
- `src/socket.js` - Ya no se necesita

**Lógica de Suscripción:**

```javascript
useEffect(() => {
  if (!selectedChatId) return;

  // Suscribirse al canal del chat
  const channel = pusher.subscribe(`chat-${selectedChatId}`);

  // Escuchar eventos de nuevos mensajes
  channel.bind("nuevo-mensaje", (data) => {
    if (data.id_usuario !== userId) {
      setMessages(prev => [...prev, data]);
    }
  });

  // Cleanup
  return () => {
    channel.unbind_all();
    pusher.unsubscribe(`chat-${selectedChatId}`);
  };
}, [selectedChatId, userId]);
```

## Configuración Requerida

### 1. Crear Cuenta en Pusher

1. Visita [pusher.com](https://pusher.com)
2. Crea una cuenta gratuita
3. Crea una nueva app en Channels
4. Obtén tus credenciales

### 2. Configurar Variables de Entorno

Edita el archivo `.env` en la raíz del proyecto:

```env
# Backend
PUSHER_APP_ID=tu_app_id
PUSHER_KEY=tu_key
PUSHER_SECRET=tu_secret
PUSHER_CLUSTER=mt1

# Frontend
VITE_PUSHER_KEY=tu_key
VITE_PUSHER_CLUSTER=mt1
```

### 3. Instalar Dependencias

```bash
# Frontend
npm install pusher-js

# Backend
cd backend
npm install pusher dotenv
```

## Tablas de Base de Datos Utilizadas

Se mantienen las tablas existentes sin cambios:

1. **chats_conversacion** - Almacena las conversaciones
2. **chat_mensaje** - Almacena los mensajes
3. **chats_notificacion** - Almacena las notificaciones de mensajes no leídos

## Optimizaciones Implementadas

### 1. Sin Duplicación de Mensajes
- El emisor no recibe su propio mensaje desde Pusher (ya lo ve localmente)
- Solo el receptor recibe la notificación en tiempo real

### 2. Optimistic Updates
- El mensaje se muestra inmediatamente en la UI del emisor
- Se guarda en la base de datos de forma asíncrona

### 3. Manejo de Estado Limpio
- Suscripción/desuscripción automática al cambiar de chat
- Cleanup de eventos al desmontar el componente

### 4. Una Sola Fuente de Verdad
- La base de datos es la fuente principal
- Pusher solo notifica cambios en tiempo real
- Al cargar un chat, siempre se obtienen mensajes desde la DB

## Beneficios de la Migración

✅ **Sin servidor WebSocket propio** - Elimina complejidad de infraestructura
✅ **Escalabilidad** - Pusher maneja millones de conexiones concurrentes
✅ **Confiabilidad** - SLA del 99.9% garantizado por Pusher
✅ **Menor latencia** - CDN global de Pusher
✅ **Código más limpio** - Menos lógica de manejo de conexiones
✅ **Seguridad mejorada** - Pusher maneja autenticación y encriptación

## Flujo Completo de Envío de Mensaje

1. Usuario escribe mensaje en el frontend
2. Frontend hace POST a `/chat/mensajes`
3. Backend guarda mensaje en `chat_mensaje`
4. Backend actualiza `ultima_actividad` en `chats_conversacion`
5. Backend crea/actualiza notificación en `chats_notificacion`
6. Backend dispara evento `nuevo-mensaje` en Pusher
7. Pusher envía el mensaje al receptor en tiempo real
8. Frontend del receptor recibe y muestra el mensaje

## Testing

Para probar el sistema:

1. Inicia el backend: `cd backend && node index.cjs`
2. Inicia el frontend: `npm run dev`
3. Abre dos navegadores con diferentes usuarios
4. Inicia una conversación
5. Envía mensajes y verifica que se reciban en tiempo real

## Notas Importantes

- **Plan Gratuito de Pusher**: 200k mensajes/día, 100 conexiones concurrentes
- **Channels**: Cada conversación tiene su propio canal `chat-{id}`
- **Eventos**: Solo se usa el evento `nuevo-mensaje`
- **Compatibilidad**: Funciona en todos los navegadores modernos

## Troubleshooting

### Error: "Failed to subscribe"
- Verifica que las credenciales de Pusher estén correctas
- Verifica que el cluster sea correcto (ej: mt1, us2, eu, ap1)

### Mensajes no llegan en tiempo real
- Verifica la consola del navegador
- Verifica los logs del backend
- Verifica el dashboard de Pusher para ver eventos

### Conexión se desconecta constantemente
- Verifica tu conexión a internet
- Verifica que no haya firewall bloqueando WebSockets

## Soporte

Para más información sobre Pusher:
- [Documentación de Pusher](https://pusher.com/docs)
- [Pusher Channels JavaScript SDK](https://github.com/pusher/pusher-js)
- [Node.js Server SDK](https://github.com/pusher/pusher-http-node)

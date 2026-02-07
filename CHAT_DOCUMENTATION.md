# Documentación del Sistema de Chat en Tiempo Real

## Descripción General

El sistema de chat en tiempo real permite la comunicación instantánea entre **estudiantes** y **asesores** usando Socket.io y PostgreSQL.

## Arquitectura

### Backend (Node.js + Express + Socket.io)

**Archivo principal:** `backend/index.cjs`

- **Socket.io Server** configurado en el puerto 3001
- **Eventos Socket.io:**
  - `connection`: Cuando un usuario se conecta
  - `unirse`: Para unirse a una sala específica de chat
  - `mensaje`: Para enviar/recibir mensajes en tiempo real
  - `disconnect`: Cuando un usuario se desconecta

**Controller:** `backend/controllers/chat.controllers.cjs`

- `crearConversacion`: Crea o recupera una conversación entre estudiante y asesor
- `getConversacion`: Obtiene todas las conversaciones de un usuario
- `getMensajes`: Obtiene todos los mensajes de una conversación
- `guardarMensaje`: Guarda un mensaje en la base de datos

### Frontend (React)

**Componente Estudiante:** `src/components/chate/Chatstudy.jsx`
- Carga conversaciones del estudiante con sus asesores
- Se conecta al socket cuando se monta el componente
- Escucha mensajes en tiempo real

**Componente Asesor:** `src/components/asesor/Chatbot.jsx`
- Carga conversaciones del asesor con sus estudiantes
- Funcionalidad idéntica al componente de estudiante pero con datos de asesores

## Estructura de Base de Datos

### Tabla: `chats_conversacion`
```sql
CREATE TABLE chats_conversacion (
  id SERIAL PRIMARY KEY,
  id_estudiante INTEGER REFERENCES estudiante(id),
  id_asesor INTEGER REFERENCES asesor(id),
  ultima_actividad TIMESTAMP DEFAULT NOW()
);
```

### Tabla: `chat_mensaje`
```sql
CREATE TABLE chat_mensaje (
  id SERIAL PRIMARY KEY,
  id_conversacion INTEGER REFERENCES chats_conversacion(id),
  contenido TEXT NOT NULL,
  id_usuario INTEGER NOT NULL,
  fecha_envio TIMESTAMP DEFAULT NOW()
);
```

## Flujo de Funcionamiento

### 1. Crear una Conversación (Estudiante → Asesor)

**Frontend (App.jsx):**
```javascript
const handleClick = async (asesorId) => {
  const res = await axios.post(
    "http://localhost:3001/chat/crearConversacion",
    {
      id_estudiante: usuario.id,
      id_asesor: asesorId
    }
  );

  navigate("/Chatstudy", {
    state: { chatId: res.data.conversacion.id }
  });
};
```

### 2. Cargar Conversaciones

**Para Estudiantes:**
```javascript
GET /chat/getConversacion/estudiante/:id
```

**Para Asesores:**
```javascript
GET /chat/getConversacion/asesor/:id
```

### 3. Conectar al Socket

```javascript
useEffect(() => {
  socketRef.current = io("http://localhost:3001", {
    transports: ["websocket", "polling"],
  });

  socketRef.current.on("connect", () => {
    console.log("Socket conectado");
  });

  socketRef.current.on("mensaje", (data) => {
    if (selectedChatId && data.id_conversacion === selectedChatId) {
      setMessages(prev => [...prev, data]);
    }
  });

  return () => {
    socketRef.current.disconnect();
  };
}, [selectedChatId]);
```

### 4. Unirse a una Sala de Chat

```javascript
useEffect(() => {
  if (selectedChatId && socketRef.current) {
    socketRef.current.emit("unirse", { chatId: selectedChatId });
  }
}, [selectedChatId]);
```

### 5. Enviar un Mensaje

```javascript
const handleSendMessage = async (e) => {
  e.preventDefault();

  const messageData = {
    chatId: selectedChatId,
    content: message.trim(),
    senderId: userId
  };

  // Agregar mensaje localmente (optimistic update)
  const tempMessage = {
    id_conversacion: selectedChatId,
    contenido: message.trim(),
    id_remitente: userId,
    id_usuario: userId,
    fecha_envio: new Date().toISOString()
  };
  setMessages(prev => [...prev, tempMessage]);

  // Enviar por socket
  socketRef.current.emit("mensaje", messageData);

  // Guardar en base de datos
  await axios.post("http://localhost:3001/chat/mensajes", messageData);
};
```

### 6. Recibir Mensajes en Tiempo Real

El backend recibe el mensaje y lo emite a todos los usuarios en la sala:

```javascript
socket.on("mensaje", async (data) => {
  const mensajeGuardado = await guardarMensaje(data);

  io.to(`chat-${data.chatId}`).emit("mensaje", {
    id: mensajeGuardado.id,
    id_conversacion: data.chatId,
    contenido: data.content,
    id_usuario: mensajeGuardado.id_usuario,
    fecha_envio: mensajeGuardado.fecha_envio
  });
});
```

## Características Clave

### ✅ Mensajes en Tiempo Real
- Los mensajes se envían y reciben instantáneamente usando Socket.io
- Actualizaciones automáticas sin necesidad de recargar la página

### ✅ Persistencia de Datos
- Todos los mensajes se guardan en PostgreSQL
- Historial completo de conversaciones disponible

### ✅ Optimistic Updates
- Los mensajes aparecen inmediatamente para el remitente
- Mejora la experiencia del usuario

### ✅ Auto-scroll
- El chat se desplaza automáticamente al último mensaje
- Solo cuando se agregan nuevos mensajes

### ✅ Salas de Chat
- Cada conversación tiene su propia sala en Socket.io
- Los mensajes solo se envían a los participantes de la conversación

## Cómo Usar el Chat

### Para Estudiantes:

1. Ir al **Dashboard**
2. Buscar un asesor disponible
3. Hacer clic en **"Contactar"**
4. Se crea/abre la conversación automáticamente
5. Navegar a **"Chats"** en el menú lateral
6. Seleccionar la conversación y comenzar a chatear

### Para Asesores:

1. Ir a **"Asesor"** en el menú
2. Hacer clic en la pestaña **"Chats"**
3. Verás todas las conversaciones con estudiantes
4. Seleccionar una conversación para responder

## Solución de Problemas

### El socket no se conecta

Verificar que el backend esté corriendo:
```bash
cd backend
npm start
```

### Los mensajes no se envían

Verificar la consola del navegador:
```javascript
console.log("Socket conectado:", socketRef.current?.connected);
```

### Los mensajes no se guardan en la base de datos

Verificar que PostgreSQL esté corriendo y las credenciales en `backend/config/db.cjs` sean correctas.

### Error: "Cannot read properties of null"

Asegurarse de que el usuario esté logueado:
```javascript
const usuario = JSON.parse(localStorage.getItem("usuario"));
if (!usuario || !usuario.id) {
  navigate("/login");
}
```

## Mejoras Futuras Sugeridas

1. **Notificaciones de mensajes no leídos**
2. **Indicador de "escribiendo..."**
3. **Envío de archivos/imágenes**
4. **Emojis**
5. **Búsqueda de mensajes**
6. **Eliminar/editar mensajes**
7. **Estado online/offline de usuarios**
8. **Confirmación de lectura (check azul)**

## Variables de Entorno

Asegúrate de tener configurado en tu `.env`:

```env
PORT=3001
FRONTEND_URL=http://localhost:5173
```

## Comandos Útiles

```bash
# Iniciar backend
cd backend
npm start

# Iniciar frontend
npm run dev

# Build frontend
npm run build
```

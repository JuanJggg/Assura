# Guía de Depuración del Sistema de Chat

## 🔍 Cómo Verificar que Todo Funciona

Ahora el sistema tiene **logs detallados** en cada paso del proceso. Sigue estos pasos para identificar exactamente dónde está fallando.

---

## 1️⃣ Preparación

### Abrir las Consolas de Desarrollo

**En el Navegador del Estudiante:**
1. Presiona `F12` o `Ctrl+Shift+I` (Windows/Linux) o `Cmd+Option+I` (Mac)
2. Ve a la pestaña **Console**
3. Limpia la consola (icono 🚫 o `Ctrl+L`)

**En el Navegador del Asesor:**
1. Abre una ventana de incógnito o usa otro navegador
2. Presiona `F12` para abrir las herramientas de desarrollo
3. Ve a la pestaña **Console**
4. Limpia la consola

**En la Terminal del Backend:**
1. Asegúrate de que el backend esté corriendo
2. Observa los logs que aparecen

---

## 2️⃣ Verificar Conexión a Pusher

### Cuando Cargues la Página del Chat

**Deberías ver en la CONSOLA DEL NAVEGADOR:**

```
🔧 Inicializando Pusher con:
  Key: 76e3f9405cf16a0f3709
  Cluster: mt1
✅ Pusher conectado exitosamente
   Socket ID: 123456.78901234
```

**Si ves este error:**
```
❌ Error de conexión Pusher: {...}
```

**Solución:**
- Verifica que `VITE_PUSHER_KEY` y `VITE_PUSHER_CLUSTER` estén en tu archivo `.env`
- Reinicia el frontend (`Ctrl+C` y luego `npm run dev`)
- Verifica que las credenciales de Pusher sean correctas

---

## 3️⃣ Verificar Suscripción a Canales

### Cuando Selecciones un Chat

**En la CONSOLA DEL ESTUDIANTE, deberías ver:**

```
📡 Suscribiéndose al canal: chat-1
✅ Suscripción exitosa al canal: chat-1
📡 Suscribiéndose al canal de notificaciones: estudiante-123
✅ Suscripción exitosa al canal: estudiante-123
```

**En la CONSOLA DEL ASESOR, deberías ver:**

```
📡 Suscribiéndose al canal: chat-1
✅ Suscripción exitosa al canal: chat-1
📡 Suscribiéndose al canal de notificaciones: asesor-456
✅ Suscripción exitosa al canal: asesor-456
```

**Si ves este error:**
```
❌ Error al suscribirse al canal chat-1 {...}
```

**Solución:**
- Verifica que las credenciales de Pusher sean correctas
- Ve al [Dashboard de Pusher](https://dashboard.pusher.com/apps/2113838/getting_started)
- Verifica que la app esté activa

---

## 4️⃣ Enviar un Mensaje (ESTUDIANTE → ASESOR)

### Paso 1: Estudiante Envía un Mensaje

**En la CONSOLA DEL ESTUDIANTE:**

```
📤 Enviando mensaje: {chatId: 1, content: "Hola", senderId: 123}
➡️ Llamando al backend: POST http://localhost:3001/chat/mensajes
✅ Respuesta del backend: {ok: true, mensaje: {...}, message: "Mensaje enviado exitosamente"}
```

**En la TERMINAL DEL BACKEND:**

```
====== ENVIAR MENSAJE ======
Datos recibidos: { chatId: 1, content: 'Hola', senderId: 123 }
1. Guardando mensaje en BD...
✓ Mensaje guardado: { id: 789, id_conversacion: 1, contenido: 'Hola', ... }
2. Obteniendo datos de conversación...
✓ Conversación encontrada: { id_estudiante: 123, id_asesor: 456 }
✓ Receptor identificado: 456
3. Creando notificación...
✓ Notificación creada
4. Enviando evento Pusher al canal chat-1
✓ Evento 'nuevo-mensaje' enviado: {}
5. Enviando notificación al canal: asesor-456
✓ Evento 'nuevo-mensaje-notificacion' enviado: {}
====== MENSAJE ENVIADO EXITOSAMENTE ======
```

### Paso 2: Asesor Recibe el Mensaje

**En la CONSOLA DEL ASESOR:**

```
📨 Mensaje recibido en chat-1: {id: 789, id_conversacion: 1, contenido: "Hola", id_usuario: 123, ...}
   Usuario que envió: 123
   Usuario actual: 456
   ¿Es de otro usuario? true
✅ Agregando mensaje a la lista
```

**Y también:**

```
🔔 Notificación de nuevo mensaje: {id_conversacion: 1, mensaje: "Hola"}
```

---

## 5️⃣ Enviar una Respuesta (ASESOR → ESTUDIANTE)

### Paso 1: Asesor Envía una Respuesta

**En la CONSOLA DEL ASESOR:**

```
📤 Enviando mensaje: {chatId: 1, content: "Hola, ¿en qué puedo ayudarte?", senderId: 456}
➡️ Llamando al backend: POST http://localhost:3001/chat/mensajes
✅ Respuesta del backend: {ok: true, mensaje: {...}, message: "Mensaje enviado exitosamente"}
```

**En la TERMINAL DEL BACKEND:**

```
====== ENVIAR MENSAJE ======
Datos recibidos: { chatId: 1, content: 'Hola, ¿en qué puedo ayudarte?', senderId: 456 }
1. Guardando mensaje en BD...
✓ Mensaje guardado: { id: 790, id_conversacion: 1, contenido: 'Hola, ¿en qué puedo ayudarte?', ... }
2. Obteniendo datos de conversación...
✓ Conversación encontrada: { id_estudiante: 123, id_asesor: 456 }
✓ Receptor identificado: 123
3. Creando notificación...
✓ Notificación creada
4. Enviando evento Pusher al canal chat-1
✓ Evento 'nuevo-mensaje' enviado: {}
5. Enviando notificación al canal: estudiante-123
✓ Evento 'nuevo-mensaje-notificacion' enviado: {}
====== MENSAJE ENVIADO EXITOSAMENTE ======
```

### Paso 2: Estudiante Recibe la Respuesta

**En la CONSOLA DEL ESTUDIANTE:**

```
📨 Mensaje recibido en chat-1: {id: 790, id_conversacion: 1, contenido: "Hola, ¿en qué puedo ayudarte?", id_usuario: 456, ...}
   Usuario que envió: 456
   Usuario actual: 123
   ¿Es de otro usuario? true
✅ Agregando mensaje a la lista
```

**Y también:**

```
🔔 Notificación de nuevo mensaje: {id_conversacion: 1, mensaje: "Hola, ¿en qué puedo ayudarte?"}
```

---

## 🚨 Problemas Comunes y Soluciones

### ❌ El backend no muestra logs al enviar mensaje

**Problema:** No aparece "====== ENVIAR MENSAJE ======"

**Causa:** El frontend no está conectándose al backend correcto

**Solución:**
1. Verifica que el backend esté corriendo en `http://localhost:3001`
2. Verifica que `VITE_BACKEND_URL` en `.env` sea `http://localhost:3001`
3. Reinicia el frontend

### ❌ Pusher no se conecta

**Problema:** Ves `❌ Error de conexión Pusher`

**Causa:** Credenciales incorrectas o problemas de red

**Solución:**
1. Verifica en `.env`:
   ```
   VITE_PUSHER_KEY=76e3f9405cf16a0f3709
   VITE_PUSHER_CLUSTER=mt1
   ```
2. Reinicia el frontend
3. Verifica tu conexión a internet
4. Ve al [Dashboard de Pusher](https://dashboard.pusher.com/apps/2113838) y verifica que la app esté activa

### ❌ Los eventos no llegan desde el backend

**Problema:** El backend muestra "✓ Evento enviado" pero el frontend no lo recibe

**Causa:** Credenciales de Pusher incorrectas en el backend

**Solución:**
1. Verifica en `.env` (raíz del proyecto):
   ```
   PUSHER_APP_ID=2113838
   PUSHER_KEY=76e3f9405cf16a0f3709
   PUSHER_SECRET=1ebdeeb04f6ea168a6da
   PUSHER_CLUSTER=mt1
   ```
2. Reinicia el backend
3. Ve al [Debug Console de Pusher](https://dashboard.pusher.com/apps/2113838/getting_started) y verifica que los eventos aparezcan allí

### ❌ Los mensajes se duplican

**Problema:** Ves el mismo mensaje dos veces

**Causa:** Normal, uno es el mensaje temporal (UI optimista) y otro es el mensaje confirmado

**Solución:** Esto es esperado. El mensaje temporal aparece inmediatamente para dar feedback rápido al usuario.

### ❌ Error "Conversación no encontrada"

**Problema:** El backend responde con `404: Conversación no encontrada`

**Causa:** El `chatId` no existe en la base de datos

**Solución:**
1. Verifica que la conversación exista en la tabla `chats_conversacion`
2. Verifica que el `id` de la conversación sea correcto
3. Consulta la BD:
   ```sql
   SELECT * FROM chats_conversacion WHERE id = 1;
   ```

---

## 🔧 Herramientas de Depuración Adicionales

### 1. Debug Console de Pusher

Ve a: https://dashboard.pusher.com/apps/2113838/getting_started

Aquí verás en tiempo real todos los eventos que se están enviando desde tu backend:

- **Canal:** `chat-1`, `estudiante-123`, `asesor-456`
- **Evento:** `nuevo-mensaje`, `nuevo-mensaje-notificacion`
- **Datos:** El contenido del mensaje

Si no ves eventos aquí, significa que el backend NO está enviando eventos de Pusher correctamente.

### 2. Network Tab del Navegador

En las herramientas de desarrollo (`F12`), ve a la pestaña **Network**:

1. Filtra por `ws` (WebSockets)
2. Deberías ver una conexión a `ws-mt1.pusher.com`
3. Si no hay conexión WebSocket, Pusher no está funcionando

### 3. Verificar Base de Datos

Conecta a tu base de datos PostgreSQL y ejecuta:

```sql
-- Ver todas las conversaciones
SELECT * FROM chats_conversacion;

-- Ver todos los mensajes de una conversación
SELECT * FROM chat_mensaje WHERE id_conversacion = 1 ORDER BY fecha_envio ASC;

-- Ver notificaciones
SELECT * FROM chats_notificacion;
```

---

## ✅ Checklist de Funcionamiento

Usa esta lista para verificar que todo está configurado correctamente:

- [ ] Backend corriendo en `http://localhost:3001`
- [ ] Frontend corriendo en `http://localhost:5173`
- [ ] Pusher conectado (ves "✅ Pusher conectado exitosamente")
- [ ] Canales suscritos (ves "✅ Suscripción exitosa al canal: chat-X")
- [ ] Al enviar mensaje, ves logs en consola del navegador
- [ ] Al enviar mensaje, ves logs en terminal del backend
- [ ] El mensaje se guarda en la BD (verifica con SQL)
- [ ] El backend envía eventos de Pusher (ves "✓ Evento enviado")
- [ ] Los eventos aparecen en el Debug Console de Pusher
- [ ] El receptor recibe el mensaje (ves "📨 Mensaje recibido")
- [ ] El mensaje aparece en la interfaz del receptor

---

## 📞 Contacto de Soporte

Si después de seguir todos estos pasos el chat sigue sin funcionar, proporciona:

1. Los logs completos de la **consola del navegador** (ambos usuarios)
2. Los logs completos de la **terminal del backend**
3. Una captura de pantalla del **Debug Console de Pusher**
4. La salida de estas queries SQL:
   ```sql
   SELECT COUNT(*) FROM chats_conversacion;
   SELECT COUNT(*) FROM chat_mensaje;
   SELECT * FROM chats_conversacion LIMIT 5;
   ```

Con esta información podremos identificar exactamente dónde está el problema.

# Guía de Uso: Sistema de Chat en Vista Previa

## ¡Listo para Usar!

El sistema de chat ahora está completamente funcional en la vista previa de la plataforma. Ya NO necesitas el backend local (Node.js).

## ¿Qué Se Migró?

Todo el backend del chat se ha movido a **Supabase Edge Functions**, que funcionan automáticamente en la nube:

### Edge Functions Desplegadas

1. **crear-conversacion** - Crea nuevas conversaciones entre estudiante y asesor
2. **obtener-conversaciones** - Obtiene todas las conversaciones de un usuario
3. **obtener-mensajes** - Obtiene los mensajes de una conversación
4. **enviar-mensaje** - Envía mensajes y dispara eventos de Pusher

## ¿Cómo Funciona Ahora?

### Sin Backend Local
- Ya NO necesitas ejecutar `cd backend && node index.cjs`
- Ya NO necesitas tener el puerto 3001 abierto
- Todo funciona directamente desde la vista previa

### Con Supabase Edge Functions
- Las funciones se ejecutan automáticamente en la nube
- Pusher está configurado y funcionando
- Los mensajes se sincronizan en tiempo real
- Las conversaciones se cargan dinámicamente

## URLs de las Edge Functions

Todas las llamadas ahora usan:

```
https://gzxxdzxnefxwlublxnsi.supabase.co/functions/v1/[nombre-funcion]
```

Con headers:
```javascript
{
  'Authorization': `Bearer ${VITE_SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
}
```

## Configuración de Pusher

Las credenciales de Pusher están configuradas en `.env`:

```env
PUSHER_APP_ID=2113838
PUSHER_KEY=76e3f9405cf16a0f3709
PUSHER_SECRET=1ebdeeb04f6ea168a6da
PUSHER_CLUSTER=mt1

VITE_PUSHER_KEY=76e3f9405cf16a0f3709
VITE_PUSHER_CLUSTER=mt1
```

Y dentro de las Edge Functions directamente.

## Cómo Usar el Chat en la Vista Previa

### 1. Inicia la Vista Previa

Simplemente haz clic en el botón "Vista Previa" en la plataforma. El frontend se iniciará automáticamente.

### 2. Prueba como Estudiante

1. Inicia sesión como estudiante
2. Ve a la sección de chat
3. Si no hay conversaciones, necesitas:
   - Tener datos de asesores en la base de datos
   - Implementar un botón para iniciar nuevas conversaciones (o crear una conversación manualmente desde la base de datos)
4. Envía un mensaje
5. El mensaje se verá inmediatamente

### 3. Prueba como Asesor

1. Abre una nueva ventana (o modo incógnito)
2. Inicia sesión como asesor
3. Ve a la sección de chat del asesor
4. Verás automáticamente la conversación del estudiante
5. El mensaje del estudiante aparecerá en tiempo real
6. Responde al estudiante
7. El estudiante recibirá tu respuesta instantáneamente

## Flujo Técnico

### Cuando un Estudiante envía un mensaje:

```
1. Frontend (Estudiante)
   ↓
2. Edge Function: enviar-mensaje
   ↓
3. Supabase Database (guarda el mensaje)
   ↓
4. Pusher (dispara eventos)
   ↓
5. Frontend (Asesor) - Recibe mensaje en tiempo real
```

### Canales de Pusher:

- `chat-{id}` - Mensajes específicos de cada conversación
- `asesor-{id}` - Notificaciones para el asesor
- `estudiante-{id}` - Notificaciones para el estudiante

## Estructura de la Base de Datos

El sistema usa las siguientes tablas en Supabase:

1. **chats_conversacion**
   - `id` - ID único de la conversación
   - `id_estudiante` - FK a tabla estudiante
   - `id_asesor` - FK a tabla asesor
   - `ultima_actividad` - Timestamp del último mensaje

2. **chat_mensaje**
   - `id` - ID único del mensaje
   - `id_conversacion` - FK a chats_conversacion
   - `contenido` - Texto del mensaje
   - `id_usuario` - ID del remitente (estudiante o asesor)
   - `fecha_envio` - Timestamp del envío

3. **chats_notificacion**
   - `id` - ID único
   - `id_conversacion` - FK a chats_conversacion
   - `id_receptor` - ID del receptor
   - `leido` - Boolean
   - `fecha_creacion` - Timestamp

## Verificar que Todo Funcione

### En el Dashboard de Pusher

1. Ve a: https://dashboard.pusher.com/apps/2113838/getting_started
2. Abre la pestaña "Debug Console"
3. Envía un mensaje desde el chat
4. Deberías ver los eventos en tiempo real:
   - `chat-{id}` → `nuevo-mensaje`
   - `asesor-{id}` → `nuevo-mensaje-notificacion`
   - `estudiante-{id}` → `nuevo-mensaje-notificacion`

### En la Consola del Navegador

Abre las DevTools (F12) y verás logs como:
```
Mensaje recibido: {id: 1, contenido: "Hola", ...}
Notificación de nuevo mensaje: {id_conversacion: 1, ...}
```

## Solución de Problemas

### Los mensajes no llegan en tiempo real

**Verifica:**
1. Que las credenciales de Pusher estén correctas en `.env`
2. Que el navegador tenga acceso a internet
3. Que no haya bloqueadores de anuncios interfiriendo con Pusher

**Solución:**
- Abre la consola del navegador y busca errores de Pusher
- Verifica el Debug Console de Pusher

### La lista de chats está vacía

**Causa:** No hay conversaciones en la base de datos

**Solución:**
1. Crea una conversación manualmente desde Supabase Dashboard, O
2. Implementa un botón en el frontend para iniciar nuevas conversaciones

**Query SQL para crear conversación manualmente:**
```sql
INSERT INTO chats_conversacion (id_estudiante, id_asesor, ultima_actividad)
VALUES (1, 1, NOW());
```

### Error: "Failed to fetch"

**Causa:** Las Edge Functions no están respondiendo

**Verifica:**
1. Que las URLs de Supabase estén correctas en `.env`
2. Que las Edge Functions estén desplegadas correctamente

**Solución:**
- Ve al Dashboard de Supabase
- Verifica que las 4 Edge Functions estén listadas
- Intenta redesplegar desde el Dashboard si es necesario

### Errores de CORS

**Causa:** Las Edge Functions deben tener headers CORS correctos

**Solución:** Ya están configurados. Si ves este error, verifica que los headers en las Edge Functions incluyan:
```javascript
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};
```

## Ventajas de Esta Configuración

**Sin Backend Local**
- No necesitas Node.js corriendo
- No necesitas configurar puertos
- No hay conflictos con localhost

**Totalmente en la Nube**
- Funciona desde cualquier dispositivo
- Escalable automáticamente
- Sin mantenimiento de servidor

**Tiempo Real**
- Pusher maneja la sincronización
- Los mensajes llegan instantáneamente
- Las listas se actualizan automáticamente

**Vista Previa Funcional**
- Puedes probar todo directamente en la plataforma
- Compartir el link de vista previa con otros
- Demostrar el proyecto sin complicaciones

## Próximos Pasos (Opcionales)

1. **Crear Interfaz para Iniciar Conversaciones**
   - Botón "Nuevo Chat" en el frontend del estudiante
   - Selector de asesor disponible
   - Llamada a la Edge Function `crear-conversacion`

2. **Agregar Indicadores de Lectura**
   - Usar la tabla `chats_notificacion`
   - Mostrar "visto" cuando el mensaje fue leído

3. **Implementar Búsqueda**
   - Buscar conversaciones por nombre
   - Filtrar mensajes por contenido

4. **Mejorar Notificaciones**
   - Contador de mensajes no leídos
   - Sonido cuando llega un mensaje
   - Notificaciones del navegador

## Resumen

**¡Todo está listo!**

- El sistema de chat funciona completamente en la vista previa
- No necesitas backend local
- Pusher está configurado y funcionando
- Las Edge Functions están desplegadas
- Los mensajes se sincronizan en tiempo real

Simplemente abre la vista previa y prueba el chat. Todo funciona automáticamente.

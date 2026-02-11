# Guía de Configuración de Pusher

## Paso 1: Crear Cuenta en Pusher

1. Ve a [pusher.com](https://pusher.com) y haz clic en "Sign Up"
2. Crea una cuenta usando tu email o GitHub
3. Confirma tu email

## Paso 2: Crear una App en Pusher Channels

1. Una vez dentro del dashboard, haz clic en "Create app"
2. Configura tu app:
   - **Name**: Assura Chat (o el nombre que prefieras)
   - **Cluster**: Selecciona el más cercano a tu ubicación
     - `us2` - Estados Unidos (Este)
     - `us3` - Estados Unidos (Oeste)
     - `eu` - Europa
     - `ap1` - Asia Pacífico
     - `mt1` - Multi-tenant (por defecto)
   - **Tech stack**:
     - Frontend: React
     - Backend: Node.js
3. Haz clic en "Create app"

## Paso 3: Obtener Credenciales

Una vez creada la app, verás un panel con tus credenciales:

```
App ID: 1234567
Key: abc123def456ghi789
Secret: xyz789uvw012rst345
Cluster: mt1
```

**IMPORTANTE:** Nunca compartas tu Secret públicamente.

## Paso 4: Configurar Variables de Entorno

Edita el archivo `.env` en la raíz del proyecto y actualiza las siguientes variables:

```env
# Pusher Configuración Backend
PUSHER_APP_ID=1234567
PUSHER_KEY=abc123def456ghi789
PUSHER_SECRET=xyz789uvw012rst345
PUSHER_CLUSTER=mt1

# Pusher Frontend (para Vite)
VITE_PUSHER_KEY=abc123def456ghi789
VITE_PUSHER_CLUSTER=mt1
```

**Notas:**
- `PUSHER_APP_ID`, `PUSHER_KEY`, `PUSHER_SECRET` son para el backend
- `VITE_PUSHER_KEY` y `VITE_PUSHER_CLUSTER` son para el frontend
- El `Key` es el mismo para backend y frontend
- El `Secret` SOLO se usa en el backend (nunca en el frontend)

## Paso 5: Verificar Instalación de Dependencias

### Backend

```bash
cd backend
npm install
```

Verifica que `pusher` esté en `backend/package.json`:

```json
{
  "dependencies": {
    "pusher": "^5.3.2",
    ...
  }
}
```

### Frontend

```bash
npm install
```

Verifica que `pusher-js` esté en `package.json`:

```json
{
  "dependencies": {
    "pusher-js": "^8.4.0",
    ...
  }
}
```

## Paso 6: Iniciar el Servidor Backend

```bash
cd backend
node index.cjs
```

Deberías ver:

```
╔════════════════════════════════════════╗
║   🚀 Servidor Assura Iniciado          ║
╠════════════════════════════════════════╣
║   Puerto: 3001                         ║
║   URL: http://localhost:3001           ║
║   Pusher: Configurado                  ║
╚════════════════════════════════════════╝
```

## Paso 7: Iniciar el Frontend

En otra terminal:

```bash
npm run dev
```

## Paso 8: Probar el Sistema

1. Abre `http://localhost:5173` en dos navegadores diferentes
2. Inicia sesión con dos usuarios diferentes (un estudiante y un asesor)
3. Crea una conversación
4. Envía mensajes desde ambos lados
5. Verifica que los mensajes lleguen en tiempo real

## Paso 9: Verificar en el Dashboard de Pusher

1. Ve al [Dashboard de Pusher](https://dashboard.pusher.com)
2. Haz clic en tu app "Assura Chat"
3. Ve a la pestaña "Debug Console"
4. Envía un mensaje en tu app
5. Deberías ver el evento en tiempo real:

```
Channel: chat-123
Event: nuevo-mensaje
Data: {
  "id": 456,
  "id_conversacion": 123,
  "contenido": "Hola mundo",
  "id_usuario": 789,
  "fecha_envio": "2024-..."
}
```

## Troubleshooting

### Error: "Failed to load resource: net::ERR_CONNECTION_REFUSED"

**Causa:** El backend no está corriendo

**Solución:**
```bash
cd backend
node index.cjs
```

### Error: "Pusher: Auth signature invalid"

**Causa:** Las credenciales en `.env` están incorrectas

**Solución:**
1. Verifica que copiaste correctamente el App ID, Key, Secret y Cluster
2. Reinicia el backend después de cambiar el `.env`

### Error: "Cannot find module 'pusher'"

**Causa:** La dependencia no está instalada

**Solución:**
```bash
cd backend
npm install pusher
```

### Los mensajes no llegan en tiempo real

**Checklist:**
- ✅ Backend está corriendo
- ✅ Frontend está corriendo
- ✅ Credenciales correctas en `.env`
- ✅ No hay errores en la consola del navegador
- ✅ No hay errores en la terminal del backend

**Debug:**
1. Abre la consola del navegador (F12)
2. Busca logs que digan "Mensaje recibido:"
3. Verifica que no haya errores de CORS
4. Verifica el dashboard de Pusher para ver si los eventos se están disparando

### Error: "CORS policy: No 'Access-Control-Allow-Origin' header"

**Causa:** Problema de CORS en el backend

**Solución:** Verifica que en `backend/index.cjs` tengas:

```javascript
const cors = require("cors");
app.use(cors());
```

## Planes de Pusher

### Plan Gratuito (Free)
- 200,000 mensajes por día
- 100 conexiones concurrentes máximo
- Soporte por email
- Perfecto para desarrollo y testing

### Plan Pro
- Desde $49/mes
- 1,000,000 mensajes por día
- 10,000 conexiones concurrentes
- Soporte prioritario
- Necesario para producción con alto tráfico

**Recomendación:** Comienza con el plan gratuito. Solo actualiza si superas los límites.

## Monitoreo

### Métricas Importantes

En el dashboard de Pusher puedes ver:

1. **Connections** - Número de usuarios conectados en tiempo real
2. **Messages** - Cantidad de mensajes enviados hoy
3. **Channels** - Canales activos (uno por conversación)

### Alertas

Configura alertas para:
- Cuando te acerques al límite de mensajes diarios
- Cuando tengas problemas de conexión
- Cuando haya errores en los eventos

## Seguridad

### Buenas Prácticas

✅ **Nunca expongas tu Secret**: Solo úsalo en el backend
✅ **Usa HTTPS en producción**: Configura `useTLS: true`
✅ **Valida datos en el backend**: No confíes en datos del frontend
✅ **Limita el rate limit**: Evita que usuarios spameen mensajes
✅ **Usa autenticación**: Verifica que los usuarios sean quienes dicen ser

### Variables de Entorno en Producción

Cuando despliegues a producción (ej: Heroku, Vercel, Railway):

1. No subas el archivo `.env` a Git
2. Configura las variables de entorno en tu plataforma de hosting
3. Usa valores diferentes para producción y desarrollo

## Recursos Adicionales

- [Documentación oficial de Pusher](https://pusher.com/docs)
- [Pusher Channels JavaScript SDK](https://github.com/pusher/pusher-js)
- [Pusher Node.js SDK](https://github.com/pusher/pusher-http-node)
- [FAQ de Pusher](https://pusher.com/docs/channels/getting_started/faq)
- [Dashboard de Pusher](https://dashboard.pusher.com)

## Soporte

Si tienes problemas:

1. Revisa la documentación de Pusher
2. Revisa los logs del backend y frontend
3. Verifica el Debug Console en el dashboard de Pusher
4. Contacta al soporte de Pusher (si estás en un plan pagado)

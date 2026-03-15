# Instrucciones para Ejecutar el Proyecto Localmente

## Requisitos Previos

- Node.js (versión 14 o superior)
- PostgreSQL instalado y corriendo
- Tu base de datos debe tener las tablas del sistema de chat configuradas

## Configuración de Pusher

Las credenciales de Pusher ya están configuradas en el archivo `.env`:

```env
PUSHER_APP_ID=2113838
PUSHER_KEY=76e3f9405cf16a0f3709
PUSHER_SECRET=1ebdeeb04f6ea168a6da
PUSHER_CLUSTER=mt1

VITE_PUSHER_KEY=76e3f9405cf16a0f3709
VITE_PUSHER_CLUSTER=mt1
```

## Pasos para Ejecutar

### 1. Instalar Dependencias

#### Frontend
```bash
npm install
```

#### Backend
```bash
cd backend
npm install
cd ..
```

### 2. Configurar Variables de Entorno

El archivo `.env` en la raíz del proyecto debe contener:

```env
# Clave secreta para JWT
JWT_SECRET=TU_SECRETO_SUPER_SEGURO_AQUI

# Configuración de correo (Gmail)
GMAIL_USER=soporteassura@gmail.com
GMAIL_PASS=qsqprzamzlbkxixr

# URL del frontend
FRONTEND_URL=http://localhost:5173

# URL del backend
VITE_BACKEND_URL=http://localhost:3001

# Pusher Backend
PUSHER_APP_ID=2113838
PUSHER_KEY=76e3f9405cf16a0f3709
PUSHER_SECRET=1ebdeeb04f6ea168a6da
PUSHER_CLUSTER=mt1

# Pusher Frontend
VITE_PUSHER_KEY=76e3f9405cf16a0f3709
VITE_PUSHER_CLUSTER=mt1

# Supabase (opcional, ya no se usa en localhost)
VITE_SUPABASE_URL=https://gzxxdzxnefxwlublxnsi.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6eHhkenhuZWZ4d2x1Ymx4bnNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3NzAyNzcsImV4cCI6MjA4NjM0NjI3N30.3KTdRXJYGzzZXvuISDA7GaOV4GiLd23ZWlgoQwZYz14
```

El archivo `.env` en la carpeta `backend/` debe contener la configuración de tu base de datos PostgreSQL:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=tu_base_de_datos
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña
```

### 3. Ejecutar el Backend

Abre una terminal y ejecuta:

```bash
cd backend
node index.cjs
```

Deberías ver:
```
Servidor escuchando en http://localhost:3001
```

### 4. Ejecutar el Frontend

Abre **otra terminal** (deja la del backend corriendo) y ejecuta:

```bash
npm run dev
```

Deberías ver:
```
VITE v6.3.5 ready in XXX ms

➜  Local:   http://localhost:5173/
```

### 5. Acceder a la Aplicación

Abre tu navegador y ve a: **http://localhost:5173**

## Verificar que el Chat Funciona

### 1. Inicia Sesión como Estudiante
- Abre http://localhost:5173
- Inicia sesión con una cuenta de estudiante
- Ve a la sección de chat

### 2. Inicia Sesión como Asesor (en otra ventana)
- Abre una ventana de incógnito o usa otro navegador
- Ve a http://localhost:5173
- Inicia sesión con una cuenta de asesor
- Ve a la sección de chat del asesor

### 3. Prueba el Chat en Tiempo Real
- Envía un mensaje desde el estudiante
- El mensaje debería aparecer instantáneamente en la ventana del asesor
- Responde desde el asesor
- El mensaje debería aparecer instantáneamente en la ventana del estudiante

## Estructura del Proyecto

```
proyecto/
├── backend/                    # Backend Node.js + Express
│   ├── index.cjs              # Servidor principal
│   ├── config/                # Configuraciones (DB, Pusher)
│   ├── controllers/           # Lógica de negocio
│   └── routes/                # Rutas de la API
├── src/                       # Frontend React
│   ├── components/            # Componentes React
│   │   ├── chate/            # Chat del estudiante
│   │   └── asesor/           # Chat del asesor
│   └── services/             # Servicios (Pusher, etc.)
├── .env                      # Variables de entorno (raíz)
└── package.json              # Dependencias del frontend
```

## Solución de Problemas

### El backend no inicia

**Problema:** Error de conexión a la base de datos

**Solución:**
1. Verifica que PostgreSQL esté corriendo
2. Verifica las credenciales en `backend/.env`
3. Asegúrate de que la base de datos exista

**Comando para verificar PostgreSQL:**
```bash
psql -U tu_usuario -d tu_base_de_datos
```

### El frontend no se conecta al backend

**Problema:** Error de CORS o "Failed to fetch"

**Solución:**
1. Verifica que el backend esté corriendo en http://localhost:3001
2. Verifica que `VITE_BACKEND_URL` en `.env` sea `http://localhost:3001`
3. Reinicia ambos servidores

### Los mensajes no llegan en tiempo real

**Problema:** Pusher no está sincronizando

**Solución:**
1. Verifica las credenciales de Pusher en `.env` y `backend/.env`
2. Abre la consola del navegador (F12) y busca errores
3. Ve al Debug Console de Pusher: https://dashboard.pusher.com/apps/2113838/getting_started
4. Envía un mensaje y verifica que los eventos aparezcan en el Debug Console

### No aparecen conversaciones en el chat

**Problema:** No hay datos en la base de datos

**Solución:**
1. Verifica que existan registros en la tabla `chats_conversacion`
2. Verifica que existan usuarios (estudiantes y asesores) en las tablas correspondientes

**Query SQL para crear una conversación de prueba:**
```sql
INSERT INTO chats_conversacion (id_estudiante, id_asesor, ultima_actividad)
VALUES (1, 1, NOW());
```

## Puertos Usados

- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:3001
- **PostgreSQL:** localhost:5432 (por defecto)

Asegúrate de que estos puertos estén disponibles antes de ejecutar.

## Comandos Útiles

### Detener los Servicios
- **Backend:** Presiona `Ctrl + C` en la terminal del backend
- **Frontend:** Presiona `Ctrl + C` en la terminal del frontend

### Limpiar y Reinstalar Dependencias

```bash
# Frontend
rm -rf node_modules package-lock.json
npm install

# Backend
cd backend
rm -rf node_modules package-lock.json
npm install
cd ..
```

### Ver Logs en Tiempo Real

En la consola del navegador (F12 > Console), verás logs como:
```
Mensaje recibido: {id: 1, contenido: "Hola", ...}
Notificación de nuevo mensaje: {id_conversacion: 1, ...}
```

## Notas Importantes

1. **SIEMPRE ejecuta el backend primero** antes del frontend
2. **Mantén ambas terminales abiertas** mientras uses la aplicación
3. **Las credenciales de Pusher ya están configuradas** y funcionan
4. **La base de datos debe tener las tablas del sistema de chat** (chats_conversacion, chat_mensaje, chats_notificacion)

## Recursos Adicionales

- **Documentación de Pusher:** https://pusher.com/docs
- **Dashboard de Pusher:** https://dashboard.pusher.com/apps/2113838
- **Debug Console:** https://dashboard.pusher.com/apps/2113838/getting_started

---

¡Listo! Ahora puedes ejecutar tu proyecto completo localmente con backend y frontend funcionando juntos.

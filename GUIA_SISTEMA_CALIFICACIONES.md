# Sistema de Calificaciones de Asesores - Guía Completa

## Resumen del Sistema

Se ha implementado un sistema completo de calificaciones que permite a los estudiantes evaluar a los asesores después de una sesión de asesoría. El sistema incluye:

- ✅ Formulario de calificación con 5 criterios evaluables
- ✅ Sistema de categorización automática de asesores
- ✅ Ranking de mejores asesores
- ✅ Vista de mejores asesores con calificaciones
- ✅ Prevención de calificaciones duplicadas
- ✅ Estadísticas completas

---

## 🚀 Paso 1: Ejecutar el Script SQL

**IMPORTANTE**: Antes de usar el sistema, debes ejecutar el script SQL en tu base de datos PostgreSQL.

### Ubicación del Script
```
/SCRIPT_CALIFICACIONES.sql
```

### Cómo Ejecutarlo

1. Abre tu herramienta de gestión de PostgreSQL (pgAdmin, DBeaver, etc.)
2. Conéctate a tu base de datos
3. Abre el archivo `SCRIPT_CALIFICACIONES.sql`
4. Ejecuta todo el script

### ¿Qué crea este script?

1. **Tabla `calificacion_asesor`**: Almacena todas las calificaciones
2. **Vista `ranking_asesores`**: Vista materializada para consultas rápidas
3. **Función `obtener_categoria_asesor`**: Función para obtener categoría de un asesor
4. **Índices**: Para mejorar el rendimiento de las consultas

---

## 📊 Criterios de Evaluación

El sistema evalúa a los asesores en 5 aspectos (cada uno del 1 al 5):

1. **Puntualidad** (1-5)
   - ¿El asesor fue puntual y respetó los horarios?

2. **Claridad en las Explicaciones** (1-5)
   - ¿Qué tan claro y comprensible fue el asesor al explicar?

3. **Dominio del Tema** (1-5)
   - ¿El asesor demuestra conocimiento profundo del tema?

4. **Amabilidad y Trato** (1-5)
   - ¿El asesor fue amable y respetuoso durante la sesión?

5. **Resolución de Dudas** (1-5)
   - ¿El asesor resolvió efectivamente tus preguntas?

### Escala de Calificación

- **5** = Excelente
- **4** = Muy Bueno
- **3** = Bueno
- **2** = Regular
- **1** = Necesita Mejorar

---

## 🏆 Sistema de Categorización

Los asesores son categorizados automáticamente según su promedio general:

| Promedio | Categoría | Color |
|----------|-----------|-------|
| 4.5 - 5.0 | Excelente | Verde |
| 4.0 - 4.4 | Muy Bueno | Azul |
| 3.5 - 3.9 | Bueno | Amarillo |
| 3.0 - 3.4 | Regular | Naranja |
| < 3.0 | Necesita Mejorar | Rojo |
| Sin calificaciones | Sin Calificaciones | Gris |

---

## 🔌 Endpoints Disponibles

### 1. Crear Calificación
```
POST /calificacion/crear

Body:
{
  "id_estudiante": 27,
  "id_asesor": 9,
  "id_conversacion": 16,
  "puntualidad": 5,
  "claridad_explicacion": 5,
  "dominio_tema": 5,
  "amabilidad": 5,
  "resolucion_dudas": 5,
  "comentario": "Excelente asesor"  // Opcional
}

Respuesta:
{
  "ok": true,
  "mensaje": "Calificación registrada exitosamente",
  "calificacion": { ... }
}
```

### 2. Obtener Calificaciones de un Asesor
```
GET /calificacion/asesor/:id_asesor

Respuesta:
{
  "ok": true,
  "calificaciones": [...],
  "estadisticas": {
    "total_calificaciones": 5,
    "promedio_general": 4.80,
    "promedio_puntualidad": 4.60,
    ...
  }
}
```

### 3. Verificar si Ya Fue Calificado
```
GET /calificacion/verificar?id_estudiante=27&id_asesor=9&id_conversacion=16

Respuesta:
{
  "ok": true,
  "ya_calificado": false
}
```

### 4. Obtener Ranking de Asesores
```
GET /calificacion/ranking?limite=10

Respuesta:
{
  "ok": true,
  "ranking": [...]
}
```

### 5. Obtener Mejores Asesores (con más info)
```
GET /calificacion/mejores-asesores

Respuesta:
{
  "ok": true,
  "asesores": [
    {
      "id": 9,
      "nombres": "Juan Jose",
      "apellidos": "García",
      "promedio_general": 4.80,
      "total_calificaciones": 5,
      "categoria": "Excelente",
      "materias": "Cálculo, Física",
      ...
    }
  ]
}
```

### 6. Obtener Categoría de un Asesor
```
GET /calificacion/categoria/:id_asesor

Respuesta:
{
  "ok": true,
  "categoria": "Excelente",
  "promedio": 4.80,
  "total_calificaciones": 5
}
```

### 7. Obtener Estadísticas Generales
```
GET /calificacion/estadisticas

Respuesta:
{
  "ok": true,
  "estadisticas": {
    "total_asesores_calificados": 10,
    "total_calificaciones": 50,
    "promedio_plataforma": 4.20,
    "calificaciones_excelentes": 25,
    ...
  }
}
```

---

## 🎨 Componentes Disponibles

### 1. FormularioCalificacion
**Ubicación**: `/src/components/calificacion/FormularioCalificacion.jsx`

Formulario interactivo para calificar asesores.

**Props**:
```jsx
<FormularioCalificacion
  idEstudiante={27}
  idAsesor={9}
  nombreAsesor="Juan Jose García"
  idConversacion={16}
  onClose={() => {}}
  onCalificacionEnviada={(calificacion) => {}}
/>
```

**Características**:
- Barras deslizables para cada criterio
- Botones numéricos del 1-5
- Cálculo automático del promedio general
- Campo opcional para comentarios
- Validación y prevención de duplicados
- Feedback visual del valor seleccionado

### 2. MejoresAsesores
**Ubicación**: `/src/components/calificacion/MejoresAsesores.jsx`

Vista de tarjetas con los mejores asesores calificados.

**Uso**:
```jsx
import MejoresAsesores from './components/calificacion/MejoresAsesores';

<MejoresAsesores />
```

**Características**:
- Muestra top 3 con medallas
- Categorización por colores
- Sistema de estrellas visual
- Información de contacto
- Materias que imparte
- Promedio general destacado

---

## 💡 Cómo Usar el Sistema

### Para Estudiantes

1. **Chatear con un Asesor**
   - Abre el chat de estudiante
   - Selecciona o inicia una conversación con un asesor

2. **Calificar al Asesor**
   - En el header del chat, verás un botón "Calificar"
   - Haz clic en el botón
   - Completa el formulario de calificación
   - Envía la calificación

3. **Restricciones**
   - Solo puedes calificar una vez por conversación
   - Una vez calificado, el botón se desactiva y muestra "Calificado"

### Para Ver Mejores Asesores

Puedes importar y usar el componente `MejoresAsesores` en cualquier parte de tu aplicación:

```jsx
import MejoresAsesores from './components/calificacion/MejoresAsesores';

function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      <MejoresAsesores />
    </div>
  );
}
```

---

## 🔄 Integración Automática

### Chat de Estudiantes
El sistema ya está integrado en el chat de estudiantes (`Chatstudy.jsx`):

- ✅ Botón de calificar en el header del chat
- ✅ Verificación automática si ya fue calificado
- ✅ Modal con formulario de calificación
- ✅ Actualización en tiempo real del estado

### Flujo Completo
1. Estudiante chatea con asesor
2. Aparece botón "Calificar" (estrella amarilla)
3. Al hacer clic, se abre el formulario
4. Estudiante completa la evaluación
5. Se envía y guarda en la BD
6. El botón cambia a "Calificado" (gris, deshabilitado)
7. La calificación se refleja en el ranking

---

## 📈 Consultas SQL Útiles

### Ver todas las calificaciones
```sql
SELECT * FROM calificacion_asesor
ORDER BY fecha_calificacion DESC;
```

### Ver el ranking completo
```sql
SELECT * FROM ranking_asesores;
```

### Ver calificaciones de un asesor específico
```sql
SELECT * FROM calificacion_asesor
WHERE id_asesor = 9;
```

### Obtener categoría de un asesor
```sql
SELECT * FROM obtener_categoria_asesor(9);
```

### Estadísticas generales
```sql
SELECT
  COUNT(DISTINCT id_asesor) as asesores_calificados,
  COUNT(*) as total_calificaciones,
  ROUND(AVG(calificacion_general), 2) as promedio_plataforma
FROM calificacion_asesor;
```

---

## 🎯 Ejemplo de Uso Completo

### Paso 1: Ejecutar SQL
```bash
# Conéctate a tu BD y ejecuta SCRIPT_CALIFICACIONES.sql
```

### Paso 2: Reiniciar Backend
```bash
cd backend
npm start
```

### Paso 3: Usar la Aplicación
```
1. Ingresa como estudiante
2. Abre un chat con un asesor
3. Haz clic en "Calificar" (botón amarillo con estrella)
4. Completa el formulario
5. Envía la calificación
```

### Paso 4: Ver Resultados
```
1. Consulta el ranking con: GET /calificacion/ranking
2. O usa el componente MejoresAsesores en tu interfaz
```

---

## ⚠️ Notas Importantes

1. **Ejecuta el SQL primero**: Sin las tablas, el sistema no funcionará
2. **Un estudiante puede calificar una vez por conversación**: Evita duplicados
3. **El promedio se calcula automáticamente**: De los 5 criterios
4. **Las categorías se asignan automáticamente**: Según el promedio
5. **El botón se desactiva después de calificar**: No se puede modificar la calificación

---

## 🐛 Solución de Problemas

### Error: "Ya has calificado esta sesión"
- Ya existe una calificación para esa conversación
- Verifica en la BD: `SELECT * FROM calificacion_asesor WHERE id_conversacion = X`

### No aparece el botón de calificar
- Verifica que estés logueado como estudiante
- Verifica que tengas una conversación activa

### Error al guardar calificación
- Verifica que ejecutaste el script SQL
- Verifica que las tablas existan
- Revisa la consola del backend para errores

---

## 📝 Archivos Creados/Modificados

### Nuevos Archivos
- `/SCRIPT_CALIFICACIONES.sql` - Script SQL
- `/backend/controllers/calificacion.controller.cjs` - Controlador
- `/backend/routes/calificacion.routes.cjs` - Rutas
- `/src/components/calificacion/FormularioCalificacion.jsx` - Formulario
- `/src/components/calificacion/MejoresAsesores.jsx` - Vista de ranking

### Archivos Modificados
- `/backend/index.cjs` - Agregada ruta de calificaciones
- `/src/components/chate/Chatstudy.jsx` - Integrado formulario de calificación

---

¡Listo! El sistema de calificaciones está completo y funcional. 🎉

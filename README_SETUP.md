# 🎯 Analizador de Sentimientos para Redes Sociales con IA

Sistema completo para analizar sentimientos de posts en **Bluesky** usando un modelo de IA BiLSTM pre-entrenado.

## 📋 Requisitos Previos

- Docker y Docker Compose instalados
- Cuenta de Bluesky (https://bsky.app)
- App Password de Bluesky (generado en Settings → App Passwords)

## 🚀 Cómo Correr el Proyecto

### 1. Clonar o descargar el proyecto
```bash
git clone https://github.com/robincajas12/ia-analizador-sentimientos-para-redes-sociales
cd ia-analizador-sentimientos-para-redes-sociales
```

### 2. Crear archivo `.env` con credenciales de Bluesky

En la raíz del proyecto, crear un archivo `.env`:

```bash
cat > .env << EOF
BLUESKY_USERNAME=tu_usuario.bsky.social
BLUESKY_PASSWORD=tu_app_password
EOF
```

**⚠️ IMPORTANTE:** 
- Reemplaza `tu_usuario.bsky.social` con tu usuario real de Bluesky
- El `BLUESKY_PASSWORD` debe ser un **App Password** (no tu contraseña normal)
- Para generar App Password: Settings → Advanced → App passwords en Bluesky

### 3. Construir e iniciar los contenedores

```bash
# Opción A: Build + Run (primera vez)
docker compose up -d --build

# Opción B: Solo run (si ya fue construido)
docker compose up -d

# Opción C: Build forzado (limpiar todo)
docker compose down -v
docker system prune -f
docker compose up -d --build
```

**Esperar 1-2 minutos** mientras se descargan dependencias y se carga el modelo.

### 4. Verificar que está corriendo

```bash
# Ver logs
docker compose logs backend -f

# Debería mostrar:
# ✅ Bluesky: Conectado exitosamente
# Running on http://0.0.0.0:5001
```

### 5. Acceder a la aplicación

Abrir en navegador:
```
http://localhost:3000
```

## 📱 Cómo Usar

1. **Buscar posts**: Ingresa un tema/palabra clave (ej: "hello", "test", "news")
2. **Fetch Post**: Click en botón "Fetch Post" para obtener un post real de Bluesky
3. **Analyze**: Click en "Analyze" para obtener el análisis de sentimiento
4. **Resultados**: Verás:
   - **Sentiment**: Positive, Neutral o Negative
   - **Confidence**: Porcentaje de confianza
   - **Probabilidades**: Desglose por categoría

## 🧪 Pruebas Rápidas (Terminal)

### Buscar posts en Bluesky
```bash
curl -s "http://localhost:5001/bluesky/search?q=hello&limit=1" | jq .
```

### Analizar un texto
```bash
curl -s -X POST http://localhost:5001/predict \
  -H "Content-Type: application/json" \
  -d '{"text":"I love this! Amazing!"}' | jq .
```

## 📁 Estructura del Proyecto

```
.
├── .env                          # Credenciales Bluesky (NO incluir en git)
├── docker-compose.yaml           # Orquestación de servicios
├── python/
│   ├── app.py                    # Backend Flask
│   ├── bluesky_service.py        # Servicio Bluesky (NUEVO)
│   ├── requirements.txt           # Dependencias Python
│   ├── modelo_final_sentiment.h5  # Modelo BiLSTM pre-entrenado
│   └── Dockerfile
└── analizador-de-sentimientos-con-ia/
    ├── src/
    │   ├── app/
    │   │   ├── actions.ts        # Acciones del servidor
    │   │   ├── page.tsx          # Página principal
    │   │   └── api/
    │   │       ├── analyze/route.ts   # Endpoint análisis (NUEVO)
    │   │       └── posts/route.ts     # Endpoint búsqueda (NUEVO)
    │   └── components/
    │       ├── analysis-form.tsx  # Formulario búsqueda (MODIFICADO)
    │       ├── config-panel.tsx   # Panel config con Bluesky (MODIFICADO)
    │       └── ...
    └── Dockerfile
```

## 🔄 Cambios Realizados

### Backend (Python)
- ✅ `bluesky_service.py` - Nuevo servicio para conexión Bluesky
- ✅ `app.py` - Agregados endpoints `/bluesky/search`, `/bluesky/feed`, `/bluesky/author`
- ✅ `requirements.txt` - Agregado `atproto==0.0.50` para SDK Bluesky
- ✅ `docker-compose.yaml` - Pasan env vars `BLUESKY_USERNAME` y `BLUESKY_PASSWORD`

### Frontend (Next.js)
- ✅ `api/posts/route.ts` - Nuevo endpoint para buscar posts (REEMPLAZA Server Actions)
- ✅ `api/analyze/route.ts` - Nuevo endpoint para análisis (REEMPLAZA Server Actions)
- ✅ `components/analysis-form.tsx` - Actualizado para búsqueda de Bluesky
- ✅ `components/config-panel.tsx` - Agregado Bluesky como fuente de datos
- ✅ `components/icons.tsx` - Agregado ícono de Bluesky

### Modelo de IA
- ❌ **SIN CAMBIOS** - El modelo BiLSTM original sigue intacto
- Funciona correctamente con posts de Bluesky

## 🛑 Troubleshooting

### Error: "No posts found"
- Verifica que `BLUESKY_USERNAME` y `BLUESKY_PASSWORD` sean correctos en `.env`
- Algunos temas no tienen posts indexados en Bluesky aún
- Prueba con términos más comunes: "hello", "test", "news"

### Error: "Cannot connect to Bluesky"
```bash
# Ver logs del backend
docker compose logs backend | grep -i bluesky
```

### Puerto 3000 o 5001 ya está en uso
```bash
# Cambiar puertos en docker-compose.yaml
# Ej: "3001:3000" en lugar de "3000:3000"
docker compose down
docker compose up -d
```

### Limpiar y empezar de cero
```bash
docker compose down -v
docker system prune -f
rm -rf python/__pycache__ analizador-de-sentimientos-con-ia/.next
docker compose up -d --build
```

## 📊 API Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/bluesky/search?q=<query>&limit=<n>` | Buscar posts por palabra clave |
| GET | `/bluesky/feed?limit=<n>` | Obtener feed del usuario autenticado |
| GET | `/bluesky/author/<author>?limit=<n>` | Posts de un autor específico |
| POST | `/predict` | Analizar sentimiento de un texto |
| GET | `/health` | Verificar estado del backend |

## 🤖 Modelo de IA

- **Tipo**: BiLSTM (Bidirectional LSTM)
- **Clases**: Negative, Neutral, Positive
- **Entrada**: Texto procesado por tokenizer
- **Salida**: Sentimiento + Confianza + Probabilidades
- **Archivo**: `modelo_final_sentiment.h5`

## 📝 Commits Importantes

```bash
# Ver historial
git log --oneline

# Último commit debería ser:
# feat: Integración completa de Bluesky con análisis de sentimientos
```

## ✅ Verificación Final

1. ✅ Docker containers corriendo
2. ✅ Backend conectado a Bluesky (`✅ Bluesky: Conectado exitosamente`)
3. ✅ Frontend accesible en http://localhost:3000
4. ✅ Búsqueda de posts funcionando
5. ✅ Análisis de sentimientos devolviendo resultados

## 📞 Soporte

Si hay problemas, verifica:
1. `.env` tiene credenciales válidas de Bluesky
2. Docker está corriendo: `docker ps`
3. Puertos 3000 y 5001 están disponibles
4. Logs del backend: `docker compose logs backend`

---

**Última actualización**: Enero 2026
**Versión**: 1.0.0
**Estado**: ✅ Producción

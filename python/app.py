
import os
import re
import sys
import pickle
import traceback
import numpy as np
import tensorflow as tf
from flask import Flask, request, jsonify
from tensorflow.keras.preprocessing.sequence import pad_sequences
from werkzeug.exceptions import BadRequest
from dotenv import load_dotenv
from bluesky_service import BlueskyService

# Cargar variables de entorno desde .env
load_dotenv()

# --- Configuración Inicial ---
MAX_SEQUENCE_LENGTH = 100
MODEL_PATH = 'modelo_final_sentiment.h5'
TOKENIZER_PATH = 'tokenizer.pickle'

# Diccionario para mapear el resultado
CATEGORIAS = {0: 'Negative', 1: 'Neutral', 2: 'Positive'}

# --- Creación de la App Flask ---
app = Flask(__name__)

# --- Inicializar servicio de Bluesky ---
bluesky_service = BlueskyService()

# --- Carga de Modelo y Tokenizer (al inicio, a nivel de módulo) ---
loading_error = None
model = None
tokenizer = None

app.logger.info("Iniciando la carga del modelo y el tokenizer...")
try:
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(f"El archivo del modelo no se encontró en la ruta: {MODEL_PATH}")
    if not os.path.exists(TOKENIZER_PATH):
        raise FileNotFoundError(f"El archivo del tokenizer no se encontró en la ruta: {TOKENIZER_PATH}")

    model = tf.keras.models.load_model(MODEL_PATH)
    with open(TOKENIZER_PATH, 'rb') as handle:
        tokenizer = pickle.load(handle)
    
    app.logger.info("✅ Modelo y tokenizer cargados correctamente.")

except Exception as e:
    # Guardar el error y el traceback completo para un diagnóstico detallado
    error_trace = traceback.format_exc()
    loading_error = e
    app.logger.error(f"❌ Error crítico al cargar los archivos: {e}")
    app.logger.error(f"Traceback completo:\n{error_trace}")
    model = None
    tokenizer = None

# --- Fail-Fast: Salir si los modelos no se cargaron ---
if loading_error is not None:
    app.logger.critical("La aplicación no puede iniciar porque los modelos no se cargaron. Saliendo.")
    sys.exit(1) # Salir con un código de error

# --- Función de Limpieza de Texto ---
def limpiar_texto(texto):
    if not isinstance(texto, str):
        return ""
    texto = texto.lower()
    texto = re.sub(r'https?://\S+|www\.\S+', ' ', texto)
    texto = re.sub(r'@\w+|#\w+', ' ', texto)
    texto = re.sub(r'[^\w\s]', ' ', texto)
    texto = re.sub(r'\s+', ' ', texto).strip()
    return texto

# --- Endpoints de la API ---

@app.route('/predict', methods=['POST'])
def predict():
    # Este chequeo es ahora redundante si la app sale al fallar,
    # pero se mantiene como una capa extra de seguridad.
    if model is None or tokenizer is None:
        error_details = {
            "message": "El modelo no está disponible o no se pudo cargar.",
            "root_cause": str(loading_error) if loading_error else "Error desconocido post-inicio."
        }
        app.logger.warning(f"Intento de predicción fallido: {error_details['message']}")
        return jsonify({"status": "error", "error": error_details}), 500

    try:
        data = request.get_json()
        if not data or 'text' not in data:
            raise BadRequest("El campo 'text' es requerido en el JSON.")
        
        texto_original = data['text']
        if not texto_original.strip():
            raise BadRequest("El campo 'text' no puede estar vacío.")

        # 1. Limpiar el texto
        texto_limpio = limpiar_texto(texto_original)

        # 2. Tokenizar y aplicar padding
        secuencia = tokenizer.texts_to_sequences([texto_limpio])
        secuencia_pad = pad_sequences(secuencia, maxlen=MAX_SEQUENCE_LENGTH)

        # 3. Realizar la predicción
        prediccion_probs = model.predict(secuencia_pad)[0]
        
        # 4. Formatear la respuesta
        indice_predicho = np.argmax(prediccion_probs)
        sentimiento_predicho = CATEGORIAS[indice_predicho]
        confianza = float(prediccion_probs[indice_predicho])

        probabilidades = [
            {"name": "Negative", "value": float(prediccion_probs[0])},
            {"name": "Neutral", "value": float(prediccion_probs[1])},
            {"name": "Positive", "value": float(prediccion_probs[2])}
        ]

        response = {
            "sentiment": sentimiento_predicho,
            "confidence": confianza,
            "probabilities": probabilidades
        }
        
        return jsonify(response)

    except BadRequest as e:
        app.logger.error(f"Error de BadRequest en /predict: {e}")
        return jsonify({"status": "error", "error": {"message": str(e)}}), 400
    except Exception as e:
        error_trace = traceback.format_exc()
        app.logger.error(f"Error inesperado durante la predicción: {e}\n{error_trace}")
        return jsonify({"status": "error", "error": {"message": "Ocurrió un error interno al procesar la solicitud."}}), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "ok",
        "service_status": "Running",
        "model_status": "Loaded Successfully"
    })

# --- Endpoints de Bluesky ---

@app.route('/bluesky/feed', methods=['GET'])
def get_bluesky_feed():
    """
    Obtener el feed de Bluesky del usuario conectado.
    
    Parámetros query:
    - limit: número de posts (default: 10, máximo: 50)
    
    Ejemplo: /bluesky/feed?limit=5
    """
    try:
        limit = min(int(request.args.get('limit', 10)), 50)
        
        posts = bluesky_service.get_feed(limit=limit)
        
        if not posts:
            return jsonify({"error": "No se pudieron obtener posts del feed de Bluesky"}), 400
        
        return jsonify({"posts": posts, "count": len(posts)})
    
    except ValueError:
        return jsonify({"error": "El parámetro 'limit' debe ser un número."}), 400
    except Exception as e:
        app.logger.error(f"Error obteniendo feed de Bluesky: {e}\n{traceback.format_exc()}")
        return jsonify({"error": "Error al obtener el feed de Bluesky"}), 500

@app.route('/bluesky/search', methods=['GET'])
def search_bluesky():
    """
    Buscar posts en Bluesky.
    
    Parámetros query (requeridos):
    - q: término de búsqueda
    - limit: número de resultados (default: 10, máximo: 50)
    
    Ejemplo: /bluesky/search?q=python&limit=5
    """
    try:
        query = request.args.get('q')
        limit = min(int(request.args.get('limit', 10)), 50)
        
        if not query:
            return jsonify({"error": "El parámetro 'q' (query) es requerido."}), 400
        
        posts = bluesky_service.search_posts(query, limit=limit)
        
        if not posts:
            return jsonify({"error": f"No se encontraron posts con '{query}'"}), 400
        
        return jsonify({"query": query, "posts": posts, "count": len(posts)})
    
    except ValueError:
        return jsonify({"error": "El parámetro 'limit' debe ser un número."}), 400
    except Exception as e:
        app.logger.error(f"Error buscando en Bluesky: {e}\n{traceback.format_exc()}")
        return jsonify({"error": "Error al buscar en Bluesky"}), 500

@app.route('/bluesky/author/<author>', methods=['GET'])
def get_bluesky_author(author):
    """
    Obtener posts de un autor en Bluesky.
    
    Parámetros query:
    - limit: número de posts (default: 10, máximo: 50)
    
    Ejemplo: /bluesky/author/user.bsky.social?limit=5
    """
    try:
        limit = min(int(request.args.get('limit', 10)), 50)
        
        posts = bluesky_service.get_posts_by_author(author, limit=limit)
        
        if not posts:
            return jsonify({"error": f"No se pudieron obtener posts de @{author}"}), 400
        
        return jsonify({"author": author, "posts": posts, "count": len(posts)})
    
    except ValueError:
        return jsonify({"error": "El parámetro 'limit' debe ser un número."}), 400
    except Exception as e:
        app.logger.error(f"Error obteniendo posts del autor: {e}\n{traceback.format_exc()}")
        return jsonify({"error": "Error al obtener posts del autor"}), 500
    # Usar el puerto 5001 para evitar conflictos
    app.run(host='0.0.0.0', port=5001, debug=False)
    
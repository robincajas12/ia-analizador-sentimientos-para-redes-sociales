
import os
import re
import sys # Import sys to exit application
import pickle
import traceback # Import traceback for detailed error logging
import numpy as np
import tensorflow as tf
from flask import Flask, request, jsonify
from tensorflow.keras.preprocessing.sequence import pad_sequences
from werkzeug.exceptions import BadRequest

# --- Configuración Inicial ---
MAX_SEQUENCE_LENGTH = 100
MODEL_PATH = 'modelo_final_sentiment.h5'
TOKENIZER_PATH = 'tokenizer.pickle'

# Diccionario para mapear el resultado
CATEGORIAS = {0: 'Negative', 1: 'Neutral', 2: 'Positive'}

# --- Creación de la App Flask ---
app = Flask(__name__)

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

        probabilidades = {
            "Positive": float(prediccion_probs[2]),
            "Negative": float(prediccion_probs[0]),
            "Neutral": float(prediccion_probs[1])
        }

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
    # Si la app está corriendo, este endpoint siempre debería devolver OK
    # porque la app habría fallado al iniciar si el modelo no estuviera listo.
    return jsonify({
        "status": "ok",
        "service_status": "Running",
        "model_status": "Loaded Successfully"
    })

if __name__ == '__main__':
    # Usar el puerto 5001 para evitar conflictos
    app.run(host='0.0.0.0', port=5001, debug=False)
    
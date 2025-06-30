from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dosha_scoring import calculate_dosha_scores, load_config

app = Flask(__name__)
CORS(app, supports_credentials=True)

@app.route('/')
def home():
    return 'Ayurveda Now Backend is running!'

@app.route('/analyze', methods=['POST'])
def analyze():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No JSON payload provided'}), 400
        # Ожидаемые параметры
        required = ['hr', 'hrv', 'amplitude', 'morphology']
        missing = [k for k in required if k not in data]
        if missing:
            return jsonify({'error': f'Missing parameters: {", ".join(missing)}'}), 400
        # Преобразуем к float и проверяем
        try:
            params = {k: float(data[k]) for k in required}
        except (ValueError, TypeError):
            return jsonify({'error': 'Parameters must be numeric'}), 400
        scores = calculate_dosha_scores(params)
        dominant = max(scores, key=scores.get)
        return jsonify({'scores': scores, 'dominant_dosha': dominant})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/config', methods=['GET'])
def get_config():
    try:
        config = load_config()
        return jsonify(config)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    return 'OK', 200

if __name__ == '__main__':
    app.run(debug=True)

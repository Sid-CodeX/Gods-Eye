from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import pipeline

app = Flask(__name__)
CORS(app)

# Global detector instance
detector = None

def load_model():
    global detector
    try:
        print("Loading AI model (Hello-SimpleAI/chatgpt-detector-roberta)...")
        # Initialize pipeline for text classification
        detector = pipeline("text-classification", model="Hello-SimpleAI/chatgpt-detector-roberta")
        print("Model loaded successfully.")
    except Exception as e:
        print(f"Error loading model: {e}")

@app.route('/detect', methods=['POST'])
def detect():
    data = request.json
    if not data or 'text' not in data:
        return jsonify({'error': 'No text provided'}), 400
        
    text = data['text']
    
    if not text.strip():
        return jsonify({'error': 'Empty text'}), 400
        
    if detector is None:
        return jsonify({'error': 'AI Model not available or still loading'}), 503
        
    try:
        # Evaluate authenticity
        # Truncation is needed because Roberta models have a 512 token max length limit
        results = detector(text, truncation=True, max_length=512)
        
        # Results format: [{'label': 'ChatGPT', 'score': 0.999}] or [{'label': 'Human', 'score': 0.999}]
        result = results[0]
        original_label = result['label']
        
        # Map labels
        if original_label == 'ChatGPT':
            corrected_label = 'Fake (AI-Generated)'
        else:
            corrected_label = 'Real (Human-Written)'
        
        return jsonify({
            'label': corrected_label,
            'score': result['score'],
            'report': f"Authenticity: {result['score']*100:.1f}% {corrected_label}"
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    load_model()
    app.run(port=5000, host="127.0.0.1", debug=True)

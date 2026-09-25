from io import BytesIO
from pathlib import Path

import numpy as np
from flask import Flask, jsonify, request
from flask_cors import CORS
from PIL import Image, UnidentifiedImageError

from rough import predict_probabilities


ROOT = Path(__file__).resolve().parent
MODEL_PATH = ROOT / "model" / "parameters.npz"

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 10 * 1024 * 1024
CORS(app)


def load_model():
    data = np.load(MODEL_PATH, allow_pickle=False)
    parameters = {
        key: data[key]
        for key in data.files
        if key.startswith("W") or key.startswith("b")
    }
    classes = data["classes"]
    num_px = int(data["num_px"])
    return parameters, classes, num_px


if MODEL_PATH.exists():
    parameters, classes, num_px = load_model()
else:
    parameters, classes, num_px = None, None, None


@app.get("/health")
def health():
    return jsonify(
        status="ok" if parameters is not None else "model_missing",
        model_loaded=parameters is not None,
    )


@app.post("/predict")
def predict():
    if parameters is None:
        return jsonify(error="Model file is missing. Run python model/train_model.py first."), 503

    uploaded_file = request.files.get("file")
    if uploaded_file is None or not uploaded_file.filename:
        return jsonify(error="Upload an image using the 'file' field."), 400

    try:
        image = Image.open(BytesIO(uploaded_file.read()))
        probabilities = predict_probabilities(image, parameters, classes, num_px)
    except (UnidentifiedImageError, OSError):
        return jsonify(error="The uploaded file is not a supported image."), 400

    prediction = max(probabilities, key=probabilities.get)
    return jsonify(
        prediction=prediction,
        confidence=probabilities[prediction],
        probabilities=probabilities,
    )


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False)
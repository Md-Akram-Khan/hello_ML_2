from io import BytesIO

from flask import Flask, jsonify, render_template, request
from PIL import Image, UnidentifiedImageError

from rough import predict_image, train_model


app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 10 * 1024 * 1024

print("Training model for the web app...")
parameters, classes, num_px = train_model()
print("Model ready.")


@app.get("/")
def index():
    return render_template("index.html")


@app.post("/predict")
def predict():
    uploaded_file = request.files.get("image")
    if uploaded_file is None or not uploaded_file.filename:
        return jsonify(error="Choose an image before predicting."), 400

    try:
        image = Image.open(BytesIO(uploaded_file.read()))
        label, confidence, _ = predict_image(image, parameters, classes, num_px)
    except (UnidentifiedImageError, OSError):
        return jsonify(error="The uploaded file is not a supported image."), 400

    return jsonify(label=label, confidence=round(confidence * 100, 1))


if __name__ == "__main__":
    app.run(debug=False)
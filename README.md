# DNN Image Classifier

Full-stack image classification using the supplied NumPy deep neural network.

The model keeps the original preprocessing and inference contract:

- RGB image converted to `64 x 64`
- Flattened into a `(12288, 1)` input
- Pixel values divided by `255`
- Existing `L_model_forward` sigmoid output used as probabilities
- Dataset labels read from `list_classes` in the supplied HDF5 data

## Backend

Install Python dependencies and generate the local model artifact:

```powershell
python -m pip install -r requirements.txt
python model/train_model.py
python backend.py
```

The API runs at `http://localhost:5000`.

- `GET /health`
- `POST /predict` with multipart field `file`

## Frontend

```powershell
cd frontend
npm install
npm run dev
```

The Vite app runs at `http://localhost:5173` and calls the Flask API.

Set `VITE_API_URL` when the API is hosted elsewhere:

```powershell
$env:VITE_API_URL = "https://your-api.example.com"
npm run dev
```
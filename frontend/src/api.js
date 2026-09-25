const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export async function checkHealth() {
  const response = await fetch(`${API_URL}/health`);
  if (!response.ok) throw new Error("The model service is unavailable.");
  return response.json();
}

export async function classifyImage(file) {
  const body = new FormData();
  body.append("file", file);
  const response = await fetch(`${API_URL}/predict`, { method: "POST", body });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Prediction failed.");
  return {
    label: data.prediction,
    confidence: data.confidence * 100,
    probabilities: Object.fromEntries(
      Object.entries(data.probabilities).map(([label, probability]) => [label, probability * 100]),
    ),
  };
}
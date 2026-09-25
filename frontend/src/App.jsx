import { useEffect, useRef, useState } from "react";
import {
  Activity,
  AlertCircle,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  FileImage,
  ImagePlus,
  LoaderCircle,
  Sparkles,
  UploadCloud,
} from "lucide-react";
import { checkHealth, predictImage } from "./api";

function App() {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [serviceStatus, setServiceStatus] = useState("checking");

  useEffect(() => {
    checkHealth()
      .then((data) => setServiceStatus(data.model_loaded ? "ready" : "missing"))
      .catch(() => setServiceStatus("offline"));
  }, []);

  function chooseFile(nextFile) {
    if (!nextFile || !nextFile.type.startsWith("image/")) {
      setError("Choose a valid image file.");
      return;
    }
    setFile(nextFile);
    setPreviewUrl(URL.createObjectURL(nextFile));
    setResult(null);
    setError("");
  }

  function handleDrop(event) {
    event.preventDefault();
    setIsDragging(false);
    chooseFile(event.dataTransfer.files[0]);
  }

  async function analyze() {
    if (!file) return;
    setIsAnalyzing(true);
    setError("");
    try {
      setResult(await predictImage(file));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsAnalyzing(false);
    }
  }

  const statusLabel = {
    checking: "Checking model",
    ready: "Model online",
    missing: "Model file missing",
    offline: "API offline",
  }[serviceStatus];

  return (
    <div className="app-shell">
      <nav className="topbar">
        <a className="brand" href="/" aria-label="Signal Classifier home">
          <span className="brand-mark"><Sparkles size={16} /></span>
          <span><strong>Signal</strong><small>deep vision lab</small></span>
        </a>
        <div className="topbar-meta">
          <span className="model-name">DNN / CAT-NONCAT</span>
          <span className={`status-pill ${serviceStatus}`}><Activity size={14} /> {statusLabel}</span>
        </div>
      </nav>

      <main>
        <section className="hero">
          <p className="eyebrow"><span /> IMAGE INTELLIGENCE / 01</p>
          <h1>Make the pixels<br /><em>speak.</em></h1>
          <p className="hero-copy">A compact deep neural network turns one uploaded image into a clear classification signal.</p>
        </section>

        <section className="workspace">
          <div className="control-column">
            <div className="section-heading"><span>01</span><h2>Input image</h2></div>
            <div
              className={`dropzone ${isDragging ? "dragging" : ""} ${file ? "has-file" : ""}`}
              onDragOver={(event) => { event.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              role="button"
              tabIndex="0"
              onKeyDown={(event) => event.key === "Enter" && inputRef.current?.click()}
            >
              <input ref={inputRef} type="file" accept="image/*" onChange={(event) => chooseFile(event.target.files[0])} />
              <span className="upload-icon"><UploadCloud size={23} /></span>
              <strong>{file ? file.name : "Drop an image here"}</strong>
              <small>{file ? `${(file.size / 1024).toFixed(1)} KB ready for analysis` : "or browse from your device"}</small>
              {!file && <span className="format-note">JPG · PNG · WEBP · AVIF</span>}
            </div>
            {error && <div className="error-message"><AlertCircle size={17} /> {error}</div>}
            <button className="analyze-button" disabled={!file || isAnalyzing} onClick={analyze}>
              {isAnalyzing ? <><LoaderCircle className="spin" size={18} /> Analyzing signal</> : <><ImagePlus size={18} /> Analyze image <ArrowUpRight size={18} /></>}
            </button>
            <p className="technical-note">Input is resized to 64 × 64 RGB pixels and normalized using the original model pipeline.</p>
          </div>

          <div className="result-column">
            <div className="section-heading"><span>02</span><h2>Inference result</h2><BarChart3 size={19} /></div>
            {!result ? (
              <div className="result-empty"><div className="empty-orbit"><FileImage size={28} /></div><strong>Awaiting an image</strong><p>Your classification and probability distribution will appear here.</p></div>
            ) : (
              <div className="result-content">
                <div className="result-image-wrap"><img src={previewUrl} alt="Uploaded input" /><span><CheckCircle2 size={15} /> analyzed</span></div>
                <div className="prediction-row"><div><small>PRIMARY PREDICTION</small><h3>{result.prediction}</h3></div><div className="confidence"><strong>{(result.confidence * 100).toFixed(1)}%</strong><small>confidence</small></div></div>
                <div className="probability-block"><div className="probability-title"><span>Probability distribution</span><span>score</span></div>{Object.entries(result.probabilities).map(([label, value]) => <div className="probability-row" key={label}><div><span>{label}</span><strong>{(value * 100).toFixed(1)}%</strong></div><div className="bar-track"><span style={{ width: `${value * 100}%` }} /></div></div>)}</div>
              </div>
            )}
          </div>
        </section>
      </main>

      <footer><span>Signal / DNN Image Classifier</span><span>INFERENCE STATUS <b className={serviceStatus === "ready" ? "live-dot" : "off-dot"} /> {statusLabel.toUpperCase()}</span></footer>
    </div>
  );
}

export default App;
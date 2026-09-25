import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowUpRight,
  BrainCircuit,
  Check,
  CloudUpload,
  Image as ImageIcon,
  LoaderCircle,
  RotateCcw,
  ScanSearch,
  Sparkles,
  X,
} from "lucide-react";
import { checkHealth, classifyImage } from "./api";
import "./styles.css";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

function App() {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [serviceStatus, setServiceStatus] = useState("checking");

  useEffect(() => {
    checkHealth().then((data) => setServiceStatus(data.model_loaded ? "ready" : "missing")).catch(() => setServiceStatus("offline"));
  }, []);

  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);

  function selectFile(nextFile) {
    if (!nextFile) return;
    if (!ACCEPTED_TYPES.includes(nextFile.type)) { setError("Please select a JPG, PNG, WEBP, or AVIF image."); return; }
    if (nextFile.size > 10 * 1024 * 1024) { setError("The image must be smaller than 10 MB."); return; }
    setFile(nextFile);
    setPreviewUrl(URL.createObjectURL(nextFile));
    setResult(null);
    setError("");
  }

  function clearImage() {
    setFile(null);
    setPreviewUrl("");
    setResult(null);
    setError("");
    if (inputRef.current) inputRef.current.value = "";
  }

  async function analyzeImage() {
    if (!file || isLoading) return;
    setIsLoading(true);
    setError("");
    try { setResult(await classifyImage(file)); } catch (analysisError) { setError(analysisError.message); } finally { setIsLoading(false); }
  }

  function handleDrop(event) {
    event.preventDefault();
    setIsDragging(false);
    selectFile(event.dataTransfer.files?.[0]);
  }

  const statusLabel = { checking: "Checking model", ready: "Model online", missing: "Model missing", offline: "API offline" }[serviceStatus];

  return (
    <main className="app-shell">
      <div className="ambient ambient-one" /><div className="ambient ambient-two" />
      <div className="app-container">
        <header className="topbar">
          <div className="brand-lockup"><div className="brand-mark"><BrainCircuit size={21} /></div><div><p className="brand-name">NeuraVision</p><p className="brand-subtitle">Deep Neural Network Classifier</p></div></div>
          <div className="header-status"><span className={`status-dot ${serviceStatus}`} />{statusLabel}</div>
        </header>

        <section className="hero-copy">
          <div className="eyebrow"><Sparkles size={14} /> Neural inference, made clear</div>
          <h1>Understand what your image <span>contains.</span></h1>
          <p>Upload an image and let the deep neural network produce a prediction with confidence scores for every class.</p>
        </section>

        <section className="workspace-grid">
          <div className="panel">
            <div className="panel-heading"><div><p className="section-kicker">01 / Input</p><h2>Upload an image</h2></div><span className="step-icon"><CloudUpload size={19} /></span></div>
            <div className={`drop-zone ${isDragging ? "is-dragging" : ""} ${file ? "has-file" : ""}`} onDragEnter={(event) => { event.preventDefault(); setIsDragging(true); }} onDragOver={(event) => event.preventDefault()} onDragLeave={() => setIsDragging(false)} onDrop={handleDrop} onClick={() => inputRef.current?.click()} onKeyDown={(event) => event.key === "Enter" && inputRef.current?.click()} role="button" tabIndex={0}>
              <input ref={inputRef} type="file" hidden accept=".jpg,.jpeg,.png,.webp,.avif" onChange={(event) => selectFile(event.target.files?.[0])} />
              <div className="upload-orb"><CloudUpload size={28} /></div><h3>{file ? file.name : "Drop your image here"}</h3><p>{file ? `${(file.size / 1024 / 1024).toFixed(2)} MB ready` : "or click to browse from your computer"}</p>
              {!file && <span className="browse-button">Browse files <ArrowUpRight size={15} /></span>}
            </div>
            <div className="format-note">JPG, PNG, WEBP, or AVIF - max 10 MB</div>
          </div>

          <div className="panel">
            <div className="panel-heading"><div><p className="section-kicker">02 / Preview</p><h2>Your image</h2></div>{file && <button className="text-button" onClick={clearImage}><RotateCcw size={14} /> Choose another</button>}</div>
            <div className={`preview-frame ${!previewUrl ? "empty" : ""}`}>{previewUrl ? <img src={previewUrl} alt="Selected image preview" /> : <div className="empty-preview"><ImageIcon size={30} /><p>Your selected image<br />will appear here</p></div>}</div>
            <button className="analyze-button" disabled={!file || isLoading} onClick={analyzeImage}>{isLoading ? <><LoaderCircle className="spin" size={18} /> Analyzing image...</> : <><ScanSearch size={18} /> Analyze image</>}</button>
          </div>
        </section>

        {error && <div className="message"><AlertCircle size={19} /><span>{error}</span><button onClick={() => setError("")} aria-label="Dismiss error"><X size={17} /></button></div>}

        <section className="result-section">
          <div className="result-heading"><div><p className="section-kicker">03 / Result</p><h2>Model prediction</h2></div>{result && <span className="verified-badge"><Check size={14} /> Analysis complete</span>}</div>
          {result ? <div className="result-grid">
            <div className="result-image"><img src={previewUrl} alt="Analyzed upload" /><div className="image-caption">{file?.name}</div></div>
            <div className="result-card"><div className="result-icon"><BrainCircuit size={28} /></div><p className="result-label">Prediction</p><h3>{result.label}</h3><p className="result-status">The model identified this as the most likely class.</p><div className="confidence-row"><span>Confidence</span><strong>{result.confidence.toFixed(1)}%</strong></div><div className="confidence-track"><div style={{ width: `${result.confidence}%` }} /></div><div className="probabilities">{Object.entries(result.probabilities).map(([label, probability]) => <div className="probability" key={label}><div><span>{label}</span><strong>{probability.toFixed(1)}%</strong></div><div className="probability-track"><div style={{ width: `${probability}%` }} /></div></div>)}</div><button className="reset-button" onClick={clearImage}><RotateCcw size={15} /> Analyze another image</button></div>
          </div> : <div className="result-empty"><Sparkles size={21} /><div><h3>Your result will appear here</h3><p>Upload an image and run the model to see its prediction.</p></div></div>}
        </section>
        <footer><span>NeuraVision / Inference workspace</span><span>Powered by deep learning</span></footer>
      </div>
    </main>
  );
}

export default App;
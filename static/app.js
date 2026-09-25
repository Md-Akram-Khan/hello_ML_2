const form = document.querySelector('#upload-form');
const input = document.querySelector('#image-input');
const button = document.querySelector('#predict-button');
const dropzone = document.querySelector('.dropzone');
const emptyState = document.querySelector('#empty-state');
const previewState = document.querySelector('#preview-state');
const previewImage = document.querySelector('#preview-image');
const resultLabel = document.querySelector('#result-label');
const resultConfidence = document.querySelector('#result-confidence');
const status = document.querySelector('#status');

function showPreview(file) {
    if (!file) return;
    previewImage.src = URL.createObjectURL(file);
    previewImage.onload = () => URL.revokeObjectURL(previewImage.src);
    button.disabled = false;
    status.textContent = '';
}

input.addEventListener('change', () => showPreview(input.files[0]));
['dragenter', 'dragover'].forEach((eventName) => dropzone.addEventListener(eventName, (event) => {
    event.preventDefault();
    dropzone.classList.add('is-dragging');
}));
['dragleave', 'drop'].forEach((eventName) => dropzone.addEventListener(eventName, (event) => {
    event.preventDefault();
    dropzone.classList.remove('is-dragging');
}));
dropzone.addEventListener('drop', (event) => {
    const [file] = event.dataTransfer.files;
    if (file) {
        input.files = event.dataTransfer.files;
        showPreview(file);
    }
});

form.addEventListener('submit', async (event) => {
    event.preventDefault();
    button.disabled = true;
    button.firstChild.textContent = 'Classifying... ';
    status.textContent = '';
    try {
        const response = await fetch('/predict', { method: 'POST', body: new FormData(form) });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Prediction failed.');
        emptyState.classList.add('hidden');
        previewState.classList.remove('hidden');
        resultLabel.textContent = data.label;
        resultConfidence.textContent = `${data.confidence}% model confidence`;
    } catch (error) {
        status.textContent = error.message;
    } finally {
        button.disabled = false;
        button.firstChild.textContent = 'Classify image ';
    }
});
'use client';

import { useRef, useState } from 'react';

const downloadBlob = (blob, fileName) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.rel = 'noopener';

  document.body.appendChild(link);
  link.click();
  link.remove();

  window.setTimeout(() => URL.revokeObjectURL(url), 0);
};

export default function ImageConverterPage() {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [outputType, setOutputType] = useState('image/png');
  const [quality, setQuality] = useState(0.92);
  const [previewUrl, setPreviewUrl] = useState('');
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('Choose an image and convert it into a new browser-native format.');

  const handleFiles = async (incoming) => {
    const selectedFile = incoming?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setProgress(25);
    setMessage('Image loaded. Preparing file preview and conversion options...');

    const imageBitmap = await createImageBitmap(selectedFile);
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = imageBitmap.width;
    canvas.height = imageBitmap.height;
    context.drawImage(imageBitmap, 0, 0);
    setPreviewUrl(canvas.toDataURL(selectedFile.type || 'image/png'));
    setProgress(100);
    setMessage('Preview ready. Select a format and export.');
  };

  const convertImage = async () => {
    if (!file) return;

    const imageBitmap = await createImageBitmap(file);
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = imageBitmap.width;
    canvas.height = imageBitmap.height;
    context.drawImage(imageBitmap, 0, 0);

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, outputType, quality));
    const extension = outputType === 'image/png' ? 'png' : outputType === 'image/webp' ? 'webp' : 'jpg';
    downloadBlob(blob, `converted_${file.name.replace(/\.[^.]+$/, '')}.${extension}`);
    setProgress(100);
    setMessage('Conversion complete. Download started in your browser.');
  };

  return (
    <main className="container">
      <div className="card tool-shell">
        <div>
          <p className="eyebrow">files48</p>
          <h1>Image Converter</h1>
          <p className="muted">Convert common images between browser-supported formats without any server upload.</p>
        </div>

        <div className="upload-zone" onClick={() => inputRef.current?.click()}>
          <input ref={inputRef} type="file" accept="image/*" hidden onChange={(e) => handleFiles(e.target.files)} />
          <strong>Drop an image here or click to browse</strong>
          <div className="muted">JPG, PNG, and WebP export are supported with quality control.</div>
        </div>

        <div className="control-grid">
          <label>
            Output format
            <select value={outputType} onChange={(e) => setOutputType(e.target.value)}>
              <option value="image/png">PNG</option>
              <option value="image/jpeg">JPG</option>
              <option value="image/webp">WebP</option>
            </select>
          </label>
          <label>
            Quality
            <input type="range" min="0.4" max="1" step="0.05" value={quality} onChange={(e) => setQuality(Number(e.target.value))} />
            <span>{quality.toFixed(2)}</span>
          </label>
        </div>

        <div className="progress-wrap">
          <div className="progress"><div style={{ width: `${progress}%` }} /></div>
          <p>{message}</p>
        </div>

        {previewUrl && <div className="preview-gallery"><img alt="Image preview" src={previewUrl} /></div>}

        <button className="primary" onClick={convertImage} type="button">Convert image</button>
      </div>
    </main>
  );
}

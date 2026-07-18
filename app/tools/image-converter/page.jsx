'use client';

import { useRef, useState } from 'react';
import downloadBlob from '../../lib/downloadBlob';

const UploadIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 16 12 12 8 16" />
    <line x1="12" y1="12" x2="12" y2="21" />
    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
  </svg>
);

export default function ImageConverterPage() {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [outputType, setOutputType] = useState('image/png');
  const [quality, setQuality] = useState(0.92);
  const [previewUrl, setPreviewUrl] = useState('');
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('Choose an image and convert between formats.');

  const handleFiles = async (incoming) => {
    const selectedFile = incoming?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setProgress(25);
    setMessage('Loading image...');

    try {
      const imageBitmap = await createImageBitmap(selectedFile);
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = imageBitmap.width;
      canvas.height = imageBitmap.height;
      context.drawImage(imageBitmap, 0, 0);
      setPreviewUrl(canvas.toDataURL(selectedFile.type || 'image/png'));
      setProgress(100);
      setMessage('Image loaded. Choose format and convert.');
    } catch (error) {
      setMessage('Error loading image. The file may be corrupted or unsupported.');
      setProgress(0);
    }
  };

  const convertImage = async () => {
    if (!file) return;

    try {
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
      setMessage('Done! Your converted image download has started.');
    } catch (error) {
      setMessage('Error converting image. Please try a different format.');
      setProgress(0);
    }
  };

  return (
    <main className="container">
      <div className="card tool-shell">
        <div>
          <p className="eyebrow">files48</p>
          <h1>Image Converter</h1>
          <p className="muted">Convert between JPG, PNG, and WebP with quality control.</p>
        </div>

        <div className="upload-zone" onClick={() => inputRef.current?.click()}>
          <input ref={inputRef} type="file" accept="image/*" hidden onChange={(e) => handleFiles(e.target.files)} />
          <div className="upload-zone-icon"><UploadIcon /></div>
          <strong>Drop an image here or click to browse</strong>
          <div className="muted">JPG, PNG, and WebP formats supported</div>
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
            Quality ({quality.toFixed(2)})
            <input type="range" min="0.4" max="1" step="0.05" value={quality} onChange={(e) => setQuality(Number(e.target.value))} />
          </label>
        </div>

        {previewUrl && (
          <div className="preview-gallery">
            <div className="preview-thumb">
              <img alt="Image preview" src={previewUrl} />
            </div>
          </div>
        )}

        <div className="progress-wrap">
          <div className="progress"><div style={{ width: `${progress}%` }} /></div>
          <p>{message}</p>
        </div>

        <button className="primary" onClick={convertImage} type="button">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" /><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" /></svg>
          Convert image
        </button>
      </div>
    </main>
  );
}

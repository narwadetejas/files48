'use client';

import { useEffect, useRef, useState } from 'react';
import downloadBlob from '../../lib/downloadBlob';

const PRESETS = {
  instagram: { width: 1080, height: 1080 },
  linkedin: { width: 1584, height: 396 },
  passport: { width: 413, height: 531 },
};

const QUALITY_RANGE = {
  min: 1,
  max: 1200,
};

const getQualityFromTargetKb = (targetKb) => {
  const clamped = Math.max(QUALITY_RANGE.min, Math.min(QUALITY_RANGE.max, targetKb));
  const normalized = (clamped - QUALITY_RANGE.min) / (QUALITY_RANGE.max - QUALITY_RANGE.min);
  return Number((0.05 + normalized * 0.95).toFixed(2));
};

const getImageSource = async (file) => {
  if (typeof createImageBitmap === 'function') {
    return createImageBitmap(file);
  }

  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Unable to load image preview.'));
    };
    img.src = url;
  });
};

const getCanvasSize = (mode, imageBitmap, width, height, preset) => {
  if (mode === 'percentage') {
    return {
      width: Math.round(imageBitmap.width * (width / 100)),
      height: Math.round(imageBitmap.height * (height / 100)),
    };
  }

  if (mode === 'preset') {
    return PRESETS[preset];
  }

  if (mode === 'manual') {
    return { width, height };
  }

  const scale = Math.min(width / imageBitmap.width, height / imageBitmap.height);
  return {
    width: Math.round(imageBitmap.width * scale),
    height: Math.round(imageBitmap.height * scale),
  };
};

const renderSizedImage = async ({ file, outputType, quality, mode, width, height, preset }) => {
  const imageBitmap = await getImageSource(file);
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  const targetSize = getCanvasSize(mode, imageBitmap, width, height, preset);

  canvas.width = targetSize.width;
  canvas.height = targetSize.height;
  context.drawImage(imageBitmap, 0, 0, targetSize.width, targetSize.height);

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, outputType, quality));
  return { blob, canvas, imageBitmap, targetSize };
};

const findOptimalQuality = async ({ file, outputType, quality, mode, width, height, preset, qualityTargetKb }) => {
  let nextQuality = quality;
  let resolvedBlob = null;

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const result = await renderSizedImage({
      file,
      outputType,
      quality: nextQuality,
      mode,
      width,
      height,
      preset,
    });

    resolvedBlob = result.blob;

    if (resolvedBlob.size <= qualityTargetKb * 1024 || nextQuality <= 0.05) {
      break;
    }

    nextQuality = Math.max(0.05, Number((nextQuality - 0.08).toFixed(2)));
  }

  return { blob: resolvedBlob, quality: nextQuality };
};

const UploadIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

export default function ResizeImagePage() {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [mode, setMode] = useState('fit');
  const [preset, setPreset] = useState('instagram');
  const [width, setWidth] = useState(1080);
  const [height, setHeight] = useState(1080);
  const [qualityTargetKb, setQualityTargetKb] = useState(240);
  const [outputType, setOutputType] = useState('image/jpeg');
  const [originalPreviewUrl, setOriginalPreviewUrl] = useState('');
  const [resizedPreviewUrl, setResizedPreviewUrl] = useState('');
  const [actualOutputSize, setActualOutputSize] = useState('0 KB');
  const [effectiveQuality, setEffectiveQuality] = useState(0.78);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('Choose an image and resize it in your browser.');

  const quality = getQualityFromTargetKb(qualityTargetKb);

  useEffect(() => {
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setOriginalPreviewUrl(previewUrl);

    return () => URL.revokeObjectURL(previewUrl);
  }, [file]);

  useEffect(() => {
    if (!file) return;

    const refreshPreview = async () => {
      setProgress(18);
      setMessage('Rendering resized preview...');

      try {
        const { blob: resolvedBlob, quality: resolvedQuality } = await findOptimalQuality({
          file, outputType, quality, mode, width, height, preset, qualityTargetKb,
        });

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        const imageBitmap = await getImageSource(file);
        const targetSize = getCanvasSize(mode, imageBitmap, width, height, preset);
        canvas.width = targetSize.width;
        canvas.height = targetSize.height;
        context.drawImage(imageBitmap, 0, 0, targetSize.width, targetSize.height);

        setEffectiveQuality(resolvedQuality);
        setResizedPreviewUrl(canvas.toDataURL(outputType, resolvedQuality));
        setActualOutputSize(`${Math.max(1, Math.round(resolvedBlob.size / 1024))} KB`);
        setProgress(100);
        setMessage('Preview ready. Adjust settings or export.');
      } catch (error) {
        setMessage('Error rendering preview. Try different settings.');
        setProgress(0);
      }
    };

    refreshPreview();
  }, [file, mode, preset, width, height, outputType, quality, qualityTargetKb]);

  const handleFiles = async (incoming) => {
    const selectedFile = incoming?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setProgress(18);
    setMessage('Loading image...');

    try {
      const imageBitmap = await getImageSource(selectedFile);
      setWidth(imageBitmap.width);
      setHeight(imageBitmap.height);
      setActualOutputSize(`${Math.max(1, Math.round(selectedFile.size / 1024))} KB`);
      setProgress(100);
      setMessage('Image loaded. Preview updating with your settings.');
    } catch (error) {
      setMessage('Error loading image. The file may be corrupted.');
      setProgress(0);
    }
  };

  const exportResized = async () => {
    if (!file) return;

    try {
      const { blob: resolvedBlob, quality: resolvedQuality } = await findOptimalQuality({
        file, outputType, quality, mode, width, height, preset, qualityTargetKb,
      });

      const extension = outputType === 'image/png' ? 'png' : outputType === 'image/webp' ? 'webp' : 'jpg';
      downloadBlob(resolvedBlob, `resized_${file.name.replace(/\.[^.]+$/, '')}.${extension}`);
      setActualOutputSize(`${Math.max(1, Math.round(resolvedBlob.size / 1024))} KB`);
      setEffectiveQuality(resolvedQuality);
      setProgress(100);
      setMessage('Done! Your resized image download has started.');
    } catch (error) {
      setMessage('Error exporting image. Please try again.');
      setProgress(0);
    }
  };

  return (
    <main className="container">
      <div className="card tool-shell">
        <div>
          <p className="eyebrow">files48</p>
          <h1>Resize Image</h1>
          <p className="muted">Resize with live preview. Fit, scale, or use preset dimensions.</p>
        </div>

        <div className="upload-zone" onClick={() => inputRef.current?.click()}>
          <input ref={inputRef} type="file" accept="image/*" hidden onChange={(e) => handleFiles(e.target.files)} />
          <div className="upload-zone-icon"><UploadIcon /></div>
          <strong>Drop an image here or click to browse</strong>
          <div className="muted">Preview the result before downloading</div>
        </div>

        {originalPreviewUrl && (
          <div className="preview-grid">
            <div className="preview-card">
              <div className="preview-label">Original</div>
              <img alt="Original image preview" src={originalPreviewUrl} />
            </div>
            <div className="preview-card">
              <div className="preview-label">Resized preview</div>
              {resizedPreviewUrl ? <img alt="Resized image preview" src={resizedPreviewUrl} /> : <div className="preview-placeholder">Loading preview...</div>}
            </div>
          </div>
        )}

        <div className="control-grid">
          <label>
            Resize mode
            <select value={mode} onChange={(e) => setMode(e.target.value)}>
              <option value="fit">Fit within</option>
              <option value="percentage">Percentage scale</option>
              <option value="preset">Preset size</option>
              <option value="manual">Manual dimensions</option>
            </select>
          </label>
          <label>
            Output format
            <select value={outputType} onChange={(e) => setOutputType(e.target.value)}>
              <option value="image/jpeg">JPG</option>
              <option value="image/png">PNG</option>
              <option value="image/webp">WebP</option>
            </select>
          </label>
          <label>
            Width (px)
            <input type="number" value={width} onChange={(e) => setWidth(Number(e.target.value))} />
          </label>
          <label>
            Height (px)
            <input type="number" value={height} onChange={(e) => setHeight(Number(e.target.value))} />
          </label>
          <label>
            Preset
            <select value={preset} onChange={(e) => setPreset(e.target.value)}>
              <option value="instagram">Instagram post</option>
              <option value="linkedin">LinkedIn banner</option>
              <option value="passport">Passport photo</option>
            </select>
          </label>
        </div>

        <div className="quality-guide">
          <label>
            Target file size (KB)
            <input
              type="number"
              min={QUALITY_RANGE.min}
              max={QUALITY_RANGE.max}
              step="1"
              value={qualityTargetKb}
              onChange={(e) => {
                const nextValue = Number(e.target.value);
                setQualityTargetKb(Math.max(QUALITY_RANGE.min, Math.min(QUALITY_RANGE.max, nextValue || QUALITY_RANGE.min)));
              }}
            />
          </label>
          <label>
            Quality slider
            <input
              type="range"
              min={QUALITY_RANGE.min}
              max={QUALITY_RANGE.max}
              step="1"
              value={qualityTargetKb}
              onChange={(e) => setQualityTargetKb(Number(e.target.value))}
            />
          </label>
          <div className="muted">Actual output varies based on image content and format.</div>
        </div>

        <div className="progress-wrap">
          <div className="progress"><div style={{ width: `${progress}%` }} /></div>
          <p>{message}</p>
        </div>

        <div className="toolbar-row">
          <div className="muted">Target: <strong>{qualityTargetKb} KB</strong> &middot; Quality: <strong>{effectiveQuality.toFixed(2)}</strong> &middot; Output: <strong>{actualOutputSize}</strong></div>
          <div className="toolbar-actions">
            <button className="primary" onClick={exportResized} type="button">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
              Export resized image
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

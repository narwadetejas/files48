'use client';

import { useEffect, useRef, useState } from 'react';

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
  const [message, setMessage] = useState('Choose an image and resize it directly in the browser.');

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
      setMessage('Rendering a resized preview with your current settings...');

      let nextQuality = quality;
      let resolvedBlob = null;
      let resolvedCanvas = null;

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
        resolvedCanvas = result.canvas;

        if (resolvedBlob.size <= qualityTargetKb * 1024 || nextQuality <= 0.05) {
          break;
        }

        nextQuality = Math.max(0.05, Number((nextQuality - 0.08).toFixed(2)));
      }

      setEffectiveQuality(nextQuality);
      setResizedPreviewUrl(resolvedCanvas.toDataURL(outputType, nextQuality));
      setActualOutputSize(`${Math.max(1, Math.round(resolvedBlob.size / 1024))} KB`);
      setProgress(100);
      setMessage('Preview ready. Choose a resize mode and export.');
    };

    refreshPreview();
  }, [file, mode, preset, width, height, outputType, quality, qualityTargetKb]);

  const renderPreview = async () => {
    if (!file) return;

    setProgress(18);
    setMessage('Rendering a resized preview with your current settings...');

    let nextQuality = quality;
    let resolvedBlob = null;
    let resolvedCanvas = null;

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
      resolvedCanvas = result.canvas;

      if (resolvedBlob.size <= qualityTargetKb * 1024 || nextQuality <= 0.05) {
        break;
      }

      nextQuality = Math.max(0.05, Number((nextQuality - 0.08).toFixed(2)));
    }

    setEffectiveQuality(nextQuality);
    setResizedPreviewUrl(resolvedCanvas.toDataURL(outputType, nextQuality));
    setActualOutputSize(`${Math.max(1, Math.round(resolvedBlob.size / 1024))} KB`);
    setProgress(100);
    setMessage('Preview ready. Choose a resize mode and export.');
  };

  const handleFiles = async (incoming) => {
    const selectedFile = incoming?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setProgress(18);
    setMessage('Image loaded. Previewing resize options...');

    const imageBitmap = await getImageSource(selectedFile);
    setWidth(imageBitmap.width);
    setHeight(imageBitmap.height);
    setActualOutputSize(`${Math.max(1, Math.round(selectedFile.size / 1024))} KB`);
    setProgress(100);
    setMessage('Preview ready. Choose a resize mode and export.');
  };

  const exportResized = async () => {
    if (!file) return;

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

    const extension = outputType === 'image/png' ? 'png' : outputType === 'image/webp' ? 'webp' : 'jpg';
    downloadBlob(resolvedBlob, `resized_${file.name.replace(/\.[^.]+$/, '')}.${extension}`);
    setActualOutputSize(`${Math.max(1, Math.round(resolvedBlob.size / 1024))} KB`);
    setEffectiveQuality(nextQuality);
    setProgress(100);
    setMessage('Resize complete. The download has started locally.');
  };

  return (
    <main className="container">
      <div className="card tool-shell">
        <div>
          <p className="eyebrow">files48</p>
          <h1>Resize Image</h1>
          <p className="muted">A simpler resizing flow with a live preview and a quality choice users can understand at a glance.</p>
        </div>

        <div className="upload-zone" onClick={() => inputRef.current?.click()}>
          <input ref={inputRef} type="file" accept="image/*" hidden onChange={(e) => handleFiles(e.target.files)} />
          <strong>Drop an image here or click to browse</strong>
          <div className="muted">Uploads stay on-device. You can preview the result before downloading.</div>
        </div>

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
            Output type
            <select value={outputType} onChange={(e) => setOutputType(e.target.value)}>
              <option value="image/jpeg">JPG</option>
              <option value="image/png">PNG</option>
              <option value="image/webp">WebP</option>
            </select>
          </label>
          <label>
            Width
            <input type="number" value={width} onChange={(e) => setWidth(Number(e.target.value))} />
          </label>
          <label>
            Height
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
            Quality target (KB)
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
            Adjust quality size
            <input
              type="range"
              min={QUALITY_RANGE.min}
              max={QUALITY_RANGE.max}
              step="1"
              value={qualityTargetKb}
              onChange={(e) => setQualityTargetKb(Number(e.target.value))}
            />
          </label>
          <div className="muted">The target now goes down to 1 KB. Actual output can vary because format and image content set the final byte size.</div>
        </div>

        <div className="progress-wrap">
          <div className="progress"><div style={{ width: `${progress}%` }} /></div>
          <p>{message}</p>
        </div>

        {originalPreviewUrl && (
          <div className="preview-grid">
            <div className="preview-card">
              <div className="preview-label">Original</div>
              <img alt="Original image preview" src={originalPreviewUrl} />
            </div>
            <div className="preview-card">
              <div className="preview-label">Resized preview</div>
              {resizedPreviewUrl ? <img alt="Resized image preview" src={resizedPreviewUrl} /> : <div className="preview-placeholder">Loading preview…</div>}
            </div>
          </div>
        )}

        <div className="toolbar-row">
          <div className="muted">Target size: <strong>{qualityTargetKb} KB</strong> • Effective quality factor: {effectiveQuality.toFixed(2)} • Actual output size: {actualOutputSize}</div>
          <div className="toolbar-actions">
            <button className="primary" onClick={exportResized} type="button">Export resized image</button>
          </div>
        </div>
      </div>
    </main>
  );
}

'use client';

import { useRef, useState } from 'react';

const QUALITY_PRESETS = {
  draft: {
    label: 'Poor quality',
    value: 0.55,
    helper: 'Smallest file size, more compression.',
  },
  balanced: {
    label: 'Balanced',
    value: 0.78,
    helper: 'Strong balance of size and clarity.',
  },
  best: {
    label: 'Best quality',
    value: 0.94,
    helper: 'Sharper image, larger export size.',
  },
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

const parsePageRange = (range, pageCount) => {
  if (!range.trim()) return Array.from({ length: pageCount }, (_, index) => index + 1);

  const pages = new Set();
  range.split(',').forEach((part) => {
    const trimmed = part.trim();
    if (!trimmed) return;
    if (trimmed.includes('-')) {
      const [start, end] = trimmed.split('-').map((value) => Number(value));
      for (let page = start; page <= end; page += 1) {
        if (page >= 1 && page <= pageCount) pages.add(page);
      }
    } else {
      const page = Number(trimmed);
      if (page >= 1 && page <= pageCount) pages.add(page);
    }
  });

  return [...pages].sort((a, b) => a - b);
};

export default function PdfToImagePage() {
  const inputRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [qualityPreset, setQualityPreset] = useState('balanced');
  const [outputFormat, setOutputFormat] = useState('jpg');
  const [pageRange, setPageRange] = useState('all');
  const [message, setMessage] = useState('Choose a PDF to render pages into image files in the browser.');
  const [previewUrls, setPreviewUrls] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);

  const quality = QUALITY_PRESETS[qualityPreset].value;

  const loadPdfJs = async () => {
    const pdfjsLib = await import('pdfjs-dist');
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
    return pdfjsLib;
  };

  const handleFiles = async (incoming) => {
    const file = incoming?.[0];
    if (!file) return;

    setSelectedFile(file);
    setProgress(0);
    setMessage('Loading PDF and preparing thumbnails...');

    const pdfjsLib = await loadPdfJs();
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const previewList = [];

    for (let pageIndex = 1; pageIndex <= pdf.numPages; pageIndex += 1) {
      const page = await pdf.getPage(pageIndex);
      const viewport = page.getViewport({ scale: 1.3 });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      await page.render({ canvasContext: context, viewport }).promise;
      previewList.push(canvas.toDataURL(outputFormat === 'png' ? 'image/png' : 'image/jpeg', quality));
      setProgress(Math.round((pageIndex / pdf.numPages) * 100));
    }

    setPreviewUrls(previewList);
    setMessage(`${pdf.numPages} page(s) ready. Export selected pages as ${outputFormat.toUpperCase()}.`);
  };

  const exportPages = async () => {
    if (!selectedFile) return;

    const pdfjsLib = await loadPdfJs();
    const arrayBuffer = await selectedFile.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const pagesToExport = parsePageRange(pageRange === 'all' ? '' : pageRange, pdf.numPages);
    const zipEntries = [];

    for (const [index, pageNumber] of pagesToExport.entries()) {
      const page = await pdf.getPage(pageNumber);
      const viewport = page.getViewport({ scale: 1.4 });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      await page.render({ canvasContext: context, viewport }).promise;
      const blob = await new Promise((resolve) => {
        canvas.toBlob(resolve, outputFormat === 'png' ? 'image/png' : 'image/jpeg', quality);
      });
      zipEntries.push({ name: `${selectedFile.name.replace(/\.pdf$/i, '')}-page-${pageNumber}.${outputFormat}`, blob });
      setProgress(Math.round(((index + 1) / pagesToExport.length) * 100));
    }

    if (pagesToExport.length === 1) {
      downloadBlob(zipEntries[0].blob, zipEntries[0].name);
      setMessage('Single-page export complete.');
    } else {
      const { zipSync } = await import('client-zip');
      const zipped = zipSync(zipEntries.map((item) => new File([item.blob], item.name, { type: item.blob.type })));
      downloadBlob(zipped, `${selectedFile.name.replace(/\.pdf$/i, '')}_pages.zip`);
      setMessage('ZIP export complete.');
    }

    setProgress(100);
  };

  return (
    <main className="container">
      <div className="card tool-shell">
        <div>
          <p className="eyebrow">files48</p>
          <h1>PDF → Image</h1>
          <p className="muted">Render pages locally and export them in the format of your choice.</p>
        </div>

        <div className="upload-zone" onClick={() => inputRef.current?.click()}>
          <input ref={inputRef} type="file" accept="application/pdf" hidden onChange={(e) => handleFiles(e.target.files)} />
          <strong>Drop a PDF here or click to browse</strong>
          <div className="muted">Preview thumbnails are generated client-side from pdf.js.</div>
        </div>

        <div className="control-grid">
          <label>
            Output format
            <select value={outputFormat} onChange={(e) => setOutputFormat(e.target.value)}>
              <option value="jpg">JPG</option>
              <option value="png">PNG</option>
              <option value="webp">WebP</option>
            </select>
          </label>
          <label>
            Page range
            <input value={pageRange} onChange={(e) => setPageRange(e.target.value)} placeholder="all or 1-3,5" />
          </label>
        </div>

        <div className="quality-guide">
          {Object.entries(QUALITY_PRESETS).map(([key, preset]) => (
            <button
              key={key}
              type="button"
              className={`quality-chip ${qualityPreset === key ? 'active' : ''}`}
              onClick={() => setQualityPreset(key)}
            >
              <span>{preset.label}</span>
              <small>{preset.helper}</small>
            </button>
          ))}
        </div>

        <div className="progress-wrap">
          <div className="progress"><div style={{ width: `${progress}%` }} /></div>
          <p>{message}</p>
        </div>

        {previewUrls.length > 0 && (
          <div className="preview-gallery">
            {previewUrls.map((url, index) => (
              <div key={`${url}-${index}`} className="preview-thumb">
                <img alt={`PDF page ${index + 1} preview`} src={url} />
              </div>
            ))}
          </div>
        )}

        <div className="toolbar-row">
          <div className="muted">Selected quality: <strong>{QUALITY_PRESETS[qualityPreset].label}</strong></div>
          <button className="primary" onClick={exportPages} type="button">Export pages</button>
        </div>
      </div>
    </main>
  );
}

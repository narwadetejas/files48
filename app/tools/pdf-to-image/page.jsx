'use client';

import { useRef, useState } from 'react';
import downloadBlob from '../../lib/downloadBlob';

const QUALITY_PRESETS = {
  draft: {
    label: 'Draft',
    value: 0.55,
    helper: 'Small file, more compression.',
  },
  balanced: {
    label: 'Balanced',
    value: 0.78,
    helper: 'Good size and clarity.',
  },
  best: {
    label: 'Best quality',
    value: 0.94,
    helper: 'Sharp image, larger file.',
  },
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

const UploadIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

export default function PdfToImagePage() {
  const inputRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [qualityPreset, setQualityPreset] = useState('balanced');
  const [outputFormat, setOutputFormat] = useState('jpg');
  const [pageRange, setPageRange] = useState('all');
  const [message, setMessage] = useState('Choose a PDF to extract its pages as images.');
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
    setMessage('Loading PDF and generating previews...');

    try {
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
      setMessage(`${pdf.numPages} page(s) ready. Choose format and export.`);
    } catch (error) {
      setMessage('Error loading PDF. The file may be corrupted or unsupported.');
      setProgress(0);
    }
  };

  const exportPages = async () => {
    if (!selectedFile) return;

    try {
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
        setMessage('Done! Your image has been exported.');
      } else {
        const { zipSync } = await import('client-zip');
        const zipped = zipSync(zipEntries.map((item) => new File([item.blob], item.name, { type: item.blob.type })));
        downloadBlob(zipped, `${selectedFile.name.replace(/\.pdf$/i, '')}_pages.zip`);
        setMessage('Done! Your ZIP file download has started.');
      }

      setProgress(100);
    } catch (error) {
      setMessage('Error exporting pages. Please try again.');
      setProgress(0);
    }
  };

  return (
    <main className="container">
      <div className="card tool-shell">
        <div>
          <p className="eyebrow">files48</p>
          <h1>PDF to Image</h1>
          <p className="muted">Extract PDF pages as JPG, PNG, or WebP images. Rendered locally.</p>
        </div>

        <div className="upload-zone" onClick={() => inputRef.current?.click()}>
          <input ref={inputRef} type="file" accept="application/pdf" hidden onChange={(e) => handleFiles(e.target.files)} />
          <div className="upload-zone-icon"><UploadIcon /></div>
          <strong>Drop a PDF here or click to browse</strong>
          <div className="muted">Page previews are generated client-side via pdf.js</div>
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

        {previewUrls.length > 0 && (
          <div className="preview-gallery">
            {previewUrls.map((url, index) => (
              <div key={`${url}-${index}`} className="preview-thumb">
                <img alt={`PDF page ${index + 1} preview`} src={url} />
              </div>
            ))}
          </div>
        )}

        <div className="progress-wrap">
          <div className="progress"><div style={{ width: `${progress}%` }} /></div>
          <p>{message}</p>
        </div>

        <div className="toolbar-row">
          <div className="muted">Quality: <strong>{QUALITY_PRESETS[qualityPreset].label}</strong> &middot; Format: <strong>{outputFormat.toUpperCase()}</strong></div>
          <button className="primary" onClick={exportPages} type="button">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
            Export pages
          </button>
        </div>
      </div>
    </main>
  );
}

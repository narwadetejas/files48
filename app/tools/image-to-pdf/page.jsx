'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { PDFDocument } from 'pdf-lib';

const PAGE_SIZE_OPTIONS = {
  a4: [595.28, 841.89],
  letter: [612, 792],
};

const buildDownloadName = (name, suffix) => {
  const stem = name.replace(/\.[^.]+$/, '') || 'file';
  const safeStem = stem.replace(/[^a-zA-Z0-9-_ ]/g, '_');
  return `${safeStem}_${suffix}`;
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

export default function ImageToPdfPage() {
  const inputRef = useRef(null);
  const [files, setFiles] = useState([]);
  const [pageSize, setPageSize] = useState('a4');
  const [orientation, setOrientation] = useState('portrait');
  const [margin, setMargin] = useState('small');
  const [combineMode, setCombineMode] = useState('merge');
  const [outputName, setOutputName] = useState('images_files48.pdf');
  const [previewUrls, setPreviewUrls] = useState([]);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('Choose images and convert them locally in your browser.');

  const visibleFiles = useMemo(() => files.slice(0, 8), [files]);

  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  const moveFile = (index, direction) => {
    const next = [...files];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setFiles(next);
  };

  const handleFiles = (incoming) => {
    const list = Array.from(incoming || []);
    const nextPreviewUrls = list.map((file) => URL.createObjectURL(file));

    previewUrls.forEach((url) => URL.revokeObjectURL(url));
    setFiles(list);
    setPreviewUrls(nextPreviewUrls);
    if (list.length > 0) {
      setOutputName(buildDownloadName(list[0].name, 'files48.pdf'));
    }
    setProgress(0);
    setMessage(`Loaded ${list.length} image(s). Ready to process.`);
  };

  const processImages = async () => {
    if (!files.length) return;

    const pdfDoc = await PDFDocument.create();
    const marginMap = { none: 0, small: 12, large: 24 };
    const currentMargin = marginMap[margin] ?? 12;

    for (const [index, file] of files.entries()) {
      const bytes = await file.arrayBuffer();
      const image = file.type.includes('png')
        ? await pdfDoc.embedPng(bytes)
        : await pdfDoc.embedJpg(bytes);

      const baseWidth = image.width;
      const baseHeight = image.height;
      const normalizedPageWidth = PAGE_SIZE_OPTIONS[pageSize]?.[0] ?? baseWidth;
      const normalizedPageHeight = PAGE_SIZE_OPTIONS[pageSize]?.[1] ?? baseHeight;

      const page = pdfDoc.addPage(
        orientation === 'landscape'
          ? [normalizedPageHeight, normalizedPageWidth]
          : [normalizedPageWidth, normalizedPageHeight],
      );

      const drawWidth = pageSize === 'fit' ? baseWidth : normalizedPageWidth - currentMargin * 2;
      const drawHeight = pageSize === 'fit' ? baseHeight : normalizedPageHeight - currentMargin * 2;

      page.drawImage(image, {
        x: currentMargin,
        y: currentMargin,
        width: drawWidth,
        height: drawHeight,
      });

      setProgress(Math.round(((index + 1) / files.length) * 100));
    }

    setMessage('Rendering pages in the browser...');
    const pdfBytes = await pdfDoc.save();
    const fileName = outputName.endsWith('.pdf') ? outputName : `${outputName}.pdf`;
    downloadBlob(new Blob([pdfBytes], { type: 'application/pdf' }), fileName);
    setProgress(100);
    setMessage('Conversion complete. Your file download has started.');
  };

  return (
    <main className="container">
      <div className="card tool-shell">
        <div>
          <p className="eyebrow">files48</p>
          <h1>Image → PDF</h1>
          <p className="muted">This file is processed on your device and is never uploaded to a server.</p>
        </div>

        <div className="upload-zone" onClick={() => inputRef.current?.click()}>
          <input ref={inputRef} type="file" accept="image/*" multiple hidden onChange={(e) => handleFiles(e.target.files)} />
          <strong>Drop files here or click to browse</strong>
          <div className="muted">Supports JPG, PNG, WebP, and HEIC-ready browser-side conversion paths.</div>
        </div>

        <div className="control-grid">
          <label>
            Output file name
            <input value={outputName} onChange={(e) => setOutputName(e.target.value)} />
          </label>
          <label>
            Page size
            <select value={pageSize} onChange={(e) => setPageSize(e.target.value)}>
              <option value="a4">A4</option>
              <option value="letter">Letter</option>
              <option value="fit">Fit to image</option>
            </select>
          </label>
          <label>
            Orientation
            <select value={orientation} onChange={(e) => setOrientation(e.target.value)}>
              <option value="portrait">Portrait</option>
              <option value="landscape">Landscape</option>
            </select>
          </label>
          <label>
            Margin
            <select value={margin} onChange={(e) => setMargin(e.target.value)}>
              <option value="none">None</option>
              <option value="small">Small</option>
              <option value="large">Large</option>
            </select>
          </label>
          <label>
            Output mode
            <select value={combineMode} onChange={(e) => setCombineMode(e.target.value)}>
              <option value="merge">One merged PDF</option>
              <option value="split">One PDF per image</option>
            </select>
          </label>
        </div>

        <div className="progress-wrap">
          <div className="progress"><div style={{ width: `${progress}%` }} /></div>
          <p>{message}</p>
        </div>

        {visibleFiles.length > 0 && (
          <div className="preview-gallery">
            {visibleFiles.map((file, index) => (
              <div key={`${file.name}-${index}`} className="preview-thumb">
                <img src={previewUrls[index]} alt={file.name} />
                <div className="preview-item">
                  <span>{file.name}</span>
                  <div>
                    <button onClick={() => moveFile(index, -1)} type="button">↑</button>
                    <button onClick={() => moveFile(index, 1)} type="button">↓</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <button className="primary" onClick={processImages} type="button">Convert to PDF</button>
      </div>
    </main>
  );
}

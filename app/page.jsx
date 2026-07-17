import Link from 'next/link';

const tools = [
  {
    name: 'Image → PDF',
    href: '/tools/image-to-pdf',
    icon: '/media/imagetopdf.png',
    description: 'Turn images into clean multi-page PDFs with page size, margin, and orientation controls.',
  },
  {
    name: 'PDF → Image',
    href: '/tools/pdf-to-image',
    icon: '/media/pdftoimage.svg',
    description: 'Render PDF pages to JPG, PNG, or WebP with preview thumbnails and page-range selection.',
  },
  {
    name: 'Resize Image',
    href: '/tools/resize-image',
    icon: '/media/resize-image.svg',
    description: 'Fit, scale, or preset your image dimensions directly in the browser.',
  },
  {
    name: 'Image Converter',
    href: '/tools/image-converter',
    icon: '/media/image-converter.svg',
    description: 'Switch between browser-friendly image formats with quality control.',
  },
];

const steps = [
  'Drop a file into the upload zone.',
  'Choose your output and adjust quality or page settings.',
  'Download the result instantly from your browser.',
];

export default function HomePage() {
  return (
    <div className="container">
      <section className="hero hero-panel">
        <div>
          <span className="eyebrow">privacy-first file toolkit</span>
          <h1 className="headline">The fastest file tools on the web.</h1>
          <p className="subhead">Upload. Convert. Download. Under 3 seconds. Nothing leaves your browser.</p>

          <div className="pill-row">
            <span className="pill">Zero upload queue</span>
            <span className="pill">Client-side processing</span>
            <span className="pill">No forced signup</span>
          </div>

          <div className="cta-row">
            <Link href="/tools/image-to-pdf" className="primary">Try Image → PDF</Link>
            <Link href="/tools/resize-image" className="secondary">Resize Image</Link>
          </div>
        </div>

        <div className="card feature-card hero-visual">
          <div className="card-topline">Fast tool preview</div>
          <div className="tool-visual-grid">
            {tools.map((tool) => (
              <div key={tool.name} className="tool-visual-item">
                <div className="tool-visual-icon" aria-hidden="true">
                  {tool.icon.startsWith('/') ? (
                    <img src={tool.icon} alt={tool.name} />
                  ) : (
                    tool.icon
                  )}
                </div>
                <div>
                  <strong>{tool.name}</strong>
                  <p className="muted">{tool.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading-row">
          <h2>How it works</h2>
          <p className="muted">Fast, local, and designed to feel immediate.</p>
        </div>

        <div className="step-grid">
          {steps.map((step, index) => (
            <div key={step} className="step-card">
              <div className="step-number">0{index + 1}</div>
              <p>{step}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading-row">
          <h2>Core tools</h2>
          <p className="muted">Each route is designed around the PRD’s “instant, local, and frictionless” promise.</p>
        </div>

        <div className="grid">
          {tools.map((tool) => (
            <Link key={tool.name} href={tool.href} className="tool-card">
              <div className="tool-card-badge">Local</div>
              <div className="tool-card-icon" aria-hidden="true">
                {tool.icon.startsWith('/') ? (
                  <img src={tool.icon} alt={tool.name} />
                ) : (
                  tool.icon
                )}
              </div>
              <h3>{tool.name}</h3>
              <p className="muted">{tool.description}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

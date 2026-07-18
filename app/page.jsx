import Link from 'next/link';
import { tools } from './lib/tools';

const steps = [
  { title: 'Drop a file', desc: 'Drag and drop or click to select your file in the upload zone.' },
  { title: 'Adjust settings', desc: 'Choose output format, quality, and other options.' },
  { title: 'Download instantly', desc: 'Get your result in seconds — nothing leaves your browser.' },
];

const stepIcons = [
  <svg key="0" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>,
  <svg key="1" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>,
  <svg key="2" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>,
];

export default function HomePage() {
  return (
    <div className="container">
      <section className="hero">
        <div className="hero-text">
          <div className="hero-eyebrow">Privacy-first file toolkit</div>
          <h1 className="headline">
            The fastest file tools<br />on the <span className="highlight">web</span>.
          </h1>
          <p className="subhead">
            Upload, convert, and download in seconds. All processing happens in your browser — your files never leave your device.
          </p>

          <div className="pill-row">
            <span className="pill">Zero upload queue</span>
            <span className="pill">Client-side only</span>
            <span className="pill">No signup required</span>
          </div>

          <div className="cta-row">
            <Link href="/tools/image-to-pdf" className="primary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
              Try Image to PDF
            </Link>
            <Link href="/tools/resize-image" className="secondary">Resize Image</Link>
          </div>
        </div>

        <div className="hero-visual">
          <div className="card-topline">Available tools</div>
          <div className="tool-visual-grid">
            {tools.map((tool) => (
              <Link key={tool.name} href={tool.href} className="tool-visual-item" style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="tool-visual-icon" aria-hidden="true">
                  <img src={tool.icon} alt="" />
                </div>
                <div>
                  <strong>{tool.name}</strong>
                  <p className="muted">{tool.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading-row">
          <h2>How it works</h2>
          <p className="muted">Three steps. No uploads. No waiting.</p>
        </div>

        <div className="step-grid">
          {steps.map((step, index) => (
            <div key={step.title} className="step-card">
              <div className="step-number">{stepIcons[index]}</div>
              <h3 style={{ margin: '0 0 4px', fontSize: '0.95rem' }}>{step.title}</h3>
              <p>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading-row">
          <h2>All tools</h2>
          <p className="muted">Instant, local, and frictionless.</p>
        </div>

        <div className="grid">
          {tools.map((tool) => (
            <Link key={tool.name} href={tool.href} className="tool-card">
              <div className="tool-card-badge">Local</div>
              <div className="tool-card-icon" aria-hidden="true">
                <img src={tool.icon} alt="" />
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

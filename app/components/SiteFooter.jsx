import Link from 'next/link';
import { toolLinks } from '../lib/tools.js';

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <strong>files48</strong>
          <p className="muted">Fast, privacy-first browser tools for image and PDF workflows.</p>
        </div>

        <div className="footer-links">
          {toolLinks.map((tool) => (
            <Link key={tool.href} href={tool.href} className="footer-link">
              {tool.label}
            </Link>
          ))}
        </div>

        <div className="footer-note muted">All processing happens on your device. No uploads. No accounts required.</div>
      </div>
    </footer>
  );
}

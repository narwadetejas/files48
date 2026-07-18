import Link from 'next/link';
import { sidebarTools } from '../lib/tools.js';

export default function Sidebar({ open, onClose }) {
  return (
    <>
      <div
        className={`sidebar-backdrop ${open ? 'open' : ''}`}
        onClick={onClose}
        aria-hidden={!open}
      />
      <aside className={`sidebar-panel ${open ? 'open' : ''}`} aria-label="Navigation sidebar">
        <div className="sidebar-header">
          <div>
            <p className="eyebrow">Menu</p>
            <h2>files48</h2>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Close menu">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>

        <nav className="sidebar-links">
          {sidebarTools.map((tool) => (
            <Link key={tool.href} href={tool.href} className="sidebar-link" onClick={onClose}>
              <span>{tool.label}</span>
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
}

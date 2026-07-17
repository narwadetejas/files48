import Link from 'next/link';

const toolLinks = [
  { href: '/tools/image-to-pdf', label: 'Image → PDF', icon: '🖼️' },
  { href: '/tools/pdf-to-image', label: 'PDF → Image', icon: '📄' },
  { href: '/tools/resize-image', label: 'Resize Image', icon: '📐' },
  { href: '/tools/image-converter', label: 'Image Converter', icon: '🔄' },
];

export default function Sidebar({ open, onClose }) {
  return (
    <>
      <div
        className={`sidebar-backdrop ${open ? 'open' : ''}`}
        onClick={onClose}
        aria-hidden={!open}
      />
      <aside className={`sidebar-panel ${open ? 'open' : ''}`} aria-label="Website features sidebar">
        <div className="sidebar-header">
          <div>
            <p className="eyebrow">All tools</p>
            <h2>files48</h2>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Close features menu">
            ✕
          </button>
        </div>

        <nav className="sidebar-links">
          {toolLinks.map((tool) => (
            <Link key={tool.href} href={tool.href} className="sidebar-link" onClick={onClose}>
              <span aria-hidden="true">{tool.icon}</span>
              <span>{tool.label}</span>
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
}

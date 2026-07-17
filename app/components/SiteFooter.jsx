import Link from 'next/link';

const footerLinks = [
  { href: '/tools/image-to-pdf', label: 'Image → PDF' },
  { href: '/tools/pdf-to-image', label: 'PDF → Image' },
  { href: '/tools/resize-image', label: 'Resize Image' },
  { href: '/tools/image-converter', label: 'Image Converter' },
];

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <strong>files48</strong>
          <p className="muted">Fast, privacy-first browser tools for image and PDF workflows.</p>
        </div>

        <div className="footer-links">
          {footerLinks.map((tool) => (
            <Link key={tool.href} href={tool.href} className="footer-link">
              {tool.label}
            </Link>
          ))}
        </div>

        <div className="footer-note muted">Processed on your device. No signup queue. No forced uploads.</div>
      </div>
    </footer>
  );
}

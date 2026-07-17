'use client';

import Link from 'next/link';
import { useState } from 'react';
import Sidebar from './Sidebar';

const tools = [
  { href: '/tools/image-to-pdf', label: 'Image → PDF' },
  { href: '/tools/pdf-to-image', label: 'PDF → Image' },
  { href: '/tools/resize-image', label: 'Resize Image' },
  { href: '/tools/image-converter', label: 'Image Converter' },
];

export default function TopBar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <header className="topbar">
        <div className="container topbar-inner">
          <div className="topbar-left">
            <button
              type="button"
              className="icon-button"
              aria-label="Open features menu"
              onClick={() => setSidebarOpen(true)}
            >
              ☰
            </button>

            <Link href="/" className="brand-mark">
              <span className="brand-badge">48</span>
              <span>
                <strong>files48</strong>
                <small>browser file tools</small>
              </span>
            </Link>
          </div>

          <nav className="nav-links" aria-label="Main navigation">
            {tools.map((tool) => (
              <Link key={tool.href} href={tool.href} className="nav-link">
                {tool.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
    </>
  );
}

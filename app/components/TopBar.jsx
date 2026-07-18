'use client';

import Link from 'next/link';
import { useState } from 'react';
import Sidebar from './Sidebar';
import { toolLinks } from '../lib/tools.js';

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
              aria-label="Open menu"
              onClick={() => setSidebarOpen(true)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
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
            {toolLinks.map((tool) => (
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

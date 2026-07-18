import Link from 'next/link';
import { toolLinks } from '../lib/tools.js';

export default function ToolsLayout({ children }) {
  return (
    <div className="tool-page-shell">
      <div className="container">
        <nav className="mini-nav" aria-label="Tool navigation">
          <Link href="/">Home</Link>
          {toolLinks.map((tool) => (
            <Link key={tool.href} href={tool.href}>{tool.label}</Link>
          ))}
        </nav>
        {children}
      </div>
    </div>
  );
}

import Link from 'next/link';

export default function ToolsLayout({ children }) {
  return (
    <div className="tool-page-shell">
      <div className="container">
        <div className="mini-nav">
          <Link href="/">Home</Link>
          <Link href="/tools/image-to-pdf">Image → PDF</Link>
          <Link href="/tools/pdf-to-image">PDF → Image</Link>
          <Link href="/tools/resize-image">Resize Image</Link>
          <Link href="/tools/image-converter">Image Converter</Link>
        </div>
        {children}
      </div>
    </div>
  );
}

import './globals.css';
import TopBar from './components/TopBar';
import SiteFooter from './components/SiteFooter';

export const metadata = {
  metadataBase: new URL('https://files48.in'),
  title: {
    default: 'files48 — browser file tools for image and PDF workflows',
    template: '%s | files48',
  },
  description: 'A privacy-first browser-based file utility suite for resizing images, converting images to PDF, and exporting PDF pages locally on-device.',
  applicationName: 'files48',
  keywords: ['resize image', 'image to pdf', 'pdf to image', 'image converter', 'browser file tools', 'files48.in'],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'files48',
    description: 'Fast browser-first tools for converting and resizing images and PDFs.',
    url: 'https://files48.in/',
    siteName: 'files48',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'files48',
    description: 'Fast browser-first tools for converting and resizing images and PDFs.',
  },
  icons: {
    icon: '/icon.svg',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="app-shell" suppressHydrationWarning>
        <TopBar />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}

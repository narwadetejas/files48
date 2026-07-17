export const dynamic = 'force-static';

export default function manifest() {
  return {
    name: 'files48',
    short_name: 'files48',
    description: 'Fast browser-first file tools for image and PDF workflows.',
    start_url: '/',
    display: 'standalone',
    background_color: '#f8fafc',
    theme_color: '#4f46e5',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any maskable',
      },
    ],
  };
}

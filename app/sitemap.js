export const dynamic = 'force-static';

export default function sitemap() {
  return [
    {
      url: 'https://files48.example.com/',
      lastModified: new Date(),
    },
    {
      url: 'https://files48.example.com/tools/image-to-pdf',
      lastModified: new Date(),
    },
    {
      url: 'https://files48.example.com/tools/pdf-to-image',
      lastModified: new Date(),
    },
    {
      url: 'https://files48.example.com/tools/resize-image',
      lastModified: new Date(),
    },
    {
      url: 'https://files48.example.com/tools/image-converter',
      lastModified: new Date(),
    },
  ];
}

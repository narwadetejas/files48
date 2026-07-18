export const tools = [
  {
    name: 'Image → PDF',
    href: '/tools/image-to-pdf',
    icon: '/media/imagetopdf.png',
    description: 'Turn images into clean multi-page PDFs with page size, margin, and orientation controls.',
  },
  {
    name: 'PDF → Image',
    href: '/tools/pdf-to-image',
    icon: '/media/pdftoimage.svg',
    description: 'Render PDF pages to JPG, PNG, or WebP with preview thumbnails and page-range selection.',
  },
  {
    name: 'Resize Image',
    href: '/tools/resize-image',
    icon: '/media/resize-image.svg',
    description: 'Fit, scale, or preset your image dimensions directly in the browser.',
  },
  {
    name: 'Image Converter',
    href: '/tools/image-converter',
    icon: '/media/image-converter.svg',
    description: 'Switch between browser-friendly image formats with quality control.',
  },
];

export const toolLinks = tools.map(({ href, name }) => ({ href, label: name }));

export const sidebarTools = tools.map(({ href, name }) => ({ href, label: name }));

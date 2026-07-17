# files48

files48 is a browser-first file utility SaaS concept built around a privacy-focused workflow.

## What this project contains

- A static-export Next.js app shell
- Four core tools:
  - Image → PDF
  - PDF → Image
  - Resize Image
  - Image Converter
- Browser-side processing design that keeps files on-device for the core user flow

## Tech used

- Next.js App Router
- React
- Tailwind-inspired custom CSS
- pdf-lib for PDF creation
- pdf.js for PDF rendering
- client-zip for browser-side multi-file zip download

## How to run locally

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Notes

The current implementation is the first working build aligned to the PRD’s MVP direction. It focuses on the browser-side processing pattern and a clean, fast UI.

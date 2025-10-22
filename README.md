# Image Text Detector (Web Version)

A simple web app that detects text in images using Tesseract.js OCR. Works completely in the browser - no server needed!

## Features

- Drag & drop image upload
- Real-time text detection using Tesseract.js
- No server required - works offline
- Mobile-friendly UI

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## How it Works

1. Upload an image using the file input
2. The image is processed client-side using Tesseract.js
3. Detected text appears in the right panel

## Tech Stack

- Next.js 13+ (App Router)
- TypeScript
- Tailwind CSS
- Tesseract.js for OCR

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

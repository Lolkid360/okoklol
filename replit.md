# Overview

This is a web-based image text detector application that extracts text from images using OCR (Optical Character Recognition) technology. The application allows users to either upload individual images or fetch multiple images from a webpage URL. It processes images client-side and server-side to detect and extract text, with a focus on Korean language support.

The application provides a dual-panel interface where users can view images on one side and see the extracted text on the other. It's designed to work as a chapter-based image translator, particularly useful for processing manga or webtoon chapters.

## Recent Changes

**October 21, 2025** (Evening): Added multi-language OCR and translation features
- Integrated OpenAI GPT-5 API for professional manga/webtoon translation
- Added Korean and Japanese language support to Tesseract.js (kor+jpn+eng)
- Implemented bounding box detection to preserve text positions
- Created canvas overlay component to display translated text at original positions
- Added batch translation optimization (single API call instead of per-word)
- Implemented Original/Translated toggle view
- Added graceful error handling with fallback to original text when translation fails

**October 21, 2025**: Successfully migrated from Vercel to Replit environment
- Updated port configuration to use 5000 with 0.0.0.0 binding for Replit compatibility
- Fixed Geist font imports to use new API (`geist/font/sans` and `geist/font/mono`)
- Optimized Tesseract.js worker configuration (removed deprecated methods, fixed worker cloning errors)
- Removed duplicate src/ directory and cleaned up backup files
- Configured autoscale deployment target
- Application now runs cleanly without errors in Replit environment

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

**Technology Stack**: Next.js 14 with App Router, React 18, TypeScript, and Tailwind CSS

The application uses Next.js's App Router pattern with a component-based architecture:

- **Main Page** (`app/page.tsx`): Manages application state including image lists, selected image index, and processing states. Coordinates between URL fetching, file uploads, and OCR results.

- **Component Structure**: 
  - `ImageUploader`: Handles file selection, image optimization (resizing to ~1000px width for performance), and triggers OCR processing
  - `Preview`: Displays the selected image with responsive scaling
  - `UrlInput`: Provides interface for fetching images from webpage URLs

**Client-Side Image Optimization**: Images are resized using HTML Canvas API before OCR processing to improve performance. The system targets a 1000px width with high-quality smoothing to balance speed and accuracy.

**State Management**: Uses React's built-in `useState` for local state management. No external state management library is used, keeping the architecture simple and lightweight.

## Backend Architecture

**API Routes**: Next.js API Routes handle server-side operations:

1. **OCR Processing** (`/api/ocr/route.ts`): 
   - Accepts image files via form data
   - Validates file type and size (max 10MB)
   - Processes images using Tesseract.js with Korean language support
   - Currently incomplete/in development

2. **Image Fetching** (`/api/fetch-images/route.ts`):
   - Fetches webpage content from provided URL
   - Extracts image URLs using regex pattern matching
   - Handles relative URL conversion to absolute URLs
   - Returns deduplicated list of image URLs

3. **Image Proxy** (`/api/fetch-images/proxy/route.ts`):
   - Proxies external images to bypass CORS restrictions
   - Adds appropriate headers for caching and access control

**Design Decision**: The architecture uses a hybrid approach with both client-side (Tesseract.js in browser) and server-side OCR capabilities. This provides flexibility for different use cases and performance optimization.

## Styling and UI

**Tailwind CSS**: Used for utility-first styling with custom CSS variables for theming support (light/dark mode via `prefers-color-scheme`).

**Font System**: Uses Geist Sans and Geist Mono fonts for modern typography.

**Responsive Design**: Mobile-friendly grid layout that adapts between single column and multi-column layouts.

## External Dependencies

### Third-Party Libraries

1. **Tesseract.js** (v5.0.3): Primary OCR engine for text detection
   - Client-side OCR processing in browser
   - Korean language support configured
   - Custom worker path configuration for Next.js compatibility
   - Local worker files stored in `public/tesseract/`

2. **Radix UI Components**: Accessible UI primitives
   - Dialog, Form, Label, Progress, ScrollArea, Select components
   - Provides accessible, unstyled component foundation

3. **Framer Motion** (v12.23.24): Animation library for smooth UI transitions

4. **Lucide React**: Icon library for UI elements

5. **next-themes**: Theme management for dark/light mode support

### Utility Libraries

- **class-variance-authority**: Component variant management
- **clsx** and **tailwind-merge**: Conditional CSS class composition
- **tailwindcss-animate**: Animation utilities for Tailwind CSS

### Development Tools

- **TypeScript**: Type safety throughout the application
- **ESLint**: Code quality and consistency
- **Autoprefixer**: CSS vendor prefix management

### Configuration Notes

- Application runs on port 5000 (both dev and production)
- Configured to listen on all network interfaces (0.0.0.0) for Replit environment compatibility
- Tesseract.js worker files are served from `/public/tesseract/` directory
- Uses Next.js App Router with `app/` directory structure

### Future Considerations

The OCR API route appears incomplete and may need additional configuration for language models and worker initialization. The application is designed to support multiple languages but currently focuses on Korean text detection.
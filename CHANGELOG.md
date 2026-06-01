# Changelog

All notable changes to this project will be documented in this file.

## [0.4.1] - 2026-05-31

### Changed

- Update PDF share text to include deployed app URL

## [0.4.0] - 2026-05-31

### Added

- mupdf-based PDF decryption for password-protected PDFs (in-browser, client-side only)
- Better password-protected PDF handling: decrypt before processing to enable vector text preservation

### Changed

- Extracted PDF page rendering logic into pdf-page-renderer module
- Extracted password handling helpers into pdf-password-handler module
- Generator now decrypts password-protected PDFs before creating pdfSource references
- Improved PDF service modularity for better code organization

### Fixed

- Blank pages from encrypted PDF text layers (now decrypts before reading streams)

## [0.3.3] - 2026-05-31

### Fixed

- Skip vector text detection for password-protected PDFs (pdf-lib can't decrypt streams, causes blank pages)

## [0.3.2] - 2026-05-31

### Fixed

- Handle unsupported PDF decode filters (CCITTFaxDecode, LZWDecode) gracefully
- Modal layout improvements: use dynamic viewport height (dvh) for mobile, flex sizing fixes
- Update PDF share message to mention app name

## [0.3.1] - 2026-05-31

### Changed

- Refactored PDF compression cache from string-based keys to WeakMap for cleaner identity tracking
- Extracted `loadPdfDoc()` helper in lib/pdf/types.ts for consistent PDF document loading
- Extracted `useImageSelection()` hook for image selection state management
- Extracted `PresetGrid` sub-component from CompressionControls
- Improved SVG accessibility (added title element to selection checkbox)

## [0.3.0] - 2026-05-31

### Added

- Password-protected PDF support with retry prompt
- Touch swipe navigation in image preview modal (mobile-friendly)
- Web Worker offloading for image compression (non-blocking main thread)
- PDF source indicators in image previews and thumbnails
- Version display in footer
- Environment-based Google Analytics configuration (dev/prod)
- Loading state feedback during pdfjs library initialization
- Upload area disabled state during file processing

### Changed

- Restructured workflow hook into organized namespaces (upload, preview, compression, export)
- Extracted upload components (UploadErrorBanner, AllowDuplicatesToggle) for better organization
- Standardized analytics naming with `app_` prefix
- Analytics session ID moved to global parameters
- Removed Partytown dependency, implemented postinstall script for pdfjs asset copying
- Updated Vite to 8.0.14
- Improved error serialization in logger for non-standard error types (pdfjs exceptions)
- Capped PDF page size to A4 width (595pt) to prevent oversized files
- Absolute URLs for pdfjs assets (cmaps, fonts, wasm, icc)

### Fixed

- PDF dict lookup error handling for malformed PDFs
- Undefined value handling in PDF compression
- Removed URL from Web Share API to improve app compatibility (WhatsApp, etc.)
- Mobile viewport zoom disabled (maximum-scale=1.0)
- Improved console message logging with metadata separation
- Cache key generation for PDF compression

### Removed

- Hardcoded Google Analytics ID from HTML
- Partytown script tags and configuration
- Unnecessary dynamic imports in compression worker pool
- `tryCatchDeoptimization: false` from Vite tree-shaking config

## [0.2.0] - 2026-01-15

### Initial release

- Image to PDF conversion with drag-and-drop upload
- Batch image compression with presets (high, medium, low, minimal)
- Preview modal with keyboard navigation
- Duplicate file detection
- PDF download and Web Share support
- Dark mode support
- Consent Mode v2 for Google Analytics
- IndexedDB storage for processed images

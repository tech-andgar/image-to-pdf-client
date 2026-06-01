# Changelog

All notable changes to this project will be documented in this file.

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

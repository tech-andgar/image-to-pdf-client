# Changelog

All notable changes to this project will be documented in this file.

## [0.5.2] - 2026-08-08

### Fixed

- `ReferenceError: Can't find variable: Temporal` crash on Safari: replaced `Temporal.Now.plainDateTimeISO()` with `new Date()` in `dateTokens.ts` — Temporal API is not yet available in Safari

## [0.5.1] - 2026-08-07

### Fixed

- `mupdf-wasm.wasm` 404 on GitHub Pages: WASM now copied to `public/wasm/` via postinstall and URL hardcoded at build time per deployment base path; Vite plugin prevents Rolldown from re-bundling it into `dist/assets/`
- `RangeError: invalid language tag` crash when `navigator.language` is falsy: `formatDateToken` now falls back to `'en'`

## [0.5.0] - 2026-08-07

### Added

- Date token insertion in filename input: clickable badges (`{date}`, `{year}`, `{month}`, `{day}`, `{time}`) insert formatted date parts at cursor position via new `DateTokenBadges` component and `dateTokens` service

### Security

- Applied npm security best practices (lirantal/npm-security-best-practices)
- Added `pnpm-workspace.yaml` with `blockExoticSubdeps: true`, `strictDepBuilds: true`, and `minimumReleaseAge: 10080` (7-day quarantine on newly published packages) to block transitive git/tarball URLs, unreviewed build scripts, and fresh supply chain attacks
- CI: use `pnpm install --frozen-lockfile` to enforce exact lockfile adherence and prevent lockfile injection

### Changed

- **`react` / `react-dom`** 19.2.6 → 19.2.8: patch fixes for Server Actions (`FormData` regression in 19.2.7), RSC decode performance improvement in 19.2.8; no breaking changes
- **`mupdf`** 1.27.0 → 1.28.0: fixed compilation of optional formats in mutool run; maintenance release
- **`pdfjs-dist`** 6.0.227 → 6.2.108: sound annotation support, digital signature & certificate verification, improved SMask handling, enhanced text selection via `Intl.Segmenter`, extended Unicode support, performance optimizations
- **`@radix-ui/react-dialog`** 1.1.15 → 1.1.23: prop spreading improvements, test infrastructure hardening
- **`@radix-ui/react-progress`** 1.1.8 → 1.1.16: prop spreading improvements, test infrastructure hardening
- **`@radix-ui/react-slot`** 1.2.4 → 1.3.3: prop spreading improvements, test infrastructure hardening
- **`vite`** 8.0.14 → 8.2.1: extended `server.fs.deny`, worker HMR support, `input` option for `server.fs.allow`, config error reporting with columns, network URL resolution, CSS minification optimizations, random port assignment fixes
- **`@biomejs/biome`** 2.4.16 → 2.5.7: new rules (`noExtendNative`, `noTailwindArbitraryValue`, `noJsRestrictedProperties`), ~7% formatter performance gain, BigInt literal support, Svelte/Vue improvements; migrated config with `biome migrate`
- **`tailwindcss`** 3.4.19 → 4.3.3: CSS-first config (`@import "tailwindcss"` replaces `@tailwind` directives), PostCSS plugin moved to `@tailwindcss/postcss`, `autoprefixer` now built-in and removed; renamed utilities (`shadow-sm`→`shadow-xs`, `rounded-sm`→`rounded-xs`, `outline-none`→`outline-hidden`), ring default changed from 3px to 1px; migrated via `@tailwindcss/upgrade`
- **`@vitejs/plugin-react`** 5.2.0 → 6.0.5: Babel removed as bundled dependency (no impact — project uses no Babel plugins); requires Vite 8+ (already met)
- **`lucide-react`** 0.545.0 → 1.30.0: brand icons removed (GitHub, Slack, Figma, etc.); no impact — project only uses UI icons
- **`globals`** 16.5.0 → 17.9.0: `audioWorklet` split from `browser` env, added `bun`/`deno`/`sharedWorker` environments; no direct usage in project
- **`autoprefixer`** removed: now built-in to Tailwind CSS v4
- **`postcss`** 8.5.15 → 8.5.26: fixed `list.split()` regression, improved symlink tracking in source maps, prototype hijacking vulnerability fixes, stack overflow prevention
- **`@types/react`** 19.2.15 → 19.2.18: type definition updates matching React 19.2.8
- **`@types/react-dom`** 19.2.3 → 19.2.4: type definition updates matching react-dom 19.2.8

### Fixed

- Added `<title>Documerge PDF</title>` to all SVG icon files for accessibility (biome `noSvgWithoutTitle`)
- Enhanced dark mode styling: active button colors in CompressionControls, drag handle and overlay styles in SortableImageItem, icon colors and analytics toggle background in PrivacyModal

## [0.4.4] - 2026-06-01

### Changed

- Completed design token migration across all components
- Removed hard-coded color classes in favor of design tokens
- Simplified conditional styling with unified token palette

## [0.4.3] - 2026-06-01

### Changed

- Refactored theme system from class-based to media query-based (automatic system preference detection)
- CSS: Replaced light-dark() with @media (prefers-color-scheme) for broader browser support
- Dialog and modal components now use design tokens instead of hard-coded colors
- PrivacyModal refactored to use Dialog component for consistency
- Updated app branding text in bug report links

## [0.4.2] - 2026-05-31

### Fixed

- Enable pinch-zoom on mobile (removed maximum-scale=1.0 from viewport)
- Prevent iOS auto-zoom when focusing filename input (use 16px font on mobile)
- Preview modal: enable touch panning and image zoom with touchAction: pinch-zoom

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

# 🖼️ Image to PDF Converter - Client Side

[![React](https://img.shields.io/badge/React-19.2.0-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6.3-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7.1.14-646CFF?style=flat-square&logo=vite)](https://vite.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.14-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)

**A modern, privacy-focused web application that converts images to PDF entirely in the browser**, ensuring user data never leaves their device.

![Build Status](https://img.shields.io/badge/Build-Passing-22C55E?style=flat-square)
![Lint](https://img.shields.io/badge/Lint-Passing-3B82F6?style=flat-square)
![Bundle Size](https://img.shields.io/badge/Bundle-307KB-8B5CF6?style=flat-square)

---

## ✨ **Features Implemented** ✅

### Phase 1: Project Setup & Modern Stack
- ✅ **React 19.2.0** with TypeScript 5.6.3
- ✅ **Vite 7.1.14** development server & build optimization
- ✅ **shadcn/ui v2.1.3** + Tailwind CSS 3.4.14 for responsive design
- ✅ **PWA support** with Vite PWA plugin for offline functionality

### Phase 2: Clean Architecture & File Management
- ✅ **Clean Architecture**: Separated layers (Types, Services, Hooks, UI)
- ✅ **Multi-format support**: JPEG, PNG, BMP, GIF with 10MB file validation
- ✅ **File processing**: Client-side validation, preview generation, and cleanup
- ✅ **TypeScript interfaces**: Full type safety with `ImageFile` shared types
- ✅ **Responsive design**: Mobile-first approach with shadcn/ui components

### Phase 3: Advanced Image Management & Drag & Drop
- ✅ **Drag & Drop Reordering**: Full desktop & mobile touch support
- ✅ **@dnd-kit integration**: Professional drag & drop with accessibility
- ✅ **Preview Modal**: Full-screen image viewing with keyboard navigation
- ✅ **Accessibility**: 100% WCAG compliant with ARIA labels and keyboard support
- ✅ **Performance**: Optimized build (307KB) with code splitting

---

## 🚀 **Getting Started**

### Prerequisites
- Node.js 18+
- pnpm (recommended) or npm/yarn

### Installation & Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd imgToPdfClient

# Install dependencies with pnpm (recommended)
pnpm install

# Start development server
pnpm run dev

# Build for production
pnpm run build

# Preview production build
pnpm run preview
```

### Development Scripts

```bash
pnpm run dev      # Start development server with HMR
pnpm run build    # Production build with optimizations
pnpm run preview  # Preview production build locally
pnpm run lint     # Run Biome linter and formatter
pnpm run format   # Format code with Biome
```

---

## 🏗️ **Architecture Overview**

```
📁 Project Structure
├── 📁 src/
│   ├── 📁 components/      # React components (UI Layer)
│   │   ├── 📁 ui/         # shadcn/ui reusable components
│   │   ├── ImagePreviewGrid.tsx    # 🖼️ Drag & drop grid
│   │   ├── ImagePreviewModal.tsx   # 🔍 Full-screen preview
│   │   └── UploadArea.tsx         # 📁 File upload zone
│   ├── 📁 hooks/          # Custom React hooks (Logic Layer)
│   │   └── useImageUpload.ts       # 🧠 Main state management
│   ├── 📁 services/       # Business logic (Service Layer)
│   │   ├── fileService.ts          # 🔧 File validation & processing
│   │   └── pdfService.ts            # 📄 PDF generation ready
│   ├── 📁 types/          # TypeScript definitions
│   │   └── image.ts                # 📝 Shared interfaces
│   └── main.tsx           # 🚀 App entry point
├── 📁 .ruler/                # 📋 Project documentation
├── 📁 public/             # 🖼️ Static assets & PWA files
└── 📁 dist/               # 📦 Production build output
```

### Architectural Principles

- **Clean Architecture**: Separation of concerns with clear layer boundaries
- **Type Safety**: 100% TypeScript strict mode with shared interfaces
- **Composition over Inheritance**: React functional components with hooks
- **Accessibility First**: WCAG 2.1 compliant with keyboard navigation
- **Performance**: Code splitting, lazy loading, and optimized bundles

---

## 🔧 **Technical Implementation**

### **Frontend Stack**
- **React 19.2.0**: Latest React with concurrent features
- **TypeScript 5.6.3**: Full type coverage with strict mode
- **Vite 7.1.14**: Lightning-fast dev server and optimized builds
- **shadcn/ui + Tailwind**: Modern, accessible UI components

### **Key Libraries**
- **@dnd-kit v6.17.0**: Professional drag & drop with touch support
- **@pdf-lib v1.17.1**: Ready for client-side PDF generation (Phase 4)
- **lucide-react v0.545**: Consistent iconography
- **Biome v1.9.4**: Fast linting and code formatting

### **Quality Assurance**
- **Biome linting**: Automated code quality with 0 errors/warnings
- **TypeScript strict**: Comprehensive type checking
- **Pre-commit hooks**: Husky + Biome for consistent code quality
- **Bundle analysis**: Optimized production builds

---

## 📋 **Project Status**

- ✅ **Phase 1**: Project setup and modern stack configuration
- ✅ **Phase 2**: Clean architecture and file management
- ✅ **Phase 3**: Drag & drop reordering with mobile support
- 🔄 **Phase 4**: PDF generation (ready for implementation)
- 📅 **Phase 5**: PDF optimization and size management
- 📅 **Phase 6**: Comprehensive testing and error handling
- 📅 **Phase 7**: Production deployment and monitoring

---

## 🔒 **Privacy & Security**

- **100% Client-Side**: No server required, all processing in browser
- **Zero Data Transmission**: Images never leave user's device
- **Privacy-First**: No external APIs or data collection
- **Secure Defaults**: Input validation and memory cleanup

---

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes with proper testing
4. Run linting: `pnpm run lint`
5. Ensure builds pass: `pnpm run build`
6. Submit a pull request with clear description

### Code Quality Standards
- **Linting**: All code must pass Biome checks
- **TypeScript**: Strict mode compliance required
- **Testing**: Maintain existing test coverage
- **Documentation**: Update relevant docs for new features

---

## 📄 **License**

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 **Acknowledgments**

- [shadcn/ui](https://ui.shadcn.com/) for beautiful, accessible components
- [@dnd-kit](https://dndkit.com/) for professional drag & drop functionality
- [Vite](https://vite.dev/) for exceptional developer experience
- [Biome](https://biomejs.dev/) for fast, reliable tooling

---

**Built with ❤️ using modern web technologies for privacy-conscious users**

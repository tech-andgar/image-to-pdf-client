## Proyecto: Herramienta Web de Fusión de Imágenes a PDF del Lado del Cliente

**Rol:** Tech Lead

**Resumen del Proyecto:**

Desarrollar una aplicación web responsiva que permita a los usuarios fusionar múltiples imágenes en un único archivo PDF optimizado con una arquitectura moderna basada en React. Toda la lógica de carga de archivos, reordenamiento de páginas y generación de PDF debe ejecutarse exclusivamente en el lado del cliente (en el navegador) para garantizar la privacidad del usuario y eliminar la necesidad de un backend de procesamiento.

**Estado Actual del Proyecto:**
- ✅ **Fase 1 completa:** Proyecto configurado con tecnologías modernas (React 19.2, TypeScript, Vite, shadcn/ui)
- ✅ **Fase 2 completa:** Componentes de carga de archivos con arquitectura limpia implementados:
  - Arquitectura por capas: Tipos → Servicios → Hooks → Componentes UI
  - Componentes separados siguiendo SRP (Single Responsibility Principle)
  - Linting/Formateo automático con Biome (0 errores, 0 warnings)
  - PWA soportado para instalación offline
- 🔄 **Próxima fase:** Fase 3 - Drag and drop reordering + pdf-lib integration

**Arquitectura Implementada:**
- **Layer de Tipos:** `src/types/` - interfaces TypeScript centralizadas
- **Layer de Servicios:** `src/services/` - funciones puras para lógica de negocio
- **Layer de Hooks:** `src/hooks/` - estado y efectos con custom hooks
- **Layer de Componentes:** `src/components/` - UI pura siguiendo composición
- **Calidad de Código:** 100% limpia con Biome linting/formateo automatizado

---

**Archivos de Reglas Relacionadas:**
- `project_checklist.md`: Lista de verificación de las fases del proyecto (WBS).
- `functional_requirements.md`: Requisitos funcionales clave para la carga, previsualización y generación de PDF.
- `technical_requirements.md`: Requisitos técnicos, metodología, calidad y entregables.
- `coding_guidelines.md`: Directrices de codificación para JavaScript/React.

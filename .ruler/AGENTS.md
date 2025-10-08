## Proyecto: Herramienta Web de Fusión de Imágenes a PDF del Lado del Cliente

**Rol:** Tech Lead

**Resumen del Proyecto:**

Desarrollar una aplicación web responsiva que permita a los usuarios fusionar múltiples imágenes en un único archivo PDF optimizado con una arquitectura moderna basada en React. Toda la lógica de carga de archivos, reordenamiento de páginas y generación de PDF debe ejecutarse exclusivamente en el lado del cliente (en el navegador) para garantizar la privacidad del usuario y eliminar la necesidad de un backend de procesamiento.

**Estado Actual del Proyecto:**
- ✅ **Fase 1 completa:** Proyecto configurado con tecnologías modernas (React 19.2, TypeScript, Vite, shadcn/ui)
- ✅ **Fase 2 completa:** Componentes de carga de archivos con arquitectura limpia implementados
- ✅ **Fase 3 completa:** Drag & drop reordering fully funcional en mobile y desktop
  - Galería responsiva con thumbnails ordenables via @dnd-kit
  - TouchSensor + PointerSensor híbrido para cross-device compatibility
  - Visual feedback completo: drag handles, opacity transitions, smooth animations
  - Accesibilidad 100%: ARIA labels, keyboard navigation, screen reader support
  - Estado de orden preservado para generación PDF en secuencia correcta
- 🔄 **Próxima fase:** Fase 4 - PDF generation completo con pdf-lib + exportación directa

**Arquitectura Implementada:**
- **Layer de Tipos:** `src/types/` - interfaces ImageFile centralizadas con IDs únicos
- **Layer de Servicios:** `src/services/fileService.ts` - funciones puras para validación y procesamiento I/O
- **Layer de Hooks:** `src/hooks/useImageUpload.ts` - estado completo y efectos (drag & drop reordering)
- **Layer de Componentes:** `src/components/` - UI siguiendo SRP (@dnd-kit SortableImageItem)
- **Layer de UI:** shadcn/ui + @dnd-kit para interactividad accesible
- **Calidad de Código:** 100% limpia (Biome 0 errores/warnings), formatos consistentes, type safety

---

**Archivos de Reglas Relacionadas:**
- `project_checklist.md`: Lista de verificación de las fases del proyecto (WBS).
- `functional_requirements.md`: Requisitos funcionales clave para la carga, previsualización y generación de PDF.
- `technical_requirements.md`: Requisitos técnicos, metodología, calidad y entregables.
- `coding_guidelines.md`: Directrices de codificación para JavaScript/React.

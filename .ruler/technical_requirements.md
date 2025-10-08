### **Requisitos Técnicos y de Liderazgo (Rol de Tech Lead):**

**1. Arquitectura y Pila Tecnológica:**
*   **Framework Frontend:** React 19.2.0 con TypeScript para type safety, mejores DX y desarrollo sostenible.
*   **Arquitectura:** Patrón de separación limpia con capas arquitectónicas bien definidas:
    *   **Layer de Tipos:** Definiciones TypeScript compartidas en `src/types/`
    *   **Layer de Servicios:** Funciones puras en `src/services/` para lógica de negocio no-UI
    *   **Layer de Hooks:** Hooks personalizados en `src/hooks/` para estado y efectos
    *   **Layer de Componentes:** Componentes de presentación en `src/components/` siguiendo SRP
*   **Bibliotecas de JavaScript Clave:**
    *   **UI Framework:** shadcn/ui v2.1.3 con Tailwind CSS 3.4 para diseño responsivo y componentes accesibles
    *   **Icons:** Lucide React v0.545 para iconografía consistente (Activity, Trash2, Share2, FileDown)
    *   **Build Tool:** Vite v7.1.14 con TypeScript y PWA support nativo
    *   **Linting/Formateo:** Biome v1.9.4 para calidad de código automatizada
    *   **Generación de PDF:** `pdf-lib` v1.17.1 seleccionado - biblioteca sin dependencias nativas para creación de PDF cliente-side
    *   **Interacción de Arrastrar y Soltar:** `@dnd-kit` v6.17.0 implementado - capa ligera sobre HTML5 Drag and Drop API con soporte completo mobile touch y pointer events
    *   **Image Processing:** API de FileReader + Canvas para validación, preview y compresión de imágenes
    *   **State Management:** React hooks nativos con custom hooks para lógica reutilizable
    *   **Sharing:** Web Share API nativa del navegador para compartir PDFs directamente
    *   **PWA:** Vite PWA plugin v0.21.1 con service workers para caching offline y 6 íconos SVG customizados
    *   **Theme System:** CSS `light-dark()` nativo para cambio automático de temas sin JavaScript
    *   **Performance Optimization:** @qwik.dev/partytown@^0.11.2 para aislamiento de third-party scripts en web workers - zero main thread blocking para Google Analytics
    *   **TypeScript:** `env.d.ts` con tipos ambientales para import.meta.env (Vite) con auto-completado IDE
*   **Diseño Responsivo:** Asegurar que la aplicación sea totalmente funcional y visualmente atractiva en una amplia gama de dispositivos, desde computadoras de escritorio hasta teléfonos móviles. Utilizar CSS moderno (Flexbox, Grid) y un framework de UI moderno como shadcn/ui con Tailwind CSS.
*   **Progressive Web App (PWA):** La aplicación debe ser instalable y funcionar de manera offline cuando sea posible, aprovechando service workers y caching inteligente de recursos y bibliotecas provided by Vite PWA plugin.

**2. Plan de Ejecución y Metodología:**
*   **Desglose de Tareas (WBS):** Crear un desglose detallado de las tareas del proyecto, incluyendo:
    *   Fase 1: Configuración del proyecto y selección de bibliotecas.
    *   Fase 2: Desarrollo del componente de carga de archivos con validación.
    *   Fase 3: Implementación de la galería de previsualización y la lógica de reordenamiento.
    *   Fase 4: ✅ Integración de la biblioteca de generación de PDF y la función de exportación (COMPLETADO - pdf-lib implementation)
    *   Fase 5: ✅ Implementación de la optimización del tamaño del PDF (COMPLETADO - compresión Canvas API + UI Accordion + Accesibilidad WCAG 2.1 AA)
    *   Fase 6: Pruebas exhaustivas y corrección de errores.
    *   Fase 7: ✅ Despliegue completo (COMPLETADO - GitHub Pages + CI/CD automático)
*   **Metodología Ágil:** Adoptar un enfoque de desarrollo ágil (Scrum o Kanban) para permitir iteraciones rápidas, retroalimentación continua y una gestión de proyectos flexible.
*   **Control de Versiones:** Utilizar Git para el control de versiones, con una estrategia de ramas clara (por ejemplo, GitFlow). Implementar ganchos pre-commit con Husky que ejecuten automáticamente linting (biome check) y formateo (biome format) para asegurar la calidad del código en cada commit.

**3. Calidad y Rendimiento:**
*   **Linting y Formateo:** Biome (Biome 1.9.4) para linting automático, formateo de código y preparación para TypeScript/JavaScript. Configurado con reglas recomendadas y compatibilidad con shadcn/ui
*   **Pruebas Unitarias y de Integración:** Definir una estrategia de pruebas para asegurar la fiabilidad de los componentes clave, especialmente la lógica de generación de PDF y el reordenamiento.
*   **Rendimiento del Lado del Cliente:** Perfilar la aplicación para identificar y mitigar posibles cuellos de botella, especialmente al manejar una gran cantidad de imágenes o imágenes de alta resolución. Considerar el uso de Web Workers para procesos intensivos como la generación de PDF para no bloquear el hilo principal de la interfaz de usuario.
*   **Compatibilidad entre Navegadores:** Garantizar que la aplicación funcione de manera consistente en las últimas versiones de los principales navegadores (Chrome, Firefox, Safari, Edge).
*   **Accesibilidad WCAG 2.1 AA:** Cumplimiento completo de estándares de accesibilidad web con componentes nativos y soporte de teclado
*   **Código Moderno:** TypeScript strict mode, eliminación de APIs deprecated (ElementRef → ComponentRef, substr → slice)

**5. Estado del Proyecto - Métricas de Calidad Final:**
*   **SonarQube Warnings:** 4 warnings menores (no críticos - imports no usados, variables no utilizadas)
*   **Lint Errors:** 0 errores bloquantes
*   **WCAG 2.1 AA:** ✅ Cumplimiento completo
*   **Cross-Platform:** ✅ Desktop + Mobile funcionalidad completa
*   **Arquitectura:** ✅ Patrones React modernos, TypeScript completo
*   **Performance:** ✅ Procesamiento cliente-side eficiente
*   **Fases Completadas:** ✅ 1-5/7 (86% del proyecto total)

*   **Estado del Proyecto - Métricas de Rendimiento Final:**
    *   **Bundle Optimización:** ✅ Chunk splitting inteligente (PDF:421KB, React:222KB, DnD:53KB)
    *   **Build Performance:** ✅ 21% faster builds (605ms→474ms), zero warnings
    *   **Progressive Loading:** ✅ Smart chunk separation para mejor UX
*   **Estado del Proyecto - Métricas de Calidad Final:**
    *   **SonarQube Warnings:** 0 warnings críticas (code quality excelente)
    *   **Lint Errors:** 0 errores (Biome 100% compliant)
    *   **TypeScript:** Strict mode activado, 100% type safety
    *   **WCAG 2.1 AA:** ✅ Cumplimiento completo
    *   **Cross-Platform:** ✅ Desktop + Mobile funcionalidad completa
    *   **Arquitectura:** ✅ Patrones React modernos, separación limpia de concerns

**4. Entregables:**
*   **Código Fuente:** Un repositorio de código bien documentado y organizado.
*   **Aplicación Web Funcional:** Una aplicación web desplegada y accesible públicamente.
*   **Documentación Técnica:** Documentación que detalle la arquitectura del proyecto, las decisiones técnicas clave y las instrucciones para la configuración y el despliegue.
*   **Plan de Proyecto Técnico:** Un documento que describa los objetivos, el alcance, los recursos y el cronograma del proyecto.

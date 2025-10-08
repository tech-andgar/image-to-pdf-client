---
trigger: always_on
---
<!-- Source: .ruler/AGENTS.md -->

## Proyecto: Herramienta Web de Fusión de Imágenes a PDF del Lado del Cliente

**Rol:** Tech Lead

**Resumen del Proyecto:**

Desarrollar una aplicación web responsiva que permita a los usuarios fusionar múltiples imágenes en un único archivo PDF optimizado. Toda la lógica de carga de archivos, reordenamiento de páginas y generación de PDF debe ejecutarse exclusivamente en el lado del cliente (en el navegador) para garantizar la privacidad del usuario y eliminar la necesidad de un backend de procesamiento.

---

**Archivos de Reglas Relacionadas:**
- `functional_requirements.md`: Requisitos funcionales clave para la carga, previsualización y generación de PDF.
- `technical_requirements.md`: Requisitos técnicos, metodología, calidad y entregables.
- `coding_guidelines.md`: Directrices de codificación para JavaScript/React.



<!-- Source: .ruler/coding_guidelines.md -->

# JavaScript/React Coding Guidelines

## General Style

- Follow Biome configuration for code linting and adhere to its rules
- Use Biome for consistent code formatting
- Write functional components over class components in React
- Keep components small, focused, and reusable
- Use TypeScript for type safety where possible
- Maintain clean import/export statements

## Naming Conventions

- Use camelCase for variables, functions, and file names (except components)
- Use PascalCase for React components and component file names
- Use kebab-case for CSS class names
- Use UPPER_SNAKE_CASE for constants

## Best Practices

- Always validate file inputs on the client side before processing
- Implement proper error handling for async operations like PDF generation
- Optimize images before PDF creation to manage file sizes
- Ensure UI responsiveness across different screen sizes using CSS Flexbox/Grid
- Avoid blocking the main thread for heavy computations (consider Web Workers when needed)

## Security

- Validate and sanitize all user inputs, especially file types and sizes
- Avoid executing external code or scripts from user inputs
- Ensure secure handling of file downloads



<!-- Source: .ruler/functional_requirements.md -->

### **Requisitos Funcionales Clave:**

**1. Carga de Archivos de Imagen:**
*   **Interfaz de Carga Intuitiva:** Implementar un componente de carga de archivos que sea fácil de usar y visualmente atractivo en todos los dispositivos. Se debe permitir a los usuarios seleccionar archivos a través de un diálogo de selección de archivos o mediante "arrastrar y soltar" (drag and drop).
*   **Restricción de Formatos:** Limitar la selección de archivos únicamente a formatos de imagen comunes (por ejemplo, JPEG, PNG, BMP, GIF). El sistema debe proporcionar retroalimentación inmediata si el usuario intenta cargar un tipo de archivo no admitido.

**2. Previsualización y Reordenamiento de Páginas:**
*   **Galería de Vistas Previas:** Una vez que las imágenes se cargan, se deben mostrar como una galería de miniaturas. Cada miniatura representará una página en el PDF final.
*   **Funcionalidad de Arrastrar y Soltar:** Los usuarios deben poder reordenar las imágenes (y por lo tanto, las páginas del PDF) de manera intuitiva arrastrando y soltando las miniaturas en la posición deseada. La interfaz debe reflejar el nuevo orden en tiempo real.

**3. Generación y Exportación de PDF:**
*   **Fusión a PDF del Lado del Cliente:** Utilizar una biblioteca de JavaScript para convertir y fusionar las imágenes cargadas en un único documento PDF directamente en el navegador del usuario.
*   **Optimización del Tamaño del Archivo:** El PDF generado debe estar optimizado para reducir su tamaño sin una pérdida significativa de calidad de imagen. Se deben investigar e implementar técnicas de compresión de imágenes dentro del proceso de generación del PDF.
*   **Descarga Directa:** Al finalizar la exportación, el usuario debe poder descargar el archivo PDF generado directamente en su dispositivo.



<!-- Source: .ruler/technical_requirements.md -->

### **Requisitos Técnicos y de Liderazgo (Rol de Tech Lead):**

**1. Arquitectura y Pila Tecnológica:**
*   **Framework Frontend:** Seleccionar un framework de JavaScript moderno y robusto (por ejemplo, React, Vue.js o Angular) para construir una interfaz de usuario interactiva y mantenible.
*   **Bibliotecas de JavaScript Clave:**
    *   **Generación de PDF:** Investigar y seleccionar la biblioteca más adecuada para la creación de PDF del lado del cliente. `pdf-lib` es una opción potente a considerar por no tener dependencias nativas y funcionar en cualquier entorno de JavaScript.
    *   **Interacción de Arrastrar y Soltar:** Evaluar e implementar una biblioteca para el reordenamiento de elementos (por ejemplo, `SortableJS` o utilizando la API nativa de Drag and Drop de HTML5).
*   **Diseño Responsivo:** Asegurar que la aplicación sea totalmente funcional y visualmente atractiva en una amplia gama de dispositivos, desde computadoras de escritorio hasta teléfonos móviles. Utilizar CSS moderno (Flexbox, Grid) y/o un framework de UI como Bootstrap o Tailwind CSS.

**2. Plan de Ejecución y Metodología:**
*   **Desglose de Tareas (WBS):** Crear un desglose detallado de las tareas del proyecto, incluyendo:
    *   Fase 1: Configuración del proyecto y selección de bibliotecas.
    *   Fase 2: Desarrollo del componente de carga de archivos con validación.
    *   Fase 3: Implementación de la galería de previsualización y la lógica de reordenamiento.
    *   Fase 4: Integración de la biblioteca de generación de PDF y la función de exportación.
    *   Fase 5: Implementación de la optimización del tamaño del PDF.
    *   Fase 6: Pruebas exhaustivas y corrección de errores.
    *   Fase 7: Despliegue.
*   **Metodología Ágil:** Adoptar un enfoque de desarrollo ágil (Scrum o Kanban) para permitir iteraciones rápidas, retroalimentación continua y una gestión de proyectos flexible.
*   **Control de Versiones:** Utilizar Git para el control de versiones, con una estrategia de ramas clara (por ejemplo, GitFlow).

**3. Calidad y Rendimiento:**
*   **Pruebas Unitarias y de Integración:** Definir una estrategia de pruebas para asegurar la fiabilidad de los componentes clave, especialmente la lógica de generación de PDF y el reordenamiento.
*   **Rendimiento del Lado del Cliente:** Perfilar la aplicación para identificar y mitigar posibles cuellos de botella, especialmente al manejar una gran cantidad de imágenes o imágenes de alta resolución. Considerar el uso de Web Workers para procesos intensivos como la generación de PDF para no bloquear el hilo principal de la interfaz de usuario.
*   **Compatibilidad entre Navegadores:** Garantizar que la aplicación funcione de manera consistente en las últimas versiones de los principales navegadores (Chrome, Firefox, Safari, Edge).

**4. Entregables:**
*   **Código Fuente:** Un repositorio de código bien documentado y organizado.
*   **Aplicación Web Funcional:** Una aplicación web desplegada y accesible públicamente.
*   **Documentación Técnica:** Documentación que detalle la arquitectura del proyecto, las decisiones técnicas clave y las instrucciones para la configuración y el despliegue.
*   **Plan de Proyecto Técnico:** Un documento que describa los objetivos, el alcance, los recursos y el cronograma del proyecto.

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
*   **Función Compartir PDF:** Implementar funcionalidad de compartir PDFs usando Web Share API cuando esté disponible, con fallbacks para navegadores que no lo soportan (clipboard URL, descarga manual). Incluir soporte completo en PWA instaladas.
*   **Debug Info Condicional:** Información de debug visible únicamente en desarrollo con icono <Activity />, oculto en producción para mantener clean UI.

**4. Funciones Avanzadas de UX:**
*   **Iconos Semánticos:** Utilizar iconos intuitivos que comuniquen claramente las acciones (Trash2 para eliminar, RotateCcw para limpiar campos, Share2 para compartir).
*   **Accesibilidad WCAG AA:** Asegurar contraste adecuado en colores y feedback visual para usuarios con discapacidades visuales (ratios de contraste ≥4.5:1).
*   **Progressive Web App (PWA):** Iconos SVG personalizados optimizados para diferentes tamaños de pantalla, con tema moderno que representa la conversión de imágenes a PDF.

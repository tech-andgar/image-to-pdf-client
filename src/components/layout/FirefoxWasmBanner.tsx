import { AlertCircle, X } from 'lucide-react';
import { useState } from 'react';

const DISMISSED_KEY = 'firefox-wasm-banner-dismissed';

function isFirefox() {
  return navigator.userAgent.includes('Firefox');
}

export function FirefoxWasmBanner() {
  const [visible, setVisible] = useState(
    () => isFirefox() && !sessionStorage.getItem(DISMISSED_KEY),
  );

  if (!visible) return null;

  function dismiss() {
    sessionStorage.setItem(DISMISSED_KEY, '1');
    setVisible(false);
  }

  return (
    <div className="w-full bg-yellow-50 border-b border-yellow-200 dark:bg-yellow-950/30 dark:border-yellow-800 px-4 py-2.5 flex items-start gap-3 text-sm text-yellow-800 dark:text-yellow-300">
      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
      <span className="flex-1">
        Firefox puede mostrar advertencias sobre WebAssembly en la consola al
        procesar PDFs con contraseña. La app funciona correctamente; es un
        problema conocido del compilador de mupdf.
      </span>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Cerrar"
        className="opacity-60 hover:opacity-100 shrink-0"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

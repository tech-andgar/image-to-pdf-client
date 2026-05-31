import { RefreshCw, X } from "lucide-react";
import { APP_NAME } from "../../config/app";
import { usePwaRename } from "../../hooks/ui/usePwaRename";

export function PwaRenameBanner() {
	const { showBanner, dismiss } = usePwaRename();

	if (!showBanner) return null;

	return (
		<div className="w-full bg-amber-50 border-b border-amber-200 dark:bg-amber-950/30 dark:border-amber-800 px-4 py-2.5 flex items-start gap-3 text-sm text-amber-800 dark:text-amber-300">
			<RefreshCw className="h-4 w-4 shrink-0 mt-0.5" />
			<span className="flex-1">
				La app se renombró a <strong>{APP_NAME}</strong>. Para ver el nuevo
				nombre en tu pantalla de inicio, desinstala y vuelve a instalar la app.
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

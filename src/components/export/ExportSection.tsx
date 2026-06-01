import { FileDown, AlertCircle, Share2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FilenameInput } from "./FilenameInput";
import { formatFileSize } from "../../lib/image/compression";
import { useWorkflow } from "@/context/WorkflowContext";

interface ShareResult {
	success: boolean;
	method?: string;
	error?: string;
}

function shareSuccessLabel(method?: string): string {
	if (method === "file") return "Compartido exitosamente (archivo)";
	if (method === "url") return "Compartido exitosamente (enlace)";
	return "Compartido exitosamente";
}

function ShareResultBanner({
	result,
	onClose,
}: {
	readonly result: ShareResult;
	readonly onClose: () => void;
}) {
	const text = result.success
		? shareSuccessLabel(result.method)
		: (result.error ?? "");

	return (
		<div
			className={
				result.success
					? "p-2.5 rounded-lg flex items-start gap-2 text-sm border bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-400"
					: "p-2.5 rounded-lg flex items-start gap-2 text-sm border bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-400"
			}
		>
			<AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
			<span className="flex-1">{text}</span>
			<button
				type="button"
				onClick={onClose}
				className="opacity-60 hover:opacity-100 leading-none"
				aria-label="Cerrar"
			>
				✕
			</button>
		</div>
	);
}

export function ExportSection() {
	const {
		isGenerating,
		isLoadingLibrary,
		isSharing,
		exportError,
		shareResult,
		filename,
		previewFilename,
		lastPdfSize,
		setFilename,
		exportToPDF: onExport,
		shareToPDF: onShare,
		clearExportError: onClearError,
		clearShareResult: onClearShareResult,
	} = useWorkflow();

	return (
		<div className="rounded-xl border bg-card p-4 space-y-3">
			<h2 className="text-sm font-medium flex items-center gap-2 text-foreground">
				<FileDown className="h-4 w-4" />
				Exportar a PDF
			</h2>

			<FilenameInput
				filename={filename}
				setFilename={setFilename}
				previewFilename={previewFilename}
			/>

			{exportError && (
				<div className="p-2.5 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-2 text-destructive text-sm">
					<AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
					<span className="flex-1">{exportError}</span>
					<button
						type="button"
						onClick={onClearError}
						className="text-destructive/70 hover:text-destructive leading-none"
						aria-label="Cerrar error"
					>
						✕
					</button>
				</div>
			)}

			<div className="grid grid-cols-2 gap-2">
				<Button onClick={onExport} disabled={isGenerating} className="w-full">
					{isGenerating ? (
						<>
							<Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
							{isLoadingLibrary ? "Cargando…" : "Generando…"}
						</>
					) : (
						<>
							<FileDown className="h-4 w-4 mr-1.5" />
							Descargar
						</>
					)}
				</Button>

				<Button
					onClick={onShare}
					disabled={isSharing}
					variant="outline"
					className="w-full"
				>
					{isSharing ? (
						<>
							<Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
							Compartiendo…
						</>
					) : (
						<>
							<Share2 className="h-4 w-4 mr-1.5" />
							Compartir
						</>
					)}
				</Button>
			</div>

			{shareResult && (
				<ShareResultBanner result={shareResult} onClose={onClearShareResult} />
			)}

			<p className="text-xs text-muted-foreground flex items-center justify-between">
				<span>Las imágenes se exportan en el orden actual</span>
				{lastPdfSize !== null && (
					<span className="font-medium">
						PDF: {formatFileSize(lastPdfSize)}
					</span>
				)}
			</p>
		</div>
	);
}

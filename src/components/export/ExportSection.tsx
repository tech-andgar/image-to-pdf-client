import { FileDown, AlertCircle, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FilenameInput } from "./FilenameInput";

interface ShareResult {
	success: boolean;
	method?: string;
	error?: string;
}

interface ExportSectionProps {
	readonly isGenerating: boolean;
	readonly isSharing: boolean;
	readonly exportError: string | null;
	readonly shareResult: ShareResult | null;
	readonly filename: string;
	readonly previewFilename: string;
	readonly setFilename: (name: string) => void;
	readonly onExport: () => void;
	readonly onShare: () => void;
	readonly onClearError: () => void;
	readonly onClearShareResult: () => void;
}

export function ExportSection({
	isGenerating,
	isSharing,
	exportError,
	shareResult,
	filename,
	previewFilename,
	setFilename,
	onExport,
	onShare,
	onClearError,
	onClearShareResult,
}: ExportSectionProps) {
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
						"Generando…"
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
						"Compartiendo…"
					) : (
						<>
							<Share2 className="h-4 w-4 mr-1.5" />
							Compartir
						</>
					)}
				</Button>
			</div>

			{shareResult && (
				<div
					className={
						shareResult.success
							? "p-2.5 rounded-lg flex items-start gap-2 text-sm border bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-400"
							: "p-2.5 rounded-lg flex items-start gap-2 text-sm border bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-400"
					}
				>
					<AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
					<span className="flex-1">
						{shareResult.success
							? `Compartido exitosamente${shareResult.method === "file" ? " (archivo)" : shareResult.method === "url" ? " (enlace)" : ""}`
							: shareResult.error}
					</span>
					<button
						type="button"
						onClick={onClearShareResult}
						className="opacity-60 hover:opacity-100 leading-none"
						aria-label="Cerrar"
					>
						✕
					</button>
				</div>
			)}

			<p className="text-xs text-muted-foreground">
				Las imágenes se exportan en el orden actual
			</p>
		</div>
	);
}

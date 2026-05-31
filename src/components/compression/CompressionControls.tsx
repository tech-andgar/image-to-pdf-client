import { Zap, AlertCircle, ChevronDown } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { CompressionPreset } from "@/types/image";

interface CompressionControlsProps {
	readonly isCompressing: boolean;
	readonly compressionError: string | null;
	readonly currentPreset: CompressionPreset;
	readonly compressionProgress: number;
	readonly formattedStats: {
		readonly originalSize: string;
		readonly compressedSize: string;
		readonly savingsPercentage: string;
		readonly timeElapsed: string;
	} | null;
	readonly hasSignificantSavings: boolean;
	readonly isPresetCached: boolean;
	readonly allPdfSourced: boolean;
	readonly onCompress: () => void;
	readonly onPresetChange: (preset: CompressionPreset) => void;
	readonly onClearError: () => void;
}

const PRESET_LABELS: Record<
	CompressionPreset,
	{ label: string; description: string }
> = {
	high: { label: "Alta", description: "2048px · 90%" },
	medium: { label: "Media", description: "1536px · 75%" },
	low: { label: "Baja", description: "1024px · 60%" },
	minimal: { label: "Mínima", description: "800px · 40%" },
};

export function CompressionControls({
	isCompressing,
	compressionError,
	currentPreset,
	compressionProgress,
	formattedStats,
	hasSignificantSavings,
	isPresetCached,
	allPdfSourced,
	onCompress,
	onPresetChange,
	onClearError,
}: CompressionControlsProps) {
	const [open, setOpen] = useState(false);

	return (
		<div className="rounded-xl border bg-card overflow-hidden">
			{/* Header / trigger */}
			<button
				type="button"
				onClick={() => setOpen((v) => !v)}
				className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium hover:bg-muted/40 transition-colors"
			>
				<span className="flex items-center gap-2">
					<Zap className="h-3.5 w-3.5 text-muted-foreground" />
					Optimización
					{hasSignificantSavings && formattedStats && (
						<Badge variant="secondary" className="text-xs font-normal">
							−{formattedStats.savingsPercentage}%
						</Badge>
					)}
				</span>
				<ChevronDown
					className={
						open
							? "h-4 w-4 text-muted-foreground transition-transform duration-200 rotate-180"
							: "h-4 w-4 text-muted-foreground transition-transform duration-200"
					}
				/>
			</button>

			{/* Collapsible body */}
			{open && allPdfSourced && (
				<div className="px-4 pb-4 space-y-3 border-t">
					<div className="pt-3 space-y-2">
						<p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
							Calidad
						</p>
						<div className="grid grid-cols-4 gap-1.5">
							{(Object.keys(PRESET_LABELS) as CompressionPreset[]).map(
								(preset) => {
									const active = currentPreset === preset;
									return (
										<button
											key={preset}
											type="button"
											onClick={() => onPresetChange(preset)}
											disabled={isCompressing}
											className={
												active
													? "flex flex-col items-center py-2 px-1 rounded-lg text-center transition-colors border text-xs bg-zinc-900 text-white border-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 dark:border-zinc-100"
													: "flex flex-col items-center py-2 px-1 rounded-lg text-center transition-colors border text-xs bg-white text-zinc-900 border-zinc-200 hover:border-zinc-400 hover:bg-zinc-50 dark:bg-zinc-950 dark:text-zinc-100 dark:border-zinc-700 dark:hover:border-zinc-500"
											}
										>
											<span className="font-medium leading-tight">
												{PRESET_LABELS[preset].label}
											</span>
											<span
												className={
													active
														? "text-[10px] leading-tight mt-0.5 text-zinc-400 dark:text-zinc-500"
														: "text-[10px] leading-tight mt-0.5 text-zinc-500 dark:text-zinc-400"
												}
											>
												{PRESET_LABELS[preset].description}
											</span>
										</button>
									);
								},
							)}
						</div>
					</div>
					<p className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-2.5">
						El preset se aplica al exportar — texto e vectores se preservan,
						solo las imágenes embebidas se comprimen.
					</p>
				</div>
			)}

			{open && !allPdfSourced && (
				<div className="px-4 pb-4 space-y-3 border-t">
					{/* Preset grid */}
					<div className="pt-3 space-y-2">
						<p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
							Calidad
						</p>
						<div className="grid grid-cols-4 gap-1.5">
							{(Object.keys(PRESET_LABELS) as CompressionPreset[]).map(
								(preset) => {
									const active = currentPreset === preset;
									return (
										<button
											key={preset}
											type="button"
											onClick={() => onPresetChange(preset)}
											disabled={isCompressing}
											className={
												active
													? "flex flex-col items-center py-2 px-1 rounded-lg text-center transition-colors border text-xs bg-zinc-900 text-white border-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 dark:border-zinc-100"
													: "flex flex-col items-center py-2 px-1 rounded-lg text-center transition-colors border text-xs bg-white text-zinc-900 border-zinc-200 hover:border-zinc-400 hover:bg-zinc-50 dark:bg-zinc-950 dark:text-zinc-100 dark:border-zinc-700 dark:hover:border-zinc-500"
											}
										>
											<span className="font-medium leading-tight">
												{PRESET_LABELS[preset].label}
											</span>
											<span
												className={
													active
														? "text-[10px] leading-tight mt-0.5 text-zinc-400 dark:text-zinc-500"
														: "text-[10px] leading-tight mt-0.5 text-zinc-500 dark:text-zinc-400"
												}
											>
												{PRESET_LABELS[preset].description}
											</span>
										</button>
									);
								},
							)}
						</div>
					</div>

					{/* Error */}
					{compressionError && (
						<div className="flex items-start gap-2 p-2.5 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs">
							<AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
							<span className="flex-1">{compressionError}</span>
							<button
								type="button"
								onClick={onClearError}
								className="opacity-60 hover:opacity-100"
								aria-label="Cerrar"
							>
								✕
							</button>
						</div>
					)}

					{/* Progress */}
					{isCompressing && (
						<div className="space-y-1.5">
							<div className="flex justify-between text-xs text-muted-foreground">
								<span>Comprimiendo…</span>
								<span>{Math.round(compressionProgress * 100)}%</span>
							</div>
							<Progress value={compressionProgress * 100} className="h-1.5" />
						</div>
					)}

					{/* Stats */}
					{formattedStats && !isCompressing && (
						<div className="grid grid-cols-3 gap-2 p-2.5 bg-muted/50 rounded-lg text-xs">
							<div className="text-center">
								<p className="text-muted-foreground">Original</p>
								<p className="font-medium">{formattedStats.originalSize}</p>
							</div>
							<div className="text-center">
								<p className="text-muted-foreground">Imágenes</p>
								<p className="font-medium text-emerald-600">
									{formattedStats.compressedSize}
								</p>
							</div>
							<div className="text-center">
								<p className="text-muted-foreground">Ahorro</p>
								<p className="font-medium text-emerald-600">
									−{formattedStats.savingsPercentage}%
								</p>
							</div>
						</div>
					)}

					{/* Compress button */}
					<Button
						onClick={onCompress}
						disabled={isCompressing}
						className="w-full"
						size="sm"
					>
						{isCompressing ? (
							<>
								<Zap className="h-3.5 w-3.5 mr-1.5 animate-spin" />
								Comprimiendo…
							</>
						) : isPresetCached ? (
							<>
								<Zap className="h-3.5 w-3.5 mr-1.5" />
								Aplicar preset
							</>
						) : (
							<>
								<Zap className="h-3.5 w-3.5 mr-1.5" />
								Comprimir imágenes
							</>
						)}
					</Button>
				</div>
			)}
		</div>
	);
}

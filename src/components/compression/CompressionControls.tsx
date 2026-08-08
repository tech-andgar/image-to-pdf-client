import { Zap, AlertCircle, ChevronDown, Lock } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { CompressionPreset } from "@/types/image";
import { useWorkflow } from "@/context/WorkflowContext";
import { useLicenseContext } from "@/context/LicenseContext";

const FREE_PRESETS = new Set<CompressionPreset>(["medium"]);

const PRESET_LABELS: Record<
	CompressionPreset,
	{ label: string; description: string }
> = {
	high: { label: "Alta", description: "2048px · 90%" },
	medium: { label: "Media", description: "1536px · 75%" },
	low: { label: "Baja", description: "1024px · 60%" },
	minimal: { label: "Mínima", description: "800px · 40%" },
};

const ACTIVE_BTN =
	"flex flex-col items-center py-2 px-1 rounded-lg text-center transition-colors border text-xs bg-accent text-accent-foreground border-accent";
const INACTIVE_BTN =
	"flex flex-col items-center py-2 px-1 rounded-lg text-center transition-colors border text-xs bg-background text-foreground border-border hover:border-muted-foreground hover:bg-muted";

function PresetGrid({
	currentPreset,
	isCompressing,
	isPremium,
	onPresetChange,
	onUpgrade,
}: {
	readonly currentPreset: CompressionPreset;
	readonly isCompressing: boolean;
	readonly isPremium: boolean;
	readonly onPresetChange: (p: CompressionPreset) => void;
	readonly onUpgrade: () => void;
}) {
	return (
		<div className="space-y-2">
			<p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
				Calidad
			</p>
			<div className="grid grid-cols-4 gap-1.5">
				{(Object.keys(PRESET_LABELS) as CompressionPreset[]).map((preset) => {
					const active = currentPreset === preset;
					const locked = !isPremium && !FREE_PRESETS.has(preset);
					return (
						<button
							key={preset}
							type="button"
							onClick={() => locked ? onUpgrade() : onPresetChange(preset)}
							disabled={isCompressing && !locked}
							className={`${active ? ACTIVE_BTN : INACTIVE_BTN} relative`}
						>
							{locked && (
								<Lock className="absolute top-1 right-1 h-2.5 w-2.5 text-muted-foreground opacity-60" />
							)}
							<span className={`font-medium leading-tight ${locked ? "opacity-50" : ""}`}>
								{PRESET_LABELS[preset].label}
							</span>
							<span
								className={
									active
										? "text-[10px] leading-tight mt-0.5 text-zinc-400 dark:text-zinc-500"
										: "text-[10px] leading-tight mt-0.5 text-zinc-500 dark:text-zinc-400"
								}
							>
								{locked ? "Premium" : PRESET_LABELS[preset].description}
							</span>
						</button>
					);
				})}
			</div>
		</div>
	);
}

export function CompressionControls() {
	const { compression } = useWorkflow();
	const license = useLicenseContext();
	const {
		isCompressing,
		error: compressionError,
		clearError: onClearError,
		currentPreset,
		progress: compressionProgress,
		formattedStats,
		hasSignificantSavings,
		currentPresetCached: isPresetCached,
		allPdfSourced,
		handleCompress: onCompress,
		handlePresetChange: onPresetChange,
	} = compression;
	const [open, setOpen] = useState(false);

	let compressButtonLabel = "Comprimir imágenes";
	if (isCompressing) compressButtonLabel = "Comprimiendo…";
	else if (isPresetCached) compressButtonLabel = "Aplicar preset";

	return (
		<div className="rounded-xl border bg-card overflow-hidden">
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
					className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`}
				/>
			</button>

			{open && (
				<div className="px-4 pb-4 pt-3 space-y-3 border-t">
					<PresetGrid
						currentPreset={currentPreset}
						isCompressing={isCompressing}
						isPremium={license.info.isPremium}
						onPresetChange={onPresetChange}
						onUpgrade={license.openPaywall}
					/>

					{allPdfSourced ? (
						<p className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-2.5">
							El preset se aplica al exportar — texto e vectores se preservan,
							solo las imágenes embebidas se comprimen.
						</p>
					) : (
						<>
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

							{isCompressing && (
								<div className="space-y-1.5">
									<div className="flex justify-between text-xs text-muted-foreground">
										<span>Comprimiendo…</span>
										<span>{Math.round(compressionProgress * 100)}%</span>
									</div>
									<Progress
										value={compressionProgress * 100}
										className="h-1.5"
									/>
								</div>
							)}

							{formattedStats && !isCompressing && (
								<div className="grid grid-cols-3 gap-2 p-2.5 bg-muted/50 rounded-lg text-xs">
									{[
										{
											label: "Original",
											value: formattedStats.originalSize,
											highlight: false,
										},
										{
											label: "Imágenes",
											value: formattedStats.compressedSize,
											highlight: true,
										},
										{
											label: "Ahorro",
											value: `−${formattedStats.savingsPercentage}%`,
											highlight: true,
										},
									].map(({ label, value, highlight }) => (
										<div key={label} className="text-center">
											<p className="text-muted-foreground">{label}</p>
											<p
												className={`font-medium ${highlight ? "text-emerald-600 dark:text-emerald-400" : ""}`}
											>
												{value}
											</p>
										</div>
									))}
								</div>
							)}

							<Button
								onClick={onCompress}
								disabled={isCompressing}
								className="w-full"
								size="sm"
							>
								<Zap
									className={`h-3.5 w-3.5 mr-1.5 ${isCompressing ? "animate-spin" : ""}`}
								/>
								{compressButtonLabel}
							</Button>
						</>
					)}
				</div>
			)}
		</div>
	);
}

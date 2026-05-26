import { Zap, AlertCircle, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
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
	readonly onCompress: () => void;
	readonly onPresetChange: (preset: CompressionPreset) => void;
	readonly onClearError: () => void;
}

const PRESET_LABELS: Record<
	CompressionPreset,
	{ label: string; description: string }
> = {
	high: {
		label: "Alta Calidad",
		description: "2048px, 90% calidad - Mejor imagen",
	},
	medium: {
		label: "Mediana",
		description: "1536px, 75% calidad - Balance óptimo",
	},
	low: { label: "Baja", description: "1024px, 60% calidad - Más compacto" },
	minimal: {
		label: "Mínima",
		description: "800px, 40% calidad - Máximo ahorro",
	},
};

export function CompressionControls({
	isCompressing,
	compressionError,
	currentPreset,
	compressionProgress,
	formattedStats,
	hasSignificantSavings,
	onCompress,
	onPresetChange,
	onClearError,
}: CompressionControlsProps) {
	return (
		<Accordion type="single" collapsible defaultValue="">
			<AccordionItem value="compression" className="border-0">
				<Card className="border-dashed border-2">
					<CardHeader className="pb-3">
						<AccordionTrigger className="hover:no-underline">
							<CardTitle className="flex items-center gap-2 text-base hover:no-underline">
								<Zap className="h-4 w-4" />
								Optimización de Imágenes
								{hasSignificantSavings && (
									<Badge variant="secondary" className="text-xs">
										Ahorro estimado: {formattedStats?.savingsPercentage}%
									</Badge>
								)}
							</CardTitle>
						</AccordionTrigger>
					</CardHeader>
					<AccordionContent>
						<CardContent className="space-y-4">
							{/* Preset Selection */}
							<div className="space-y-2">
								<div className="flex items-center gap-2 text-sm font-medium">
									Calidad de Compresión
									<Info className="h-3 w-3 text-muted-foreground" />
								</div>
								<div className="grid grid-cols-2 gap-2">
									{(Object.keys(PRESET_LABELS) as CompressionPreset[]).map(
										(preset) => (
											<Button
												key={preset}
												variant={
													currentPreset === preset ? "default" : "outline"
												}
												size="sm"
												onClick={() => onPresetChange(preset)}
												disabled={isCompressing}
												className="justify-start"
											>
												<div className="flex flex-col items-start w-full">
													<span className="font-medium text-xs">
														{PRESET_LABELS[preset].label}
													</span>
													<span className="text-[10px] opacity-70 leading-tight">
														{PRESET_LABELS[preset].description}
													</span>
												</div>
											</Button>
										),
									)}
								</div>
							</div>

							{/* Error Message */}
							{compressionError && (
								<Alert variant="destructive" className="py-2">
									<AlertCircle className="h-4 w-4" />
									<AlertDescription className="flex items-center justify-between">
										{compressionError}
										<Button
											variant="ghost"
											size="sm"
											onClick={onClearError}
											className="h-6 px-2 text-red-600 hover:text-red-800"
										>
											✕
										</Button>
									</AlertDescription>
								</Alert>
							)}

							{/* Progress Bar */}
							{isCompressing && (
								<div className="space-y-2">
									<div className="flex items-center justify-between text-sm">
										<span>Comprimiendo imágenes...</span>
										<span>{Math.round(compressionProgress * 100)}%</span>
									</div>
									<Progress value={compressionProgress * 100} className="h-2" />
								</div>
							)}

							{/* Compression Stats */}
							{formattedStats && !isCompressing && (
								<div className="p-3 bg-muted/50 rounded-lg space-y-2">
									<div className="text-sm font-medium">
										Resultados de Compresión
									</div>
									<div className="grid grid-cols-2 gap-3 text-xs">
										<div>
											<span className="text-muted-foreground">Original:</span>
											<span className="font-medium ml-1">
												{formattedStats.originalSize}
											</span>
										</div>
										<div>
											<span className="text-muted-foreground">Comprimido:</span>
											<span className="font-medium ml-1 text-green-600">
												{formattedStats.compressedSize}
											</span>
										</div>
										<div>
											<span className="text-muted-foreground">Ahorro:</span>
											<span className="font-medium ml-1 text-green-600">
												-{formattedStats.savingsPercentage}%
											</span>
										</div>
										<div>
											<span className="text-muted-foreground">Tiempo:</span>
											<span className="font-medium ml-1">
												{formattedStats.timeElapsed}
											</span>
										</div>
									</div>
								</div>
							)}

							{/* Compression Button */}
							<Button
								onClick={onCompress}
								disabled={isCompressing}
								className="w-full"
								size="sm"
							>
								{isCompressing ? (
									<>
										<Zap className="h-4 w-4 mr-2 animate-spin" />
										Comprimiendo...
									</>
								) : (
									<>
										<Zap className="h-4 w-4 mr-2" />
										{PRESET_LABELS[currentPreset].label}
									</>
								)}
							</Button>
						</CardContent>
					</AccordionContent>
				</Card>
			</AccordionItem>
		</Accordion>
	);
}

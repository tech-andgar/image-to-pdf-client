import { ImagePlus, Loader2 } from "lucide-react";
import { type ChangeEvent, type DragEvent, useRef } from "react";
import {
	ALLOWED_EXTENSIONS,
	ALLOWED_IMAGE_TYPES,
	ALLOWED_PDF_TYPE,
	MAX_FILE_SIZE,
} from "../../types/image";

interface UploadAreaProps {
	readonly isDragOver: boolean;
	readonly isProcessing: boolean;
	readonly disabled?: boolean;
	readonly onDragOver: (e: DragEvent<HTMLDivElement>) => void;
	readonly onDragLeave: (e: DragEvent<HTMLDivElement>) => void;
	readonly onDrop: (e: DragEvent<HTMLDivElement>) => void;
	readonly onFileSelect: (e: ChangeEvent<HTMLInputElement>) => void;
}

export function UploadArea({
	isDragOver,
	isProcessing,
	disabled = false,
	onDragOver,
	onDragLeave,
	onDrop,
	onFileSelect,
}: UploadAreaProps) {
	const fileInputRef = useRef<HTMLInputElement>(null);

	const baseClass =
		"relative border-2 border-dashed rounded-xl flex flex-col items-center justify-center min-h-[160px] sm:min-h-[200px] p-8 text-center select-none transition-all duration-200";

	const isBlocked = isProcessing || disabled;
	let stateClass = `${baseClass} border-border hover:border-muted-foreground/50 hover:bg-muted/30 cursor-pointer`;
	if (isBlocked) stateClass = `${baseClass} border-border bg-muted/20 cursor-default opacity-60`;
	else if (isDragOver) stateClass = `${baseClass} border-foreground bg-muted/60 scale-[1.01] cursor-pointer`;

	let dropLabel = "Arrastra imágenes aquí";
	if (isProcessing) dropLabel = "Procesando archivos…";
	else if (isDragOver) dropLabel = "Suelta las imágenes aquí";

	return (
		// biome-ignore lint/a11y/useKeyWithClickEvents: drag-and-drop zone needs div; keyboard handled by inner button
		<div
			aria-busy={isProcessing}
			className={stateClass}
			onDragOver={isBlocked ? undefined : onDragOver}
			onDragLeave={isBlocked ? undefined : onDragLeave}
			onDrop={isBlocked ? undefined : onDrop}
			onClick={() => !isBlocked && fileInputRef.current?.click()}
		>
			<div className="mb-3 p-3 rounded-full bg-muted transition-colors">
				{isProcessing ? (
					<Loader2 className="h-6 w-6 text-muted-foreground animate-spin" />
				) : (
					<ImagePlus className="h-6 w-6 text-muted-foreground" />
				)}
			</div>
			<p className="text-sm font-medium text-foreground mb-1">{dropLabel}</p>
			{!isProcessing && (
				<p className="text-xs text-muted-foreground">
					o{" "}
					<span className="underline underline-offset-2">
						selecciona archivos
					</span>{" "}
					· {ALLOWED_EXTENSIONS.join(", ")} · máx. {MAX_FILE_SIZE / 1024 / 1024}{" "}
					MB
				</p>
			)}
			<input
				ref={fileInputRef}
				type="file"
				multiple
				accept={[...ALLOWED_IMAGE_TYPES, ALLOWED_PDF_TYPE].join(",")}
				onChange={onFileSelect}
				className="sr-only"
				aria-label="Seleccionar imágenes"
				disabled={isBlocked}
				tabIndex={isBlocked ? -1 : 0}
			/>
		</div>
	);
}

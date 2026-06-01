import { ImagePlus, Loader2 } from "lucide-react";
import { type ChangeEvent, type DragEvent, useRef } from "react";
import {
	ALLOWED_EXTENSIONS,
	ALLOWED_IMAGE_TYPES,
	ALLOWED_PDF_TYPE,
	MAX_FILE_SIZE,
} from "../../types/image";

interface UploadAreaProps {
	isDragOver: boolean;
	isProcessing: boolean;
	onDragOver: (e: DragEvent<HTMLDivElement>) => void;
	onDragLeave: (e: DragEvent<HTMLDivElement>) => void;
	onDrop: (e: DragEvent<HTMLDivElement>) => void;
	onFileSelect: (e: ChangeEvent<HTMLInputElement>) => void;
}

export function UploadArea({
	isDragOver,
	isProcessing,
	onDragOver,
	onDragLeave,
	onDrop,
	onFileSelect,
}: Readonly<UploadAreaProps>) {
	const fileInputRef = useRef<HTMLInputElement>(null);

	const baseClass =
		"relative border-2 border-dashed rounded-xl flex flex-col items-center justify-center min-h-[160px] sm:min-h-[200px] p-8 text-center select-none transition-all duration-200";

	const stateClass = isProcessing
		? `${baseClass} border-border bg-muted/20 cursor-default`
		: isDragOver
			? `${baseClass} border-foreground bg-muted/60 scale-[1.01] cursor-pointer`
			: `${baseClass} border-border hover:border-muted-foreground/50 hover:bg-muted/30 cursor-pointer`;

	return (
		<div
			role="button"
			tabIndex={isProcessing ? -1 : 0}
			aria-label="Seleccionar imágenes"
			aria-busy={isProcessing}
			className={stateClass}
			onDragOver={isProcessing ? undefined : onDragOver}
			onDragLeave={isProcessing ? undefined : onDragLeave}
			onDrop={isProcessing ? undefined : onDrop}
			onClick={() => !isProcessing && fileInputRef.current?.click()}
			onKeyDown={(e) => {
				if (!isProcessing && (e.key === "Enter" || e.key === " ")) {
					e.preventDefault();
					fileInputRef.current?.click();
				}
			}}
		>
			<div className="mb-3 p-3 rounded-full bg-muted transition-colors">
				{isProcessing ? (
					<Loader2 className="h-6 w-6 text-muted-foreground animate-spin" />
				) : (
					<ImagePlus className="h-6 w-6 text-muted-foreground" />
				)}
			</div>
			<p className="text-sm font-medium text-foreground mb-1">
				{isProcessing
					? "Procesando archivos…"
					: isDragOver
						? "Suelta las imágenes aquí"
						: "Arrastra imágenes aquí"}
			</p>
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
				className="hidden"
				disabled={isProcessing}
			/>
		</div>
	);
}

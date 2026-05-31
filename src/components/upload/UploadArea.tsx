import { ImagePlus } from "lucide-react";
import { type ChangeEvent, type DragEvent, useRef } from "react";
import {
	ALLOWED_EXTENSIONS,
	ALLOWED_IMAGE_TYPES,
	MAX_FILE_SIZE,
} from "../../types/image";

interface UploadAreaProps {
	isDragOver: boolean;
	onDragOver: (e: DragEvent<HTMLDivElement>) => void;
	onDragLeave: (e: DragEvent<HTMLDivElement>) => void;
	onDrop: (e: DragEvent<HTMLDivElement>) => void;
	onFileSelect: (e: ChangeEvent<HTMLInputElement>) => void;
}

export function UploadArea({
	isDragOver,
	onDragOver,
	onDragLeave,
	onDrop,
	onFileSelect,
}: Readonly<UploadAreaProps>) {
	const fileInputRef = useRef<HTMLInputElement>(null);

	return (
		<div
			role="button"
			tabIndex={0}
			aria-label="Seleccionar imágenes"
			className={
				isDragOver
					? "relative border-2 border-dashed rounded-xl flex flex-col items-center justify-center min-h-[160px] sm:min-h-[200px] p-8 text-center cursor-pointer select-none transition-all duration-200 border-foreground bg-muted/60 scale-[1.01]"
					: "relative border-2 border-dashed rounded-xl flex flex-col items-center justify-center min-h-[160px] sm:min-h-[200px] p-8 text-center cursor-pointer select-none transition-all duration-200 border-border hover:border-muted-foreground/50 hover:bg-muted/30"
			}
			onDragOver={onDragOver}
			onDragLeave={onDragLeave}
			onDrop={onDrop}
			onClick={() => fileInputRef.current?.click()}
			onKeyDown={(e) => {
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					fileInputRef.current?.click();
				}
			}}
		>
			<div className="mb-3 p-3 rounded-full bg-muted transition-colors">
				<ImagePlus className="h-6 w-6 text-muted-foreground" />
			</div>
			<p className="text-sm font-medium text-foreground mb-1">
				{isDragOver ? "Suelta las imágenes aquí" : "Arrastra imágenes aquí"}
			</p>
			<p className="text-xs text-muted-foreground">
				o{" "}
				<span className="underline underline-offset-2">
					selecciona archivos
				</span>{" "}
				· {ALLOWED_EXTENSIONS.join(", ")} · máx. {MAX_FILE_SIZE / 1024 / 1024}{" "}
				MB
			</p>
			<input
				ref={fileInputRef}
				type="file"
				multiple
				accept={ALLOWED_IMAGE_TYPES.join(",")}
				onChange={onFileSelect}
				className="hidden"
			/>
		</div>
	);
}

import { Upload } from "lucide-react";
import { type ChangeEvent, type DragEvent, useRef } from "react";

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
			className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
				isDragOver
					? "border-primary bg-primary/5"
					: "border-muted-foreground/25"
			}`}
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
			<Upload className="h-12 w-12 mx-auto mb-4 text-green-600" />
			<p className="text-lg font-medium mb-2">Arrastra las imágenes aquí</p>
			<p className="text-sm text-muted-foreground mb-4">
				o haz clic para seleccionar archivos
			</p>
			<input
				ref={fileInputRef}
				type="file"
				multiple
				accept="image/jpeg,image/png,image/bmp,image/gif"
				onChange={onFileSelect}
				className="hidden"
			/>
		</div>
	);
}

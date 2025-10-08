import { Upload } from "lucide-react";
import { type ChangeEvent, type DragEvent, useRef } from "react";
import { Button } from "@/components/ui/button";

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
}: UploadAreaProps) {
	const fileInputRef = useRef<HTMLInputElement>(null);

	return (
		<div
			className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
				isDragOver
					? "border-primary bg-primary/5"
					: "border-muted-foreground/25"
			}`}
			onDragOver={onDragOver}
			onDragLeave={onDragLeave}
			onDrop={onDrop}
		>
			<Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
			<h3 className="text-lg font-medium mb-2">Arrastra las imágenes aquí</h3>
			<p className="text-sm text-muted-foreground mb-4">
				o haz clic para seleccionar archivos
			</p>
			<Button onClick={() => fileInputRef.current?.click()} variant="outline">
				Seleccionar Archivos
			</Button>
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

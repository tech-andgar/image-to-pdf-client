import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FilenameInputProps {
	filename: string;
	setFilename: (filename: string) => void;
	previewFilename: string;
}

/**
 * FilenameInput component responsible for custom PDF filename input
 * Follows Single Responsibility Principle - handles only filename input UI
 * Uses shadcn/ui design patterns for consistency
 */
export function FilenameInput({
	filename,
	setFilename,
	previewFilename,
}: FilenameInputProps) {
	return (
		<div className="mb-3">
			<label htmlFor="pdf-filename" className="block text-xs font-medium mb-1">
				Nombre del archivo
			</label>
			<div className="relative">
				<input
					id="pdf-filename"
					type="text"
					value={filename}
					onChange={(e) => setFilename(e.target.value)}
					placeholder={previewFilename}
					className="w-full px-3 py-2 pr-10 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
					maxLength={100}
					aria-describedby="pdf-filename-preview"
				/>
				{filename.trim() && (
					<Button
						type="button"
						variant="ghost"
						size="sm"
						onClick={() => setFilename("")}
						className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-muted"
						aria-label="Limpiar nombre del archivo"
					>
						<X className="h-4 w-4" />
					</Button>
				)}
			</div>
			<div id="pdf-filename-preview" className="mt-1 text-xs text-muted-foreground">
				Archivo se guardará como: <code>{previewFilename}</code>
			</div>
		</div>
	);
}

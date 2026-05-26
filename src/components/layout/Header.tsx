import { FileImage } from "lucide-react";

export function Header() {
	return (
		<header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
			<div className="max-w-2xl mx-auto px-4 py-3 sm:py-4 flex items-center justify-center gap-2">
				<FileImage className="h-5 w-5 text-foreground shrink-0" />
				<h1 className="text-base font-semibold text-foreground tracking-tight">
					Imágenes a PDF
				</h1>
			</div>
		</header>
	);
}

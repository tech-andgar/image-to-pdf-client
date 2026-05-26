import { FileImage } from "lucide-react";

export function Header() {
	return (
		<header className="flex-shrink-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="container mx-auto px-4 py-6">
				<div className="text-center">
					<h1 className="text-4xl font-bold text-foreground mb-2 flex items-center justify-center gap-3">
						<FileImage className="h-10 w-10 text-primary" />
						<span>Conversor de Imágenes a PDF</span>
					</h1>
					<p className="text-xl text-muted-foreground">
						Carga tus imágenes y conviértelas en un documento PDF
					</p>
				</div>
			</div>
		</header>
	);
}

import { ImageUploader } from "./components/ImageUploader";

function App() {
	return (
		<div className="min-h-screen bg-background">
			<div className="flex flex-col">
				{/* Header - Fixed at top */}
				<header className="flex-shrink-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
					<div className="container mx-auto px-4 py-6">
						<div className="text-center">
							<h1 className="text-4xl font-bold text-foreground mb-2">
								Conversor de Imágenes a PDF
							</h1>
							<p className="text-xl text-muted-foreground">
								Carga tus imágenes y conviértelas en un documento PDF
							</p>
						</div>
					</div>
				</header>

				{/* Main Content - Centered */}
				<main className="flex-1 flex items-center justify-center p-4">
					<ImageUploader />
				</main>

				{/* Footer - Fixed at bottom */}
				<footer className="flex-shrink-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
					<div className="container mx-auto px-4 py-6">
						<div className="text-center text-sm text-muted-foreground">
							<p>
								Una aplicación web segura que procesa todo en tu navegador sin enviar archivos a servidores externos.
							</p>
						</div>
					</div>
				</footer>
			</div>
		</div>
	);
}

export default App;

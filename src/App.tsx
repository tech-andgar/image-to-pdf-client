import { ImageUploader } from "./components/ImageUploader";

function App() {
	return (
		<div className="min-h-screen bg-background">
			<div className="container mx-auto py-8">
				{/* Header */}
				<header className="text-center mb-8">
					<h1 className="text-4xl font-bold text-foreground mb-2">
						Conversor de Imágenes a PDF
					</h1>
					<p className="text-xl text-muted-foreground">
						Carga tus imágenes y conviértelas en un documento PDF
					</p>
				</header>

				{/* Main Content */}
				<main>
					<ImageUploader />
				</main>

				{/* Footer */}
				<footer className="text-center mt-16 text-sm text-muted-foreground">
					<p>
						Una aplicación web segura que procesa todo en tu navegador sin
						enviar archivos a servidores externos.
					</p>
				</footer>
			</div>
		</div>
	);
}

export default App;

import { Heart, Code, ExternalLink } from "lucide-react";

export function Footer() {
	return (
		<footer className="flex-shrink-0 border-t bg-gradient-to-br from-background via-muted/20 to-background backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
			<div className="container mx-auto px-4 py-8">
				<div className="text-center space-y-4">
					{/* Main security message with icon */}
					<div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
						<div className="flex items-center gap-2">
							<Code className="h-4 w-4 text-primary/60" />
							<span>
								Una aplicación web segura que procesa todo en tu navegador sin
								enviar archivos a servidores externos.
							</span>
						</div>
					</div>

					{/* Separator */}
					<div className="flex items-center justify-center gap-4">
						<div className="h-px bg-border flex-1 max-w-xs" />
						<Heart className="h-4 w-4 text-red-500 animate-pulse" />
						<div className="h-px bg-border flex-1 max-w-xs" />
					</div>

					{/* Author section with enhanced styling */}
					<div className="space-y-2">
						<p className="text-xs text-muted-foreground/80">
							Desarrollado con pasión y código moderno
						</p>
						<div className="flex items-center justify-center gap-2">
							<span className="text-sm text-muted-foreground">por</span>
							<a
								href="https://tech-andgar.me/"
								target="_blank"
								rel="noopener noreferrer"
								className="group inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 hover:bg-primary/10 text-primary font-medium transition-all duration-300 hover:scale-105"
							>
								<span>Andrés García</span>
								<ExternalLink className="h-3 w-3 opacity-60 group-hover:opacity-100 transition-opacity" />
							</a>
						</div>
					</div>
				</div>
			</div>
		</footer>
	);
}

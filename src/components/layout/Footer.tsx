import { useState } from "react";
import { ExternalLink, ShieldCheck, Cookie } from "lucide-react";
import { PrivacyModal } from "../privacy/PrivacyModal";

export function Footer() {
	const [privacyOpen, setPrivacyOpen] = useState(false);

	return (
		<>
			<footer className="border-t bg-background">
				<div className="max-w-2xl mx-auto px-4 py-3 flex flex-col gap-2 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
					<div className="flex items-start gap-1.5">
						<ShieldCheck className="h-3.5 w-3.5 shrink-0 mt-0.5" />
						<span>
							<span className="hidden sm:inline">
								Una aplicación web segura que procesa todo en tu navegador sin
								enviar archivos a servidores externos.
							</span>
							<span className="sm:hidden">
								Todo se procesa en tu navegador. Sin servidores externos.
							</span>
						</span>
					</div>
					<div className="flex items-center gap-4 pl-5 sm:pl-0 shrink-0">
						<button
							type="button"
							onClick={() => setPrivacyOpen(true)}
							className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
						>
							<Cookie className="h-3 w-3" />
							Privacidad
						</button>
						<span className="opacity-40">v{__APP_VERSION__}</span>
						<a
							href="https://tech-andgar.me/"
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex items-center gap-1 hover:text-foreground transition-colors whitespace-nowrap"
						>
							Andrés García
							<ExternalLink className="h-3 w-3" />
						</a>
					</div>
				</div>
			</footer>
			<PrivacyModal open={privacyOpen} onClose={() => setPrivacyOpen(false)} />
		</>
	);
}

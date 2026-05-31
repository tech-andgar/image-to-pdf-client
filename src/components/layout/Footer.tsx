import { useState } from "react";
import { ExternalLink, ShieldCheck, Cookie } from "lucide-react";
import { PrivacyModal } from "../privacy/PrivacyModal";

export function Footer() {
	const [privacyOpen, setPrivacyOpen] = useState(false);

	return (
		<>
			<footer className="border-t bg-background">
				<div className="max-w-2xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
					<div className="flex items-center gap-1.5">
						<ShieldCheck className="h-3.5 w-3.5 shrink-0" />
						<span>
							Una aplicación web segura que procesa todo en tu navegador sin
							enviar archivos a servidores externos.
						</span>
					</div>
					<div className="flex items-center gap-3">
						<button
							type="button"
							onClick={() => setPrivacyOpen(true)}
							className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
						>
							<Cookie className="h-3 w-3" />
							Privacidad
						</button>
						<a
							href="https://tech-andgar.me/"
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
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

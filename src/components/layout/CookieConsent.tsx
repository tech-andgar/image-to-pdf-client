import { useState, useEffect } from "react";
import { Shield } from "lucide-react";
import { consentService } from "../../services/consent";

export function CookieConsent() {
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		if (!consentService.hasDecided) {
			setVisible(true);
		} else {
			consentService.applyToGtag();
		}
	}, []);

	if (!visible) return null;

	const handleAcceptAll = () => {
		consentService.acceptAll();
		setVisible(false);
	};

	const handleReject = () => {
		consentService.rejectOptional();
		setVisible(false);
	};

	return (
		<div
			className="border-t bg-muted/50 px-4 py-3"
			role="dialog"
			aria-label="Consentimiento de cookies"
		>
			<div className="mx-auto flex max-w-2xl items-center gap-3">
				<Shield className="h-5 w-5 shrink-0 text-muted-foreground" />
				<p className="flex-1 text-xs text-muted-foreground">
					Recopilamos datos anónimos de uso para mejorar la app. Con tu permiso,
					también usamos cookies para análisis detallado. Tus archivos nunca
					salen del dispositivo.
				</p>
				<div className="flex shrink-0 gap-2">
					<button
						type="button"
						onClick={handleReject}
						className="rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
					>
						Solo anónimos
					</button>
					<button
						type="button"
						onClick={handleAcceptAll}
						className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
					>
						Aceptar cookies
					</button>
				</div>
			</div>
		</div>
	);
}

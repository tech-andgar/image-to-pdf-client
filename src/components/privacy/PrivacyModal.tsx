import { useState } from "react";
import { Bug, Shield, BarChart3, Lock } from "lucide-react";
import { consentService } from "../../services/privacy/consent";
import { logger } from "../../services/logger";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "../ui/dialog";

interface PrivacyModalProps {
	open: boolean;
	onClose: () => void;
}

export function PrivacyModal({ open, onClose }: Readonly<PrivacyModalProps>) {
	const [analytics, setAnalytics] = useState(consentService.analytics);

	const handleSave = () => {
		consentService.accept({ analytics });
		onClose();
	};

	const handleReportBug = () => {
		const data = logger.exportLogs();
		const blob = new Blob([data], { type: "application/json" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `logs-${new Date().toISOString().slice(0, 10)}.json`;
		a.click();
		URL.revokeObjectURL(url);
		window.open(
			"mailto:dev@tech-andgar.me?subject=Bug%20Report%20-%20Image%20to%20PDF&body=Adjunta%20el%20archivo%20de%20logs%20descargado%20y%20describe%20el%20problema.",
		);
	};

	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent className="mx-4 w-full max-w-md p-6">
				<DialogHeader>
					<DialogTitle>Privacidad</DialogTitle>
					<DialogDescription className="sr-only">
						Configuración de privacidad y cookies
					</DialogDescription>
				</DialogHeader>

				<div className="mt-1 space-y-4">
					<div className="flex gap-3">
						<Lock className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
						<div>
							<p className="text-sm font-medium">Tus archivos son privados</p>
							<p className="text-xs text-muted-foreground">
								Todo se procesa en tu navegador. Nada se envía a servidores.
							</p>
						</div>
					</div>

					<div className="flex gap-3">
						<BarChart3 className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
						<div className="flex-1">
							<div className="flex items-center justify-between">
								<p className="text-sm font-medium">Cookies de analytics</p>
								<button
									type="button"
									role="switch"
									aria-checked={analytics}
									onClick={() => setAnalytics(!analytics)}
									className={`relative inline-flex h-6 w-10 shrink-0 cursor-pointer rounded-full transition-colors ${analytics ? "bg-green-500" : "bg-muted-foreground/30"}`}
								>
									<span
										className={`inline-block h-5 w-5 translate-y-0.5 transform rounded-full bg-background shadow transition-transform ${analytics ? "translate-x-[18px]" : "translate-x-0.5"}`}
									/>
								</button>
							</div>
							<p className="text-xs text-muted-foreground">
								Siempre recopilamos datos anónimos de uso (sin cookies, sin
								identificarte). Con este permiso, también usamos cookies para
								análisis detallado por sesión. Sin publicidad. IP anonimizada.
							</p>
						</div>
					</div>

					<div className="flex gap-3">
						<Shield className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
						<div>
							<p className="text-sm font-medium">Datos esenciales</p>
							<p className="text-xs text-muted-foreground">
								Tu preferencia de privacidad y logs locales de errores (solo en
								tu dispositivo, nunca se envían automáticamente).
							</p>
						</div>
					</div>
				</div>

				<div className="mt-6 flex items-center justify-between border-t pt-4">
					<button
						type="button"
						onClick={handleReportBug}
						className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
					>
						<Bug className="h-3.5 w-3.5" />
						Reportar problema
					</button>
					<div className="flex gap-2">
						<button
							type="button"
							onClick={onClose}
							className="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
						>
							Cancelar
						</button>
						<button
							type="button"
							onClick={handleSave}
							className="rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
						>
							Guardar
						</button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}

import { Zap } from "lucide-react";
import { useLicenseContext } from "@/context/LicenseContext";

export function CreditBadge() {
	const license = useLicenseContext();
	const { type, credits } = license.info;

	if (type === "unlimited") {
		return (
			<button
				type="button"
				onClick={license.openPaywall}
				className="inline-flex items-center gap-1 text-xs text-amber-500 font-medium"
				title="Acceso ilimitado"
			>
				<Zap className="h-3.5 w-3.5" />∞
			</button>
		);
	}

	const low = (credits ?? 0) <= 1;

	return (
		<button
			type="button"
			onClick={license.openPaywall}
			className={`inline-flex items-center gap-1 text-xs font-medium transition-colors ${
				low ? "text-destructive" : "text-muted-foreground hover:text-foreground"
			}`}
			title="Créditos de exportación disponibles"
		>
			<Zap className="h-3.5 w-3.5" />
			{credits ?? 0} export{credits !== 1 ? "s" : ""}
		</button>
	);
}

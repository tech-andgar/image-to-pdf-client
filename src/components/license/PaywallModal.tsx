import { useState } from "react";
import { Zap, Key, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "@/components/ui/dialog";
import type { UseLicense } from "@/hooks/useLicense";

const PACKS = [
	{ key: "PACK-50", label: "50 créditos", price: "$3", desc: "50 exports" },
	{ key: "PACK-200", label: "200 créditos", price: "$8", desc: "200 exports" },
	{
		key: "PREMIUM-UNLIMITED",
		label: "Ilimitado",
		price: "$15/mes",
		desc: "Sin límites",
	},
];

export function PaywallModal({ license }: { readonly license: UseLicense }) {
	const [keyInput, setKeyInput] = useState("");
	const [keyMsg, setKeyMsg] = useState<{
		success: boolean;
		text: string;
	} | null>(null);
	const [showKeyInput, setShowKeyInput] = useState(false);

	function handleActivate() {
		if (!keyInput.trim()) return;
		const result = license.activateKey(keyInput);
		setKeyMsg({ success: result.success, text: result.message });
		if (result.success) {
			setKeyInput("");
			setTimeout(() => license.closePaywall(), 1200);
		}
	}

	return (
		<Dialog open={license.paywallOpen} onOpenChange={license.closePaywall}>
			<DialogContent className="max-w-sm w-[calc(100vw-2rem)] p-0 overflow-hidden">
				<DialogHeader className="px-5 pt-5 pb-0">
					<div className="flex items-center justify-between">
						<DialogTitle className="flex items-center gap-2 text-base">
							<Zap className="h-4 w-4 text-amber-500" />
							Sin créditos disponibles
						</DialogTitle>
						<button
							type="button"
							onClick={license.closePaywall}
							className="opacity-50 hover:opacity-100"
						>
							<X className="h-4 w-4" />
						</button>
					</div>
					<DialogDescription className="text-sm text-muted-foreground mt-1">
						Usaste tus {5} exports gratuitos este mes. Obtén más créditos.
					</DialogDescription>
				</DialogHeader>

				<div className="px-5 py-4 space-y-3">
					<div className="space-y-2">
						{PACKS.map((pack) => (
							<div
								key={pack.key}
								className="flex items-center justify-between p-3 rounded-lg border bg-muted/30 text-sm"
							>
								<div>
									<p className="font-medium">{pack.label}</p>
									<p className="text-xs text-muted-foreground">{pack.desc}</p>
								</div>
								<span className="font-semibold text-foreground">
									{pack.price}
								</span>
							</div>
						))}
					</div>

					<Button className="w-full" size="sm" disabled>
						Comprar créditos
						<span className="ml-2 text-xs opacity-60">(próximamente)</span>
					</Button>

					<div className="relative">
						<div className="absolute inset-0 flex items-center">
							<span className="w-full border-t" />
						</div>
						<div className="relative flex justify-center text-xs uppercase">
							<span className="bg-background px-2 text-muted-foreground">
								o
							</span>
						</div>
					</div>

					{!showKeyInput ? (
						<button
							type="button"
							onClick={() => setShowKeyInput(true)}
							className="w-full flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
						>
							<Key className="h-3.5 w-3.5" />
							Tengo una clave de activación
						</button>
					) : (
						<div className="space-y-2">
							<div className="flex gap-2">
								<input
									type="text"
									value={keyInput}
									onChange={(e) => setKeyInput(e.target.value.toUpperCase())}
									onKeyDown={(e) => e.key === "Enter" && handleActivate()}
									placeholder="CLAVE-AQUÍ"
									className="flex-1 px-3 py-1.5 text-sm rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-ring font-mono"
								/>
								<Button
									size="sm"
									onClick={handleActivate}
									disabled={!keyInput.trim()}
								>
									Activar
								</Button>
							</div>
							{keyMsg && (
								<p
									className={`text-xs ${keyMsg.success ? "text-emerald-600" : "text-destructive"}`}
								>
									{keyMsg.text}
								</p>
							)}
						</div>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}

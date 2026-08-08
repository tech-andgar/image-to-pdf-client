export const FREE_MONTHLY_CREDITS = 5;
export const FREE_IMAGE_LIMIT = 10;

export interface PackDefinition {
	key: string;
	type: "unlimited" | "pack";
	credits?: number;
	label: string;
	price: string;
	desc: string;
}

export const PACKS: PackDefinition[] = [
	{
		key: "PACK-50",
		type: "pack",
		credits: 50,
		label: "50 créditos",
		price: "$3",
		desc: "50 exports",
	},
	{
		key: "PACK-200",
		type: "pack",
		credits: 200,
		label: "200 créditos",
		price: "$8",
		desc: "200 exports",
	},
	{
		key: "PREMIUM-UNLIMITED",
		type: "unlimited",
		label: "Ilimitado",
		price: "$15/mes",
		desc: "Sin límites",
	},
];

export const ACTIVATION_KEYS: Record<
	string,
	{ type: "unlimited" | "pack"; credits?: number }
> = Object.fromEntries(
	PACKS.map((p) => [p.key, { type: p.type, credits: p.credits }]),
);

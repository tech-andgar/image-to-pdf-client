export type PasswordPromptFn = (
	filename: string,
	wrongAttempt: boolean,
) => Promise<string>;

export function isPasswordError(err: unknown, hadPassword: boolean): boolean {
	if (err !== null && typeof err === "object") {
		const name = (err as Record<string, unknown>).name;
		if (name === "PasswordException") return true;
		if (name === "DataCloneError" && hadPassword) return true;
	}
	return false;
}

export async function promptPassword(
	filename: string,
	wrongAttempt: boolean,
): Promise<string> {
	const msg = wrongAttempt
		? `Contraseña incorrecta para "${filename}". Intenta de nuevo:`
		: `El PDF "${filename}" está protegido. Ingresa la contraseña:`;
	const input = globalThis.prompt(msg);
	if (input === null)
		throw new Error(`PDF "${filename}" cancelado — contraseña requerida.`);
	return input;
}

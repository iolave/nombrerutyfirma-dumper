export function isValidRut(rut: string): boolean {
	let formatFlag = false;

	for (const format of formats) if (format.test(rut)) formatFlag = true;

	if (!formatFlag) return false;

	if (!(rut.includes('-') || rut.includes('‐'))) {
		const rutWoDv = Number(rut.slice(undefined, -1));
		const dv = rut.slice(-1).toUpperCase();

		return String(calculateDv(rutWoDv)) === dv;
	}

	const rutWoDv = Number(
		rut.slice(undefined, -2)
			.replace(/\./g, '')
	);
	const dv = rut.slice(-1).toUpperCase();

	return String(calculateDv(rutWoDv)) === dv;
}

export function formatRut(rut: string): string | undefined {
	const upperCaseRut = rut.toUpperCase();

	if (!isValidRut(upperCaseRut)) return undefined;

	if (!(upperCaseRut.includes('-') || upperCaseRut.includes('‐'))) {
		const rutWoDv = upperCaseRut.charAt(0) === '0' ?
			upperCaseRut.slice(1, -1) : upperCaseRut.slice(undefined, -1);

		const dv = upperCaseRut.slice(-1);

		return addThousandsSeperator(rutWoDv)
			.concat('-')
			.concat(dv);
	}

	if (!upperCaseRut.includes('.')) {
		const rutWoDv = upperCaseRut.charAt(0) === '0' ?
			upperCaseRut.slice(1, -2) : upperCaseRut.slice(undefined, -2);
		const dv = upperCaseRut.slice(-1);

		return addThousandsSeperator(rutWoDv)
			.concat('-')
			.concat(dv.toUpperCase());
	}

	return upperCaseRut.charAt(0) === '0' ? upperCaseRut.slice(1) : upperCaseRut;
}

export function calculateDv(rut: number) {
	let T = rut;
	let M = 0, S = 1;
	for (; T; T = Math.floor(T / 10)) {
		S = (S + T % 10 * (9 - M++ % 6)) % 11;
	}
	return S ? `${S - 1}` : "K";
}

function addThousandsSeperator(str: string) {
	return str.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
}

const formats = [
	/^(([0-9]){1,3})?(((\.([0-9]){3}){0,2}))?[-|‐]{1}[0-9kK]{1}$/,
	/^((([0-9]){1,3}){1,3})([0-9kK]{1})$/,
	/^((([0-9]){1,3}){1,3})([-|‐])([0-9kK]{1})$/
] as const;

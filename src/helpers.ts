import { AllLocales } from "types";

export function pathToLocale(
	pathLocale: string,
	mapping: Record<AllLocales[number], string>
): AllLocales[number] {
	return mapping[pathLocale];
}

export function localeToPath(
	locale: AllLocales[number],
	mapping: Record<AllLocales[number], string>
): string | undefined {
	const match = Object.entries(mapping).find((item) => item[1] === locale);

	if (match) {
		return match[0];
	}
}

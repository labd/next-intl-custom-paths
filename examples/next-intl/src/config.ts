import { Pathnames } from "next-intl/navigation";

export const locales = ["en-US", "de-DE", "nl-NL", "nl-BE"] as const;
export const defaultLocale = "en-US";

export const pathnames = {
	"/": "/",
	"/pathnames": {
		"en-US": "/pathnames",
		"de-DE": "/pfadnamen",
		"nl-NL": "/padnamen",
		"nl-BE": "/padnamen-belgie",
	},
	"/test-page/[slug]": {
		"de-DE": "/test-seite/[slug]",
		"nl-NL": "/test-pagina/[slug]",
		"en-US": "/english-test-page/[slug]",
		"nl-BE": "/test-pagina-belgie/[slug]",
	},
} satisfies Pathnames<typeof locales>;

// Use the default: `always`
export const localePrefix = "as-needed";

export const localePrefixForRoot = "as-needed";

export type AppPathnames = keyof typeof pathnames;

export const pathToLocaleMapping = {
	en: "en-US",
	nl: "nl-NL",
	de: "de-DE",
	be: "nl-BE",
} as const;

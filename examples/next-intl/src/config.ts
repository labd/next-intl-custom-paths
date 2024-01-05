import { Pathnames } from "next-intl/navigation";

export const locales = ["en-US", "de-DE", "nl-NL"] as const;
export const defaultLocale = "en-US";

export const pathnames = {
	"/": "/",
	"/pathnames": {
		"en-US": "/pathnames",
		"de-DE": "/pfadnamen",
		"nl-NL": "/padnamen",
	},
} satisfies Pathnames<typeof locales>;

// Use the default: `always`
export const localePrefix = "as-needed";

export type AppPathnames = keyof typeof pathnames;

export const pathToLocaleMapping = {
	en: "en-US",
	nl: "nl-NL",
	de: "de-DE",
} as const;

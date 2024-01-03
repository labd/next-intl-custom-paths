import { Pathnames } from "next-intl/navigation";

export const locales = ["en-US", "de-DE", "nl-NL"] as const;

export const pathnames = {
	"/": "/",
	"/pathnames": {
		"en-US": "/pathnames",
		"de-DE": "/pfadnamen",
		"nl-NL": "/padnamen",
	},
} satisfies Pathnames<typeof locales>;

// Use the default: `always`
export const localePrefix = undefined;

export type AppPathnames = keyof typeof pathnames;

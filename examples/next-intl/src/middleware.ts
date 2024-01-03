import {
	LocaleManager,
	createNextIntlCustomPathMiddleware,
} from "@labdigital/next-intl-custom-paths";
import { NextRequest } from "next/server";
import { locales } from "./config";

export const middleware = (request: NextRequest) => {
	const manager = new LocaleManager({
		defaultLocale: "en-US",
		locales: [...locales],
		languageTags: {
			en: "en-US",
			nl: "nl-NL",
			de: "de-DE",
		},
		localizedPaths: {},
	});

	const customMiddleware = createNextIntlCustomPathMiddleware({
		localeManager: manager,
		useLocaleForRoot: true,
	});

	return customMiddleware(request);
};

export const config = {
	matcher: [
		// Enable a redirect to a matching locale at the root
		"/",

		// Set a cookie to remember the previous locale for
		// all requests that have a locale prefix
		"/(de|en)/:path*",

		// Enable redirects that add missing locales
		// (e.g. `/pathnames` -> `/en/pathnames`)
		"/((?!_next|_vercel|.*\\..*).*)",
	],
};

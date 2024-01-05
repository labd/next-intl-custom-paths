import { createNewIntlCustomPathMiddleware } from "@labdigital/next-intl-custom-paths";
import { NextRequest } from "next/server";
import {
	localePrefix,
	locales,
	pathToLocaleMapping,
	pathnames,
} from "./config";

// export const middleware = (request: NextRequest) => {
// 	const manager = new LocaleManager({
// 		defaultLocale: "en-US",
// 		locales: [...locales],
// 		languageTags: {
// 			en: "en-US",
// 			nl: "nl-NL",
// 			de: "de-DE",
// 		},
// 		localizedPaths: {
// 			"/pathnames": {
// 				"en-US": "/pathnames",
// 				"nl-NL": "/padnamen",
// 				"de-DE": "/pfadnamen",
// 			},
// 		},
// 	});

// 	const customMiddleware = createNextIntlCustomPathMiddleware({
// 		localeManager: manager,
// 		useLocaleForRoot: true,
// 		nextIntlMiddlewareOptions: {
// 			localePrefix: "always",
// 		},
// 	});

// 	return customMiddleware(request);
// };

export const middleware = (request: NextRequest) => {
	const intlMiddleware = createNewIntlCustomPathMiddleware({
		defaultLocale: "en-US",
		locales: [...locales],
		pathToLocaleMapping,
		nextIntlMiddlewareOptions: {
			localePrefix,
			localeDetection: false,
			pathnames,
		},
	});

	return intlMiddleware(request);
};

export const config = {
	matcher: [
		// Enable a redirect to a matching locale at the root
		"/",

		// Set a cookie to remember the previous locale for
		// all requests that have a locale prefix
		"/(de|en|nl)/:path*",

		// Enable redirects that add missing locales
		// (e.g. `/pathnames` -> `/en/pathnames`)
		"/((?!_next|_vercel|.*\\..*).*)",
	],
};

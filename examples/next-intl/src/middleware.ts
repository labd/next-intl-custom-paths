import { createNextIntlCustomPathMiddleware } from "@labdigital/next-intl-custom-paths";
import { NextRequest } from "next/server";
import {
	localePrefix,
	locales,
	pathToLocaleMapping,
	pathnames,
} from "./config";

export const middleware = (request: NextRequest) => {
	const intlMiddleware = createNextIntlCustomPathMiddleware({
		defaultLocale: "en-US",
		locales: [...locales],
		pathToLocaleMapping,
		nextIntlMiddlewareOptions: {
			localePrefix,
			// localeDetection: true,
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

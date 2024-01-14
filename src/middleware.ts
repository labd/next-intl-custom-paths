import { localeToPath, pathToLocale } from "helpers";
import createNextIntlMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { AllLocales, NextIntlMiddlewareOptions } from "types";

type MiddlewareOptions<Locales extends AllLocales> = {
	locales: Locales;
	defaultLocale: Locales[number];
	pathToLocaleMapping: Record<string, Locales[number]>;
	nextIntlMiddlewareOptions: NextIntlMiddlewareOptions;
};

export function createNextIntlCustomPathMiddleware<Locales extends AllLocales>({
	locales,
	defaultLocale,
	pathToLocaleMapping,
	nextIntlMiddlewareOptions,
}: MiddlewareOptions<Locales>) {
	return (request: NextRequest) => {
		if (
			new Set(Object.values(pathToLocaleMapping)).size !==
			Object.values(pathToLocaleMapping).length
		) {
			// Having a path map to multiple locales would lead to weird issues, block it here
			throw new Error("Duplicate locale path mapping");
		}

		const intlMiddleware = createNextIntlMiddleware({
			locales,
			defaultLocale,
			...nextIntlMiddlewareOptions,
		});

		// Redirect to the default locale path if the root is requested and the localePrefix is set to always
		if (
			request.nextUrl.pathname === "/" &&
			nextIntlMiddlewareOptions.localePrefix === "always"
		) {
			request.nextUrl.pathname = `/${localeToPath(
				defaultLocale,
				pathToLocaleMapping
			)}`;
			return NextResponse.redirect(request.nextUrl, 308);
		}

		return handlePathLocale(request, intlMiddleware, pathToLocaleMapping);
	};
}

function handlePathLocale(
	request: NextRequest,
	intlMiddleware: (request: NextRequest) => NextResponse<unknown>,
	pathToLocaleMapping: Record<string, AllLocales[number]>
) {
	const pathLocale = request.nextUrl.pathname.split("/")[1];
	let finalRequest: NextRequest = request;

	// Check whether the locale used in the path is the complete unmapped locale
	// If so we should redirect to the path mapped to that locale as to not trigger duplicate content
	if (localeToPath(pathLocale, pathToLocaleMapping)) {
		request.nextUrl.pathname.replace(
			new RegExp(`^/${pathLocale}`),
			`/${localeToPath(pathLocale, pathToLocaleMapping)}`
		);

		return NextResponse.redirect(request.nextUrl, 308);
	}
	const locale = pathToLocale(pathLocale, pathToLocaleMapping);

	if (pathLocale && locale) {
		request.nextUrl.pathname = request.nextUrl.pathname.replace(
			new RegExp(`^/${pathLocale}`),
			`/${locale}`
		);
		finalRequest = new NextRequest(request.nextUrl, request as Request);
	}

	const response = intlMiddleware(finalRequest);

	// Replace full locales with path locales in `Link` header
	const linkHeader = response.headers.get("link");
	const localePattern = /\/([a-zA-Z-]+)(\/[^;]*)?(?=[>;])/g;

	function replaceLocales(match: string, locale: string, path: string) {
		const mappedLocale =
			Object.keys(pathToLocaleMapping).find(
				(key) => pathToLocaleMapping[key] === locale
			) || locale;
		return `/${mappedLocale}${path || ""}`;
	}
	const modifiedUrlString = linkHeader?.replace(localePattern, replaceLocales);

	if (modifiedUrlString) {
		response.headers.set("link", modifiedUrlString);
	}

	return response;
}

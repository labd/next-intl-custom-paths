import { localeToPath, pathToLocale } from "./helpers";
import createNextIntlMiddleware from "next-intl/middleware";
import { NextURL } from "next/dist/server/web/next-url";
import { NextRequest, NextResponse } from "next/server";
import { AllLocales, NextIntlMiddlewareOptions } from "./types";

type MiddlewareOptions<Locales extends AllLocales> = {
	locales: Locales;
	defaultLocale: Locales[number];
	localePrefixForRoot?: "always" | "as-needed";
	pathToLocaleMapping: Record<string, Locales[number]>;
	nextIntlMiddlewareOptions: NextIntlMiddlewareOptions;
};

export function createNextIntlCustomPathMiddleware<Locales extends AllLocales>({
	locales,
	defaultLocale,
	localePrefixForRoot,
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

		const info = processRequest(request, {
			defaultLocale,
			localePrefixForRoot,
			pathToLocaleMapping,
		});

		if (info.statusCode && info.targetURL) {
			return NextResponse.redirect(info.targetURL, info.statusCode);
		}

		if (info.request) {
			const response = intlMiddleware(info.request);
			return postprocessResponse(response, pathToLocaleMapping);
		}

		throw new Error("No request or redirect info returned");
	};
}

type processRequestResult = {
	statusCode?: number;
	targetURL?: NextURL;
	request?: NextRequest;
};

type processRequestArgs<Locales extends AllLocales> = {
	defaultLocale: Locales[number];
	localePrefixForRoot?: "always" | "as-needed";
	pathToLocaleMapping: Record<string, Locales[number]>;
};

export const processRequest = <Locales extends AllLocales>(
	request: NextRequest,
	{
		defaultLocale,
		localePrefixForRoot,
		pathToLocaleMapping,
	}: processRequestArgs<Locales>
): processRequestResult => {
	const defaultLocalePath = localeToPath(defaultLocale, pathToLocaleMapping);

	// If the root is requested for the default locale path and the localePrefix
	// is set to as-needed, redirect to / instead
	const defaultLocalePathRegex = new RegExp(`^/${defaultLocalePath}/?$`, "i");
	if (
		localePrefixForRoot === "as-needed" &&
		defaultLocalePathRegex.test(request.nextUrl.pathname)
	) {
		request.nextUrl.pathname = "/";
		return {
			statusCode: 308,
			targetURL: request.nextUrl,
		};
	}

	// Redirect to the default locale path if the root is requested and the
	// localePrefix is set to always
	if (request.nextUrl.pathname === "/") {
		request.nextUrl.pathname = `/${defaultLocalePath}`;
		if (localePrefixForRoot === "always") {
			return {
				statusCode: 308,
				targetURL: request.nextUrl,
			};
		}
	}

	const pathLocale = request.nextUrl.pathname.split("/")[1];

	// Check whether the locale used in the path is the complete unmapped locale
	// If so we should redirect to the path mapped to that locale as to not trigger duplicate content
	if (localeToPath(pathLocale, pathToLocaleMapping)) {
		const newPathLocale = localeToPath(pathLocale, pathToLocaleMapping);

		request.nextUrl.pathname = request.nextUrl.pathname.replace(
			new RegExp(`^/${pathLocale}`, "i"),
			`/${newPathLocale}`
		);

		if (
			localePrefixForRoot === "as-needed" &&
			defaultLocalePathRegex.test(request.nextUrl.pathname)
		) {
			request.nextUrl.pathname = "/";
		}

		// Remove trailing slash. NextJS will by default also remove it so better
		// to redirect directly to the correct one
		if(request.nextUrl.pathname.endsWith("/")) {
			request.nextUrl.pathname = request.nextUrl.pathname.slice(0, -1);
		}

		return {
			statusCode: 308,
			targetURL: request.nextUrl,
		};
	}
	const locale = pathToLocale(pathLocale, pathToLocaleMapping);

	if (pathLocale && locale) {
		request.nextUrl.pathname = request.nextUrl.pathname.replace(
			new RegExp(`^/${pathLocale}`, "i"),
			`/${locale}`
		);
		const finalRequest = new NextRequest(request.nextUrl, request as Request);
		return {
			request: finalRequest,
		};
	}

	return { request };
};

const postprocessResponse = (
	response: NextResponse,
	pathToLocaleMapping: Record<string, AllLocales[number]>
) => {
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
};
